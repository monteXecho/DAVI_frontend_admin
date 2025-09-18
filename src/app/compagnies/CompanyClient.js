'use client';
import { useState, useEffect, useCallback } from "react";
import { useApi } from "@/lib/useApi";
import Company from "./components/Company";
import CompanyAdmins from "./components/CompanyAdmins";
import AssignModules from "./components/AssignModules";

export default function CompanyClient() {
  const { getCompanies, createCompany, deleteCompany, addCompanyAdmin, deleteCompanyAdmin, assignModules, error } = useApi();
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [selectedAdminId, setSelectedAdminId] = useState(null);

const fetchCompanies = useCallback(async () => {
  try {
    const data = await getCompanies();
    const list = Array.isArray(data) ? data : data.companies || [];

    setCompanies(list);

    // Keep selected company if still exists, otherwise fallback
    if (list.length > 0) {
      const stillExists = list.some(c => c.id === selectedCompanyId);
      setSelectedCompanyId(stillExists ? selectedCompanyId : list[0].id);
    } else {
      setSelectedCompanyId(null);
      setSelectedAdminId(null);
    }

    // Keep selected admin if still exists, otherwise fallback
    if (selectedCompanyId) {
      const company = list.find(c => c.id === selectedCompanyId);
      if (company) {
        const stillExistsAdmin = company.admins.some(a => a.id === selectedAdminId);
        if (!stillExistsAdmin) {
          setSelectedAdminId(company.admins[0]?.id || null);
        }
      }
    }
  } catch (err) {
    console.error("Error fetching companies:", err);
  }
}, [getCompanies, selectedCompanyId, selectedAdminId]);


  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);


  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);
  const selectedAdmin = selectedCompany?.admins.find((a) => a.id === selectedAdminId);

  // useEffect(() => {
  //   if (selectedCompany && selectedCompany.admins.length > 0) {
  //     setSelectedAdminId(selectedCompany.admins[0].id);
  //   } else {
  //     setSelectedAdminId(null);
  //   }
  // }, [selectedCompanyId, companies]);

  if (error) {
    return <div className="p-5 text-red-600">Failed to load companies.</div>;
  }

  const handleDeleteCompany = async (companyId) => {
    // const originalCompanies = [...companies];
    // setCompanies(prev => prev.filter(c => c.id !== companyId));

    try {
      await deleteCompany(companyId);
      await fetchCompanies();
    } catch (err) {
      console.error("Delete failed, restoring list:", err);
      // setCompanies(originalCompanies);
    }
  };

  const handleCreateCompany = async (companyName) => {
    try {
      await createCompany(companyName);
      await fetchCompanies();
    } catch (err) {
      console.error("Create failed, restoring list:", err);
      // setCompanies(originalCompanies);
    }
  }

  const handleAddCompanyAdmin = async (companyId, name, email) => {
    try {
      await addCompanyAdmin(companyId, name, email, []);
      await fetchCompanies();
    } catch (err) {
      console.error("Add failed, restoring list:", err);
      // setCompanies(originalCompanies);
    }    
  }

  const handleDeleteCompanyAdmin = async (companyId, adminId) => {
    try {
      await deleteCompanyAdmin(companyId, adminId);
      await fetchCompanies();
    } catch (err) {
      console.error("Delete failed, restoring list:", err);
      // setCompanies(originalCompanies);
    }    
  }  

  const handleAssignModules = async (companyId, adminId, modules) => {
    try {
      await assignModules(companyId, adminId, {modules});
      await fetchCompanies();
      window.alert("Success!")
    } catch (err) {
      console.error("Delete failed, restoring list:", err);
      // setCompanies(originalCompanies);
    }    
  }  

  return (
    <div className="w-full h-full flex flex-col xl:flex-row p-5 xl:p-10 gap-8 overflow-scroll scrollbar-hide">
      <div className="w-full xl:w-1/3 h-fit xl:h-full">
        <Company
          companies={companies}
          selectedId={selectedCompanyId}
          onSelect={setSelectedCompanyId}
          onCreateCompany={handleCreateCompany}
          onDeleteCompany={handleDeleteCompany}
        />
      </div>

      <div className="w-full xl:w-1/3 h-fit xl:h-full">
        <CompanyAdmins
          admins={selectedCompany?.admins || []}
          selectedId={selectedAdminId}
          onSelect={setSelectedAdminId}
          onCreateCompanyAdmin={handleAddCompanyAdmin}
          onDeleteCompanyAdmin={handleDeleteCompanyAdmin}
          selectedCompany={selectedCompany}
          companies={companies}
        />
      </div>

      <div className="w-full xl:w-1/3 h-fit xl:h-full">
        <AssignModules 
          modules={selectedAdmin?.modules || []} 
          onAssign={(modules) => handleAssignModules(selectedCompanyId, selectedAdminId, modules)}
        /> 
      </div>
    </div>
  );
}
