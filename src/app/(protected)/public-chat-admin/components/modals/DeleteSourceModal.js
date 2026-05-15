import { X } from "lucide-react"

export default function DeleteSourceModal({
  sources,
  onConfirm,
  onClose,
  isMultiple
}) {
  const single = !isMultiple ? sources?.[0] : null

  const previewItems = sources?.slice(0, 5) || []
  const remaining = Math.max(0, (sources?.length || 0) - previewItems.length)

  return (
    <div className="relative w-fit h-fit py-7 px-13 bg-white shadow-md rounded-2xl flex flex-col items-center justify-center gap-10">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        aria-label="Close"
      >
        <X size={22} />
      </button>

      {/* Red delete icon */}
      <div className="w-12 h-12 rounded-full bg-[#E94F4F] flex items-center justify-center">
        <span className="text-white text-3xl leading-none">×</span>
      </div>

      {/* MULTIPLE SOURCES */}
      {isMultiple ? (
        <div className="text-center text-[18px] leading-6 text-black">
          <p className="mb-4">
            Weet je zeker dat je<br />
            <span className="font-semibold">{sources?.length || 0} bron{((sources?.length || 0) !== 1) ? 'nen' : ''}</span><br />
            wilt verwijderen?
          </p>

          <div className="h-fit overflow-y-auto scrollbar-hide text-sm mt-2 max-h-40">
            {previewItems.map((source, index) => (
              <div key={index} className="truncate">
                • {source.url || source.file_name || `Bron ${index + 1}`}
              </div>
            ))}

            {remaining > 0 && (
              <div className="text-gray-500">
                ... en {remaining} meer
              </div>
            )}
          </div>
        </div>
      ) : (
        /* SINGLE SOURCE */
        <p className="text-center text-[18px] leading-6 text-black px-6">
          Weet je zeker dat je de bron<br />
          <span className="font-semibold">&quot;{single?.url || single?.file_name || "Onbekend"}&quot;</span><br />
          wilt verwijderen?
        </p>
      )}

      {/* Confirm Button */}
      <button
        onClick={onConfirm}
        className="bg-[#E94F4F] hover:bg-red-600 text-white font-bold text-base rounded-lg w-fit h-fit px-4 py-2 flex items-center justify-center"
      >
        {isMultiple
          ? `Verwijder ${sources?.length || 0} bron${((sources?.length || 0) !== 1) ? 'nen' : ''}`
          : "Verwijder bron"}
      </button>
    </div>
  )
}

