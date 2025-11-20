"use client";
import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";

import AddButton from "@/components/buttons/AddButton";
import CheckBox from "@/components/buttons/CheckBox";
import SearchBox from "@/components/input/SearchBox";
import EditIcon from "@/components/icons/EditIcon";
import RedCancelIcon from "@/components/icons/RedCancelIcon";
import DropdownMenu from "@/components/input/DropdownMenu";
import SortableHeader from "@/components/SortableHeader";
import DocumentenItem from "@/assets/documenten_item.png";

import DeleteUserModal from "./modals/DeleteUserModal";
import DeleteSuccessModal from "./modals/DeleteSuccessModal";
import BulkImportModal from "./modals/BulkImportModal";
import AddRoleModal from "./modals/AddRoleModal";

import { useSortableData } from "@/lib/useSortableData";

export default function GebruikersTab({
  users = [],
  roles = [],
  onEditUser,
  onDocumentenForUser,
  onAddRoleToUsers,
  onDeleteUsers,
  onDeleteRoleFromUsers,
  onMoveToMaken,
  onBulkImport,
  uploadLoading,
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

  // Get URL search params
  const [urlParams, setUrlParams] = useState({});
  
  useEffect(() => {
    // Check URL for role parameter
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const roleParam = searchParams.get('role');
      
      if (roleParam) {
        setSelectedRole(roleParam);
      }
    }
  }, []);

  // Map roles for folders
  const roleMap = useMemo(() => {
    const map = new Map();
    roles.forEach((r) => {
      if (!r) return;
      const name = r.name ?? r.role ?? String(r);
      map.set(name, r);
    });
    return map;
  }, [roles]);

  const allAvailableRoles = roles.map((r) => r.name ?? r.role ?? String(r));

  const allRoles = useMemo(() => {
    const set = new Set();
    sortedUsers.forEach((u) => u.Rol?.forEach((r) => set.add(r)));
    return ["Alle rollen", "Zonder rol", ...Array.from(set)];
  }, [sortedUsers]);

  // Expanded folders per user+role
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  // Expanded roles per user
  const [expandedRolesPerUser, setExpandedRolesPerUser] = useState(new Set());

  // Auto-expand when search matches are found - ONLY for specific matched roles/folders
  useEffect(() => {
    if (!searchQuery.trim()) {
      // Clear all expansions when search is empty
      setExpandedFolders(new Set());
      setExpandedRolesPerUser(new Set());
      return;
    }

    const searchTerm = searchQuery.toLowerCase();
    const newExpandedFolders = new Set();
    const newExpandedRolesPerUser = new Set();

    sortedUsers.forEach((user) => {
      if (!user.Rol) return;

      let userHasRoleOrFolderMatch = false;
      
      user.Rol.forEach((roleName) => {
        const roleObj = roleMap.get(roleName);
        const folders = roleObj?.folders ?? [];
        
        // Check if role name matches search
        const roleMatches = roleName.toLowerCase().includes(searchTerm);
        
        // Check if any folder matches search
        const folderMatches = folders.some(folder => 
          folder.toLowerCase().includes(searchTerm)
        );

        if (roleMatches || folderMatches) {
          userHasRoleOrFolderMatch = true;
          
          // If folders match, expand the folders for this specific role
          if (folderMatches) {
            newExpandedFolders.add(`${user.id}::${roleName}`);
          }
        }
      });

      // If user has role or folder matches, expand all roles to show the matches
      if (userHasRoleOrFolderMatch) {
        newExpandedRolesPerUser.add(user.id);
      }
    });

    setExpandedFolders(newExpandedFolders);
    setExpandedRolesPerUser(newExpandedRolesPerUser);
  }, [searchQuery, sortedUsers, roleMap]);

  // Enhanced search function that includes folders and roles
  const userMatchesSearch = (user, searchTerm) => {
    // Check name and email
    if (
      user.Naam?.toLowerCase().includes(searchTerm) ||
      user.Email?.toLowerCase().includes(searchTerm)
    ) {
      return true;
    }

    // Check roles
    if (user.Rol?.some(role => role.toLowerCase().includes(searchTerm))) {
      return true;
    }

    // Check folders in roles
    if (user.Rol?.some(role => {
      const roleObj = roleMap.get(role);
      const folders = roleObj?.folders ?? [];
      return folders.some(folder => folder.toLowerCase().includes(searchTerm));
    })) {
      return true;
    }

    return false;
  };

  // Check if a specific role has search matches
  const roleHasSearchMatch = (roleName) => {
    if (!searchQuery.trim()) return false;
    
    const searchTerm = searchQuery.toLowerCase();
    const roleObj = roleMap.get(roleName);
    const folders = roleObj?.folders ?? [];
    
    return (
      roleName.toLowerCase().includes(searchTerm) ||
      folders.some(folder => folder.toLowerCase().includes(searchTerm))
    );
  };

  // Check if a user has any role or folder matches (excluding name/email)
  const userHasRoleOrFolderMatch = (user) => {
    if (!searchQuery.trim()) return false;
    
    const searchTerm = searchQuery.toLowerCase();
    
    return user.Rol?.some(roleName => {
      const roleObj = roleMap.get(roleName);
      const folders = roleObj?.folders ?? [];
      
      return (
        roleName.toLowerCase().includes(searchTerm) ||
        folders.some(folder => folder.toLowerCase().includes(searchTerm))
      );
    }) || false;
  };

  // NEW: Check if user has any assigned roles
  const userHasAssignedRoles = (user) => {
    return user.Rol && user.Rol.length > 0;
  };

  // Filter users
  const filteredData = useMemo(() => {
    let data = sortedUsers;
    
    // First filter by selected role
    if (selectedRole !== "Alle rollen") {
      data =
        selectedRole === "Zonder rol"
          ? data.filter((u) => !u.Rol || u.Rol.length === 0)
          : data.filter((u) => u.Rol?.includes(selectedRole));
    }

    // Then filter by search query
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase();
      data = data.filter(user => userMatchesSearch(user, searchTerm));
    }

    return data;
  }, [sortedUsers, selectedRole, searchQuery, roleMap]);

  const titleText =
    selectedRole !== "Alle rollen"
      ? `${filteredData.length} gebruiker${filteredData.length !== 1 ? "s" : ""} met de rol "${selectedRole}"`
      : `${filteredData.length} gebruikers`;

  const allBulkActions = ["Bulkacties", "Delete user", "Delete role", "Add role"];

  // Selection
  const handleUserSelect = (id, val) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      val ? newSet.add(id) : newSet.delete(id);
      return newSet;
    });
  };

  const handleSelectAll = (val) => {
    setSelectedUsers(val ? new Set(filteredData.map((u) => u.id)) : new Set());
  };

  const allSelected = filteredData.length > 0 && filteredData.every((u) => selectedUsers.has(u.id));
  const someSelected = filteredData.some((u) => selectedUsers.has(u.id)) && !allSelected;

  const getSelectedUsersData = () =>
    Array.from(selectedUsers)
      .map((id) => users.find((u) => u.id === id))
      .filter(Boolean);

  // Bulk Actions
  const handleBulkAction = (action) => {
    setBulkAction(action);
    if (action === "Delete user") {
      if (selectedUsers.size === 0) return alert("Selecteer eerst een gebruikers om te verwijderen.");
      setDeleteMode("bulk");
      setIsDeleteModalOpen(true);
    }
    if (action === "Delete role") {
      if (selectedRole === "Alle rollen") return alert("Kies eerst een specifieke rol.");
      if (selectedUsers.size === 0) return alert("Selecteer eerst gebruikers.");
      handleDeleteRoleFromUsersConfirm();
    }
    if (action === "Add role") {
      if (selectedUsers.size === 0) return alert("Selecteer eerst gebruikers.");
      setIsAddRoleModalOpen(true);
    }
  };

  const handleDeleteRoleFromUsersConfirm = async () => {
    try {
      await onDeleteRoleFromUsers(Array.from(selectedUsers), selectedRole);
      alert(`Rol "${selectedRole}" succesvol verwijderd.`);
    } finally {
      setBulkAction("Bulkacties");
      setSelectedUsers(new Set());
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const usersToDelete = getSelectedUsersData();
      setDeletedUsersData(usersToDelete);
      await onDeleteUsers(Array.from(selectedUsers));
      setIsDeleteSuccessModalOpen(true);
      setSelectedUsers(new Set());
    } finally {
      setIsDeleteModalOpen(false);
      setBulkAction("Bulkacties");
    }
  };

  const handleAddRoleConfirm = async (roleName) => {
    if (!roleName) return;
    await onAddRoleToUsers(Array.from(selectedUsers), roleName);
    alert(`Rol "${roleName}" toegevoegd.`);
    setIsAddRoleModalOpen(false);
    setSelectedUsers(new Set());
    setBulkAction("Bulkacties");
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    const result = await onBulkImport(file, selectedRole);
    setUploadResult(result);
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

  // Manual toggle functions
  const toggleFolderExpand = (userId, roleName) => {
    const key = `${userId}::${roleName}`;
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      newSet.has(key) ? newSet.delete(key) : newSet.add(key);
      return newSet;
    });
  };

  const toggleUserRoles = (userId) => {
    setExpandedRolesPerUser((prev) => {
      const newSet = new Set(prev);
      newSet.has(userId) ? newSet.delete(userId) : newSet.add(userId);
      return newSet;
    });
  };

  // Highlight matching search terms in text
  const highlightText = (text, searchTerm) => {
    if (!searchTerm || !text) return text;
    
    const lowerText = text.toLowerCase();
    const lowerSearchTerm = searchTerm.toLowerCase();
    const index = lowerText.indexOf(lowerSearchTerm);
    
    if (index === -1) return text;
    
    const before = text.substring(0, index);
    const match = text.substring(index, index + searchTerm.length);
    const after = text.substring(index + searchTerm.length);
    
    return (
      <>
        {before}
        <span className="bg-yellow-200 font-semibold">{match}</span>
        {after}
      </>
    );
  };

  // Render role with folders (per user) with search highlighting
  const renderRoleWithFolders = (userId, roleName) => {
    const roleObj = roleMap.get(roleName);
    const folders = roleObj?.folders ?? [];
    const isExpanded = expandedFolders.has(`${userId}::${roleName}`);
    const searchTerm = searchQuery.toLowerCase();
    const hasSearchMatch = roleHasSearchMatch(roleName);

    return (
      <div className="flex flex-col gap-1 mb-2">
        <div className="flex items-center gap-2">
          <span className={`inline-block ${hasSearchMatch ? 'bg-yellow-100 border border-yellow-300' : 'bg-[#23BD92]/10'} text-[#23BD92] font-semibold text-sm px-2 py-1 rounded-md`}>
            {searchQuery ? highlightText(roleName, searchTerm) : roleName}
          </span>
          {folders.length > 0 && (
            <button
              onClick={() => toggleFolderExpand(userId, roleName)}
              className="text-gray-600 text-xs hover:text-gray-800 hover:underline transition-colors"
            >
              {folders.length} map{folders.length !== 1 ? 'pen' : ''}
              <span className="ml-1">{isExpanded ? '▲' : '▼'}</span>
            </button>
          )}
        </div>
        {(isExpanded || hasSearchMatch) && folders.length > 0 && (
          <div className="ml-3 flex flex-col gap-1 text-gray-700 text-xs">
            {folders.map((f, i) => {
              const folderMatches = searchTerm && f.toLowerCase().includes(searchTerm);
              return (
                <div key={i} className={`flex items-center gap-1 ${folderMatches ? 'bg-yellow-50 rounded px-1' : ''}`}>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>{searchQuery ? highlightText(f, searchTerm) : f}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Render roles section for a user
  const renderUserRoles = (user) => {
    if (!user.Rol || user.Rol.length === 0) {
      return (
        <span className="text-gray-400 text-sm italic">Geen rollen</span>
      );
    }

    const isExpanded = expandedRolesPerUser.has(user.id);
    const hasRoleOrFolderMatch = userHasRoleOrFolderMatch(user);
    const hasNameOrEmailMatch = searchQuery.trim() && (
      user.Naam?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.Email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // During search: show all roles if user has role/folder matches, otherwise show only first role
    const shouldShowAllRoles = isExpanded || hasRoleOrFolderMatch;
    const rolesToShow = shouldShowAllRoles ? user.Rol : user.Rol.slice(0, 1);
    const hiddenRolesCount = user.Rol.length - 1;

    return (
      <div className="flex flex-col gap-2">
        {/* Visible roles */}
        <div className="flex flex-col gap-2">
          {rolesToShow.map((roleName, index) => (
            <div key={`${user.id}-${roleName}-${index}`}>
              {renderRoleWithFolders(user.id, roleName)}
            </div>
          ))}
        </div>

        {/* Expand/Collapse button - only show when not in search mode or when user only has name/email match */}
        {user.Rol.length > 1 && !hasRoleOrFolderMatch && !searchQuery.trim() && (
          <div className="flex items-center">
            <button
              onClick={() => toggleUserRoles(user.id)}
              className="flex items-center gap-1 text-[#23BD92] text-sm font-medium hover:text-[#1da67c] transition-colors"
            >
              <span>
                {isExpanded 
                  ? `Minder tonen` 
                  : `+${hiddenRolesCount} meer rol${hiddenRolesCount !== 1 ? 'len' : ''}`
                }
              </span>
              <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="mb-[29px] font-montserrat font-extrabold text-[18px] leading-[100%]">
        {titleText}{" "}
        {selectedUsers.size > 0 && (
          <span className="ml-2 text-gray-600">({selectedUsers.size} geselecteerd)</span>
        )}
      </div>

      {/* Action bar */}
      <div className="flex h-[60px] bg-[#F9FBFA] items-center justify-between px-2">
        <button
          className="w-[127px] h-10 border-2 border-[#23BD92] rounded-lg font-bold text-[16px] text-[#23BD92] hover:bg-[#23BD92] hover:text-white transition-colors"
          onClick={() => setIsBulkImportModalOpen(true)}
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
          <SearchBox 
            placeholderText="Zoek gebruiker, rol, map..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#F9FBFA]">
            <tr className="h-[51px] border-b border-[#C5BEBE]">
              <SortableHeader sortKey="Naam" onSort={requestSort} currentSort={sortConfig} className="px-2">
                <div className="flex items-center gap-5">
                  <CheckBox toggle={allSelected} indeterminate={someSelected} onChange={handleSelectAll} color="#23BD92" />
                  Naam
                </div>
              </SortableHeader>
              <SortableHeader sortKey="Email" onSort={requestSort} currentSort={sortConfig} className="px-2">E-mail</SortableHeader>
              <th className="px-2 py-2 font-montserrat font-bold text-[16px]">Rol & Mappen</th>
              <th className="px-2 w-[100px]"></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((user) => {
              const hasRoles = userHasAssignedRoles(user);
              
              return (
                <tr key={user.id} className="border-b border-[#C5BEBE] hover:bg-[#F9FBFA] transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-5">
                      <CheckBox toggle={selectedUsers.has(user.id)} onChange={(v) => handleUserSelect(user.id, v)} color="#23BD92" />
                      <span className="font-medium">
                        {searchQuery ? highlightText(user.Naam, searchQuery) : user.Naam}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {searchQuery ? highlightText(user.Email, searchQuery) : user.Email}
                  </td>
                  <td className="px-4 py-3">
                    {renderUserRoles(user)}
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex justify-end items-center gap-3">
                      <button
                        className={`relative w-[19px] h-5 ${hasRoles ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}
                        title={hasRoles ? "Documenten" : "Geen rollen toegewezen"}
                        onClick={() => {
                          if (hasRoles) {
                            onDocumentenForUser?.(user); 
                            console.log('--- user --- :', user);
                          }
                        }}
                        disabled={!hasRoles}
                      >
                        <Image 
                          src={DocumentenItem} 
                          alt="Documenten" 
                          fill 
                          className="object-contain" 
                        />
                        <div className={`absolute inset-0 ${hasRoles ? 'bg-[#23BD92] mix-blend-overlay' : 'bg-gray-100 mix-blend-overlay'}`}></div>
                      </button>
                      <button 
                        onClick={() => onEditUser?.(user)} 
                        className="hover:opacity-70 transition-opacity"
                        title="Bewerken"
                      >
                        <EditIcon />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(user)} 
                        className="hover:opacity-70 transition-opacity"
                        title="Verwijderen"
                      >
                        <RedCancelIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            {searchQuery || selectedRole !== "Alle rollen"
              ? "Geen gebruikers gevonden voor deze zoekopdracht."
              : "Geen gebruikers gevonden."}
          </div>
        )}
      </div>

      {/* Modals */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="p-6" onClick={(e) => e.stopPropagation()}>
            <DeleteUserModal
              users={getSelectedUsersData()}
              onClose={() => setIsDeleteModalOpen(false)}
              onConfirm={handleDeleteConfirm}
              isMultiple={selectedUsers.size > 1}
            />
          </div>
        </div>
      )}

      {isDeleteSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleSuccessModalClose}>
          <div className="p-6" onClick={(e) => e.stopPropagation()}>
            <DeleteSuccessModal
              users={deletedUsersData}
              onClose={handleSuccessModalClose}
              isMultiple={deletedUsersData.length > 1}
            />
          </div>
        </div>
      )}

      {isBulkImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setIsBulkImportModalOpen(false)}>
          <div className="p-6" onClick={(e) => e.stopPropagation()}>
            <BulkImportModal
              onClose={() => setIsBulkImportModalOpen(false)}
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