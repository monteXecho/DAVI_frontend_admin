'use client'
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

import UsersTab from "./components/UsersTab"
import MappenTab from "./components/MappenTab"
import MakenTab from "./components/MakenTab"
import ImportTab from "./components/ImportTab"
import { useApi } from "@/lib/useApi"
import { canWriteFolders } from "@/lib/permissions"

const tabsConfig = [
  { label: 'Alle Mappen', component: MappenTab, selectable: true },
  { label: 'Maken', component: MakenTab, selectable: true },
  { label: 'Importeren', component: ImportTab, selectable: true },
  { label: 'Gebruikers', component: UsersTab, selectable: false }
]

export default function Mappen() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [roles, setRoles] = useState([])
  const [documents, setDocuments] = useState(null)
  const [folders, setFolders] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([]) 
  const [selectedDocName, setSelectedDocName] = useState("") 
  const [selectedDocFolder, setSelectedDocFolder] = useState("")
  const [selectedDocRole, setSelectedDocRole] = useState("")
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [canWrite, setCanWrite] = useState(true)

  const { getRoles, getAdminDocuments, addFolders, deleteFolders, getUser, getFolders, addOrUpdateRole } = useApi()

  const router = useRouter()

  const isDocSelected = !!selectedDocName

  const dynamicTabs = tabsConfig.map(tab => {
    if (["Gebruikers", "Komt voor bij rol", "Komt voor in map"].includes(tab.label)) {
      return { ...tab, selectable: isDocSelected }
    }
    // Disable "Maken" tab if user doesn't have write permission
    if (tab.label === 'Maken' && !canWrite) {
      return { ...tab, selectable: false }
    }
    return tab
  })

  const ActiveComponent = dynamicTabs[activeIndex].component

  const refreshData = useCallback(async () => {
    try {
      setLoading(true)
      const [rolesRes, docsRes, foldersRes] = await Promise.all([
        getRoles(),
        getAdminDocuments(),
        getFolders()
      ])
      if (rolesRes?.roles) setRoles(rolesRes.roles)
      if (docsRes?.data) setDocuments(docsRes.data)
      if (foldersRes?.folders) {
        // Use folders_metadata if available (includes origin, indexed, etc.), otherwise fall back to folder names
        if (foldersRes.folders_metadata && Array.isArray(foldersRes.folders_metadata)) {
          setFolders(foldersRes.folders_metadata)
        } else {
          // Backward compatibility: convert folder names to objects
          setFolders(foldersRes.folders.map(name => ({ name, origin: 'davi', indexed: false, sync_enabled: false })))
        }
      }
    } catch (err) {
      console.error("Failed to refresh data:", err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [getRoles, getAdminDocuments, getFolders]) 

  useEffect(() => {
    const init = async () => {
      try {
        // Fetch current user to check permissions
        const userData = await getUser()
        setCurrentUser(userData)
        setCanWrite(canWriteFolders(userData))
        
        await refreshData()
      } catch (err) {
        console.error("Initialization failed:", err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [refreshData, getUser])  

  const handleShowUsers = (users, docName, folderName, roleName) => {
    setSelectedUsers(users)
    setSelectedDocName(docName)
    setSelectedDocFolder(folderName)
    setSelectedDocRole(roleName) 
    setActiveIndex(3) 
  }

  const handleDeleteFolders = async (payload) => {
    try {
      const res = await deleteFolders(payload)
      // Check if deletion was successful - the backend returns {success: true, ...}
      // Also check for status === "deleted" as an alternative success indicator
      if (res?.success === true || res?.status === "deleted") {
        console.log("Folders deleted successfully", res)
        // Refresh all data to reflect the deletion
        await refreshData()
        return res
      } else {
        // If we get a response but it's not marked as successful, log it but still refresh
        console.warn("Delete response unclear, but proceeding with refresh:", res)
        await refreshData()
        return res
      }
    } catch (err) {
      console.error("Failed to delete folders:", err)
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

  const handleAddFolders = async (folders) => {
    try {
      const res = await addFolders(folders)
      if (res?.success) {
        console.log("Folders added successfully", res)
        await refreshData()
        return res
      }
    } catch (err) {
      console.error("Failed to add folders:", err)
      throw err
    }
  }

  const handleAddRolesToFolders = async (folderNames, roleNames) => {
    try {
      // For each role, add the folders to its folder list
      const updatePromises = roleNames.map(async (roleName) => {
        // Find the role to get its current folders and modules
        const role = roles.find(r => (r.name || r) === roleName)
        if (!role) {
          console.warn(`Role ${roleName} not found`)
          return { success: false, roleName }
        }

        const currentFolders = role.folders || []
        const roleModules = role.modules || {}
        
        // Add new folders (avoid duplicates)
        const updatedFolders = [...new Set([...currentFolders, ...folderNames])]
        
        // Convert modules from object format to array format
        const modulesArray = Object.entries(roleModules).map(([name, config]) => ({
          name,
          enabled: config?.enabled === true || config?.enabled === "true"
        }))
        
        // Update the role
        const result = await addOrUpdateRole(roleName, updatedFolders, modulesArray, "update")
        // Check for success: status should be "role_updated" or "role_created", not "error"
        const isSuccess = result?.status === "role_updated" || result?.status === "role_created"
        return { success: isSuccess, roleName, result }
      })

      const results = await Promise.all(updatePromises)
      const failed = results.filter(r => !r.success)
      
      if (failed.length > 0) {
        console.warn("Some role updates failed:", failed)
        // Log the actual API responses for debugging
        failed.forEach(f => {
          console.error(`Role ${f.roleName} update failed. Response:`, f.result)
        })
        throw new Error(`Kon rollen niet volledig bijwerken: ${failed.map(f => f.roleName).join(', ')}`)
      }

      await refreshData()
      return { success: true }
    } catch (err) {
      console.error("Failed to add roles to folders:", err)
      throw err
    }
  }

  const handleRemoveRolesFromFolders = async (folderNames, roleNames) => {
    try {
      // For each role, remove the folders from its folder list
      const updatePromises = roleNames.map(async (roleName) => {
        // Find the role to get its current folders and modules
        const role = roles.find(r => (r.name || r) === roleName)
        if (!role) {
          console.warn(`Role ${roleName} not found`)
          return { success: false, roleName }
        }

        const currentFolders = role.folders || []
        const roleModules = role.modules || {}
        
        // Remove folders (keep only folders not in folderNames)
        const updatedFolders = currentFolders.filter(folder => !folderNames.includes(folder))
        
        // Convert modules from object format to array format
        const modulesArray = Object.entries(roleModules).map(([name, config]) => ({
          name,
          enabled: config?.enabled === true || config?.enabled === "true"
        }))
        
        // Update the role
        const result = await addOrUpdateRole(roleName, updatedFolders, modulesArray, "update")
        // Check for success: status should be "role_updated" or "role_created", not "error"
        const isSuccess = result?.status === "role_updated" || result?.status === "role_created"
        return { success: isSuccess, roleName, result }
      })

      const results = await Promise.all(updatePromises)
      const failed = results.filter(r => !r.success)
      
      if (failed.length > 0) {
        console.warn("Some role updates failed:", failed)
        // Log the actual API responses for debugging
        failed.forEach(f => {
          console.error(`Role ${f.roleName} update failed. Response:`, f.result)
        })
        throw new Error(`Kon rollen niet volledig bijwerken: ${failed.map(f => f.roleName).join(', ')}`)
      }

      await refreshData()
      return { success: true }
    } catch (err) {
      console.error("Failed to remove roles from folders:", err)
      throw err
    }
  }

  return (
    <div className="w-full h-fit flex flex-col py-[81px] overflow-scroll scrollbar-hide">
      <div className="pb-[17px] pl-[97px] font-montserrat font-extrabold text-2xl">
        Mappen
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
              onUploadTab={handleUploadTab}
              onShowUsers={handleShowUsers} 
              onDeleteFolders={handleDeleteFolders}
              onAddFolders={handleAddFolders}
              onAddRolesToFolders={handleAddRolesToFolders}
              onRemoveRolesFromFolders={handleRemoveRolesFromFolders}
              onRefresh={refreshData}
              selectedUsers={selectedUsers} 
              selectedDocFolder={selectedDocFolder} 
              selectedDocRole={selectedDocRole}
              canWrite={canWrite}
            />
          )}
        </div>
      </div>
    </div>
  )
}
