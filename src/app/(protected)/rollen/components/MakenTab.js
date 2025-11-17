'use client'

import { useState, useMemo, useEffect } from "react"
import Toggle from "@/components/buttons/Toggle"
import AddIcon from "@/components/icons/AddIcon"
import RedCancelIcon from "@/components/icons/RedCancelIcon"
import SuccessRoleModal from "./modals/SuccessRoleModal"

export default function MakenTab({ user, onAddOrUpdateRole }) {
  const [roleName, setRoleName] = useState("")
  const [folders, setFolders] = useState(["/beleid", "/kwaliteit"])
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Initialize modules from user account
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

  // Filtered editable modules
  const editableModules = useMemo(() => modules.filter(m => !m.locked), [modules])

  // "Select all" toggle state
  const allEnabled = useMemo(
    () => editableModules.length > 0 && editableModules.every(m => m.enabled),
    [editableModules]
  )

  // Toggle all editable modules
  const toggleAll = (val) => {
    setModules(prev => prev.map(m => m.locked ? m : { ...m, enabled: val }))
  }

  // Toggle single module
  const toggleOne = (index, val) => {
    const editableIndexes = modules.map((m, i) => !m.locked ? i : -1).filter(i => i !== -1)
    const moduleIndex = editableIndexes[index]
    setModules(prev => prev.map((m, i) => i === moduleIndex ? { ...m, enabled: val } : m))
  }

  // Folder helpers
  const addFolder = () => setFolders(prev => [...prev, ""])
  const removeFolder = (index) => setFolders(prev => prev.filter((_, i) => i !== index))
  const updateFolder = (index, value) => setFolders(prev => prev.map((f, i) => i === index ? value : f))

  // Save role
  const handleSave = async () => {
    if (!roleName.trim()) {
      alert("Voer een rolnaam in.")
      return
    }

    const cleanFolders = folders
      .map(f => f.trim())
      .filter(Boolean)
      .map(f => f.replace(/^\/+|\/+$/g, ""))

    try {
      setLoading(true)

      const enabledModules = editableModules
        .filter(m => m.enabled)
        .map(({ name, enabled }) => ({ name, enabled }))

      await onAddOrUpdateRole(roleName, cleanFolders, enabledModules)
      setShowSuccessModal(true)
    } catch (err) {
      alert("Er is een fout opgetreden bij het opslaan van de rol.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleModalClose = () => {
    setShowSuccessModal(false)
    setRoleName("")
    setFolders(["/beleid", "/kwaliteit"])
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
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="Bijv. Beheerder"
            className="mb-5 w-1/3 h-12 rounded-lg border border-[#D9D9D9] px-4 py-3 focus:outline-none"
          />

          {/* Folders */}
          <span className="mb-2 font-montserrat text-[16px]">Toegang tot map</span>
          {folders.map((folder, index) => (
            <div key={index} className="flex mb-4 gap-3.5 items-center">
              <input
                type="text"
                value={folder}
                onChange={(e) => updateFolder(index, e.target.value)}
                placeholder="//beleid"
                className="w-1/3 h-12 rounded-lg border border-[#D9D9D9] px-4 py-3 focus:outline-none"
              />
              <div className="flex gap-1.5">
                <button onClick={addFolder} type="button"><AddIcon /></button>
                {folders.length > 1 && (
                  <button onClick={() => removeFolder(index)} type="button">
                    <RedCancelIcon />
                  </button>
                )}
              </div>
            </div>
          ))}
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
            disabled={loading}
            className={`w-[95px] h-[50px] rounded-lg font-montserrat font-bold text-base text-white ${
              loading ? "bg-gray-400" : "bg-[#23BD92]"
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
