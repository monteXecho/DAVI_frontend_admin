// components/modal/DeleteDocumentFromFoldersModal.jsx
import { X } from "lucide-react"

export default function DeleteDocumentFromFoldersModal({ folders, documentName, onConfirm, onClose, isMultiple }) {
  return (
    <div className="relative w-[350px] h-[350px] bg-white shadow-md rounded-2xl flex flex-col items-center justify-center gap-10">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        aria-label="Close"
      >
        <X size={22} />
      </button>

      <div className="w-12 h-12 rounded-full bg-[#E94F4F] flex items-center justify-center">
        <span className="text-white text-3xl leading-none">×</span>
      </div>

      {isMultiple ? (
        <div className="text-center text-[18px] leading-6 text-black px-6">
          <p className="mb-4">
            Weet je zeker dat je <br />
            <span className="font-semibold">&quot;{documentName}&quot;</span>
            <br />
            wil verwijderen uit <span className="font-semibold">{folders.length} mappen</span>?
          </p>
          <div className="max-h-20 overflow-y-auto text-sm mt-2">
            {folders.slice(0, 5).map((folder, index) => (
              <div key={index} className="truncate">
                • {folder}
              </div>
            ))}
            {folders.length > 5 && (
              <div className="text-gray-500">
                ... en {folders.length - 5} meer
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center text-[18px] leading-6 text-black px-6">
          Weet je zeker dat je <br />
          <span className="font-semibold">&quot;{documentName}&quot;</span>
          <br />
          wil verwijderen uit map<br />
          <span className="font-semibold">&quot;{folders[0]}&quot;</span>?
        </p>
      )}

      <button
        onClick={onConfirm}
        className="bg-[#E94F4F] hover:bg-red-600 text-white font-bold text-base rounded-lg w-[196px] h-10 flex items-center justify-center"
      >
        {isMultiple ? `Verwijder uit ${folders.length} mappen` : 'Verwijder uit map'}
      </button>
    </div>
  )
}