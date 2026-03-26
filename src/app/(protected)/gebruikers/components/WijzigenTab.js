'use client'
import { useEffect, useState, useMemo } from "react"
import DropdownMenu from "@/components/input/DropdownMenu"
import SuccessBttn from "@/components/buttons/SuccessBttn"
import RedCancelIcon from "@/components/icons/RedCancelIcon"
import AddIcon from "@/components/icons/AddIcon"
import Toggle from "@/components/buttons/Toggle"

const MODULE_LABELS = {
  'Documenten chat': 'Mappen, Documenten, Rollen, Gebruikers',
  'Admin Dashboard': 'Dashboard',
  'WebChat': "URL's en HTML uploaden",
  'PublicChat': "URL's, HTML en Documenten",
  'Nextcloud': 'Nextcloud gebruiken'
}
function getModuleLabel(name) {
  return MODULE_LABELS[name] || name
}

export default function WijzigenTab({ user, roles = [], onUpdateUser, onAssignUserModules, onAssignTeamlidPermissions, loading, onResetPass, canWrite = true, companyModules = [] }) {
  const allRoles = useMemo(
    () => roles.map((r) => (r?.name ?? r?.role ?? String(r))).filter(Boolean),
    [roles]
  )
  
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [updatedRoles, setUpdatedRoles] = useState([]) 
  const [selected, setSelected] = useState("") 
  const [isSaving, setIsSaving] = useState(false)

  const companyModulesObj = useMemo(() => {
    if (!Array.isArray(companyModules)) return {}
    const obj = {}
    companyModules.forEach((m) => {
      if (m && m.name) obj[m.name] = { enabled: m.enabled === true, desc: m.desc || '' }
    })
    return obj
  }, [companyModules])
  const companyModuleNames = useMemo(
    () => Object.keys(companyModulesObj).filter((k) => companyModulesObj[k]?.enabled === true),
    [companyModulesObj]
  )

  const [selectedAdminModules, setSelectedAdminModules] = useState({})
  const [roleFolderPermission, setRoleFolderPermission] = useState(false)
  const [userPermission, setUserPermission] = useState(false)
  const [documentPermission, setDocumentPermission] = useState(false)
  const [publicchatPermission, setPublicchatPermission] = useState(false)
  const [webchatPermission, setWebchatPermission] = useState(false)

  const isAdmin = useMemo(() => {
    if (!user) return false
    
    const userRoles = user.roles || user.Rol || []
    const hasBeheerderRole = Array.isArray(userRoles) 
      ? userRoles.includes("Beheerder")
      : userRoles === "Beheerder"
    
    return hasBeheerderRole
  }, [user])

  const isTeamlid = useMemo(() => user?.is_teamlid === true, [user])
  const hasTeamlidRole = useMemo(() => updatedRoles.includes("Teamlid"), [updatedRoles])

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
    const perms = user?.teamlid_permissions
    if (perms) {
      setRoleFolderPermission(perms.roles_folders === true || perms.role_folder_modify_permission === true)
      setUserPermission(perms.users === true || perms.user_create_modify_permission === true)
      setDocumentPermission(perms.documents === true || perms.document_modify_permission === true)
      setPublicchatPermission(perms.publicchat_modify_permission === true)
      setWebchatPermission(perms.webchat_modify_permission === true)
    } else {
      setRoleFolderPermission(false)
      setUserPermission(false)
      setDocumentPermission(false)
      setPublicchatPermission(false)
      setWebchatPermission(false)
    }
    const mods = user?.modules
    const next = {}
    companyModuleNames.forEach((name) => { next[name] = false })
    if (mods && Array.isArray(mods)) {
      mods.forEach((m) => {
        if (m && m.name && companyModuleNames.includes(m.name)) next[m.name] = m.enabled === true
      })
    }
    setSelectedAdminModules(next)
  }, [user?.id, user?.is_teamlid, JSON.stringify(user?.modules), JSON.stringify(user?.Rol), companyModuleNames.join(",")])

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

  const handleAdminModuleToggle = (moduleName) => {
    if (companyModulesObj[moduleName]?.enabled !== true) return
    setSelectedAdminModules((prev) => ({ ...prev, [moduleName]: !prev[moduleName] }))
  }

  const handleSave = async () => {
    if (!user) return
    if (!canWrite) {
      alert("U heeft geen toestemming om gebruikers te wijzigen.")
      return
    }

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
      await onUpdateUser(payload)
      if (isAdmin && onAssignUserModules && companyModuleNames.length > 0) {
        const modulesToSave = companyModuleNames.map((name) => ({
          name,
          enabled: selectedAdminModules[name] === true
        }))
        await onAssignUserModules(user.id, modulesToSave)
      }
      if (hasTeamlidRole && onAssignTeamlidPermissions && email.trim()) {
        const team_permissions = {
          role_folder_modify_permission: roleFolderPermission,
          user_create_modify_permission: userPermission,
          document_modify_permission: documentPermission,
          publicchat_modify_permission: publicchatPermission,
          webchat_modify_permission: webchatPermission
        }
        await onAssignTeamlidPermissions(email.trim(), team_permissions)
      }
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
              placeholder="Voor-en achternaam"
              disabled={!canWrite}
              className={`mb-5 h-12 rounded-lg border border-[#D9D9D9] px-4 py-3 focus:outline-none ${
                !canWrite ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
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
                    {canWrite && (
                      <button
                        onClick={() => handleRemoveRole(r)}
                        aria-label={`Remove ${r}`}
                        className="hover:opacity-80 transition-opacity"
                      >
                        <RedCancelIcon />
                      </button>
                    )}
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
                  disabled={!canWrite || availableRoles.length === 0}
                  allOptions={availableRoles}
                />
              </div>

              <button
                onClick={handleAddRole}
                disabled={!canWrite || availableRoles.length === 0}
                aria-label="Add role"
                className={`hover:opacity-80 transition-opacity ${!canWrite || availableRoles.length === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <AddIcon />
              </button>
            </div>
          </div>
        )}

        {/* Admin roles - Beheerder + Teamlid (with remove) when applicable */}
        {isAdmin && hasTeamlidRole && (
          <div className="flex flex-col gap-2 mt-4">
            <span className="font-montserrat text-[16px]">Rol</span>
            <div className="flex flex-wrap gap-3">
              <SuccessBttn text="Beheerder" />
              <div className="flex items-center gap-2">
                <SuccessBttn text="Teamlid" />
                {canWrite && (
                  <button
                    onClick={() => handleRemoveRole("Teamlid")}
                    aria-label="Remove Teamlid"
                    className="hover:opacity-80 transition-opacity"
                  >
                    <RedCancelIcon />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Module assignment - Only for admins (Beheerder) */}
        {isAdmin && companyModuleNames.length > 0 && (
          <div className="flex flex-col w-fit gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50 mt-4">
            <h3 className="font-montserrat font-semibold text-lg text-gray-700 mb-2">
              Modules toewijzen
            </h3>
            <div className="flex flex-col gap-3">
              {companyModuleNames.map((moduleName) => {
                const isEnabled = companyModulesObj[moduleName]?.enabled === true
                const isSelected = selectedAdminModules[moduleName] === true
                return (
                  <div key={moduleName} className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-montserrat text-sm font-medium text-gray-800">{moduleName}</span>
                      <span className="font-montserrat text-xs text-gray-500">{getModuleLabel(moduleName)}</span>
                    </div>
                    <Toggle
                      checked={isSelected}
                      onChange={() => isEnabled && handleAdminModuleToggle(moduleName)}
                      activeColor="#23BD92"
                      disabled={!canWrite || !isEnabled}
                    />
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-gray-500">
              Selecteer de modules die deze beheerder mag gebruiken.
            </p>
          </div>
        )}

        {/* Teamlid permissions - Only when Teamlid is in current roles (hides when removed via cancel) */}
        {hasTeamlidRole && (
          <div className="flex flex-col w-fit gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50 mt-4">
            <h3 className="font-montserrat font-semibold text-lg text-gray-700 mb-2">
              Teamlid Permissies
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="w-1/3 font-montserrat font-medium text-gray-800">Rollen-Mappen</span>
                <Toggle
                  checked={roleFolderPermission}
                  onChange={setRoleFolderPermission}
                  activeColor="#23BD92"
                  disabled={!canWrite}
                />
                <span className="font-montserrat text-sm text-gray-600 w-1/3">
                  {roleFolderPermission ? "Maken en wijzigen" : "Alleen lezen"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-1/3 font-montserrat font-medium text-gray-800">Gebruikers</span>
                <Toggle
                  checked={userPermission}
                  onChange={setUserPermission}
                  activeColor="#23BD92"
                  disabled={!canWrite}
                />
                <span className="font-montserrat text-sm text-gray-600 w-1/3">
                  {userPermission ? "Maken en wijzigen" : "Alleen lezen"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-1/3 font-montserrat font-medium text-gray-800">Documenten</span>
                <Toggle
                  checked={documentPermission}
                  onChange={setDocumentPermission}
                  activeColor="#23BD92"
                  disabled={!canWrite}
                />
                <span className="font-montserrat text-sm text-gray-600 w-1/3">
                  {documentPermission ? "Maken en wijzigen" : "Alleen lezen"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-1/3 font-montserrat font-medium text-gray-800">PublicChat</span>
                <Toggle
                  checked={publicchatPermission}
                  onChange={setPublicchatPermission}
                  activeColor="#23BD92"
                  disabled={!canWrite}
                />
                <span className="font-montserrat text-sm text-gray-600 w-1/3">
                  {publicchatPermission ? "Maken en wijzigen" : "Alleen lezen"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-1/3 font-montserrat font-medium text-gray-800">WebChat</span>
                <Toggle
                  checked={webchatPermission}
                  onChange={setWebchatPermission}
                  activeColor="#23BD92"
                  disabled={!canWrite}
                />
                <span className="font-montserrat text-sm text-gray-600 w-1/3">
                  {webchatPermission ? "Maken en wijzigen" : "Alleen lezen"}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Alleen toegewezen permissies zijn zichtbaar in de sidebar voor deze teamlid.
            </p>
          </div>
        )}

        {/* Email + Reset Password */}
        <span className="mt-[23px] font-montserrat text-[16px]">E-mail adres</span>
        <div className="mt-2 flex gap-3.5 items-center">
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
              className="w-fit h-10 flex items-center py-[15px] px-[13px] border-2 border-[#23BD92] rounded-lg font-bold text-[16px] leading-[100%] text-[#23BD92]"
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
        disabled={isSaving || loading || !canWrite}
        onClick={handleSave}
        className={`w-[110px] h-[50px] rounded-lg font-montserrat font-bold text-base text-white ${
          isSaving || loading || !canWrite
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#23BD92] hover:bg-[#1fa87c]"
        }`}
      >
        {isSaving ? "Opslaan..." : "Opslaan"}
      </button>
    </div>
  )
}