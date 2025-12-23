'use client'
import { useState, useEffect, useCallback } from "react"

import AlleDocumentenTab from "./components/AllDocumentsTab"
import UsersTab from "./components/UsersTab"
import AppearInRoleTab from "./components/AppearInRoleTab"
import GekoppeldDocumentTab from "./components/AppearInFolderTab"
import ToevoegenTab from "./components/ToevoegenTab"
import { useApi } from "@/lib/useApi"
import { canWriteDocuments } from "@/lib/permissions"

const tabsConfig = [
  { label: 'Alle documenten', component: AlleDocumentenTab, selectable: true },
  { label: 'Toevoegen', component: ToevoegenTab, selectable: true },
  { label: 'Gebruikers', component: UsersTab, selectable: false },
  { label: 'Komt voor bij rol', component: AppearInRoleTab, selectable: false },
  { label: 'Komt voor in map', component: GekoppeldDocumentTab, selectable: false },
]

export default function Documents() {
  const [ activeIndex, setActiveIndex ] = useState(0)
  const [ roles, setRoles ] = useState([])
  const [ documents, setDocuments ] = useState(null)
  const [ folders, setFolders ] = useState([])
  const [ selectedUsers, setSelectedUsers ] = useState([]) 
  const [ selectedRoles, setSelectedRoles ] = useState([])
  const [ selectedFolders, setSelectedFolders ] = useState([])
  const [ selectedDocName, setSelectedDocName ] = useState("") 
  const [ loading, setLoading ] = useState(true)
  const [ currentUser, setCurrentUser ] = useState(null)
  const [ canWrite, setCanWrite ] = useState(true)

  const { getRoles, uploadDocumentForRole, getAdminDocuments, getFolders, deleteDocuments, getUser, addFolders } = useApi()

  const isDocSelected = !!selectedDocName

  const dynamicTabs = tabsConfig.map(tab => {
    if (["Gebruikers", "Komt voor bij rol", "Komt voor in map"].includes(tab.label)) {
      return { ...tab, selectable: isDocSelected }
    }
    // Disable "Toevoegen" tab if user doesn't have write permission
    if (tab.label === 'Toevoegen' && !canWrite) {
      return { ...tab, selectable: false }
    }
    return tab
  })

  const ActiveComponent = dynamicTabs[activeIndex].component

  const refreshData = useCallback(async () => {
    try {
      const [rolesRes, docsRes, foldersRes] = await Promise.all([
        getRoles(),
        getAdminDocuments(),
        getFolders()
      ])
      if (rolesRes?.roles){console.log('---roles---: ', rolesRes.roles); setRoles(rolesRes.roles)}
      if (docsRes?.data) {console.log('---documents---: ', docsRes.data); setDocuments(docsRes.data)}
      if (foldersRes?.folders) setFolders(foldersRes.folders)
    } catch (err) {
      console.error("Failed to refresh data:", err)
    }
  }, [getRoles, getAdminDocuments, getFolders]) 

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get('tab');
      
      if (tabParam) {
        setActiveIndex(parseInt(tabParam, 10));
      }
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        // Fetch current user to check permissions
        const userData = await getUser()
        setCurrentUser(userData)
        setCanWrite(canWriteDocuments(userData))
        
        await refreshData()
      } catch (err) {
        console.error("Initialization failed:", err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [refreshData, getUser])  

  const handleUploadDocument = async (selectedFolder, formData) => {
    try {
      const res = await uploadDocumentForRole(selectedFolder, formData)
      if (res?.success) {
        await refreshData()
      }
      return res
    } catch (err) {
      console.error("Failed to upload doc:", err)
    }
  }

  const handleAddFolders = async (folderNames) => {
    try {
      const res = await addFolders(folderNames)
      if (res?.success) {
        await refreshData()
      }
      return res
    } catch (err) {
      console.error("Failed to add folders:", err)
      return { success: false, message: err.response?.data?.detail || err.message || 'Kon mappen niet aanmaken' }
    }
  }

  const handleReplaceDocuments = async (documentsToDelete, newFiles, uploadTargets) => {
    try {
      const deleteRes = await deleteDocuments(documentsToDelete)
      if (!deleteRes?.success) {
        throw new Error("Failed to delete old documents")
      }

      const uploadPromises = []
      
      for (const file of newFiles) {
        for (const target of uploadTargets) {
          const formData = new FormData()
          formData.append('file', file)
          
          uploadPromises.push(
            uploadDocumentForRole(target.folder, formData)
          )
        }
      }

      const uploadResults = await Promise.all(uploadPromises)
      
      const failedUploads = uploadResults.filter(result => !result?.success)
      if (failedUploads.length > 0) {
        console.warn("Some uploads failed:", failedUploads)
      }

      await refreshData()

      return {
        success: true,
        message: `Successfully replaced ${documentsToDelete.length} document(s) with ${newFiles.length} new file(s)`
      }

    } catch (err) {
      console.error("Failed to replace documents:", err)
      throw err
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
      if (res?.success) {
        await refreshData()
        return res
      }
    } catch (err) {
      console.error("Failed to delete documents:", err)
      throw err
    }
  }

  const handleUploadTab = () => setActiveIndex(1)

  const handleTabClick = (index) => {
    const tab = dynamicTabs[index]
    if (tab.selectable) {
      setActiveIndex(index)
    }
  }

  const handleoveToToevoegen = () => setActiveIndex(1)

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
              folders={folders}
              onUploadDocument={handleUploadDocument}
              onAddFolders={handleAddFolders}
              onUploadTab={handleUploadTab}
              onShowUsers={handleShowUsers} 
              onShowRoles={handleShowRoles}
              onShowFolders={handleShowFolders}
              onDeleteDocuments={handleDeleteDocuments}
              onReplaceDocuments={handleReplaceDocuments} 
              onMoveToToevoegen={handleoveToToevoegen}
              selectedUsers={selectedUsers} 
              selectedDocName={selectedDocName}
              selectedRoles={selectedRoles}
              selectedFolders={selectedFolders}
              canWrite={canWrite}
            />
          )}
        </div>
      </div>
    </div>
  )
}