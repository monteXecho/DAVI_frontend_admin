import { useState } from "react";

export default function DeleteAdmin({
  onClose,
  selectedCompany,
  selectedAdminId,
  onDelete,
  onReAssign
}) {
  const admin = selectedCompany?.admins.find(a => a.id === selectedAdminId);
  const defaultAdminName = admin?.name || "";

  const [reassignEmail, setReassignEmail] = useState("");
  const [reassignName, setReassignName] = useState("");

  const handleDelete = () => {
    const hasReassign = reassignEmail.trim() !== "";

    if (hasReassign) {
      // Only call reassign
      onReAssign(selectedCompany.id, selectedAdminId, reassignName, reassignEmail);
    } else {
      // Only delete
      onDelete(selectedCompany.id, selectedAdminId);
    }

    onClose();
  };

  return (
    <div className="w-full h-fit flex flex-col gap-5 xl:p-7 p-1 rounded-2xl border border-none">
      <span className="text-2xl font-bold text-[#020003]">Remove Admin</span>
      <span className="text-md text-[#697A8E]">
        This revokes admin access immediately. You can optionally create a replacement admin.
      </span>

      {/* Company + Admin Info */}
      <div className="w-full flex flex-col xl:flex-row justify-between gap-5 xl:gap-2">
        <div className="w-full flex flex-col gap-3">
          <span className="text-xl font-bold text-[#020003]">Company</span>
          <input
            type="text"
            className="w-full h-10 rounded-lg border border-[#D9D9D9] px-4 py-3 bg-gray-100 text-gray-700"
            value={`${selectedCompany?.name} (ID: ${selectedCompany?.id})`}
            readOnly
          />
        </div>

        <div className="w-full flex flex-col gap-3">
          <span className="text-xl font-bold text-[#020003]">Admin to Remove</span>
          <input
            type="text"
            className="w-full h-10 rounded-lg border border-[#D9D9D9] px-4 py-3 bg-gray-100 text-gray-700"
            value={defaultAdminName}
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
          Leave empty if you only want to remove the admin without creating a replacement.
        </span>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 justify-end">
        <button
          className="w-fit px-7 py-3 border border-zinc-100 bg-[#ffffff] rounded-full text-[#020003] shadow-md shadow-zinc-300/50"
          onClick={onClose}
        >
          Cancel
        </button>

        <button
          className="w-fit px-7 py-3 bg-[#0E1629] rounded-full text-white"
          onClick={handleDelete}
          disabled={
            reassignEmail.trim()
              ? !(reassignEmail && reassignName)  // if reassigning → require both fields
              : false                              // if only deleting → allow
          }
        >
          {reassignEmail.trim() ? "Remove & Create New Admin" : "Remove Admin"}
        </button>
      </div>
    </div>
  );
}
