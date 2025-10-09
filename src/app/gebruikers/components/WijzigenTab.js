'use client'
import { useEffect, useState } from "react"
import DropdownMenu from "@/components/input/DropdownMenu"

export default function WijzigenTab({ user, onUpdateUser, loading }) {
  const allOptions = ["Beheerder", "MP’er"]

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [selected, setSelected] = useState(allOptions[0])
  const [isSaving, setIsSaving] = useState(false)

  // ✅ Prefill form when user changes
  useEffect(() => {
    if (user) {
      const [first, last] = (user.Naam || "").split(" ")
      setFirstName(first || "")
      setLastName(last || "")
      setEmail(user.Email || "")
      setSelected(user.Rol === "Beheerder" ? "Beheerder" : "MP’er")
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      alert("Vul alle verplichte velden in.")
      return
    }

    setIsSaving(true)
    try {
      const updatedUser = {
        id: user.id,
        name: `${firstName} ${lastName}`.trim(),
        email: email.trim(),
        company_role: selected === "Beheerder" ? "company_admin" : "company_user",
      }
      await onUpdateUser(updatedUser)
      alert("Gebruiker succesvol bijgewerkt!")
      setFirstName("")
      setLastName("")
      setEmail("")

    } catch (err) {
      console.error("Update failed:", err)
      alert("Fout bij het bijwerken van de gebruiker.")
    } finally {
      setIsSaving(false)
    }
  }

  if (!user)
    return <div className="text-gray-500">Geen gebruiker geselecteerd om te wijzigen.</div>

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

        {/* Role */}
        <span className="mb-2 font-montserrat text-[16px]">Rol</span>
        <div className="w-1/3">
          <DropdownMenu value={selected} onChange={setSelected} allOptions={allOptions} />
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
