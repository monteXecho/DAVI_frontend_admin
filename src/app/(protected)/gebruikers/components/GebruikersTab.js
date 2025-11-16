"use client";
import AddButton from "@/components/buttons/AddButton";
import CheckBox from "@/components/buttons/CheckBox";
import SearchBox from "@/components/input/SearchBox";
import EditIcon from "@/components/icons/EditIcon";
import RedCancelIcon from "@/components/icons/RedCancelIcon";
import DropdownMenu from "@/components/input/DropdownMenu";
import DeleteUserModal from "./modals/DeleteUserModal";
import DeleteSuccessModal from "./modals/DeleteSuccessModal";
import BulkImportModal from "./modals/BulkImportModal";
import SortableHeader from "@/components/SortableHeader";
import { useSortableData } from "@/lib/useSortableData";

import { useState, useMemo } from "react";

export default function GebruikersTab({ 
  users = [], 
  onEditUser, 
  onDeleteUsers, 
  onMoveToMaken, 
  onBulkImport, 
  uploadLoading 
}) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteSuccessModalOpen, setIsDeleteSuccessModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [bulkAction, setBulkAction] = useState("Bulkacties");
  const [deleteMode, setDeleteMode] = useState("single");
  const [uploadResult, setUploadResult] = useState(null);
  const [deletedUsersData, setDeletedUsersData] = useState([]);
  const [selectedRole, setSelectedRole] = useState("Alle rollen");
  const [searchQuery, setSearchQuery] = useState("");

  const { items: sortedUsers, requestSort, sortConfig } = useSortableData(users);

  const allRoles = useMemo(() => {
    const roles = new Set();
    sortedUsers.forEach((user) => user.Rol?.forEach((r) => roles.add(r)));
    return ["Alle rollen", "Zonder rol", ...Array.from(roles)];
  }, [sortedUsers]);

  const filteredData = useMemo(() => {
    let data = sortedUsers;

    if (selectedRole !== "Alle rollen") {
      if (selectedRole === "Zonder rol") {
        data = data.filter((user) => !user.Rol || user.Rol.length === 0);
      } else {
        data = data.filter((user) => user.Rol?.includes(selectedRole));
      }
    }

    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();
      data = data.filter((user) => 
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

  const allBulkActions = ["Bulkacties", "Delete", "Change role", "Add role"];

  const handleUserSelect = (userId, isSelected) => {
    setSelectedUsers(prev => {
      const newSelected = new Set(prev);
      if (isSelected) {
        newSelected.add(userId);
      } else {
        newSelected.delete(userId);
      }
      return newSelected;
    });
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      const allFilteredUserIds = new Set(filteredData.map(user => user.id));
      setSelectedUsers(allFilteredUserIds);
    } else {
      setSelectedUsers(new Set());
    }
  };

  const allSelected = filteredData.length > 0 && filteredData.every(user => selectedUsers.has(user.id));

  const someSelected = filteredData.some(user => selectedUsers.has(user.id)) && !allSelected;

  const handleBulkAction = (action) => {
    setBulkAction(action);
    
    if (action === "Delete") {
      if (selectedUsers.size > 0) {
        setDeleteMode("bulk");
        setIsDeleteModalOpen(true);
      } else {
        alert("Selecteer eerst gebruikers om te verwijderen.");
        setBulkAction("Bulkacties");
      }
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (onDeleteUsers && selectedUsers.size > 0) {
        const usersToDelete = getSelectedUsersData();
        setDeletedUsersData(usersToDelete);
        
        await onDeleteUsers(Array.from(selectedUsers));
        setIsDeleteSuccessModalOpen(true);
        setSelectedUsers(new Set());
      }
    } catch (err) {
      console.error("Failed to delete users:", err);
      alert("Failed to delete users. Please try again.");
    } finally {
      setIsDeleteModalOpen(false);
      setBulkAction("Bulkacties");
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUsers(new Set([user.id]));
    setDeleteMode("single");
    setIsDeleteModalOpen(true);
  };

  const handleSuccessModalClose = () => {
    setIsDeleteSuccessModalOpen(false);
    setDeletedUsersData([]);
  };

  const handleBulkImportClick = () => {
    setIsBulkImportModalOpen(true);
  };

  const handleFileUpload = async (file) => {
    if (!file || !onBulkImport) return;

    const result = await onBulkImport(file, selectedRole);
    setUploadResult(result);
    
    if (result.success) {
      setTimeout(() => {
        setIsBulkImportModalOpen(false);
        setUploadResult(null);
      }, 3000);
    }
  };

  const getSelectedUsersData = () => {
    return Array.from(selectedUsers).map(userId => 
      users.find(user => user.id === userId)
    ).filter(Boolean);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="mb-[29px] font-montserrat font-extrabold text-[18px] leading-[100%]">
        {titleText}
        {selectedUsers.size > 0 && (
          <span className="ml-2 text-gray-600">
            ({selectedUsers.size} geselecteerd)
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex h-[60px] bg-[#F9FBFA] items-center justify-between px-2">
        <button 
          className="w-[127px] h-10 border-2 border-[#23BD92] rounded-lg font-bold text-[16px] leading-[100%] text-[#23BD92] hover:bg-[#23BD92] hover:text-white transition-colors"
          onClick={handleBulkImportClick}
        >
          Bulk import
        </button>
        <AddButton onClick={() => onMoveToMaken()} text="Toevoegen" />
      </div>

      {/* Filters */}
      <div className="flex h-[60px] bg-[#F9FBFA] items-center justify-between px-2">
        <div className="w-32/99">
          <DropdownMenu 
            value={bulkAction} 
            onChange={handleBulkAction} 
            allOptions={allBulkActions} 
          />
        </div>

        <div className="w-32/99">
          <DropdownMenu 
            value={selectedRole} 
            onChange={setSelectedRole} 
            allOptions={allRoles} 
          />
        </div>

        <div className="w-32/99">
          <SearchBox
            placeholderText="Zoek gebruiker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#F9FBFA]">
            <tr className="h-[51px] border-b border-[#C5BEBE]">
              <SortableHeader 
                sortKey="Naam" 
                onSort={requestSort} 
                currentSort={sortConfig}
                className="px-2"
              >
                <div className="flex items-center gap-5">
                  <CheckBox 
                    toggle={allSelected} 
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                    color="#23BD92" 
                  />
                  Naam
                </div>
              </SortableHeader>

              <SortableHeader 
                sortKey="Email" 
                onSort={requestSort} 
                currentSort={sortConfig}
                className="px-2"
              >
                E-mail
              </SortableHeader>

              <th className="px-2 py-2 font-montserrat font-bold text-[16px] leading-6 text-black">
                <div className="flex items-center gap-5">
                  Rol
                </div>
              </th>

              <th className="px-2 py-2 w-[100px]"></th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((user) => (
              <tr
                key={user.id}
                className="h-[51px] border-b border-[#C5BEBE] hover:bg-[#F9FBFA] transition-colors"
              >
                <td className="px-2 py-2 font-montserrat font-normal text-[16px] leading-6 text-black">
                  <div className="flex items-center gap-5">
                    <CheckBox 
                      toggle={selectedUsers.has(user.id)} 
                      onChange={(isSelected) => handleUserSelect(user.id, isSelected)}
                      color="#23BD92" 
                    />
                    {user.Naam}
                  </div>
                </td>

                <td className="px-2 py-2 font-montserrat font-normal text-[16px] leading-6 text-black">
                  {user.Email}
                </td>

                <td className="px-2 py-2 font-montserrat font-normal text-[16px] leading-6 text-black">
                  {user.Rol?.map((r, i) => (
                    <div key={i}>{r}</div>
                  ))}
                </td>

                <td className="px-2 py-2">
                  <div className="flex justify-end items-center gap-3">
                    <button 
                      onClick={() => onEditUser && onEditUser(user)}
                      className="hover:opacity-80 transition-opacity"
                      aria-label={`Edit ${user.Naam}`}
                    >
                      <EditIcon />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(user)}
                      className="hover:opacity-80 transition-opacity"
                      aria-label={`Delete ${user.Naam}`}
                    >
                      <RedCancelIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <div className="p-6 text-center text-gray-500 font-montserrat">
            {searchQuery || selectedRole !== "Alle rollen" 
              ? 'Geen gebruikers gevonden voor deze zoekopdracht.' 
              : 'Geen gebruikers gevonden.'
            }
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center mb-[120px] xl:mb-0 bg-black/50"
          onClick={() => {
            setIsDeleteModalOpen(false);
            setBulkAction("Bulkacties");
          }}
        >
          <div className="p-6 w-fit" onClick={(e) => e.stopPropagation()}>
            <DeleteUserModal
              users={getSelectedUsersData()}
              onClose={() => {
                setIsDeleteModalOpen(false);
                setBulkAction("Bulkacties");
              }}
              onConfirm={handleDeleteConfirm}
              isMultiple={selectedUsers.size > 1}
            />
          </div>
        </div>
      )}

      {/* Delete Success Modal */}
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

      {/* Bulk Import Modal */}
      {isBulkImportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center mb-[120px] xl:mb-0 bg-black/50"
          onClick={() => {
            setIsBulkImportModalOpen(false);
            setUploadResult(null);
          }}
        >
          <div className="p-6 w-fit" onClick={(e) => e.stopPropagation()}>
            <BulkImportModal
              onClose={() => {
                setIsBulkImportModalOpen(false);
                setUploadResult(null);
              }}
              onUpload={handleFileUpload}
              loading={uploadLoading}
              result={uploadResult}
            />
          </div>
        </div>
      )}
    </div>
  );
}