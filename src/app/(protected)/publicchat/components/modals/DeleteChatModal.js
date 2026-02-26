import { X } from "lucide-react"

export default function DeleteChatModal({
  chats = [],
  onConfirm,
  onClose,
  isMultiple = false,
}) {
  return (
    <div className="relative w-fit h-fit py-7 px-13 bg-white shadow-md rounded-2xl flex flex-col items-center justify-center gap-6 min-w-[400px]">
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
        Chat{isMultiple ? 's' : ''} verwijderen?
      </h2>

      {/* Message */}
      <p className="text-center text-gray-600">
        Weet je zeker dat je {isMultiple ? 'deze chats' : 'deze chat'} wilt verwijderen?
        {isMultiple ? (
          <span className="block mt-2 font-semibold">
            {chats.map(c => c.chat_name).join(", ")}
          </span>
        ) : (
          <span className="block mt-2 font-semibold">
            {chats[0]?.chat_name}
          </span>
        )}
        <span className="block mt-2 text-sm">
          Alle bronnen (URLs, HTML bestanden en documenten) worden ook verwijderd.
        </span>
      </p>

      {/* Buttons */}
      <div className="flex gap-4 w-full">
        <button
          onClick={onClose}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-base rounded-lg h-12 transition-colors"
        >
          Annuleren
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 bg-[#E94F4F] hover:bg-red-600 text-white font-bold text-base rounded-lg h-12 transition-colors"
        >
          Verwijderen
        </button>
      </div>
    </div>
  )
}

