import { useState } from "react";
import DropdownMenu from "@/components/input/DropdownMenu";

export default function DeleteAdmin({ onClose, selectedCompany, selectedAdminId, onDelete }) {
  const allOptions = selectedCompany?.admins?.map(admin => admin.name || [])
  const defaultAdmin = selectedCompany?.admins.find(admin => admin.email === selectedAdminId)?.name || allOptions[0] || "";
  const [selectedAdmin, setSelectedAdmin] = useState(defaultAdmin);

  const handleDelete = () => {
    if (!selectedAdmin) return;

    onDelete(selectedCompany.id, selectedAdmin);
    onClose();
  };

  return (
    <div className="w-full h-fit flex flex-col gap-5 xl:p-7 p-1 rounded-2xl border border-none">
      <span className="text-2xl font-bold text-[#020003]">Remove company?</span>
      <span className="text-md text-[#697A8E]">
        This revokes admin access immediately If they own resources, reassign them first.
      </span>
      <div className="w-full flex flex-col xl:flex-row justify-between gap-5 xl:gap-2">
        <div className="w-full flex flex-col gap-3">
          <span className="text-xl font-bold text-[#020003]">
            Company
          </span>
          <input
            type="text"
            className="w-full h-10 rounded-[8px] border border-[#D9D9D9] px-4 py-3 bg-gray-100 text-gray-700"
            value={`${selectedCompany?.name} (ID: ${selectedCompany?.id})`}
            readOnly
          />
        </div>
        <div className="w-full flex flex-col gap-3">
          <span className="text-xl font-bold text-[#020003]">
            Admin
          </span>
          <DropdownMenu value={selectedAdmin} onChange={setSelectedAdmin} allOptions={allOptions} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-xl font-bold text-[#020003]">
          Reassign to
        </span>
        <input
          type="text"
          placeholder='Optional - choose a replacement'
          className="w-full h-10 placeholder-[#697A8E] rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none"
          onChange={(e) => e.target.value}
        />
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
          onClick={handleDelete}
        >
          Remove Admin
        </button>
      </div>
    </div>
  );
}
