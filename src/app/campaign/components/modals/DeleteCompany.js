import { useState } from "react";

export default function DeleteCompany({ onClose, selectedCompany, onDelete }) {
  const [confirmName, setConfirmName] = useState("");
  const [ isConfirm, setIsConfirm ] = useState(true);

  const handleDelete = () => {
    // Compare confirmName with selectedCompany.name (not the whole string with ID)
    if (confirmName.trim() === selectedCompany.name.trim()) {
      setIsConfirm(true)
      onDelete(selectedCompany.id);
      onClose();
    } else {
      setIsConfirm(false)
    }
  };

  return (
    <div className="w-full h-fit flex flex-col gap-5 p-7 rounded-2xl border border-none">
      <span className="text-2xl font-bold text-[#020003]">Delete company?</span>
      <span className="text-md text-[#697A8E]">
        This permanently removes the organization, users, roles, and documents.
        <br />
        This action cannot be undone.
      </span>

      {/* Selected company display (read-only) */}
      <div className="flex flex-col gap-3">
        <span className="text-xl font-bold text-[#020003]">
          Selected company
        </span>
        <input
          type="text"
          className="w-full h-12 rounded-[8px] border border-[#D9D9D9] px-4 py-3 bg-gray-100 text-gray-700"
          value={`${selectedCompany?.name} (ID: ${selectedCompany?.id})`}
          readOnly
        />
      </div>

      {/* Confirmation input */}
      <div className="flex flex-col gap-3">
        <span className="text-xl font-bold text-[#020003]">
          Type the company name to confirm
        </span>
        {!isConfirm 
          ? <span className="ml-2 text-sm font-bold text-[#d10000]">
              Invalid company name.
            </span>
          : <></>
        }
        <input
          type="text"
          placeholder={selectedCompany.name}
          className="w-full h-12 placeholder-[#697A8E] rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none"
          value={confirmName}
          onChange={(e) => setConfirmName(e.target.value)}
        />
      </div>

      {/* Buttons */}
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
          Permanently Delete
        </button>
      </div>
    </div>
  );
}
