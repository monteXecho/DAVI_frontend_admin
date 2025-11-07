'use client'
import { useState, useEffect, useCallback } from "react"

import AlleDocumentenTab from "./components/AllDocumentsTab"
import UsersTab from "./components/UsersTab"
import AppearInRoleTab from "./components/AppearInRoleTab"
import GekoppeldDocumentTab from "./components/AppearInFolderTab"
import ToevoegenTab from "./components/ToevoegenTab"
import MappenTab from "./components/MappenTab"
import { useApi } from "@/lib/useApi"

const tabsConfig = [
  { label: 'Alle documenten', component: AlleDocumentenTab, selectable: true },
  { label: 'Toevoegen', component: ToevoegenTab, selectable: true },
  { label: 'Gebruikers', component: UsersTab, selectable: false },
  { label: 'Komt voor bij rol', component: AppearInRoleTab, selectable: false },
  { label: 'Komt voor in map', component: GekoppeldDocumentTab, selectable: false },
  { label: 'Mappen', component: MappenTab, selectable: true },
]

export default function Documents() {
  const [ activeIndex, setActiveIndex ] = useState(0)
  const [ roles, setRoles ] = useState([])
  const [ documents, setDocuments ] = useState(null)
  const [ selectedUsers, setSelectedUsers ] = useState([]) 
  const [ selectedRoles, setSelectedRoles ] = useState([])
  const [ selectedFolders, setSelectedFolders ] = useState([])
  const [ selectedDocName, setSelectedDocName ] = useState("") 
  const [ loading, setLoading ] = useState(true)

  const { getRoles, uploadDocumentForRole, getAdminDocuments, deleteDocuments } = useApi()
  const ActiveComponent = tabsConfig[activeIndex].component

  const refreshData = useCallback(async () => {
    try {
      const [rolesRes, docsRes] = await Promise.all([
        getRoles(),
        getAdminDocuments()
      ])
      if (rolesRes?.roles) setRoles(rolesRes.roles)
      if (docsRes?.data) setDocuments(docsRes.data)
    } catch (err) {
      console.error("❌ Failed to refresh data:", err)
    }
  }, [getRoles, getAdminDocuments]) 

  useEffect(() => {
    const init = async () => {
      try {
        await refreshData()
      } catch (err) {
        console.error("❌ Initialization failed:", err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [refreshData])  

  const handleUploadDocument = async (selectedRole, selectedFolder, formData) => {
    try {
      const res = await uploadDocumentForRole(selectedRole, selectedFolder, formData)

      if (res?.success) {
        await refreshData();
      }

      return res
    } catch (err) {
      console.error("❌ Failed to upload doc:", err)
    }
  }

  const handleShowUsers = (users, docName) => {
    setSelectedUsers(users)
    setSelectedDocName(docName)
    setActiveIndex(2) 
  }

  const handleShowRoles = (fileName, roles) => {
    setSelectedRoles(roles)
    setSelectedDocName(fileName)
    setActiveIndex(3)
  }

  const handleShowFolders = (fileName, folders) => {
    setSelectedFolders(folders)
    setSelectedDocName(fileName)
    setActiveIndex(4) 
  }

  const handleDeleteDocuments = async (documentsToDelete) => {
    try {
      const res = await deleteDocuments(documentsToDelete)
      console.log("________res:____________", res)
      if (res?.success) {
        await refreshData(); 
        return res;
      }
    } catch (err) {
      console.error("❌ Failed to delete documents:", err)
      throw err; 
    }
  }

  const handleUploadTab = () => setActiveIndex(1)

  const handleTabClick = (index) => {
    const tab = tabsConfig[index]
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
          {tabsConfig.map((tab, index) => {
            const isActive = activeIndex === index
            const isSelectable = tab.selectable
            
            return (
              <button
                key={tab.label}
                onClick={() => handleTabClick(index)}
                disabled={!isSelectable}
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
              onUploadDocument={handleUploadDocument}
              onUploadTab={handleUploadTab}
              onShowUsers={handleShowUsers} 
              onShowRoles={handleShowRoles}
              onShowFolders={handleShowFolders}
              onDeleteDocuments={handleDeleteDocuments}
              selectedUsers={selectedUsers} 
              selectedDocName={selectedDocName}
              selectedRoles={selectedRoles}
              selectedFolders={selectedFolders}
            />
          )}
        </div>
      </div>
    </div>
  )
}
