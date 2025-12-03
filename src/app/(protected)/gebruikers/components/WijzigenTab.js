'use client'
import { useEffect, useState, useMemo } from "react"
import DropdownMenu from "@/components/input/DropdownMenu"
import SuccessBttn from "@/components/buttons/SuccessBttn"
import RedCancelIcon from "@/components/icons/RedCancelIcon"
import AddIcon from "@/components/icons/AddIcon"

export default function WijzigenTab({ user, roles = [], onUpdateUser, loading, onResetPass }) {
  const allRoles = useMemo(
    () => roles.map((r) => (r?.name ?? r?.role ?? String(r))).filter(Boolean),
    [roles]
  )
  
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [updatedRoles, setUpdatedRoles] = useState([]) 
  const [selected, setSelected] = useState("") 
  const [isSaving, setIsSaving] = useState(false)

  const isAdmin = useMemo(() => {
    if (!user) return false
    
    const userRoles = user.roles || user.Rol || []
    const hasBeheerderRole = Array.isArray(userRoles) 
      ? userRoles.includes("Beheerder")
      : userRoles === "Beheerder"
    
    return hasBeheerderRole
  }, [user])

  useEffect(() => {
    if (!user) {
      setUpdatedRoles([])
      setName("")
      setEmail("")
      setSelected("")
      return
    }

    setName(user.Naam)
    setEmail(user.Email || "")

    let userRoles = []
    if (Array.isArray(user.Rol)) {
      userRoles = user.Rol.filter(Boolean).map((r) => String(r))
    } else if (user.Rol) {
      userRoles = [String(user.Rol)]
    }
    setUpdatedRoles(userRoles)
    setSelected("")
  }, [user])

  const availableRoles = useMemo(() => {
    if (isAdmin) return [] 
    const setAssigned = new Set(updatedRoles)
    return allRoles.filter((r) => !setAssigned.has(r))
  }, [allRoles, updatedRoles, isAdmin])

  useEffect(() => {
    if (!selected) {
      if (availableRoles.length > 0) {
        setSelected(availableRoles[0])
      } else {
        setSelected("")
      }
    } else {
      const stillValid = availableRoles.includes(selected)
      if (!stillValid) {
        if (availableRoles.length > 0) setSelected(availableRoles[0])
        else setSelected("")
      }
    }
  }, [availableRoles, selected])

  const handleRemoveRole = (role) => {
    setUpdatedRoles((prev) => {
      const next = prev.filter((r) => r !== role)
      return next
    })

    if (!selected) setSelected(role)
  }

  const handleAddRole = () => {
    if (!selected) return
    setUpdatedRoles((prev) => {
      if (prev.includes(selected)) return prev
      return [...prev, selected]
    })

    const nextAvailable = availableRoles.filter((r) => r !== selected)
    setSelected(nextAvailable.length > 0 ? nextAvailable[0] : "")
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const userType = isAdmin ? "admin" : "user"
      
      const payload = {
        id: user.id,
        name: name.trim(),
        email: email.trim(),
        assigned_roles: updatedRoles,
        user_type: userType 
      }
      console.log(' --- Updted admin data --- :', payload)
      await onUpdateUser(payload)
      alert("Gebruiker succesvol bijgewerkt!")
    } catch (err) {
      console.error("Update failed:", err)
      alert("Fout bij het bijwerken van de gebruiker.")
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) {
    return <div className="text-gray-500">Geen gebruiker geselecteerd om te wijzigen.</div>
  }

  return (
    <div className="flex flex-col w-full gap-11">
      <div className="flex flex-col w-full">
        {/* Name fields */}
        <div className="flex w-2/3 gap-4">
          <div className="flex flex-col w-1/2">
            <span className="mb-2 font-montserrat text-[16px]">Voor- en achternaam</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Carsten Altena"
              className="mb-5 h-12 rounded-lg border border-[#D9D9D9] px-4 py-3 focus:outline-none"
            />
          </div>
        </div>

        {/* Roles section - Only show for non-admin users */}
        {!isAdmin && (
          <div className="flex flex-col gap-2">
            <span className="font-montserrat text-[16px]">Rol</span>

            <div className="flex flex-wrap gap-3 mt-2">
              {updatedRoles.length > 0 ? (
                updatedRoles.map((r, i) => (
                  <div key={r + i} className="flex items-center gap-2">
                    <SuccessBttn text={r} />
                    <button
                      onClick={() => handleRemoveRole(r)}
                      aria-label={`Remove ${r}`}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <RedCancelIcon />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 italic">Geen rollen toegewezen</div>
              )}
            </div>

            {/* Add new role */}
            <div className="flex gap-2 mt-4 items-center">
              <div className="w-1/3">
                <DropdownMenu
                  value={selected}
                  onChange={setSelected}
                  allOptions={availableRoles}
                  disabled={availableRoles.length === 0}
                />
              </div>

              <button
                onClick={handleAddRole}
                aria-label="Add role"
                className={`hover:opacity-80 transition-opacity ${availableRoles.length === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                disabled={availableRoles.length === 0}
              >
                <AddIcon />
              </button>
            </div>
          </div>
        )}

        {/* Email + Reset Password */}
        <span className="mt-[23px] font-montserrat text-[16px]">E-mail adres</span>
        <div className="mt-2 flex gap-[14px] items-center">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="info@creeert.net"
            className="w-1/3 h-12 rounded-lg border border-[#D9D9D9] px-4 py-3 focus:outline-none"
          />
          <div className="relative">
            <button
              type="button"
              className="w-fit h-[40px] flex items-center py-[15px] px-[13px] border-[2px] border-[#23BD92] rounded-lg font-bold text-[16px] leading-[100%] text-[#23BD92]"
              onClick={() => onResetPass(email)}
            >
              Wachtwoord resetten
            </button>
            <span className="w-[300px] absolute right-[-110px] top-12 font-montserrat text-[15px] text-gray-600">
              De gebruiker zal gevraagd worden om <br />
              een sterk wachtwoord te bedenken.
            </span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        disabled={isSaving || loading}
        onClick={handleSave}
        className={`w-[110px] h-[50px] rounded-lg font-montserrat font-bold text-base text-white ${
          isSaving || loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#23BD92] hover:bg-[#1fa87c]"
        }`}
      >
        {isSaving ? "Opslaan..." : "Opslaan"}
      </button>
    </div>
  )
}