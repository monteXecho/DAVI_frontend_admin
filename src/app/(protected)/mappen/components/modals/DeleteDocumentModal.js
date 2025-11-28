import { X } from "lucide-react";

export default function DeleteDocumentModal({
  documents,
  onConfirm,
  onClose,
  isMultiple
}) {
  const single = !isMultiple ? documents?.[0] : null;

  const uniqMap = new Map();
  (documents || []).forEach((d) => {
    const key = `${d.role}|||${d.folder}`;
    if (!uniqMap.has(key)) {
      uniqMap.set(key, { folder: d.folder, role: d.role });
    }
  });
  const uniqueFolders = Array.from(uniqMap.values());

  const previewItems = uniqueFolders.slice(0, 5);
  const remaining = Math.max(0, uniqueFolders.length - previewItems.length);

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

      {/* MULTIPLE FOLDERS */}
      {isMultiple ? (
        <div className="text-center text-[18px] leading-6 text-black">
          <p className="mb-4">
            Weet je zeker dat je<br />
            <span className="font-semibold">{uniqueFolders.length} mappen</span><br />
            wilt verwijderen?
          </p>

          <div className="h-fit overflow-y-auto scrollbar-hide text-sm mt-2">
            {previewItems.map((it, index) => (
              <div key={index} className="truncate">
                • map: {it.folder} — rol: {it.role}
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
        /* SINGLE FOLDER */
        <p className="text-center text-[18px] leading-6 text-black px-6">
          Weet je zeker dat je de map<br />
          <span className="font-semibold">&quot;{single?.folder}&quot;</span><br />
          wilt verwijderen uit de rol<br />
          <span className="font-semibold">&quot;{single?.role}&quot;</span>?
          <br />
        </p>
      )}

      {/* Confirm Button */}
      <button
        onClick={onConfirm}
        className="bg-[#E94F4F] hover:bg-red-600 text-white font-bold text-base rounded-lg w-fit h-fit px-4 py-2 flex items-center justify-center"
      >
        {isMultiple
          ? `Verwijder ${uniqueFolders.length} mappen`
          : "Verwijder map"}
      </button>
    </div>
  );
}
