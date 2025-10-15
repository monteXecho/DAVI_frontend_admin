'use client'
import { useEffect, useState } from "react"
import { useApi } from "@/lib/useApi"

import GebruikersTab from "./components/GebruikersTab"
import MakenTab from "./components/MakenTab"
import GekoppeldDocumentTab from "./components/GekoppeldDocumentTab"
import GekoppeldMapTab from "./components/GekoppeldMapTab"
import WijzigenTab from "./components/WijzigenTab"

const tabsConfig = [
  { label: 'Gebruikers', component: GebruikersTab },
  { label: 'Maken', component: MakenTab },
  { label: 'Wijzigen', component: WijzigenTab },
  { label: 'Gekoppeld aan document', component: GekoppeldDocumentTab },
  { label: 'Gekoppeld aan map', component: GekoppeldMapTab },
]

export default function Gebruikers() {
  const { getUsers, addUser, updateUser, deleteUser, assignRole, getRoles } = useApi()

  const [ activeIndex, setActiveIndex ] = useState(0)
  const [ users, setUsers ] = useState([])
  const [ allRoles, setAllRoles ] = useState([])
  const [ selectedUser, setSelectedUser ] = useState(null)
  const [ loading, setLoading ] = useState(true)

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
  const handleAddUser = async (email, role) => {
    await addUser(email, role)
    await refreshUsers()
  }

  const handleUpdateUser = async (data) => {
    await updateUser(data)
    await refreshUsers()
  }

  const handleAssignRole = async (role) => {
    await assignRole(roles)
    await refreshUsers()
  }

  const handleDeleteUser = async (id) => {
    await deleteUser(id)
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  const refreshUsers = async () => {
    const res = await getUsers()
    const formatted =
      res.members?.map(formatUser) || []
    setUsers(formatted)
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setActiveIndex(2) // "Wijzigen" tab
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
                  {tab.label}
                </button>
              )
            })}
          </div>
          <div className="w-full h-[3px] bg-[#D6F5EB]"></div>
        </div>

        {/* Render Active Tab */}
        <div className="w-full px-[102px] py-[46px]">
          <ActiveComponent
            users={users}
            roles={allRoles}
            loading={loading}
            onEditUser={handleEditUser}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onAssignRole={handleAssignRole}
            user={selectedUser}
          />
        </div>
      </div>
    </div>
  )
}
