'use client'
import { useState, useEffect, useMemo } from "react";
import { X, User, Mail, Settings, RefreshCw, Save } from "lucide-react";
import Toggle from "@/components/buttons/Toggle";
import { useApi } from "@/lib/useApi";

export default function EditAdmin({ admin, company, onClose, onSave }) {
  const { assignModules, reassignCompanyAdmin, getCompanies } = useApi();
  const [name, setName] = useState(admin?.name || "");
  const [email, setEmail] = useState(admin?.email || "");
  const [newEmail, setNewEmail] = useState("");
  const [isReassigning, setIsReassigning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Get company modules (enabled modules for this company)
  // Handle both array and object formats
  const companyModules = useMemo(() => {
    const modules = company?.modules || {};
    console.log("Raw company modules:", modules, "type:", Array.isArray(modules) ? "array" : typeof modules);
    
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
      console.log("Converted array to object:", modulesObj);
      return modulesObj;
    }
    // If it's already an object, return as is
    console.log("Using modules as object:", modules);
    return modules;
  }, [company?.id, JSON.stringify(company?.modules)]);
  
  const companyModuleNames = useMemo(() => {
    // Extract module names from the object
    const names = Object.keys(companyModules).filter(
      key => {
        const moduleConfig = companyModules[key];
        const isEnabled = moduleConfig?.enabled === true;
        // Only include if it's not a numeric key (indices)
        const isNotIndex = isNaN(parseInt(key));
        return isEnabled && isNotIndex;
      }
    );
    console.log("Company module names extracted:", names, "from companyModules:", companyModules);
    return names;
  }, [companyModules]);
  
  // Get admin's current modules - handle both array and object formats
  const adminModules = useMemo(() => {
    const modules = admin?.modules || {};
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
  }, [admin?.id, admin?.user_id, JSON.stringify(admin?.modules)]);
  
  // Initialize selectedModules state
  const [selectedModules, setSelectedModules] = useState({});

  // Initialize and update state when admin/company changes
  // Only depend on stable IDs, not objects or arrays
  useEffect(() => {
    if (admin && company && companyModuleNames.length > 0) {
      setName(admin.name || "");
      setEmail(admin.email || "");
      setNewEmail("");
      setIsReassigning(false);
      
      // Reset module selection based on current admin and company modules
      const modules = {};
      companyModuleNames.forEach(moduleName => {
        // Check if admin has this module enabled
        const adminModule = adminModules[moduleName];
        modules[moduleName] = adminModule?.enabled === true || false;
      });
      setSelectedModules(modules);
      console.log("Initialized selectedModules:", modules, "from adminModules:", adminModules);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin?.id, admin?.user_id, company?.id, companyModuleNames.join(',')]); // Include module names to reinitialize when they change

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

  const handleSave = async () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = "Naam is verplicht";
    }
    
    if (isReassigning) {
      if (!newEmail.trim()) {
        newErrors.newEmail = "Nieuw e-mailadres is verplicht";
      } else if (!validateEmail(newEmail)) {
        newErrors.newEmail = "Voer een geldig e-mailadres in";
      } else if (newEmail.toLowerCase() === email.toLowerCase()) {
        newErrors.newEmail = "Nieuw e-mailadres moet verschillen van het huidige";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    
    try {
      // 1. Reassign email if needed
      if (isReassigning && newEmail.trim()) {
        await reassignCompanyAdmin(company.id, admin.id || admin.user_id, {
          name: name.trim(),
          email: newEmail.trim()
        });
      } else if (name.trim() !== admin.name) {
        // Only update name if it changed
        await reassignCompanyAdmin(company.id, admin.id || admin.user_id, {
          name: name.trim(),
          email: email
        });
      }

      // 2. Update modules - send all company modules with their enabled state
      const modulesToSave = companyModuleNames.map(moduleName => ({
        name: moduleName,
        enabled: selectedModules[moduleName] === true
      }));

      console.log("Saving modules:", modulesToSave);
      console.log("Selected modules state:", selectedModules);
      console.log("Company module names:", companyModuleNames);
      
      const assignResult = await assignModules(company.id, admin.id || admin.user_id, modulesToSave);
      console.log("Module assignment result:", assignResult);
      
      if (!assignResult) {
        throw new Error("Module assignment failed - no result returned");
      }

      // Refresh company data to get updated admin modules
      const companiesData = await getCompanies();
      const companiesList = Array.isArray(companiesData) ? companiesData : companiesData.companies || [];
      const updatedCompany = companiesList.find(c => c.id === company.id);
      
      if (updatedCompany) {
        // Find the updated admin in the company
        const updatedAdmin = updatedCompany.admins?.find(a => 
          (a.id || a.user_id) === (admin.id || admin.user_id)
        );
        if (updatedAdmin) {
          console.log("Updated admin modules:", updatedAdmin.modules);
        }
      }
      
      if (onSave) {
        onSave();
      }
      
      onClose();
    } catch (error) {
      console.error("Failed to update admin:", error);
      const errorMessage = error.response?.data?.detail || error.message || "Fout bij bijwerken van admin";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full max-w-[720px] bg-white rounded-3xl shadow-2xl overflow-hidden">
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
            <Settings className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Admin Bewerken</h2>
            <p className="text-white/90 text-sm mt-1">Wijzig admin gegevens en module toewijzingen</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Admin Info Section */}
        <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl p-4 border border-blue-100">
          <p className="text-sm text-gray-700 leading-relaxed">
            Wijzig de naam, e-mailadres of module toewijzingen voor deze admin. Bij het wijzigen van het e-mailadres worden alle gegevens overgedragen naar het nieuwe adres.
          </p>
        </div>

        {/* Name and Email Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User size={16} className="text-gray-500" />
              Naam <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Volledige naam"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                className={`w-full h-12 px-4 pl-11 text-gray-900 placeholder-gray-400 rounded-xl border-2 transition-all duration-200 outline-none ${
                  errors.name 
                    ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                    : 'border-gray-200 focus:border-[#23BD92] focus:ring-4 focus:ring-[#23BD92]/10'
                }`}
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Mail size={16} className="text-gray-500" />
              Huidig E-mailadres
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                disabled
                className="w-full h-12 px-4 pl-11 text-gray-600 placeholder-gray-400 rounded-xl border-2 border-gray-200 bg-gray-50 cursor-not-allowed"
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
        </div>

        {/* Email Reassignment Section */}
        <div className="space-y-3 p-4 rounded-xl border-2 border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw size={18} className="text-gray-600" />
              <label className="text-sm font-semibold text-gray-700">
                E-mailadres opnieuw toewijzen
              </label>
            </div>
            <Toggle
              checked={isReassigning}
              onChange={setIsReassigning}
              activeColor="#23BD92"
            />
          </div>
          
          {isReassigning && (
            <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
              <label className="block text-sm font-medium text-gray-700">
                Nieuw E-mailadres <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="nieuw@email.com"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    if (errors.newEmail) setErrors({ ...errors, newEmail: null });
                  }}
                  className={`w-full h-12 px-4 pl-11 text-gray-900 placeholder-gray-400 rounded-xl border-2 transition-all duration-200 outline-none ${
                    errors.newEmail 
                      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                      : 'border-gray-300 focus:border-[#23BD92] focus:ring-4 focus:ring-[#23BD92]/10'
                  }`}
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                {newEmail && !errors.newEmail && validateEmail(newEmail) && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-6 h-6 rounded-full bg-[#23BD92] flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              {errors.newEmail && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.newEmail}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Alle gegevens van deze admin worden overgedragen naar het nieuwe e-mailadres.
              </p>
            </div>
          )}
        </div>

        {/* Module Assignment Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-gray-600" />
            <label className="text-sm font-semibold text-gray-700">
              Module Toewijzingen
            </label>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            {companyModuleNames.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Geen modules beschikbaar voor dit bedrijf. Activeer eerst modules in de bedrijfsinstellingen.
              </p>
            ) : (
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
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 font-medium rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting || !name.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-[#23BD92] to-[#1a9d7a] text-white font-semibold rounded-xl shadow-lg shadow-[#23BD92]/25 hover:shadow-xl hover:shadow-[#23BD92]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Opslaan...
              </>
            ) : (
              <>
                <Save size={18} />
                Opslaan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

