'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useApi } from '@/lib/useApi';
import { canWriteUsers } from '@/lib/permissions';
import CheckBox from '@/components/buttons/CheckBox';
import SearchBox from '@/components/input/SearchBox';
import DropdownMenu from '@/components/input/DropdownMenu';
import SortableHeader from '@/components/SortableHeader';
import EditIcon from '@/components/icons/EditIcon';
import RedCancelIcon from '@/components/icons/RedCancelIcon';
import { useSortableData } from '@/lib/useSortableData';

import DeleteUserModal from '../../gebruikers/components/modals/DeleteUserModal';

function formatNlDate(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export default function ActiveUsersClient() {
  const router = useRouter();
  const {
    getCompanyDashboardActiveUsers,
    getUsers,
    deleteUsers,
    getUser,
  } = useApi();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canWrite, setCanWrite] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('Bulkacties');
  const [roleFilter, setRoleFilter] = useState('Alle rollen');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTargets, setDeleteTargets] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, me] = await Promise.all([
        getCompanyDashboardActiveUsers(),
        getUser(),
      ]);
      setCanWrite(canWriteUsers(me));
      setRows(Array.isArray(data?.users) ? data.users : []);
    } catch (e) {
      console.error(e);
      toast.error('Kon actieve gebruikers niet laden.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [getCompanyDashboardActiveUsers, getUser]);

  useEffect(() => {
    load();
  }, [load]);

  const tableRows = useMemo(() => {
    let r = rows;
    if (roleFilter === 'Beheerder') {
      r = r.filter((x) => x.kind === 'company_admin');
    } else if (roleFilter === 'Bedrijfsgebruikers') {
      r = r.filter((x) => x.kind === 'company_user');
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      r = r.filter(
        (x) =>
          (x.name || '').toLowerCase().includes(q) ||
          (x.email || '').toLowerCase().includes(q) ||
          (x.role_label || '').toLowerCase().includes(q)
      );
    }
    return r;
  }, [rows, roleFilter, searchQuery]);

  const { items: sorted, requestSort, sortConfig } = useSortableData(tableRows);

  const allSelected =
    sorted.length > 0 && sorted.every((u) => selected.has(u.id));
  const someSelected = sorted.some((u) => selected.has(u.id)) && !allSelected;

  const toggleAll = (on) => {
    if (on) {
      setSelected(new Set(sorted.map((u) => u.id)));
    } else {
      setSelected(new Set());
    }
  };

  const toggleOne = (id, on) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const bulkOptions = ['Bulkacties', 'Verwijder geselecteerde gebruikers'];
  const roleOptions = ['Alle rollen', 'Beheerder', 'Bedrijfsgebruikers'];

  const handleBulk = (action) => {
    setBulkAction(action);
    if (action !== 'Verwijder geselecteerde gebruikers') return;
    if (selected.size === 0) {
      toast.warn('Selecteer eerst gebruikers.');
      setBulkAction('Bulkacties');
      return;
    }
    const targets = sorted.filter((u) => selected.has(u.id));
    setDeleteTargets(targets);
    setDeleteOpen(true);
    setBulkAction('Bulkacties');
  };

  const mapToDeleteUser = (u) => ({
    id: u.id,
    Naam: u.name || '—',
    Email: u.email || '—',
    Rol: u.role_label ? [u.role_label] : [],
  });

  const confirmDelete = async () => {
    try {
      const ids = deleteTargets.map((u) => u.id);
      await deleteUsers(ids);
      toast.success('Gebruiker(s) verwijderd.');
      setDeleteOpen(false);
      setDeleteTargets([]);
      setSelected(new Set());
      await load();
    } catch (e) {
      console.error(e);
      toast.error('Verwijderen mislukt.');
    }
  };

  const openDeleteOne = (u) => {
    setDeleteTargets([u]);
    setDeleteOpen(true);
  };

  const goEdit = async (u) => {
    try {
      const res = await getUsers();
      const members = res?.members || [];
      const found = members.find((m) => m.id === u.id);
      if (found) {
        router.push(`/gebruikers?edit=${encodeURIComponent(u.id)}`);
        return;
      }
      toast.warn('Gebruiker niet gevonden in de gebruikerslijst.');
    } catch (e) {
      router.push(`/gebruikers?edit=${encodeURIComponent(u.id)}`);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-fit min-h-full flex flex-col py-[81px] overflow-y-auto scrollbar-hide">
        <div className="w-full px-[102px] py-[46px] flex justify-center items-center min-h-[280px]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-b-[#23BD92] border-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-fit min-h-full flex flex-col py-[81px] overflow-y-auto scrollbar-hide">
      <ToastContainer position="top-right" />
      <div className="w-full px-[102px] py-[46px]">

      {/* Same back control as DocumentenChat → Mijn documenten */}
      <div className="flex flex-col md:flex-row mb-[50px] gap-2 md:items-center">
        <button
          type="button"
          onClick={() => router.push('/company-dashboard')}
          className="w-fit cursor-pointer p-0 border-0 bg-transparent outline-none focus:outline-none focus-visible:outline-none focus:ring-0"
          aria-label="Terug naar DAVI Dashboard"
        >
          <svg
            className="w-9 h-9 md:w-15 md:h-5"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.998 0C15.516 0 19.995 4.48 19.995 9.998C19.995 15.515 15.516 19.995 9.998 19.995C4.48 19.995 0 15.515 0 9.998C0 4.48 4.48 0 9.998 0ZM8.475 6.21C8.475 6.21 6.973 7.715 5.22 9.469C5.073 9.616 5 9.808 5 10C5 10.192 5.073 10.383 5.22 10.53C6.973 12.284 8.474 13.788 8.474 13.788C8.619 13.933 8.809 14.005 9 14.005C9.192 14.004 9.384 13.931 9.531 13.784C9.823 13.491 9.825 13.018 9.534 12.727L7.557 10.75H14.25C14.664 10.75 15 10.414 15 10C15 9.586 14.664 9.25 14.25 9.25H7.557L9.535 7.271C9.825 6.982 9.822 6.509 9.529 6.217C9.382 6.07 9.19 5.996 8.999 5.995C8.809 5.995 8.619 6.066 8.475 6.21Z"
              fill="black"
            />
          </svg>
        </button>
        <span className="text-[30px] md:text-[32px] font-bold">
          DAVI Dashboard
        </span>
      </div>

      <div className="mb-[29px] font-montserrat font-extrabold text-[18px] leading-[100%] text-[#342222]">
        {rows.length} actieve gebruikers in de laatste 30 dagen
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 items-center h-[60px] bg-[#F9FBFA] px-2 mb-0">
        <div className="min-w-0 w-full">
          {canWrite ? (
            <DropdownMenu
              value={bulkAction}
              onChange={handleBulk}
              allOptions={bulkOptions}
            />
          ) : (
            <DropdownMenu
              value="Bulkacties"
              onChange={() => {}}
              allOptions={['Bulkacties']}
              disabled
            />
          )}
        </div>
        <div className="min-w-0 w-full">
          <DropdownMenu
            value={roleFilter}
            onChange={setRoleFilter}
            allOptions={roleOptions}
          />
        </div>
        <div className="min-w-0 w-full">
          <SearchBox
            placeholderText="Zoek gebruiker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto border border-t-0 border-[#E5E5E5] rounded-b-lg">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#F9FBFA]">
            <tr className="h-[51px] border-b border-[#C5BEBE]">
              <SortableHeader
                sortKey="name"
                onSort={requestSort}
                currentSort={sortConfig}
                className="px-2"
              >
                <div className="flex items-center gap-5">
                  {canWrite && (
                    <CheckBox
                      toggle={allSelected}
                      indeterminate={someSelected}
                      onChange={toggleAll}
                      color="#23BD92"
                    />
                  )}
                  Naam
                </div>
              </SortableHeader>
              <SortableHeader
                sortKey="last_activity"
                onSort={requestSort}
                currentSort={sortConfig}
                className="px-2"
              >
                Laatste inlogmoment
              </SortableHeader>
              <SortableHeader
                sortKey="role_label"
                onSort={requestSort}
                currentSort={sortConfig}
                className="px-2"
              >
                Rol
              </SortableHeader>
              <th className="px-2 w-[100px]" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((u) => (
              <tr
                key={u.id}
                className="border-b border-[#C5BEBE] hover:bg-[#F9FBFA] transition"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-5">
                    {canWrite && (
                      <CheckBox
                        toggle={selected.has(u.id)}
                        onChange={(v) => toggleOne(u.id, v)}
                        color="#23BD92"
                      />
                    )}
                    <span className="font-medium">{u.name || '—'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-montserrat text-sm">
                  {formatNlDate(u.last_activity)}
                </td>
                <td className="px-4 py-3 text-sm">{u.role_label || '—'}</td>
                <td className="px-2 py-3">
                  <div className="flex justify-end items-center gap-3">
                    {canWrite && (
                      <>
                        <button
                          type="button"
                          onClick={() => goEdit(u)}
                          className="hover:opacity-70 transition-opacity"
                          title="Bewerken"
                        >
                          <EditIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteOne(u)}
                          className="hover:opacity-70 transition-opacity"
                          title="Verwijderen"
                        >
                          <RedCancelIcon />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sorted.length === 0 && (
          <div className="p-8 text-center text-gray-500 font-montserrat">
            Geen actieve gebruikers in dit overzicht.
          </div>
        )}
      </div>
      </div>

      {deleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setDeleteOpen(false)}
        >
          <div className="p-6" onClick={(e) => e.stopPropagation()}>
            <DeleteUserModal
              users={deleteTargets.map(mapToDeleteUser)}
              onClose={() => {
                setDeleteOpen(false);
                setDeleteTargets([]);
              }}
              onConfirm={confirmDelete}
              isMultiple={deleteTargets.length > 1}
            />
          </div>
        </div>
      )}
    </div>
  );
}
