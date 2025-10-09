'use client'
import { useState, useEffect } from "react";
import DropdownMenu from "@/components/input/DropdownMenu";

export default function AddAdmin({ onClose, onCreate, selectedCompany, companies = [] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const allOptions = companies.map((c) => c.name);
  const [selected, setSelected] = useState(() => selectedCompany?.name || allOptions[0] || "");

  useEffect(() => {
    if (selectedCompany?.name) {
      setSelected(selectedCompany.name);
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (allOptions.length === 0) return;

    if (!selected) {
      setSelected(allOptions[0]);
    } else if (!allOptions.includes(selected)) {
      setSelected(selectedCompany?.name || allOptions[0]);
    }
  }, [companies, allOptions, selected, selectedCompany?.name]);

  return (
    <div className="w-full h-fit flex flex-col gap-5 xl:p-7 p-1 rounded-2xl border border-none">
      <span className="text-2xl font-bold text-[#020003]">Add Admin</span>
      <span className="text-md text-[#697A8E]">Create a company admin for the selected company and assign scope.</span>

      <div className="flex flex-col gap-3">
        <span className="text-xl font-bold text-[#020003]">Company *</span>
        <DropdownMenu value={selected} onChange={setSelected} allOptions={allOptions} />
      </div>

      <div className="w-full flex flex-col xl:flex-row justify-between gap-5 xl:gap-2">
        <div className="w-full flex flex-col gap-3">
          <span className="text-xl font-bold text-[#020003]">Admin email *</span>
          <input
            type="text"
            placeholder="person@company.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full h-10 placeholder-[#697A8E] placeholder-opacity-100 rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none"
          />
        </div>

        <div className="w-full flex flex-col gap-3">
          <span className="text-xl font-bold text-[#020003]">Full name *</span>
          <input
            type="text"
            placeholder="First Last"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full h-10 placeholder-[#697A8E] placeholder-opacity-100 rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none"
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
        <button 
          className="w-fit px-7 py-3 bg-[#0E1629] rounded-full text-white cursor-pointer"
          onClick={() => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {
              alert("You have to match email format (e.g. person@company.com)");
              return;
            }

            if (!name.trim()) {
              alert("Full name is required");
              return;
            }

            if (onCreate && selectedCompany) {
              onCreate(selectedCompany.id, name, email);
            }
            onClose();
          }}
        >
          Create Admin
        </button>

      </div>
    </div>
  );
}
