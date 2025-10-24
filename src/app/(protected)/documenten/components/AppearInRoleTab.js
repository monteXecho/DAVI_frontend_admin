'use client'
import { useState, useMemo } from "react";
import AddButton from "@/components/buttons/AddButton";
import CheckBox from "@/components/buttons/CheckBox";
import EditIcon from "@/components/icons/EditIcon";
import SearchBox from "@/components/input/SearchBox";
import RedCancelIcon from "@/components/icons/RedCancelIcon";
import DownArrow from "@/components/icons/DownArrowIcon";
import DropdownMenu from "@/components/input/DropdownMenu";
import SelectedData from "@/components/input/SelectedData";
import DeleteDocumentFromRolesModal from "./modals/DeleteDocumentFromRolesModal";

export default function AppearInRoleTab({ documents = {}, selectedDocName, onDeleteDocuments }) {
  const allOptions = ["Bulkacties", "Verwijderen"]; 
  const [selectedBulkAction, setSelectedBulkAction] = useState(allOptions[0]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRolesSet, setSelectedRolesSet] = useState(new Set());
  const [deleteMode, setDeleteMode] = useState("single"); // 'single' or 'bulk'

  // Derive current roles from documents instead of using static selectedRoles prop
  const currentRoles = useMemo(() => {
    const roles = [];
    
    if (!documents || !selectedDocName) return roles;

    // Search through all roles to find where this document exists
    Object.entries(documents).forEach(([roleName, roleData]) => {
      if (roleData && roleData.folders) {
        const hasDocument = roleData.folders.some(folder => 
          folder.documents && folder.documents.some(doc => doc.file_name === selectedDocName)
        );
        if (hasDocument) {
          roles.push(roleName);
        }
      }
    });
    
    return roles;
  }, [documents, selectedDocName]); // Recalculate when documents or selectedDocName changes

  // Filter roles by search
  const filteredRoles = useMemo(() => {
    return currentRoles.filter((role) =>
      role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentRoles, searchQuery]);

  // Handle individual checkbox selection
  const handleRoleSelect = (roleName, isSelected) => {
    setSelectedRolesSet(prev => {
      const newSelected = new Set(prev);
      if (isSelected) {
        newSelected.add(roleName);
      } else {
        newSelected.delete(roleName);
      }
      return newSelected;
    });
  };

  // Handle select all checkbox
  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      // Select all filtered roles
      const allFilteredRoleNames = new Set(filteredRoles);
      setSelectedRolesSet(allFilteredRoleNames);
    } else {
      // Deselect all
      setSelectedRolesSet(new Set());
    }
  };

  // Check if all filtered roles are selected
  const allSelected = filteredRoles.length > 0 && filteredRoles.every(role => selectedRolesSet.has(role));

  // Check if some filtered roles are selected
  const someSelected = filteredRoles.some(role => selectedRolesSet.has(role)) && !allSelected;

  // Handle bulk action selection
  const handleBulkAction = (action) => {
    setSelectedBulkAction(action);
    
    if (action === "Verwijderen") {
      if (selectedRolesSet.size > 0) {
        setDeleteMode("bulk");
        setIsDeleteModalOpen(true);
      } else {
        // Show message if no roles are selected
        alert("Selecteer eerst rollen om het document uit te verwijderen.");
        setSelectedBulkAction("Bulkacties"); // Reset to default
      }
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (onDeleteDocuments && selectedRolesSet.size > 0) {
        // Create document entries for each selected role
        const documentsToDelete = [];
        
        // For each selected role, find all document entries across all folders
        Array.from(selectedRolesSet).forEach(role => {
          // Find all document entries for this role
          const documentEntries = findDocumentEntriesForRole(selectedDocName, role);
          documentsToDelete.push(...documentEntries);
        });
        
        if (documentsToDelete.length > 0) {
          await onDeleteDocuments(documentsToDelete);
          setSelectedRolesSet(new Set()); // Clear selection after deletion
        }
      }
    } catch (err) {
      console.error("Failed to remove document from roles:", err);
      alert("Failed to remove document from roles. Please try again.");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedBulkAction("Bulkacties"); // Reset bulk action after deletion
    }
  };

  // Helper function to find all document entries for a specific role
  const findDocumentEntriesForRole = (fileName, roleName) => {
    const entries = [];
    
    if (!documents || !documents[roleName]) return entries;

    // Search through all folders in the role to find the document
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
    setSelectedRolesSet(new Set([role])); // Select only this role
    setDeleteMode("single");
    setIsDeleteModalOpen(true);
  };

  // Get selected roles data for display in modal
  const getSelectedRolesData = () => {
    return Array.from(selectedRolesSet);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="mb-[29px] font-montserrat font-extrabold text-[18px] leading-[100%]">
        {filteredRoles.length} rol{filteredRoles.length !== 1 ? 'len' : ''} waar "{selectedDocName}" in voorkomt
        {selectedRolesSet.size > 0 && (
          <span className="ml-2 text-gray-600">
            ({selectedRolesSet.size} geselecteerd)
          </span>
        )}
      </div>

      <div className="flex w-full bg-[#F9FBFA] gap-4 py-[10px] px-2">
          <SelectedData SelectedData={selectedDocName} />
      </div>

      <div className="flex w-full h-fit bg-[#F9FBFA] items-center justify-between px-2 py-[6px]">
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

      <table className="w-full border-separate border-spacing-0 border border-transparent">
          <thead className="bg-[#F9FBFA]">                
              <tr className="h-[51px] border-b border-[#C5BEBE] hover:bg-[#F9FBFA] flex items-center gap-[40px] w-full px-2">
                  <th className="flex items-center gap-5 w-full font-montserrat font-bold text-[16px] leading-6 text-black">
                      <CheckBox 
                        toggle={allSelected} 
                        indeterminate={someSelected}
                        onChange={handleSelectAll}
                        color='#23BD92' 
                      />  
                      <span>Rol</span>
                      <DownArrow />
                  </th>
                  <th className="w-[52px] px-4 py-2"></th>
              </tr>
          </thead>
          <tbody>
              {filteredRoles.map((role, i) => (
                  <tr key={i} className="h-[51px] border-b border-[#C5BEBE] flex items-center gap-[40px]">
                      <td className="flex gap-5 w-full items-center font-montserrat font-normal text-[16px] leading-6 text-black px-2 py-2">
                          <CheckBox 
                            toggle={selectedRolesSet.has(role)} 
                            onChange={(isSelected) => handleRoleSelect(role, isSelected)}
                            color='#23BD92' 
                          />  
                          {role}
                      </td>
                      <td className="w-fit flex justify-end items-center gap-3 px-4 py-2">
                          <EditIcon />
                          <button onClick={() => handleDeleteClick(role)}>
                            <RedCancelIcon />
                          </button>
                      </td>
                  </tr>
              ))}
          </tbody>
      </table>

      {filteredRoles.length === 0 && (
        <div className="p-6 text-center text-gray-500 font-montserrat">
          {searchQuery ? 'Geen rollen gevonden voor deze zoekopdracht.' : 'Geen rollen gevonden.'}
        </div>
      )}

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