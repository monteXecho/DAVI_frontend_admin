import { useState } from "react";
import Section from "./Section";
import AddCompany from "./modals/AddCompany";
import DeleteCompany from "./modals/DeleteCompany";

export default function Company({ companies, selectedId, onSelect, onCreateCompany, onDeleteCompany }) {
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [isDeleteCompanyOpen, setIsDeleteCompanyOpen] = useState(false);

  const selectedCompany = companies.find((c) => c.id === selectedId);

  return (
    <div className="w-full h-2/3 min-h-fit flex flex-col justify-between p-5 gap-5 border border-zinc-100 rounded-2xl shadow-lg shadow-zinc-300/50 relative">
      <div className="flex flex-col gap-3">
        <span className="text-lg font-bold text-zinc-500">1) Kies compagnie</span>
        {companies.map((item) => (
          <Section
            key={item.id}
            Name={item.name}
            ID={item.id}
            selected={selectedId === item.id}
            onClick={() => onSelect(item.id)}
          />
        ))}
      </div>

      <div className="flex flex-col xl:flex-row gap-3 justify-end">
        <button
          className="xl:w-fit w-full px-7 py-3 bg-[#F1F4F9] rounded-full shadow-md shadow-zinc-300/50 cursor-pointer transition-colors duration-200"
          onClick={() => setIsAddCompanyOpen(true)}
        >
          Nieuw bedrijf
        </button>
        <button 
          className="xl:w-fit w-full px-7 py-3 bg-[#0E1629] rounded-full text-white"
          onClick={() => setIsDeleteCompanyOpen(true)}
        >
          Verwijderen company
        </button>
      </div>

      {isAddCompanyOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setIsAddCompanyOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-fit"
            onClick={(e) => e.stopPropagation()}
          >
            <AddCompany 
              onClose={() => setIsAddCompanyOpen(false)} 
              onCreate={(newCompanyName) => {
                if (onCreateCompany) onCreateCompany({ name: newCompanyName });
                setIsAddCompanyOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {isDeleteCompanyOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center mb-[120px] xl:mb-0 bg-black/50"
          onClick={() => setIsDeleteCompanyOpen(false)} 
        >
          <div
            className="bg-white rounded-2xl p-6 w-fit"
            onClick={(e) => e.stopPropagation()}
          >
            {console.log("Company name: ", selectedCompany?.name)}
            <DeleteCompany 
              selectedCompany={selectedCompany} 
              onClose={() => setIsDeleteCompanyOpen(false)} 
              onDelete={(id) => {
                if (onDeleteCompany) onDeleteCompany(id);
                setIsDeleteCompanyOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
