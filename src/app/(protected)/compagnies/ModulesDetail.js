'use client';
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/useApi";
import SearchBox from "@/components/input/SearchBox";
import SortableHeader from "@/components/SortableHeader";
import { useSortableData } from "@/lib/useSortableData";
import EditIcon from "@/components/icons/EditIcon";

const ITEMS_PER_PAGE = 10;

// Module definitions
const MODULES = [
  { key: 'Dashboard', label: 'Dashboard', shortLabel: 'Dash' },
  { key: 'Web Crawler', label: 'Web Crawler', shortLabel: 'Web' },
  { key: 'Nextcloud', label: 'Nextcloud', shortLabel: 'Nex' },
  { key: 'Documenten chat', label: 'Chat', shortLabel: 'Chat' },
  { key: 'GGD Checks', label: 'GGD Checks', shortLabel: 'GGD' },
  { key: 'CreatieChat', label: 'CreatieChat', shortLabel: 'Creatie' },
  { key: 'WebChat', label: 'WebChat', shortLabel: 'WebChat' },
];

export default function ModulesDetail() {
  const router = useRouter();
  const { getCompanies } = useApi();
  const [companies, setCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalModulesActivated, setTotalModulesActivated] = useState(0);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const data = await getCompanies();
        const companiesList = Array.isArray(data) ? data : data.companies || [];
        setCompanies(companiesList);

        // Calculate total modules activated
        let total = 0;
        companiesList.forEach(company => {
          company.admins?.forEach(admin => {
            if (admin.modules) {
              Object.values(admin.modules).forEach(module => {
                if (module && module.enabled === true) {
                  total++;
                }
              });
            }
          });
        });
        setTotalModulesActivated(total);
      } catch (err) {
        console.error("Error fetching companies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [getCompanies]);

  // Format company data with module status
  const formatCompanyData = useCallback((company) => {
    const moduleStatus = {};
    const moduleCounts = {};

    // Initialize module counts
    MODULES.forEach(module => {
      moduleCounts[module.key] = 0;
      moduleStatus[module.key] = false;
    });

    // Count activated modules per admin
    // admin.modules is serialized as an array: [{name: "...", desc: "...", enabled: true/false}, ...]
    company.admins?.forEach(admin => {
      if (admin.modules) {
        MODULES.forEach(module => {
          let moduleData = null;
          let isEnabled = false;
          
          // Handle array format (serialized modules)
          if (Array.isArray(admin.modules)) {
            // Find module by name in the array
            moduleData = admin.modules.find(m => m && m.name === module.key);
            if (moduleData) {
              // Check enabled status - handle both boolean and string "true"
              isEnabled = moduleData.enabled === true || 
                         moduleData.enabled === "true" || 
                         String(moduleData.enabled).toLowerCase() === "true";
            }
          } else if (typeof admin.modules === 'object' && admin.modules !== null) {
            // Handle object/dictionary format (if not serialized)
            moduleData = admin.modules[module.key];
            if (moduleData) {
              // Handle both object format {enabled: true, desc: "..."} and direct boolean
              if (typeof moduleData === 'object' && moduleData !== null) {
                isEnabled = moduleData.enabled === true || 
                           moduleData.enabled === "true" ||
                           String(moduleData.enabled).toLowerCase() === "true";
              } else {
                isEnabled = moduleData === true || String(moduleData).toLowerCase() === "true";
              }
            }
          }
          
          // If module is enabled, increment count and mark company as having this module
          if (isEnabled) {
            moduleCounts[module.key]++;
            moduleStatus[module.key] = true;
          }
        });
      }
    });

    return {
      id: company.id,
      name: company.name || "—",
      moduleStatus,
      moduleCounts,
    };
  }, []);

  const formattedCompanies = useMemo(() => {
    return companies.map(formatCompanyData);
  }, [companies, formatCompanyData]);

  const { items: sortedCompanies, requestSort, sortConfig } = useSortableData(formattedCompanies);

  // Filter companies based on search query
  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return sortedCompanies;
    
    const lowerSearch = searchQuery.toLowerCase();
    return sortedCompanies.filter(company => 
      company.name.toLowerCase().includes(lowerSearch)
    );
  }, [sortedCompanies, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);

  useEffect(() => {
    // Reset to page 1 when search query changes
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
            Modules laden...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full px-[25px] md:px-[97px] py-[22px] md:py-[143px] overflow-scroll scrollbar-hide bg-gradient-to-br from-gray-50 to-white">
      {/* Header with back button */}
      <div className="flex flex-col mb-8 gap-3">
        <div className="flex flex-row items-center gap-3 group">
          <div 
            onClick={() => router.push('/compagnies')} 
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
                {totalModulesActivated} modules geactiveerd
              </span>
              <div className="w-2 h-2 rounded-full bg-[#23BD92] animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Modules Table Section */}
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
                <h3 className="text-lg font-bold font-montserrat text-gray-900">Module Toegang Overzicht</h3>
                <p className="text-sm text-gray-600">Bekijk module activatie status per bedrijf</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-4">
              <SearchBox 
                placeholderText="Zoek bedrijf..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Modules Table */}
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-gray-500 font-montserrat text-base">
                  {searchQuery ? "Geen bedrijven gevonden voor deze zoekopdracht." : "Geen bedrijven gevonden."}
                </p>
                {!searchQuery && (
                  <p className="text-gray-400 font-montserrat text-sm mt-1">Voeg een bedrijf toe om te beginnen</p>
                )}
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
                        Bedrijf
                      </SortableHeader>
                      {MODULES.map((module) => {
                        const totalCount = formattedCompanies.reduce((sum, company) => sum + (company.moduleCounts[module.key] || 0), 0);
                        return (
                          <SortableHeader 
                            key={module.key}
                            sortKey={`moduleCounts.${module.key}`}
                            onSort={requestSort} 
                            currentSort={sortConfig}
                            className="px-6 py-3"
                          >
                            {module.shortLabel} {totalCount}
                          </SortableHeader>
                        );
                      })}
                      <th className="w-20 px-6 py-3 font-montserrat font-bold text-[16px] text-gray-900 text-center">
                        
                      </th>
              </tr>
            </thead>

                    <tbody className="divide-y divide-gray-100">
                      {paginatedCompanies.map((company, index) => (
                        <tr
                          key={company.id || index}
                          className="h-[60px] hover:bg-gradient-to-r hover:from-[#F0FDF4] hover:to-white transition-all duration-200 group cursor-pointer"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 min-w-[40px] min-h-[40px] aspect-square shrink-0">
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#23BD92] to-[#1ea87c] shadow-lg transform rotate-3"></div>
                                <div className="absolute inset-0.5 rounded-lg bg-gradient-to-br from-[#23BD92] to-[#1ea87c] flex items-center justify-center text-white font-bold text-sm shadow-md"></div>
                                <div className="absolute inset-0 rounded-lg flex items-center justify-center text-white font-bold text-sm z-10">
                                  {company.name.charAt(0).toUpperCase()}
                                </div>
                              </div>
                              <span className="font-montserrat text-[16px] font-semibold text-gray-900">
                                {company.name}
                              </span>
                            </div>
                          </td>
                          {MODULES.map((module) => (
                            <td key={module.key} className="px-6 py-4">
                              <div className="flex justify-center items-center">
                                {company.moduleStatus[module.key] ? (
                                  <div className="w-8 h-8 rounded-full bg-[#23BD92]/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-[#23BD92]" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                    <span className="text-gray-300 text-lg">—</span>
                                  </div>
                                )}
                              </div>
                            </td>
                          ))}
                          <td className="px-6 py-4">
                            <div className="flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button 
                                onClick={() => {
                                  router.push(`/compagnies/edit?id=${company.id}`);
                                }}
                                className="p-2 rounded-lg hover:bg-[#23BD92]/10 transition-all duration-200 hover:scale-110"
                                title="Bewerken"
                              >
                                <EditIcon />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-start gap-2 mt-6">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-full font-montserrat font-bold text-base transition-all duration-200 hover:scale-110 active:scale-95 ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-[#23BD92] to-[#1ea87c] text-white shadow-lg shadow-[#23BD92]/30'
                          : 'border-2 border-[#23BD92] text-[#23BD92] hover:bg-[#23BD92] hover:text-white hover:shadow-md'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  {currentPage < totalPages && (
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="w-10 h-10 rounded-full border-2 border-[#23BD92] text-[#23BD92] hover:bg-[#23BD92] hover:text-white transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-md flex items-center justify-center"
                      title="Volgende pagina"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}

