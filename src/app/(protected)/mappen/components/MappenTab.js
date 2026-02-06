'use client'
import { useEffect, useState, useMemo, useCallback } from "react"
import Image from "next/image"

import AddButton from "@/components/buttons/AddButton"
import CheckBox from "@/components/buttons/CheckBox"
import SearchBox from "@/components/input/SearchBox"
import DropdownMenu from "@/components/input/DropdownMenu"
import RedCancelIcon from "@/components/icons/RedCancelIcon"
import GebruikersItem from "@/assets/gebruikers_item.png"
import DeleteDocumentModal from "./modals/DeleteDocumentModal"
import AddRoleModal from "./modals/AddRoleModal"
import RemoveRoleModal from "./modals/RemoveRoleModal"
import SortableHeader from "@/components/SortableHeader"
import { useSortableData } from "@/lib/useSortableData"

export default function MappenTab({ 
  documents = {}, 
  roles = [],
  folders = [],
  onUploadTab, 
  onShowUsers,
  onDeleteFolders,
  onAddRolesToFolders,
  onRemoveRolesFromFolders,
  canWrite = true
}) {
  const [allOptions1, setAllOptions1] = useState([])
  const [allOptions2, setAllOptions2] = useState([])
  const [selectedFolderType, setSelectedFolderType] = useState("Alle Mappen")
  const [selectedFolder, setSelectedFolder] = useState("Alle Mappen")
  const allOptions3 = ["Bulkacties", "Verwijder map", "Rol toevoegen", "Rol verwijderen"]
  const [selectedBulkAction, setSelectedBulkAction] = useState(allOptions3[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false)
  const [isRemoveRoleModalOpen, setIsRemoveRoleModalOpen] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState(new Set())

  const [expandedRoles, setExpandedRoles] = useState(new Set())
  const [expandedDocuments, setExpandedDocuments] = useState(new Set())

  useEffect(() => {
    setAllOptions1(["Alle Mappen", "Mappen met rollen", "Mappen zonder rollen"])
  }, [])

  // Get folders assigned to roles (from roles prop, not documents)
  const foldersInRoles = useMemo(() => {
    const foldersSet = new Set()
    roles.forEach(role => {
      const roleFolders = role.folders || []
      roleFolders.forEach(folderName => {
        foldersSet.add(folderName)
      })
    })
    return foldersSet
  }, [roles])
  const foldersWithoutRoles = useMemo(() => {
    return folders
      .filter(folderName => {
        const name = typeof folderName === 'string' ? folderName : folderName?.name
        return name && !foldersInRoles.has(name)
      })
      .map(folderName => typeof folderName === 'string' ? folderName : folderName?.name)
      .filter(Boolean)
  }, [folders, foldersInRoles])

  // Get folders with roles
  const foldersWithRoles = useMemo(() => {
    return Array.from(foldersInRoles)
  }, [foldersInRoles])

  // Get all role names from roles prop
  const allRoleNames = useMemo(() => {
    return roles.map(role => role.name || role).filter(Boolean)
  }, [roles])

  useEffect(() => {
    if (selectedFolderType === "Mappen met rollen") {
      // Show roles in the dropdown for "Mappen met rollen"
      setAllOptions2(["Alle Rollen", ...allRoleNames])
    } else {
      // Hide dropdown for "Alle Mappen" and "Mappen zonder rollen"
      setAllOptions2([])
    }
  }, [selectedFolderType, allRoleNames]);

  useEffect(() => {
    // Reset selection when folder type changes
    if (selectedFolderType === "Mappen met rollen") {
      setSelectedFolder("Alle Rollen")
    } else {
      setSelectedFolder("Alle Mappen")
    }
  }, [selectedFolderType]);

  const getAllDocuments = useCallback(() => {
    if (!documents) return []
    const allDocs = []
    Object.entries(documents).forEach(([roleName, roleData]) => {
      roleData.folders?.forEach(folder => {
        folder.documents?.forEach(doc => {
          allDocs.push({
            id: `${roleName}-${folder.name}-${doc.file_name}`,
            folder: folder.name,
            file: doc.file_name,
            path: doc.path,
            uploaded_at: doc.uploaded_at,
            assigned_to: doc.assigned_to,
            role: roleName
          })
        })
      })
    })
    return allDocs
  }, [documents])


  const baseDocuments = useMemo(() => {
    let docs = []
    
    if (selectedFolderType === "Alle Mappen") {
      // Show all documents from all folders (including unassigned folders)
      docs = getAllDocuments()
    } else if (selectedFolderType === "Mappen met rollen") {
      // Show only documents from folders that are assigned to roles
      docs = getAllDocuments().filter(doc => doc.role !== null && foldersInRoles.has(doc.folder))
      
      // If a specific role is selected, filter documents by that role
      if (selectedFolder && selectedFolder !== "Alle Rollen") {
        const selectedRole = roles.find(r => (r.name || r) === selectedFolder)
        if (selectedRole && selectedRole.folders) {
          // Only show documents from folders assigned to the selected role
          const roleFolderSet = new Set(selectedRole.folders)
          docs = docs.filter(doc => roleFolderSet.has(doc.folder) && doc.role === selectedFolder)
    } else {
          docs = []
        }
      }
    } else if (selectedFolderType === "Mappen zonder rollen") {
      // Show documents from folders that are not assigned to any role
      docs = getAllDocuments().filter(doc => doc.role === null || !foldersInRoles.has(doc.folder))
    }
    
    return docs
  }, [
    getAllDocuments, 
    selectedFolderType,
    selectedFolder,
    foldersInRoles,
    roles
  ])

  const { items: sortedDocuments, requestSort: requestDocumentSort, sortConfig: documentSortConfig } = useSortableData(baseDocuments)

  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return sortedDocuments
    
    const lowerSearch = searchQuery.toLowerCase()
    return sortedDocuments.filter(doc => 
      doc.file.toLowerCase().includes(lowerSearch) ||
      doc.folder.toLowerCase().includes(lowerSearch) ||
      doc.role.toLowerCase().includes(lowerSearch)
    )
  }, [sortedDocuments, searchQuery])

  const getDocumentsByRoleForFolder = (folderName) => {
    const roleMap = new Map()
    
    filteredDocuments
      .filter(doc => doc.folder === folderName)
      .forEach(doc => {
        if (!roleMap.has(doc.role)) {
          roleMap.set(doc.role, [])
        }
        roleMap.get(doc.role).push(doc)
      })
    
    return Array.from(roleMap.entries()).map(([role, docs]) => ({
      role,
      documents: docs,
      count: docs.length
    }))
  }

  const getUniqueDocumentsForFolder = (folderName) => {
    // Get all documents for this folder and deduplicate by file name
    const documentsMap = new Map()
    
    filteredDocuments
      .filter(doc => doc.folder === folderName)
      .forEach(doc => {
        // Use file name as key to deduplicate
        if (!documentsMap.has(doc.file)) {
          documentsMap.set(doc.file, doc)
        }
      })
    
    return Array.from(documentsMap.values())
  }

  const uniqueFolders = useMemo(() => {
    let folderList = []
    
    if (selectedFolderType === "Alle Mappen") {
      // Show ALL folders created by the admin (both assigned and unassigned)
      const allFolderNames = folders
        .map(f => typeof f === 'string' ? f : f?.name)
        .filter(Boolean)
      
      // Filter by selectedFolder if not "Alle Mappen"
      if (selectedFolder === "Alle Mappen") {
        folderList = allFolderNames
      } else {
        folderList = allFolderNames.includes(selectedFolder) ? [selectedFolder] : []
      }
    } else if (selectedFolderType === "Mappen met rollen") {
      // Show folders assigned to roles (based on role assignment, not documents)
      let foldersWithRolesList = folders
        .map(f => typeof f === 'string' ? f : f?.name)
        .filter(Boolean)
        .filter(folderName => foldersInRoles.has(folderName))
      
      // If a specific role is selected, filter folders by that role
      if (selectedFolder && selectedFolder !== "Alle Rollen") {
        const selectedRole = roles.find(r => (r.name || r) === selectedFolder)
        if (selectedRole && selectedRole.folders) {
          // Only show folders assigned to the selected role
          foldersWithRolesList = foldersWithRolesList.filter(folderName => 
            selectedRole.folders.includes(folderName)
          )
        } else {
          // Role not found or no folders assigned
          foldersWithRolesList = []
        }
      }
      
      folderList = foldersWithRolesList
    } else if (selectedFolderType === "Mappen zonder rollen") {
      // Return folders that exist but are not assigned to any role
      folderList = foldersWithoutRoles
    }
    
    // Apply search filter if search query exists
    if (searchQuery.trim()) {
      const lowerSearch = searchQuery.toLowerCase()
      folderList = folderList.filter(folderName => {
        // Check if folder name matches
        if (folderName.toLowerCase().includes(lowerSearch)) {
          return true
        }
        
        // Check if any role assigned to this folder matches
        const rolesForFolder = roles.filter(role => 
          role.folders && role.folders.includes(folderName)
        )
        if (rolesForFolder.some(role => {
          const roleName = role.name || role
          return typeof roleName === 'string' && roleName.toLowerCase().includes(lowerSearch)
        })) {
          return true
        }
        
        // Check if any document in this folder matches
        const folderDocs = filteredDocuments.filter(doc => doc.folder === folderName)
        if (folderDocs.some(doc => 
          doc.file.toLowerCase().includes(lowerSearch) ||
          (doc.role && doc.role.toLowerCase().includes(lowerSearch))
        )) {
          return true
        }
        
        return false
      })
    }
    
    return folderList
  }, [selectedFolderType, selectedFolder, foldersWithoutRoles, folders, foldersInRoles, roles, searchQuery, filteredDocuments])

  // Convert uniqueFolders to objects for sorting
  const foldersForSorting = useMemo(() => {
    return uniqueFolders.map(folderName => ({ folder: folderName }))
  }, [uniqueFolders])

  // Apply sorting to folders
  const { items: sortedFolders, requestSort, sortConfig } = useSortableData(foldersForSorting)

  // Extract folder names from sorted objects
  const sortedFolderNames = useMemo(() => {
    return sortedFolders.map(item => item.folder)
  }, [sortedFolders])

  const toggleRolesExpand = (folderName) => {
    setExpandedRoles(prev => {
      const newSet = new Set(prev)
      newSet.has(folderName) ? newSet.delete(folderName) : newSet.add(folderName)
      return newSet
    })
  }

  const toggleDocumentsExpand = (folderName, roleName) => {
    const key = `${folderName}::${roleName}`
    setExpandedDocuments(prev => {
      const newSet = new Set(prev)
      newSet.has(key) ? newSet.delete(key) : newSet.add(key)
      return newSet
    })
  }

  const renderRoles = (folderName) => {
    // Check if folder is assigned to any role
    const folderInRoles = roles.filter(role => 
      role.folders && role.folders.includes(folderName)
    )
    
    // If folder is not assigned to any role
    if (folderInRoles.length === 0) {
      return (
        <span className="text-gray-400 text-sm italic">
          Geen rol toegewezen
        </span>
      )
    }
    
    // Get roles from documents for this folder
    const rolesWithDocs = getDocumentsByRoleForFolder(folderName)
    
    // If no documents but folder is assigned to roles, show the roles
    if (rolesWithDocs.length === 0) {
      const isRolesExpanded = expandedRoles.has(folderName)
      const hasMultipleRoles = folderInRoles.length > 1
      const rolesToShow = isRolesExpanded ? folderInRoles : folderInRoles.slice(0, 1)
      const hiddenRolesCount = folderInRoles.length - 1
      
      return (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            {rolesToShow.map((role) => (
              <span 
                key={`${folderName}-${role.name || role}`}
                className="inline-block bg-[#23BD92]/10 text-[#23BD92] font-semibold text-sm px-2 py-1 rounded-md whitespace-nowrap w-fit"
              >
                {role.name || role}
              </span>
            ))}
          </div>

          {hasMultipleRoles && (
            <div className="flex items-center">
              <button
                onClick={() => toggleRolesExpand(folderName)}
                className="flex items-center gap-1 text-[#23BD92] text-sm font-medium hover:text-[#1da67c] transition-colors"
              >
                <span>
                  {isRolesExpanded 
                    ? `Minder tonen` 
                    : `+${hiddenRolesCount} meer rol${hiddenRolesCount !== 1 ? 'len' : ''}`
                  }
                </span>
                <span className={`transform transition-transform ${isRolesExpanded ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
            </div>
          )}
        </div>
      )
    }
    
    // Folder has documents and roles
    const isRolesExpanded = expandedRoles.has(folderName)
    const hasMultipleRoles = rolesWithDocs.length > 1
    
    const rolesToShow = isRolesExpanded ? rolesWithDocs : rolesWithDocs.slice(0, 1)
    const hiddenRolesCount = rolesWithDocs.length - 1

    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          {rolesToShow.map(({ role }) => (
            <span 
              key={`${folderName}-${role}`}
              className="inline-block bg-[#23BD92]/10 text-[#23BD92] font-semibold text-sm px-2 py-1 rounded-md whitespace-nowrap w-fit"
            >
                    {role}
                  </span>
          ))}
        </div>

        {hasMultipleRoles && (
          <div className="flex items-center">
            <button
              onClick={() => toggleRolesExpand(folderName)}
              className="flex items-center gap-1 text-[#23BD92] text-sm font-medium hover:text-[#1da67c] transition-colors"
            >
              <span>
                {isRolesExpanded 
                  ? `Minder tonen` 
                  : `+${hiddenRolesCount} meer rol${hiddenRolesCount !== 1 ? 'len' : ''}`
                }
              </span>
              <span className={`transform transition-transform ${isRolesExpanded ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
          </div>
        )}
      </div>
    )
  }

  const renderDocuments = (folderName) => {
    const uniqueDocuments = getUniqueDocumentsForFolder(folderName)
    const documentCount = uniqueDocuments.length
    const isDocumentsExpanded = expandedDocuments.has(`${folderName}::documents`)
    const hasMultipleDocuments = documentCount > 1

    if (documentCount === 0) {
      return <span className="text-gray-400 text-sm">Geen documenten</span>
    }

    return (
      <div className="flex flex-col gap-1">
        {hasMultipleDocuments ? (
          <>
            <button
              onClick={() => toggleDocumentsExpand(folderName, 'documents')}
              className="text-gray-600 text-sm hover:text-gray-800 hover:underline transition-colors flex items-center gap-1 text-left"
            >
              {documentCount} document{documentCount !== 1 ? 'en' : ''}
              <span className="ml-1 text-xs">{isDocumentsExpanded ? '▲' : '▼'}</span>
            </button>

            {/* Expanded documents list */}
            {isDocumentsExpanded && (
              <div className="flex flex-col gap-1 text-gray-700 text-sm mt-1">
                {uniqueDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-gray-400 rounded-full shrink-0"></span>
                    <span className="wrap-break-words">{doc.file}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <span className="text-gray-800 text-sm">
            {uniqueDocuments[0].file}
          </span>
        )}
      </div>
    )
  }

  const handleDocumentSelect = (docId, isSelected) => {
    setSelectedDocuments(prev => {
      const newSelected = new Set(prev)
      isSelected ? newSelected.add(docId) : newSelected.delete(docId)
      return newSelected
    })
  }

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      const allSelections = new Set()
      
      // Select all documents from folders with documents
      filteredDocuments.forEach(doc => allSelections.add(doc.id))
      
      // Select all folders without documents
      uniqueFolders.forEach(folderName => {
        const folderDocs = filteredDocuments.filter(doc => doc.folder === folderName)
        if (folderDocs.length === 0) {
          // Folder has no documents - use appropriate marker
          const isUnassignedFolder = !foldersInRoles.has(folderName)
          if (isUnassignedFolder) {
            allSelections.add(`folder-only:${folderName}`)
          } else {
            // Find role for this folder
            const rolesWithFolder = roles.filter(role => 
              role.folders && role.folders.includes(folderName)
            )
            if (rolesWithFolder.length > 0) {
              const roleName = rolesWithFolder[0].name || rolesWithFolder[0]
              allSelections.add(`role-folder:${roleName}::${folderName}`)
            }
          }
        }
      })
      
      setSelectedDocuments(allSelections)
    } else {
      setSelectedDocuments(new Set())
    }
  }

  // Calculate selected folders count (not documents)
  const getSelectedFoldersCount = () => {
    const selectedFolderNames = new Set()
    
    // Get folders from selected documents
    Array.from(selectedDocuments).forEach(docId => {
      if (docId.startsWith('folder-only:')) {
        selectedFolderNames.add(docId.replace('folder-only:', ''))
      } else if (docId.startsWith('role-folder:')) {
        const parts = docId.replace('role-folder:', '').split('::')
        if (parts.length === 2) {
          selectedFolderNames.add(parts[1]) // folder name
        }
      } else {
        const doc = filteredDocuments.find(d => d.id === docId)
        if (doc && doc.folder) {
          selectedFolderNames.add(doc.folder)
        }
      }
    })
    
    return selectedFolderNames.size
  }

  // Check if all folders are selected
  const allSelected = uniqueFolders.length > 0 && uniqueFolders.every(folderName => {
    const folderDocs = filteredDocuments.filter(doc => doc.folder === folderName)
    if (folderDocs.length > 0) {
      // Folder has documents - check if all documents are selected
      return folderDocs.every(doc => selectedDocuments.has(doc.id))
    } else {
      // Folder has no documents - check if folder marker is selected
      const isUnassignedFolder = !foldersInRoles.has(folderName)
      if (isUnassignedFolder) {
        return selectedDocuments.has(`folder-only:${folderName}`)
      } else {
        // Check if any role-folder marker exists for this folder
        const rolesWithFolder = roles.filter(role => 
          role.folders && role.folders.includes(folderName)
        )
        return rolesWithFolder.some(role => {
          const roleName = role.name || role
          return selectedDocuments.has(`role-folder:${roleName}::${folderName}`)
        })
      }
    }
  })
  
  const someSelected = uniqueFolders.some(folderName => {
    const folderDocs = filteredDocuments.filter(doc => doc.folder === folderName)
    if (folderDocs.length > 0) {
      return folderDocs.some(doc => selectedDocuments.has(doc.id))
    } else {
      const isUnassignedFolder = !foldersInRoles.has(folderName)
      if (isUnassignedFolder) {
        return selectedDocuments.has(`folder-only:${folderName}`)
      } else {
        const rolesWithFolder = roles.filter(role => 
          role.folders && role.folders.includes(folderName)
        )
        return rolesWithFolder.some(role => {
          const roleName = role.name || role
          return selectedDocuments.has(`role-folder:${roleName}::${folderName}`)
        })
      }
    }
  }) && !allSelected

  const handleBulkAction = (action) => {
    setSelectedBulkAction(action)
    const selectedCount = getSelectedFoldersCount()
    
    if (action === "Verwijder map") {
      if (selectedCount > 0) {
        setIsDeleteModalOpen(true)
      } else {
        alert("Selecteer eerst mappen om te verwijderen.")
        setSelectedBulkAction("Bulkacties")
      }
    } else if (action === "Rol toevoegen") {
      if (selectedCount > 0) {
        setIsAddRoleModalOpen(true)
      } else {
        alert("Selecteer eerst mappen om rollen aan toe te voegen.")
        setSelectedBulkAction("Bulkacties")
      }
    } else if (action === "Rol verwijderen") {
      if (selectedCount > 0) {
        setIsRemoveRoleModalOpen(true)
      } else {
        alert("Selecteer eerst mappen om rollen van te verwijderen.")
        setSelectedBulkAction("Bulkacties")
      }
    }
  }

  // Get selected folder names
  const getSelectedFolderNames = useCallback(() => {
    const selectedFolderNames = new Set()
    
    Array.from(selectedDocuments).forEach(docId => {
      if (docId.startsWith('folder-only:')) {
        selectedFolderNames.add(docId.replace('folder-only:', ''))
      } else if (docId.startsWith('role-folder:')) {
        const parts = docId.replace('role-folder:', '').split('::')
        if (parts.length === 2) {
          selectedFolderNames.add(parts[1]) // folder name
        }
      } else {
        const doc = filteredDocuments.find(d => d.id === docId)
        if (doc && doc.folder) {
          selectedFolderNames.add(doc.folder)
        }
      }
    })
    
    return Array.from(selectedFolderNames)
  }, [selectedDocuments, filteredDocuments])

  const handleAddRolesConfirm = async (selectedRoleNames) => {
    try {
      if (onAddRolesToFolders && selectedRoleNames.length > 0) {
        const folderNames = getSelectedFolderNames()
        const result = await onAddRolesToFolders(folderNames, selectedRoleNames)
        if (result?.success) {
          setSelectedDocuments(new Set())
          setIsAddRoleModalOpen(false)
          setSelectedBulkAction("Bulkacties")
        } else {
          throw new Error("Update failed")
        }
      }
    } catch (err) {
      console.error("Failed to add roles to folders:", err)
      const errorMessage = err.message || "Kon rollen niet toevoegen. Probeer het opnieuw."
      alert(errorMessage)
    }
  }

  const handleRemoveRolesConfirm = async (selectedRoleNames) => {
    try {
      if (onRemoveRolesFromFolders && selectedRoleNames.length > 0) {
        const folderNames = getSelectedFolderNames()
        const result = await onRemoveRolesFromFolders(folderNames, selectedRoleNames)
        if (result?.success) {
          setSelectedDocuments(new Set())
          setIsRemoveRoleModalOpen(false)
          setSelectedBulkAction("Bulkacties")
        } else {
          throw new Error("Update failed")
        }
      }
    } catch (err) {
      console.error("Failed to remove roles from folders:", err)
      const errorMessage = err.message || "Kon rollen niet verwijderen. Probeer het opnieuw."
      alert(errorMessage)
    }
  }

  const handleDeleteConfirm = async () => {
    try {
      if (onDeleteFolders) {
        const selectedDocs = getSelectedDocumentsData()
        
        if (selectedDocs.length > 0) {
          // Handle documents with roles and unassigned folders
        const pairSet = new Set();
          const unassignedFolders = new Set();

          selectedDocs.forEach(doc => {
            if (doc.role) {
          const key = `${doc.role}::${doc.folder}`;
          pairSet.add(key);
            } else if (doc.folder) {
              // Unassigned folder - collect folder names
              unassignedFolders.add(doc.folder);
            }
        });

        const role_names = [];
        const folder_names = [];

          // Process role/folder pairs (deduplicated by Set)
        pairSet.forEach(key => {
          const [role, folder] = key.split("::");
          role_names.push(role);
          folder_names.push(folder);
        });
          
          // For unassigned folders, we need to provide empty role names
          // The backend should handle this case
          unassignedFolders.forEach(folder => {
            folder_names.push(folder);
            role_names.push(""); // Empty role name for unassigned folders
          });

          // Ensure arrays have the same length
          if (role_names.length !== folder_names.length) {
            console.error("Mismatch in role_names and folder_names arrays:", { role_names, folder_names });
            alert("Error preparing deletion data. Please try again.");
            return;
          }

        const payload = { role_names, folder_names };

          // Wait for deletion and refresh to complete
        await onDeleteFolders(payload);

          // Clear selection after successful deletion
        setSelectedDocuments(new Set());
        } else {
          // This shouldn't happen as we require documents to be selected
          alert("Selecteer documenten om te verwijderen.")
        }
      }
    } catch (err) {
      console.error("Failed to delete folders:", err);
      alert("Failed to delete folders. Please try again.");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedBulkAction("Bulkacties");
    }
  };

  const handleDeleteClick = (doc) => {
    setSelectedDocuments(new Set([doc.id]))
    setIsDeleteModalOpen(true)
  }

  const getSelectedDocumentsData = () => {
    const docs = []
    const unassignedFolders = []
    const roleAssignedFolders = []
    
    Array.from(selectedDocuments).forEach(docId => {
      if (docId.startsWith('folder-only:')) {
        // This is an unassigned folder without documents
        const folderName = docId.replace('folder-only:', '')
        unassignedFolders.push({
          id: docId,
          folder: folderName,
          role: null,
          file: null
        })
      } else if (docId.startsWith('role-folder:')) {
        // This is a role-assigned folder without documents
        const parts = docId.replace('role-folder:', '').split('::')
        if (parts.length === 2) {
          const [roleName, folderName] = parts
          roleAssignedFolders.push({
            id: docId,
            folder: folderName,
            role: roleName,
            file: null
          })
        }
      } else {
        const doc = filteredDocuments.find(d => d.id === docId)
        if (doc) {
          docs.push(doc)
        }
      }
    })
    
    return [...docs, ...unassignedFolders, ...roleAssignedFolders]
  }

  const getHeaderText = () => {
    if (selectedFolderType === "Alle Mappen") {
      // Count all folders created by the admin
      const allFolderNames = folders
        .map(f => typeof f === 'string' ? f : f?.name)
        .filter(Boolean)
      return `${allFolderNames.length} map${allFolderNames.length !== 1 ? 'pen' : ''}`
    } else if (selectedFolderType === "Mappen met rollen") {
      if (selectedFolder && selectedFolder !== "Alle Rollen") {
        // Show count for selected role
        return `${uniqueFolders.length} map${uniqueFolders.length !== 1 ? 'pen' : ''} in rol "${selectedFolder}"`
      } else {
        // Show count for all folders with roles
        const foldersWithRolesList = folders
          .map(f => typeof f === 'string' ? f : f?.name)
          .filter(Boolean)
          .filter(folderName => foldersInRoles.has(folderName))
        return `${foldersWithRolesList.length} map${foldersWithRolesList.length !== 1 ? 'pen' : ''} met rollen`
      }
    } else if (selectedFolderType === "Mappen zonder rollen") {
      return `${foldersWithoutRoles.length} map${foldersWithoutRoles.length !== 1 ? 'pen' : ''} zonder rol`
    } else {
      return `${filteredDocuments.length} documenten`
    }
  }

  return (
    <div className="flex flex-col w-full">
      <div className="mb-[29px] font-montserrat font-extrabold text-[18px] leading-[100%]">
        {getHeaderText()}
        {getSelectedFoldersCount() > 0 && (
          <span className="ml-2 text-gray-600">
            ({getSelectedFoldersCount()} map{getSelectedFoldersCount() !== 1 ? 'pen' : ''} geselecteerd)
          </span>
        )}
      </div>

      <div className="flex w-full bg-[#F9FBFA] gap-4 py-2.5 px-2">
        <div className="w-3/10">
          <DropdownMenu
            value={selectedFolderType}
            onChange={setSelectedFolderType}
            allOptions={allOptions1}
            placeholder="Selecteer type..."
          />
        </div>
        {selectedFolderType === "Mappen met rollen" && (
        <div className="w-3/10">
          <DropdownMenu
            value={selectedFolder}
            onChange={setSelectedFolder}
            allOptions={allOptions2}
              placeholder="Selecteer rol..."
          />
        </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex w-full h-fit bg-[#F9FBFA] items-center justify-between px-2 py-1.5">
        <div className="flex w-2/3 gap-4 items-center">
          <div className="w-4/9">
            <DropdownMenu
              value={selectedBulkAction}
              onChange={handleBulkAction}
              allOptions={allOptions3}
              disabled={!canWrite}
            />
          </div>
          <div className="w-4/9">
            <SearchBox 
              placeholderText="Zoek map, rol, document..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        {canWrite && <AddButton onClick={() => onUploadTab()} text="Document toevoegen" />}
        {!canWrite && <div className="text-gray-500 text-sm italic">Alleen-lezen modus: U heeft geen schrijfrechten</div>}
      </div>

      {uniqueFolders.length === 0 ? (
        <div className="text-center py-4 text-gray-500 font-montserrat">
          {selectedFolderType === "Mappen zonder rollen" 
            ? "Geen mappen zonder rol gevonden." 
            : selectedFolderType === "Mappen met rollen"
            ? selectedFolder && selectedFolder !== "Alle Rollen"
              ? `Geen mappen gevonden voor rol "${selectedFolder}".`
              : "Geen mappen met rollen gevonden."
            : "Geen mappen gevonden."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-[#F9FBFA]">
              <tr className="h-[51px] border-b border-[#C5BEBE]">
                <SortableHeader 
                  sortKey="folder" 
                  onSort={requestSort} 
                  currentSort={sortConfig}
                  className="px-4 py-2"
                >
                  <div className="flex items-center gap-3">
                    {canWrite && (
                    <CheckBox 
                      toggle={allSelected} 
                      indeterminate={someSelected}
                      onChange={handleSelectAll}
                      color="#23BD92" 
                    />
                    )}
                    {!canWrite && <div className="w-5" />}
                    Map
                  </div>
                </SortableHeader>

                <th className="px-4 py-2 font-montserrat font-bold text-[16px] text-black">
                  Rollen
                </th>

                <th className="px-4 py-2 font-montserrat font-bold text-[16px] text-black">
                  Documenten
                </th>

                <th className="w-20 px-4 py-2 font-montserrat font-bold text-[16px] text-black text-center">
                  Acties
                </th>
              </tr>
            </thead>

            <tbody>
              {sortedFolderNames.map((folderName, index) => (
                <tr
                  key={folderName || `folder-${index}`}
                  className="w-full border-b border-[#C5BEBE] hover:bg-[#F9FBFA] transition-colors"
                >
                  <td className="w-1/4 px-4 py-4 font-montserrat text-[16px] text-black font-normal">
                    <div className="flex items-center gap-3">
                      {canWrite && (() => {
                        const folderDocs = filteredDocuments.filter(doc => doc.folder === folderName)
                        const hasDocuments = folderDocs.length > 0
                        const isUnassignedFolder = !foldersInRoles.has(folderName)
                        const isRoleAssignedFolder = foldersInRoles.has(folderName)
                        
                        // Determine if this folder is selected
                        let isFolderSelected = false
                        if (hasDocuments) {
                          // Folder has documents - check if all documents are selected
                          isFolderSelected = folderDocs.length > 0 && folderDocs.every(doc => selectedDocuments.has(doc.id))
                        } else {
                          // Folder has no documents - check folder markers
                          if (isUnassignedFolder) {
                            isFolderSelected = selectedDocuments.has(`folder-only:${folderName}`)
                          } else if (isRoleAssignedFolder) {
                            // Check if any role-folder marker exists for this folder
                            const rolesWithFolder = roles.filter(role => 
                              role.folders && role.folders.includes(folderName)
                            )
                            isFolderSelected = rolesWithFolder.some(role => {
                              const roleName = role.name || role
                              return selectedDocuments.has(`role-folder:${roleName}::${folderName}`)
                            })
                          }
                        }
                        
                        return (
                          <CheckBox 
                            toggle={isFolderSelected}
                            onChange={(isSelected) => {
                              if (hasDocuments) {
                                // Select/deselect all documents in this folder
                                folderDocs.forEach(doc => handleDocumentSelect(doc.id, isSelected))
                              } else {
                                // Folder has no documents - use folder markers
                                if (isUnassignedFolder) {
                                  if (isSelected) {
                                    setSelectedDocuments(prev => new Set(prev).add(`folder-only:${folderName}`))
                                  } else {
                                    setSelectedDocuments(prev => {
                                      const newSet = new Set(prev)
                                      newSet.delete(`folder-only:${folderName}`)
                                      return newSet
                                    })
                                  }
                                } else if (isRoleAssignedFolder) {
                                  // Find role for this folder
                                  const rolesWithFolder = roles.filter(role => 
                                    role.folders && role.folders.includes(folderName)
                                  )
                                  if (rolesWithFolder.length > 0) {
                                    const roleName = rolesWithFolder[0].name || rolesWithFolder[0]
                                    const marker = `role-folder:${roleName}::${folderName}`
                                    if (isSelected) {
                                      setSelectedDocuments(prev => new Set(prev).add(marker))
                                    } else {
                                      setSelectedDocuments(prev => {
                                        const newSet = new Set(prev)
                                        newSet.delete(marker)
                                        return newSet
                                      })
                                    }
                                  }
                                }
                              }
                            }}
                            color="#23BD92" 
                          />
                        )
                      })()}
                      {!canWrite && <div className="w-5" />}
                      <div className="flex items-center gap-2">
                        <span>{folderName}</span>
                        {(() => {
                          // Find folder metadata if available
                          // folders can be array of strings or array of objects
                          let folderMeta = null
                          if (Array.isArray(folders)) {
                            folderMeta = folders.find(f => {
                              if (typeof f === 'object' && f !== null) {
                                return f.name === folderName
                              }
                              return f === folderName
                            })
                          }
                          
                          // Only show metadata if it's an object with metadata
                          if (!folderMeta || typeof folderMeta !== 'object' || folderMeta === null) {
                            return null
                          }
                          
                          return (
                            <div className="flex items-center gap-1.5">
                              {folderMeta.origin === 'imported' && (
                                <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200" title="Geïmporteerd van Nextcloud">
                                  Geïmporteerd
                                </span>
                              )}
                              {folderMeta.origin === 'davi' && folderMeta.sync_enabled && (
                                <span className="text-xs px-1.5 py-0.5 bg-green-50 text-green-700 rounded border border-green-200" title="Gemaakt in DAVI, gesynchroniseerd met Nextcloud">
                                  DAVI
                                </span>
                              )}
                              {folderMeta.indexed && (
                                <span className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-200" title="Geïndexeerd voor RAG">
                                  Geïndexeerd
                                </span>
                              )}
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    {renderRoles(folderName)}
                  </td>

                  <td className="px-4 py-4">
                    {renderDocuments(folderName)}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-center items-center gap-4">
                      {/* Users button for the folder - only show for role-assigned folders */}
                      {(() => {
                        const folderDocs = filteredDocuments.filter(doc => doc.folder === folderName)
                        const hasDocuments = folderDocs.length > 0
                        const isRoleAssignedFolder = foldersInRoles.has(folderName)
                        
                        // Only show Users button if folder has documents AND is assigned to a role
                        if (hasDocuments && isRoleAssignedFolder) {
                          return (
                      <button
                        className="relative w-[19px] h-5 cursor-pointer"
                        title="Gebruikers"
                        onClick={() => {
                                const firstDoc = folderDocs[0]
                          if (firstDoc) {
                            onShowUsers(firstDoc.assigned_to, firstDoc.file, folderName, firstDoc.role)
                          }
                        }}
                      >
                        <Image src={GebruikersItem} alt="Gebruikers" fill className="object-contain" />
                        <div className="absolute inset-0 bg-[#23BD92] mix-blend-overlay"></div>
                      </button>
                          )
                        }
                        return <div className="w-[19px]" />
                      })()}

                      {/* Delete button for the folder */}
                      {canWrite && (() => {
                        const folderDocs = filteredDocuments.filter(doc => doc.folder === folderName)
                        const hasDocuments = folderDocs.length > 0
                        const isUnassignedFolder = !foldersInRoles.has(folderName)
                        const isRoleAssignedFolder = foldersInRoles.has(folderName)
                        
                        // Show delete button for:
                        // 1. Folders with documents
                        // 2. Unassigned folders (even without documents)
                        // 3. Role-assigned folders (even without documents)
                        if (hasDocuments || isUnassignedFolder || isRoleAssignedFolder) {
                          return (
                        <button 
                          onClick={() => {
                                if (hasDocuments) {
                                  // Select all documents in this folder for deletion
                              setSelectedDocuments(new Set(folderDocs.map(doc => doc.id)))
                                } else {
                                  // For folders without documents (assigned or unassigned), use special marker
                                  // We need to get the role name for assigned folders
                                  if (isRoleAssignedFolder) {
                                    // Find the role(s) that have this folder
                                    const rolesWithFolder = roles.filter(role => 
                                      role.folders && role.folders.includes(folderName)
                                    )
                                    if (rolesWithFolder.length > 0) {
                                      // Use the first role found (or we could handle multiple roles)
                                      const roleName = rolesWithFolder[0].name || rolesWithFolder[0]
                                      // Create a document-like entry for the delete handler
                                      setSelectedDocuments(new Set([`role-folder:${roleName}::${folderName}`]))
                                    } else {
                                      // Fallback to folder-only marker
                                      setSelectedDocuments(new Set([`folder-only:${folderName}`]))
                                    }
                                  } else {
                                    // Unassigned folder without documents
                                      setSelectedDocuments(new Set([`folder-only:${folderName}`]))
                                  }
                                }
                              setIsDeleteModalOpen(true)
                          }}
                          className="hover:opacity-80 transition-opacity"
                          title="Verwijder"
                        >
                          <RedCancelIcon />
                        </button>
                          )
                        }
                        return <div className="w-5" />
                      })()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center mb-[120px] xl:mb-0 bg-black/50"
          onClick={() => {
            setIsDeleteModalOpen(false);
            setSelectedBulkAction("Bulkacties");
          }}
        >
          <div className="p-6 w-fit" onClick={(e) => e.stopPropagation()}>
            <DeleteDocumentModal
              documents={getSelectedDocumentsData()}
              onClose={() => {
                setIsDeleteModalOpen(false);
                setSelectedBulkAction("Bulkacties");
              }}
              onConfirm={handleDeleteConfirm}
              isMultiple={getSelectedFoldersCount() > 1}
            />
          </div>
        </div>
      )}

      {/* Add Role Modal */}
      {isAddRoleModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center mb-[120px] xl:mb-0 bg-black/50"
          onClick={() => {
            setIsAddRoleModalOpen(false);
            setSelectedBulkAction("Bulkacties");
          }}
        >
          <div className="p-6 w-fit max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <AddRoleModal
              folders={getSelectedFolderNames()}
              roles={roles}
              onClose={() => {
                setIsAddRoleModalOpen(false);
                setSelectedBulkAction("Bulkacties");
              }}
              onConfirm={handleAddRolesConfirm}
            />
          </div>
        </div>
      )}

      {/* Remove Role Modal */}
      {isRemoveRoleModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center mb-[120px] xl:mb-0 bg-black/50"
          onClick={() => {
            setIsRemoveRoleModalOpen(false);
            setSelectedBulkAction("Bulkacties");
          }}
        >
          <div className="p-6 w-fit max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <RemoveRoleModal
              folders={getSelectedFolderNames()}
              roles={roles}
              onClose={() => {
                setIsRemoveRoleModalOpen(false);
                setSelectedBulkAction("Bulkacties");
              }}
              onConfirm={handleRemoveRolesConfirm}
            />
          </div>
        </div>
      )}
    </div>
  )
}
