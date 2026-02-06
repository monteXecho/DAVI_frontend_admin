'use client'

import { useEffect, useMemo, useState } from "react"
import Toggle from "@/components/buttons/Toggle"
import DropdownMenu from "@/components/input/DropdownMenu"
import AddIcon from "@/components/icons/AddIcon"
import RedCancelIcon from "@/components/icons/RedCancelIcon"

export default function WijzigenTab({ roles = [], folders, onAddOrUpdateRole, onDeleteRoles, selectedRole, user, canWrite = true }) {
  const [roleNames, setRoleNames] = useState([])
  const [selected, setSelected] = useState("")
  const [selectedFolders, setSelectedFolders] = useState([""])
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [initialized, setInitialized] = useState(false)

  const availableModules = useMemo(() => {
    // Use company_modules if available, otherwise fall back to user.modules
    // Company modules determine what's available for roles
    const modulesSource = user?.company_modules || user?.modules || [];
    
    // Modules that should not be assignable to company roles (admin-only)
    const adminOnlyModules = ['Admin Dashboard', 'Webcrawler', 'Nextcloud', 'Nexcloud'];
    
    if (Array.isArray(modulesSource)) {
      // If it's an array (from company_modules serialized format)
      return modulesSource
        .filter(module => !adminOnlyModules.includes(module.name))
        .map(module => ({
          name: module.name,
          enabled: Boolean(module.enabled),
          locked: !module.enabled,  // Lock modules that company doesn't have enabled
        }))
    } else if (typeof modulesSource === 'object') {
      // If it's an object (from user.modules)
      return Object.entries(modulesSource)
        .filter(([name]) => !adminOnlyModules.includes(name))
        .map(([name, config]) => ({
          name,
          enabled: Boolean(config.enabled),
          locked: !config.enabled
        }))
    }
    return []
  }, [user])

  useEffect(() => {
    const roleList = roles.map(r => r.name)
    setRoleNames(roleList)

    if (!initialized) {
      if (selectedRole) {
        setSelected(selectedRole.name)
        setSelectedFolders(selectedRole.folders || [""])
      } else if (roleList.length > 0) {
        setSelected(roleList[0])
      }
      setInitialized(true)
    }
  }, [roles, selectedRole, initialized])

  useEffect(() => {
    if (!selected) return

    const currentRole = roles.find(r => r.name === selected)
    if (!currentRole) return

    setSelectedFolders(currentRole.folders?.length > 0 ? currentRole.folders : [""])

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

  // Get available folders for a specific dropdown (excluding already selected ones)
  const getAvailableFolders = (currentIndex) => {
    const otherSelectedValues = selectedFolders
      .filter((_, index) => index !== currentIndex)
      .filter(Boolean)
    
    return folders.filter(folder => !otherSelectedValues.includes(folder))
  }

  const addFolder = () => {
    // When adding a new folder, auto-select the first available folder if there is one
    const availableFolders = getAvailableFolders(selectedFolders.length)
    const newValue = availableFolders.length > 0 ? availableFolders[0] : ""
    setSelectedFolders(prev => [...prev, newValue])
  }

  const removeFolder = (index) => {
    if (selectedFolders.length > 1) {
      setSelectedFolders(prev => prev.filter((_, i) => i !== index))
    }
  }

  const updateFolder = (index, value) => {
    setSelectedFolders(prev => prev.map((folder, i) => 
      i === index ? value : folder
    ))
  }

  // Check for duplicate folders
  useEffect(() => {
    const cleaned = selectedFolders
      .map(f => f.trim())
      .filter(Boolean)
      .map(f => f.replace(/^\/+|\/+$/g, ""))

    const hasDuplicate = cleaned.some(
      (f, i) => f && cleaned.indexOf(f) !== i
    )

    if (hasDuplicate) {
      setError("Foldernamen moeten uniek zijn.")
    } else {
      setError("")
    }
  }, [selectedFolders])

  const editableModules = useMemo(() => modules.filter(m => !m.locked), [modules])

  const allEnabled = useMemo(() => {
    return editableModules.length > 0 && editableModules.every(m => m.enabled)
  }, [editableModules])

  const toggleAll = val => {
    setModules(prev =>
      prev.map(m => (m.locked ? m : { ...m, enabled: val }))
    )
  }

  const toggleOne = (index, val) => {
    const editableIndexes = modules.map((m, i) => !m.locked ? i : -1).filter(i => i !== -1)
    const moduleIndex = editableIndexes[index]
    setModules(prev =>
      prev.map((m, i) => (i === moduleIndex ? { ...m, enabled: val } : m))
    )
  }

  const handleSave = async () => {
    if (!canWrite) {
      setError("U heeft geen toestemming om rollen te wijzigen.")
      return
    }
    if (error) return

    if (!selected) {
      setError("Selecteer eerst een rol.")
      return
    }

    const cleanFolders = selectedFolders
      .map(f => f.trim())
      .filter(Boolean)
      .map(f => f.replace(/^\/+|\/+$/g, ""))

    if (cleanFolders.length === 0) {
      setError("Selecteer ten minste één map.")
      return
    }

    try {
      setSaving(true)
      setError("")

      const allModules = editableModules.map(({ name, enabled }) => ({ name, enabled }))

      await onAddOrUpdateRole(selected, cleanFolders, allModules, 'update')
      alert(`Rol "${selected}" is bijgewerkt.`)
    } catch (err) {
      console.error("Error updating role:", err)
      setError("Er is iets misgegaan bij het opslaan.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRole = async () => {
    if (!canWrite) {
      alert("U heeft geen toestemming om rollen te verwijderen.")
      return
    }
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

          {canWrite && (
            <button 
              onClick={handleDeleteRole} 
              type="button"
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Rol verwijderen"
            >
              <RedCancelIcon />
            </button>
          )}
        </div>

        {/* Folders Section */}
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-montserrat text-[16px]">Toegang tot map</span>
          </div>
          
          {folders.length === 0 ? (
            <div className="text-gray-500 text-sm mb-4">
              Geen mappen beschikbaar. Voeg eerst mappen toe in het &quot;Mappen&quot; tabblad.
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
          
          {/* Selected folders summary */}
          {selectedFolders.filter(f => f).length > 0 && (
            <div className="mt-2 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">
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
          disabled={saving || loading || !canWrite || !!error || selectedFolders.filter(f => f).length === 0 || folders.length === 0}
          onClick={handleSave}
          className={`w-[95px] h-[50px] rounded-lg font-montserrat font-bold text-base text-white transition-colors ${
            saving || loading || !canWrite || error || selectedFolders.filter(f => f).length === 0 || folders.length === 0
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-[#23BD92] hover:bg-[#1ea87c]"
          }`}
        >
          {saving ? "Opslaan..." : "Opslaan"}
        </button>

        {error && <div className="text-red-500 text-sm font-medium mt-2">{error}</div>}
      </div>
    </div>
  )
}