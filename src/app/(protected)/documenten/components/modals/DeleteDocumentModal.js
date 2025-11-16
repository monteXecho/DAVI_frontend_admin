import { X } from "lucide-react";

export default function DeleteDocumentModal({ documents, onConfirm, onClose, isMultiple }) {
  const singleDocument = !isMultiple && documents?.[0];
  
  return (
    <div className="relative w-fit h-fit py-7 px-13 bg-white shadow-md rounded-2xl flex flex-col items-center justify-center gap-10">
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
        <div className="text-center text-[18px] leading-6 text-black">
          <p className="mb-4">
            Weet je zeker dat je <br />
            <span className="font-semibold">{documents.length} document{documents.length !== 1 ? 'en' : ''}</span>
            <br />
            wil verwijderen?
          </p>
          <div className="h-fit overflow-y-auto scrollbar-hide text-sm mt-2">
            {documents.slice(0, 5).map((doc, index) => (
              <div key={index} className="truncate">
                • {doc.file}
              </div>
            ))}
            {documents.length > 5 && (
              <div className="text-gray-500">
                ... en {documents.length - 5} meer
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center text-[18px] leading-6 text-black px-6">
          Weet je zeker dat je <br />
          <span className="font-semibold">{singleDocument?.file}</span>
          <br />
          {singleDocument?.folder && (
            <>
              uit map <span className="font-semibold">{singleDocument.folder}</span>
              <br />
            </>
          )}
          wil verwijderen?
        </p>
      )}

      <button
        onClick={onConfirm}
        className="bg-[#E94F4F] hover:bg-red-600 text-white font-bold text-base rounded-lg w-fit h-fit px-4 py-2 flex items-center justify-center"
      >
        {isMultiple ? `Verwijder ${documents.length} documenten` : 'Verwijder document'}
      </button>
    </div>
  );
}