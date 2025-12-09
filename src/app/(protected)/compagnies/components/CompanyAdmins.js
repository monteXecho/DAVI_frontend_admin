'use client'
import { useState } from "react";
import Section from "./Section";
import AddAdmin from "./modals/AddAdmin";
import DeleteAdmin from "./modals/DeleteAdmin";

export default function CompanyAdmins({ admins, selectedId, onSelect, onCreateCompanyAdmin, onReAssignCompanyAdmin, onDeleteCompanyAdmin, selectedCompany, companies = [] }) {
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [isDeleteAdminOpen, setIsDeleteAdminOpen] = useState(false);

  console.log('____ Selected admin ____', selectedId)

  return (
    <div className="w-full h-2/3 min-h-fit flex flex-col justify-between p-5 gap-5 border border-zinc-100 rounded-2xl shadow-lg shadow-zinc-300/50">
      <div className="flex flex-col gap-3">
        <span className="text-lg font-bold text-zinc-500">
          2) Kies compagnie admin
        </span>

        {admins.map((item) => {
          // Safely convert to strings - handle objects, null, undefined
          const name = item.name != null && typeof item.name === 'object' 
            ? (item.name.email || item.name.name || item.name.toString?.() || '') 
            : (item.name || '');
          const email = item.email != null && typeof item.email === 'object'
            ? (item.email.email || item.email.name || item.email.toString?.() || '')
            : (item.email || '');
          
          return (
            <Section
              key={item.id}
              Name={String(name)}
              ID={String(email)}
              selected={selectedId === item.id}
              onClick={() => onSelect(item.id)}
            />
          );
        })}
      </div>

      <div className="flex flex-col justify-end xl:flex-row gap-3">
        <button
          className="xl:w-fit w-full px-7 py-3 bg-[#F1F4F9] rounded-full shadow-md shadow-zinc-300/50 cursor-pointer transition-colors duration-200"
          onClick={() => setIsAddAdminOpen(true)}
        >
          Nieuw admin
        </button>
        <button 
          className="xl:w-fit w-full px-7 py-3 bg-[#0E1629] rounded-full text-white"
          onClick={() => setIsDeleteAdminOpen(true)}
          disabled={!selectedId} 
        >
          Verwijderen admin
        </button>
      </div>

      {isAddAdminOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center mb-[120px] xl:mb-0 bg-black/50"
          onClick={() => setIsAddAdminOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-[700px]"
            onClick={(e) => e.stopPropagation()}
          >
            <AddAdmin
              onClose={() => setIsAddAdminOpen(false)}
              onCreate={(companyId, name, email) => {
                if (onCreateCompanyAdmin) onCreateCompanyAdmin( companyId, name, email );
                setIsAddAdminOpen(false);
              }}
              selectedCompany={selectedCompany}
              companies={companies}
            />
          </div>
        </div>
      )}

    {isDeleteAdminOpen && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center mb-[120px] xl:mb-0 bg-black/50"
        onClick={() => setIsDeleteAdminOpen(false)}
      >
        <div
          className="bg-white rounded-2xl p-6 w-full max-w-[700px]"
          onClick={(e) => e.stopPropagation()}
        >
          <DeleteAdmin
            onClose={() => setIsDeleteAdminOpen(false)}
            onDelete={(companyId, adminId) => {
              if (onDeleteCompanyAdmin) {
                onDeleteCompanyAdmin(companyId, adminId);
              }
              setIsDeleteAdminOpen(false);
            }}
            onReAssign={(companyId, adminId, name, email) => {
              if (onReAssignCompanyAdmin) onReAssignCompanyAdmin(companyId, adminId, name, email);
            }}
            selectedCompany={selectedCompany}
            selectedAdminId={selectedId} 
          />
        </div>
      </div>
    )}
    </div>
  );
}
