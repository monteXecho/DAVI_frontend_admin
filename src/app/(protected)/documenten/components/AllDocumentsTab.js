'use client'
import { useEffect, useState } from "react"
import Image from "next/image"

import AddButton from "@/components/buttons/AddButton"
import CheckBox from "@/components/buttons/CheckBox"
import SearchBox from "@/components/input/SearchBox"
import DropdownMenu from "@/components/input/DropdownMenu"
import RedCancelIcon from "@/components/icons/RedCancelIcon"
import DownArrow from "@/components/icons/DownArrowIcon"
import GreenFolderIcon from "@/components/icons/GreenFolderIcon"
import RollenItem from "@/assets/rollen_item.png"
import GebruikersItem from "@/assets/gebruikers_item.png"

export default function AllDocumentsTab({ documents = {}, onUploadTab, onShowUsers, onShowRoles }) {
  const [allOptions1, setAllOptions1] = useState([])
  const [selectedRole, setSelectedRole] = useState("")
  const allOptions2 = ["Bulkacties", "Verwijderen", "Downloaden"]
  const [selected2, setSelected2] = useState(allOptions2[0])

  useEffect(() => {
    const roles = Object.keys(documents || {})
    setAllOptions1(roles)
    if (roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0])
    }
  }, [documents])

  const getDocumentsForRole = (role) => {
    // Ensure documents and role-specific data exist before proceeding
    if (!documents || !documents[role]) return []
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

  const filteredDocuments = getDocumentsForRole(selectedRole)

  return (
    <div className="flex flex-col w-full">
      <div className="flex w-full bg-[#F9FBFA] gap-4 py-[10px] px-2">
        <div className="w-3/10">
          <DropdownMenu
            value={selectedRole}
            onChange={setSelectedRole}
            allOptions={allOptions1}
          />
        </div>
      </div>

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
        <AddButton onClick={() => onUploadTab()} text="Toevoegen" />
      </div>

      {/* Check if there are no documents or if documents for the selected role are empty */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          Er zijn geen documenten beschikbaar voor deze rol.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-[#F9FBFA]">
              <tr className="h-[51px] border-b border-[#C5BEBE]">
                <th className="px-4 py-2 font-montserrat font-bold text-[16px] text-black">
                  <div className="flex items-center gap-3">
                    <CheckBox toggle={false} color="#23BD92" />
                    <span>Map</span>
                    <DownArrow />
                  </div>
                </th>
                <th className="px-4 py-2 font-montserrat font-bold text-[16px] text-black">
                  <div className="flex items-center gap-3">
                    Bestand
                    <DownArrow />
                  </div>
                </th>
                <th className="w-[52px] px-4 py-2"></th>
              </tr>
            </thead>

            <tbody>
              {filteredDocuments.map((doc, i) => (
                <tr
                  key={i}
                  className="w-full items-center h-[51px] border-b border-[#C5BEBE] hover:bg-[#F9FBFA] transition-colors"
                >
                  <td className="px-4 py-2 font-montserrat text-[16px] text-black font-normal">
                    <div className="flex items-center gap-3">
                      <CheckBox toggle={false} color="#23BD92" />
                      {doc.folder}
                    </div>
                  </td>
                  <td className="px-4 py-2 font-montserrat text-[16px] text-black font-normal">
                    {doc.file}
                  </td>
                  <td className="px-4 py-2 h-full">
                    <div className="flex h-full items-center gap-3">
                      <div
                        className="relative w-[19px] h-[20px] cursor-pointer"
                        onClick={() => onShowUsers(doc.assigned_to, doc.file)}
                      >
                        <Image src={GebruikersItem} alt="GebruikersItem" />
                        <div className="absolute inset-0 bg-[#23BD92] mix-blend-overlay hover:scale-110 transition"></div>
                      </div>

                      <div
                        className="relative w-[25px] h-[27px] cursor-pointer"
                        onClick={() => onShowRoles(doc.file)}
                      >
                        <Image src={RollenItem} alt="RollenItem" />
                        <div className="absolute inset-0 bg-[#23BD92] mix-blend-overlay"></div>
                      </div>

                      <GreenFolderIcon />
                      <RedCancelIcon />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
