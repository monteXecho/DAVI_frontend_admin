'use client'
import { useEffect, useState, useMemo, useCallback } from "react"

import AddButton from "@/components/buttons/AddButton"
import CheckBox from "@/components/buttons/CheckBox"
import SearchBox from "@/components/input/SearchBox"
import DropdownMenu from "@/components/input/DropdownMenu"
import RedCancelIcon from "@/components/icons/RedCancelIcon"
import DownArrow from "@/components/icons/DownArrowIcon"
import DeleteDocumentModal from "./modals/DeleteDocumentModal"

export default function MappenTab({ 
  documents = {}, 
  roles = [], // Receive roles from parent
  onUploadTab, 
  onDeleteDocuments 
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
  const [deleteMode, setDeleteMode] = useState("single") 

  // Use roles prop to populate role dropdown
  useEffect(() => {
    const roleNames = roles.map(role => role.name || role)
    setAllOptions1(["Alle Rollen", ...roleNames])
  }, [roles])

  // Update folder dropdown based on selected role
  useEffect(() => {
    if (selectedRole === "Alle Rollen") {
      // Only show "Alle Mappen" when viewing all roles
      setAllOptions2(["Alle Mappen"])
    } else if (documents && documents[selectedRole]) {
      // Get folders for selected role
      const roleFolders = documents[selectedRole].folders?.map(folder => folder.name) || []
      setAllOptions2(["Alle Mappen", ...roleFolders])
    } else {
      setAllOptions2(["Alle Mappen"])
    }
  }, [selectedRole, documents]);

  // Reset folder selection when role changes
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

  const getAllFoldersForFile = useCallback((fileName) => {
    const folders = []
    Object.values(documents || {}).forEach(role => {
      role.folders?.forEach(folder => {
        const hasFile = folder.documents?.some(doc => doc.file_name === fileName)
        if (hasFile) folders.push(folder.name)
      })
    })
    return folders
  }, [documents])

  const getAllRolesForFile = useCallback((fileName) => {
    const roles = []
    Object.entries(documents || {}).forEach(([roleName, roleData]) => {
      if (roleData.folders?.some(folder => folder.documents?.some(doc => doc.file_name === fileName))) {
        roles.push(roleName)
      }
    })
    return roles
  }, [documents])

  const filteredDocuments = useMemo(() => {
    let docs = []
    
    if (selectedRole === "Alle Rollen") {
      docs = getAllDocuments()
    } else {
      docs = selectedFolder === "Alle Mappen" 
        ? getDocumentsForRole(selectedRole)
        : getDocumentsForRoleAndFolder(selectedRole, selectedFolder)
    }
    
    if (searchQuery.trim()) {
      docs = docs.filter(doc => doc.file.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    
    return docs
  }, [
    getAllDocuments, 
    getDocumentsForRole, 
    getDocumentsForRoleAndFolder, 
    selectedRole, 
    selectedFolder, 
    searchQuery
  ])

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
        setDeleteMode("bulk")
        setIsDeleteModalOpen(true)
      } else {
        alert("Selecteer eerst documenten om te verwijderen.")
        setSelectedBulkAction("Bulkacties")
      }
    }
  }

  const handleDeleteConfirm = async () => {
    try {
      if (onDeleteDocuments && selectedDocuments.size > 0) {
        const docsToDelete = getSelectedDocumentsData().map(doc => ({
          fileName: doc.file,
          role: doc.role,
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

  const handleDeleteClick = (doc) => {
    setSelectedDocuments(new Set([doc.id]))
    setDeleteMode("single")
    setIsDeleteModalOpen(true)
  }

  const getSelectedDocumentsData = () =>
    Array.from(selectedDocuments).map(docId => filteredDocuments.find(doc => doc.id === docId)).filter(Boolean)

  // Generate header text based on selections
  const getHeaderText = () => {
    if (selectedRole === "Alle Rollen" && selectedFolder === "Alle Mappen") {
      return `${filteredDocuments.length} document${filteredDocuments.length !== 1 ? 'en' : ''}`
    } else if (selectedRole === "Alle Rollen") {
      return `${filteredDocuments.length} document${filteredDocuments.length !== 1 ? 'en' : ''} in map "${selectedFolder}"`
    } else if (selectedFolder === "Alle Mappen") {
      return `${filteredDocuments.length} document${filteredDocuments.length !== 1 ? 'en' : ''} met de rol "${selectedRole}"`
    } else {
      return `${filteredDocuments.length} document${filteredDocuments.length !== 1 ? 'en' : ''} in map "${selectedFolder}" van rol "${selectedRole}"`
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

      <div className="flex w-full bg-[#F9FBFA] gap-4 py-[10px] px-2">
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

      <div className="flex w-full h-fit bg-[#F9FBFA] items-center justify-between px-2 py-[6px]">
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
              placeholderText="Zoek document..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <AddButton onClick={() => onUploadTab()} text="Toevoegen" />
      </div>

      {/* Check if there are no documents or if documents for the selected role/folder are empty */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          {selectedRole === "Alle Rollen" && selectedFolder === "Alle Mappen" 
            ? "Er zijn geen documenten beschikbaar."
            : selectedRole === "Alle Rollen"
            ? `Er zijn geen documenten beschikbaar in map "${selectedFolder}".`
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
                <th className="px-4 py-2 font-montserrat font-bold text-[16px] text-black">
                  <div className="flex items-center gap-3">
                    <CheckBox 
                      toggle={allSelected} 
                      indeterminate={someSelected}
                      onChange={handleSelectAll}
                      color="#23BD92" 
                    />
                    <span>Map</span>
                    <DownArrow />
                  </div>
                </th>
                <th className="px-4 py-2 font-montserrat font-bold text-[16px] text-black">
                  <div className="flex items-center gap-3">
                    Document
                    <DownArrow />
                  </div>
                </th>
                <th className="w-[52px] px-4 py-2"></th>
              </tr>
            </thead>

            <tbody>
              {filteredDocuments.map((doc, i) => (
                <tr
                  key={doc.id}
                  className="w-full items-center h-[51px] border-b border-[#C5BEBE] hover:bg-[#F9FBFA] transition-colors"
                >
                  <td className="px-4 py-2 font-montserrat text-[16px] text-black font-normal">
                    <div className="flex items-center gap-3">
                      <CheckBox 
                        toggle={selectedDocuments.has(doc.id)} 
                        onChange={(isSelected) => handleDocumentSelect(doc.id, isSelected)}
                        color="#23BD92" 
                      />
                      {doc.folder}
                    </div>
                  </td>
                  <td className="px-4 py-2 font-montserrat text-[16px] text-black font-normal">
                    {doc.file}
                  </td>
                  <td className="px-4 py-2 h-full">
                    <div className="flex h-full items-center gap-3">
                      <button 
                        title="Verwijder"
                        onClick={() => handleDeleteClick(doc)}
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
    </div>
  )
}