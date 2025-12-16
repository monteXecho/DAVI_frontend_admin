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
  canWrite = true,
}) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteSuccessModalOpen, setIsDeleteSuccessModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [bulkAction, setBulkAction] = useState("Bulkacties");
  const [uploadResult, setUploadResult] = useState(null);
  const [deletedUsersData, setDeletedUsersData] = useState([]);
  const [selectedRole, setSelectedRole] = useState("Alle rollen");
  const [searchQuery, setSearchQuery] = useState("");

  const { items: sortedUsers, requestSort, sortConfig } = useSortableData(users);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const roleParam = searchParams.get('role');
      
      if (roleParam) {
        setSelectedRole(roleParam);
      }
    }
  }, []);

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

  // Check if user is an admin (has "Beheerder" role)
  const isUserAdmin = (user) => {
    return user.Rol?.includes("Beheerder") || false;
  };

  const allRoles = useMemo(() => {
    const set = new Set();
    sortedUsers.forEach((u) => u.Rol?.forEach((r) => set.add(r)));
    
    // Check if there are any teamlid users
    const hasTeamlidUsers = sortedUsers.some(u => u.is_teamlid === true);
    const rolesList = ["Alle rollen", "Beheerder", "Zonder rol", ...Array.from(set).filter(role => role !== "Beheerder")];
    
    // Add Teamlid option if there are teamlid users
    if (hasTeamlidUsers && !rolesList.includes("Teamlid")) {
      rolesList.push("Teamlid");
    }
    
    return rolesList;
  }, [sortedUsers]);

  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [expandedRolesPerUser, setExpandedRolesPerUser] = useState(new Set());

  useEffect(() => {
    if (!searchQuery.trim()) {
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
        
        const roleMatches = roleName.toLowerCase().includes(searchTerm);
        
        const folderMatches = folders.some(folder => 
          folder.toLowerCase().includes(searchTerm)
        );

        if (roleMatches || folderMatches) {
          userHasRoleOrFolderMatch = true;
          
          if (folderMatches) {
            newExpandedFolders.add(`${user.id}::${roleName}`);
          }
        }
      });

      if (userHasRoleOrFolderMatch) {
        newExpandedRolesPerUser.add(user.id);
      }
    });

    setExpandedFolders(newExpandedFolders);
    setExpandedRolesPerUser(newExpandedRolesPerUser);
  }, [searchQuery, sortedUsers, roleMap]);

  const userMatchesSearch = (user, searchTerm) => {
    if (
      user.Naam?.toLowerCase().includes(searchTerm) ||
      user.Email?.toLowerCase().includes(searchTerm)
    ) {
      return true;
    }

    if (user.Rol?.some(role => role.toLowerCase().includes(searchTerm))) {
      return true;
    }

    if (user.Rol?.some(role => {
      const roleObj = roleMap.get(role);
      const folders = roleObj?.folders ?? [];
      return folders.some(folder => folder.toLowerCase().includes(searchTerm));
    })) {
      return true;
    }

    return false;
  };

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

  const userHasAssignedRoles = (user) => {
    return user.Rol && user.Rol.length > 0 && !isUserAdmin(user);
  };

  const filteredData = useMemo(() => {
    let data = sortedUsers;
    
    if (selectedRole !== "Alle rollen") {
      if (selectedRole === "Beheerder") {
        // Filter for admin users (users with "Beheerder" role)
        data = data.filter((u) => u.Rol?.includes("Beheerder"));
      } else if (selectedRole === "Zonder rol") {
        data = data.filter((u) => !u.Rol || u.Rol.length === 0);
      } else {
        data = data.filter((u) => u.Rol?.includes(selectedRole));
      }
    }

    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase();
      data = data.filter(user => userMatchesSearch(user, searchTerm));
    }

    return data;
  }, [sortedUsers, selectedRole, searchQuery, roleMap]);

  const titleText = useMemo(() => {
    if (selectedRole === "Beheerder") {
      return `${filteredData.length} beheerder${filteredData.length !== 1 ? "s" : ""}`;
    } else if (selectedRole === "Teamlid") {
      return `${filteredData.length} teamlid${filteredData.length !== 1 ? "leden" : ""}`;
    } else if (selectedRole !== "Alle rollen") {
      return `${filteredData.length} gebruiker${filteredData.length !== 1 ? "s" : ""} met de rol "${selectedRole}"`;
    } else {
      return `${filteredData.length} gebruikers`;
    }
  }, [filteredData.length, selectedRole]);

  const allBulkActions = ["Bulkacties", "Verwijder gebruiker", "Verwijder rol", "Rol toevoegen"];

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

  const handleBulkAction = (action) => {
    setBulkAction(action);
    if (action === "Verwijder gebruiker") {
      if (selectedUsers.size === 0) return alert("Selecteer eerst een gebruikers om te verwijderen.");
      setIsDeleteModalOpen(true);
    }
    if (action === "Verwijder rol") {
      if (selectedRole === "Alle rollen") return alert("Kies eerst een specifieke rol.");
      if (selectedUsers.size === 0) return alert("Selecteer eerst gebruikers.");
      
      // Don't allow removing "Beheerder" role from admins via bulk action
      if (selectedRole === "Beheerder") {
        return alert("De 'Beheerder' rol kan niet via bulk acties verwijderd worden. Gebruik individuele bewerking.");
      }
      
      handleDeleteRoleFromUsersConfirm();
    }
    if (action === "Rol toevoegen") {
      if (selectedUsers.size === 0) return alert("Selecteer eerst gebruikers.");
      
      // Check if any selected users are admins
      const selectedUserData = getSelectedUsersData();
      const hasAdmins = selectedUserData.some(user => isUserAdmin(user));
      
      if (hasAdmins) {
        return alert("Beheerders kunnen geen rollen toegewezen krijgen. Selecteer alleen gewone gebruikers.");
      }
      
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
    
    // Don't allow adding "Beheerder" role via bulk action
    if (roleName === "Beheerder") {
      alert("De 'Beheerder' rol kan niet via bulk acties toegevoegd worden. Gebruik individuele bewerking of voeg een nieuwe beheerder toe.");
      return;
    }
    
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
    setIsDeleteModalOpen(true);
  };

  const handleSuccessModalClose = () => {
    setIsDeleteSuccessModalOpen(false);
    setDeletedUsersData([]);
  };

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

  const renderRoleWithFolders = (userId, roleName) => {
    const roleObj = roleMap.get(roleName);
    const folders = roleObj?.folders ?? [];
    const isExpanded = expandedFolders.has(`${userId}::${roleName}`);
    const searchTerm = searchQuery.toLowerCase();
    const hasSearchMatch = roleHasSearchMatch(roleName);
    const isBeheerderRole = roleName === "Beheerder";
    const isTeamlidRole = roleName === "Teamlid";
    // Teamlid and Beheerder don't show folders
    const shouldShowFolders = folders.length > 0 && !isBeheerderRole && !isTeamlidRole;
    
    // Use red style for Beheerder and Teamlid, green for other roles
    const isSpecialRole = isBeheerderRole || isTeamlidRole;
    const badgeClass = hasSearchMatch 
      ? isSpecialRole 
        ? 'bg-yellow-100 border border-yellow-300 text-red-600' 
        : 'bg-yellow-100 border border-yellow-300 text-[#23BD92]'
      : isSpecialRole
        ? 'bg-red-600/10 text-red-600'
        : 'bg-[#23BD92]/10 text-[#23BD92]';

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className={`inline-block ${badgeClass} font-semibold text-sm px-2 py-1 rounded-md`}>
            {searchQuery ? highlightText(roleName, searchTerm) : roleName}
          </span>
          {shouldShowFolders && (
            <button
              onClick={() => toggleFolderExpand(userId, roleName)}
              className="text-gray-600 text-xs hover:text-gray-800 hover:underline transition-colors"
            >
              {folders.length} map{folders.length !== 1 ? 'pen' : ''}
              <span className="ml-1">{isExpanded ? '▲' : '▼'}</span>
            </button>
          )}
        </div>
        {(isExpanded || hasSearchMatch) && shouldShowFolders && (
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
    const isAdmin = isUserAdmin(user);

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
        {canWrite ? (
          <>
            <button
              className="w-[127px] h-10 border-2 border-[#23BD92] rounded-lg font-bold text-[16px] text-[#23BD92] hover:bg-[#23BD92] hover:text-white transition-colors"
              onClick={() => setIsBulkImportModalOpen(true)}
            >
              Bulk import
            </button>
            <AddButton onClick={onMoveToMaken} text="Toevoegen" />
          </>
        ) : (
          <div className="text-gray-500 text-sm italic">Alleen-lezen modus: U heeft geen schrijfrechten</div>
        )}
      </div>

      {/* Filters */}
      <div className="flex h-[60px] bg-[#F9FBFA] items-center justify-between px-2">
        <div className="w-32/99">
          {canWrite ? (
            <DropdownMenu value={bulkAction} onChange={handleBulkAction} allOptions={allBulkActions} />
          ) : (
            <DropdownMenu value="Bulkacties" onChange={() => {}} allOptions={["Bulkacties"]} disabled={true} />
          )}
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
                  {canWrite && (
                    <CheckBox toggle={allSelected} indeterminate={someSelected} onChange={handleSelectAll} color="#23BD92" />
                  )}
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
              const isAdmin = isUserAdmin(user);
              
              return (
                <tr key={user.id} className="border-b border-[#C5BEBE] hover:bg-[#F9FBFA] transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-5">
                      {canWrite && (
                        <CheckBox toggle={selectedUsers.has(user.id)} onChange={(v) => handleUserSelect(user.id, v)} color="#23BD92" />
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {searchQuery ? highlightText(user.Naam, searchQuery) : user.Naam}
                        </span>
                      </div>
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
                        title={isAdmin ? "Beheerders hebben geen documententoegang nodig" : (hasRoles ? "Documenten" : "Geen rollen toegewezen")}
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
                      {canWrite && (
                        <>
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
                        </>
                      )}
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
          allRoles={allAvailableRoles.filter(role => role !== "Beheerder")} 
          selectedUsersCount={selectedUsers.size}
          onConfirm={handleAddRoleConfirm}
        />
      )}
    </div>
  );
}