'use client'
import { useState, useEffect, useCallback } from "react"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { usePublicChat } from "@/lib/api/publicChat"
import { useApi } from "@/lib/useApi"
import { canWritePublicChat } from "@/lib/permissions"
import AlleChatsTab from "./components/AlleChatsTab"
import WijzigenTab from "./components/WijzigenTab"

const tabsConfig = [
  { label: 'Alle chats', component: AlleChatsTab, selectable: true },
  { label: 'Wijzigen', component: WijzigenTab, selectable: true },
]

export default function PublicChat() {
  const [activeIndex, setActiveIndex] = useState(0)
  const { getPublicChats, createPublicChat, updatePublicChat, deletePublicChat, getPublicChat, syncAllChatSources, getPublicChatUrlSyncSchedule } = usePublicChat()
  const { getUser } = useApi()
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedChat, setSelectedChat] = useState(null)
  const [adminUserId, setAdminUserId] = useState(null)
  const [syncSchedule, setSyncSchedule] = useState({ next_sync_at: null, interval_minutes: 60 })
  const [canWrite, setCanWrite] = useState(true)

  const ActiveComponent = tabsConfig[activeIndex].component

  const fetchSyncSchedule = useCallback(async () => {
    try {
      const data = await getPublicChatUrlSyncSchedule()
      if (data) setSyncSchedule({ next_sync_at: data.next_sync_at, interval_minutes: data.interval_minutes ?? 60 })
    } catch (err) {
      console.error("Failed to fetch public chat sync schedule:", err)
    }
  }, [getPublicChatUrlSyncSchedule])

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
    fetchSyncSchedule()
    // Fetch current admin's user_id
    const fetchAdminInfo = async () => {
      try {
        const userData = await getUser()
        if (userData?.user_id) {
          setAdminUserId(userData.user_id)
        }
        setCanWrite(canWritePublicChat(userData))
      } catch (err) {
        console.error("Failed to fetch admin info:", err)
      }
    }
    fetchAdminInfo()
  }, [fetchChats, fetchSyncSchedule, getUser])

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

  const handleSyncAll = async () => {
    try {
      await syncAllChatSources()
      await fetchSyncSchedule()
      await fetchChats()
    } catch (err) {
      alert(err.response?.data?.detail || err.message || "Synchroniseren mislukt")
    }
  }

  const formatNextSync = (nextSyncAt) => {
    if (!nextSyncAt) return null
    try {
      const d = new Date(nextSyncAt)
      return d.toLocaleString("nl-NL", { dateStyle: "short", timeStyle: "short" })
    } catch {
      return null
    }
  }

  const formatInterval = (minutes) => {
    if (minutes >= 60) {
      const h = Math.floor(minutes / 60)
      return h === 1 ? "1 uur" : `${h} uur`
    }
    return `${minutes} min`
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
        {/* Auto-sync schedule info */}
        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-slate-700">Automatische synchronisatie URL&apos;s</span>
            </div>
            <div className="text-sm text-slate-600">
              <span className="font-medium">Interval:</span> {formatInterval(syncSchedule.interval_minutes)}
            </div>
            <div className="text-sm text-slate-600">
              <span className="font-medium">Volgende sync:</span> {formatNextSync(syncSchedule.next_sync_at) || "—"}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Synchroniseert automatisch bij inloggen en elk uur zolang u ingelogd bent.
          </p>
        </div>
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
          canWrite={canWrite}
          onCreateChat={handleCreateChat}
          onUpdateChat={handleUpdateChat}
          onDeleteChat={handleDeleteChat}
          onSelectChat={handleSelectChat}
          onRefresh={fetchChats}
          onSyncAll={handleSyncAll}
          adminUserId={adminUserId}
        />
      </div>

      <ToastContainer position="top-right" autoClose={3200} />
    </div>
  )
}
