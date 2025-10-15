"use client";
import AddButton from "@/components/buttons/AddButton";
import CheckBox from "@/components/buttons/CheckBox";
import SearchBox from "@/components/input/SearchBox";
import EditIcon from "@/components/icons/EditIcon";
import ResetPassIcon from "@/components/icons/ResetPassIcon";
import RedCancelIcon from "@/components/icons/RedCancelIcon";
import DownArrow from "@/components/icons/DownArrowIcon";
import DropdownMenu from "@/components/input/DropdownMenu";
import DeleteUserModal from "./modals/DeleteUserModal";

import { useState, useMemo } from "react";

export default function GebruikersTab({ users = [], onEditUser, onDeleteUser }) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [selected1, setSelected1] = useState("Bulkacties");
  const [selected2, setSelected2] = useState("Filter op rol");
  const [searchQuery, setSearchQuery] = useState("");

  // 🔍 Filter users by role and search text
  const filteredData = useMemo(() => {
    let data = users;

    if (searchQuery.trim()) {
      data = data.filter(
        (user) =>
          user.Naam.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.Email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return data;
  }, [users, selected2, searchQuery]);

  const titleText =
    selected2 === "Filter op Beheerder"
      ? `${filteredData.length} gebruiker${filteredData.length !== 1 ? "s" : ""} met de rol “Beheerder”`
      : `${filteredData.length} gebruikers`;

  const allOptions1 = ["Bulkacties", "Option 1", "Option 2"];
  const allOptions2 = ["Filter op rol"];

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="mb-[29px] font-montserrat font-extrabold text-[18px] leading-[100%]">
        {titleText}
      </div>

      {/* Action Buttons */}
      <div className="flex h-[60px] bg-[#F9FBFA] items-center justify-between px-2">
        <button className="w-[127px] h-[40px] border-[2px] border-[#23BD92] rounded-[8px] font-bold text-[16px] leading-[100%] text-[#23BD92]">
          Bulk import
        </button>
        <AddButton onClick={() => {}} text="Toevoegen" />
      </div>

      {/* Filters */}
      <div className="flex h-[60px] bg-[#F9FBFA] items-center justify-between px-2">
        <div className="w-32/99">
          <DropdownMenu value={selected1} onChange={setSelected1} allOptions={allOptions1} />
        </div>

        <div className="w-32/99">
          <DropdownMenu value={selected2} onChange={setSelected2} allOptions={allOptions2} />
        </div>

        <div className="w-32/99">
          <SearchBox
            placeholderText="Zoek gebruiker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <table className="w-full border-separate border-spacing-0">
        <thead className="bg-[#F9FBFA]">
          <tr className="h-[51px] border-b border-[#C5BEBE] flex items-center gap-[40px] px-2">
            <th className="flex items-center gap-5 w-3/8 font-montserrat font-bold text-[16px] leading-6 text-black">
              <CheckBox toggle={false} color="#23BD92" />
              <span>Naam</span>
              <DownArrow />
            </th>
            <th className="flex items-center gap-5 w-3/8 font-montserrat font-bold text-[16px] leading-6 text-black">
              E-mail
              <DownArrow />
            </th>
            <th className="flex items-center gap-5 w-1/8 font-montserrat font-bold text-[16px] leading-6 text-black">
              Rol
              <DownArrow />
            </th>
            <th className="w-1/8 px-4 py-2"></th>
          </tr>
        </thead>

        <tbody>
          {filteredData.map((user) => (
            <tr
              key={user.id}
              className="h-fit min-h-[51px] border-b border-[#C5BEBE] flex items-center gap-[40px] px-2 py-1"
            >
              <td className="flex gap-5 w-3/8 items-center font-montserrat font-normal text-[16px] leading-6 text-black">
                <CheckBox toggle={false} color="#23BD92" />
                {user.Naam}
              </td>
              <td className="w-3/8 font-montserrat font-normal text-[16px] leading-6 text-black">
                {user.Email}
              </td>
              <td className="w-1/8 font-montserrat font-normal text-[16px] leading-6 text-black">
                  {user.Rol.map((r, i) => (
                    <div key={i}>{r}</div>
                  ))}
              </td>
              <td className="w-1/8 flex justify-end items-center gap-3">
                <button onClick={() => onEditUser && onEditUser(user)}>
                  <EditIcon />
                </button>
                <ResetPassIcon />
                <button onClick={() => handleDeleteClick(user)}>
                  <RedCancelIcon />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isDeleteModalOpen && selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center mb-[120px] xl:mb-0 bg-black/50"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div className="p-6 w-fit" onClick={(e) => e.stopPropagation()}>
            <DeleteUserModal
              name={selectedUser.Naam}
              email={selectedUser.Email}
              onClose={() => setIsDeleteModalOpen(false)}
              onConfirm={async () => {
                try {
                  if (onDeleteUser) await onDeleteUser(selectedUser.id);
                } catch (err) {
                  console.error("Failed to delete user:", err);
                  alert("Failed to delete user. Please try again.");
                } finally {
                  setIsDeleteModalOpen(false);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
