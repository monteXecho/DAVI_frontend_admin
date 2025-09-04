'use client'
import { useState } from "react";
import Section from "./Section";
import AddAdmin from "./modals/AddAdmin";
import DeleteAdmin from "./modals/DeleteAdmin";

export default function CompanyAdmins({ admins, selectedId, onSelect, selectedCompany, companies = [] }) {
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [isDeleteAdminOpen, setIsDeleteAdminOpen] = useState(false);

  return (
    <div className="w-full h-2/3 min-h-fit flex flex-col p-5 gap-5 border-1 border-zinc-100 rounded-2xl shadow-lg shadow-zinc-300/50">
      <div className="flex flex-col gap-3">
        <span className="text-lg font-bold text-zinc-500">
          2) Kies compagnie admin
        </span>

        {admins.map((item) => (
          <Section
            key={item.email}
            Name={item.name}
            ID={item.email}
            selected={selectedId === item.email}
            onClick={() => onSelect(item.email)}
          />
        ))}
      </div>

      <div className="flex flex-col xl:flex-row gap-3">
        <button
          className="xl:w-fit w-full px-7 py-3 bg-[#F1F4F9] rounded-full shadow-md shadow-zinc-300/50 cursor-pointer transition-colors duration-200"
          onClick={() => setIsAddAdminOpen(true)}
        >
          Nieuw admin
        </button>
        <button 
          className="xl:w-fit w-full px-7 py-3 bg-[#0E1629] rounded-full text-white"
          onClick={() => setIsDeleteAdminOpen(true)}
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
              selectedCompany={selectedCompany}
              selectedAdminId={selectedId} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
