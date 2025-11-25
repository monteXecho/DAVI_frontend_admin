'use client'
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

import UsersTab from "./components/UsersTab"
import MappenTab from "./components/MappenTab"
import { useApi } from "@/lib/useApi"

const tabsConfig = [
  { label: 'Alle Mappen', component: MappenTab, selectable: true },
  { label: 'Gebruikers', component: UsersTab, selectable: false }
]

export default function Mappen() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [roles, setRoles] = useState([])
  const [documents, setDocuments] = useState(null)
  const [selectedUsers, setSelectedUsers] = useState([]) 
  const [selectedDocName, setSelectedDocName] = useState("") 
  const [selectedDocFolder, setSelectedDocFolder] = useState("")
  const [selectedDocRole, setSelectedDocRole] = useState("")
  const [loading, setLoading] = useState(true)

  const { getRoles, getAdminDocuments, deleteFolders } = useApi()

  const router = useRouter()

  const isDocSelected = !!selectedDocName

  const dynamicTabs = tabsConfig.map(tab => {
    if (["Gebruikers", "Komt voor bij rol", "Komt voor in map"].includes(tab.label)) {
      return { ...tab, selectable: isDocSelected }
    }
    return tab
  })

  const ActiveComponent = dynamicTabs[activeIndex].component

  const refreshData = useCallback(async () => {
    try {
      const [rolesRes, docsRes] = await Promise.all([
        getRoles(),
        getAdminDocuments()
      ])
      if (rolesRes?.roles) setRoles(rolesRes.roles)
      if (docsRes?.data) setDocuments(docsRes.data)
    } catch (err) {
      console.error("Failed to refresh data:", err)
    }
  }, [getRoles, getAdminDocuments]) 

  useEffect(() => {
    const init = async () => {
      try {
        await refreshData()
      } catch (err) {
        console.error("Initialization failed:", err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [refreshData])  

  const handleShowUsers = (users, docName, folderName, roleName) => {
    setSelectedUsers(users)
    setSelectedDocName(docName)
    setSelectedDocFolder(folderName)
    setSelectedDocRole(roleName) 
    setActiveIndex(1) 
  }

  const handleDeleteFolders = async (payload) => {
    try {
      const res = await deleteFolders(payload)
      if (res?.success) {
        console.log("Folders deleted successfully", res)
        await refreshData()
        return res
      }
    } catch (err) {
      console.error("Failed to delete documents:", err)
      throw err
    }
  }

  const handleUploadTab = () => {
    router.push('/documenten?tab=1')
  }

  const handleTabClick = (index) => {
    const tab = dynamicTabs[index]
    if (tab.selectable) {
      setActiveIndex(index)
    }
  }


  return (
    <div className="w-full h-fit flex flex-col py-[81px] overflow-scroll scrollbar-hide">
      <div className="pb-[17px] pl-[97px] font-montserrat font-extrabold text-2xl">
        Documenten
      </div>

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
                title={!isSelectable ? "Selecteer eerst een document" : ""}
                className={`flex justify-center items-center rounded-tl-xl rounded-tr-xl transition-all relative
                  ${isActive ? 'bg-[#D6F5EB]' : 'bg-[#F9FBFA] h-8'}
                  ${isSelectable 
                    ? 'cursor-pointer hover:bg-gray-100' 
                    : 'cursor-not-allowed opacity-60'
                  }
                  w-fit px-4 py-1 font-montserrat font-semibold text-[12px]
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

        {/* Active Tab Content */}
        <div className="w-full h-[3px] bg-[#D6F5EB]"></div>
        <div className="w-full px-[102px] py-[46px]">
          {loading ? (
            <div className="flex justify-center items-center h-[200px]">
              <span className="animate-spin rounded-full h-10 w-10 border-4 border-b-[#23BD92] border-gray-200"></span>
            </div>
          ) : (
            <ActiveComponent
              roles={roles}
              documents={documents}
              onUploadTab={handleUploadTab}
              onShowUsers={handleShowUsers} 
              onDeleteFolders={handleDeleteFolders}
              selectedUsers={selectedUsers} 
              selectedDocFolder={selectedDocFolder} 
              selectedDocRole={selectedDocRole} 
            />
          )}
        </div>
      </div>
    </div>
  )
}
