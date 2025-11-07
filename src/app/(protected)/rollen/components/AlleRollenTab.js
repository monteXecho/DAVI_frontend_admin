'use client'

import { useState, useMemo } from 'react'
import AddButton from '@/components/buttons/AddButton'
import CheckBox from '@/components/buttons/CheckBox'
import SearchBox from '@/components/input/SearchBox'
import DropdownMenu from '@/components/input/DropdownMenu'
import EditIcon from '@/components/icons/EditIcon'
import RedCancelIcon from '@/components/icons/RedCancelIcon'
import DeleteRoleModal from './modals/DeleteRoleModal'
import SortableHeader from '@/components/SortableHeader'
import { useSortableData } from '@/lib/useSortableData'

export default function AlleRollenTab({ roles = [], onDeleteRoles, onMoveToMaken, onEditRole }) {
  const allOptions = ['Bulkacties', 'Verwijderen']
  const [selectedBulkAction, setSelectedBulkAction] = useState(allOptions[0])
  const [search, setSearch] = useState('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState(new Set())
  const [deleteMode, setDeleteMode] = useState('single')

  const { items: sortedRoles, requestSort, sortConfig } = useSortableData(roles)

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

  const handleRoleSelect = (roleName, isSelected) => {
    setSelectedRoles(prev => {
      const newSelected = new Set(prev)
      if (isSelected) {
        newSelected.add(roleName)
      } else {
        newSelected.delete(roleName)
      }
      return newSelected
    })
  }

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      const allFilteredRoleNames = new Set(filteredRoles.map(role => role.name))
      setSelectedRoles(allFilteredRoleNames)
    } else {
      setSelectedRoles(new Set())
    }
  }

  const allSelected = filteredRoles.length > 0 && filteredRoles.every(role => selectedRoles.has(role.name))

  const someSelected = filteredRoles.some(role => selectedRoles.has(role.name)) && !allSelected

  const handleBulkAction = (action) => {
    setSelectedBulkAction(action)
    
    if (action === 'Verwijderen') {
      if (selectedRoles.size > 0) {
        setDeleteMode('bulk')
        setIsDeleteModalOpen(true)
      } else {
        alert('Selecteer eerst rollen om te verwijderen.')
        setSelectedBulkAction('Bulkacties')
      }
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
      alert('Failed to delete roles. Please try again.')
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
    if (onEditRole) {
      onEditRole(role)
    }
  }

  const getSelectedRolesData = () => {
    return Array.from(selectedRoles).map(roleName => 
      roles.find(role => role.name === roleName)
    ).filter(Boolean)
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
      </div>

      {/* Header controls */}
      <div className="flex w-full h-[60px] bg-[#F9FBFA] items-center justify-between px-4">
        <div className="flex w-2/3 gap-4">
          <div className="w-1/3">
            <DropdownMenu 
              value={selectedBulkAction} 
              onChange={handleBulkAction} 
              allOptions={allOptions} 
            />
          </div>

          <div className="w-1/3">
            <SearchBox
              placeholderText="Zoek rol, map..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <AddButton onClick={() => onMoveToMaken()} text="Toevoegen" />
      </div>

      {/* Roles Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#F9FBFA]">
            <tr className="h-[51px] border-b border-[#C5BEBE]">
              <SortableHeader 
                sortKey="name" 
                onSort={requestSort} 
                currentSort={sortConfig}
              >
                <div className="flex items-center gap-3">
                  <CheckBox 
                    toggle={allSelected} 
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                    color="#23BD92" 
                  />
                  Rol
                </div>
              </SortableHeader>

              <SortableHeader 
                sortKey="user_count" 
                onSort={requestSort} 
                currentSort={sortConfig}
                align="center"
              >
                Gebruikers
              </SortableHeader>

              <SortableHeader 
                sortKey="document_count" 
                onSort={requestSort} 
                currentSort={sortConfig}
                align="center"
              >
                Documenten
              </SortableHeader>

              <th className="px-4 py-2 font-montserrat font-bold text-[16px] text-black">
                <div className="flex items-center gap-3">
                  Mappen
                </div>
              </th>

              <th className="px-4 py-2 w-[52px]" />
            </tr>
          </thead>

          <tbody>
            {filteredRoles.map((role) => (
              <tr
                key={role.name}
                className="h-[51px] border-b border-[#C5BEBE] hover:bg-[#F9FBFA] transition-colors"
              >
                <td className="px-4 py-2 font-montserrat text-[16px] text-black font-normal">
                  <div className="flex items-center gap-3">
                    <CheckBox 
                      toggle={selectedRoles.has(role.name)} 
                      onChange={(isSelected) => handleRoleSelect(role.name, isSelected)}
                      color="#23BD92" 
                    />
                    {role.name}
                  </div>
                </td>

                <td className="px-4 py-2 font-montserrat text-[16px] text-black font-normal text-center">
                  {role.user_count ?? 0}
                </td>

                <td className="px-4 py-2 font-montserrat text-[16px] text-black font-normal text-center">
                  {role.document_count ?? 0}
                </td>

                <td className="flex flex-col px-4 py-2 font-montserrat text-[16px] text-black font-normal">
                  {role.folders?.map((folder, index) => (
                    <span key={index}>{folder}</span>
                  ))}
                </td>

                <td className="px-4 py-2 h-full">
                  <div className='flex items-center gap-3'>
                    <button
                      aria-label={`Edit ${role.name}`}
                      className="hover:opacity-80 transition-opacity"
                      onClick={() => handleEditClick(role)}
                    >
                      <EditIcon />
                    </button>
                    <button
                      aria-label={`Delete ${role.name}`}
                      className="hover:opacity-80 transition-opacity"
                      onClick={() => handleDeleteClick(role)}
                    >
                      <RedCancelIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRoles.length === 0 && (
          <div className="p-6 text-center text-gray-500 font-montserrat">
            {search ? 'Geen rollen gevonden voor deze zoekopdracht.' : 'Geen rollen gevonden.'}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
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