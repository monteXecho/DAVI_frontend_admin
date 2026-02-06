import { X, AlertTriangle, Trash2 } from "lucide-react";

export default function DeleteCompanyModal({ company, onConfirm, onClose }) {
  return (
    <div className="relative w-full max-w-[420px] bg-white rounded-3xl shadow-2xl overflow-hidden">
      {/* Header with warning gradient */}
      <div className="relative bg-gradient-to-r from-red-500 to-red-600 px-6 py-5">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors duration-200 p-1.5 rounded-lg hover:bg-white/10"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="px-6 py-8 flex flex-col items-center space-y-6">
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
          <AlertTriangle className="text-red-600" size={32} />
        </div>

        {/* Message */}
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-gray-900">
            Delete Company?
          </p>
          <p className="text-sm text-gray-600 leading-relaxed px-4">
            Weet je zeker dat je
            <br />
            <span className="font-bold text-gray-900">{company?.name}</span>
            <br />
            wil verwijderen? Deze actie kan niet ongedaan worden.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onConfirm}
          className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Trash2 size={18} />
          Verwijder bedrijf
        </button>
      </div>
    </div>
  );
}
