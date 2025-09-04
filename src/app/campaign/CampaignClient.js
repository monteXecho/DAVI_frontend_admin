'use client'
import { useState, useEffect } from "react";
import data from "@/data/data";
import Company from "./components/Company";
import CompanyAdmins from "./components/CompanyAdmins";
import AssignModules from "./components/AssignModules";

export default function CampaignClient() {
  const [selectedCompanyId, setSelectedCompanyId] = useState(
    data.companies.length > 0 ? data.companies[0].id : null
  );
  const [selectedAdminId, setSelectedAdminId] = useState(null);

  const selectedCompany = data.companies.find((c) => c.id === selectedCompanyId);

  // Set first admin as default when company changes
  useEffect(() => {
    if (selectedCompany && selectedCompany.admins.length > 0) {
      setSelectedAdminId(selectedCompany.admins[0].email);
    } else {
      setSelectedAdminId(null);
    }
  }, [selectedCompanyId]);

  return (
    <div className="w-full h-full flex flex-col xl:flex-row p-5 xl:p-10 gap-8">
      {/* Company */}
      <div className="w-full xl:w-1/3 h-fit xl:h-full">
        <Company
          companies={data.companies}
          selectedId={selectedCompanyId}
          onSelect={(id) => {
            setSelectedCompanyId(id);
          }}
        />
      </div>

      {/* Admins */}
      <div className="w-full xl:w-1/3 h-fit xl:h-full">
        <CompanyAdmins
          admins={selectedCompany?.admins || []}
          selectedId={selectedAdminId}s
          onSelect={setSelectedAdminId}
          selectedCompany={selectedCompany}    
          companies={data.companies}            
        />
      </div>

      {/* Modules */}
      <div className="w-full xl:w-1/3 h-fit xl:h-full">
        <AssignModules modules={selectedCompany?.modules || []} />
      </div>
    </div>
  );
}
