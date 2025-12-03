import { X } from "lucide-react";

export default function DeleteDocumentFromRolesModal({
  entries,
  documentName,
  onConfirm,
  onClose,
  isMultiple,
}) {
  const single = !isMultiple ? entries?.[0] : null;

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

      {/* MULTIPLE ENTRIES */}
      {isMultiple ? (
        <div className="text-center text-[18px] leading-6 text-black">
          <p className="mb-4">
            Weet je zeker dat je het document<br />
            <span className="font-semibold">&quot;{documentName}&quot;</span><br />
            wilt verwijderen uit<br />
            <span className="font-semibold">{entries.length} combinaties</span>?
          </p>

          <div className="h-fit overflow-y-auto scrollbar-hide text-sm mt-2">
            {entries.slice(0, 5).map((entry, idx) => (
              <div key={idx}>
                • {entry.role} — map: {entry.folder}
              </div>
            ))}
            {entries.length > 5 && (
              <div className="text-gray-500">
                ... en {entries.length - 5} meer
              </div>
            )}
          </div>
        </div>
      ) : (
        /* SINGLE ENTRY */
        <p className="text-center text-[18px] leading-6 text-black px-6">
          Weet je zeker dat je het document<br />
          <span className="font-semibold">&quot;{documentName}&quot;</span><br />
          wilt verwijderen uit de map<br />
          <span className="font-semibold">&quot;{single?.folder}&quot;</span><br />
          voor rol<br />
          <span className="font-semibold">&quot;{single?.role}&quot;</span>?
        </p>
      )}

      <button
        onClick={onConfirm}
        className="bg-[#E94F4F] hover:bg-red-600 text-white font-bold text-base rounded-lg w-fit px-4 py-2 flex items-center justify-center"
      >
        {isMultiple
          ? `Verwijder uit ${entries.length} combinaties`
          : "Verwijder uit rol"}
      </button>
    </div>
  );
}