'use client'
import { useState, useEffect } from "react"

import AlleDocumentenTab from "./components/AllDocumentsTab"
import UsersTab from "./components/UsersTab"
import AppearInRoleTab from "./components/AppearInRoleTab"
import GekoppeldDocumentTab from "./components/AppearInFolderTab"
import ToevoegenTab from "./components/ToevoegenTab"
import { useApi } from "@/lib/useApi"

const tabsConfig = [
  { label: 'Alle documenten', component: AlleDocumentenTab },
  { label: 'Toevoegen', component: ToevoegenTab },
  { label: 'Gebruikers', component: UsersTab },
  { label: 'Komt voor bij rol', component: AppearInRoleTab },
  { label: 'Komt voor in map', component: GekoppeldDocumentTab },
]

export default function Documents() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [roles, setRoles] = useState([])
  const [documents, setDocuments] = useState(null)
  const [selectedUsers, setSelectedUsers] = useState([]) 
  const [selectedDocName, setSelectedDocName] = useState("") 
  const [ loading, setLoading ] = useState(true)

  const { getRoles, uploadDocumentForRole, getAdminDocuments } = useApi()
  const ActiveComponent = tabsConfig[activeIndex].component

  useEffect(() => {
    const init = async () => {
      try {
        const [rolesRes, docsRes] = await Promise.all([
          getRoles(),
          getAdminDocuments()
        ])
        if (rolesRes?.roles) setRoles(rolesRes.roles)
        if (docsRes?.data) setDocuments(docsRes.data)
      } catch (err) {
        console.error("❌ Initialization failed:", err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [getRoles, getAdminDocuments])

  const handleUploadDocument = async (selectedRole, selectedFolder, formData) => {
    try {
      const res = await uploadDocumentForRole(selectedRole, selectedFolder, formData)
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

  const handleUploadTab = () => setActiveIndex(1)

  return (
    <div className="w-full h-fit flex flex-col py-[81px] overflow-scroll scrollbar-hide">
      <div className="pb-[17px] pl-[97px] font-montserrat font-extrabold text-2xl">
        Documenten
      </div>

      <div className="flex flex-col w-full">
        {/* Tabs Header */}
        <div className="pl-24 flex gap-2">
          {tabsConfig.map((tab, index) => {
            const isActive = activeIndex === index
            return (
              <button
                key={tab.label}
                onClick={() => setActiveIndex(index)}
                className={`flex justify-center items-center rounded-tl-xl rounded-tr-xl transition-all relative
                  ${isActive ? 'bg-[#D6F5EB]' : 'bg-[#F9FBFA] h-[32px]'}
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
              selectedUsers={selectedUsers} 
              selectedDocName={selectedDocName}
            />
          )}
        </div>
      </div>
    </div>
  )
}
