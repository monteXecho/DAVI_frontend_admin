'use client'
import { useEffect, useState, useMemo } from "react"
import DropdownMenu from "@/components/input/DropdownMenu"
import SuccessBttn from "@/components/buttons/SuccessBttn"
import RedCancelIcon from "@/components/icons/RedCancelIcon"
import AddIcon from "@/components/icons/AddIcon"

export default function WijzigenTab({ user, roles = [], onUpdateUser, loading }) {
   const allRoles = useMemo(
    () => roles.map((r) => (r?.name ?? r?.role ?? String(r))).filter(Boolean),
    [roles]
  )

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [updatedRoles, setUpdatedRoles] = useState([]) // current roles being edited
  const [selected, setSelected] = useState("") // value shown in dropdown
  const [isSaving, setIsSaving] = useState(false)

  // Initialize updatedRoles from incoming `user` (defensive about types)
  useEffect(() => {
    if (!user) {
      setUpdatedRoles([])
      setFirstName("")
      setLastName("")
      setEmail("")
      setSelected("")
      return
    }

    const [first, ...rest] = (user.Naam || "").split(" ")
    const last = rest.join(" ")

    setFirstName(first || "")
    setLastName(last || "")
    setEmail(user.Email || "")

    // normalize user.Rol to array of strings
    let userRoles = []
    if (Array.isArray(user.Rol)) {
      userRoles = user.Rol.filter(Boolean).map((r) => String(r))
    } else if (user.Rol) {
      userRoles = [String(user.Rol)]
    }
    setUpdatedRoles(userRoles)
    // reset selected — we will set a sensible default below
    setSelected("")
  }, [user])

  // Compute available roles = allRoles minus updatedRoles
  const availableRoles = useMemo(() => {
    const setAssigned = new Set(updatedRoles)
    return allRoles.filter((r) => !setAssigned.has(r))
  }, [allRoles, updatedRoles])

  // Auto-select a default only when we don't already have a valid selection.
  // We do NOT override a user-chosen selected value.
  useEffect(() => {
    if (!selected) {
      // prefer first unassigned role
      if (availableRoles.length > 0) {
        setSelected(availableRoles[0])
      } else {
        // fallback: if no available roles, clear selection
        setSelected("")
      }
    } else {
      // If selected is present but no longer valid (e.g. removed from availableRoles),
      // keep it only if it's still a valid option. Otherwise pick the first available.
      const stillValid = availableRoles.includes(selected)
      if (!stillValid) {
        if (availableRoles.length > 0) setSelected(availableRoles[0])
        else setSelected("")
      }
    }
    // We intentionally include `selected` so if selected is changed elsewhere we don't
    // immediately overwrite it.
  }, [availableRoles, selected])

  // Remove a role from assigned list
  const handleRemoveRole = (role) => {
    setUpdatedRoles((prev) => {
      const next = prev.filter((r) => r !== role)
      return next
    })

    // If nothing selected, set the removed role as selected (makes it easy to re-add),
    // otherwise keep selection as-is. This is optional UX — adjust if you prefer.
    if (!selected) setSelected(role)
  }

  // Add selected role into assigned list
  const handleAddRole = () => {
    if (!selected) return
    // Protect against duplicates (shouldn't happen because dropdown shows only available)
    setUpdatedRoles((prev) => {
      if (prev.includes(selected)) return prev
      return [...prev, selected]
    })

    // compute next selection (next available role after adding)
    const nextAvailable = availableRoles.filter((r) => r !== selected)
    setSelected(nextAvailable.length > 0 ? nextAvailable[0] : "")
  }

  // Save handler - sends assigned_roles in payload
  const handleSave = async () => {
    if (!user) return
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      alert("Vul alle verplichte velden in.")
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        id: user.id,
        name: `${firstName} ${lastName}`.trim(),
        email: email.trim(),
        assigned_roles: updatedRoles, // backend expects this field
      }

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
            <span className="mb-2 font-montserrat text-[16px]">Voornaam</span>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Carsten"
              className="mb-5 h-12 rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none"
            />
          </div>
          <div className="flex flex-col w-1/2">
            <span className="mb-2 font-montserrat text-[16px]">Achternaam</span>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Altena"
              className="mb-5 h-12 rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none"
            />
          </div>
        </div>

        {/* Roles section */}
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
                // show available roles, but if none available show an empty array (disabled add)
                allOptions={availableRoles}
                // NOTE: if DropdownMenu expects a placeholder when allOptions empty,
                // it should handle empty array gracefully.
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

        {/* Email + Reset Password */}
        <span className="mt-[23px] font-montserrat text-[16px]">E-mail adres</span>
        <div className="mt-2 flex gap-[14px] items-center">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="info@creeert.net"
            className="w-1/3 h-12 rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none"
          />
          <div className="relative">
            <button
              type="button"
              className="w-fit h-[40px] flex items-center py-[15px] px-[13px] border-[2px] border-[#23BD92] rounded-[8px] font-bold text-[16px] leading-[100%] text-[#23BD92]"
              onClick={() => alert("Wachtwoord reset link verzonden!")}
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
        className={`w-[110px] h-[50px] rounded-[8px] font-montserrat font-bold text-base text-white ${
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
