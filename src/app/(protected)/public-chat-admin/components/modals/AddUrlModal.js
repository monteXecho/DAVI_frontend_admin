import { useMemo, useState } from "react"
import { X } from "lucide-react"
import { extractUrlsFromText } from "@/lib/utils/extractUrls"

export default function AddUrlModal({
  onConfirm,
  onClose,
  isSubmitting = false,
}) {
  const [input, setInput] = useState("")
  const [error, setError] = useState("")

  const detectedUrls = useMemo(() => extractUrlsFromText(input), [input])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (detectedUrls.length === 0) {
      setError("Voer minimaal één geldige URL in (bijv. https://www.example.com)")
      return
    }

    try {
      await onConfirm(detectedUrls)
    } catch {
      // Parent handles errors; keep modal open
    }
  }

  return (
    <div className="relative w-fit h-fit py-7 px-13 bg-white shadow-md rounded-2xl flex flex-col items-center justify-center gap-6 min-w-[500px] max-w-[640px]">
      <button
        onClick={onClose}
        disabled={isSubmitting}
        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        aria-label="Close"
      >
        <X size={22} />
      </button>

      <h2 className="text-2xl font-bold text-black">{"URL's toevoegen"}</h2>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Webadressen
          </label>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setError("")
            }}
            disabled={isSubmitting}
            rows={6}
            placeholder={"Plak één of meerdere URL's, bijvoorbeeld:\nhttps://www.example.com\nhttps://www.example.org/pagina"}
            className="w-full min-h-[140px] rounded-lg border border-[#D9D9D9] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#23BD92] focus:border-transparent font-montserrat text-sm resize-y disabled:bg-gray-50"
          />
          {error && (
            <p className="text-red-500 text-sm mt-1">{error}</p>
          )}
          {detectedUrls.length > 0 && (
            <div className="mt-3 rounded-lg border border-[#23BD92]/30 bg-[#23BD92]/5 px-3 py-2">
              <p className="text-sm font-medium text-gray-700 mb-1">
                {detectedUrls.length} URL{detectedUrls.length !== 1 ? "s" : ""} gedetecteerd
              </p>
              <ul className="max-h-32 overflow-y-auto space-y-1">
                {detectedUrls.map((url) => (
                  <li key={url} className="text-xs text-gray-600 break-all font-montserrat">
                    {url}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || detectedUrls.length === 0}
          className="bg-[#23BD92] hover:bg-[#1ea87c] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-base rounded-lg w-full h-12 flex items-center justify-center transition-colors"
        >
          {isSubmitting
            ? "Bezig met toevoegen…"
            : detectedUrls.length <= 1
              ? "Toevoegen"
              : `${detectedUrls.length} URL's toevoegen`}
        </button>
      </form>
    </div>
  )
}
