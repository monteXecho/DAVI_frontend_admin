'use client'
import { useState, useMemo } from "react"
import AddButton from "@/components/buttons/AddButton"
import CheckBox from "@/components/buttons/CheckBox"
import SearchBox from "@/components/input/SearchBox"
import RedCancelIcon from "@/components/icons/RedCancelIcon"
import EditIcon from "@/components/icons/EditIcon"
import SortableHeader from "@/components/SortableHeader"
import { useSortableData } from "@/lib/useSortableData"
import CreateEditChatModal from "./modals/CreateEditChatModal"
import DeleteChatModal from "./modals/DeleteChatModal"

export default function AlleChatsTab({
  chats = [],
  loading,
  canWrite = true,
  onCreateChat,
  onUpdateChat,
  onDeleteChat,
  onSelectChat,
  onRefresh,
  onSyncAll,
  adminUserId,
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedChats, setSelectedChats] = useState(new Set())
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingChat, setEditingChat] = useState(null)
  const [syncing, setSyncing] = useState(false)

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats
    
    const lowerSearch = searchQuery.toLowerCase()
    return chats.filter(chat => {
      return (
        (chat.chat_name || "").toLowerCase().includes(lowerSearch) ||
        (chat.is_private ? "privé" : "publiek").toLowerCase().includes(lowerSearch)
      )
    })
  }, [chats, searchQuery])

  const chatsForSorting = useMemo(() => {
    return filteredChats.map(chat => ({
      id: chat.id,
      chat_name: chat.chat_name || "",
      password: chat.password || "-",
      is_private: chat.is_private, // Keep boolean for sorting
    }))
  }, [filteredChats])

  const { items: sortedChats, requestSort, sortConfig } = useSortableData(chatsForSorting)

  const handleChatSelect = (chatId, isSelected) => {
    setSelectedChats(prev => {
      const newSelected = new Set(prev)
      isSelected ? newSelected.add(chatId) : newSelected.delete(chatId)
      return newSelected
    })
  }

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedChats(new Set(filteredChats.map(c => c.id)))
    } else {
      setSelectedChats(new Set())
    }
  }

  const allSelected = filteredChats.length > 0 && filteredChats.every(c => selectedChats.has(c.id))
  const someSelected = filteredChats.some(c => selectedChats.has(c.id)) && !allSelected

  const handleAddClick = () => {
    setEditingChat(null)
    setIsAddModalOpen(true)
  }

  const handleEditClick = (chat) => {
    setEditingChat(chat)
    setIsEditModalOpen(true)
  }

  const handleAddConfirm = async (data) => {
    try {
      await onCreateChat(data)
      setIsAddModalOpen(false)
      setSelectedChats(new Set())
    } catch (err) {
      alert(err.message || "Failed to create chat")
    }
  }

  const handleEditConfirm = async (data) => {
    try {
      await onUpdateChat(editingChat.id, data)
      setIsEditModalOpen(false)
      setEditingChat(null)
      setSelectedChats(new Set())
    } catch (err) {
      alert(err.message || "Failed to update chat")
    }
  }

  const handleDeleteClick = (chat) => {
    setSelectedChats(new Set([chat.id]))
    setIsDeleteModalOpen(true)
  }

  const handleBulkDelete = () => {
    if (selectedChats.size > 0) {
      setIsDeleteModalOpen(true)
    } else {
      alert("Selecteer eerst chats om te verwijderen.")
    }
  }

  const handleDeleteConfirm = async () => {
    try {
      const chatIds = Array.from(selectedChats)
      for (const id of chatIds) {
        await onDeleteChat(id)
      }
      setIsDeleteModalOpen(false)
      setSelectedChats(new Set())
    } catch (err) {
      alert(err.message || "Failed to delete chats")
    }
  }

  const getSelectedChatsData = () => {
    return Array.from(selectedChats)
      .map(id => filteredChats.find(c => c.id === id))
      .filter(Boolean)
  }

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="mb-[29px] font-montserrat font-extrabold text-[18px] leading-[100%]">
        {chats.length} Chat{chats.length !== 1 ? 's' : ''}
        {selectedChats.size > 0 && (
          <span className="ml-2 text-gray-600">
            ({selectedChats.size} geselecteerd)
          </span>
        )}
      </div>

      {/* Admin User ID Display */}
      {adminUserId && (
        <div className="mb-4 p-4 bg-[#F9FBFA] rounded-lg border border-[#C5BEBE]">
          <div className="font-montserrat text-sm text-gray-600 mb-2">
            Uw Admin User ID voor publieke chat URL:
          </div>
          <div className="flex items-center gap-3">
            <code className="font-mono text-[16px] font-bold text-[#23BD92] bg-white px-3 py-2 rounded border border-[#C5BEBE]">
              {adminUserId}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(adminUserId)
                alert("User ID gekopieerd naar klembord!")
              }}
              className="px-4 py-2 bg-[#23BD92] hover:bg-[#1ea87c] text-white font-montserrat text-sm rounded-lg transition-colors"
            >
              Kopieer
            </button>
          </div>
          <div className="mt-2 font-montserrat text-xs text-gray-500">
            Gebruik dit ID in de URL: <span className="font-mono">/publicChat/{`{user_id}`}/{`{chat_name}`}</span>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex w-full h-fit bg-[#F9FBFA] items-center justify-between px-2 py-1.5 gap-4">
        <div className="flex w-2/3 gap-4 items-center">
          <div className="w-4/9">
            <SearchBox 
              placeholderText="Zoek chat naam..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {canWrite && onSyncAll && chats.length > 0 && (
            <button
              onClick={async () => {
                try {
                  setSyncing(true)
                  await onSyncAll()
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
              {syncing ? "Synchroniseren..." : "URL's synchroniseren"}
            </button>
          )}
          {canWrite && <AddButton onClick={handleAddClick} text="Toevoegen" />}
          {!canWrite && <div className="text-gray-500 text-sm italic">Alleen-lezen modus: U heeft geen schrijfrechten</div>}
        </div>
      </div>

      {/* Table */}
      {filteredChats.length === 0 ? (
        <div className="text-center py-4 text-gray-500 font-montserrat">
          {loading ? "Laden..." : "Geen chats gevonden."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-[#F9FBFA]">
              <tr className="h-[51px] border-b border-[#C5BEBE]">
                <SortableHeader 
                  sortKey="chat_name" 
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
                    Chat naam
                  </div>
                </SortableHeader>

                <SortableHeader 
                  sortKey="password" 
                  onSort={requestSort} 
                  currentSort={sortConfig}
                  className="px-4 py-2"
                >
                  Wachtwoord
                </SortableHeader>

                <SortableHeader 
                  sortKey="is_private" 
                  onSort={requestSort} 
                  currentSort={sortConfig}
                  className="px-4 py-2"
                >
                  Privé
                </SortableHeader>

                <th className="w-20 px-4 py-2 font-montserrat font-bold text-[16px] text-black text-center">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedChats.map((chat) => {
                const fullChat = filteredChats.find(c => c.id === chat.id)
                return (
                  <tr key={chat.id} className="border-b border-[#C5BEBE] hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <CheckBox 
                          toggle={selectedChats.has(chat.id)} 
                          onChange={(checked) => handleChatSelect(chat.id, checked)}
                          color="#23BD92" 
                        />
                        <span className="font-montserrat text-[16px] text-black">
                          {chat.chat_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-montserrat text-[16px] text-gray-600">
                        {chat.password}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {fullChat?.is_private ? (
                          <div className="w-8 h-8 rounded-full bg-[#23BD92]/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-[#23BD92]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-300 text-lg">—</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {canWrite ? (
                        <div className="flex items-center justify-center gap-4">
                          <button
                            onClick={() => {
                              onSelectChat(fullChat.id)
                            }}
                            className="cursor-pointer transition-opacity hover:opacity-80"
                            title="Bewerken bronnen"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(fullChat)}
                            className="cursor-pointer transition-opacity hover:opacity-80"
                            title="Verwijder"
                          >
                            <RedCancelIcon />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onSelectChat(fullChat.id)}
                          className="cursor-pointer transition-opacity hover:opacity-80"
                          title="Bekijken"
                        >
                          <EditIcon />
                        </button>
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
      {selectedChats.size > 0 && canWrite && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleBulkDelete}
            className="bg-[#E94F4F] hover:bg-red-600 text-white font-bold text-base rounded-lg px-4 py-2"
          >
            Verwijder {selectedChats.size} geselecteerde chat{selectedChats.size !== 1 ? 's' : ''}
          </button>
        </div>
      )}

      {/* Modals */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center mb-[120px] xl:mb-0 bg-black/50">
          <CreateEditChatModal
            chat={null}
            onConfirm={handleAddConfirm}
            onClose={() => setIsAddModalOpen(false)}
          />
        </div>
      )}

      {isEditModalOpen && editingChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center mb-[120px] xl:mb-0 bg-black/50">
          <CreateEditChatModal
            chat={editingChat}
            onConfirm={handleEditConfirm}
            onClose={() => {
              setIsEditModalOpen(false)
              setEditingChat(null)
            }}
          />
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center mb-[120px] xl:mb-0 bg-black/50">
          <DeleteChatModal
            chats={getSelectedChatsData()}
            onConfirm={handleDeleteConfirm}
            onClose={() => setIsDeleteModalOpen(false)}
            isMultiple={selectedChats.size > 1}
          />
        </div>
      )}
    </div>
  )
}

