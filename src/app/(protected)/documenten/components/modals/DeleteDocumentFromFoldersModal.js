// components/modal/DeleteDocumentFromFoldersModal.jsx
import { X } from "lucide-react"

export default function DeleteDocumentFromFoldersModal({
  folders = [],
  folderName = "",
  documentName = "",
  onConfirm,
  onClose,
  isMultiple = false
}) {
  return (
    <div className="relative w-[360px] min-h-[340px] bg-white shadow-lg rounded-2xl flex flex-col items-center justify-center p-8 gap-8">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Sluiten"
      >
        <X size={22} />
      </button>

      <div className="w-12 h-12 rounded-full bg-[#E94F4F] flex items-center justify-center">
        <span className="text-white text-3xl leading-none">×</span>
      </div>

      {isMultiple ? (
        <div className="text-center text-[17px] leading-6 text-black px-4">
          <p className="mb-4">
            Weet je zeker dat je het document<br />
            <span className="font-semibold">"{documentName}"</span><br />
            wilt verwijderen uit <span className="font-semibold">{folders.length} mappen</span>?
          </p>
          <div className="max-h-24 overflow-y-auto text-sm text-gray-700 mt-2 space-y-1">
            {folders.slice(0, 5).map((folder, index) => (
              <div key={index} className="truncate">• {folder.name}</div>
            ))}
            {folders.length > 5 && (
              <div className="text-gray-500 italic">
                ... en {folders.length - 5} meer
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center text-[17px] leading-6 text-black px-4">
          Weet je zeker dat je het document<br />
          <span className="font-semibold">"{documentName}"</span><br />
          wilt verwijderen uit de map<br />
          <span className="font-semibold">"{folderName}"</span>?
        </p>
      )}

      <div className="flex flex-col items-center gap-3 mt-4">
        <button
          onClick={onConfirm}
          className="bg-[#E94F4F] hover:bg-red-600 text-white font-semibold text-base rounded-lg w-fit h-fit px-4 py-2 transition-all"
        >
          {isMultiple
            ? `Verwijder uit ${folders.length} mappen`
            : "Verwijder uit map"}
        </button>
      </div>
    </div>
  )
}