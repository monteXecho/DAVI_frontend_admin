'use client'
import { useState, useEffect, useCallback } from "react"
import { usePublicChat } from "@/lib/api/publicChat"
import { buildPublicChatPageUrl } from "@/lib/publicChatUrl"
import { Lock, Key, X, Check, Eye, EyeOff } from "lucide-react"
import UrlSection from "./sections/UrlSection"
import HtmlSection from "./sections/HtmlSection"
import FilesSection from "./sections/FilesSection"

export default function WijzigenTab({
  selectedChat,
  adminUserId,
  canWrite = true,
  onRefresh,
  onUpdateChat,
}) {
  const { getChatSources, addUrlSource, addHtmlSource, addFileSource, syncChatSources, deleteChatSource } = usePublicChat()
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(false)
  const [lastSync, setLastSync] = useState(null)
  const [nextSync, setNextSync] = useState(null)
  
  // Password management state
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  const loadSources = useCallback(async () => {
    if (!selectedChat?.id) return
    
    try {
      setLoading(true)
      const res = await getChatSources(selectedChat.id)
      if (res?.sources) {
        setSources(res.sources)
      }
      if (res?.last_sync) setLastSync(new Date(res.last_sync))
      if (res?.next_sync) setNextSync(new Date(res.next_sync))
    } catch (err) {
      console.error("Failed to load sources:", err)
    } finally {
      setLoading(false)
    }
  }, [selectedChat?.id, getChatSources])

  useEffect(() => {
    if (selectedChat?.id) {
      loadSources()
    } else {
      setSources([])
      setLastSync(null)
      setNextSync(null)
    }
  }, [selectedChat?.id, loadSources])

  const handleSync = useCallback(async () => {
    if (!selectedChat?.id) return
    try {
      const res = await syncChatSources(selectedChat.id)
      if (res?.last_sync) setLastSync(new Date(res.last_sync))
      if (res?.next_sync) setNextSync(new Date(res.next_sync))
      await loadSources()
      onRefresh()
    } catch (err) {
      throw err
    }
  }, [selectedChat?.id, syncChatSources, loadSources, onRefresh])

  const handleAddUrl = async (url) => {
    try {
      await addUrlSource(selectedChat.id, url)
      await loadSources()
      onRefresh()
    } catch (err) {
      throw err
    }
  }

  const handleAddHtml = async (file) => {
    try {
      await addHtmlSource(selectedChat.id, file)
      await loadSources()
      onRefresh()
    } catch (err) {
      throw err
    }
  }

  const handleAddFile = async (file) => {
    try {
      await addFileSource(selectedChat.id, file)
      await loadSources()
      onRefresh()
    } catch (err) {
      throw err
    }
  }

  const handleDeleteSource = async (sourceId) => {
    try {
      await deleteChatSource(selectedChat.id, sourceId)
      await loadSources()
      onRefresh()
    } catch (err) {
      throw err
    }
  }

  const handleUpdatePassword = async () => {
    if (!newPassword.trim()) {
      setPasswordError("Voer een nieuw wachtwoord in")
      return
    }

    if (newPassword.length < 3) {
      setPasswordError("Wachtwoord moet minimaal 3 tekens lang zijn")
      return
    }

    setPasswordError("")
    setIsUpdatingPassword(true)

    try {
      await onUpdateChat(selectedChat.id, {
        password: newPassword.trim(),
        is_private: true, // Ensure chat is private when password is set
      })
      setNewPassword("")
      setShowPasswordSection(false)
      await onRefresh()
      alert("Wachtwoord succesvol bijgewerkt!")
    } catch (err) {
      setPasswordError(err.response?.data?.detail || err.message || "Fout bij bijwerken van wachtwoord")
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleRemovePassword = async () => {
    if (!confirm("Weet u zeker dat u het wachtwoord wilt verwijderen? De chat wordt dan publiek toegankelijk.")) {
      return
    }

    setIsUpdatingPassword(true)
    setPasswordError("")

    try {
      await onUpdateChat(selectedChat.id, {
        password: "", // Empty string removes password
        is_private: false, // Set to not private when password is removed
      })
      setNewPassword("")
      setShowPasswordSection(false)
      await onRefresh()
      alert("Wachtwoord succesvol verwijderd!")
    } catch (err) {
      setPasswordError(err.response?.data?.detail || err.message || "Fout bij verwijderen van wachtwoord")
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  if (!selectedChat) {
    return (
      <div className="text-center py-8 text-gray-500 font-montserrat">
        Selecteer een chat uit de &quot;Alle chats&quot; tab om te bewerken.
      </div>
    )
  }

  const formatDateTime = (date) => {
    if (!date) return ""
    const d = new Date(date)
    const months = ["januari", "februari", "maart", "april", "mei", "juni",
      "juli", "augustus", "september", "oktober", "november", "december"]
    const hours = String(d.getHours()).padStart(2, "0")
    const minutes = String(d.getMinutes()).padStart(2, "0")
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} om ${hours}:${minutes}`
  }

  const formatNextSync = (date) => {
    if (!date) return ""
    const now = new Date()
    const d = new Date(date)
    if (d.toDateString() === now.toDateString()) {
      return `Vannacht om ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
    }
    return formatDateTime(date)
  }

  const urlSources = sources.filter(s => s.type === "url")
  const htmlSources = sources.filter(s => s.type === "html")
  const fileSources = sources.filter(s => s.type === "file")

  return (
    <div className="flex flex-col w-full space-y-8">
      <div className="mb-4">
        <h2 className="text-2xl font-bold font-montserrat mb-2">
          Chat: {selectedChat.chat_name}
        </h2>
        <p className="text-gray-600 font-montserrat">
          Beheer bronnen voor deze publieke chat.
        </p>
        {adminUserId && selectedChat?.chat_name ? (
          <p className="mt-2 text-xs text-gray-600 break-all font-montserrat">
            <span className="font-semibold text-gray-700">Publieke chat-URL:</span>{' '}
            <span className="font-mono text-[11px] sm:text-xs">
              {buildPublicChatPageUrl(adminUserId, selectedChat.chat_name)}
            </span>
          </p>
        ) : null}
      </div>

      {/* Password Management Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-linear-to-r from-[#F9FBFA] to-[#F0F7F4] px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#23BD92]/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#23BD92]" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-montserrat text-gray-900">Wachtwoord Beheer</h3>
                <p className="text-sm text-gray-600">Wijzig of verwijder het wachtwoord voor deze chat</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowPasswordSection(!showPasswordSection)
                setNewPassword("")
                setPasswordError("")
              }}
              className="px-4 py-2 bg-[#23BD92] hover:bg-[#1ea87c] text-white font-montserrat text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <Key className="w-4 h-4" />
              {showPasswordSection ? "Verberg" : selectedChat.password ? "Wijzig Wachtwoord" : "Stel Wachtwoord In"}
            </button>
          </div>
        </div>

        {showPasswordSection && (
          <div className="p-6 space-y-4">
            {/* Current Password Status */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                selectedChat.password ? 'bg-[#23BD92]/20' : 'bg-gray-200'
              }`}>
                {selectedChat.password ? (
                  <Check className="w-5 h-5 text-[#23BD92]" />
                ) : (
                  <X className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-montserrat font-medium text-gray-900">
                  Huidige status: {selectedChat.password ? "Wachtwoord ingesteld" : "Geen wachtwoord"}
                </p>
                {selectedChat.password && (
                  <p className="text-sm text-gray-600 font-montserrat mt-1">
                    Huidig wachtwoord: <span className="font-mono font-semibold text-[#23BD92]">{selectedChat.password}</span>
                  </p>
                )}
              </div>
            </div>

            {/* New Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 font-montserrat">
                Nieuw Wachtwoord
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    setPasswordError("")
                  }}
                  placeholder="Voer nieuw wachtwoord in"
                  className="w-full h-12 rounded-xl border-2 border-gray-200 px-4 pr-12 font-montserrat focus:outline-none focus:ring-2 focus:ring-[#23BD92] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-sm text-red-600 font-montserrat flex items-center gap-1">
                  <X className="w-4 h-4" />
                  {passwordError}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            {canWrite && (
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleUpdatePassword}
                  disabled={isUpdatingPassword || !newPassword.trim()}
                  className="px-6 py-3 bg-[#23BD92] hover:bg-[#1ea87c] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-montserrat font-semibold rounded-xl transition-colors flex items-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  {isUpdatingPassword ? "Bijwerken..." : "Wachtwoord Bijwerken"}
                </button>
                {selectedChat.password && (
                  <button
                    onClick={handleRemovePassword}
                    disabled={isUpdatingPassword}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-montserrat font-semibold rounded-xl transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    {isUpdatingPassword ? "Verwijderen..." : "Wachtwoord Verwijderen"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* URL Section */}
      <UrlSection
        sources={urlSources}
        loading={loading}
        canWrite={canWrite}
        onAddUrl={handleAddUrl}
        onDeleteSource={handleDeleteSource}
        onSync={handleSync}
        lastSync={lastSync}
        nextSync={nextSync}
        formatDateTime={formatDateTime}
        formatNextSync={formatNextSync}
      />

      {/* HTML Section */}
      <HtmlSection
        sources={htmlSources}
        loading={loading}
        canWrite={canWrite}
        onAddHtml={handleAddHtml}
        onDeleteSource={handleDeleteSource}
      />

      {/* Files Section */}
      <FilesSection
        sources={fileSources}
        loading={loading}
        canWrite={canWrite}
        onAddFile={handleAddFile}
        onDeleteSource={handleDeleteSource}
      />
    </div>
  )
}

