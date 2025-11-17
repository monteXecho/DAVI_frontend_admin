"use client";
import React from "react";

export default function AddRoleModal({ 
  isOpen, 
  onClose, 
  allRoles = [], 
  selectedUsersCount = 0,
  onConfirm 
}) {
  const [selectedRole, setSelectedRole] = React.useState("");

  React.useEffect(() => {
    if (!isOpen) setSelectedRole("");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="p-6 bg-white rounded-xl shadow-lg w-[350px]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-montserrat font-extrabold text-[18px] mb-4">
          Rol toevoegen
        </h2>

        <p className="mb-4 text-gray-600">
          Voeg een rol toe aan {selectedUsersCount} geselecteerde gebruiker
          {selectedUsersCount > 1 ? "s" : ""}.
        </p>

        <div className="mb-4">
          <label className="block font-montserrat mb-1">Kies een rol</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="">-- Selecteer rol --</option>
            {allRoles
              .filter((r) => r !== "Alle rollen" && r !== "Zonder rol")
              .map((r, i) => (
                <option key={i} value={r}>
                  {r}
                </option>
              ))}
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Annuleren
          </button>
          <button
            onClick={() => onConfirm(selectedRole)}
            disabled={!selectedRole}
            className="px-4 py-2 bg-[#23BD92] text-white rounded hover:opacity-90 disabled:opacity-50"
          >
            Toevoegen
          </button>
        </div>
      </div>
    </div>
  );
}
