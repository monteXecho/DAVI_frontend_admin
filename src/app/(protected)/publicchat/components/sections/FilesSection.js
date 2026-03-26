'use client'
import { useState, useMemo, useRef } from "react"
import AddButton from "@/components/buttons/AddButton"
import CheckBox from "@/components/buttons/CheckBox"
import SearchBox from "@/components/input/SearchBox"
import RedCancelIcon from "@/components/icons/RedCancelIcon"
import SortableHeader from "@/components/SortableHeader"
import { useSortableData } from "@/lib/useSortableData"
import DeleteSourceModal from "../modals/DeleteSourceModal"

export default function FilesSection({
  sources = [],
  loading,
  canWrite = true,
  onAddFile,
  onDeleteSource,
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSources, setSelectedSources] = useState(new Set())
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const fileInputRef = useRef(null)

  const filteredSources = useMemo(() => {
    if (!searchQuery.trim()) return sources
    
    const lowerSearch = searchQuery.toLowerCase()
    return sources.filter(source => {
      return (
        (source.file_name || "").toLowerCase().includes(lowerSearch) ||
        (source.status || "").toLowerCase().includes(lowerSearch)
      )
    })
  }, [sources, searchQuery])

  const sourcesForSorting = useMemo(() => {
    return filteredSources.map(source => ({
      id: source.id,
      file_name: source.file_name || "",
      status: source.status || "active",
    }))
  }, [filteredSources])

  const { items: sortedSources, requestSort, sortConfig } = useSortableData(sourcesForSorting)

  const handleSourceSelect = (sourceId, isSelected) => {
    setSelectedSources(prev => {
      const newSelected = new Set(prev)
      isSelected ? newSelected.add(sourceId) : newSelected.delete(sourceId)
      return newSelected
    })
  }

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedSources(new Set(filteredSources.map(s => s.id)))
    } else {
      setSelectedSources(new Set())
    }
  }

  const allSelected = filteredSources.length > 0 && filteredSources.every(s => selectedSources.has(s.id))
  const someSelected = filteredSources.some(s => selectedSources.has(s.id)) && !allSelected

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      setError("")
      await onAddFile(file)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      setError(err.message || "Failed to upload file")
    } finally {
      setUploading(false)
    }
  }

  const handleAddClick = () => {
    fileInputRef.current?.click()
  }

  const handleDeleteClick = (source) => {
    setSelectedSources(new Set([source.id]))
    setIsDeleteModalOpen(true)
  }

  const handleBulkDelete = () => {
    if (selectedSources.size > 0) {
      setIsDeleteModalOpen(true)
    } else {
      alert("Selecteer eerst bronnen om te verwijderen.")
    }
  }

  const handleDeleteConfirm = async () => {
    try {
      const sourceIds = Array.from(selectedSources)
      for (const id of sourceIds) {
        await onDeleteSource(id)
      }
      setIsDeleteModalOpen(false)
      setSelectedSources(new Set())
    } catch (err) {
      alert(err.message || "Failed to delete sources")
    }
  }

  const getSelectedSourcesData = () => {
    return Array.from(selectedSources)
      .map(id => filteredSources.find(s => s.id === id))
      .filter(Boolean)
  }

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="mb-[29px] font-montserrat font-extrabold text-[18px] leading-[100%]">
        {sources.length} Bestand{sources.length !== 1 ? 'en' : ''}
        {selectedSources.size > 0 && (
          <span className="ml-2 text-gray-600">
            ({selectedSources.size} geselecteerd)
          </span>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex w-full h-fit bg-[#F9FBFA] items-center justify-between px-2 py-1.5 gap-4">
        <div className="flex w-2/3 gap-4 items-center">
          <div className="w-4/9">
            <SearchBox 
              placeholderText="Zoek bestandsnaam, status..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          {canWrite && (
            <AddButton 
              onClick={handleAddClick} 
              text={uploading ? "Uploaden..." : "Toevoegen"}
              disabled={uploading}
            />
          )}
          {!canWrite && <div className="text-gray-500 text-sm italic">Alleen-lezen</div>}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-red-500 text-sm">{error}</div>
      )}

      {/* Table */}
      {filteredSources.length === 0 ? (
        <div className="text-center py-4 text-gray-500 font-montserrat">
          {loading ? "Laden..." : "Geen bestanden gevonden."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-[#F9FBFA]">
              <tr className="h-[51px] border-b border-[#C5BEBE]">
                <SortableHeader 
                  sortKey="file_name" 
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
                    Bestandsnaam
                  </div>
                </SortableHeader>

                <SortableHeader 
                  sortKey="status" 
                  onSort={requestSort} 
                  currentSort={sortConfig}
                  className="px-4 py-2"
                >
                  Status
                </SortableHeader>

                <th className="w-20 px-4 py-2 font-montserrat font-bold text-[16px] text-black text-center">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedSources.map((source) => {
                const fullSource = filteredSources.find(s => s.id === source.id)
                return (
                  <tr key={source.id} className="border-b border-[#C5BEBE] hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <CheckBox 
                          toggle={selectedSources.has(source.id)} 
                          onChange={(checked) => handleSourceSelect(source.id, checked)}
                          color="#23BD92" 
                        />
                        {source.file_name ? (
                          <span className="font-montserrat text-[16px] text-black">
                            {source.file_name}
                          </span>
                        ) : (
                          <span className="font-montserrat text-[16px] text-black">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-montserrat text-[16px] font-medium ${
                          source.status === "active" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {source.status === "active" ? "Actief" : "Inactief"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {canWrite ? (
                        <div className="flex items-center justify-center gap-4">
                          <button
                            onClick={() => handleDeleteClick(fullSource)}
                            className="cursor-pointer transition-opacity hover:opacity-80"
                            title="Verwijder"
                          >
                            <RedCancelIcon />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Bulk Delete Button */}
      {selectedSources.size > 0 && canWrite && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleBulkDelete}
            className="bg-[#E94F4F] hover:bg-red-600 text-white font-bold text-base rounded-lg px-4 py-2"
          >
            Verwijder {selectedSources.size} geselecteerde bestand{selectedSources.size !== 1 ? 'en' : ''}
          </button>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center mb-[120px] xl:mb-0 bg-black/50">
          <DeleteSourceModal
            sources={getSelectedSourcesData()}
            onConfirm={handleDeleteConfirm}
            onClose={() => setIsDeleteModalOpen(false)}
            isMultiple={selectedSources.size > 1}
          />
        </div>
      )}
    </div>
  )
}

