"use client";
import AddButton from "@/components/buttons/AddButton";
import CheckBox from "@/components/buttons/CheckBox";
import SearchBox from "@/components/input/SearchBox";
import EditIcon from "@/components/icons/EditIcon";
import ResetPassIcon from "@/components/icons/ResetPassIcon";
import RedCancelIcon from "@/components/icons/RedCancelIcon";
import DownArrow from "@/components/icons/DownArrowIcon";
import DropdownMenu from "@/components/input/DropdownMenu";
import DeleteUserModal from "./modals/DeleteUserModal";
import BulkImportModal from "./modals/BulkImportModal";

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
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [bulkAction, setBulkAction] = useState("Bulkacties");
  const [deleteMode, setDeleteMode] = useState("single");
  const [uploadResult, setUploadResult] = useState(null);

  const [selectedRole, setSelectedRole] = useState("Alle rollen");
  const [searchQuery, setSearchQuery] = useState("");

  // Create dynamic list of roles from users
  const allRoles = useMemo(() => {
    const roles = new Set();
    users.forEach((user) => user.Rol?.forEach((r) => roles.add(r)));
    return ["Alle rollen", ...Array.from(roles)];
  }, [users]);

  // Filter users by role + search
  const filteredData = useMemo(() => {
    let data = users;

    if (selectedRole !== "Alle rollen") {
      data = data.filter((user) => user.Rol?.includes(selectedRole));
    }

    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();
      data = data.filter((user) => user.Naam.toLowerCase().includes(search));
    }

    return data;
  }, [users, selectedRole, searchQuery]);

  const titleText =
    selectedRole !== "Alle rollen"
      ? `${filteredData.length} gebruiker${filteredData.length !== 1 ? "s" : ""} met de rol "${selectedRole}"`
      : `${filteredData.length} gebruikers`;

  const allBulkActions = ["Bulkacties", "Delete", "Change role", "Add role"];

  // Handle individual checkbox selection
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

  // Handle select all checkbox
  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      // Select all filtered users
      const allFilteredUserIds = new Set(filteredData.map(user => user.id));
      setSelectedUsers(allFilteredUserIds);
    } else {
      // Deselect all
      setSelectedUsers(new Set());
    }
  };

  // Check if all filtered users are selected
  const allSelected = filteredData.length > 0 && filteredData.every(user => selectedUsers.has(user.id));

  // Check if some filtered users are selected
  const someSelected = filteredData.some(user => selectedUsers.has(user.id)) && !allSelected;

  // Handle bulk action selection
  const handleBulkAction = (action) => {
    setBulkAction(action);
    
    if (action === "Delete") {
      if (selectedUsers.size > 0) {
        setDeleteMode("bulk");
        setIsDeleteModalOpen(true);
      } else {
        // Show message if no users are selected
        alert("Selecteer eerst gebruikers om te verwijderen.");
        setBulkAction("Bulkacties"); // Reset to default
      }
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (onDeleteUsers && selectedUsers.size > 0) {
        await onDeleteUsers(Array.from(selectedUsers));
        setSelectedUsers(new Set()); // Clear selection after deletion
      }
    } catch (err) {
      console.error("Failed to delete users:", err);
      alert("Failed to delete users. Please try again.");
    } finally {
      setIsDeleteModalOpen(false);
      setBulkAction("Bulkacties"); // Reset bulk action after deletion
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUsers(new Set([user.id])); // Select only this user
    setDeleteMode("single");
    setIsDeleteModalOpen(true);
  };

  // Handle bulk import button click
  const handleBulkImportClick = () => {
    setIsBulkImportModalOpen(true);
  };

  // Handle file upload - just pass the file to parent
  const handleFileUpload = async (file) => {
    if (!file || !onBulkImport) return;

    const result = await onBulkImport(file);
    setUploadResult(result);
    
    if (result.success) {
      // Close modal after successful upload
      setTimeout(() => {
        setIsBulkImportModalOpen(false);
        setUploadResult(null);
      }, 3000);
    }
  };

  // Get selected users data for display in modal
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
          className="w-[127px] h-[40px] border-[2px] border-[#23BD92] rounded-[8px] font-bold text-[16px] leading-[100%] text-[#23BD92] hover:bg-[#23BD92] hover:text-white transition-colors"
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
      <table className="w-full border-separate border-spacing-0">
        <thead className="bg-[#F9FBFA]">
          <tr className="h-[51px] border-b border-[#C5BEBE] flex items-center gap-[40px] px-2">
            <th className="flex items-center gap-5 w-3/8 font-montserrat font-bold text-[16px] leading-6 text-black">
              <CheckBox 
                toggle={allSelected} 
                indeterminate={someSelected}
                onChange={handleSelectAll}
                color="#23BD92" 
              />
              <span>Naam</span>
              <DownArrow />
            </th>
            <th className="flex items-center gap-5 w-3/8 font-montserrat font-bold text-[16px] leading-6 text-black">
              E-mail
              <DownArrow />
            </th>
            <th className="flex items-center gap-5 w-1/8 font-montserrat font-bold text-[16px] leading-6 text-black">
              Rol
              <DownArrow />
            </th>
            <th className="w-1/8 px-4 py-2"></th>
          </tr>
        </thead>

        <tbody>
          {filteredData.map((user) => (
            <tr
              key={user.id}
              className="h-fit min-h-[51px] border-b border-[#C5BEBE] hover:bg-[#F9FBFA] flex items-center gap-[40px] px-2 py-1"
            >
              <td className="flex gap-5 w-3/8 items-center font-montserrat font-normal text-[16px] leading-6 text-black">
                <CheckBox 
                  toggle={selectedUsers.has(user.id)} 
                  onChange={(isSelected) => handleUserSelect(user.id, isSelected)}
                  color="#23BD92" 
                />
                {user.Naam}
              </td>
              <td className="w-3/8 font-montserrat font-normal text-[16px] leading-6 text-black">
                {user.Email}
              </td>
              <td className="w-1/8 font-montserrat font-normal text-[16px] leading-6 text-black">
                {user.Rol.map((r, i) => (
                  <div key={i}>{r}</div>
                ))}
              </td>
              <td className="w-1/8 flex justify-end items-center gap-3">
                <button onClick={() => onEditUser && onEditUser(user)}>
                  <EditIcon />
                </button>
                <ResetPassIcon />
                <button onClick={() => handleDeleteClick(user)}>
                  <RedCancelIcon />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center mb-[120px] xl:mb-0 bg-black/50"
          onClick={() => {
            setIsDeleteModalOpen(false);
            setBulkAction("Bulkacties"); // Reset bulk action when closing modal
          }}
        >
          <div className="p-6 w-fit" onClick={(e) => e.stopPropagation()}>
            <DeleteUserModal
              users={getSelectedUsersData()}
              onClose={() => {
                setIsDeleteModalOpen(false);
                setBulkAction("Bulkacties"); // Reset bulk action when closing modal
              }}
              onConfirm={handleDeleteConfirm}
              isMultiple={selectedUsers.size > 1}
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