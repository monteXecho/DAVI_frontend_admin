'use client'
import { useEffect, useState, useCallback } from "react"
import { useApi } from "@/lib/useApi"

import GebruikersTab from "./components/GebruikersTab"
import MakenTab from "./components/MakenTab"
import WijzigenTab from "./components/WijzigenTab"
import DocumentenTab from "./components/Documenten"

const tabsConfig = [
  { label: 'Alle Gebruikers', component: GebruikersTab, selectable: true },
  { label: 'Toevoegen', component: MakenTab, selectable: true },
  { label: 'Wijzigen', component: WijzigenTab, selectable: false },
  { label: 'Documenten', component: DocumentenTab, selectable: false }
]

export default function Gebruikers() {
  const { getUsers, addUser, addRoleToUsers, updateUser, deleteUsers, deleteDocuments, deleteRoleFromUsers, assignRole, getRoles, getAdminDocuments, uploadUsersFile, sendResetPassword } = useApi()

  const [documents, setDocuments] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [users, setUsers] = useState([])
  const [allRoles, setAllRoles] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploadLoading, setUploadLoading] = useState(false)

  const [userDocumentFilters, setUserDocumentFilters] = useState({
    roles: [],
    folders: [],
    userName: ""
  })

  function formatUser(u) {
    return {
      id: u.id,
      Naam: u.name || "—",
      Email: u.email || "—",
      Rol: Array.isArray(u.roles) ? u.roles : [u.role],
    }
  }

  const refreshData = useCallback(async () => {
    try {
      const [rolesRes, docsRes] = await Promise.all([
        getRoles(),
        getAdminDocuments()
      ])
      if (rolesRes?.roles) {
        const formattedRole =
          rolesRes.roles?.map((r) => ({
            name: r.name,
            folders: r.folders
          })) || []
        setAllRoles(formattedRole)
      }
      if (docsRes?.data) setDocuments(docsRes.data)
    } catch (err) {
      console.error("❌ Failed to refresh data:", err)
    }
  }, [getRoles, getAdminDocuments])

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getRoles()
        const formattedRole =
          data.roles?.map((r) => ({
            name: r.name,
            folders: r.folders
          })) || []

        setAllRoles(formattedRole)

        const res = await getUsers()
        const formattedUser = res.members?.map(formatUser) || []
        setUsers(formattedUser)

        const docsRes = await getAdminDocuments()
        if (docsRes?.data) setDocuments(docsRes.data)
      } catch (err) {
        console.error("Failed to fetch users:", err)
      } finally {
        setLoading(false)
      }
    }
    loadUsers()
  }, [getUsers, getRoles, getAdminDocuments])

  const dynamicTabs = tabsConfig.map(tab => {
    if (['Wijzigen', 'Documenten'].includes(tab.label)) {
      return { ...tab, selectable: !!selectedUser }
    }
    return tab
  })

  const handleDocumentenForUser = (user) => {
    if (!user || !user.Rol || !documents) return

    const userRoles = user.Rol || []
    const userFolders = new Set()

    userRoles.forEach(roleName => {
      const role = allRoles.find(r => r.name === roleName)
      if (role && role.folders) {
        role.folders.forEach(folder => userFolders.add(folder))
      }
    })

    setUserDocumentFilters({
      roles: userRoles,
      folders: Array.from(userFolders),
      userName: user.Naam
    })

    setActiveIndex(3)
  }

  const handleAddUser = async (email, role, assigend_role) => {
    await addUser(email, role, assigend_role)
    await refreshUsers()
  }

  const handleUpdateUser = async (data) => {
    await updateUser(data)
    await refreshUsers()
  }

  const handleAssignRole = async (role) => {
    await assignRole(role)
    await refreshUsers()
  }

  const handleDeleteUsers = async (ids) => {
    await deleteUsers(ids)
    setUsers(prev => prev.filter(u => !ids.includes(u.id)))
  }

  const handleDeleteRoleFromUsers = async (ids, roleName) => {
    await deleteRoleFromUsers(ids, roleName)
    await refreshUsers()
  }

  const handleAddRoleToUsers = async (ids, roleName) => {
    await addRoleToUsers(ids, roleName)
    await refreshUsers()
  }

  const handleBulkImport = async (file, selectedRole = "Alle rollen") => {
    if (!file) return

    setUploadLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      if (selectedRole === "Zonder rol") {
        formData.append('role', '')
      } else if (selectedRole === "Alle rollen") {
        formData.append('role', 'Alle rollen')
      } else {
        formData.append('role', selectedRole)
      }

      const result = await uploadUsersFile(formData)

      if (result.success) {
        await refreshUsers()
        return { success: true, data: result.data }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error('Bulk import error:', error)
      return {
        success: false,
        message: 'An unexpected error occurred during upload.'
      }
    } finally {
      setUploadLoading(false)
    }
  }

  const refreshUsers = async () => {
    try {
      const res = await getUsers()
      const formatted = res.members?.map(formatUser) || []
      setUsers(formatted)
    } catch (err) {
      console.error("Failed to refresh users:", err)
    }
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setActiveIndex(2)
  }

  const handleDocumenten = () => {
    setUserDocumentFilters({ roles: [], folders: [], userName: "" })
    setActiveIndex(3)
  }

  const handleResetPass = async (email) => {
    try {
      const res = await sendResetPassword(email)
      if (res.success)
        alert("Success to send reset password request!")
      else alert(`${res.message}`)
    } catch (err) {
      console.error("Failed to request send:", err)
    }
  }

  const handleDeleteDocuments = async (documentsToDelete) => {
    try {
      const res = await deleteDocuments(documentsToDelete)
      if (res?.success) {
        await refreshData()
        return res
      }
    } catch (err) {
      console.error("❌ Failed to delete documents:", err)
      throw err
    }
  }

  const handleTabClick = (index) => {
    const tab = dynamicTabs[index]
    if (tab.selectable) {
      setActiveIndex(index)
    }
  }

  const ActiveComponent = dynamicTabs[activeIndex].component

  return (
    <div className="w-full h-fit flex flex-col py-[81px] overflow-scroll scrollbar-hide">
      <div className="pb-[17px] pl-[97px] font-montserrat font-extrabold text-2xl leading-[100%] tracking-[0]">
        Gebruikers
      </div>

      <div className="flex flex-col w-full">

        <div className="flex flex-col w-full">
          <div className="pl-24 flex gap-2">
            {dynamicTabs.map((tab, index) => {
              const isActive = activeIndex === index
              const isSelectable = tab.selectable

              return (
                <button
                  key={tab.label}
                  onClick={() => handleTabClick(index)}
                  disabled={!isSelectable}
                  title={!isSelectable ? "Selecteer eerst een gebruiker" : ""}
                  className={`flex justify-center items-center rounded-tl-xl rounded-tr-xl transition-all
                    ${isActive ? 'bg-[#D6F5EB]' : 'bg-[#F9FBFA] h-8'}
                    ${isSelectable ? 'cursor-pointer hover:bg-gray-100' : 'cursor-not-allowed opacity-60'}
                    w-fit px-4 py-1 font-montserrat font-semibold text-[12px] leading-6 tracking-[0]
                  `}
                >
                  {loading && isActive ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></span>
                    </span>
                  ) : (
                    tab.label
                  )}
                </button>
              )
            })}
          </div>
          <div className="w-full h-[3px] bg-[#D6F5EB]"></div>
        </div>

        <div className="w-full h-[3px] bg-[#D6F5EB]"></div>
        <div className="w-full px-[102px] py-[46px]">
          {loading ? (
            <div className="flex justify-center items-center h-[200px]">
              <span className="animate-spin rounded-full h-10 w-10 border-4 border-b-[#23BD92] border-gray-200"></span>
            </div>
          ) : (
            <ActiveComponent
              users={users}
              roles={allRoles}
              documents={documents}
              loading={loading}
              onEditUser={handleEditUser}
              onDocumenten={handleDocumenten}
              onDocumentenForUser={handleDocumentenForUser}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUsers={handleDeleteUsers}
              onDeleteRoleFromUsers={handleDeleteRoleFromUsers}
              onDeleteDocuments={handleDeleteDocuments}
              onAddRoleToUsers={handleAddRoleToUsers}
              onAssignRole={handleAssignRole}
              onMoveToMaken={() => setActiveIndex(1)}
              user={selectedUser}
              onBulkImport={handleBulkImport}
              uploadLoading={uploadLoading}
              onResetPass={handleResetPass}
              userDocumentFilters={userDocumentFilters}
            />
          )}
        </div>
      </div>
    </div>
  )
}
