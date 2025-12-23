'use client'
import { useState, useMemo } from "react"
import DropdownMenu from "@/components/input/DropdownMenu"
import { ToastContainer, toast } from "react-toastify"
import Toggle from "@/components/buttons/Toggle"
import "react-toastify/dist/ReactToastify.css"

export default function MakenTab({ roles = [], onAddUser, onAssignTeamlidPermissions, canWrite = true }) {
  const allRoles = useMemo(
    () => roles.map((r) => (r?.name ?? r?.role ?? String(r))).filter(Boolean),
    [roles]
  )

  const allOptions = useMemo(
    () => ["Beheerder", "Teamlid", ...allRoles],
    [allRoles]
  )

  const [selected, setSelected] = useState(allOptions[0])
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Team permissions states - only for Teamlid role
  const [roleFolderPermission, setRoleFolderPermission] = useState(false)
  const [userPermission, setUserPermission] = useState(false)
  const [documentPermission, setDocumentPermission] = useState(false)

  const handleSave = async () => {
    if (!canWrite) {
      toast.error("U heeft geen toestemming om gebruikers toe te voegen.")
      return
    }
    
    if (!email.trim()) {
      toast.warning("Voer een geldig e-mailadres in.")
      return
    }

    let company_role = "company_user"
    if (selected === "Beheerder") {
      company_role = "company_admin"
    } else if (selected === "Teamlid") {
      company_role = "team_member"
    }
    
    const assigned_role = (selected === "Beheerder" || selected === "Teamlid") 
      ? "" 
      : selected

    const team_permissions = selected === "Teamlid" ? {
      role_folder_modify_permission: roleFolderPermission,
      user_create_modify_permission: userPermission,
      document_modify_permission: documentPermission
    } : undefined

    try {
      setLoading(true)
      if (onAddUser && selected !== "Teamlid") {
        await onAddUser(email.trim(), company_role, assigned_role)
      } else if (onAssignTeamlidPermissions && selected === "Teamlid") {
        await onAssignTeamlidPermissions(email.trim(), team_permissions)
      }

      toast.success(`Gebruiker toegevoegd als ${selected}`)

      setEmail("")
      setSelected(allOptions[0])
      setRoleFolderPermission(false)
      setUserPermission(false)
      setDocumentPermission(false)
    } catch (err) {
      console.error("Failed to add user:", err)
      toast.error("De rol van teamlid kan alleen aan een bestaande gebruiker worden toegevoegd.")
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
        <div className="mt-2 flex gap-3.5 items-center">
          <input
            type="text"
            placeholder="E-mail adres..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-1/3 h-12 rounded-lg border border-[#D9D9D9] px-4 py-3 focus:outline-none"
          />
        </div>
      </div>

      {/* Conditional Teamlid Permissions Section */}
      {selected === "Teamlid" && (
        <div className="flex flex-col w-fit gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="font-montserrat font-semibold text-lg text-gray-700 mb-2">
            Teamlid Permissies
          </h3>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="w-1/3 font-montserrat font-medium text-gray-800">
                Rollen-Mappen
              </span>
              <Toggle
                checked={roleFolderPermission}
                onChange={setRoleFolderPermission}
                activeColor="#23BD92"
              />
              <span className="font-montserrat text-sm text-gray-600 w-1/3">
                {roleFolderPermission ? "Maken en wijzigen" : "Alleen lezen"} 
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-1/3 font-montserrat font-medium text-gray-800">
                Gebruikers
              </span>
              <Toggle
                checked={userPermission}
                onChange={setUserPermission}
                activeColor="#23BD92"
              />
              <span className="font-montserrat text-sm text-gray-600 w-1/3">
                {userPermission ? "Maken en wijzigen" : "Alleen lezen"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-1/3 font-montserrat font-medium text-gray-800">
                Documenten
              </span>
              <Toggle
                checked={documentPermission}
                onChange={setDocumentPermission}
                activeColor="#23BD92"
              />
              <span className="font-montserrat text-sm text-gray-600 w-1/3">
                {documentPermission ? "Maken en wijzigen" : "Alleen lezen"}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-2">
            Deze permissies zijn alleen van toepassing op gebruikers met de &apos;Teamlid&apos; rol.
          </p>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={loading || !canWrite}
        className={`w-[95px] h-[50px] rounded-lg font-montserrat font-bold text-base leading-[100%] tracking-normal text-center text-white ${
          loading || !canWrite
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