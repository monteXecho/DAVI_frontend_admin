'use client'
import { useEffect, useState, useMemo, useCallback } from "react"
import Image from "next/image"

import AddButton from "@/components/buttons/AddButton"
import CheckBox from "@/components/buttons/CheckBox"
import SearchBox from "@/components/input/SearchBox"
import DropdownMenu from "@/components/input/DropdownMenu"
import RedCancelIcon from "@/components/icons/RedCancelIcon"
import GreenFolderIcon from "@/components/icons/GreenFolderIcon"
import RollenItem from "@/assets/rollen_item.png"
import GebruikersItem from "@/assets/gebruikers_item.png"
import DeleteDocumentModal from "./modals/DeleteDocumentModal"
import ReplaceDocumentsModal from "./modals/ReplaceDocumentsModal"
import SortableHeader from "@/components/SortableHeader"
import { useSortableData } from "@/lib/useSortableData"

export default function AllDocumentsTab({ 
  documents = {}, 
  roles = [],
  onUploadTab, 
  onShowUsers, 
  onShowRoles, 
  onShowFolders, 
  onDeleteDocuments,
  onReplaceDocuments,
  canWrite = true 
}) {
  const [allOptions1, setAllOptions1] = useState([])
  const [allOptions2, setAllOptions2] = useState([])
  const [selectedRole, setSelectedRole] = useState("Alle Rollen")
  const [selectedFolder, setSelectedFolder] = useState("Alle Mappen")
  const allOptions3 = ["Bulkacties", "Verwijder document", "Vervang document"] 
  const [selectedBulkAction, setSelectedBulkAction] = useState(allOptions3[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false) 
  const [selectedDocuments, setSelectedDocuments] = useState(new Set())
  const [deleteMode, setDeleteMode] = useState("single")
  const [expandedRoles, setExpandedRoles] = useState(new Set())

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const roleParam = searchParams.get('role');
      
      if (roleParam) {
        setSelectedRole(roleParam);
      }
    }
  }, []);

  useEffect(() => {
    const roleNames = roles.map(role => role.name || role)
    setAllOptions1(["Alle Rollen", ...roleNames])
  }, [roles])

  useEffect(() => {
    if (selectedRole === "Alle Rollen") {
      setAllOptions2(["Alle Mappen"])
    } else if (documents && documents[selectedRole]) {
      const roleFolders = documents[selectedRole].folders?.map(folder => folder.name) || []
      setAllOptions2(["Alle Mappen", ...roleFolders])
    } else {
      setAllOptions2(["Alle Mappen"])
    }
  }, [selectedRole, documents]);

  useEffect(() => {
    setSelectedFolder("Alle Mappen");
  }, [selectedRole]);

  const getAllDocuments = useCallback(() => {
    if (!documents) return []
    const allDocs = []
    Object.entries(documents).forEach(([roleName, roleData]) => {
      roleData.folders.forEach(folder => {
        folder.documents.forEach(doc => {
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

  const getDocumentsForRole = useCallback((role) => {
    if (!documents || !documents[role]) return []
    return documents[role].folders.flatMap(folder =>
      folder.documents.map(doc => ({
        id: `${role}-${folder.name}-${doc.file_name}`,
        folder: folder.name,
        file: doc.file_name,
        path: doc.path,
        uploaded_at: doc.uploaded_at,
        assigned_to: doc.assigned_to,
        role: role
      }))
    )
  }, [documents])

  const getDocumentsForRoleAndFolder = useCallback((role, folder) => {
    if (!documents || !documents[role]) return []
    
    return documents[role].folders.flatMap(folderData => {
      if (folder === "Alle Mappen" || folderData.name === folder) {
        return folderData.documents.map(doc => ({
          id: `${role}-${folderData.name}-${doc.file_name}`,
          folder: folderData.name,
          file: doc.file_name,
          path: doc.path,
          uploaded_at: doc.uploaded_at,
          assigned_to: doc.assigned_to,
          role: role
        }))
      }
      return []
    })
  }, [documents])

  const getAllFoldersForFile = useCallback((fileName) => {
    const folders = []
    Object.values(documents || {}).forEach(role => {
      role.folders.forEach(folder => {
        const hasFile = folder.documents.some(doc => doc.file_name === fileName)
        if (hasFile) folders.push(folder.name)
      })
    })
    return folders
  }, [documents])

  const getAllRolesForFile = useCallback((fileName) => {
    const roles = []
    Object.entries(documents || {}).forEach(([roleName, roleData]) => {
      if (roleData.folders.some(folder => folder.documents.some(doc => doc.file_name === fileName))) {
        roles.push(roleName)
      }
    })
    return roles
  }, [documents])

  const baseDocuments = useMemo(() => {
    if (selectedRole === "Alle Rollen") {
      return getAllDocuments()
    } else {
      return selectedFolder === "Alle Mappen" 
        ? getDocumentsForRole(selectedRole)
        : getDocumentsForRoleAndFolder(selectedRole, selectedFolder)
    }
  }, [
    getAllDocuments, 
    getDocumentsForRole, 
    getDocumentsForRoleAndFolder,
    selectedRole, 
    selectedFolder
  ])

  const { items: sortedDocuments, requestSort, sortConfig } = useSortableData(baseDocuments)

  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return sortedDocuments
    
    const lowerSearch = searchQuery.toLowerCase()
    return sortedDocuments.filter(doc => 
      doc.file.toLowerCase().includes(lowerSearch) ||
      doc.folder.toLowerCase().includes(lowerSearch) ||
      doc.role.toLowerCase().includes(lowerSearch)
    )
  }, [sortedDocuments, searchQuery])

  // Group documents by folder + file name, collecting all roles
  const groupedDocuments = useMemo(() => {
    const grouped = new Map()
    
    filteredDocuments.forEach(doc => {
      const key = `${doc.folder}::${doc.file}`
      if (!grouped.has(key)) {
        grouped.set(key, {
          folder: doc.folder,
          file: doc.file,
          path: doc.path,
          uploaded_at: doc.uploaded_at,
          roles: [],
          documents: [] // Store all document objects for this folder+file combo
        })
      }
      const group = grouped.get(key)
      if (!group.roles.includes(doc.role)) {
        group.roles.push(doc.role)
      }
      group.documents.push(doc)
    })
    
    return Array.from(grouped.values())
  }, [filteredDocuments])

  const toggleRolesExpand = (key) => {
    setExpandedRoles(prev => {
      const newSet = new Set(prev)
      newSet.has(key) ? newSet.delete(key) : newSet.add(key)
      return newSet
    })
  }

  const renderRoles = (roles, folder, file) => {
    const key = `${folder}::${file}`
    const isExpanded = expandedRoles.has(key)
    const hasMultipleRoles = roles.length > 1
    
    const rolesToShow = isExpanded ? roles : roles.slice(0, 1)
    const hiddenRolesCount = roles.length - 1

    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2 items-center">
          {rolesToShow.map((role) => (
            <span 
              key={`${key}-${role}`}
              className="inline-block bg-[#23BD92]/10 text-[#23BD92] font-semibold text-sm px-2 py-1 rounded-md whitespace-nowrap"
            >
              {role}
            </span>
          ))}
        </div>

        {hasMultipleRoles && (
          <div className="flex items-center">
            <button
              onClick={() => toggleRolesExpand(key)}
              className="flex items-center gap-1 text-[#23BD92] text-sm font-medium hover:text-[#1da67c] transition-colors"
            >
              <span>
                {isExpanded 
                  ? `Minder tonen` 
                  : `+${hiddenRolesCount} meer rol${hiddenRolesCount !== 1 ? 'len' : ''}`
                }
              </span>
              <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
          </div>
        )}
      </div>
    )
  }

  const getSelectedDocumentsData = useCallback(() =>
    Array.from(selectedDocuments).map(docId => filteredDocuments.find(doc => doc.id === docId)).filter(Boolean)
  , [selectedDocuments, filteredDocuments])

  const getSelectedRoleFolderCombinations = useCallback(() => {
    const combinations = new Set()
    getSelectedDocumentsData().forEach(doc => {
      combinations.add(`${doc.role}::${doc.folder}`)
    })
    return Array.from(combinations).map(combo => {
      const [role, folder] = combo.split('::')
      return { role, folder }
    })
  }, [getSelectedDocumentsData])

  const handleDocumentSelect = (docId, isSelected) => {
    setSelectedDocuments(prev => {
      const newSelected = new Set(prev)
      isSelected ? newSelected.add(docId) : newSelected.delete(docId)
      return newSelected
    })
  }

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedDocuments(new Set(filteredDocuments.map(doc => doc.id)))
    } else {
      setSelectedDocuments(new Set())
    }
  }

  const allSelected = filteredDocuments.length > 0 && filteredDocuments.every(doc => selectedDocuments.has(doc.id))
  const someSelected = filteredDocuments.some(doc => selectedDocuments.has(doc.id)) && !allSelected

  const handleBulkAction = (action) => {
    setSelectedBulkAction(action)
    if (action === "Verwijder document") {
      if (selectedDocuments.size > 0) {
        setDeleteMode("bulk")
        setIsDeleteModalOpen(true)
      } else {
        alert("Selecteer eerst documenten om te verwijderen.")
        setSelectedBulkAction("Bulkacties")
      }
    }
    if (action === "Vervang document") {
      if (selectedDocuments.size > 0) {
        setIsReplaceModalOpen(true)
      } else {
        alert("Selecteer eerst documenten om te vervangen.")
        setSelectedBulkAction("Bulkacties")
      }
    }
  }

  const handleDeleteConfirm = async () => {
    try {
      if (onDeleteDocuments && selectedDocuments.size > 0) {
        const docsToDelete = getSelectedDocumentsData().map(doc => ({
          fileName: doc.file,
          folderName: doc.folder,
          path: doc.path
        }))
        await onDeleteDocuments(docsToDelete)
        setSelectedDocuments(new Set())
      }
    } catch (err) {
      alert("Failed to delete documents. Please try again.")
    } finally {
      setIsDeleteModalOpen(false)
      setSelectedBulkAction("Bulkacties")
    }
  }

  const handleReplaceConfirm = async (files) => {
    try {
      if (onReplaceDocuments && selectedDocuments.size > 0 && files.length > 0) {
        const docsToDelete = getSelectedDocumentsData().map(doc => ({
          fileName: doc.file,
          folderName: doc.folder,
          path: doc.path,
        }))
        
        const uploadTargets = getSelectedRoleFolderCombinations()
        
        await onReplaceDocuments(docsToDelete, files, uploadTargets)
        setSelectedDocuments(new Set())
        setIsReplaceModalOpen(false)
        setSelectedBulkAction("Bulkacties")
      }
    } catch (err) {
      alert("Failed to replace documents. Please try again.")
    }
  }

  const handleDeleteClick = (doc) => {
    setSelectedDocuments(new Set([doc.id]))
    setDeleteMode("single")
    setIsDeleteModalOpen(true)
  }


  const getHeaderText = () => {
    const uniqueDocCount = groupedDocuments.length
    if (selectedRole === "Alle Rollen") {
      return `${uniqueDocCount} document${uniqueDocCount !== 1 ? 'en' : ''}`
    } else if (selectedFolder === "Alle Mappen") {
      return `${uniqueDocCount} document${uniqueDocCount !== 1 ? 'en' : ''} met de rol "${selectedRole}"`
    } else {
      return `${uniqueDocCount} document${uniqueDocCount !== 1 ? 'en' : ''} in map "${selectedFolder}" van rol "${selectedRole}"`
    }
  }

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="mb-[29px] font-montserrat font-extrabold text-[18px] leading-[100%]">
        {getHeaderText()}
        {selectedDocuments.size > 0 && (
          <span className="ml-2 text-gray-600">
            ({selectedDocuments.size} geselecteerd)
          </span>
        )}
      </div>

      {/* Role and Folder Filters */}
      <div className="flex w-full bg-[#F9FBFA] gap-4 py-2.5 px-2">
        <div className="w-3/10">
          <DropdownMenu
            value={selectedRole}
            onChange={setSelectedRole}
            allOptions={allOptions1}
          />
        </div>
        <div className="w-3/10">
          <DropdownMenu
            value={selectedFolder}
            onChange={setSelectedFolder}
            allOptions={allOptions2}
            placeholder="Selecteer map..."
            disabled={selectedRole === "Alle Rollen"} 
          />
        </div>
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
        {canWrite && <AddButton onClick={() => onUploadTab()} text="Toevoegen" />}
        {!canWrite && <div className="text-gray-500 text-sm italic">Alleen-lezen modus: U heeft geen schrijfrechten</div>}
      </div>

      {/* Documents Table */}
      {groupedDocuments.length === 0 ? (
        <div className="text-center py-4 text-gray-500 font-montserrat">
          {selectedRole === "Alle Rollen"
            ? "Er zijn geen documenten beschikbaar."
            : selectedFolder === "Alle Mappen"
            ? `Er zijn geen documenten beschikbaar voor de rol "${selectedRole}".`
            : `Er zijn geen documenten beschikbaar in map "${selectedFolder}" van rol "${selectedRole}".`
          }
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

                {selectedRole === "Alle Rollen" && (
                  <th className="px-4 py-2 font-montserrat font-bold text-[16px] text-black">
                    Rollen
                  </th>
                )}

                <SortableHeader 
                  sortKey="file" 
                  onSort={requestSort} 
                  currentSort={sortConfig}
                  className="px-4 py-2"
                >
                  Document
                </SortableHeader>

                <th className="w-[180px] px-4 py-2 font-montserrat font-bold text-[16px] text-black text-center">
                  Acties
                </th>
              </tr>
            </thead>

            <tbody>
              {groupedDocuments.map((group) => {
                const key = `${group.folder}::${group.file}`
                // Check if any document in this group is selected
                const groupDocIds = group.documents.map(doc => doc.id)
                const isGroupSelected = groupDocIds.some(id => selectedDocuments.has(id))
                const allGroupSelected = groupDocIds.every(id => selectedDocuments.has(id))
                
                return (
                  <tr
                    key={key}
                    className="border-b border-[#C5BEBE] hover:bg-[#F9FBFA] transition-colors"
                  >
                    <td className="px-4 py-2 font-montserrat text-[16px] text-black font-normal">
                      <div className="flex items-center gap-3">
                        {canWrite && (
                          <CheckBox 
                            toggle={allGroupSelected}
                            indeterminate={isGroupSelected && !allGroupSelected}
                            onChange={(isSelected) => {
                              groupDocIds.forEach(docId => handleDocumentSelect(docId, isSelected))
                            }}
                            color="#23BD92" 
                          />
                        )}
                        {!canWrite && <div className="w-5" />}
                        {group.folder}
                      </div>
                    </td>

                    {selectedRole === "Alle Rollen" && (
                      <td className="px-4 py-2 font-montserrat text-[16px] text-black font-normal">
                        {renderRoles(group.roles, group.folder, group.file)}
                      </td>
                    )}

                    <td className="px-4 py-2 font-montserrat text-[16px] text-black font-normal">
                      {group.file}
                    </td>

                    <td className="px-4 py-2">
                      <div className="flex justify-center items-center gap-4">
                        <button
                          className="relative w-[19px] h-5 cursor-pointer"
                          title="Gebruikers"
                          onClick={() => {
                            // Use the first document's assigned_to (they should all be the same)
                            const firstDoc = group.documents[0]
                            if (firstDoc) {
                              onShowUsers(firstDoc.assigned_to, group.file)
                            }
                          }}
                        >
                          <Image src={GebruikersItem} alt="Gebruikers" fill className="object-contain" />
                          <div className="absolute inset-0 bg-[#23BD92] mix-blend-overlay"></div>
                        </button>

                        <button
                          className="relative w-[25px] h-[27px] cursor-pointer"
                          title="Rollen"
                          onClick={() => {
                            onShowRoles(group.file, group.roles);
                          }}
                        >
                          <Image src={RollenItem} alt="Rollen" fill className="object-contain" />
                          <div className="absolute inset-0 bg-[#23BD92] mix-blend-overlay"></div>
                        </button>

                        <button 
                          className="cursor-pointer transition-opacity" 
                          title="Mappen"
                          onClick={() => {
                            onShowFolders(group.file, [group.folder]);
                          }}
                        >
                          <GreenFolderIcon />
                        </button>

                        {canWrite && (
                          <button 
                            className="cursor-pointer transition-opacity"
                            title="Verwijder"
                            onClick={() => {
                              // Select all documents in this group for deletion
                              setSelectedDocuments(new Set(groupDocIds))
                              setDeleteMode("single")
                              setIsDeleteModalOpen(true)
                            }}
                          >
                            <RedCancelIcon />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
              isMultiple={selectedDocuments.size > 1}
            />
          </div>
        </div>
      )}

      {/* >>> NEW <<< Replace Documents Modal */}
      {isReplaceModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center mb-[120px] xl:mb-0 bg-black/50"
          onClick={() => {
            setIsReplaceModalOpen(false);
            setSelectedBulkAction("Bulkacties");
          }}
        >
          <div className="p-6 w-fit" onClick={(e) => e.stopPropagation()}>
            <ReplaceDocumentsModal
              documents={getSelectedDocumentsData()}
              uploadTargets={getSelectedRoleFolderCombinations()}
              onClose={() => {
                setIsReplaceModalOpen(false);
                setSelectedBulkAction("Bulkacties");
              }}
              onConfirm={handleReplaceConfirm}
              isMultiple={selectedDocuments.size > 1}
            />
          </div>
        </div>
      )}
    </div>
  )
}