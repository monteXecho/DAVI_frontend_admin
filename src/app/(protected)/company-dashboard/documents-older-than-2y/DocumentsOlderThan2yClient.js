'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useApi } from '@/lib/useApi';
import { canWriteDocuments } from '@/lib/permissions';
import SearchBox from '@/components/input/SearchBox';
import DropdownMenu from '@/components/input/DropdownMenu';
import CheckBox from '@/components/buttons/CheckBox';
import SortableHeader from '@/components/SortableHeader';
import { useSortableData } from '@/lib/useSortableData';
import EditIcon from '@/components/icons/EditIcon';
import RedCancelIcon from '@/components/icons/RedCancelIcon';

const PAGE_SIZE = 10;
const PAGE_TEAL = '#21BA8E';
const AGE_FILTER_LABEL = 'Ouder dan 2 jaar';

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

function buildPaginationItems(current, total) {
  if (total <= 0) return [];
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 5) {
    const out = [];
    for (let i = 1; i <= 5; i += 1) out.push(i);
    out.push('ellipsis');
    for (let i = total - 4; i <= total; i += 1) {
      if (i > 5) out.push(i);
    }
    return out;
  }
  if (current >= total - 4) {
    const out = [];
    for (let i = 1; i <= 5; i += 1) out.push(i);
    out.push('ellipsis');
    for (let i = total - 4; i <= total; i += 1) {
      if (i > 5) out.push(i);
    }
    return out;
  }
  const out = [1, 'ellipsis'];
  const start = Math.max(2, current - 2);
  const end = Math.min(total - 1, current + 2);
  for (let i = start; i <= end; i += 1) out.push(i);
  out.push('ellipsis');
  out.push(total);
  return out;
}

export default function DocumentsOlderThan2yClient() {
  const router = useRouter();
  const { getCompanyDashboardDocumentsOlderThan2y, deleteDocuments, getUser } = useApi();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [canWrite, setCanWrite] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('Bulkacties');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await getUser();
        if (!cancelled) setCanWrite(canWriteDocuments(me));
      } catch {
        if (!cancelled) setCanWrite(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getUser]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: PAGE_SIZE };
      const q = debouncedSearch.trim();
      if (q) params.q = q;

      const data = await getCompanyDashboardDocumentsOlderThan2y(params);
      setRows(Array.isArray(data?.documents) ? data.documents : []);
      setTotal(typeof data?.total === 'number' ? data.total : 0);
    } catch (e) {
      console.error(e);
      toast.error('Kon documenten niet laden.');
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [getCompanyDashboardDocumentsOlderThan2y, page, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  const tableRows = useMemo(() => {
    return rows.map((r) => ({
      ...r,
      last_updated_sort: r.updated_at ? new Date(r.updated_at).getTime() : 0,
    }));
  }, [rows]);

  const { items: sorted, requestSort, sortConfig } = useSortableData(tableRows);

  const allSelected =
    sorted.length > 0 && sorted.every((r) => selected.has(r.id));
  const someSelected =
    sorted.some((r) => selected.has(r.id)) && !allSelected;

  const toggleAll = (on) => {
    if (on) {
      setSelected(new Set(sorted.map((r) => r.id)));
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

  const bulkOptions = ['Bulkacties', 'Verwijder geselecteerde documenten'];

  const handleBulk = (action) => {
    setBulkAction(action);
    if (action !== 'Verwijder geselecteerde documenten') return;
    if (!canWrite) {
      toast.warn('Geen schrijfrechten voor documenten.');
      setBulkAction('Bulkacties');
      return;
    }
    if (selected.size === 0) {
      toast.warn('Selecteer eerst documenten.');
      setBulkAction('Bulkacties');
      return;
    }
    if (
      !window.confirm(
        `Weet u zeker dat u ${selected.size} document(en) wilt verwijderen?`
      )
    ) {
      setBulkAction('Bulkacties');
      return;
    }
    const targets = sorted.filter((r) => selected.has(r.id));
    (async () => {
      try {
        await deleteDocuments(
          targets.map((r) => ({
            fileName: r.file_name,
            folderName: r.folder_name,
            path: r.path,
          }))
        );
        toast.success('Document(en) verwijderd.');
        setSelected(new Set());
        setBulkAction('Bulkacties');
        await load();
      } catch (e) {
        console.error(e);
        toast.error('Verwijderen mislukt.');
        setBulkAction('Bulkacties');
      }
    })();
  };

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total]
  );

  const pageRangeLabel = useMemo(() => {
    if (total <= 0) return '';
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, total);
    return `${start}–${end} van ${total}`;
  }, [page, total]);

  const paginationItems = useMemo(
    () => buildPaginationItems(page, totalPages),
    [page, totalPages]
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const headLine = useMemo(
    () => `${total} documenten ouder dan 2 jaar`,
    [total]
  );

  const goEditDocument = () => {
    router.push('/documenten');
  };

  const confirmDelete = async (row) => {
    if (!canWrite) {
      toast.warn('Geen schrijfrechten voor documenten.');
      return;
    }
    const name = row.file_name || 'dit document';
    if (!window.confirm(`Weet u zeker dat u "${name}" wilt verwijderen?`)) return;
    try {
      await deleteDocuments([
        {
          fileName: row.file_name,
          folderName: row.folder_name,
          path: row.path,
        },
      ]);
      toast.success('Document verwijderd.');
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(row.id);
        return next;
      });
      await load();
    } catch (e) {
      console.error(e);
      toast.error('Verwijderen mislukt.');
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  if (loading && rows.length === 0) {
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
          <span className="text-[30px] md:text-[32px] font-bold">DAVI Dashboard</span>
        </div>

        <div className="mb-[29px] font-montserrat font-extrabold text-[18px] leading-[100%] text-[#342222]">
          {headLine}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 items-center min-h-[60px] bg-[#F9FBFA] px-2 mb-0 py-2 rounded-lg">
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
              value={AGE_FILTER_LABEL}
              onChange={() => {}}
              allOptions={[AGE_FILTER_LABEL]}
              disabled
            />
          </div>
          <div className="min-w-0 w-full sm:col-span-2 lg:col-span-1">
            <SearchBox
              placeholderText="Zoek document..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-t-0 border-[#E5E5E5] rounded-b-lg relative mt-0">
          {loading && (
            <div className="absolute inset-0 bg-white/50 z-1 flex items-center justify-center pointer-events-none">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-b-[#23BD92] border-gray-200" />
            </div>
          )}
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F9FBFA]">
              <tr className="h-[51px] border-b border-[#C5BEBE]">
                <SortableHeader
                  sortKey="folder_name"
                  onSort={requestSort}
                  currentSort={sortConfig}
                  className="px-2"
                >
                  <div className="flex items-center gap-5">
                    {canWrite && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        role="presentation"
                      >
                        <CheckBox
                          toggle={allSelected}
                          indeterminate={someSelected}
                          onChange={toggleAll}
                          color="#23BD92"
                        />
                      </div>
                    )}
                    Map
                  </div>
                </SortableHeader>
                <SortableHeader
                  sortKey="file_name"
                  onSort={requestSort}
                  currentSort={sortConfig}
                  className="px-2"
                >
                  Bestand
                </SortableHeader>
                <SortableHeader
                  sortKey="last_updated_sort"
                  onSort={requestSort}
                  currentSort={sortConfig}
                  className="px-2"
                >
                  Laatst bijgewerkt
                </SortableHeader>
                <th className="px-2 w-[100px]" aria-label="Acties" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[#C5BEBE] hover:bg-[#F9FBFA] transition"
                >
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-5">
                      {canWrite && (
                        <CheckBox
                          toggle={selected.has(row.id)}
                          onChange={(v) => toggleOne(row.id, v)}
                          color="#23BD92"
                        />
                      )}
                      <span>{row.folder_name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-sm">{row.file_name || '—'}</td>
                  <td className="px-4 py-3 font-montserrat text-sm text-[#342222]">
                    {formatNlDate(row.updated_at)}
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex justify-end items-center gap-3">
                      <button
                        type="button"
                        onClick={goEditDocument}
                        disabled={!canWrite}
                        className="p-0 border-0 bg-transparent cursor-pointer hover:opacity-70 disabled:opacity-35 disabled:cursor-not-allowed outline-none focus:outline-none focus-visible:outline-none focus:ring-0"
                        title={canWrite ? 'Documenten bewerken' : 'Geen schrijfrechten'}
                        aria-label="Documenten bewerken"
                      >
                        <EditIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmDelete(row)}
                        disabled={!canWrite}
                        className="p-0 border-0 bg-transparent cursor-pointer hover:opacity-70 disabled:opacity-35 disabled:cursor-not-allowed outline-none focus:outline-none focus-visible:outline-none focus:ring-0"
                        title={canWrite ? 'Document verwijderen' : 'Geen schrijfrechten'}
                        aria-label="Document verwijderen"
                      >
                        <RedCancelIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {rows.length === 0 && !loading && (
            <div className="p-8 text-center text-gray-500 font-montserrat">
              Geen documenten in dit overzicht.
            </div>
          )}
        </div>

        {total > 0 && (
          <div className="flex flex-col gap-2 mt-5">
            <p className="text-xs text-[#342222] font-montserrat">{pageRangeLabel}</p>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                aria-label="Vorige pagina"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#21BA8E] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path
                    d="M15 18l-6-6 6-6"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {paginationItems.map((item, idx) =>
                item === 'ellipsis' ? (
                  <span
                    key={`e-${idx}`}
                    className="flex min-w-8 items-center justify-center px-0.5 font-montserrat text-xs font-bold tracking-[0.12em]"
                    style={{ color: PAGE_TEAL }}
                    aria-hidden
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    disabled={loading}
                    onClick={() => setPage(item)}
                    className={`min-w-8 h-8 rounded-md border-2 px-1 font-montserrat text-xs font-bold transition disabled:opacity-50 ${
                      page === item ? '' : 'hover:bg-[#21BA8E]/10'
                    }`}
                    style={
                      page === item
                        ? {
                            backgroundColor: PAGE_TEAL,
                            borderColor: PAGE_TEAL,
                            color: '#ffffff',
                          }
                        : {
                            backgroundColor: '#ffffff',
                            borderColor: PAGE_TEAL,
                            color: PAGE_TEAL,
                          }
                    }
                  >
                    {item}
                  </button>
                )
              )}

              <button
                type="button"
                aria-label="Volgende pagina"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#21BA8E] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path
                    d="M9 18l6-6-6-6"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
