'use client'
import { useState, useEffect, useMemo } from "react";
import { X, UserPlus, Mail, User, Building2, Settings } from "lucide-react";
import DropdownMenu from "@/components/input/DropdownMenu";
import Toggle from "@/components/buttons/Toggle";

export default function AddAdmin({ onClose, onCreate, selectedCompany, companies = [] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Get company modules (enabled modules for this company) - handle both array and object formats
  const companyModules = useMemo(() => {
    const modules = selectedCompany?.modules || {};
    // If it's an array, convert to object format
    if (Array.isArray(modules)) {
      const modulesObj = {};
      modules.forEach(moduleItem => {
        if (moduleItem && moduleItem.name) {
          modulesObj[moduleItem.name] = {
            enabled: moduleItem.enabled === true,
            desc: moduleItem.desc || ""
          };
        }
      });
      return modulesObj;
    }
    // If it's already an object, return as is
    return modules;
  }, [selectedCompany?.id, JSON.stringify(selectedCompany?.modules)]);
  
  const companyModuleNames = useMemo(() => {
    return Object.keys(companyModules).filter(
      key => {
        const moduleConfig = companyModules[key];
        const isEnabled = moduleConfig?.enabled === true;
        // Only include if it's not a numeric key (indices)
        const isNotIndex = isNaN(parseInt(key));
        return isEnabled && isNotIndex;
      }
    );
  }, [companyModules]);
  
  // Module selection state
  const [selectedModules, setSelectedModules] = useState({});
  
  const allOptions = useMemo(() => companies.map((c) => c.name), [companies]);
  const [selected, setSelected] = useState(() => selectedCompany?.name || allOptions[0] || "");

  // Initialize module selection when company changes
  useEffect(() => {
    if (selectedCompany?.name) {
      setSelected(selectedCompany.name);
    }
    
    // Reset module selection when company changes
    const modules = {};
    companyModuleNames.forEach(moduleName => {
      modules[moduleName] = false;
    });
    setSelectedModules(modules);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompany?.id, selectedCompany?.name, companyModuleNames.join(',')]); // Use stable dependencies

  useEffect(() => {
    if (allOptions.length === 0) return;
    if (!selected) {
      setSelected(allOptions[0]);
    } else if (!allOptions.includes(selected)) {
      setSelected(selectedCompany?.name || allOptions[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allOptions.join(','), selectedCompany?.name]); // Use stable dependencies

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleModuleToggle = (moduleName) => {
    // Only allow toggling if module is enabled for company
    if (companyModules[moduleName]?.enabled === true) {
      setSelectedModules(prev => ({
        ...prev,
        [moduleName]: !prev[moduleName]
      }));
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = "E-mailadres is verplicht";
    } else if (!validateEmail(email)) {
      newErrors.email = "Voer een geldig e-mailadres in";
    }
    
    if (!name.trim()) {
      newErrors.name = "Naam is verplicht";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    
    try {
      const company = companies.find(c => c.name === selected);
      if (company && onCreate) {
        // Convert selected modules to the format expected by the API
        const modulesToSave = companyModuleNames
          .filter(moduleName => selectedModules[moduleName] === true)
          .map(moduleName => ({
            name: moduleName,
            enabled: true
          }));
        
        await onCreate(company.id, name, email, modulesToSave);
        onClose();
      }
    } catch (error) {
      console.error("Failed to create admin:", error);
      const errorMessage = error.response?.data?.detail || error.message || "Fout bij aanmaken van admin";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCompanyObj = companies.find(c => c.name === selected);

  return (
    <div className="relative w-full max-w-[640px] bg-white rounded-3xl shadow-2xl overflow-hidden">
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
            <UserPlus className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Admin Toevoegen</h2>
            <p className="text-white/90 text-sm mt-1">Voeg een nieuwe administrator toe voor het geselecteerde bedrijf</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6 space-y-6">
        <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl p-4 border border-blue-100">
          <p className="text-sm text-gray-700 leading-relaxed">
            De admin krijgt toegang tot het beheren van gebruikers, rollen en documenten voor het geselecteerde bedrijf. U kunt modules toewijzen tijdens het aanmaken.
          </p>
        </div>

        {/* Company Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Building2 size={16} className="text-gray-500" />
            Bedrijf <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DropdownMenu value={selected} onChange={setSelected} allOptions={allOptions} />
          </div>
        </div>

        {/* Email and Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Mail size={16} className="text-gray-500" />
              Admin E-mailadres <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="person@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                className={`w-full h-12 px-4 pl-11 text-gray-900 placeholder-gray-400 rounded-xl border-2 transition-all duration-200 outline-none ${
                  errors.email 
                    ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                    : 'border-gray-200 focus:border-[#23BD92] focus:ring-4 focus:ring-[#23BD92]/10'
                }`}
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              {email && !errors.email && validateEmail(email) && (
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
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User size={16} className="text-gray-500" />
              Volledige Naam <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="First Last"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className={`w-full h-12 px-4 pl-11 text-gray-900 placeholder-gray-400 rounded-xl border-2 transition-all duration-200 outline-none ${
                  errors.name 
                    ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                    : 'border-gray-200 focus:border-[#23BD92] focus:ring-4 focus:ring-[#23BD92]/10'
                }`}
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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
              <p className="text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.name}
              </p>
            )}
          </div>
        </div>

        {/* Module Assignment Section */}
        {companyModuleNames.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Settings size={18} className="text-gray-600" />
              <label className="text-sm font-semibold text-gray-700">
                Module Toewijzingen
              </label>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {companyModuleNames.map((moduleName) => {
                  const isEnabled = companyModules[moduleName]?.enabled === true;
                  const isSelected = selectedModules[moduleName] === true;
                  
                  return (
                    <div
                      key={moduleName}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#F0FDF4] to-white border-[#23BD92]/30 shadow-sm'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      } ${
                        !isEnabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                      onClick={() => isEnabled && handleModuleToggle(moduleName)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-[#23BD92]/20' : 'bg-gray-200'
                        }`}>
                          <svg className={`w-4 h-4 ${isSelected ? 'text-[#23BD92]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className={`font-montserrat text-sm font-medium ${
                          isSelected ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {moduleName}
                        </span>
                      </div>
                      <Toggle
                        checked={isSelected}
                        onChange={() => isEnabled && handleModuleToggle(moduleName)}
                        activeColor="#23BD92"
                        disabled={!isEnabled}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Selecteer de modules die deze admin mag gebruiken. Alleen modules die voor dit bedrijf zijn ingeschakeld, zijn beschikbaar.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 font-medium rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            Annuleren
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !email.trim() || !name.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-[#23BD92] to-[#1a9d7a] text-white font-semibold rounded-xl shadow-lg shadow-[#23BD92]/25 hover:shadow-xl hover:shadow-[#23BD92]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Aanmaken...
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Admin Aanmaken
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
