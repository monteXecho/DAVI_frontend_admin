import { useState } from "react";

export default function DeleteAdmin({ onClose, selectedCompany, selectedAdminId, onDelete, onCreate }) {
  const allOptions = selectedCompany?.admins?.map(admin => admin.name) || [];
  const defaultAdmin = selectedCompany?.admins.find(admin => admin.id === selectedAdminId)?.name || allOptions[0] || "";

  const [selectedAdmin, setSelectedAdmin] = useState(defaultAdmin);
  const [reassignEmail, setReassignEmail] = useState("");
  const [reassignName, setReassignName] = useState("");

  const handleDelete = () => {
    if (!selectedAdmin) return;

    // If reassign email is provided, create new admin before deleting
    if (reassignEmail.trim()) {
      // First create the new admin, then delete the old one
      if (onCreate) {
        onCreate(selectedCompany.id, reassignName, reassignEmail);
      }
    }
    
    // Then delete the old admin
    onDelete(selectedCompany.id, selectedAdminId);
    onClose();
  };

  return (
    <div className="w-full h-fit flex flex-col gap-5 xl:p-7 p-1 rounded-2xl border border-none">
      <span className="text-2xl font-bold text-[#020003]">Remove Admin</span>
      <span className="text-md text-[#697A8E]">
        This revokes admin access immediately. You can optionally create a replacement admin.
      </span>
      
      <div className="w-full flex flex-col xl:flex-row justify-between gap-5 xl:gap-2">
        <div className="w-full flex flex-col gap-3">
          <span className="text-xl font-bold text-[#020003]">
            Company
          </span>
          <input
            type="text"
            className="w-full h-10 rounded-lg border border-[#D9D9D9] px-4 py-3 bg-gray-100 text-gray-700"
            value={`${selectedCompany?.name} (ID: ${selectedCompany?.id})`}
            readOnly
          />
        </div>
        <div className="w-full flex flex-col gap-3">
          <span className="text-xl font-bold text-[#020003]">
            Admin to Remove
          </span>
          <input
            type="text"
            className="w-full h-10 rounded-lg border border-[#D9D9D9] px-4 py-3 bg-gray-100 text-gray-700"
            value={selectedAdmin}
            readOnly
          />
        </div>
      </div>

      {/* Reassign Section */}
      <div className="flex flex-col gap-3">
        <span className="text-xl font-bold text-[#020003]">
          Create Replacement Admin (Optional)
        </span>
        <div className="w-full flex flex-col xl:flex-row justify-between gap-5 xl:gap-2">
          <div className="w-full flex flex-col gap-3">
            <span className="text-md font-semibold text-[#020003]">New Admin Email</span>
            <input
              type="email"
              placeholder="person@company.com"
              value={reassignEmail}
              onChange={(e) => setReassignEmail(e.target.value)}
              className="w-full h-10 placeholder-[#697A8E] rounded-lg border border-[#D9D9D9] px-4 py-3 focus:outline-none"
            />
          </div>
          <div className="w-full flex flex-col gap-3">
            <span className="text-md font-semibold text-[#020003]">New Admin Name</span>
            <input
              type="text"
              placeholder="First Last"
              value={reassignName}
              onChange={(e) => setReassignName(e.target.value)}
              className="w-full h-10 placeholder-[#697A8E] rounded-lg border border-[#D9D9D9] px-4 py-3 focus:outline-none"
            />
          </div>
        </div>
        <span className="text-sm text-[#697A8E]">
          Leave empty if you only want to remove the admin without creating a replacement
        </span>
      </div>

      <div className="flex gap-3 justify-end">
        <button
          className="w-fit px-7 py-3 border border-zinc-100 bg-[#ffffff] rounded-full text-[#020003] shadow-md shadow-zinc-300/50 cursor-pointer transition-colors duration-200"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="w-fit px-7 py-3 bg-[#0E1629] rounded-full text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleDelete}
          disabled={!reassignEmail && !reassignName ? false : !reassignEmail || !reassignName}
        >
          {reassignEmail ? "Remove & Create New Admin" : "Remove Admin"}
        </button>
      </div>
    </div>
  );
}