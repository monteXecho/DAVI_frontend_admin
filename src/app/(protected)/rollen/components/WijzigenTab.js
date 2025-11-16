'use client'

import { useEffect, useMemo, useState } from "react"
import Toggle from "@/components/buttons/Toggle"
import DropdownMenu from "@/components/input/DropdownMenu"
import AddIcon from "@/components/icons/AddIcon"
import RedCancelIcon from "@/components/icons/RedCancelIcon"

export default function WijzigenTab({ roles, onAddOrUpdateRole, onDeleteRoles, selectedRole, user }) {
  const [roleNames, setRoleNames] = useState([])
  const [selected, setSelected] = useState("")
  const [folders, setFolders] = useState([""])
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const availableModules = useMemo(() => {
    if (!user?.modules) return []
    
    return Object.entries(user.modules).map(([name, config]) => ({
      name,
      enabled: Boolean(config.enabled),
      locked: !config.enabled 
    }))
  }, [user])

  const allEnabled = useMemo(() => {
    const editable = modules.filter((m) => !m.locked)
    return editable.length > 0 && editable.every((m) => m.enabled)
  }, [modules])

  useEffect(() => {
    const roleList = roles?.map(r => r.name) || []
    setRoleNames(roleList)
    
    if (selectedRole) {
      setSelected(selectedRole.name)
      setFolders(selectedRole.folders || [""])
    } else if (roleList.length > 0 && !selected) {
      setSelected(roleList[0])
    }
  }, [roles, selected, selectedRole]) 

  useEffect(() => {
    if (selected && roles.length > 0) {
      const currentRole = roles.find(r => r.name === selected)
      
      if (currentRole) {
        setFolders(currentRole.folders?.length > 0 ? currentRole.folders : [""])
        
        const roleModules = currentRole.modules || {}
        
        const mergedModules = availableModules.map(availableModule => {
          const roleModuleConfig = roleModules[availableModule.name]
          const isEnabledInRole = roleModuleConfig ? 
            (typeof roleModuleConfig.enabled === 'string' ? 
              roleModuleConfig.enabled.toLowerCase() === 'true' : 
              Boolean(roleModuleConfig.enabled)) 
            : false
          
          
          return {
            name: availableModule.name,
            enabled: isEnabledInRole,
            locked: availableModule.locked
          }
        })
        
        setModules(mergedModules)
      }
    } else {
      const defaultModules = availableModules.map(module => ({
        ...module,
        enabled: false 
      }))
      setModules(defaultModules)
    }
  }, [selected, roles, availableModules])

  const addFolder = () => setFolders(prev => [...prev, ""])
  const removeFolder = (index) => setFolders(prev => prev.filter((_, i) => i !== index))
  const updateFolder = (index, value) =>
    setFolders(prev => prev.map((f, i) => (i === index ? value : f)))

  const toggleAll = (val) => {
    setModules(prev => prev.map(m => 
      m.locked ? m : { ...m, enabled: val }
    ))
  }

  const toggleOne = (index, val) => {
    setModules(prev => prev.map((m, i) =>
      i === index && !m.locked ? { ...m, enabled: val } : m
    ))
  }

  const handleSave = async () => {
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
      
      const allModules = modules.map(({ name, enabled }) => ({ 
        name, 
        enabled: enabled 
      }))
      
      
      await onAddOrUpdateRole(selected, cleanFolders, allModules)
      alert(`Rol "${selected}" is bijgewerkt.`)
    } catch (err) {
      console.error("Error updating role:", err)
      setError("Er is iets misgegaan bij het opslaan.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRole = async () => {
    if (!selected) return alert("Geen rol geselecteerd.")
    if (!confirm(`Weet je zeker dat je de rol "${selected}" wilt verwijderen?`)) return

    try {
      setLoading(true)
      await onDeleteRoles(selected)
      alert(`Rol "${selected}" is verwijderd.`)
      setRoleNames(prev => prev.filter(r => r !== selected))
      setSelected(prev => (roleNames.length > 1 ? roleNames.find(r => r !== prev) || "" : ""))
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
              <DropdownMenu
                value={selected}
                onChange={setSelected}
                allOptions={roleNames}
              />
            )}
          </div>

          <button onClick={handleDeleteRole} type="button">
            <RedCancelIcon />
          </button>
        </div>

        <span className="mb-2 font-montserrat text-[16px]">
          Toegang tot map
        </span>

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
              disabled={modules.filter(m => !m.locked).length === 0}
            />
          </div>

          {modules
            .filter(module => module.enabled || !module.locked) // Only show enabled or unlocked modules
            .map((item, index) => (
              <div key={item.name} className="flex w-full items-center justify-between">
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
          
          {modules.filter(module => module.enabled || !module.locked).length === 0 && (
            <div className="text-gray-500 text-sm text-center py-4">
              Geen modules beschikbaar voor uw account
            </div>
          )}
        </div>

        <button
          disabled={saving || loading || modules.length === 0}
          onClick={handleSave}
          className={`w-[95px] h-[50px] rounded-lg font-montserrat font-bold text-base text-white ${
            saving || loading || modules.length === 0 ? "bg-gray-400" : "bg-[#23BD92]"
          }`}
        >
          {saving ? "Opslaan..." : "Opslaan"}
        </button>

        {error && <div className="text-red-500 text-sm font-medium mt-2">{error}</div>}
      </div>
    </div>
  )
}