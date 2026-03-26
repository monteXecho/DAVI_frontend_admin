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
import UrlErrorModal from "@/app/(protected)/bronnen/components/modals/UrlErrorModal"

export default function UrlSection({
  sources = [],
  loading,
  canWrite = true,
  onAddUrl,
  onDeleteSource,
  onSync,
  lastSync,
  nextSync,
  formatDateTime,
  formatNextSync,
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSources, setSelectedSources] = useState(new Set())
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [errorInfo, setErrorInfo] = useState(null)

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
        {sources.length} URL bron{sources.length !== 1 ? "nen" : ""}
        {selectedSources.size > 0 && (
          <span className="ml-2 text-gray-600">
            ({selectedSources.size} geselecteerd)
          </span>
        )}
      </div>

      {/* Sync info */}
      {onSync && (lastSync || nextSync) && (
        <div className="mb-4 text-sm text-gray-600 font-montserrat flex flex-col gap-1">
          {lastSync && formatDateTime && (
            <div>
              <span className="font-bold">Laatste synchronisatie:</span> {formatDateTime(lastSync)}.
            </div>
          )}
          {nextSync && formatNextSync && (
            <div>
              <span className="font-bold">Volgende synchronisatie:</span> {formatNextSync(nextSync)}.
            </div>
          )}
        </div>
      )}

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
          {canWrite && onSync && sources.length > 0 && (
            <button
              onClick={async () => {
                try {
                  setSyncing(true)
                  await onSync()
                } catch (err) {
                  alert(err.response?.data?.detail || err.message || "Synchroniseren mislukt")
                } finally {
                  setSyncing(false)
                }
              }}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {syncing ? "Synchroniseren..." : "Nu synchroniseren"}
            </button>
          )}
          {canWrite && <AddButton onClick={() => setIsAddModalOpen(true)} text="Toevoegen" />}
          {!canWrite && <div className="text-gray-500 text-sm italic">Alleen-lezen</div>}
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
                // Extract error message from axios error response
                const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || "Er is een fout opgetreden bij het toevoegen van de URL."
                setErrorInfo({
                  error: { message: errorMessage, detail: err.response?.data?.detail },
                  url: url
                })
                setIsErrorModalOpen(true)
                // Keep the add modal open so user can see the error and try again
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

      {isErrorModalOpen && errorInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center mb-[120px] xl:mb-0 bg-black/50">
          <UrlErrorModal
            error={errorInfo.error}
            url={errorInfo.url}
            onClose={() => {
              setIsErrorModalOpen(false)
              setErrorInfo(null)
            }}
          />
        </div>
      )}
    </div>
  )
}
