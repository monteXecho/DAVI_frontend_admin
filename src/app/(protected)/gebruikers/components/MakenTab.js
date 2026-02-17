'use client'
import { useState, useMemo, useEffect } from "react"
import DropdownMenu from "@/components/input/DropdownMenu"
import { ToastContainer, toast } from "react-toastify"
import Toggle from "@/components/buttons/Toggle"
import SuccessBttn from "@/components/buttons/SuccessBttn"
import RedCancelIcon from "@/components/icons/RedCancelIcon"
import AddIcon from "@/components/icons/AddIcon"
import "react-toastify/dist/ReactToastify.css"

export default function MakenTab({ roles = [], onAddUser, onAssignTeamlidPermissions, onAddRoleToUsers, onGetUsers, canWrite = true }) {
  const allRoles = useMemo(
    () => roles.map((r) => (r?.name ?? r?.role ?? String(r))).filter(Boolean),
    [roles]
  )

  const allOptions = useMemo(
    () => ["Beheerder", "Teamlid", ...allRoles],
    [allRoles]
  )

  const [selectedRoles, setSelectedRoles] = useState([])
  const [selected, setSelected] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Team permissions states - only for Teamlid role
  const [roleFolderPermission, setRoleFolderPermission] = useState(false)
  const [userPermission, setUserPermission] = useState(false)
  const [documentPermission, setDocumentPermission] = useState(false)

  // Check if user has selected special roles (Beheerder or Teamlid)
  const hasBeheerder = useMemo(() => selectedRoles.includes("Beheerder"), [selectedRoles])
  const hasTeamlid = useMemo(() => selectedRoles.includes("Teamlid"), [selectedRoles])

  // Available roles for selection (excluding already selected ones)
  // Allow selecting Beheerder/Teamlid if not already selected, but don't mix them with regular roles
  const availableRoles = useMemo(() => {
    const selectedSet = new Set(selectedRoles)
    const available = []
    
    // Add Beheerder if not selected and no regular roles are selected
    if (!hasBeheerder && selectedRoles.filter(r => r !== "Beheerder" && r !== "Teamlid").length === 0) {
      available.push("Beheerder")
    }
    
    // Add Teamlid if not selected and no regular roles are selected
    if (!hasTeamlid && selectedRoles.filter(r => r !== "Beheerder" && r !== "Teamlid").length === 0) {
      available.push("Teamlid")
    }
    
    // Add regular roles if no special roles are selected
    if (!hasBeheerder && !hasTeamlid) {
      available.push(...allRoles.filter((r) => !selectedSet.has(r)))
    }
    
    return available
  }, [allRoles, selectedRoles, hasBeheerder, hasTeamlid])

  // Update selected dropdown when available roles change
  useEffect(() => {
    if (!selected && availableRoles.length > 0) {
      setSelected(availableRoles[0])
    } else if (selected && !availableRoles.includes(selected)) {
      setSelected(availableRoles.length > 0 ? availableRoles[0] : "")
    }
  }, [availableRoles, selected])

  const handleAddRole = () => {
    if (!selected || selectedRoles.includes(selected)) return
    setSelectedRoles((prev) => [...prev, selected])
    const nextAvailable = availableRoles.filter((r) => r !== selected)
    setSelected(nextAvailable.length > 0 ? nextAvailable[0] : "")
  }

  const handleRemoveRole = (role) => {
    setSelectedRoles((prev) => prev.filter((r) => r !== role))
    if (!selected) setSelected(role)
  }

  const handleSave = async () => {
    if (!canWrite) {
      toast.error("U heeft geen toestemming om gebruikers toe te voegen.")
      return
    }
    
    if (!email.trim()) {
      toast.warning("Voer een geldig e-mailadres in.")
      return
    }

    // Check if at least one role is selected
    if (selectedRoles.length === 0) {
      toast.warning("Selecteer ten minste één rol voor de gebruiker.")
      return
    }

    const hasBeheerder = selectedRoles.includes("Beheerder")
    const hasTeamlid = selectedRoles.includes("Teamlid")
    const regularRoles = selectedRoles.filter((r) => r !== "Beheerder" && r !== "Teamlid")

    try {
      setLoading(true)

      // Handle Beheerder role (creates company_admin)
      if (hasBeheerder) {
        await onAddUser(email.trim(), "company_admin", "")
        toast.success("Gebruiker toegevoegd als Beheerder")
      }
      // Handle Teamlid role
      else if (hasTeamlid) {
        const team_permissions = {
          role_folder_modify_permission: roleFolderPermission,
          user_create_modify_permission: userPermission,
          document_modify_permission: documentPermission
        }
        await onAssignTeamlidPermissions(email.trim(), team_permissions)
        toast.success("Gebruiker toegevoegd als Teamlid")
      }
      // Handle regular roles
      else if (regularRoles.length > 0) {
        // Create user with first role
        const firstRole = regularRoles[0]
        const result = await onAddUser(email.trim(), "company_user", firstRole)
        
        console.log("Add user response:", result)
        
        // Try multiple ways to get user_id from the response
        let user_id = result?.user?.user_id || 
                     result?.user?.id || 
                     result?.user_id || 
                     result?.id
        
        // If user_id is still not found, try to get it by email from users list
        if (!user_id && onGetUsers) {
          try {
            // Wait a bit for the user to be created in the database
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // Get users list and find the user by email
            const usersResponse = await onGetUsers()
            const users = usersResponse?.members || []
            const foundUser = users.find(u => u.email === email.trim())
            
            if (foundUser) {
              user_id = foundUser.id || foundUser.user_id
              console.log("Found user by email:", foundUser)
            }
          } catch (err) {
            console.error("Failed to get user by email:", err)
          }
        }
        
        // Add remaining roles (if any)
        if (regularRoles.length > 1) {
          if (!user_id) {
            // If we still don't have user_id, show error but don't throw
            toast.error("Kon gebruikers-ID niet ophalen. De gebruiker is aangemaakt met alleen de eerste rol.")
            toast.info("Voeg de overige rollen handmatig toe via de Wijzigen tab.")
          } else {
            const remainingRoles = regularRoles.slice(1)
            
            // Add each remaining role
            for (const role of remainingRoles) {
              try {
                await onAddRoleToUsers([user_id], role)
              } catch (err) {
                console.error(`Failed to add role ${role}:`, err)
                toast.warning(`Kon rol "${role}" niet toevoegen: ${err?.message || "Onbekende fout"}`)
              }
            }
            
            toast.success(`Gebruiker toegevoegd met ${regularRoles.length} rollen: ${regularRoles.join(", ")}`)
          }
        } else {
          toast.success(`Gebruiker toegevoegd met rol ${firstRole}`)
        }
      }

      // Reset form
      setEmail("")
      setSelectedRoles([])
      setSelected(availableRoles.length > 0 ? availableRoles[0] : "")
      setRoleFolderPermission(false)
      setUserPermission(false)
      setDocumentPermission(false)
    } catch (err) {
      console.error("Failed to add user:", err)
      toast.error(err?.message || "Fout bij het toevoegen van de gebruiker.")
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

        {/* Display selected roles */}
        <div className="flex flex-wrap gap-3 mb-4">
          {selectedRoles.length > 0 ? (
            selectedRoles.map((role, i) => (
              <div key={role + i} className="flex items-center gap-2">
                <SuccessBttn text={role} />
                {canWrite && (
                  <button
                    onClick={() => handleRemoveRole(role)}
                    aria-label={`Remove ${role}`}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <RedCancelIcon />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-500 italic text-sm">Geen rollen geselecteerd</div>
          )}
        </div>

        {/* Add role section */}
        {availableRoles.length > 0 && (
          <div className="flex gap-2 items-center">
            <div className="w-1/3">
              <DropdownMenu
                value={selected}
                onChange={setSelected}
                disabled={!canWrite || availableRoles.length === 0}
                allOptions={availableRoles}
              />
            </div>
            <button
              onClick={handleAddRole}
              disabled={!canWrite || availableRoles.length === 0 || !selected}
              aria-label="Add role"
              className={`hover:opacity-80 transition-opacity ${!canWrite || availableRoles.length === 0 || !selected ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <AddIcon />
            </button>
          </div>
        )}

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
      {hasTeamlid && (
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