'use client'
import { useEffect, useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"

import SearchBox from "@/components/input/SearchBox"
import DropdownMenu from "@/components/input/DropdownMenu"
import RedCancelIcon from "@/components/icons/RedCancelIcon"
import DeleteDocumentModal from "./DeleteDocumentModal"
import SortableHeader from "@/components/SortableHeader"
import { useSortableData } from "@/lib/useSortableData"
import { useApi } from "@/lib/useApi"

export default function MijnTab() {
  const { getPrivateDocuments, deletePrivateDocuments, getAllUserDocuments, downloadDocument } = useApi()
  const router = useRouter()
  const documentTypeOptions = ["Alle", "Eigen documenten", "Toegekende documenten"]
  const [selectedDocumentType, setSelectedDocumentType] = useState(documentTypeOptions[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState(new Set())
  const [documents, setDocuments] = useState(null)
  const [deleteMode, setDeleteMode] = useState("single")

  const refreshData = useCallback(async () => {
    try {
      const docsRes = await getAllUserDocuments()
      if (docsRes?.data?.documents) setDocuments(docsRes.data.documents)
    } catch (err) {
      console.error("Failed to refresh data:", err)
    }
  }, [getAllUserDocuments])

  useEffect(() => {
    const init = async () => {
      try {
        await refreshData()
      } catch (err) {
        console.error("Initialization failed:", err)
      } finally {
      }
    }
    init()
  }, [refreshData])

  const handleDeleteDocuments = async (documentsToDelete) => {
    try {
      const res = await deletePrivateDocuments(documentsToDelete)
      if (res?.success) {
        await refreshData()
        return res
      }
    } catch (err) {
      console.error("Failed to delete documents:", err)
      throw err
    }
  }

  const getAllDocuments = useCallback(() => {
    if (!Array.isArray(documents)) return []

    return documents.map(doc => ({
      id: doc.file_name,
      file_name: doc.file_name,
      file_name_lower: (doc.file_name || "").toLowerCase(),
      upload_type: doc.upload_type || "document",
      is_private: doc.is_private !== undefined ? doc.is_private : (doc.upload_type === "document"),
      path: doc.path || ""
    }))
  }, [documents])

  const baseDocuments = useMemo(() => {
    const allDocs = getAllDocuments()
    
    let filteredDocs = []
    
    // Filter by document type
    if (selectedDocumentType === "Alle") {
      filteredDocs = allDocs
    } else if (selectedDocumentType === "Eigen documenten") {
      filteredDocs = allDocs.filter(doc => doc.is_private)
    } else if (selectedDocumentType === "Toegekende documenten") {
      filteredDocs = allDocs.filter(doc => !doc.is_private)
    } else {
      filteredDocs = allDocs
    }
    
    // For RoleBased documents, deduplicate by file_name (keep only unique file names)
    if (selectedDocumentType === "Toegekende documenten" || selectedDocumentType === "Alle") {
      const seen = new Set()
      const uniqueDocs = []
      const roleBasedDocs = []
      const privateDocs = []
      
      for (const doc of filteredDocs) {
        if (doc.is_private) {
          privateDocs.push(doc)
        } else {
          roleBasedDocs.push(doc)
        }
      }
      
      // Add all private documents (no duplicates)
      uniqueDocs.push(...privateDocs)
      
      // Add only unique RoleBased documents by file_name
      for (const doc of roleBasedDocs) {
        if (!seen.has(doc.file_name)) {
          seen.add(doc.file_name)
          uniqueDocs.push(doc)
        }
      }
      
      return uniqueDocs
    }
    
    return filteredDocs
  }, [getAllDocuments, selectedDocumentType])

  const { items: sortedDocuments, requestSort, sortConfig } = useSortableData(baseDocuments)

  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return sortedDocuments

    const lowerSearch = searchQuery.toLowerCase()
    return sortedDocuments.filter(doc =>
      doc.file_name.toLowerCase().includes(lowerSearch)
    )
  }, [sortedDocuments, searchQuery])

  const handleDocumentSelect = (docId, isSelected) => {
    setSelectedDocuments(prev => {
      const newSelected = new Set(prev)
      isSelected ? newSelected.add(docId) : newSelected.delete(docId)
      return newSelected
    })
  }

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      // Only select private documents (they can be deleted)
      const privateDocs = filteredDocuments.filter(doc => doc.is_private)
      setSelectedDocuments(new Set(privateDocs.map(doc => doc.id)))
    } else {
      setSelectedDocuments(new Set())
    }
  }


  const handleDeleteConfirm = async () => {
    try {
      if (handleDeleteDocuments && selectedDocuments.size > 0) {
        // Only allow deletion of private documents
        const docsToDelete = getSelectedDocumentsData()
          .filter(doc => doc.is_private)
          .map(doc => ({
          file_name: doc.file_name
        }))
        
        if (docsToDelete.length === 0) {
          alert("Je kunt alleen privé documenten verwijderen. Rol-gebaseerde documenten kunnen niet worden verwijderd.")
          setIsDeleteModalOpen(false)
          setSelectedDocuments(new Set())
          return
        }
        
        await handleDeleteDocuments(docsToDelete)
        setSelectedDocuments(new Set())
      }
    } catch (err) {
      alert("Failed to delete documents. Please try again.")
    } finally {
      setIsDeleteModalOpen(false)
    }
  }

  const handleDeleteClick = (doc) => {
    setSelectedDocuments(new Set([doc.id]))
    setDeleteMode("single")
    setIsDeleteModalOpen(true)
  }

  const getSelectedDocumentsData = () =>
    Array.from(selectedDocuments).map(docId => filteredDocuments.find(doc => doc.id === docId)).filter(Boolean)

  const getHeaderText = () => {
    return `${filteredDocuments.length} document${filteredDocuments.length !== 1 ? 'en' : ''}`
  }

  return (
    <div className="flex flex-col w-full h-full px-[25px] md:px-[97px] py-[22px] md:py-[143px] overflow-scroll scrollbar-hide">
      <div className="flex flex-col md:flex-row mb-[50px] gap-2 md:items-center">
        <div onClick={() => {router.push('/documentchat')}} className="w-fit cursor-pointer">
          <svg className="w-9 h-9 md:w-15 md:h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.998 0C15.516 0 19.995 4.48 19.995 9.998C19.995 15.515 15.516 19.995 9.998 19.995C4.48 19.995 0 15.515 0 9.998C0 4.48 4.48 0 9.998 0ZM8.475 6.21C8.475 6.21 6.973 7.715 5.22 9.469C5.073 9.616 5 9.808 5 10C5 10.192 5.073 10.383 5.22 10.53C6.973 12.284 8.474 13.788 8.474 13.788C8.619 13.933 8.809 14.005 9 14.005C9.192 14.004 9.384 13.931 9.531 13.784C9.823 13.491 9.825 13.018 9.534 12.727L7.557 10.75H14.25C14.664 10.75 15 10.414 15 10C15 9.586 14.664 9.25 14.25 9.25H7.557L9.535 7.271C9.825 6.982 9.822 6.509 9.529 6.217C9.382 6.07 9.19 5.996 8.999 5.995C8.809 5.995 8.619 6.066 8.475 6.21Z" fill="black"/>
          </svg>
        </div>
        <span className="text-[30px] md:text-[32px] font-bold">
          Mijn documenten
        </span>
      </div>

      {/* Header */}
      <div className="mb-[29px] font-montserrat font-extrabold text-[18px] leading-[100%]">
        {getHeaderText()}
      </div>

      {/* Action Bar */}
      <div className="flex w-full h-fit bg-[#F9FBFA] items-center justify-between px-2 py-1.5">
        <div className="flex flex-col md:flex-row w-full md:w-2/3 gap-4 md:items-center">
          <div className="w-full md:w-4/9">
            <DropdownMenu
              value={selectedDocumentType}
              onChange={setSelectedDocumentType}
              allOptions={documentTypeOptions}
            />
          </div>
          <div className="w-full md:w-4/9">
            <SearchBox 
              placeholderText="Zoek document..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Documents Table */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-4 text-gray-500 font-montserrat">
          Er zijn geen documenten beschikbaar.
        </div>
      ) : (
        <div className="w-full h-fit">
          <table className="w-full border-collapse text-left">
            <thead className="bg-[#F9FBFA]">
              <tr className="h-[51px] border-b border-[#C5BEBE]">
                <SortableHeader 
                  sortKey="file_name_lower" 
                  onSort={requestSort} 
                  currentSort={sortConfig}
                  className="px-4 py-2"
                >
                    Document
                </SortableHeader>

                <th className="w-20 px-4 py-2 font-montserrat font-bold text-[16px] text-black text-center">
                  
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredDocuments.map((doc, index) => (
                <tr
                  key={`${doc.file_name}-${doc.is_private ? 'private' : 'rolebased'}-${index}`}
                  className="h-[51px] border-b border-[#C5BEBE] hover:bg-[#F9FBFA] transition-colors"
                >
                  <td className="px-4 py-2 font-montserrat text-[16px] text-black font-normal">
                    {doc.path ? (
                      <button
                        onClick={async () => {
                          if (doc.path) {
                            try {
                              await downloadDocument(doc.path);
                            } catch (err) {
                              console.error('Failed to open document:', err);
                              alert('Kon document niet openen. Probeer het opnieuw.');
                            }
                          }
                        }}
                        className="text-[#23BD92] hover:text-[#1ea87a] hover:underline cursor-pointer text-left"
                        title="Open document"
                      >
                      {doc.file_name}
                      </button>
                    ) : (
                      doc.file_name
                    )}
                  </td>

                  <td className="px-4 py-2">
                    <div className="flex justify-center items-center">
                      {doc.is_private ? (
                      <button 
                        onClick={() => handleDeleteClick(doc)}
                        className="hover:opacity-80 transition-opacity"
                        aria-label={`Delete ${doc.file_name}`}
                        title="Verwijder"
                      >
                        <RedCancelIcon />
                      </button>
                      ) : (
                        <span className="text-gray-400 text-sm" title="Rol-gebaseerde documenten kunnen niet worden verwijderd">
                          -
                        </span>
                      )}
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
          }}
        >
          <div className="p-6 w-fit" onClick={(e) => e.stopPropagation()}>
            <DeleteDocumentModal
              documents={getSelectedDocumentsData()}
              onClose={() => {
                setIsDeleteModalOpen(false);
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
