'use client';
import { useState } from "react";
import { X, Building2, Users, Shield, FileText, Briefcase, Settings } from "lucide-react";
import Toggle from "@/components/buttons/Toggle";
import CheckBox from "@/components/buttons/CheckBox";

export default function AddCompany({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Resource limits state
  const [maxUsers, setMaxUsers] = useState(1024);
  const [maxAdmins, setMaxAdmins] = useState(4);
  const [maxDocuments, setMaxDocuments] = useState(2048);
  const [maxRoles, setMaxRoles] = useState(512);
  const [unlimitedUsers, setUnlimitedUsers] = useState(false);
  const [unlimitedAdmins, setUnlimitedAdmins] = useState(false);
  const [unlimitedDocuments, setUnlimitedDocuments] = useState(false);
  const [unlimitedRoles, setUnlimitedRoles] = useState(false);
  
  // Module permissions state
  const [modulePermissions, setModulePermissions] = useState({
    'Documenten chat': false,
    'GGD Checks': false,
    'Admin Dashboard': false,
    'Webcrawler': false,
    'Nexcloud': false,
  });

  const handleNumberChange = (setter, value, min = 0) => {
    const num = parseInt(value) || min;
    setter(Math.max(min, num));
  };

  const handleNumberIncrement = (setter, current, step = 1) => {
    setter(current + step);
  };

  const handleNumberDecrement = (setter, current, step = 1, min = 0) => {
    setter(Math.max(min, current - step));
  };

  const handleSubmit = async () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = "Bedrijfsnaam is verplicht";
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setIsSubmitting(true);
    
    try {
      // Prepare limits
      const limits = {
        max_users: unlimitedUsers ? -1 : maxUsers,
        max_admins: unlimitedAdmins ? -1 : maxAdmins,
        max_documents: unlimitedDocuments ? -1 : maxDocuments,
        max_roles: unlimitedRoles ? -1 : maxRoles,
      };
      
      // Prepare modules
      const modules = {};
      Object.entries(modulePermissions).forEach(([moduleName, enabled]) => {
        // Map frontend names to backend names
        let backendName = moduleName;
        if (moduleName === 'Admin Dashboard') backendName = 'Admin Dashboard';
        else if (moduleName === 'Webcrawler') backendName = 'Webcrawler';
        else if (moduleName === 'Nexcloud') backendName = 'Nexcloud';
        
        modules[backendName] = { enabled };
      });
      
      await onCreate(name, limits, modules);
      onClose();
    } catch (error) {
      console.error("Failed to create company:", error);
      setErrors({ submit: error.response?.data?.detail || error.message || "Fout bij aanmaken van bedrijf" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-hide">
      {/* Header with gradient */}
      <div className="sticky top-0 z-10 relative bg-gradient-to-r from-[#23BD92] to-[#1a9d7a] px-8 py-6">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-white/80 hover:text-white transition-colors duration-200 p-1.5 rounded-lg hover:bg-white/10"
          aria-label="Sluiten"
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Building2 className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white font-montserrat">Nieuw Bedrijf Toevoegen</h2>
            <p className="text-white/90 text-sm mt-1">Maak een nieuwe organisatie tenant aan</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6 space-y-6">
        {/* Company Name */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 font-montserrat">
            Bedrijfsnaam <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="bijv. Parkview Childcare BV"
              className={`w-full h-12 px-4 pr-12 text-gray-900 placeholder-gray-400 rounded-xl border-2 transition-all duration-200 outline-none font-montserrat ${
                errors.name ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-gray-200 focus:border-[#23BD92] focus:ring-4 focus:ring-[#23BD92]/10'
              }`}
              autoFocus
            />
            {name && !errors.name && (
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
            <p className="text-sm text-red-600 font-montserrat">{errors.name}</p>
          )}
        </div>

        {/* Resource Limits Section */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#23BD92]/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-[#23BD92]" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-montserrat text-gray-900">Resource Limieten</h3>
              <p className="text-sm text-gray-600">Configureer maximale limieten voor resources</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Max Users */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-white hover:bg-gray-50/50 transition-colors duration-200 border border-gray-200">
              <label className="font-montserrat text-base font-semibold text-gray-800 sm:w-64 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#23BD92]" />
                Maximaal aantal gebruikers
              </label>
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => handleNumberDecrement(setMaxUsers, maxUsers, 1, 0)}
                  disabled={unlimitedUsers}
                  className="w-10 h-10 rounded-lg border-2 border-[#23BD92] text-[#23BD92] font-bold hover:bg-[#23BD92] hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-sm"
                >
                  −
                </button>
                <input
                  type="number"
                  value={unlimitedUsers ? '∞' : maxUsers}
                  onChange={(e) => !unlimitedUsers && handleNumberChange(setMaxUsers, e.target.value)}
                  disabled={unlimitedUsers}
                  className="w-28 h-10 border-2 border-gray-300 rounded-lg px-4 text-center font-montserrat font-semibold disabled:bg-gray-200 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#23BD92] focus:border-transparent transition-all"
                />
                <button
                  onClick={() => handleNumberIncrement(setMaxUsers, maxUsers, 1)}
                  disabled={unlimitedUsers}
                  className="w-10 h-10 rounded-lg border-2 border-[#23BD92] text-[#23BD92] font-bold hover:bg-[#23BD92] hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-sm"
                >
                  +
                </button>
                <div className="flex items-center gap-2 ml-4">
                  <CheckBox
                    toggle={unlimitedUsers}
                    onChange={setUnlimitedUsers}
                    color="#23BD92"
                  />
                  <span className="font-montserrat text-sm font-medium text-gray-700">Onbeperkt</span>
                </div>
              </div>
            </div>

            {/* Max Admins */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-white hover:bg-gray-50/50 transition-colors duration-200 border border-gray-200">
              <label className="font-montserrat text-base font-semibold text-gray-800 sm:w-64 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#23BD92]" />
                Maximaal aantal admins
              </label>
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => handleNumberDecrement(setMaxAdmins, maxAdmins, 1, 0)}
                  disabled={unlimitedAdmins}
                  className="w-10 h-10 rounded-lg border-2 border-[#23BD92] text-[#23BD92] font-bold hover:bg-[#23BD92] hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-sm"
                >
                  −
                </button>
                <input
                  type="number"
                  value={unlimitedAdmins ? '∞' : maxAdmins}
                  onChange={(e) => !unlimitedAdmins && handleNumberChange(setMaxAdmins, e.target.value)}
                  disabled={unlimitedAdmins}
                  className="w-28 h-10 border-2 border-gray-300 rounded-lg px-4 text-center font-montserrat font-semibold disabled:bg-gray-200 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#23BD92] focus:border-transparent transition-all"
                />
                <button
                  onClick={() => handleNumberIncrement(setMaxAdmins, maxAdmins, 1)}
                  disabled={unlimitedAdmins}
                  className="w-10 h-10 rounded-lg border-2 border-[#23BD92] text-[#23BD92] font-bold hover:bg-[#23BD92] hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-sm"
                >
                  +
                </button>
                <div className="flex items-center gap-2 ml-4">
                  <CheckBox
                    toggle={unlimitedAdmins}
                    onChange={setUnlimitedAdmins}
                    color="#23BD92"
                  />
                  <span className="font-montserrat text-sm font-medium text-gray-700">Onbeperkt</span>
                </div>
              </div>
            </div>

            {/* Max Documents */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-white hover:bg-gray-50/50 transition-colors duration-200 border border-gray-200">
              <label className="font-montserrat text-base font-semibold text-gray-800 sm:w-64 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#23BD92]" />
                Maximaal aantal documenten
              </label>
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => handleNumberDecrement(setMaxDocuments, maxDocuments, 1, 0)}
                  disabled={unlimitedDocuments}
                  className="w-10 h-10 rounded-lg border-2 border-[#23BD92] text-[#23BD92] font-bold hover:bg-[#23BD92] hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-sm"
                >
                  −
                </button>
                <input
                  type="number"
                  value={unlimitedDocuments ? '∞' : maxDocuments}
                  onChange={(e) => !unlimitedDocuments && handleNumberChange(setMaxDocuments, e.target.value, 0)}
                  disabled={unlimitedDocuments}
                  className="w-28 h-10 border-2 border-gray-300 rounded-lg px-4 text-center font-montserrat font-semibold disabled:bg-gray-200 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#23BD92] focus:border-transparent transition-all"
                />
                <button
                  onClick={() => handleNumberIncrement(setMaxDocuments, maxDocuments, 1)}
                  disabled={unlimitedDocuments}
                  className="w-10 h-10 rounded-lg border-2 border-[#23BD92] text-[#23BD92] font-bold hover:bg-[#23BD92] hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-sm"
                >
                  +
                </button>
                <div className="flex items-center gap-2 ml-4">
                  <CheckBox
                    toggle={unlimitedDocuments}
                    onChange={setUnlimitedDocuments}
                    color="#23BD92"
                  />
                  <span className="font-montserrat text-sm font-medium text-gray-700">Onbeperkt</span>
                </div>
              </div>
            </div>

            {/* Max Roles */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-white hover:bg-gray-50/50 transition-colors duration-200 border border-gray-200">
              <label className="font-montserrat text-base font-semibold text-gray-800 sm:w-64 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#23BD92]" />
                Maximaal aantal rollen
              </label>
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => handleNumberDecrement(setMaxRoles, maxRoles, 1, 0)}
                  disabled={unlimitedRoles}
                  className="w-10 h-10 rounded-lg border-2 border-[#23BD92] text-[#23BD92] font-bold hover:bg-[#23BD92] hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-sm"
                >
                  −
                </button>
                <input
                  type="number"
                  value={unlimitedRoles ? '∞' : maxRoles}
                  onChange={(e) => !unlimitedRoles && handleNumberChange(setMaxRoles, e.target.value, 0)}
                  disabled={unlimitedRoles}
                  className="w-28 h-10 border-2 border-gray-300 rounded-lg px-4 text-center font-montserrat font-semibold disabled:bg-gray-200 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#23BD92] focus:border-transparent transition-all"
                />
                <button
                  onClick={() => handleNumberIncrement(setMaxRoles, maxRoles, 1)}
                  disabled={unlimitedRoles}
                  className="w-10 h-10 rounded-lg border-2 border-[#23BD92] text-[#23BD92] font-bold hover:bg-[#23BD92] hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-sm"
                >
                  +
                </button>
                <div className="flex items-center gap-2 ml-4">
                  <CheckBox
                    toggle={unlimitedRoles}
                    onChange={setUnlimitedRoles}
                    color="#23BD92"
                  />
                  <span className="font-montserrat text-sm font-medium text-gray-700">Onbeperkt</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Module Permissions Section */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#23BD92]/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-[#23BD92]" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-montserrat text-gray-900">Module Toegang</h3>
              <p className="text-sm text-gray-600">Activeer of deactiveer modules voor dit bedrijf</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(modulePermissions).map(([moduleName, enabled]) => (
              <div 
                key={moduleName} 
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                  enabled 
                    ? 'bg-gradient-to-r from-[#F0FDF4] to-white border-[#23BD92]/30 shadow-sm' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    enabled ? 'bg-[#23BD92]/20' : 'bg-gray-200'
                  }`}>
                    <svg className={`w-4 h-4 ${enabled ? 'text-[#23BD92]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className={`font-montserrat text-base font-medium ${
                    enabled ? 'text-gray-900' : 'text-gray-600'
                  }`}>
                    {moduleName}
                  </span>
                </div>
                <Toggle
                  checked={enabled}
                  onChange={(val) => setModulePermissions(prev => ({ ...prev, [moduleName]: val }))}
                  activeColor="#23BD92"
                />
              </div>
            ))}
          </div>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-600 font-montserrat">{errors.submit}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 font-medium rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-montserrat"
          >
            Annuleren
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || isSubmitting}
            className="px-6 py-2.5 bg-gradient-to-r from-[#23BD92] to-[#1a9d7a] text-white font-semibold rounded-xl shadow-lg shadow-[#23BD92]/25 hover:shadow-xl hover:shadow-[#23BD92]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 font-montserrat"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Aanmaken...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Bedrijf Aanmaken
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
