'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AddButton from '@/components/buttons/AddButton'
import CheckBox from '@/components/buttons/CheckBox'
import SearchBox from '@/components/input/SearchBox'
import DropdownMenu from '@/components/input/DropdownMenu'
import EditIcon from '@/components/icons/EditIcon'
import RedCancelIcon from '@/components/icons/RedCancelIcon'
import DeleteRoleModal from './modals/DeleteRoleModal'
import SortableHeader from '@/components/SortableHeader'
import { useSortableData } from '@/lib/useSortableData'

export default function AlleRollenTab({ roles = [], users = [], user: currentUser, onDeleteRoles, onMoveToMaken, onEditRole, canWrite = true }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlRole = searchParams.get('role')
  
  const allOptions = ['Bulkacties', 'Verwijderen']
  const [selectedBulkAction, setSelectedBulkAction] = useState(allOptions[0])
  const [search, setSearch] = useState('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState(new Set())
  const [deleteMode, setDeleteMode] = useState('single')
  const [expandedFolders, setExpandedFolders] = useState(new Set())
  const [selectedRoleFromUrl, setSelectedRoleFromUrl] = useState(null)

  // Add Admin and Teamlid roles if applicable
  const enhancedRoles = useMemo(() => {
    const enhanced = [...roles]
    
    if (!currentUser || !currentUser.user_id) {
      return enhanced
    }
    
    const currentAdminId = currentUser.user_id
    
    // Check if there are admins added by current admin
    // Only show if there are admins with added_by_admin_id matching current admin's user_id
    const addedAdmins = users.filter(u => u.type === "admin" && u.added_by_admin_id === currentAdminId)
    if (addedAdmins.length > 0) {
      enhanced.push({
        name: "Admin",
        folders: [],
        user_count: addedAdmins.length,
        document_count: 0,
        isSpecial: true,
        type: "admin"
      })
    }
    
    // Check if there are teamlid users/admins assigned by current admin
    // Check guest_access where created_by = currentAdminId, or users with is_teamlid = true
    const teamlidUsers = users.filter(u => u.is_teamlid === true)
    if (teamlidUsers.length > 0) {
      enhanced.push({
        name: "Teamlid",
        folders: [],
        user_count: teamlidUsers.length,
        document_count: 0,
        isSpecial: true,
        type: "teamlid"
      })
    }
    
    return enhanced
  }, [roles, users, currentUser])

  const { items: sortedRoles, requestSort, sortConfig } = useSortableData(enhancedRoles)

  useEffect(() => {
    if (urlRole) {
      const role = roles.find(r => r.name === urlRole)
      if (role) {
        setSelectedRoleFromUrl(role)
        console.log(`Role from URL: ${urlRole}`, role)
      }
    } else {
      setSelectedRoleFromUrl(null)
    }
  }, [urlRole, roles])

  const filteredRoles = useMemo(() => {
    const lowerSearch = search.toLowerCase()
    return sortedRoles.filter((r) => {
      const matchName = r.name.toLowerCase().includes(lowerSearch)

      const matchFolder = r.folders?.some(folder =>
        folder.toLowerCase().includes(lowerSearch)
      )

      return matchName || matchFolder
    })
  }, [sortedRoles, search])

  const handleUserCountClick = (role) => {
    if (role.user_count > 0) {
      // For special roles (Admin, Teamlid), use special handling
      if (role.isSpecial && role.type === "admin") {
        router.push(`/gebruikers?role=Beheerder`)
      } else if (role.isSpecial && role.type === "teamlid") {
        router.push(`/gebruikers?role=Teamlid`)
      } else {
        router.push(`/gebruikers?role=${encodeURIComponent(role.name)}`)
      }
    }
  }

  const handleDocumentCountClick = (role) => {
    if (role.document_count > 0) {
      router.push(`/documenten?role=${encodeURIComponent(role.name)}`)
    }
  }

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

  const toggleFolderExpand = (roleName) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      newSet.has(roleName) ? newSet.delete(roleName) : newSet.add(roleName)
      return newSet
    })
  }

  const renderFolders = (role) => {
    // Special roles (Admin, Teamlid) don't have folders
    if (role.isSpecial) {
      return <span className="text-gray-400 text-sm italic">-</span>
    }
    
    const folders = role.folders || []
    const isExpanded = expandedFolders.has(role.name)
    const hasSearchMatch = search && folders.some(folder => 
      folder.toLowerCase().includes(search.toLowerCase())
    )

    if (folders.length === 0) {
      return <span className="text-gray-400 text-sm italic">Geen mappen</span>
    }

    if (folders.length === 1) {
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className={`inline-block ${hasSearchMatch ? 'bg-yellow-100 border border-yellow-300' : 'bg-[#23BD92]/10'} text-[#23BD92] font-semibold text-sm px-2 py-1 rounded-md`}>
              {search ? highlightText(folders[0], search) : folders[0]}
            </span>
          </div>
        </div>
      )
    }

    const visibleFolders = isExpanded ? folders : [folders[0]]
    const hiddenFoldersCount = folders.length - 1

    return (
      <div className="flex flex-col gap-2">
        {/* Visible folders */}
        <div className="flex flex-col gap-2">
          {visibleFolders.map((folder, index) => {
            const folderMatches = search && folder.toLowerCase().includes(search.toLowerCase());
            return (
              <div key={index} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className={`inline-block ${folderMatches ? 'bg-yellow-100 border border-yellow-300' : 'bg-[#23BD92]/10'} text-[#23BD92] font-semibold text-sm px-2 py-1 rounded-md`}>
                    {search ? highlightText(folder, search) : folder}
                  </span>
                </div>
                {/* Folder details could go here if needed, similar to role folders */}
              </div>
            );
          })}
        </div>

        {/* Expand/Collapse button - same style as GebruikersTab */}
        {folders.length > 1 && !search.trim() && (
          <div className="flex items-center">
            <button
              onClick={() => toggleFolderExpand(role.name)}
              className="flex items-center gap-1 text-[#23BD92] text-sm font-medium hover:text-[#1da67c] transition-colors"
            >
              <span>
                {isExpanded 
                  ? `Minder tonen` 
                  : `+${hiddenFoldersCount} meer map${hiddenFoldersCount !== 1 ? 'pen' : ''}`
                }
              </span>
              <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
          </div>
        )}
      </div>
    )
  }

  const handleRoleSelect = (roleName, isSelected) => {
    setSelectedRoles(prev => {
      const newSet = new Set(prev)
      if (isSelected) newSet.add(roleName)
      else newSet.delete(roleName)
      return newSet
    })
  }

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      // Only select non-special roles (exclude Admin and Teamlid)
      const allFilteredNames = new Set(filteredRoles.filter(r => !r.isSpecial).map(r => r.name))
      setSelectedRoles(allFilteredNames)
    } else {
      setSelectedRoles(new Set())
    }
  }

  const allSelected =
    filteredRoles.length > 0 &&
    filteredRoles.every(role => selectedRoles.has(role.name))

  const someSelected =
    filteredRoles.some(role => selectedRoles.has(role.name)) && !allSelected

  const handleBulkAction = (action) => {
    setSelectedBulkAction(action)

    if (action === 'Verwijderen') {
      if (selectedRoles.size === 0) {
        alert('Selecteer eerst rollen om te verwijderen.')
        setSelectedBulkAction('Bulkacties')
        return
      }

      setDeleteMode('bulk')
      setIsDeleteModalOpen(true)
    }
  }

  const handleDeleteConfirm = async () => {
    try {
      if (onDeleteRoles && selectedRoles.size > 0) {
        await onDeleteRoles(Array.from(selectedRoles))
        setSelectedRoles(new Set())
      }
    } catch (err) {
      console.error('Failed to delete roles:', err)
      alert('Failed to delete roles. Probeer opnieuw.')
    } finally {
      setIsDeleteModalOpen(false)
      setSelectedBulkAction('Bulkacties')
    }
  }

  const handleDeleteClick = (role) => {
    setSelectedRoles(new Set([role.name]))
    setDeleteMode('single')
    setIsDeleteModalOpen(true)
  }

  const handleEditClick = (role) => {
    if (onEditRole) onEditRole(role)
  }

  const getSelectedRolesData = () => {
    return Array.from(selectedRoles)
      .map(name => roles.find(r => r.name === name))
      .filter(Boolean)
  }

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="mb-[29px] font-montserrat font-extrabold text-[18px] leading-[100%]">
        {filteredRoles.length} rol{filteredRoles.length !== 1 ? 'len' : ''}
        {selectedRoles.size > 0 && (
          <span className="ml-2 text-gray-600">
            ({selectedRoles.size} geselecteerd)
          </span>
        )}
        {selectedRoleFromUrl && (
          <span className="ml-2 text-[#23BD92] font-semibold">
            • Gefilterd op: {selectedRoleFromUrl.name}
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="flex w-full h-[60px] bg-[#F9FBFA] items-center justify-between px-4">
        <div className="flex w-2/3 gap-4">
          <div className="w-1/3">
            {canWrite ? (
              <DropdownMenu
                value={selectedBulkAction}
                onChange={handleBulkAction}
                allOptions={allOptions}
              />
            ) : (
              <DropdownMenu
                value="Bulkacties"
                onChange={() => {}}
                allOptions={["Bulkacties"]}
                disabled={true}
              />
            )}
          </div>

          <div className="w-1/3">
            <SearchBox
              placeholderText="Zoek rol, map..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {canWrite && <AddButton onClick={() => onMoveToMaken()} text="Toevoegen" />}
        {!canWrite && <div className="text-gray-500 text-sm italic">Alleen-lezen modus: U heeft geen schrijfrechten</div>}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#F9FBFA]">
            <tr className="h-[51px] border-b border-[#C5BEBE]">
              <SortableHeader
                sortKey="name"
                onSort={requestSort}
                currentSort={sortConfig}
                className="px-4 py-2"
              >
                <div className="flex items-center gap-3">
                  {canWrite && (
                    <CheckBox
                      toggle={allSelected}
                      indeterminate={someSelected}
                      onChange={handleSelectAll}
                      color="#23BD92"
                    />
                  )}
                  Rol
                </div>
              </SortableHeader>

              <SortableHeader
                sortKey="user_count"
                onSort={requestSort}
                currentSort={sortConfig}
                align="center"
                className="px-4 py-2"
              >
                Gebruikers
              </SortableHeader>

              <SortableHeader
                sortKey="document_count"
                onSort={requestSort}
                currentSort={sortConfig}
                align="center"
                className="px-4 py-2"
              >
                Documenten
              </SortableHeader>

              {/* Folders column */}
              <th className="px-4 py-2 font-montserrat font-bold text-[16px] text-black">
                Mappen
              </th>

              <th className="px-4 py-2 w-[100px] text-center">
                Acties
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredRoles.map((role) => (
              <tr
                key={role.name}
                className={`h-[51px] border-b border-[#C5BEBE] hover:bg-[#F9FBFA] transition-colors ${
                  selectedRoleFromUrl && role.name === selectedRoleFromUrl.name ? 'bg-[#23BD92]/10' : ''
                }`}
              >
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3 font-montserrat text-[16px] text-black">
                    {canWrite && !role.isSpecial && (
                      <CheckBox
                        toggle={selectedRoles.has(role.name)}
                        onChange={(sel) => handleRoleSelect(role.name, sel)}
                        color="#23BD92"
                      />
                    )}
                    {canWrite && role.isSpecial && (
                      <CheckBox
                        toggle={false}
                        onChange={() => {}}
                        color="#23BD92"
                        disabled={true}
                      />
                    )}
                    {!canWrite && <div className="w-5" />}
                    {search ? highlightText(role.name, search) : role.name}
                  </div>
                </td>

                <td className="px-4 py-2 text-center font-montserrat text-[16px] text-black">
                  <button
                    onClick={() => handleUserCountClick(role)}
                    className={`transition-colors ${
                      role.user_count > 0 
                        ? 'hover:underline cursor-pointer' 
                        : 'cursor-default'
                    }`}
                    disabled={role.user_count === 0}
                    title={role.user_count > 0 ? `Bekijk gebruikers voor ${role.name}` : 'Geen gebruikers'}
                  >
                    {role.user_count ?? 0}
                  </button>
                </td>

                <td className="px-4 py-2 text-center font-montserrat text-[16px] text-black">
                  <button
                    onClick={() => handleDocumentCountClick(role)}
                    className={`transition-colors ${
                      role.document_count > 0 
                        ? 'hover:underline cursor-pointer' 
                        : 'cursor-default'
                    }`}
                    disabled={role.document_count === 0}
                    title={role.document_count > 0 ? `Bekijk documenten voor ${role.name}` : 'Geen documenten'}
                  >
                    {role.document_count ?? 0}
                  </button>
                </td>

                <td className="px-4 py-2 font-montserrat text-[16px] text-black">
                  {renderFolders(role)}
                </td>

                <td className="px-4 py-2">
                  <div className="flex justify-center items-center gap-3">
                    {canWrite && !role.isSpecial && (
                      <>
                        <button
                          className="hover:opacity-80 transition-opacity"
                          onClick={() => handleEditClick(role)}
                          title="Bewerken"
                        >
                          <EditIcon />
                        </button>

                        <button
                          className="hover:opacity-80 transition-opacity"
                          onClick={() => handleDeleteClick(role)}
                          title="Verwijderen"
                        >
                          <RedCancelIcon />
                        </button>
                      </>
                    )}
                    {role.isSpecial && (
                      <span className="text-xs text-gray-400 italic">-</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRoles.length === 0 && (
          <div className="p-6 text-center text-gray-500 font-montserrat">
            {search
              ? 'Geen rollen gevonden voor deze zoekopdracht.'
              : 'Geen rollen gevonden.'}
          </div>
        )}
      </div>

      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center mb-[120px] xl:mb-0 bg-black/50"
          onClick={() => {
            setIsDeleteModalOpen(false)
            setSelectedBulkAction('Bulkacties')
          }}
        >
          <div className="p-6 w-fit" onClick={(e) => e.stopPropagation()}>
            <DeleteRoleModal
              roles={getSelectedRolesData()}
              onClose={() => {
                setIsDeleteModalOpen(false)
                setSelectedBulkAction('Bulkacties')
              }}
              onConfirm={handleDeleteConfirm}
              isMultiple={selectedRoles.size > 1}
            />
          </div>
        </div>
      )}
    </div>
  )
}

