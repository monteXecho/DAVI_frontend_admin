'use client'
import AddButton from "@/components/buttons/AddButton"
import CheckBox from "@/components/buttons/CheckBox"
import DownArrow from "@/components/icons/DownArrowIcon"
import DropdownMenu from "@/components/input/DropdownMenu"
import SearchBox from "@/components/input/SearchBox"
import SelectedData from "@/components/input/SelectedData"
import EditIcon from "@/components/icons/EditIcon"
import RedCancelIcon from "@/components/icons/RedCancelIcon"
import { useState, useEffect } from "react"

export default function UsersTab({ selectedUsers = [], selectedDocName }) {
  const [users, setUsers] = useState(selectedUsers)
  const [selected, setSelected] = useState("Bulkacties")
  const allOptions = ["Bulkacties", "Option 01", "Option 02"]

  useEffect(() => {
    setUsers(selectedUsers)
  }, [selectedUsers])

  return (
    <div className="flex flex-col w-full">
      <div className="flex w-full bg-[#F9FBFA] gap-4 py-[10px] px-2">
        <div className="w-9/10">
          <SelectedData SelectedData={selectedDocName || "Geen document geselecteerd"} />
        </div>
      </div>

      <div className="flex w-full h-fit bg-[#F9FBFA] items-center justify-between px-2 py-[6px]">
        <div className="flex w-2/3 gap-4 items-center">
          <div className="w-4/9">
            <DropdownMenu value={selected} onChange={setSelected} allOptions={allOptions} />
          </div>
          <div className="w-4/9">
            <SearchBox placeholderText="Zoek gebruiker..." />
          </div>
        </div>
        <AddButton onClick={() => {}} text="Toevoegen" />
      </div>

      <table className="w-full border-separate border-spacing-0 border border-transparent">
        <thead className="bg-[#F9FBFA]">
          <tr className="h-[51px] border-b border-[#C5BEBE] flex items-center gap-[40px] w-full px-2">
            <th className="flex items-center gap-5 w-3/9 font-montserrat font-bold text-[16px] text-black">
              <CheckBox toggle={false} color="#23BD92" />
              <span>Naam</span>
              <DownArrow />
            </th>
            <th className="flex items-center gap-5 w-6/9 font-montserrat font-bold text-[16px] text-black">
              E-mail
              <DownArrow />
            </th>
            <th className="w-[52px] px-4 py-2"></th>
          </tr>
        </thead>

        <tbody>
          {users.length === 0 ? (
            <tr className="flex items-center justify-center h-[80px] w-full text-gray-500">
              <td colSpan="3" className="text-center w-full">
                Geen gebruikers toegewezen
              </td>
            </tr>
          ) : (
            users.map((u, i) => (
              <tr key={i} className="h-[51px] border-b border-[#C5BEBE] flex items-center gap-[40px]">
                <td className="flex gap-5 w-3/9 items-center font-montserrat text-[16px] px-2 py-2">
                  <CheckBox toggle={false} color="#23BD92" />
                  {u.name}
                </td>
                <td className="w-6/9 font-montserrat text-[16px] px-4 py-2">
                  {u.email}
                </td>
                <td className="w-fit flex justify-end items-center gap-3 px-4 py-2">
                  <EditIcon />
                  <RedCancelIcon />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
