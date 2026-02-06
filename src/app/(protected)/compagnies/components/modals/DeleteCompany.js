'use client';
import { useState } from "react";
import { X, AlertTriangle, Building2, Trash2 } from "lucide-react";

export default function DeleteCompany({ onClose, selectedCompany, onDelete }) {
  const [confirmName, setConfirmName] = useState("");
  const [isConfirm, setIsConfirm] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmName.trim() !== selectedCompany.name.trim()) {
      setIsConfirm(false);
      return;
    }

    try {
      setIsDeleting(true);
      setIsConfirm(true);
      if (onDelete) await onDelete(selectedCompany.id); 
      onClose(); 
    } catch (err) {
      console.error("Delete company failed:", err);
      setIsDeleting(false);
    }
  };

  const isNameMatch = confirmName.trim() === selectedCompany?.name?.trim();

  return (
    <div className="relative w-full max-w-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden">
      {/* Header with warning gradient */}
      <div className="relative bg-gradient-to-r from-red-500 to-red-600 px-8 py-6">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-white/80 hover:text-white transition-colors duration-200 p-1.5 rounded-lg hover:bg-white/10"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <AlertTriangle className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Delete Company</h2>
            <p className="text-white/90 text-sm mt-1">This action cannot be undone</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6 space-y-6">
        {/* Warning Box */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-5 border-2 border-red-100">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-red-900">Permanent Deletion Warning</p>
              <p className="text-sm text-red-700 leading-relaxed">
                This will permanently remove the organization, all users, roles, documents, and associated data. 
                This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Building2 size={16} className="text-gray-500" />
            Selected Company
          </label>
          <div className="relative">
            <input
              type="text"
              className="w-full h-12 px-4 bg-gray-50 text-gray-700 rounded-xl border-2 border-gray-200 cursor-not-allowed"
              value={`${selectedCompany?.name} (ID: ${selectedCompany?.id})`}
              readOnly
            />
          </div>
        </div>

        {/* Confirmation Input */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Type the company name to confirm <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder={selectedCompany?.name}
              value={confirmName}
              onChange={(e) => {
                setConfirmName(e.target.value);
                setIsConfirm(true);
              }}
              onKeyDown={(e) => e.key === 'Enter' && isNameMatch && handleDelete()}
              className={`w-full h-12 px-4 text-gray-900 placeholder-gray-400 rounded-xl border-2 transition-all duration-200 outline-none ${
                !isConfirm && !isNameMatch
                  ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                  : isNameMatch
                  ? 'border-[#23BD92] focus:ring-4 focus:ring-[#23BD92]/10'
                  : 'border-gray-200 focus:border-gray-300 focus:ring-4 focus:ring-gray-100'
              }`}
              autoFocus
            />
            {isNameMatch && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-6 h-6 rounded-full bg-[#23BD92] flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
          {!isConfirm && !isNameMatch && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Company name does not match. Please type it exactly as shown.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-6 py-2.5 text-gray-700 font-medium rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!isNameMatch || isDeleting}
            className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={18} />
                Permanently Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
