import { useState } from "react";
import { X, Building2 } from "lucide-react";

export default function AddCompany({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onCreate(name);
      onClose();
    } catch (error) {
      console.error("Failed to create company:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full max-w-[560px] bg-white rounded-3xl shadow-2xl overflow-hidden">
      {/* Header with gradient */}
      <div className="relative bg-gradient-to-r from-[#23BD92] to-[#1a9d7a] px-8 py-6">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-white/80 hover:text-white transition-colors duration-200 p-1.5 rounded-lg hover:bg-white/10"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Building2 className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Create New Company</h2>
            <p className="text-white/90 text-sm mt-1">Register a new organization tenant</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6 space-y-6">
        <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl p-4 border border-blue-100">
          <p className="text-sm text-gray-700 leading-relaxed">
            You can assign modules and a primary admin now or later. The company will be created with default settings.
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Company Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="e.g., Parkview Childcare BV"
              className="w-full h-12 px-4 pr-12 text-gray-900 placeholder-gray-400 rounded-xl border-2 border-gray-200 focus:border-[#23BD92] focus:ring-4 focus:ring-[#23BD92]/10 transition-all duration-200 outline-none"
              autoFocus
            />
            {name && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-6 h-6 rounded-full bg-[#23BD92] flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 font-medium rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || isSubmitting}
            className="px-6 py-2.5 bg-gradient-to-r from-[#23BD92] to-[#1a9d7a] text-white font-semibold rounded-xl shadow-lg shadow-[#23BD92]/25 hover:shadow-xl hover:shadow-[#23BD92]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Company
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
