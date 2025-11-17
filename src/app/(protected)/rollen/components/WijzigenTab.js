'use client'

import { useEffect, useMemo, useState } from "react"
import Toggle from "@/components/buttons/Toggle"
import DropdownMenu from "@/components/input/DropdownMenu"
import AddIcon from "@/components/icons/AddIcon"
import RedCancelIcon from "@/components/icons/RedCancelIcon"

export default function WijzigenTab({ roles = [], onAddOrUpdateRole, onDeleteRoles, selectedRole, user }) {
  const [roleNames, setRoleNames] = useState([])
  const [selected, setSelected] = useState("")
  const [folders, setFolders] = useState([""])
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [initialized, setInitialized] = useState(false)

  // Available modules based on user's account
  const availableModules = useMemo(() => {
    if (!user?.modules) return []
    return Object.entries(user.modules).map(([name, config]) => ({
      name,
      enabled: Boolean(config.enabled),
      locked: !config.enabled
    }))
  }, [user])

  // Initialize roles
  useEffect(() => {
    const roleList = roles.map(r => r.name)
    setRoleNames(roleList)

    if (!initialized) {
      if (selectedRole) {
        setSelected(selectedRole.name)
        setFolders(selectedRole.folders || [""])
      } else if (roleList.length > 0) {
        setSelected(roleList[0])
      }
      setInitialized(true)
    }
  }, [roles, selectedRole, initialized])

  // Update folders & modules when selected role changes
  useEffect(() => {
    if (!selected) return

    const currentRole = roles.find(r => r.name === selected)
    if (!currentRole) return

    setFolders(currentRole.folders?.length > 0 ? currentRole.folders : [""])

    const roleModules = currentRole.modules || {}
    const merged = availableModules.map(available => {
      const roleModule = roleModules[available.name]
      const enabledInRole = roleModule
        ? roleModule.enabled === true || roleModule.enabled === "true"
        : false

      return {
        name: available.name,
        locked: available.locked,
        enabled: available.locked ? false : enabledInRole
      }
    })

    setModules(merged)
  }, [selected, roles, availableModules])

  // Folder duplicated validation
  useEffect(() => {
    const cleaned = folders.map(f =>
      f.trim().replace(/^\/+|\/+$/g, "")
    )

    const hasDuplicate = cleaned.some(
      (f, i) => f && cleaned.indexOf(f) !== i
    )

    if (hasDuplicate) {
      setError("Foldernamen moeten uniek zijn.")
    } else {
      setError("")
    }
  }, [folders])

  // Folder helpers
  const addFolder = () => setFolders(prev => [...prev, ""])
  const removeFolder = (index) =>
    setFolders(prev => prev.filter((_, i) => i !== index))
  const updateFolder = (index, value) =>
    setFolders(prev => prev.map((f, i) => (i === index ? value : f)))

  // Only editable (non-locked) modules
  const editableModules = useMemo(() => modules.filter(m => !m.locked), [modules])

  // All enabled calculation for editable modules
  const allEnabled = useMemo(() => {
    return editableModules.length > 0 && editableModules.every(m => m.enabled)
  }, [editableModules])

  // Toggle all editable modules
  const toggleAll = val => {
    setModules(prev =>
      prev.map(m => (m.locked ? m : { ...m, enabled: val }))
    )
  }

  // Toggle single editable module
  const toggleOne = (index, val) => {
    const editableIndexes = modules.map((m, i) => !m.locked ? i : -1).filter(i => i !== -1)
    const moduleIndex = editableIndexes[index]
    setModules(prev =>
      prev.map((m, i) => (i === moduleIndex ? { ...m, enabled: val } : m))
    )
  }

  // Save role
  const handleSave = async () => {
    if (error) return

    if (!selected) {
      setError("Selecteer eerst een rol.")
      return
    }

    try {
      setSaving(true)
      setError("")

      const cleanFolders = folders
        .map(f => f.trim())
        .filter(Boolean)
        .map(f => f.replace(/^\/+|\/+$/g, ""))

      const allModules = editableModules.map(({ name, enabled }) => ({ name, enabled }))

      await onAddOrUpdateRole(selected, cleanFolders, allModules)
      alert(`Rol "${selected}" is bijgewerkt.`)
    } catch (err) {
      console.error("Error updating role:", err)
      setError("Er is iets misgegaan bij het opslaan.")
    } finally {
      setSaving(false)
    }
  }

  // Delete role
  const handleDeleteRole = async () => {
    if (!selected) return alert("Geen rol geselecteerd.")
    if (!confirm(`Weet je zeker dat je de rol "${selected}" wilt verwijderen?`)) return

    try {
      setLoading(true)
      await onDeleteRoles(selected)
      alert(`Rol "${selected}" is verwijderd.`)

      setRoleNames(prev => prev.filter(r => r !== selected))
      setSelected(prev => {
        const remaining = roleNames.filter(r => r !== prev)
        return remaining[0] || ""
      })
    } catch (err) {
      console.error("Error deleting role:", err)
      setError("Kon de rol niet verwijderen.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-11 w-full">
      <div className="flex flex-col w-full">
        <span className="mb-2 font-montserrat text-[16px]">Rolnaam</span>

        <div className="flex gap-3.5 items-center mb-5">
          <div className="w-1/3">
            {loading ? (
              <div className="text-gray-500 text-sm">Laden...</div>
            ) : (
              <DropdownMenu value={selected} onChange={setSelected} allOptions={roleNames} />
            )}
          </div>

          <button onClick={handleDeleteRole} type="button">
            <RedCancelIcon />
          </button>
        </div>

        <span className="mb-2 font-montserrat text-[16px]">Toegang tot map</span>

        {folders.map((folder, index) => (
          <div key={index} className="flex mb-4 gap-3.5 items-center">
            <input
              type="text"
              value={folder}
              onChange={e => updateFolder(index, e.target.value)}
              placeholder="//beleid"
              className="w-1/3 h-12 rounded-lg border border-[#D9D9D9] px-4 py-3 focus:outline-none"
            />
            <div className="flex gap-1.5">
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

      <div className="flex flex-col w-1/3 gap-10">
        <div className="flex flex-col gap-[23px]">
          <div className="flex w-full items-center justify-between">
            <span className="font-montserrat font-bold text-2xl">AI-modules</span>

            <Toggle
              checked={allEnabled}
              onChange={toggleAll}
              activeColor="#23BD92"
              disabled={editableModules.length === 0}
            />
          </div>

          {editableModules.length === 0 && (
            <div className="text-gray-500 text-sm text-center py-4">
              Geen modules beschikbaar voor uw account
            </div>
          )}

          {editableModules.map((item, index) => (
            <div key={item.name} className="flex w-full items-center justify-between">
              <span className="font-montserrat text-[16px]">{item.name}</span>
              <Toggle
                checked={item.enabled}
                onChange={val => toggleOne(index, val)}
                activeColor="#23BD92"
              />
            </div>
          ))}
        </div>

        <button
          disabled={saving || loading || editableModules.length === 0 || !!error}
          onClick={handleSave}
          className={`w-[95px] h-[50px] rounded-lg font-montserrat font-bold text-base text-white ${
            saving || loading || error ? "bg-gray-400" : "bg-[#23BD92]"
          }`}
        >
          {saving ? "Opslaan..." : "Opslaan"}
        </button>

        {error && <div className="text-red-500 text-sm font-medium mt-2">{error}</div>}
      </div>
    </div>
  )
}
