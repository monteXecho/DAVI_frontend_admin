'use client'
import { useState, useMemo } from "react"
import CheckBox from "@/components/buttons/CheckBox"

export default function AddRoleModal({ 
  folders = [],
  roles = [],
  onClose, 
  onConfirm
}) {
  const [selectedRoles, setSelectedRoles] = useState(new Set())

  // Get roles that don't have ALL selected folders assigned
  const availableRoles = useMemo(() => {
    if (!folders || folders.length === 0) return []
    
    return roles.filter(role => {
      const roleFolders = role.folders || []
      // Role is available if it doesn't have at least one of the selected folders
      return folders.some(folder => !roleFolders.includes(folder))
    })
  }, [roles, folders])

  const handleRoleToggle = (roleName, isSelected) => {
    setSelectedRoles(prev => {
      const newSet = new Set(prev)
      if (isSelected) {
        newSet.add(roleName)
      } else {
        newSet.delete(roleName)
      }
      return newSet
    })
  }

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedRoles(new Set(availableRoles.map(r => r.name || r)))
    } else {
      setSelectedRoles(new Set())
    }
  }

  const allSelected = availableRoles.length > 0 && availableRoles.every(r => 
    selectedRoles.has(r.name || r)
  )
  const someSelected = availableRoles.some(r => selectedRoles.has(r.name || r))

  const handleConfirm = () => {
    if (selectedRoles.size === 0) {
      alert("Selecteer minimaal één rol om toe te voegen.")
      return
    }
    onConfirm(Array.from(selectedRoles))
  }

  return (
    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
      <h2 className="text-xl font-bold text-gray-900 mb-4 font-montserrat">
        Rol toevoegen
      </h2>
      
      {/* Selected folders info */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-2 font-montserrat text-sm">
          Geselecteerde mappen:
        </h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          {folders.map((folder, index) => (
            <div key={index} className="text-blue-700 text-sm font-montserrat">
              • {folder}
            </div>
          ))}
        </div>
      </div>

      {/* Available roles */}
      <div className="mb-6 flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700 font-montserrat text-sm">
            Beschikbare rollen:
          </h3>
          {availableRoles.length > 0 && (
            <div className="flex items-center gap-2">
              <CheckBox 
                toggle={allSelected}
                indeterminate={someSelected && !allSelected}
                onChange={handleSelectAll}
                color="#23BD92"
              />
              <span className="text-xs text-gray-600 font-montserrat">
                Selecteer alles
              </span>
            </div>
          )}
        </div>
        
        {availableRoles.length === 0 ? (
          <div className="text-gray-500 text-sm font-montserrat italic py-4">
            Alle rollen hebben al toegang tot de geselecteerde mappen.
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-y-auto max-h-[300px]">
            <div className="space-y-2">
              {availableRoles.map((role) => {
                const roleName = role.name || role
                const isSelected = selectedRoles.has(roleName)
                const roleFolders = role.folders || []
                const missingFolders = folders.filter(f => !roleFolders.includes(f))
                
                return (
                  <div 
                    key={roleName}
                    className="flex items-start gap-3 p-2 rounded hover:bg-gray-100 transition-colors"
                  >
                    <CheckBox 
                      toggle={isSelected}
                      onChange={(selected) => handleRoleToggle(roleName, selected)}
                      color="#23BD92"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 font-montserrat text-sm">
                        {roleName}
                      </div>
                      {missingFolders.length > 0 && (
                        <div className="text-xs text-gray-500 font-montserrat mt-1">
                          Voegt toe: {missingFolders.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium font-montserrat rounded-lg transition-colors"
        >
          Annuleren
        </button>
        <button
          onClick={handleConfirm}
          disabled={selectedRoles.size === 0}
          className="px-4 py-2 bg-[#23BD92] text-white rounded-lg hover:bg-[#1da67c] disabled:bg-gray-400 disabled:cursor-not-allowed font-medium font-montserrat transition-colors"
        >
          Rol{selectedRoles.size !== 1 ? 'len' : ''} toevoegen ({selectedRoles.size})
        </button>
      </div>
    </div>
  )
}

