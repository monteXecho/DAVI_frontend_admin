'use client'
import { useEffect, useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"

import AddButton from "@/components/buttons/AddButton"
import CheckBox from "@/components/buttons/CheckBox"
import SearchBox from "@/components/input/SearchBox"
import DropdownMenu from "@/components/input/DropdownMenu"
import RedCancelIcon from "@/components/icons/RedCancelIcon"
import DeleteDocumentModal from "./DeleteDocumentModal"
import SortableHeader from "@/components/SortableHeader"
import { useSortableData } from "@/lib/useSortableData"
import { useApi } from "@/lib/useApi"

export default function MijnTab() {
  const { getPrivateDocuments, deletePrivateDocuments } = useApi()
  const router = useRouter()
  const allOptions3 = ["Bulkacties", "Verwijderen"]
  const [selectedBulkAction, setSelectedBulkAction] = useState(allOptions3[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState(new Set())
  const [documents, setDocuments] = useState(null)
  const [deleteMode, setDeleteMode] = useState("single")

  const refreshData = useCallback(async () => {
    try {
      const docsRes = await getPrivateDocuments()
      console.log(' --- DOCUMENTS ---', docsRes)
      if (docsRes?.data?.documents) setDocuments(docsRes.data.documents)
    } catch (err) {
      console.error("❌ Failed to refresh data:", err)
    }
  }, [getPrivateDocuments])

  useEffect(() => {
    const init = async () => {
      try {
        await refreshData()
      } catch (err) {
        console.error("❌ Initialization failed:", err)
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
      console.error("❌ Failed to delete documents:", err)
      throw err
    }
  }

  // Build rows including a lowercase field for case-insensitive sorting
  const getAllDocuments = useCallback(() => {
    if (!Array.isArray(documents)) return []

    return documents.map(doc => ({
      id: doc.file_name,
      file_name: doc.file_name,
      // normalized field used purely for sorting (case-insensitive)
      file_name_lower: (doc.file_name || "").toLowerCase()
    }))
  }, [documents])

  const baseDocuments = useMemo(() => {
    return getAllDocuments()
  }, [getAllDocuments])

  // Sort by file_name_lower (case-insensitive)
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
      if (handleDeleteDocuments && selectedDocuments.size > 0) {
        const docsToDelete = getSelectedDocumentsData().map(doc => ({
          file_name: doc.file_name
        }))
        await handleDeleteDocuments(docsToDelete)
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

  const getHeaderText = () => {
    return `${filteredDocuments.length} document${filteredDocuments.length !== 1 ? 'en' : ''}`
  }

  return (
    <div className="flex flex-col w-full h-full px-[97px] py-[143px] overflow-scroll scrollbar-hide">
      <div className="flex mb-[50px] gap-2 items-center">
        <div onClick={() => {router.push('/documentchat')}}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.998 0C15.516 0 19.995 4.48 19.995 9.998C19.995 15.515 15.516 19.995 9.998 19.995C4.48 19.995 0 15.515 0 9.998C0 4.48 4.48 0 9.998 0ZM8.475 6.21C8.475 6.21 6.973 7.715 5.22 9.469C5.073 9.616 5 9.808 5 10C5 10.192 5.073 10.383 5.22 10.53C6.973 12.284 8.474 13.788 8.474 13.788C8.619 13.933 8.809 14.005 9 14.005C9.192 14.004 9.384 13.931 9.531 13.784C9.823 13.491 9.825 13.018 9.534 12.727L7.557 10.75H14.25C14.664 10.75 15 10.414 15 10C15 9.586 14.664 9.25 14.25 9.25H7.557L9.535 7.271C9.825 6.982 9.822 6.509 9.529 6.217C9.382 6.07 9.19 5.996 8.999 5.995C8.809 5.995 8.619 6.066 8.475 6.21Z" fill="black"/>
          </svg>
        </div>
        <span className="text-[32px] font-bold">
          Mijn documenten
        </span>
      </div>

      {/* Header */}
      <div className="mb-[29px] font-montserrat font-extrabold text-[18px] leading-[100%]">
        {getHeaderText()}
        {selectedDocuments.size > 0 && (
          <span className="ml-2 text-gray-600">
            ({selectedDocuments.size} geselecteerd)
          </span>
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
                  <div className="flex items-center gap-3">
                    <CheckBox 
                      toggle={allSelected} 
                      indeterminate={someSelected}
                      onChange={handleSelectAll}
                      color="#23BD92" 
                    />
                    Document
                  </div>
                </SortableHeader>

                <th className="w-20 px-4 py-2 font-montserrat font-bold text-[16px] text-black text-center">
                  Acties
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredDocuments.map((doc) => (
                <tr
                  key={doc.id + doc.file_name}
                  className="h-[51px] border-b border-[#C5BEBE] hover:bg-[#F9FBFA] transition-colors"
                >
                  <td className="px-4 py-2 font-montserrat text-[16px] text-black font-normal">
                    <div className="flex items-center gap-3">
                      <CheckBox 
                        toggle={selectedDocuments.has(doc.id)} 
                        onChange={(isSelected) => handleDocumentSelect(doc.id, isSelected)}
                        color="#23BD92" 
                      />
                      {doc.file_name}
                    </div>
                  </td>

                  <td className="px-4 py-2">
                    <div className="flex justify-center items-center">
                      <button 
                        onClick={() => handleDeleteClick(doc)}
                        className="hover:opacity-80 transition-opacity"
                        aria-label={`Delete ${doc.file_name}`}
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
