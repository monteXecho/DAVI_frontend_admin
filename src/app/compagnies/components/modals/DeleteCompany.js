'use client';
import { useState } from "react";

export default function DeleteCompany({ onClose, selectedCompany, onDelete }) {
  const [confirmName, setConfirmName] = useState("");
  const [isConfirm, setIsConfirm] = useState(true);

  const handleDelete = async () => {
    if (confirmName.trim() !== selectedCompany.name.trim()) {
      setIsConfirm(false);
      return;
    }

    try {
      setIsConfirm(true);
      if (onDelete) onDelete(selectedCompany.id); // Update parent
      onClose(); // Close modal
    } catch (err) {
      console.error("Delete company failed:", err);
    }
  };

  return (
    <div className="w-full h-fit flex flex-col gap-5 xl:p-7 p-3 rounded-2xl border-none">
      <span className="text-2xl font-bold text-[#020003]">Delete company?</span>
      <span className="text-md text-[#697A8E]">
        This permanently removes the organization, users, roles, and documents.
        <br />
        This action cannot be undone.
      </span>

      <div className="flex flex-col gap-3">
        <span className="text-xl font-bold text-[#020003]">Selected company</span>
        <input
          type="text"
          className="w-full h-10 rounded-[8px] border border-[#D9D9D9] px-4 py-3 bg-gray-100 text-gray-700"
          value={`${selectedCompany?.name} (ID: ${selectedCompany?.id})`}
          readOnly
        />
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-xl font-bold text-[#020003]">Type the company name to confirm</span>
        {!isConfirm && (
          <span className="ml-2 text-sm font-bold text-[#d10000]">
            Invalid company name.
          </span>
        )}
        <input
          type="text"
          placeholder={selectedCompany.name}
          className="w-full h-10 placeholder-[#697A8E] rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none"
          value={confirmName}
          onChange={(e) => setConfirmName(e.target.value)}
        />
      </div>

      <div className="flex gap-3 justify-end">
        <button
          className="w-fit px-7 py-3 border bg-[#ffffff] rounded-full text-[#020003] shadow-md shadow-zinc-300/50 cursor-pointer transition-colors duration-200 disabled:opacity-50"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="w-fit px-7 py-3 bg-[#0E1629] rounded-full text-white cursor-pointer disabled:opacity-50"
          onClick={handleDelete}
        >
          Permanently Delete
        </button>
      </div>
    </div>
  );
}
