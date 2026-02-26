import { useState } from "react"
import { X } from "lucide-react"

export default function AddUrlModal({
  onConfirm,
  onClose,
}) {
  const [url, setUrl] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    if (!url.trim()) {
      setError("Voer een URL in")
      return
    }

    // Basic URL validation
    let validUrl = url.trim()
    if (!validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
      validUrl = `https://${validUrl}`
    }

    try {
      new URL(validUrl)
    } catch {
      setError("Voer een geldige URL in")
      return
    }

    onConfirm(validUrl)
  }

  return (
    <div className="relative w-fit h-fit py-7 px-13 bg-white shadow-md rounded-2xl flex flex-col items-center justify-center gap-6 min-w-[500px]">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        aria-label="Close"
      >
        <X size={22} />
      </button>

      <h2 className="text-2xl font-bold text-black">URL toevoegen</h2>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              setError("")
            }}
            placeholder="https://www.example.com"
            className="w-full h-12 rounded-lg border border-[#D9D9D9] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#23BD92] focus:border-transparent"
          />
          {error && (
            <p className="text-red-500 text-sm mt-1">{error}</p>
          )}
        </div>

        <button
          type="submit"
          className="bg-[#23BD92] hover:bg-[#1ea87c] text-white font-bold text-base rounded-lg w-full h-12 flex items-center justify-center transition-colors"
        >
          Toevoegen
        </button>
      </form>
    </div>
  )
}

