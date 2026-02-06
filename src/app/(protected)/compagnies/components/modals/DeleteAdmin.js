import { useState } from "react";
import { X, UserMinus, UserPlus, Mail, User, Building2, AlertCircle } from "lucide-react";

export default function DeleteAdmin({
  onClose,
  selectedCompany,
  selectedAdminId,
  onDelete,
  onReAssign
}) {
  const admin = selectedCompany?.admins.find(a => a.id === selectedAdminId);
  const defaultAdminName = admin?.name || "";

  const [reassignEmail, setReassignEmail] = useState("");
  const [reassignName, setReassignName] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleDelete = async () => {
    const hasReassign = reassignEmail.trim() !== "";

    if (hasReassign) {
      const newErrors = {};
      if (!validateEmail(reassignEmail)) {
        newErrors.email = "Please enter a valid email address";
      }
      if (!reassignName.trim()) {
        newErrors.name = "Full name is required";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      if (hasReassign) {
        await onReAssign(selectedCompany.id, selectedAdminId, reassignName, reassignEmail);
      } else {
        await onDelete(selectedCompany.id, selectedAdminId);
      }
      onClose();
    } catch (error) {
      console.error("Failed to delete/reassign admin:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasReassignData = reassignEmail.trim() !== "" || reassignName.trim() !== "";

  return (
    <div className="relative w-full max-w-[680px] bg-white rounded-3xl shadow-2xl overflow-hidden">
      {/* Header with warning gradient */}
      <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-6">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-white/80 hover:text-white transition-colors duration-200 p-1.5 rounded-lg hover:bg-white/10"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <UserMinus className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Remove Admin</h2>
            <p className="text-white/90 text-sm mt-1">Revoke admin access or reassign to a new admin</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6 space-y-6">
        {/* Warning Box */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border-2 border-amber-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-amber-900">Admin Removal Notice</p>
              <p className="text-sm text-amber-700 leading-relaxed">
                This will immediately revoke admin access. You can optionally create a replacement admin to transfer responsibilities.
              </p>
            </div>
          </div>
        </div>

        {/* Company and Admin Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Building2 size={16} className="text-gray-500" />
              Company
            </label>
            <input
              type="text"
              className="w-full h-12 px-4 bg-gray-50 text-gray-700 rounded-xl border-2 border-gray-200 cursor-not-allowed"
              value={`${selectedCompany?.name} (ID: ${selectedCompany?.id})`}
              readOnly
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User size={16} className="text-gray-500" />
              Admin to Remove
            </label>
            <input
              type="text"
              className="w-full h-12 px-4 bg-gray-50 text-gray-700 rounded-xl border-2 border-gray-200 cursor-not-allowed"
              value={defaultAdminName}
              readOnly
            />
          </div>
        </div>

        {/* Reassign Section */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <UserPlus className="text-[#23BD92]" size={20} />
            <label className="text-sm font-semibold text-gray-700">
              Create Replacement Admin <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl p-4 border border-blue-100">
            <p className="text-xs text-gray-600 leading-relaxed">
              Leave empty if you only want to remove the admin without creating a replacement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600 flex items-center gap-2">
                <Mail size={14} className="text-gray-400" />
                New Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="person@company.com"
                  value={reassignEmail}
                  onChange={(e) => {
                    setReassignEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                  className={`w-full h-12 px-4 pl-11 text-gray-900 placeholder-gray-400 rounded-xl border-2 transition-all duration-200 outline-none ${
                    errors.email 
                      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                      : 'border-gray-200 focus:border-[#23BD92] focus:ring-4 focus:ring-[#23BD92]/10'
                  }`}
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                {reassignEmail && !errors.email && validateEmail(reassignEmail) && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-6 h-6 rounded-full bg-[#23BD92] flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600 flex items-center gap-2">
                <User size={14} className="text-gray-400" />
                New Admin Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="First Last"
                  value={reassignName}
                  onChange={(e) => {
                    setReassignName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: null });
                  }}
                  className={`w-full h-12 px-4 pl-11 text-gray-900 placeholder-gray-400 rounded-xl border-2 transition-all duration-200 outline-none ${
                    errors.name 
                      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                      : 'border-gray-200 focus:border-[#23BD92] focus:ring-4 focus:ring-[#23BD92]/10'
                  }`}
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                {reassignName && !errors.name && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-6 h-6 rounded-full bg-[#23BD92] flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              {errors.name && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-gray-700 font-medium rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={
              isSubmitting ||
              (hasReassignData && (!reassignEmail.trim() || !reassignName.trim() || errors.email || errors.name))
            }
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : hasReassignData ? (
              <>
                <UserPlus size={18} />
                Remove & Create New Admin
              </>
            ) : (
              <>
                <UserMinus size={18} />
                Remove Admin
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
