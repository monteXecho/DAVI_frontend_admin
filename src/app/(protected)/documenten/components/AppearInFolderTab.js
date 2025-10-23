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
import DeleteDocumentFromFoldersModal from "./modals/DeleteDocumentFromFoldersModal";

export default function AppearInFolderTab({ documents = {}, selectedDocName, onDeleteDocuments }) {
  const allOptions = ["Bulkacties", "Verwijderen"]; 
  const [selectedBulkAction, setSelectedBulkAction] = useState(allOptions[0]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFoldersSet, setSelectedFoldersSet] = useState(new Set());
  const [deleteMode, setDeleteMode] = useState("single"); // 'single' or 'bulk'

  // Derive current folders from documents instead of using static selectedFolders prop
  const currentFolders = useMemo(() => {
    const folders = [];
    
    if (!documents || !selectedDocName) return folders;

    // Search through all roles and folders to find where this document exists
    Object.values(documents).forEach((roleData) => {
      if (roleData && roleData.folders) {
        roleData.folders.forEach((folder) => {
          if (folder.documents && folder.documents.some(doc => doc.file_name === selectedDocName)) {
            folders.push(folder.name);
          }
        });
      }
    });
    
    return folders;
  }, [documents, selectedDocName]); // Recalculate when documents or selectedDocName changes

  // Filter folders by search
  const filteredFolders = useMemo(() => {
    return currentFolders.filter((folder) =>
      folder.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentFolders, searchQuery]);

  // Handle individual checkbox selection
  const handleFolderSelect = (folderName, isSelected) => {
    setSelectedFoldersSet(prev => {
      const newSelected = new Set(prev);
      if (isSelected) {
        newSelected.add(folderName);
      } else {
        newSelected.delete(folderName);
      }
      return newSelected;
    });
  };

  // Handle select all checkbox
  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      // Select all filtered folders
      const allFilteredFolderNames = new Set(filteredFolders);
      setSelectedFoldersSet(allFilteredFolderNames);
    } else {
      // Deselect all
      setSelectedFoldersSet(new Set());
    }
  };

  // Check if all filtered folders are selected
  const allSelected = filteredFolders.length > 0 && filteredFolders.every(folder => selectedFoldersSet.has(folder));

  // Check if some filtered folders are selected
  const someSelected = filteredFolders.some(folder => selectedFoldersSet.has(folder)) && !allSelected;

  // Handle bulk action selection
  const handleBulkAction = (action) => {
    setSelectedBulkAction(action);
    
    if (action === "Verwijderen") {
      if (selectedFoldersSet.size > 0) {
        setDeleteMode("bulk");
        setIsDeleteModalOpen(true);
      } else {
        // Show message if no folders are selected
        alert("Selecteer eerst mappen om het document uit te verwijderen.");
        setSelectedBulkAction("Bulkacties"); // Reset to default
      }
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (onDeleteDocuments && selectedFoldersSet.size > 0) {
        // Create document entries for each selected folder
        const documentsToDelete = [];
        
        // For each selected folder, find the corresponding document entry
        Array.from(selectedFoldersSet).forEach(folder => {
          // Find the document data for this specific folder
          const documentEntry = findDocumentEntry(selectedDocName, folder);
          if (documentEntry) {
            documentsToDelete.push({
              fileName: selectedDocName,
              role: documentEntry.role,
              path: documentEntry.path
            });
          }
        });
        
        if (documentsToDelete.length > 0) {
          await onDeleteDocuments(documentsToDelete);
          setSelectedFoldersSet(new Set()); // Clear selection after deletion
        }
      }
    } catch (err) {
      console.error("Failed to remove document from folders:", err);
      alert("Failed to remove document from folders. Please try again.");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedBulkAction("Bulkacties"); // Reset bulk action after deletion
    }
  };

  // Helper function to find the specific document entry for a folder
  const findDocumentEntry = (fileName, folderName) => {
    if (!documents) return null;
    
    // Search through all roles and folders to find the exact document
    for (const [roleName, roleData] of Object.entries(documents)) {
      for (const folder of roleData.folders || []) {
        if (folder.name === folderName) {
          const doc = folder.documents?.find(d => d.file_name === fileName);
          if (doc) {
            return {
              fileName: doc.file_name,
              role: roleName,
              path: doc.path
            };
          }
        }
      }
    }
    return null;
  };

  const handleDeleteClick = (folder) => {
    setSelectedFoldersSet(new Set([folder])); // Select only this folder
    setDeleteMode("single");
    setIsDeleteModalOpen(true);
  };

  // Get selected folders data for display in modal
  const getSelectedFoldersData = () => {
    return Array.from(selectedFoldersSet);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="mb-[29px] font-montserrat font-extrabold text-[18px] leading-[100%]">
        {filteredFolders.length} map{filteredFolders.length !== 1 ? 'pen' : ''} waar "{selectedDocName}" in voorkomt
        {selectedFoldersSet.size > 0 && (
          <span className="ml-2 text-gray-600">
            ({selectedFoldersSet.size} geselecteerd)
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
                    placeholderText='Zoek map...' 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
              </div>
          </div>

          <AddButton onClick={() => {}} text="Voeg toe aan map" />
      </div>        

      <table className="w-full border-separate border-spacing-0 border border-transparent">
          <thead className="bg-[#F9FBFA]">                
              <tr className="h-[51px] border-b border-[#C5BEBE] flex items-center gap-[40px] w-full px-2">
                  <th className="flex items-center gap-5 w-full font-montserrat font-bold text-[16px] leading-6 text-black">
                      <CheckBox 
                        toggle={allSelected} 
                        indeterminate={someSelected}
                        onChange={handleSelectAll}
                        color='#23BD92' 
                      />  
                      <span>Map</span>
                      <DownArrow />
                  </th>
                  <th className="w-[52px] px-4 py-2"></th>
              </tr>
          </thead>
          <tbody>
              {filteredFolders.map((folder, i) => (
                  <tr key={i} className="h-[51px] border-b border-[#C5BEBE] flex items-center gap-[40px]">
                      <td className="flex gap-5 w-full items-center font-montserrat font-normal text-[16px] leading-6 text-black px-2 py-2">
                          <CheckBox 
                            toggle={selectedFoldersSet.has(folder)} 
                            onChange={(isSelected) => handleFolderSelect(folder, isSelected)}
                            color='#23BD92' 
                          />  
                          {folder}
                      </td>
                      <td className="w-fit flex justify-end items-center gap-3 px-4 py-2">
                          <EditIcon />
                          <button onClick={() => handleDeleteClick(folder)}>
                            <RedCancelIcon />
                          </button>
                      </td>
                  </tr>
              ))}
          </tbody>
      </table>

      {filteredFolders.length === 0 && (
        <div className="p-6 text-center text-gray-500 font-montserrat">
          {searchQuery ? 'Geen mappen gevonden voor deze zoekopdracht.' : 'Geen mappen gevonden.'}
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
            <DeleteDocumentFromFoldersModal
              folders={getSelectedFoldersData()}
              documentName={selectedDocName}
              onClose={() => {
                setIsDeleteModalOpen(false);
                setSelectedBulkAction("Bulkacties");
              }}
              onConfirm={handleDeleteConfirm}
              isMultiple={selectedFoldersSet.size > 1}
            />
          </div>
        </div>
      )}
    </div>
  );
}