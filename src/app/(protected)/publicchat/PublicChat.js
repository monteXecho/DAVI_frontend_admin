'use client'
import { useState, useEffect, useCallback } from "react"
import { usePublicChat } from "@/lib/api/publicChat"
import { useApi } from "@/lib/useApi"
import AlleChatsTab from "./components/AlleChatsTab"
import WijzigenTab from "./components/WijzigenTab"

const tabsConfig = [
  { label: 'Alle chats', component: AlleChatsTab, selectable: true },
  { label: 'Wijzigen', component: WijzigenTab, selectable: true },
]

export default function PublicChat() {
  const [activeIndex, setActiveIndex] = useState(0)
  const { getPublicChats, createPublicChat, updatePublicChat, deletePublicChat, getPublicChat } = usePublicChat()
  const { getUser } = useApi()
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedChat, setSelectedChat] = useState(null)
  const [adminUserId, setAdminUserId] = useState(null)

  const ActiveComponent = tabsConfig[activeIndex].component

  const fetchChats = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getPublicChats()
      if (res?.chats) {
        setChats(res.chats)
      }
    } catch (err) {
      console.error("Failed to fetch public chats:", err)
    } finally {
      setLoading(false)
    }
  }, [getPublicChats])

  useEffect(() => {
    fetchChats()
    // Fetch current admin's user_id
    const fetchAdminInfo = async () => {
      try {
        const userData = await getUser()
        if (userData?.user_id) {
          setAdminUserId(userData.user_id)
        }
      } catch (err) {
        console.error("Failed to fetch admin info:", err)
      }
    }
    fetchAdminInfo()
  }, [fetchChats, getUser])

  const handleCreateChat = async (data) => {
    try {
      await createPublicChat(data)
      await fetchChats()
    } catch (err) {
      throw err
    }
  }

  const handleUpdateChat = async (chatId, data) => {
    try {
      await updatePublicChat(chatId, data)
      await fetchChats()
    } catch (err) {
      throw err
    }
  }

  const handleDeleteChat = async (chatId) => {
    try {
      await deletePublicChat(chatId)
      await fetchChats()
    } catch (err) {
      console.error("Failed to delete chat:", err)
      throw err
    }
  }

  const handleSelectChat = async (chatId) => {
    try {
      const res = await getPublicChat(chatId)
      if (res?.chat) {
        setSelectedChat(res.chat)
        setActiveIndex(1) // Switch to Wijzigen tab
      }
    } catch (err) {
      console.error("Failed to get chat:", err)
    }
  }

  return (
    <div className="flex flex-col w-full h-full p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-montserrat mb-2">PublicChat</h1>
        <p className="text-gray-600 font-montserrat">
          Beheer publieke chats die toegankelijk zijn zonder inloggen.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabsConfig.map((tab, index) => (
          <button
            key={index}
            onClick={() => {
              setActiveIndex(index)
              if (index === 0) {
                setSelectedChat(null)
              }
            }}
            className={`px-6 py-3 font-montserrat font-medium transition-colors ${
              activeIndex === index
                ? "border-b-2 border-[#23BD92] text-[#23BD92]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="flex-1">
        <ActiveComponent
          chats={chats}
          loading={loading}
          selectedChat={selectedChat}
          onCreateChat={handleCreateChat}
          onUpdateChat={handleUpdateChat}
          onDeleteChat={handleDeleteChat}
          onSelectChat={handleSelectChat}
          onRefresh={fetchChats}
          adminUserId={adminUserId}
        />
      </div>
    </div>
  )
}

