'use client'

import { useState, useMemo } from "react"
import Toggle from "@/components/buttons/Toggle"
import AddIcon from "@/components/icons/AddIcon"
import RedCancelIcon from "@/components/icons/RedCancelIcon"

const initialModules = [
  { name: "Documentenchat", enabled: true },
  { name: "Vaste gezichten criterium", enabled: true },
  { name: "3-uursregeling check", enabled: true },
  { name: "BKR check", enabled: true },
]

export default function MakenTab({ onAddOrUpdateRole }) {
  const [roleName, setRoleName] = useState("")
  const [folders, setFolders] = useState(["/beleid", "/kwaliteit/bkr"])
  const [modules, setModules] = useState(initialModules)
  const [loading, setLoading] = useState(false)

  const allEnabled = useMemo(() => modules.every(m => m.enabled), [modules])

  const toggleAll = (val) => {
    setModules(prev => prev.map(m => ({ ...m, enabled: val })))
  }

  const toggleOne = (index, val) => {
    setModules(prev =>
      prev.map((m, i) => (i === index ? { ...m, enabled: val } : m))
    )
  }

  const addFolder = () => {
    setFolders(prev => [...prev, ""])
  }

  const removeFolder = (index) => {
    setFolders(prev => prev.filter((_, i) => i !== index))
  }

  const updateFolder = (index, value) => {
    setFolders(prev => prev.map((f, i) => (i === index ? value : f)))
  }

  const handleSave = async () => {
    if (!roleName.trim()) {
      alert("Voer een rolnaam in.") // “Enter a role name”
      return
    }

    const cleanFolders = folders
      .map(f => f.trim())
      .filter(Boolean)
      .map(f => f.replace(/^\/+|\/+$/g, "")) // strip slashes

    try {
      setLoading(true)
      await onAddOrUpdateRole(roleName, cleanFolders)
      alert(`Rol "${roleName}" succesvol opgeslagen!`)
      setRoleName("")
    } catch (err) {
      alert("Er is een fout opgetreden bij het opslaan van de rol.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col w-full gap-11">
      <div className="flex flex-col w-full">
        <span className="mb-2 font-montserrat font-normal text-[16px]">
          Rolnaam
        </span>
        <input
          type="text"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          placeholder="Bijv. Beheerder"
          className="mb-5 w-1/3 h-12 rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none"
        />

        <span className="mb-2 font-montserrat font-normal text-[16px]">
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

      <div className="flex flex-col w-1/3 gap-10">
        <div className="flex flex-col w-full gap-[23px]">
          <div className="flex w-full items-center justify-between">
            <span className="font-montserrat font-bold text-2xl">
              AI-modules
            </span>
            <Toggle checked={allEnabled} onChange={toggleAll} activeColor="#23BD92" />
          </div>

          {modules.map((item, index) => (
            <div key={item.name} className="flex w-full items-center justify-between">
              <span className="font-montserrat font-normal text-[16px]">
                {item.name}
              </span>
              <Toggle
                checked={item.enabled}
                onChange={(val) => toggleOne(index, val)}
                activeColor="#23BD92"
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className={`w-[95px] h-[50px] rounded-[8px] font-montserrat font-bold text-base leading-[100%] text-white text-center ${
            loading ? "bg-gray-400" : "bg-[#23BD92]"
          }`}
        >
          {loading ? "Opslaan..." : "Opslaan"}
        </button>
      </div>
    </div>
  )
}
