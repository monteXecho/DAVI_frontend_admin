'use client'

import { useEffect, useMemo, useState } from "react"
import Toggle from "@/components/buttons/Toggle"
import DropdownMenu from "@/components/input/DropdownMenu"
import AddIcon from "@/components/icons/AddIcon"
import RedCancelIcon from "@/components/icons/RedCancelIcon"
import { useApi } from "@/lib/useApi"

export default function WijzigenTab() {
  const { getRoles, addOrUpdateRole, deleteRole } = useApi()

  const [roles, setRoles] = useState([])
  const [selected, setSelected] = useState("")
  const [folders, setFolders] = useState(["/beleid"])
  const [modules, setModules] = useState([
    { name: "Documentenchat", enabled: true },
    { name: "Vaste gezichten criterium", enabled: false },
    { name: "3-uursregeling check", enabled: true },
    { name: "BKR check", enabled: false },
  ])

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const allEnabled = useMemo(() => modules.every(m => m.enabled), [modules])

  // ✅ Fetch roles on mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true)
        const res = await getRoles()
        const roleNames = res?.roles?.map(r => r.name) || []
        setRoles(roleNames)
        if (roleNames.length > 0) setSelected(roleNames[0])
      } catch (err) {
        console.error("Failed to load roles:", err)
        setError("Kon de rollen niet laden.")
      } finally {
        setLoading(false)
      }
    }
    fetchRoles()
  }, [getRoles])

  // --- Folder management ---
  const addFolder = () => setFolders(prev => [...prev, ""])
  const removeFolder = (index) => setFolders(prev => prev.filter((_, i) => i !== index))
  const updateFolder = (index, value) =>
    setFolders(prev => prev.map((f, i) => (i === index ? value : f)))

  // --- Toggle management ---
  const toggleAll = (val) => setModules(prev => prev.map(m => ({ ...m, enabled: val })))
  const toggleOne = (index, val) =>
    setModules(prev => prev.map((m, i) => (i === index ? { ...m, enabled: val } : m)))

  // --- Save updated role ---
  const handleSave = async () => {
    if (!selected) {
      setError("Selecteer eerst een rol.")
      return
    }

    try {
      setSaving(true)
      const cleanFolders = folders.map(f => f.trim()).filter(Boolean)
      await addOrUpdateRole(selected, cleanFolders)
      alert(`Rol "${selected}" is bijgewerkt.`)
    } catch (err) {
      console.error("Error updating role:", err)
      setError("Er is iets misgegaan bij het opslaan.")
    } finally {
      setSaving(false)
    }
  }

  // --- Delete role ---
  const handleDeleteRole = async () => {
    if (!selected) return alert("Geen rol geselecteerd.")
    if (!confirm(`Weet je zeker dat je de rol "${selected}" wilt verwijderen?`)) return

    try {
      setLoading(true)
      await deleteRole(selected)
      alert(`Rol "${selected}" is verwijderd.`)
      setRoles(prev => prev.filter(r => r !== selected))
      setSelected(prev => (roles.length > 1 ? roles.find(r => r !== prev) || "" : ""))
    } catch (err) {
      console.error("Error deleting role:", err)
      setError("Kon de rol niet verwijderen.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-11 w-full">
      {/* --- Role selection --- */}
      <div className="flex flex-col w-full">
        <span className="mb-2 font-montserrat text-[16px]">Rolnaam</span>
        <div className="flex gap-[14px] items-center mb-5">
          <div className="w-1/3">
            {loading ? (
              <div className="text-gray-500 text-sm">Laden...</div>
            ) : (
              <DropdownMenu
                value={selected}
                onChange={setSelected}
                allOptions={roles}
              />
            )}
          </div>

          {/* Delete role button */}
          <button onClick={handleDeleteRole} type="button">
            <RedCancelIcon />
          </button>
        </div>

        {/* --- Folders section --- */}
        <span className="mb-2 font-montserrat text-[16px]">
          Toegang tot map/document
        </span>

        {folders.map((folder, index) => (
          <div key={index} className="flex mb-4 gap-[14px] items-center">
            <input
              type="text"
              value={folder}
              onChange={(e) => updateFolder(index, e.target.value)}
              placeholder="//beleid"
              className="w-1/3 h-12 rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none"
            />
            <div className="flex gap-[6px]">
              <button onClick={addFolder} type="button">
                <AddIcon />
              </button>
              {folders.length > 1 && (
                <button onClick={() => removeFolder(index)} type="button">
                  <RedCancelIcon />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* --- AI modules section --- */}
      <div className="flex flex-col w-1/3 gap-10">
        <div className="flex flex-col gap-[23px]">
          <div className="flex w-full items-center justify-between">
            <span className="font-montserrat font-bold text-2xl">AI-modules</span>
            <Toggle checked={allEnabled} onChange={toggleAll} activeColor="#23BD92" />
          </div>

          {modules.map((item, index) => (
            <div key={item.name} className="flex w-full items-center justify-between">
              <span className="font-montserrat text-[16px]">{item.name}</span>
              <Toggle
                checked={item.enabled}
                onChange={(val) => toggleOne(index, val)}
                activeColor="#23BD92"
              />
            </div>
          ))}
        </div>

        {/* --- Save button --- */}
        <button
          disabled={saving || loading}
          onClick={handleSave}
          className={`w-[95px] h-[50px] rounded-[8px] font-montserrat font-bold text-base text-white ${
            saving || loading ? "bg-gray-400" : "bg-[#23BD92]"
          }`}
        >
          {saving ? "Opslaan..." : "Opslaan"}
        </button>

        {error && <div className="text-red-500 text-sm font-medium mt-2">{error}</div>}
      </div>
    </div>
  )
}
