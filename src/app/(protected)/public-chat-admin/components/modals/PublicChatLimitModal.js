import { X } from "lucide-react"

export const PUBLIC_CHAT_PAYMENT_URL = "https://mijndavi.nl/betaalpagina/"

export default function PublicChatLimitModal({ onClose }) {
  const handleActivate = () => {
    window.open(PUBLIC_CHAT_PAYMENT_URL, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="relative w-fit max-w-lg py-7 px-8 sm:px-10 bg-white shadow-md rounded-2xl flex flex-col items-center justify-center gap-6">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        aria-label="Sluiten"
        type="button"
      >
        <X size={22} />
      </button>

      <h2 className="text-xl sm:text-2xl font-bold text-black text-center pr-6">
        Maximum aantal QR-Chats bereikt
      </h2>

      <div className="text-center text-gray-700 text-sm sm:text-base leading-relaxed space-y-3">
        <p>
          Je hebt momenteel het maximale aantal beschikbare QR-Chats binnen jouw omgeving bereikt.
        </p>
        <p>
          Voor het toevoegen van een extra QR-Chat geldt een abonnement van €49,90 per maand excl. btw.
        </p>
        <p>
          Na activatie kun je direct een nieuwe chat aanmaken.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-base rounded-lg h-12 transition-colors"
        >
          Sluiten
        </button>
        <button
          type="button"
          onClick={handleActivate}
          className="flex-1 bg-[#23BD92] hover:bg-[#1ea87c] text-white font-bold text-base rounded-lg h-12 transition-colors"
        >
          Activeer
        </button>
      </div>
    </div>
  )
}
