'use client'

import { useState, useMemo, useEffect } from "react"
import Toggle from "@/components/buttons/Toggle"
import AddIcon from "@/components/icons/AddIcon"
import RedCancelIcon from "@/components/icons/RedCancelIcon"
import SuccessRoleModal from "./modals/SuccessRoleModal"

const defaultModules = [
  { name: "Documenten chat", enabled: true, locked: false },
  { name: "GGD Checks", enabled: true, locked: false },
]

export default function MakenTab({ user, onAddOrUpdateRole }) {
  const [roleName, setRoleName] = useState("")
  const [folders, setFolders] = useState(["/beleid", "/kwaliteit"])
  const [modules, setModules] = useState(defaultModules)
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

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

  const allEnabled = useMemo(() => {
    const editable = modules.filter((m) => !m.locked)
    return editable.length > 0 && editable.every((m) => m.enabled)
  }, [modules])

  const toggleAll = (val) => {
    setModules((prev) =>
      prev.map((m) =>
        m.locked ? m : { ...m, enabled: val }
      )
    )
  }

  const toggleOne = (index, val) => {
    setModules((prev) =>
      prev.map((m, i) =>
        i === index && !m.locked ? { ...m, enabled: val } : m
      )
    )
  }

  const addFolder = () => setFolders((prev) => [...prev, ""])
  const removeFolder = (index) => setFolders((prev) => prev.filter((_, i) => i !== index))
  const updateFolder = (index, value) =>
    setFolders((prev) => prev.map((f, i) => (i === index ? value : f)))

  const handleSave = async () => {
    if (!roleName.trim()) {
      alert("Voer een rolnaam in.")
      return
    }

    const cleanFolders = folders
      .map((f) => f.trim())
      .filter(Boolean)
      .map((f) => f.replace(/^\/+|\/+$/g, ""))

    try {
      setLoading(true)
      
      const enabledModules = modules
        .filter(module => module.enabled && !module.locked)
        .map(({ name, enabled }) => ({ name, enabled }))
      
      console.log("Sending enabled modules: ", enabledModules)
      
      await onAddOrUpdateRole(roleName, cleanFolders, enabledModules)
      setShowSuccessModal(true)
    } catch (err) {
      alert("Er is een fout opgetreden bij het opslaan van de rol.")
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
        <div className="flex flex-col w-full">
          <span className="mb-2 font-montserrat text-[16px]">Rolnaam</span>
          <input
            type="text"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="Bijv. Beheerder"
            className="mb-5 w-1/3 h-12 rounded-lg border border-[#D9D9D9] px-4 py-3 focus:outline-none"
          />

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

        <div className="flex flex-col w-1/3 gap-10">
          <div className="flex flex-col w-full gap-[23px]">
            <div className="flex w-full items-center justify-between">
              <span className="font-montserrat font-bold text-2xl">AI-modules</span>
              <Toggle
                checked={allEnabled}
                onChange={toggleAll}
                activeColor="#23BD92"
              />
            </div>

            {modules
              .filter(module => module.enabled || !module.locked) 
              .map((item, index) => (
                <div
                  key={item.name}
                  className="flex w-full items-center justify-between"
                >
                  <span
                    className={`font-montserrat text-[16px] ${
                      item.locked ? "text-gray-400" : ""
                    }`}
                  >
                    {item.name}
                  </span>
                  <Toggle
                    checked={item.enabled}
                    onChange={(val) => toggleOne(index, val)}
                    activeColor="#23BD92"
                    disabled={item.locked}
                  />
                </div>
              ))}
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