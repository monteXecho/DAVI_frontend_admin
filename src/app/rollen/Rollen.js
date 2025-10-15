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
  const { getRoles, deleteRole } = useApi()
  const [roles, setRoles] = useState([])

  const ActiveComponent = tabsConfig[activeIndex].component

  const fetchRoles = useCallback(async () => {
    try {
      const res = await getRoles()
      if (res?.roles) {
        setRoles(res.roles)
      }
    } catch (err) {
      console.error("❌ Failed to fetch roles:", err)
    }
  }, [getRoles])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

 const handleDeleteRole = async (role_name) => {
  try {
    await deleteRole(role_name)
    await fetchRoles()
  } catch (err) {
    console.error("❌ Failed to delete role:", err)
  }
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
                  {tab.label}
                </button>
              )
            })}
          </div>
          <div className="w-full h-[3px] bg-[#D6F5EB]" />
        </div>

        {/* Active Tab */}
        <div className="w-full px-[102px] py-[46px]">
          <ActiveComponent roles={roles} refreshRoles={fetchRoles} onDeleteRole={handleDeleteRole} />
        </div>
      </div>
    </div>
  )
}
