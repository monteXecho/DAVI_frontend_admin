'use client'
import { useEffect, useState, useMemo } from "react"
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
import DeleteDocumentModal from "./modals/DeleteDocumentModal"

export default function AllDocumentsTab({ documents = {}, onUploadTab, onShowUsers, onShowRoles, onShowFolders, onDeleteDocuments }) {
  const [allOptions1, setAllOptions1] = useState([])
  const [selectedRole, setSelectedRole] = useState("Alle Rollen")
  const allOptions2 = ["Bulkacties", "Verwijderen"]
  const [selectedBulkAction, setSelectedBulkAction] = useState(allOptions2[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState(new Set())
  const [deleteMode, setDeleteMode] = useState("single") // 'single' or 'bulk'

  useEffect(() => {
    const roles = Object.keys(documents || {})
    setAllOptions1(["Alle Rollen", ...roles])
  }, [documents])

  const getAllDocuments = () => {
    if (!documents) return []
    
    const allDocs = [];
    
    // Iterate through each role
    Object.entries(documents).forEach(([roleName, roleData]) => {
      // Iterate through each folder in the role
      roleData.folders.forEach(folder => {
        // Iterate through each document in the folder
        folder.documents.forEach(doc => {
          allDocs.push({
            id: `${roleName}-${folder.name}-${doc.file_name}`,
            folder: folder.name,
            file: doc.file_name,
            path: doc.path,
            uploaded_at: doc.uploaded_at,
            assigned_to: doc.assigned_to,
            role: roleName // Directly use the current role name
          });
        });
      });
    });
    
    return allDocs;
  }

  const getDocumentsForRole = (role) => {
    if (!documents || !documents[role]) return []
    return documents[role].folders.flatMap(folder =>
      folder.documents.map(doc => ({
        id: `${role}-${folder.name}-${doc.file_name}`,
        folder: folder.name,
        file: doc.file_name,
        path: doc.path,
        uploaded_at: doc.uploaded_at,
        assigned_to: doc.assigned_to,
        role: role
      }))
    )
  }

  const getAllFoldersForFile = (fileName) => {
    const folders = [];
    Object.values(documents || {}).forEach((role) => {
      role.folders.forEach((folder) => {
        const hasFile = folder.documents.some((doc) => doc.file_name === fileName);
        if (hasFile) folders.push(folder.name);
      });
    });
    return folders;
  };

  const getAllRolesForFile = (fileName) => {
    const roles = [];
    Object.entries(documents || {}).forEach(([roleName, roleData]) => {
      const found = roleData.folders.some((folder) =>
        folder.documents.some((doc) => doc.file_name === fileName)
      );
      if (found) roles.push(roleName);
    });
    return roles;
  };

  // Get filtered documents based on selected role and search query
  const filteredDocuments = useMemo(() => {
    let docs = selectedRole === "Alle Rollen" 
      ? getAllDocuments() 
      : getDocumentsForRole(selectedRole)

    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();
      docs = docs.filter((doc) => 
        doc.file.toLowerCase().includes(search)
      );
    }

    return docs;
  }, [documents, selectedRole, searchQuery])

  // Handle individual checkbox selection
  const handleDocumentSelect = (docId, isSelected) => {
    setSelectedDocuments(prev => {
      const newSelected = new Set(prev);
      if (isSelected) {
        newSelected.add(docId);
      } else {
        newSelected.delete(docId);
      }
      return newSelected;
    });
  };

  // Handle select all checkbox
  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      // Select all filtered documents
      const allFilteredDocIds = new Set(filteredDocuments.map(doc => doc.id));
      setSelectedDocuments(allFilteredDocIds);
    } else {
      // Deselect all
      setSelectedDocuments(new Set());
    }
  };

  // Check if all filtered documents are selected
  const allSelected = filteredDocuments.length > 0 && filteredDocuments.every(doc => selectedDocuments.has(doc.id));

  // Check if some filtered documents are selected
  const someSelected = filteredDocuments.some(doc => selectedDocuments.has(doc.id)) && !allSelected;

  // Handle bulk action selection
  const handleBulkAction = (action) => {
    setSelectedBulkAction(action);
    
    if (action === "Verwijderen") {
      if (selectedDocuments.size > 0) {
        setDeleteMode("bulk");
        setIsDeleteModalOpen(true);
      } else {
        // Show message if no documents are selected
        alert("Selecteer eerst documenten om te verwijderen.");
        setSelectedBulkAction("Bulkacties"); // Reset to default
      }
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (onDeleteDocuments && selectedDocuments.size > 0) {
        // Get selected documents with their file names and roles
        const docsToDelete = getSelectedDocumentsData();
        
        // Create array of objects containing file name and role for each document
        const documentsToDelete = docsToDelete.map(doc => ({
          fileName: doc.file,
          role: doc.role,
          path: doc.path // Include path if needed
        }));
        
        await onDeleteDocuments(documentsToDelete);
        setSelectedDocuments(new Set()); // Clear selection after deletion
      }
    } catch (err) {
      console.error("Failed to delete documents:", err);
      alert("Failed to delete documents. Please try again.");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedBulkAction("Bulkacties"); // Reset bulk action after deletion
    }
  };

  const handleDeleteClick = (doc) => {
    setSelectedDocuments(new Set([doc.id])); // Select only this document
    setDeleteMode("single");
    setIsDeleteModalOpen(true);
  };

  // Get selected documents data for display in modal
  const getSelectedDocumentsData = () => {
    return Array.from(selectedDocuments).map(docId => 
      filteredDocuments.find(doc => doc.id === docId)
    ).filter(Boolean);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="mb-[29px] font-montserrat font-extrabold text-[18px] leading-[100%]">
        {selectedRole === "Alle Rollen" 
          ? `${filteredDocuments.length} document${filteredDocuments.length !== 1 ? 'en' : ''}`
          : `${filteredDocuments.length} document${filteredDocuments.length !== 1 ? 'en' : ''} met de rol "${selectedRole}"`
        }
        {selectedDocuments.size > 0 && (
          <span className="ml-2 text-gray-600">
            ({selectedDocuments.size} geselecteerd)
          </span>
        )}
      </div>

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
              value={selectedBulkAction}
              onChange={handleBulkAction}
              allOptions={allOptions2}
            />
          </div>
          <div className="w-4/9">
            <SearchBox 
              placeholderText="Zoek document..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <AddButton onClick={() => onUploadTab()} text="Toevoegen" />
      </div>

      {/* Check if there are no documents or if documents for the selected role are empty */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          {selectedRole === "Alle Rollen" 
            ? "Er zijn geen documenten beschikbaar."
            : "Er zijn geen documenten beschikbaar voor deze rol."
          }
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-[#F9FBFA]">
              <tr className="h-[51px] border-b border-[#C5BEBE]">
                <th className="px-4 py-2 font-montserrat font-bold text-[16px] text-black">
                  <div className="flex items-center gap-3">
                    <CheckBox 
                      toggle={allSelected} 
                      indeterminate={someSelected}
                      onChange={handleSelectAll}
                      color="#23BD92" 
                    />
                    <span>Map</span>
                    <DownArrow />
                  </div>
                </th>
                {selectedRole === "Alle Rollen" && (
                  <th className="px-4 py-2 font-montserrat font-bold text-[16px] text-black">
                    <div className="flex items-center gap-3">
                      Rol
                      <DownArrow />
                    </div>
                  </th>
                )}
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
                  key={doc.id}
                  className="w-full items-center h-[51px] border-b border-[#C5BEBE] hover:bg-[#F9FBFA] transition-colors"
                >
                  <td className="px-4 py-2 font-montserrat text-[16px] text-black font-normal">
                    <div className="flex items-center gap-3">
                      <CheckBox 
                        toggle={selectedDocuments.has(doc.id)} 
                        onChange={(isSelected) => handleDocumentSelect(doc.id, isSelected)}
                        color="#23BD92" 
                      />
                      {doc.folder}
                    </div>
                  </td>
                  {selectedRole === "Alle Rollen" && (
                    <td className="px-4 py-2 font-montserrat text-[16px] text-black font-normal">
                      {doc.role}
                    </td>
                  )}
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
                        onClick={() => {
                          const allRoles = getAllRolesForFile(doc.file);
                          onShowRoles(doc.file, allRoles);
                        }}
                      >
                        <Image src={RollenItem} alt="RollenItem" />
                        <div className="absolute inset-0 bg-[#23BD92] mix-blend-overlay"></div>
                      </div>
                      <button className="cursor-pointer" onClick={() => {
                          const allFolders = getAllFoldersForFile(doc.file);
                          onShowFolders(doc.file, allFolders);
                        }}>
                        <GreenFolderIcon />
                      </button>
                      <button onClick={() => handleDeleteClick(doc)}>
                        <RedCancelIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            <DeleteDocumentModal
              documents={getSelectedDocumentsData()}
              onClose={() => {
                setIsDeleteModalOpen(false);
                setSelectedBulkAction("Bulkacties");
              }}
              onConfirm={handleDeleteConfirm}
              isMultiple={selectedDocuments.size > 1}
            />
          </div>
        </div>
      )}
    </div>
  )
}