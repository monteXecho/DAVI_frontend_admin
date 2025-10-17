'use client'

import { useEffect, useState } from "react"
import AddButton from "@/components/buttons/AddButton"
import CheckBox from "@/components/buttons/CheckBox"
import SearchBox from "@/components/input/SearchBox"
import DropdownMenu from "@/components/input/DropdownMenu"
import EditIcon from "@/components/icons/EditIcon"
import RedCancelIcon from "@/components/icons/RedCancelIcon"
import DownArrow from "@/components/icons/DownArrowIcon"

export default function AllDocumentsTab({ documents = {} }) {
  const [allOptions1, setAllOptions1] = useState([])
  const [selectedRole, setSelectedRole] = useState("")
  const allOptions2 = ["Bulkacties", "Verwijderen", "Downloaden"]
  const [selected2, setSelected2] = useState(allOptions2[0])

  // --- Initialize roles when documents change ---
  useEffect(() => {
    const roles = Object.keys(documents || {})
    setAllOptions1(roles)
    if (roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0]) // Auto-select first role
    }
  }, [documents])

  // --- Helper: flatten folders/docs for selected role ---
  const getDocumentsForRole = (role) => {
    if (!documents[role]) return []
    return documents[role].folders.flatMap(folder =>
      folder.documents.map(doc => ({
        folder: folder.name,
        file: doc.file_name,
        path: doc.path,
        uploaded_at: doc.uploaded_at,
        assigned_to: doc.assigned_to,
      }))
    )
  }

  const filteredDocuments = selectedRole ? getDocumentsForRole(selectedRole) : []

  return (
    <div className="flex flex-col w-full">
      {/* Role Filter */}
      <div className="flex w-full bg-[#F9FBFA] gap-4 py-[10px] px-2">
        <div className="w-3/10">
          {allOptions1.length > 0 ? (
            <DropdownMenu
              value={selectedRole}
              onChange={setSelectedRole}
              allOptions={allOptions1}
            />
          ) : (
            <div className="text-gray-500 text-sm">Geen rollen beschikbaar</div>
          )}
        </div>
      </div>

      {/* Bulk Actions + Search */}
      <div className="flex w-full h-fit bg-[#F9FBFA] items-center justify-between px-2 py-[6px]">
        <div className="flex w-2/3 gap-4 items-center">
          <div className="w-4/9">
            <DropdownMenu
              value={selected2}
              onChange={setSelected2}
              allOptions={allOptions2}
            />
          </div>
          <div className="w-4/9">
            <SearchBox placeholderText="Zoek document..." />
          </div>
        </div>
        <AddButton onClick={() => {}} text="Toevoegen" />
      </div>

      {/* Table */}
      <table className="w-full border-separate border-spacing-0 border border-transparent">
        <thead className="bg-[#F9FBFA]">
          <tr className="h-[51px] border-b border-[#C5BEBE] flex items-center gap-[40px] w-full px-2">
            <th className="flex items-center gap-5 w-3/9 font-montserrat font-bold text-[16px] leading-6 text-black">
              <CheckBox toggle={false} color="#23BD92" />
              <span>Map</span>
              <DownArrow />
            </th>
            <th className="flex items-center gap-5 w-6/9 font-montserrat font-bold text-[16px] leading-6 text-black">
              Bestand
              <DownArrow />
            </th>
            <th className="w-[52px] px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {filteredDocuments.length === 0 ? (
            <tr className="flex items-center justify-center h-[80px] w-full text-gray-500">
              <td colSpan="3" className="text-center w-full">
                {!selectedRole
                  ? "Selecteer een rol om documenten te bekijken"
                  : "Geen documenten gevonden"}
              </td>
            </tr>
          ) : (
            filteredDocuments.map((doc, i) => (
              <tr
                key={i}
                className="h-[51px] border-b border-[#C5BEBE] flex items-center gap-[40px]"
              >
                <td className="flex gap-5 w-3/9 items-center font-montserrat font-normal text-[16px] leading-6 text-black px-2 py-2">
                  <CheckBox toggle={false} color="#23BD92" />
                  {doc.folder}
                </td>
                <td className="w-6/9 font-montserrat font-normal text-[16px] leading-6 text-black px-4 py-2">
                  <a
                    href={doc.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0077CC] hover:underline"
                  >
                    {doc.file}
                  </a>
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
