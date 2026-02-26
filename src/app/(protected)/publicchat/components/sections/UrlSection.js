'use client'
import { useState, useMemo } from "react"
import AddButton from "@/components/buttons/AddButton"
import CheckBox from "@/components/buttons/CheckBox"
import SearchBox from "@/components/input/SearchBox"
import RedCancelIcon from "@/components/icons/RedCancelIcon"
import SortableHeader from "@/components/SortableHeader"
import { useSortableData } from "@/lib/useSortableData"
import AddUrlModal from "../modals/AddUrlModal"
import DeleteSourceModal from "../modals/DeleteSourceModal"

export default function UrlSection({
  sources = [],
  loading,
  onAddUrl,
  onDeleteSource,
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSources, setSelectedSources] = useState(new Set())
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const filteredSources = useMemo(() => {
    if (!searchQuery.trim()) return sources
    
    const lowerSearch = searchQuery.toLowerCase()
    return sources.filter(source => {
      return (
        (source.url || "").toLowerCase().includes(lowerSearch) ||
        (source.status || "").toLowerCase().includes(lowerSearch)
      )
    })
  }, [sources, searchQuery])

  const sourcesForSorting = useMemo(() => {
    return filteredSources.map(source => ({
      id: source.id,
      url: source.url || "",
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
        {sources.length} URL bron{sources.length !== 1 ? 'nen' : ''}
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
              placeholderText="Zoek URL, status..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AddButton onClick={() => setIsAddModalOpen(true)} text="Toevoegen" />
        </div>
      </div>

      {/* Table */}
      {filteredSources.length === 0 ? (
        <div className="text-center py-4 text-gray-500 font-montserrat">
          {loading ? "Laden..." : "Geen URL bronnen gevonden."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-[#F9FBFA]">
              <tr className="h-[51px] border-b border-[#C5BEBE]">
                <SortableHeader 
                  sortKey="url" 
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
                    Webadres
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
                        {source.url ? (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-montserrat text-[16px] text-[#23BD92] hover:underline cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {source.url}
                          </a>
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
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => handleDeleteClick(fullSource)}
                          className="cursor-pointer transition-opacity hover:opacity-80"
                          title="Verwijder"
                        >
                          <RedCancelIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Bulk Delete Button */}
      {selectedSources.size > 0 && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleBulkDelete}
            className="bg-[#E94F4F] hover:bg-red-600 text-white font-bold text-base rounded-lg px-4 py-2"
          >
            Verwijder {selectedSources.size} geselecteerde bron{selectedSources.size !== 1 ? 'nen' : ''}
          </button>
        </div>
      )}

      {/* Modals */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center mb-[120px] xl:mb-0 bg-black/50">
          <AddUrlModal
            onConfirm={async (url) => {
              try {
                await onAddUrl(url)
                setIsAddModalOpen(false)
              } catch (err) {
                alert(err.message || "Failed to add URL")
              }
            }}
            onClose={() => setIsAddModalOpen(false)}
          />
        </div>
      )}

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

