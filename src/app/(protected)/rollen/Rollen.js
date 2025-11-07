'use client'
import { useState, useEffect, useCallback } from "react"
import { useApi } from "@/lib/useApi"

import AlleRollenTab from "./components/AlleRollenTab"
import MakenTab from "./components/MakenTab"
import WijzigenTab from "./components/WijzigenTab"

const tabsConfig = [
  { label: 'Alle rollen', component: AlleRollenTab },
  { label: 'Maken', component: MakenTab },
  { label: 'Wijzigen', component: WijzigenTab },
]

export default function Rollen() {
  const [activeIndex, setActiveIndex] = useState(0)
  const { getUser, getRoles, addOrUpdateRole, deleteRoles } = useApi()
  const [roles, setRoles] = useState([])
  const [selectedRole, setSelectedRole] = useState(null) 
  const [ user, setUser ] = useState()
  const [loading, setLoading] = useState(true)
  
  const ActiveComponent = tabsConfig[activeIndex].component

  const fetchUser = useCallback(async () => {
    try {
      const loginUser = await getUser()
      if(loginUser) setUser(loginUser)
      console.log("Current logged in user:", loginUser)
    } catch (err) {
      console.log("Failed to fetch user info: ", err)
    } finally {
      setLoading(false)
    }  
  }, [getUser])

  const fetchRoles = useCallback(async () => {
    try {
      const res = await getRoles()
      if (res?.roles) {
        setRoles(res.roles)
      }
    } catch (err) {
      console.error("❌ Failed to fetch roles:", err)
    } finally {
      setLoading(false)
    }
  }, [getRoles])

  useEffect(() => {
    fetchRoles()
    fetchUser()
  }, [fetchRoles])

  const handleDeleteRoles = async (role_names) => {
    try {
      await deleteRoles(Array.isArray(role_names) ? role_names : [role_names])
      await fetchRoles()
    } catch (err) {
      console.error("❌ Failed to delete role(s):", err)
    }
  }

  const handleAddOrUpdateRole = async (role_name, folders, modules) => {
    try {
      await addOrUpdateRole(role_name, folders, modules)
      await fetchRoles()
    } catch (err) {
      console.log("Failed to update role.", err)
    }
  }

  const handleEditRole = (role) => {
    setSelectedRole(role)
    setActiveIndex(2) 
  }
  
  return (
    <div className="w-full h-fit flex flex-col py-[81px] overflow-scroll scrollbar-hide">
      <div className="pb-[17px] pl-[97px] font-montserrat font-extrabold text-2xl leading-[100%] tracking-[0]">
        Rollen
      </div>

      <div className="flex flex-col w-full">
        {/* Tabs Header */}
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
          <div className="w-full h-[3px] bg-[#D6F5EB]" />
        </div>

        {/* Active Tab */}
        <div className="w-full h-[3px] bg-[#D6F5EB]"></div>
        <div className="w-full px-[102px] py-[46px]">
          {loading ? (
            <div className="flex justify-center items-center h-[200px]">
              <span className="animate-spin rounded-full h-10 w-10 border-4 border-b-[#23BD92] border-gray-200"></span>
            </div>
            ) : (
          <ActiveComponent 
            user={user}
            roles={roles} 
            refreshRoles={fetchRoles} 
            onDeleteRoles={handleDeleteRoles} 
            onAddOrUpdateRole={handleAddOrUpdateRole}
            onMoveToMaken={() => {setActiveIndex(1)}}
            onEditRole={handleEditRole} 
            selectedRole={selectedRole} 
          />
          )}
        </div>
      </div>
    </div>
  )
}