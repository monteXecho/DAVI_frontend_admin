import { useState, useEffect } from "react"
import { X } from "lucide-react"

export default function AddEditUrlModal({
  source = null, // null for add, source object for edit
  onConfirm,
  onClose,
}) {
  const [url, setUrl] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (source) {
      setUrl(source.url || "")
      setIsActive(source.status === "active")
    } else {
      setUrl("")
      setIsActive(true)
    }
    setError("")
  }, [source])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    if (!url.trim()) {
      setError("Voer een webadres in")
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
      setError("Voer een geldig webadres in")
      return
    }

    onConfirm({
      url: validUrl,
      status: isActive ? "active" : "inactive",
      sourceId: source?.id,
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
        {source ? "Webadres bewerken" : "Nieuw webadres toevoegen"}
      </h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Webadres
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

        {/* Active Checkbox */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-[#23BD92] focus:ring-[#23BD92]"
          />
          <label htmlFor="active" className="text-sm font-medium text-gray-700 cursor-pointer">
            Actief
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-[#23BD92] hover:bg-[#1ea87c] text-white font-bold text-base rounded-lg w-full h-12 flex items-center justify-center transition-colors"
        >
          {source ? "Opslaan" : "Toevoegen"}
        </button>
      </form>
    </div>
  )
}

