// modals/AddAdmin.jsx
'use client'
import { useState, useEffect } from "react";
import DropdownMenu from "@/components/input/DropdownMenu";

export default function AddAdmin({ onClose, selectedCompany, companies = [] }) {
  // build options from companies passed by parent
  const allOptions = companies.map((c) => c.name);

  // initialize selected with selectedCompany (if present) or first option
  const [selected, setSelected] = useState(() => selectedCompany?.name || allOptions[0] || "");

  // if parent changes selectedCompany while modal is open, update the dropdown
  useEffect(() => {
    if (selectedCompany?.name) {
      setSelected(selectedCompany.name);
    }
  }, [selectedCompany]);

  // if companies list changes (e.g., async load), ensure selected remains valid
  useEffect(() => {
    if (!selected && allOptions.length > 0) {
      setSelected(allOptions[0]);
    } else if (selected && allOptions.length > 0 && !allOptions.includes(selected)) {
      // selected was removed or invalid — prefer selectedCompany then first option
      setSelected(selectedCompany?.name || allOptions[0]);
    }
  }, [companies]); // depend on companies array reference

  return (
    <div className="w-full h-fit flex flex-col gap-5 p-7 rounded-2xl border border-none">
      <span className="text-2xl font-bold text-[#020003]">Add Admin</span>
      <span className="text-md text-[#697A8E]">Create a company admin for the selected company and assign scope.</span>

      <div className="flex flex-col gap-3">
        <span className="text-xl font-bold text-[#020003]">Company *</span>
        <DropdownMenu value={selected} onChange={setSelected} allOptions={allOptions} />
      </div>

      <div className="flex justify-between gap-1">
        <div className="flex flex-col gap-3">
          <span className="text-xl font-bold text-[#020003]">Admin email *</span>
          <input
            type="text"
            placeholder="person@company.com"
            className="w-full h-12 placeholder-[#697A8E] placeholder-opacity-100 rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-xl font-bold text-[#020003]">Full name *</span>
          <input
            type="text"
            placeholder="First Last"
            className="w-full h-12 placeholder-[#697A8E] placeholder-opacity-100 rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button
          className="w-fit px-7 py-3 border-1 border-zinc-100 bg-[#ffffff] rounded-full text-[#020003] shadow-md shadow-zinc-300/50 cursor-pointer transition-colors duration-200"
          onClick={onClose}
        >
          Cancel
        </button>
        <button className="w-fit px-7 py-3 bg-[#0E1629] rounded-full text-white cursor-pointer">
          Create Admin
        </button>
      </div>
    </div>
  );
}
