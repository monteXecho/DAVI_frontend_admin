"use client";
import React, { useState, useMemo } from "react";
import AddButton from "@/components/buttons/AddButton";
import CheckBox from "@/components/buttons/CheckBox";
import SearchBox from "@/components/input/SearchBox";
import EditIcon from "@/components/icons/EditIcon";
import RedCancelIcon from "@/components/icons/RedCancelIcon";
import DropdownMenu from "@/components/input/DropdownMenu";
import SortableHeader from "@/components/SortableHeader";

import DeleteUserModal from "./modals/DeleteUserModal";
import DeleteSuccessModal from "./modals/DeleteSuccessModal";
import BulkImportModal from "./modals/BulkImportModal";
import AddRoleModal from "./modals/AddRoleModal";

import { useSortableData } from "@/lib/useSortableData";

export default function GebruikersTab({
  users = [],
  roles,
  onEditUser,
  onAddRoleToUsers,
  onDeleteUsers,
  onDeleteRoleFromUsers,
  onMoveToMaken,
  onBulkImport,
  uploadLoading
}) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteSuccessModalOpen, setIsDeleteSuccessModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [bulkAction, setBulkAction] = useState("Bulkacties");
  const [deleteMode, setDeleteMode] = useState("single");
  const [uploadResult, setUploadResult] = useState(null);
  const [deletedUsersData, setDeletedUsersData] = useState([]);
  const [selectedRole, setSelectedRole] = useState("Alle rollen");
  const [searchQuery, setSearchQuery] = useState("");

  const { items: sortedUsers, requestSort, sortConfig } = useSortableData(users);

  const allAvailableRoles = useMemo(
    () => roles.map((r) => (r?.name ?? r?.role ?? String(r))).filter(Boolean),
    [roles]
  )

  // Roles
  const allRoles = useMemo(() => {
    const roles = new Set();
    sortedUsers.forEach(user => user.Rol?.forEach(r => roles.add(r)));
    return ["Alle rollen", "Zonder rol", ...Array.from(roles)];
  }, [sortedUsers]);

  // Filtered users
  const filteredData = useMemo(() => {
    let data = sortedUsers;

    if (selectedRole !== "Alle rollen") {
      data = selectedRole === "Zonder rol"
        ? data.filter(user => !user.Rol || user.Rol.length === 0)
        : data.filter(user => user.Rol?.includes(selectedRole));
    }

    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();
      data = data.filter(user =>
        user.Naam?.toLowerCase().includes(search) ||
        user.Email?.toLowerCase().includes(search)
      );
    }

    return data;
  }, [sortedUsers, selectedRole, searchQuery]);

  const titleText =
    selectedRole !== "Alle rollen"
      ? `${filteredData.length} gebruiker${filteredData.length !== 1 ? "s" : ""} met de rol "${selectedRole}"`
      : `${filteredData.length} gebruikers`;

  const allBulkActions = ["Bulkacties", "Delete user", "Delete role", "Add role"];

  // ----- User selection -----
  const handleUserSelect = (userId, isSelected) => {
    setSelectedUsers(prev => {
      const newSelected = new Set(prev);
      isSelected ? newSelected.add(userId) : newSelected.delete(userId);
      return newSelected;
    });
  };

  const handleSelectAll = (isSelected) => {
    setSelectedUsers(isSelected ? new Set(filteredData.map(user => user.id)) : new Set());
  };

  const allSelected = filteredData.length > 0 && filteredData.every(user => selectedUsers.has(user.id));
  const someSelected = filteredData.some(user => selectedUsers.has(user.id)) && !allSelected;

  const getSelectedUsersData = () => {
    return Array.from(selectedUsers).map(userId =>
      users.find(user => user.id === userId)
    ).filter(Boolean);
  };

  // ----- Bulk Actions -----
  const handleBulkAction = (action) => {
    setBulkAction(action);

    if (action === "Delete user") {
      if (selectedUsers.size === 0) {
        setBulkAction("Bulkacties");
        return alert("Selecteer eerst gebruikers om te verwijderen.");
      }
      setDeleteMode("bulk");
      setIsDeleteModalOpen(true);
    }

    if (action === "Delete role") {
      if (selectedRole === "Alle rollen") {
        setBulkAction("Bulkacties");
        return alert("Kies eerst een specifieke rol.");
      }
      if (selectedUsers.size === 0) {
        setBulkAction("Bulkacties");
        return alert("Selecteer eerst gebruikers om een rol te verwijderen.");
      }
      handleDeleteRoleFromUsersConfirm();
    }

    if (action === "Add role") {
      if (selectedUsers.size === 0) {
        setBulkAction("Bulkacties");
        return alert("Selecteer eerst gebruikers om een rol toe te voegen.");}
      setIsAddRoleModalOpen(true);
    }
  };

  // ----- Delete Role -----
  const handleDeleteRoleFromUsersConfirm = async () => {
    try {
      if (!selectedRole || selectedRole === "Alle rollen") return;
      await onDeleteRoleFromUsers(Array.from(selectedUsers), selectedRole);
      alert(`Rol "${selectedRole}" succesvol verwijderd van geselecteerde gebruikers.`);
    } catch (err) {
      console.error(err);
      alert("Failed to delete role. Please try again.");
    } finally {
      setBulkAction("Bulkacties");
      setSelectedUsers(new Set());
    }
  };

  // ----- Delete Users -----
  const handleDeleteConfirm = async () => {
    try {
      if (selectedUsers.size > 0) {
        const usersToDelete = getSelectedUsersData();
        setDeletedUsersData(usersToDelete);
        await onDeleteUsers(Array.from(selectedUsers));
        setIsDeleteSuccessModalOpen(true);
        setSelectedUsers(new Set());
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete users. Please try again.");
    } finally {
      setIsDeleteModalOpen(false);
      setBulkAction("Bulkacties");
    }
  };

  // ----- Add Role -----
  const handleAddRoleConfirm = async (roleName) => {
    try {
      if (!roleName) return;
      await onAddRoleToUsers(Array.from(selectedUsers), roleName);
      alert(`Rol "${roleName}" toegevoegd aan geselecteerde gebruikers.`);
    } catch (err) {
      console.error(err);
      alert("Failed to add role. Please try again.");
    } finally {
      setIsAddRoleModalOpen(false);
      setBulkAction("Bulkacties");
      setSelectedUsers(new Set());
    }
  };

  // ----- Bulk Import -----
  const handleBulkImportClick = () => setIsBulkImportModalOpen(true);
  const handleFileUpload = async (file) => {
    if (!file || !onBulkImport) return;
    const result = await onBulkImport(file, selectedRole);
    setUploadResult(result);
    if (result.success) setTimeout(() => setIsBulkImportModalOpen(false), 3000);
  };

  // ----- Single Delete -----
  const handleDeleteClick = (user) => {
    setSelectedUsers(new Set([user.id]));
    setDeleteMode("single");
    setIsDeleteModalOpen(true);
  };

  const handleSuccessModalClose = () => {
    setIsDeleteSuccessModalOpen(false);
    setDeletedUsersData([]);
  };

  // ----- Render -----
  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="mb-[29px] font-montserrat font-extrabold text-[18px] leading-[100%]">
        {titleText} {selectedUsers.size > 0 && <span className="ml-2 text-gray-600">({selectedUsers.size} geselecteerd)</span>}
      </div>

      {/* Action Buttons */}
      <div className="flex h-[60px] bg-[#F9FBFA] items-center justify-between px-2">
        <button
          className="w-[127px] h-10 border-2 border-[#23BD92] rounded-lg font-bold text-[16px] leading-[100%] text-[#23BD92] hover:bg-[#23BD92] hover:text-white transition-colors"
          onClick={handleBulkImportClick}
        >
          Bulk import
        </button>
        <AddButton onClick={onMoveToMaken} text="Toevoegen" />
      </div>

      {/* Filters */}
      <div className="flex h-[60px] bg-[#F9FBFA] items-center justify-between px-2">
        <div className="w-32/99">
          <DropdownMenu value={bulkAction} onChange={handleBulkAction} allOptions={allBulkActions} />
        </div>
        <div className="w-32/99">
          <DropdownMenu value={selectedRole} onChange={setSelectedRole} allOptions={allRoles} />
        </div>
        <div className="w-32/99">
          <SearchBox placeholderText="Zoek gebruiker..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#F9FBFA]">
            <tr className="h-[51px] border-b border-[#C5BEBE]">
              <SortableHeader sortKey="Naam" onSort={requestSort} currentSort={sortConfig} className="px-2">
                <div className="flex items-center gap-5">
                  <CheckBox toggle={allSelected} indeterminate={someSelected} onChange={handleSelectAll} color="#23BD92" />
                  Naam
                </div>
              </SortableHeader>
              <SortableHeader sortKey="Email" onSort={requestSort} currentSort={sortConfig} className="px-2">E-mail</SortableHeader>
              <th className="px-2 py-2 font-montserrat font-bold text-[16px] leading-6 text-black">Rol</th>
              <th className="px-2 py-2 w-[100px]"></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(user => (
              <tr key={user.id} className="h-[51px] border-b border-[#C5BEBE] hover:bg-[#F9FBFA] transition-colors">
                <td className="px-2 py-2 font-montserrat font-normal text-[16px] leading-6 text-black">
                  <div className="flex items-center gap-5">
                    <CheckBox toggle={selectedUsers.has(user.id)} onChange={isSelected => handleUserSelect(user.id, isSelected)} color="#23BD92" />
                    {user.Naam}
                  </div>
                </td>
                <td className="px-2 py-2 font-montserrat font-normal text-[16px] leading-6 text-black">{user.Email}</td>
                <td className="px-2 py-2 font-montserrat font-normal text-[16px] leading-6 text-black">
                  {user.Rol?.map((r, i) => <div key={i}>{r}</div>)}
                </td>
                <td className="px-2 py-2">
                  <div className="flex justify-end items-center gap-3">
                    <button onClick={() => onEditUser?.(user)} className="hover:opacity-80 transition-opacity"><EditIcon /></button>
                    <button onClick={() => handleDeleteClick(user)} className="hover:opacity-80 transition-opacity"><RedCancelIcon /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <div className="p-6 text-center text-gray-500 font-montserrat">
            {searchQuery || selectedRole !== "Alle rollen" ? 'Geen gebruikers gevonden voor deze zoekopdracht.' : 'Geen gebruikers gevonden.'}
          </div>
        )}
      </div>

      {/* Modals */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center mb-[120px] xl:mb-0 bg-black/50"
          onClick={() => { setIsDeleteModalOpen(false); setBulkAction("Bulkacties"); }}
        >
          <div className="p-6 w-fit" onClick={(e) => e.stopPropagation()}>
            <DeleteUserModal
              users={getSelectedUsersData()}
              onClose={() => { setIsDeleteModalOpen(false); setBulkAction("Bulkacties"); }}
              onConfirm={handleDeleteConfirm}
              isMultiple={selectedUsers.size > 1}
            />
          </div>
        </div>
      )}

      {isDeleteSuccessModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center mb-[120px] xl:mb-0 bg-black/50"
          onClick={handleSuccessModalClose}
        >
          <div className="p-6 w-fit" onClick={(e) => e.stopPropagation()}>
            <DeleteSuccessModal
              users={deletedUsersData}
              onClose={handleSuccessModalClose}
              isMultiple={deletedUsersData.length > 1}
            />
          </div>
        </div>
      )}

      {isBulkImportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center mb-[120px] xl:mb-0 bg-black/50"
          onClick={() => { setIsBulkImportModalOpen(false); setUploadResult(null); }}
        >
          <div className="p-6 w-fit" onClick={(e) => e.stopPropagation()}>
            <BulkImportModal
              onClose={() => { setIsBulkImportModalOpen(false); setUploadResult(null); }}
              onUpload={handleFileUpload}
              loading={uploadLoading}
              result={uploadResult}
            />
          </div>
        </div>
      )}

      {isAddRoleModalOpen && (
        <AddRoleModal
          isOpen={isAddRoleModalOpen}
          onClose={() => setIsAddRoleModalOpen(false)}
          allRoles={allAvailableRoles}
          selectedUsersCount={selectedUsers.size}
          onConfirm={handleAddRoleConfirm}
        />
      )}
    </div>
  );
}
