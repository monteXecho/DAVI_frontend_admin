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
import SortableHeader from "@/components/SortableHeader"
import { useSortableData } from "@/lib/useSortableData"

export default function MappenTab({ 
  documents = {}, 
  roles = [],
  onUploadTab, 
  onShowUsers,
  onDeleteFolders      
}) {
  const [allOptions1, setAllOptions1] = useState([])
  const [allOptions2, setAllOptions2] = useState([])
  const [selectedRole, setSelectedRole] = useState("Alle Rollen")
  const [selectedFolder, setSelectedFolder] = useState("Alle Mappen")
  const allOptions3 = ["Bulkacties", "Verwijderen"]
  const [selectedBulkAction, setSelectedBulkAction] = useState(allOptions3[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState(new Set())

  const [expandedRoles, setExpandedRoles] = useState(new Set())
  const [expandedDocuments, setExpandedDocuments] = useState(new Set())

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

  const getDocumentsForRole = useCallback((role) => {
    if (!documents || !documents[role]) return []
    return documents[role].folders?.flatMap(folder =>
      folder.documents?.map(doc => ({
        id: `${role}-${folder.name}-${doc.file_name}`,
        folder: folder.name,
        file: doc.file_name,
        path: doc.path,
        uploaded_at: doc.uploaded_at,
        assigned_to: doc.assigned_to,
        role: role
      })) || []
    ) || []
  }, [documents])

  const getDocumentsForRoleAndFolder = useCallback((role, folder) => {
    if (!documents || !documents[role]) return []
    
    return documents[role].folders?.flatMap(folderData => {
      if (folder === "Alle Mappen" || folderData.name === folder) {
        return folderData.documents?.map(doc => ({
          id: `${role}-${folderData.name}-${doc.file_name}`,
          folder: folderData.name,
          file: doc.file_name,
          path: doc.path,
          uploaded_at: doc.uploaded_at,
          assigned_to: doc.assigned_to,
          role: role
        })) || []
      }
      return []
    }) || []
  }, [documents])

  const baseDocuments = useMemo(() => {
    let docs = []
    
    if (selectedRole === "Alle Rollen") {
      docs = getAllDocuments()
    } else {
      docs = selectedFolder === "Alle Mappen" 
        ? getDocumentsForRole(selectedRole)
        : getDocumentsForRoleAndFolder(selectedRole, selectedFolder)
    }
    
    return docs
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

  const uniqueFolders = useMemo(() => {
    const folders = new Set()
    filteredDocuments.forEach(doc => folders.add(doc.folder))
    return Array.from(folders)
  }, [filteredDocuments])

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

  const renderRolesWithDocuments = (folderName) => {
    const rolesWithDocs = getDocumentsByRoleForFolder(folderName)
    const isRolesExpanded = expandedRoles.has(folderName)
    const hasMultipleRoles = rolesWithDocs.length > 1
    
    const rolesToShow = isRolesExpanded ? rolesWithDocs : rolesWithDocs.slice(0, 1)
    const hiddenRolesCount = rolesWithDocs.length - 1

    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          {rolesToShow.map(({ role, documents, count }) => {
            const isDocumentsExpanded = expandedDocuments.has(`${folderName}::${role}`)
            const hasMultipleDocuments = count > 1

            return (
              <div key={`${folderName}-${role}`} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block bg-[#23BD92]/10 text-[#23BD92] font-semibold text-sm px-2 py-1 rounded-md whitespace-nowrap">
                    {role}
                  </span>
                  
                  <div className="flex flex-col gap-1 flex-1">
                    {hasMultipleDocuments ? (
                      <button
                        onClick={() => toggleDocumentsExpand(folderName, role)}
                        className="text-gray-600 text-sm hover:text-gray-800 hover:underline transition-colors flex items-center gap-1 text-left"
                      >
                        {count} document{count !== 1 ? 'en' : ''}
                        <span className="ml-1 text-xs">{isDocumentsExpanded ? '▲' : '▼'}</span>
                      </button>
                    ) : (
                      <span className="text-gray-800 text-sm">
                        {documents[0].file}
                      </span>
                    )}

                    {/* Expanded documents list */}
                    {isDocumentsExpanded && hasMultipleDocuments && (
                      <div className="flex flex-col gap-1 text-gray-700 text-sm">
                        {documents.map((doc, index) => (
                          <div key={doc.id} className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0"></span>
                            <span className="break-words">{doc.file}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
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
    if (action === "Verwijderen") {
      if (selectedDocuments.size > 0) {
        setIsDeleteModalOpen(true)
      } else {
        alert("Selecteer eerst mappen om te verwijderen.")
        setSelectedBulkAction("Bulkacties")
      }
    }
  }

  const handleDeleteConfirm = async () => {
    try {
      if (onDeleteFolders && selectedDocuments.size > 0) {
        const pairSet = new Set();

        getSelectedDocumentsData().forEach(doc => {
          const key = `${doc.role}::${doc.folder}`;
          pairSet.add(key);
        });

        const role_names = [];
        const folder_names = [];

        pairSet.forEach(key => {
          const [role, folder] = key.split("::");
          role_names.push(role);
          folder_names.push(folder);
        });

        const payload = { role_names, folder_names };

        await onDeleteFolders(payload);

        setSelectedDocuments(new Set());
      }
    } catch (err) {
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

  const getSelectedDocumentsData = () =>
    Array.from(selectedDocuments).map(docId => filteredDocuments.find(doc => doc.id === docId)).filter(Boolean)

  const getHeaderText = () => {
    if (selectedRole === "Alle Rollen" && selectedFolder === "Alle Mappen") {
      return `${filteredDocuments.length} documenten`
    } else if (selectedRole === "Alle Rollen") {
      return `${filteredDocuments.length} documenten in map "${selectedFolder}"`
    } else if (selectedFolder === "Alle Mappen") {
      return `${filteredDocuments.length} documenten met de rol "${selectedRole}"`
    } else {
      return `${filteredDocuments.length} documenten in map "${selectedFolder}" van rol "${selectedRole}"`
    }
  }

  return (
    <div className="flex flex-col w-full">
      <div className="mb-[29px] font-montserrat font-extrabold text-[18px] leading-[100%]">
        {getHeaderText()}
        {selectedDocuments.size > 0 && (
          <span className="ml-2 text-gray-600">
            ({selectedDocuments.size} geselecteerd)
          </span>
        )}
      </div>

      <div className="flex w-full bg-[#F9FBFA] gap-4 py-2.5 px-2">
        <div className="w-3/10">
          <DropdownMenu
            value={selectedRole}
            onChange={setSelectedRole}
            allOptions={allOptions1}
            placeholder="Selecteer rol..."
          />
        </div>
        <div className="w-3/10">
          <DropdownMenu
            value={selectedFolder}
            onChange={setSelectedFolder}
            allOptions={allOptions2}
            placeholder="Selecteer map..."
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
            />
          </div>
          <div className="w-4/9">
            <SearchBox 
              placeholderText="Zoek document, map..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <AddButton onClick={() => onUploadTab()} text="Toevoegen" />
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="text-center py-4 text-gray-500 font-montserrat">
          Geen documenten gevonden.
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
                    <CheckBox 
                      toggle={allSelected} 
                      indeterminate={someSelected}
                      onChange={handleSelectAll}
                      color="#23BD92" 
                    />
                    Map
                  </div>
                </SortableHeader>

                <th className="px-4 py-2 font-montserrat font-bold text-[16px] text-black">
                  Rollen & Documenten
                </th>

                <th className="w-20 px-4 py-2 font-montserrat font-bold text-[16px] text-black text-center">
                  Acties
                </th>
              </tr>
            </thead>

            <tbody>
              {uniqueFolders.map((folderName) => (
                <tr
                  key={folderName}
                  className="w-full border-b border-[#C5BEBE] hover:bg-[#F9FBFA] transition-colors"
                >
                  <td className="w-1/4 px-4 py-4 font-montserrat text-[16px] text-black font-normal">
                    <div className="flex items-center gap-3">
                      <CheckBox 
                        toggle={filteredDocuments
                          .filter(doc => doc.folder === folderName)
                          .every(doc => selectedDocuments.has(doc.id))}
                        onChange={(isSelected) => {
                          const folderDocIds = filteredDocuments
                            .filter(doc => doc.folder === folderName)
                            .map(doc => doc.id)
                          folderDocIds.forEach(docId => handleDocumentSelect(docId, isSelected))
                        }}
                        color="#23BD92" 
                      />
                      {folderName}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    {renderRolesWithDocuments(folderName)}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-center items-center gap-4">
                      {/* Users button for the folder */}
                      <button
                        className="relative w-[19px] h-5 cursor-pointer"
                        title="Gebruikers"
                        onClick={() => {
                          const firstDoc = filteredDocuments.find(doc => doc.folder === folderName)
                          if (firstDoc) {
                            onShowUsers(firstDoc.assigned_to, firstDoc.file, folderName, firstDoc.role)
                          }
                        }}
                      >
                        <Image src={GebruikersItem} alt="Gebruikers" fill className="object-contain" />
                        <div className="absolute inset-0 bg-[#23BD92] mix-blend-overlay"></div>
                      </button>

                      {/* Delete button for the folder */}
                      <button 
                        onClick={() => {
                          const folderDocs = filteredDocuments.filter(doc => doc.folder === folderName)
                          if (folderDocs.length > 0) {
                            setSelectedDocuments(new Set(folderDocs.map(doc => doc.id)))
                            setIsDeleteModalOpen(true)
                          }
                        }}
                        className="hover:opacity-80 transition-opacity"
                        title="Verwijder"
                      >
                        <RedCancelIcon />
                      </button>
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
              isMultiple={selectedDocuments.size > 1}
            />
          </div>
        </div>
      )}
    </div>
  )
}