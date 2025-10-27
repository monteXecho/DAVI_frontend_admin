'use client'
import { useEffect, useState } from "react"
import { useApi } from "@/lib/useApi"

import GebruikersTab from "./components/GebruikersTab"
import MakenTab from "./components/MakenTab"
import WijzigenTab from "./components/WijzigenTab"

const tabsConfig = [
  { label: 'Gebruikers', component: GebruikersTab },
  { label: 'Maken', component: MakenTab },
  { label: 'Wijzigen', component: WijzigenTab },
]

export default function Gebruikers() {
  const { getUsers, addUser, updateUser, deleteUsers, assignRole, getRoles, uploadUsersFile, sendResetPassword } = useApi()

  const [ activeIndex, setActiveIndex ] = useState(0)
  const [ users, setUsers ] = useState([])
  const [ allRoles, setAllRoles ] = useState([])
  const [ selectedUser, setSelectedUser ] = useState(null)
  const [ loading, setLoading ] = useState(true)
  const [ uploadLoading, setUploadLoading ] = useState(false)

  function formatUser(u) {
    return {
      id: u.id,
      Naam: u.name || "—",
      Email: u.email || "—",
      Rol: Array.isArray(u.roles)
        ? u.roles
        : [u.role], // fallback
    }
  }

  // ✅ Fetch users safely after auth is ready
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getRoles()
        const formattedRole =
          data.roles?.map((r) => ({
            role: r.name,
          })) || []
          
        setAllRoles(formattedRole)

        const res = await getUsers()
        const formattedUser =
          res.members?.map(formatUser) || []
        setUsers(formattedUser)
      } catch (err) {
        console.error("Failed to fetch users:", err)
      } finally {
        setLoading(false)
      }
    }
    loadUsers()
  }, [getUsers])

  // ✅ Parent-managed CRUD actions
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

  // ✅ Handle bulk import file upload
  const handleBulkImport = async (file) => {
    if (!file) return

    setUploadLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const result = await uploadUsersFile(formData)
      
      if (result.success) {
        // Refresh the users list after successful upload
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
    setActiveIndex(2) // "Wijzigen" tab
  }

  const handleResetPass = async (email) => {
    try {
      const res = await sendResetPassword(email)
      if(res.success)
        alert("Success to send reset password request!")
      else alert(`${res.message}`)
    }catch (err) {
      console.error("Failed to request send:", err)
    }
  }

  const ActiveComponent = tabsConfig[activeIndex].component

  return (
    <div className="w-full h-fit flex flex-col py-[81px] overflow-scroll scrollbar-hide">
      <div className="pb-[17px] pl-[97px] font-montserrat font-extrabold text-2xl leading-[100%] tracking-[0]">
        Gebruikers
      </div>

      <div className="flex flex-col w-full">
        {/* Tabs */}
        <div className="flex flex-col w-full">
          <div className="pl-24 flex gap-2">
            {tabsConfig.map((tab, index) => {
              const isActive = activeIndex === index
              return (
                <button
                  key={tab.label}
                  onClick={() => setActiveIndex(index)}
                  className={`flex justify-center items-center rounded-tl-xl rounded-tr-xl transition-all
                    ${isActive ? 'bg-[#D6F5EB]' : 'bg-[#F9FBFA] h-[32px]'}
                    w-fit px-4 py-1 font-montserrat font-semibold text-[12px] leading-[24px] tracking-[0]
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

        {/* Render Active Tab */}
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
                loading={loading}
                onEditUser={handleEditUser}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUsers={handleDeleteUsers}
                onAssignRole={handleAssignRole}
                onMoveToMaken={() => setActiveIndex(1)}
                user={selectedUser}
                onBulkImport={handleBulkImport} 
                uploadLoading={uploadLoading} 
                onResetPass={handleResetPass}
              />
          )}
        </div>
      </div>
    </div>
  )
}