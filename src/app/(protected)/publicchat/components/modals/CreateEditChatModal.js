import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { buildPublicChatPageUrl } from "@/lib/publicChatUrl"

export default function CreateEditChatModal({
  chat = null, // null for create, chat object for edit
  adminUserId = null,
  onConfirm,
  onClose,
}) {
  const [chatName, setChatName] = useState("")
  const [password, setPassword] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (chat) {
      setChatName(chat.chat_name || "")
      setPassword(chat.password || "") // Show existing password
      setIsPrivate(chat.is_private || false)
    } else {
      setChatName("")
      setPassword("")
      setIsPrivate(false)
    }
    setError("")
  }, [chat])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    if (!chatName.trim()) {
      setError("Voer een chat naam in")
      return
    }

    // Validate: if password is set, is_private must be True
    if (password.trim() && !isPrivate) {
      setError("Wachtwoord kan alleen worden ingesteld voor privé chats")
      return
    }

    // If private but no password, still allow (password can be removed)
    // If not private, password must be empty
    const finalPassword = isPrivate ? (password.trim() || null) : null

    onConfirm({
      chat_name: chatName.trim(),
      password: finalPassword,
      is_private: isPrivate,
    })
  }

  return (
    <div className="relative w-fit h-fit py-7 px-13 bg-white shadow-md rounded-2xl flex flex-col items-center justify-center gap-6 min-w-[500px]">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        aria-label="Close"
      >
        <X size={22} />
      </button>

      {/* Title */}
      <h2 className="text-2xl font-bold text-black">
        {chat ? "Chat bewerken" : "Nieuwe chat toevoegen"}
      </h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        {/* Chat Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chat naam
          </label>
          <input
            type="text"
            value={chatName}
            onChange={(e) => {
              setChatName(e.target.value)
              setError("")
            }}
            placeholder="Bijv. Algemene vragen"
            className="w-full h-12 rounded-lg border border-[#D9D9D9] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#23BD92] focus:border-transparent"
          />
          {adminUserId && chatName.trim() ? (
            <p className="mt-2 text-xs text-gray-600 break-all">
              <span className="font-medium text-gray-700">Publieke chat-URL:</span>{' '}
              <span className="font-mono text-[11px] sm:text-xs">
                {buildPublicChatPageUrl(adminUserId, chatName.trim())}
              </span>
            </p>
          ) : null}
        </div>

        {/* Private Checkbox */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="private"
            checked={isPrivate}
            onChange={(e) => {
              setIsPrivate(e.target.checked)
              if (!e.target.checked) {
                setPassword("") // Clear password if not private
              }
              setError("")
            }}
            className="w-5 h-5 rounded border-gray-300 text-[#23BD92] focus:ring-[#23BD92]"
          />
          <label htmlFor="private" className="text-sm font-medium text-gray-700 cursor-pointer">
            Privé (vereist wachtwoord)
          </label>
        </div>

        {/* Password Input (only if private) */}
        {isPrivate && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wachtwoord
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError("")
              }}
              placeholder="Voer wachtwoord in (laat leeg om te verwijderen)"
              className="w-full h-12 rounded-lg border border-[#D9D9D9] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#23BD92] focus:border-transparent"
            />
            {chat && chat.password && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPassword("")
                    setError("")
                  }}
                  className="text-sm text-red-600 hover:text-red-800 font-medium underline"
                >
                  Wachtwoord verwijderen
                </button>
                <span className="text-xs text-gray-500">
                  (Huidig wachtwoord wordt verwijderd bij opslaan)
                </span>
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-[#23BD92] hover:bg-[#1ea87c] text-white font-bold text-base rounded-lg w-full h-12 flex items-center justify-center transition-colors"
        >
          {chat ? "Opslaan" : "Toevoegen"}
        </button>
      </form>
    </div>
  )
}

