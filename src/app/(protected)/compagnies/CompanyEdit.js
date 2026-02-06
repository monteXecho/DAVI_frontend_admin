'use client';
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApi } from "@/lib/useApi";
import SearchBox from "@/components/input/SearchBox";
import AddButton from "@/components/buttons/AddButton";
import SortableHeader from "@/components/SortableHeader";
import { useSortableData } from "@/lib/useSortableData";
import Toggle from "@/components/buttons/Toggle";
import CheckBox from "@/components/buttons/CheckBox";
import EditIcon from "@/components/icons/EditIcon";
import RedCancelIcon from "@/components/icons/RedCancelIcon";
import DeleteAdminModal from "./components/modals/DeleteAdminModal";
import DeleteCompanyModal from "./components/modals/DeleteCompanyModal";
import EditAdmin from "./components/modals/EditAdmin";
import AddAdmin from "./components/modals/AddAdmin";

export default function CompanyEdit() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('id');
  
  const { getCompanies, getSuperAdminRolesCount, deleteCompany, deleteCompanyAdmin, updateCompanyLimits, updateCompanyModules, addCompanyAdmin } = useApi();
  const [company, setCompany] = useState(null);
  const [rolesByCompany, setRolesByCompany] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDeleteAdminModalOpen, setIsDeleteAdminModalOpen] = useState(false);
  const [isDeleteCompanyModalOpen, setIsDeleteCompanyModalOpen] = useState(false);
  const [isEditAdminModalOpen, setIsEditAdminModalOpen] = useState(false);
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  
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

  useEffect(() => {
    const fetchCompany = async () => {
      if (!companyId) {
        router.push('/compagnies/detail');
        return;
      }

      try {
        setLoading(true);
        const data = await getCompanies();
        const companiesList = Array.isArray(data) ? data : data.companies || [];
        const foundCompany = companiesList.find(c => c.id === companyId);
        
        if (!foundCompany) {
          router.push('/compagnies/detail');
          return;
        }

        setCompany(foundCompany);
        
        // Set resource limits from company data
        // Default to unlimited (-1) if not set
        const maxUsers = foundCompany.max_users !== undefined && foundCompany.max_users !== null ? foundCompany.max_users : -1;
        const maxAdmins = foundCompany.max_admins !== undefined && foundCompany.max_admins !== null ? foundCompany.max_admins : -1;
        const maxDocuments = foundCompany.max_documents !== undefined && foundCompany.max_documents !== null ? foundCompany.max_documents : -1;
        const maxRoles = foundCompany.max_roles !== undefined && foundCompany.max_roles !== null ? foundCompany.max_roles : -1;
        
        setMaxUsers(maxUsers === -1 ? 1024 : maxUsers);
        setMaxAdmins(maxAdmins === -1 ? 4 : maxAdmins);
        setMaxDocuments(maxDocuments === -1 ? 2048 : maxDocuments);
        setMaxRoles(maxRoles === -1 ? 512 : maxRoles);
        setUnlimitedUsers(maxUsers === -1);
        setUnlimitedAdmins(maxAdmins === -1);
        setUnlimitedDocuments(maxDocuments === -1);
        setUnlimitedRoles(maxRoles === -1);

        // Fetch roles count
        try {
          const rolesCountData = await getSuperAdminRolesCount();
          if (rolesCountData && typeof rolesCountData === 'object') {
            setRolesByCompany(rolesCountData);
          }
        } catch (rolesErr) {
          console.log('Roles count endpoint not available');
        }

        // Set module permissions from company data (company-level modules)
        const modulePerms = {
          'Documenten chat': false,
          'GGD Checks': false,
          'Admin Dashboard': false,
          'Webcrawler': false,
          'Nexcloud': false,
        };

        // Get company modules (company-level permissions)
        if (foundCompany.modules) {
          if (Array.isArray(foundCompany.modules)) {
            foundCompany.modules.forEach(module => {
              if (module && module.name) {
                const moduleName = module.name;
                // Map module names
                if (moduleName === 'Documenten chat' || moduleName === 'Documenten chat') {
                  modulePerms['Documenten chat'] = module.enabled === true;
                } else if (moduleName === 'GGD Checks') {
                  modulePerms['GGD Checks'] = module.enabled === true;
                } else if (moduleName === 'Admin Dashboard' || moduleName === 'Dashboard') {
                  modulePerms['Admin Dashboard'] = module.enabled === true;
                } else if (moduleName === 'Webcrawler' || moduleName === 'Web Crawler') {
                  modulePerms['Webcrawler'] = module.enabled === true;
                } else if (moduleName === 'Nexcloud' || moduleName === 'Nextcloud') {
                  modulePerms['Nexcloud'] = module.enabled === true;
                }
              }
            });
          } else if (typeof foundCompany.modules === 'object') {
            Object.keys(foundCompany.modules).forEach(moduleKey => {
              const module = foundCompany.modules[moduleKey];
              if (module) {
                const enabled = module.enabled === true || module.enabled === "true";
                // Map module names
                if (moduleKey === 'Documenten chat') {
                  modulePerms['Documenten chat'] = enabled;
                } else if (moduleKey === 'GGD Checks') {
                  modulePerms['GGD Checks'] = enabled;
                } else if (moduleKey === 'Admin Dashboard' || moduleKey === 'Dashboard') {
                  modulePerms['Admin Dashboard'] = enabled;
                } else if (moduleKey === 'Webcrawler' || moduleKey === 'Web Crawler') {
                  modulePerms['Webcrawler'] = enabled;
                } else if (moduleKey === 'Nexcloud' || moduleKey === 'Nextcloud') {
                  modulePerms['Nexcloud'] = enabled;
                }
              }
            });
          }
        }

        setModulePermissions(modulePerms);
      } catch (err) {
        console.error("Error fetching company:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId, getCompanies, getSuperAdminRolesCount, router]);

  // Format admin data for table
  const formatAdminData = useCallback((admin, adminIndex) => {
    const adminId = admin.id || admin.user_id;
    
    // Use stats from backend if available, otherwise calculate from company data
    if (admin.stats) {
      // Backend provides all statistics
      return {
        id: adminId,
        name: admin.name || "—",
        email: admin.email || "—",
        adminsCount: admin.stats.admins_created || 0,
        teamMembersCount: admin.stats.teamlid_count || 0,
        usersCount: admin.stats.users_created || 0,
        rolesCount: admin.stats.roles_created || 0,
        documentsCount: admin.stats.documents_count || 0,
      };
    }
    
    // Fallback: calculate from company data if stats not available
    // Count admins created by this admin
    const createdAdmins = company?.admins?.filter(a => {
      const addedBy = a.added_by_admin_id || a.addedByAdminId;
      return addedBy === adminId;
    }) || [];
    
    // Count users created by this admin
    const createdUsers = company?.users?.filter(u => {
      const addedBy = u.added_by_admin_id || u.addedByAdminId;
      return addedBy === adminId;
    }) || [];
    
    // Count teamlid users/admins created by this admin
    const teamlidUsers = createdUsers.filter(u => u.is_teamlid === true) || [];
    const teamlidAdmins = createdAdmins.filter(a => a.is_teamlid === true) || [];
    const teamlidCount = teamlidUsers.length + teamlidAdmins.length;
    
    // Count roles created by this admin (from rolesByCompany, we need to fetch per admin)
    // For now, if we don't have per-admin stats, we'll show 0 or try to estimate
    const adminRolesCount = 0; // Will be populated by backend stats
    
    // Count all documents uploaded by this admin
    // Documents are already included in admin.documents array
    const documentsCount = admin.documents?.length || 0;

    return {
      id: adminId,
      name: admin.name || "—",
      email: admin.email || "—",
      adminsCount: createdAdmins.length,
      teamMembersCount: teamlidCount,
      usersCount: createdUsers.length,
      rolesCount: adminRolesCount,
      documentsCount: documentsCount,
    };
  }, [company, companyId]);

  const formattedAdmins = useMemo(() => {
    if (!company?.admins) return [];
    return company.admins.map((admin, index) => formatAdminData(admin, index));
  }, [company, formatAdminData]);

  const { items: sortedAdmins, requestSort, sortConfig } = useSortableData(formattedAdmins);

  // Filter admins based on search query
  const filteredAdmins = useMemo(() => {
    if (!searchQuery.trim()) return sortedAdmins;
    
    const lowerSearch = searchQuery.toLowerCase();
    return sortedAdmins.filter(admin => 
      admin.name.toLowerCase().includes(lowerSearch) ||
      admin.email.toLowerCase().includes(lowerSearch)
    );
  }, [sortedAdmins, searchQuery]);

  const handleSave = async () => {
    try {
      // Update resource limits - always send all values
      const limits = {
        max_users: unlimitedUsers ? -1 : maxUsers,
        max_admins: unlimitedAdmins ? -1 : maxAdmins,
        max_documents: unlimitedDocuments ? -1 : maxDocuments,
        max_roles: unlimitedRoles ? -1 : maxRoles,
      };
      
      console.log('Saving limits:', limits);
      
      const result = await updateCompanyLimits(companyId, limits);
      console.log('Save result:', result);
      
      // Small delay to ensure database update is complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Refresh company data to get updated limits
      const data = await getCompanies();
      const companiesList = Array.isArray(data) ? data : data.companies || [];
      const foundCompany = companiesList.find(c => c.id === companyId);
      if (foundCompany) {
        console.log('Refreshed company data:', foundCompany);
        setCompany(foundCompany);
        // Update local state with saved values from API response
        const savedLimits = result?.limits || foundCompany;
        if (savedLimits.max_users !== undefined) {
          const maxUsers = savedLimits.max_users === -1 ? 1024 : savedLimits.max_users;
          setMaxUsers(maxUsers);
          setUnlimitedUsers(savedLimits.max_users === -1);
        }
        if (savedLimits.max_admins !== undefined) {
          const maxAdmins = savedLimits.max_admins === -1 ? 4 : savedLimits.max_admins;
          setMaxAdmins(maxAdmins);
          setUnlimitedAdmins(savedLimits.max_admins === -1);
        }
        if (savedLimits.max_documents !== undefined) {
          const maxDocuments = savedLimits.max_documents === -1 ? 2048 : savedLimits.max_documents;
          setMaxDocuments(maxDocuments);
          setUnlimitedDocuments(savedLimits.max_documents === -1);
        }
        if (savedLimits.max_roles !== undefined) {
          const maxRoles = savedLimits.max_roles === -1 ? 512 : savedLimits.max_roles;
          setMaxRoles(maxRoles);
          setUnlimitedRoles(savedLimits.max_roles === -1);
        }
      }
      
      // Save module permissions
      const modulesToSave = {};
      Object.entries(modulePermissions).forEach(([moduleName, enabled]) => {
        // Map frontend names to backend names
        let backendName = moduleName;
        if (moduleName === 'Admin Dashboard') backendName = 'Admin Dashboard';
        else if (moduleName === 'Webcrawler') backendName = 'Webcrawler';
        else if (moduleName === 'Nexcloud') backendName = 'Nexcloud';
        
        modulesToSave[backendName] = { enabled };
      });
      
      await updateCompanyModules(companyId, { modules: modulesToSave });
      console.log('Module permissions saved:', modulesToSave);
      
      // Show success message and navigate back
      alert('Instellingen opgeslagen!');
      router.push('/compagnies/detail');
    } catch (err) {
      console.error('Error saving company settings:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Fout bij opslaan van instellingen. Probeer het opnieuw.';
      alert(errorMessage);
    }
  };

  const handleDeleteCompany = async () => {
    try {
      await deleteCompany(companyId);
      setIsDeleteCompanyModalOpen(false);
      router.push('/compagnies/detail');
    } catch (err) {
      console.error('Error deleting company:', err);
      alert('Fout bij verwijderen van bedrijf.');
      setIsDeleteCompanyModalOpen(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin || !companyId) return;
    
    try {
      await deleteCompanyAdmin(companyId, selectedAdmin.id);
      setIsDeleteAdminModalOpen(false);
      setSelectedAdmin(null);
      // Refresh company data
      const data = await getCompanies();
      const companiesList = Array.isArray(data) ? data : data.companies || [];
      const foundCompany = companiesList.find(c => c.id === companyId);
      if (foundCompany) {
        setCompany(foundCompany);
      }
    } catch (err) {
      console.error('Error deleting admin:', err);
      alert('Fout bij verwijderen van admin.');
      setIsDeleteAdminModalOpen(false);
      setSelectedAdmin(null);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-t-[#23BD92] border-r-[#23BD92] border-b-transparent border-l-transparent" />
            <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent border-r-transparent border-b-[#D6F5EB] border-l-[#D6F5EB] opacity-20" />
          </div>
          <div className="font-montserrat text-[#23BD92] text-lg font-semibold animate-pulse">
            Bedrijf laden...
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px]">
        <div className="font-montserrat text-red-600">Bedrijf niet gevonden.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full px-[25px] md:px-[97px] py-[22px] md:py-[143px] overflow-scroll scrollbar-hide bg-gradient-to-br from-gray-50 to-white">
      {/* Header with back button */}
      <div className="flex flex-col mb-8 gap-3">
        <div className="flex flex-row items-center gap-3 group">
          <div 
            onClick={() => router.push('/compagnies/detail')} 
            className="relative w-10 h-10 md:w-11 md:h-11 cursor-pointer flex items-center justify-center transition-all duration-500 active:scale-95 group"
          >
            {/* Modern curved redirect arrow - flexible and realistic, pointing left */}
            <svg 
              className="w-7 h-7 md:w-8 md:h-8 text-[#23BD92] relative z-10 transition-all duration-500 group-hover:text-[#1ea87c] group-hover:-translate-x-1 scale-x-[-1]" 
              fill="currentColor" 
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M14,7.985,5.99756,11.99756,8,8,5.99756,3.98743ZM3.99512,2.99747,2,2,5,8,2,14l2.00244-1.00507L6.5,8Z"
                className="transition-all duration-500 ease-out"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[28px] md:text-[32px] font-bold font-montserrat bg-gradient-to-r from-[#23BD92] to-[#1ea87c] bg-clip-text text-transparent">
              DAVI Super Duper Dashboard
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg md:text-xl font-semibold font-montserrat text-gray-800">
                {company.name}
              </span>
              <div className="w-2 h-2 rounded-full bg-[#23BD92] animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Management Section */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#F9FBFA] to-[#F0F7F4] px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row w-full items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#23BD92]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#23BD92]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold font-montserrat text-gray-900">Admin Beheer</h3>
                  <p className="text-sm text-gray-600">Beheer bedrijfsadministrators</p>
                </div>
              </div>
              <AddButton onClick={() => setIsAddAdminModalOpen(true)} text="Toevoegen" />
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-4">
              <SearchBox 
                placeholderText="Zoek Admin..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Admins Table */}
            {filteredAdmins.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-montserrat text-base">Geen admins gevonden</p>
                <p className="text-gray-400 font-montserrat text-sm mt-1">Voeg een admin toe om te beginnen</p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr className="h-[56px] border-b-2 border-gray-200">
                      <SortableHeader 
                        sortKey="name" 
                        onSort={requestSort} 
                        currentSort={sortConfig}
                        className="px-6 py-3"
                      >
                        Admin
                      </SortableHeader>
                      <SortableHeader 
                        sortKey="adminsCount" 
                        onSort={requestSort} 
                        currentSort={sortConfig}
                        className="px-6 py-3"
                      >
                        Admins
                      </SortableHeader>
                      <SortableHeader 
                        sortKey="teamMembersCount" 
                        onSort={requestSort} 
                        currentSort={sortConfig}
                        className="px-6 py-3"
                      >
                        Teaml.
                      </SortableHeader>
                      <SortableHeader 
                        sortKey="usersCount" 
                        onSort={requestSort} 
                        currentSort={sortConfig}
                        className="px-6 py-3"
                      >
                        Gebr.
                      </SortableHeader>
                      <SortableHeader 
                        sortKey="rolesCount" 
                        onSort={requestSort} 
                        currentSort={sortConfig}
                        className="px-6 py-3"
                      >
                        Rollen
                      </SortableHeader>
                      <SortableHeader 
                        sortKey="documentsCount" 
                        onSort={requestSort} 
                        currentSort={sortConfig}
                        className="px-6 py-3"
                      >
                        Documenten
                      </SortableHeader>
                      <th className="w-20 px-6 py-3 font-montserrat font-bold text-[16px] text-gray-900 text-center">
                        
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredAdmins.map((admin, index) => (
                      <tr
                        key={admin.id || index}
                        className="h-[60px] hover:bg-gradient-to-r hover:from-[#F0FDF4] hover:to-white transition-all duration-200 group cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 min-w-[40px] min-h-[40px] aspect-square shrink-0">
                              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#23BD92] to-[#1ea87c] flex items-center justify-center text-white font-bold text-sm shadow-lg"></div>
                              <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-[#23BD92]/80 to-[#1ea87c]/80 flex items-center justify-center text-white font-bold text-sm"></div>
                              <div className="absolute inset-0 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                                {admin.name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <span className="font-montserrat text-[16px] font-semibold text-gray-900">
                              {admin.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-montserrat text-[15px] text-gray-700 font-medium">
                            {admin.adminsCount}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-montserrat text-[15px] text-gray-700 font-medium">
                            {admin.teamMembersCount}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-montserrat text-[15px] text-gray-700 font-medium">
                            {admin.usersCount}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-montserrat text-[15px] text-gray-700 font-medium">
                            {admin.rolesCount}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-montserrat text-[15px] text-gray-700 font-medium">
                            {admin.documentsCount}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const adminData = company?.admins?.find(a => (a.id || a.user_id) === admin.id);
                                setSelectedAdmin(adminData || admin);
                                setIsEditAdminModalOpen(true);
                              }}
                              className="p-2 rounded-lg hover:bg-[#23BD92]/10 transition-all duration-200 hover:scale-110"
                              title="Bewerken"
                            >
                              <EditIcon />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const adminData = company?.admins?.find(a => (a.id || a.user_id) === admin.id);
                                setSelectedAdmin(adminData || admin);
                                setIsDeleteAdminModalOpen(true);
                              }}
                              className="p-2 rounded-lg hover:bg-red-50 transition-all duration-200 hover:scale-110"
                              title="Verwijderen"
                            >
                              <RedCancelIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resource Limits Section */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#F9FBFA] to-[#F0F7F4] px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#23BD92]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#23BD92]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold font-montserrat text-gray-900">Resource Limieten</h2>
                <p className="text-sm text-gray-600">Configureer maximale limieten voor resources</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {/* Max Users */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100/50 transition-colors duration-200 border border-transparent hover:border-gray-200">
                <label className="font-montserrat text-base font-semibold text-gray-800 sm:w-64 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#23BD92]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
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
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100/50 transition-colors duration-200 border border-transparent hover:border-gray-200">
                <label className="font-montserrat text-base font-semibold text-gray-800 sm:w-64 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#23BD92]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
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
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100/50 transition-colors duration-200 border border-transparent hover:border-gray-200">
                <label className="font-montserrat text-base font-semibold text-gray-800 sm:w-64 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#23BD92]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
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
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100/50 transition-colors duration-200 border border-transparent hover:border-gray-200">
                <label className="font-montserrat text-base font-semibold text-gray-800 sm:w-64 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#23BD92]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
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
        </div>
      </div>

      {/* Module Permissions Section */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#F9FBFA] to-[#F0F7F4] px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#23BD92]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#23BD92]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold font-montserrat text-gray-900">Module Toegang</h2>
                <p className="text-sm text-gray-600">Activeer of deactiveer modules voor dit bedrijf</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(modulePermissions).map(([moduleName, enabled]) => (
                <div 
                  key={moduleName} 
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                    enabled 
                      ? 'bg-gradient-to-r from-[#F0FDF4] to-white border-[#23BD92]/30 shadow-sm' 
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
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
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 p-6 bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100">
        <button
          onClick={handleSave}
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#23BD92] to-[#1ea87c] text-white rounded-xl font-montserrat font-bold text-base hover:shadow-lg hover:shadow-[#23BD92]/30 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Opslaan
        </button>
        <button
          onClick={() => setIsDeleteCompanyModalOpen(true)}
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-montserrat font-bold text-base hover:shadow-lg hover:shadow-red-600/30 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Bedrijf verwijderen
        </button>
      </div>

      {/* Delete Admin Modal */}
      {isDeleteAdminModalOpen && selectedAdmin && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4"
          onClick={() => setIsDeleteAdminModalOpen(false)}
        >
          <div className="animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <DeleteAdminModal
              admin={selectedAdmin}
              onConfirm={handleDeleteAdmin}
              onClose={() => {
                setIsDeleteAdminModalOpen(false);
                setSelectedAdmin(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Company Modal */}
      {isDeleteCompanyModalOpen && company && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4"
          onClick={() => setIsDeleteCompanyModalOpen(false)}
        >
          <div className="animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <DeleteCompanyModal
              company={company}
              onConfirm={handleDeleteCompany}
              onClose={() => setIsDeleteCompanyModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {isEditAdminModalOpen && selectedAdmin && company && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4"
          onClick={() => setIsEditAdminModalOpen(false)}
        >
          <div className="animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <EditAdmin
              admin={selectedAdmin}
              company={company}
              onClose={() => {
                setIsEditAdminModalOpen(false);
                setSelectedAdmin(null);
              }}
              onSave={async () => {
                // Refresh company data
                const data = await getCompanies();
                const companiesList = Array.isArray(data) ? data : data.companies || [];
                const foundCompany = companiesList.find(c => c.id === companyId);
                if (foundCompany) {
                  setCompany(foundCompany);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {isAddAdminModalOpen && company && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4"
          onClick={() => setIsAddAdminModalOpen(false)}
        >
          <div className="animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <AddAdmin
              onClose={() => setIsAddAdminModalOpen(false)}
              onCreate={async (companyId, name, email, modules = []) => {
                try {
                  await addCompanyAdmin(companyId, name, email, modules);
                  // Refresh company data
                  const data = await getCompanies();
                  const companiesList = Array.isArray(data) ? data : data.companies || [];
                  const foundCompany = companiesList.find(c => c.id === companyId);
                  if (foundCompany) {
                    setCompany(foundCompany);
                  }
                  setIsAddAdminModalOpen(false);
                } catch (error) {
                  console.error("Failed to create admin:", error);
                  alert(error.response?.data?.detail || error.message || "Fout bij aanmaken van admin");
                }
              }}
              selectedCompany={company}
              companies={[company]}
            />
          </div>
        </div>
      )}
    </div>
  );
}

