'use client'
import { useState, useMemo } from "react";
import CheckBox from "@/components/buttons/CheckBox";
import SearchBox from "@/components/input/SearchBox";
import RedCancelIcon from "@/components/icons/RedCancelIcon";
import DropdownMenu from "@/components/input/DropdownMenu";
import SelectedData from "@/components/input/SelectedData";
import DeleteDocumentFromRolesModal from "./modals/DeleteDocumentFromRolesModal";
import SortableHeader from "@/components/SortableHeader";
import { useSortableData } from "@/lib/useSortableData";

export default function AppearInRoleTab({ documents = {}, selectedDocName, onDeleteDocuments }) {
  const allOptions = ["Bulkacties", "Verwijderen"]; 
  const [selectedBulkAction, setSelectedBulkAction] = useState(allOptions[0]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRolesSet, setSelectedRolesSet] = useState(new Set());
  const [deleteMode, setDeleteMode] = useState("single");

  /** Extract roles + folders that contain this document */
  const currentRolesData = useMemo(() => {
    const roles = [];
    
    if (!documents || !selectedDocName) return roles;

    Object.entries(documents).forEach(([roleName, roleData]) => {
      if (!roleData?.folders) return;

      const matchingFolders = roleData.folders
        .filter(folder =>
          folder.documents?.some(doc => doc.file_name === selectedDocName)
        )
        .map(folder => folder.name);

      if (matchingFolders.length > 0) {
        roles.push({
          id: roleName,
          name: roleName,
          folders: matchingFolders
        });
      }
    });

    return roles;
  }, [documents, selectedDocName]);

  const { items: sortedRoles, requestSort, sortConfig } = useSortableData(currentRolesData);

  const filteredRoles = useMemo(() => {
    if (!searchQuery.trim()) return sortedRoles;
    const lower = searchQuery.toLowerCase();
    return sortedRoles.filter(role => role.name.toLowerCase().includes(lower));
  }, [sortedRoles, searchQuery]);

  const handleRoleSelect = (roleId, isSelected) => {
    setSelectedRolesSet(prev => {
      const newSet = new Set(prev);
      isSelected ? newSet.add(roleId) : newSet.delete(roleId);
      return newSet;
    });
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedRolesSet(new Set(filteredRoles.map(r => r.id)));
    } else {
      setSelectedRolesSet(new Set());
    }
  };

  const allSelected =
    filteredRoles.length > 0 &&
    filteredRoles.every(role => selectedRolesSet.has(role.id));

  const someSelected =
    filteredRoles.some(role => selectedRolesSet.has(role.id)) && !allSelected;

  const handleBulkAction = (action) => {
    setSelectedBulkAction(action);

    if (action === "Verwijderen") {
      if (selectedRolesSet.size > 0) {
        setDeleteMode("bulk");
        setIsDeleteModalOpen(true);
      } else {
        alert("Selecteer eerst rollen om het document uit te verwijderen.");
        setSelectedBulkAction("Bulkacties");
      }
    }
  };

  const findDocumentEntriesForRole = (fileName, roleName) => {
    const entries = [];
    if (!documents[roleName]) return entries;

    documents[roleName].folders?.forEach(folder => {
      const doc = folder.documents?.find(d => d.file_name === fileName);
      if (doc) {
        entries.push({
          fileName: doc.file_name,
          role: roleName,
          path: doc.path
        });
      }
    });

    return entries;
  };

  const handleDeleteConfirm = async () => {
    try {
      const documentsToDelete = [];

      selectedRolesSet.forEach(roleName => {
        documentsToDelete.push(
          ...findDocumentEntriesForRole(selectedDocName, roleName)
        );
      });

      if (documentsToDelete.length > 0) {
        await onDeleteDocuments(documentsToDelete);
        setSelectedRolesSet(new Set());
      }
    } catch (err) {
      console.error("Failed to remove document from roles:", err);
      alert("Failed to remove document from roles. Please try again.");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedBulkAction("Bulkacties");
    }
  };

  const handleDeleteClick = (role) => {
    setSelectedRolesSet(new Set([role.id]));
    setDeleteMode("single");
    setIsDeleteModalOpen(true);
  };

  const getSelectedRolesData = () => {
    return Array.from(selectedRolesSet).map(roleId => {
      const role = filteredRoles.find(r => r.id === roleId);
      return {
        role: role?.name ?? roleId,
        folders: role?.folders ?? []
      };
    });
  };


  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="mb-[29px] font-montserrat font-extrabold text-[18px]">
        {filteredRoles.length} rol{filteredRoles.length !== 1 ? "len" : ""} waar "{selectedDocName}" in voorkomt
        {selectedRolesSet.size > 0 && (
          <span className="ml-2 text-gray-600">({selectedRolesSet.size} geselecteerd)</span>
        )}
      </div>

      {/* Selected Document */}
      <div className="flex w-full bg-[#F9FBFA] gap-4 py-2.5 px-2">
        <SelectedData SelectedData={selectedDocName} />
      </div>

      {/* Action Bar */}
      <div className="flex w-full h-fit bg-[#F9FBFA] items-center justify-between px-2 py-1.5">
        <div className="flex w-2/3 gap-4 items-center">
          <DropdownMenu
            value={selectedBulkAction}
            onChange={handleBulkAction}
            allOptions={allOptions}
          />
          <SearchBox
            placeholderText="Zoek rol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Roles Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#F9FBFA]">
            <tr className="w-full h-[51px] border-b border-[#C5BEBE]">
              {/* Role Column - Fixed width */}
              <th className="w-1/3 px-4 py-2 font-montserrat font-bold text-[16px] text-black">
                <div className="flex items-center gap-3 whitespace-nowrap">
                  <CheckBox
                    toggle={allSelected}
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                    color="#23BD92"
                  />
                  Rol
                </div>
              </th>

              {/* Folders Column */}
              <SortableHeader
                sortKey="folder"
                onSort={requestSort}
                currentSort={sortConfig}
                className="w-2/5" // Give this more space
              >
                Mappen
              </SortableHeader>

              {/* Actions Column - Fixed width */}
              <th className="w-[120px] px-4 py-2 font-montserrat font-bold text-[16px] text-center">
                Acties
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredRoles.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  className="px-4 py-6 text-center text-gray-500 font-montserrat"
                >
                  {searchQuery
                    ? "Geen rollen gevonden voor deze zoekopdracht."
                    : "Geen rollen gevonden."}
                </td>
              </tr>
            ) : (
              filteredRoles.map((role) => (
                <tr
                  key={role.id}
                  className="h-[51px] border-b border-[#C5BEBE] hover:bg-[#F9FBFA]"
                >
                  {/* Role Name */}
                  <td className="w-1/3 px-4 py-2">
                    <div className="flex items-center gap-3">
                      <CheckBox
                        toggle={selectedRolesSet.has(role.id)}
                        onChange={(isSelected) =>
                          handleRoleSelect(role.id, isSelected)
                        }
                        color="#23BD92"
                      />
                      <span className="truncate">{role.name}</span>
                    </div>
                  </td>

                  {/* Folder names */}
                  <td className="w-2/5 px-4 py-2 font-montserrat text-[15px] text-gray-700">
                    <span className="line-clamp-2">
                      {role.folders?.length > 0
                        ? role.folders.join(", ")
                        : "-"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="w-[120px] px-4 py-2">
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDeleteClick(role)}
                        className="hover:opacity-80"
                      >
                        <RedCancelIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center mb-[120px] xl:mb-0 bg-black/50"
          onClick={() => {
            setIsDeleteModalOpen(false);
            setSelectedBulkAction("Bulkacties");
          }}
        >
          <div className="p-6 w-fit" onClick={(e) => e.stopPropagation()}>
            <DeleteDocumentFromRolesModal
              roles={getSelectedRolesData()}
              documentName={selectedDocName}
              onClose={() => {
                setIsDeleteModalOpen(false);
                setSelectedBulkAction("Bulkacties");
              }}
              onConfirm={handleDeleteConfirm}
              isMultiple={selectedRolesSet.size > 1}
            />
          </div>
        </div>
      )}
    </div>
  );
}
