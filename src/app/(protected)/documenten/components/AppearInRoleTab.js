'use client'
import { useState, useMemo } from "react";
import AddButton from "@/components/buttons/AddButton";
import CheckBox from "@/components/buttons/CheckBox";
import EditIcon from "@/components/icons/EditIcon";
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

  const currentRolesData = useMemo(() => {
    const roles = [];
    
    if (!documents || !selectedDocName) return roles;

    Object.entries(documents).forEach(([roleName, roleData]) => {
      if (roleData && roleData.folders) {
        const hasDocument = roleData.folders.some(folder => 
          folder.documents && folder.documents.some(doc => doc.file_name === selectedDocName)
        );
        if (hasDocument) {
          roles.push({
            id: roleName, 
            name: roleName,
          });
        }
      }
    });
    
    return roles;
  }, [documents, selectedDocName]);

  const { items: sortedRoles, requestSort, sortConfig } = useSortableData(currentRolesData)

  const filteredRoles = useMemo(() => {
    if (!searchQuery.trim()) return sortedRoles;

    const lowerSearch = searchQuery.toLowerCase();
    return sortedRoles.filter((role) =>
      role.name.toLowerCase().includes(lowerSearch)
    );
  }, [sortedRoles, searchQuery]);

  const handleRoleSelect = (roleId, isSelected) => {
    setSelectedRolesSet(prev => {
      const newSelected = new Set(prev);
      if (isSelected) {
        newSelected.add(roleId);
      } else {
        newSelected.delete(roleId);
      }
      return newSelected;
    });
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      const allFilteredRoleIds = new Set(filteredRoles.map(role => role.id));
      setSelectedRolesSet(allFilteredRoleIds);
    } else {
      setSelectedRolesSet(new Set());
    }
  };

  const allSelected = filteredRoles.length > 0 && filteredRoles.every(role => selectedRolesSet.has(role.id));

  const someSelected = filteredRoles.some(role => selectedRolesSet.has(role.id)) && !allSelected;

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

  const handleDeleteConfirm = async () => {
    try {
      if (onDeleteDocuments && selectedRolesSet.size > 0) {
        const documentsToDelete = [];
        
        Array.from(selectedRolesSet).forEach(roleName => {
          const documentEntries = findDocumentEntriesForRole(selectedDocName, roleName);
          documentsToDelete.push(...documentEntries);
        });
        
        if (documentsToDelete.length > 0) {
          await onDeleteDocuments(documentsToDelete);
          setSelectedRolesSet(new Set());
        }
      }
    } catch (err) {
      console.error("Failed to remove document from roles:", err);
      alert("Failed to remove document from roles. Please try again.");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedBulkAction("Bulkacties");
    }
  };

  const findDocumentEntriesForRole = (fileName, roleName) => {
    const entries = [];
    
    if (!documents || !documents[roleName]) return entries;

    const roleData = documents[roleName];
    if (roleData.folders) {
      roleData.folders.forEach(folder => {
        const doc = folder.documents?.find(d => d.file_name === fileName);
        if (doc) {
          entries.push({
            fileName: doc.file_name,
            role: roleName,
            path: doc.path
          });
        }
      });
    }
    
    return entries;
  };

  const handleDeleteClick = (role) => {
    setSelectedRolesSet(new Set([role.id]));
    setDeleteMode("single");
    setIsDeleteModalOpen(true);
  };

  const getSelectedRolesData = () => {
    return Array.from(selectedRolesSet).map(roleName => 
      filteredRoles.find(role => role.id === roleName)?.name || roleName
    );
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="mb-[29px] font-montserrat font-extrabold text-[18px] leading-[100%]">
        {filteredRoles.length} rol{filteredRoles.length !== 1 ? 'len' : ''} waar &quot;{selectedDocName}&quot; in voorkomt
        {selectedRolesSet.size > 0 && (
          <span className="ml-2 text-gray-600">
            ({selectedRolesSet.size} geselecteerd)
          </span>
        )}
      </div>

      {/* Selected Document */}
      <div className="flex w-full bg-[#F9FBFA] gap-4 py-2.5 px-2">
        <SelectedData SelectedData={selectedDocName} />
      </div>

      {/* Action Bar */}
      <div className="flex w-full h-fit bg-[#F9FBFA] items-center justify-between px-2 py-1.5">
        <div className="flex w-2/3 gap-4 items-center">
          <div className="w-4/9">
            <DropdownMenu 
              value={selectedBulkAction} 
              onChange={handleBulkAction} 
              allOptions={allOptions} 
            />
          </div>

          <div className="w-4/9">
            <SearchBox 
              placeholderText='Zoek rol...' 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <AddButton onClick={() => {}} text="Voeg toe aan rol" />
      </div>        

      {/* Roles Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#F9FBFA]">
            <tr className="h-[51px] border-b border-[#C5BEBE]">
              <SortableHeader 
                sortKey="name" 
                onSort={requestSort} 
                currentSort={sortConfig}
                className="px-2 py-2"
              >
                <div className="flex items-center gap-5">
                  <CheckBox 
                    toggle={allSelected} 
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                    color='#23BD92' 
                  />  
                  Rol
                </div>
              </SortableHeader>

              <th className="w-[120px] px-4 py-2 font-montserrat font-bold text-[16px] leading-6 text-black text-center">
                Acties
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredRoles.length === 0 ? (
              <tr>
                <td colSpan="2" className="px-4 py-6 text-center text-gray-500 font-montserrat">
                  {searchQuery ? 'Geen rollen gevonden voor deze zoekopdracht.' : 'Geen rollen gevonden.'}
                </td>
              </tr>
            ) : (
              filteredRoles.map((role) => (
                <tr 
                  key={role.id} 
                  className="h-[51px] border-b border-[#C5BEBE] hover:bg-[#F9FBFA] transition-colors"
                >
                  <td className="px-2 py-2 font-montserrat font-normal text-[16px] leading-6 text-black">
                    <div className="flex items-center gap-5">
                      <CheckBox 
                        toggle={selectedRolesSet.has(role.id)} 
                        onChange={(isSelected) => handleRoleSelect(role.id, isSelected)}
                        color='#23BD92' 
                      />  
                      {role.name}
                    </div>
                  </td>

                  <td className="px-4 py-2">
                    <div className="flex justify-center items-center gap-3">
                      <button 
                        className="hover:opacity-80 transition-opacity"
                        aria-label={`Edit ${role.name}`}
                      >
                        <EditIcon />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(role)}
                        className="hover:opacity-80 transition-opacity"
                        aria-label={`Remove from ${role.name}`}
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

      {/* Delete Confirmation Modal */}
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