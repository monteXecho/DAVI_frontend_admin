'use client'
import { useState, useMemo } from "react"
import DropdownMenu from "@/components/input/DropdownMenu"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export default function MakenTab({ roles = [], onAddUser }) {
  const allRoles = useMemo(
    () => roles.map((r) => (r?.name ?? r?.role ?? String(r))).filter(Boolean),
    [roles]
  )

  const allOptions = useMemo(
    () => ["Beheerder", ...allRoles],
    [allRoles]
)

  const [selected, setSelected] = useState(allOptions[0])
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!email.trim()) {
      toast.warning("Voer een geldig e-mailadres in.")
      return
    }

    const isBeheerder = selected === "Beheerder"
    const company_role = isBeheerder ? "company_admin" : "company_user"
    const assigned_role = isBeheerder ? "" : selected 

    try {
      setLoading(true)
      if (onAddUser) {
        await onAddUser(email.trim(), company_role, assigned_role)
      }

      toast.success(`Gebruiker toegevoegd als ${selected}`)

      setEmail("")
      setSelected(allOptions[0])
    } catch (err) {
      console.error("Failed to add user:", err)
      toast.error("Er is een fout opgetreden bij het toevoegen van de gebruiker.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col w-full gap-11">
      <div className="flex flex-col w-full">
        <span className="mb-2 font-montserrat font-normal text-[16px] leading-normal tracking-normal">
          Rol
        </span>
        <div className="w-1/3">
          <DropdownMenu
            value={selected}
            onChange={setSelected}
            allOptions={allOptions}
          />
        </div>

        <span className="mt-[23px] font-montserrat font-normal text-[16px] leading-normal tracking-normal">
          E-mail adres
        </span>
        <div className="mt-2 flex gap-[14px] items-center">
          <input
            type="text"
            placeholder="info@creeert.net"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-1/3 h-12 rounded-lg border border-[#D9D9D9] px-4 py-3 focus:outline-none"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className={`w-[95px] h-[50px] rounded-lg font-montserrat font-bold text-base leading-[100%] tracking-normal text-center text-white ${
          loading
            ? "bg-[#1e9c79]/70 cursor-not-allowed"
            : "bg-[#23BD92] hover:bg-[#1e9c79]"
        }`}
      >
        {loading ? "Opslaan..." : "Opslaan"}
      </button>

      <ToastContainer position="top-right" />
    </div>
  )
}
