// CompanyAdmins.jsx
'use client'
import { useState } from "react";
import Section from "./Section";
import AddAdmin from "./modals/AddAdmin";

export default function CompanyAdmins({ admins, selectedId, onSelect, selectedCompany, companies = [] }) {
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);

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

      <div className="flex gap-3">
        <button
          className="w-fit px-7 py-3 bg-[#F1F4F9] rounded-full shadow-md shadow-zinc-300/50 cursor-pointer transition-colors duration-200"
          onClick={() => setIsAddAdminOpen(true)}
        >
          Nieuw admin
        </button>
        <button className="w-fit px-7 py-3 bg-[#0E1629] rounded-full text-white">
          Verwijderen admin
        </button>
      </div>

      {/* AddAdmin Modal */}
      {isAddAdminOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setIsAddAdminOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-[700px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* pass selectedCompany + companies here */}
            <AddAdmin
              onClose={() => setIsAddAdminOpen(false)}
              selectedCompany={selectedCompany}
              companies={companies}
            />
          </div>
        </div>
      )}
    </div>
  );
}
