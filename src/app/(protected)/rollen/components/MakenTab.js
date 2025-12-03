'use client'

import { useState, useMemo, useEffect } from "react"
import Toggle from "@/components/buttons/Toggle"
import AddIcon from "@/components/icons/AddIcon"
import RedCancelIcon from "@/components/icons/RedCancelIcon"
import SuccessRoleModal from "./modals/SuccessRoleModal"
import DropdownMenu from "@/components/input/DropdownMenu"
import IssueBttn from "@/components/buttons/IssueBttn"

export default function MakenTab({ user, folders, onAddOrUpdateRole }) {
  const [roleName, setRoleName] = useState("")
  const [selectedFolders, setSelectedFolders] = useState([""])
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("") 

  useEffect(() => {
    if (user?.modules) {
      const userModules = Object.entries(user.modules).map(([name, val]) => ({
        name,
        enabled: Boolean(val.enabled),
        locked: !val.enabled,
      }))
      setModules(userModules)
    }
  }, [user])

  useEffect(() => {
    if (folders.length > 0 && selectedFolders[0] === "") {
      setSelectedFolders([folders[0]])
    }
  }, [folders, selectedFolders])

  const editableModules = useMemo(() => modules.filter(m => !m.locked), [modules])

  const allEnabled = useMemo(
    () => editableModules.length > 0 && editableModules.every(m => m.enabled),
    [editableModules]
  )

  const toggleAll = (val) => {
    setModules(prev => prev.map(m => m.locked ? m : { ...m, enabled: val }))
  }

  const toggleOne = (index, val) => {
    const editableIndexes = modules.map((m, i) => !m.locked ? i : -1).filter(i => i !== -1)
    const moduleIndex = editableIndexes[index]
    setModules(prev => prev.map((m, i) => i === moduleIndex ? { ...m, enabled: val } : m))
  }

  const getAvailableFolders = (currentIndex) => {
    const otherSelectedValues = selectedFolders
      .filter((_, index) => index !== currentIndex)
      .filter(Boolean)
    
    return folders.filter(folder => !otherSelectedValues.includes(folder))
  }

  const addFolder = () => {
    const availableFolders = getAvailableFolders(selectedFolders.length)
    const newValue = availableFolders.length > 0 ? availableFolders[0] : ""
    setSelectedFolders(prev => [...prev, newValue])
    setErrorMessage("") 
  }

  const removeFolder = (index) => {
    if (selectedFolders.length > 1) {
      setSelectedFolders(prev => prev.filter((_, i) => i !== index))
    }
    setErrorMessage("") 
  }

  const updateFolder = (index, value) => {
    setSelectedFolders(prev => prev.map((folder, i) => 
      i === index ? value : folder
    ))
    setErrorMessage("") 
  }

  const handleSave = async () => {
    setErrorMessage("")
    
    if (!roleName.trim()) {
      setErrorMessage("Voer een rolnaam in.")
      return
    }

    const cleanFolders = selectedFolders
      .map(f => f.trim())
      .filter(Boolean)
      .map(f => f.replace(/^\/+|\/+$/g, ""))

    if (cleanFolders.length === 0) {
      setErrorMessage("Selecteer ten minste één map.")
      return
    }

    const uniqueFolders = [...new Set(cleanFolders)]
    if (uniqueFolders.length !== cleanFolders.length) {
      setErrorMessage("U heeft dezelfde map meerdere keren geselecteerd.")
      return
    }

    try {
      setLoading(true)
      setErrorMessage("")

      const enabledModules = editableModules
        .filter(m => m.enabled)
        .map(({ name, enabled }) => ({ name, enabled }))

      const result = await onAddOrUpdateRole(roleName, cleanFolders, enabledModules, 'create')
      
      setShowSuccessModal(true)
    } catch (err) {
      if (err.message && err.message.includes("already exists") || 
          err.message && err.message.includes("bestaat al")) {
        setErrorMessage(`Rol '${roleName}' bestaat al. Kies een andere naam.`)
      } else {
        setErrorMessage(err.message || "Er is een fout opgetreden bij het opslaan van de rol.")
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleModalClose = () => {
    setShowSuccessModal(false)
    setRoleName("")
    setSelectedFolders([""])
    setErrorMessage("")
  }

  const handleRoleNameChange = (e) => {
    setRoleName(e.target.value)
    setErrorMessage("")
  }

  return (
    <>
      <div className="flex flex-col w-full gap-11">
        {/* Role Name */}
        <div className="flex flex-col w-full">
          <span className="mb-2 font-montserrat text-[16px]">Rolnaam</span>
          <input
            type="text"
            value={roleName}
            onChange={handleRoleNameChange}
            placeholder="Rolnaam..."
            className="mb-5 w-1/3 h-12 rounded-lg border border-[#D9D9D9] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#23BD92] focus:border-transparent"
          />

          {/* Error Message Display */}
          {errorMessage && (
            <div className="mb-3">
              <IssueBttn text={errorMessage} />
            </div>
          )}

          {/* Folders */}
          <div className="flex flex-col w-full">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-montserrat text-[16px]">Toegang tot map</span>
            </div>
            
            {folders.length === 0 ? (
              <div className="text-gray-500 text-sm mb-4">
                Geen mappen beschikbaar. Voeg eerst mappen toe in het "Mappen" tabblad.
              </div>
            ) : (
              <>
                {selectedFolders.map((folder, index) => {
                  const availableFolders = getAvailableFolders(index)
                  
                  return (
                    <div key={index} className="flex mb-4 gap-3.5 items-center">
                      <div className="w-1/3">
                        <DropdownMenu
                          value={folder}
                          onChange={(value) => updateFolder(index, value)}
                          allOptions={availableFolders}
                          placeholder="Selecteer een map..."
                          className="h-12"
                          disabled={availableFolders.length === 0 && folder !== ""}
                        />
                        {availableFolders.length === 0 && !folder && (
                          <p className="text-sm text-gray-500 mt-1">
                            Alle mappen zijn al geselecteerd
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-1.5">
                        {index === selectedFolders.length - 1 && (
                          <button 
                            onClick={addFolder} 
                            type="button"
                            className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Nieuwe map toevoegen"
                            disabled={availableFolders.length === 0}
                          >
                            <AddIcon />
                          </button>
                        )}
                        {selectedFolders.length > 1 && (
                          <button 
                            onClick={() => removeFolder(index)} 
                            type="button"
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            aria-label="Map verwijderen"
                          >
                            <RedCancelIcon />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>
          
          {/* Selected folders summary */}
          {selectedFolders.filter(f => f).length > 0 && (
            <div className="mt-2 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Geselecteerde mappen:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedFolders
                  .filter(f => f)
                  .map((folder, index) => (
                    <span 
                      key={`${folder}-${index}`}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                    >
                      {folder}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Modules */}
        <div className="flex flex-col w-1/3 gap-10">
          <div className="flex flex-col w-full gap-[23px]">
            <div className="flex w-full items-center justify-between">
              <span className="font-montserrat font-bold text-2xl">AI-modules</span>
              <Toggle
                checked={allEnabled}
                onChange={toggleAll}
                activeColor="#23BD92"
                disabled={editableModules.length === 0}
              />
            </div>

            {editableModules.length > 0 ? (
              editableModules.map((item, index) => (
                <div key={item.name} className="flex w-full items-center justify-between">
                  <span className="font-montserrat text-[16px]">{item.name}</span>
                  <Toggle
                    checked={item.enabled}
                    onChange={(val) => toggleOne(index, val)}
                    activeColor="#23BD92"
                  />
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-sm text-center py-4">
                Geen modules beschikbaar voor uw account
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={loading || selectedFolders.filter(f => f).length === 0 || folders.length === 0}
            className={`w-[95px] h-[50px] rounded-lg font-montserrat font-bold text-base text-white transition-colors ${
              loading || selectedFolders.filter(f => f).length === 0 || folders.length === 0
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-[#23BD92] hover:bg-[#1ea87c]"
            }`}
          >
            {loading ? "Opslaan..." : "Opslaan"}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center mb-[120px] xl:mb-0 bg-black/50"
          onClick={handleModalClose}
        >
          <div className="p-6 w-fit" onClick={(e) => e.stopPropagation()}>
            <SuccessRoleModal roleName={roleName} onClose={handleModalClose} />
          </div>
        </div>
      )}
    </>
  )
}