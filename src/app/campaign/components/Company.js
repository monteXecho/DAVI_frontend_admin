import { useState } from "react";
import Section from "./Section";
import AddCompany from "./modals/AddCompany";
import DeleteCompany from "./modals/DeleteCompany";

export default function Company({ companies, selectedId, onSelect }) {
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [isDeleteCompanyOpen, setIsDeleteCompanyOpen] = useState(false);
  const selectedCompany = companies.find((c) => c.id === selectedId);

  return (
    <div className="w-full h-2/3 min-h-fit flex flex-col p-5 gap-5 border-1 border-zinc-100 rounded-2xl shadow-lg shadow-zinc-300/50 relative">
      {/* Company List */}
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

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          className="w-fit px-7 py-3 bg-[#F1F4F9] rounded-full shadow-md shadow-zinc-300/50 cursor-pointer transition-colors duration-200"
          onClick={() => setIsAddCompanyOpen(true)}
        >
          Nieuw bedrijf
        </button>
        <button 
          className="w-fit px-7 py-3 bg-[#0E1629] rounded-full text-white"
          onClick={() => setIsDeleteCompanyOpen(true)}
        >
          Verwijderen company
        </button>
      </div>

      {/* AddCompany Modal */}
      {isAddCompanyOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setIsAddCompanyOpen(false)} // click on overlay closes modal
        >
          <div
            className="bg-white rounded-2xl p-6 w-fit"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
          >
            <AddCompany onClose={() => setIsAddCompanyOpen(false)} />
          </div>
        </div>
      )}

      {/* AddCompany Modal */}
      {isDeleteCompanyOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setIsDeleteCompanyOpen(false)} // click on overlay closes modal
        >
          <div
            className="bg-white rounded-2xl p-6 w-fit"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
          >
            {console.log("Company name: ", selectedCompany?.name)}
            <DeleteCompany 
              selectedCompany={selectedCompany} 
              onClose={() => setIsDeleteCompanyOpen(false)} 
              onDelete={(id) => {
                // remove from companies list (you can manage this in parent state)
                console.log("Deleting company with ID:", id);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
