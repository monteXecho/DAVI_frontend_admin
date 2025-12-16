'use client'
import { useState, useMemo } from "react";
import AddButton from "@/components/buttons/AddButton";
import CheckBox from "@/components/buttons/CheckBox";
import EditIcon from "@/components/icons/EditIcon";
import SearchBox from "@/components/input/SearchBox";
import RedCancelIcon from "@/components/icons/RedCancelIcon";
import DropdownMenu from "@/components/input/DropdownMenu";
import SelectedData from "@/components/input/SelectedData";
import DeleteDocumentFromFoldersModal from "./modals/DeleteDocumentFromFoldersModal";
import SortableHeader from "@/components/SortableHeader";
import { useSortableData } from "@/lib/useSortableData";

export default function AppearInFolderTab({ documents = {}, selectedDocName, onDeleteDocuments, onMoveToToevoegen, canWrite = true }) {
  const allOptions = ["Bulkacties", "Verwijder uit map"];
  const [selectedBulkAction, setSelectedBulkAction] = useState(allOptions[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFoldersSet, setSelectedFoldersSet] = useState(new Set());
  const [deleteMode, setDeleteMode] = useState("single");

  const currentFoldersData = useMemo(() => {
    const folders = [];

    if (!documents || !selectedDocName) return folders;

    Object.entries(documents).forEach(([roleName, roleData]) => {
      if (roleData?.folders) {
        roleData.folders.forEach((folder) => {
          if (folder.documents?.some(doc => doc.file_name === selectedDocName)) {
            folders.push({
              id: `${roleName}::${folder.name}`, 
              name: folder.name,
              role: roleName,
              displayName: folder.name,
              roleName: roleName
            });
          }
        });
      }
    });

    return folders;
  }, [documents, selectedDocName]);

  const { items: sortedFolders, requestSort, sortConfig } = useSortableData(currentFoldersData)

  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return sortedFolders;

    const lowerSearch = searchQuery.toLowerCase();
    return sortedFolders.filter((folder) =>
      folder.name.toLowerCase().includes(lowerSearch) ||
      folder.role.toLowerCase().includes(lowerSearch)
    );
  }, [sortedFolders, searchQuery]);

  const handleFolderSelect = (folderId, isSelected) => {
    setSelectedFoldersSet(prev => {
      const newSelected = new Set(prev);
      if (isSelected) newSelected.add(folderId);
      else newSelected.delete(folderId);
      return newSelected;
    });
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedFoldersSet(new Set(filteredFolders.map(f => f.id)));
    } else {
      setSelectedFoldersSet(new Set());
    }
  };

  const allSelected = filteredFolders.length > 0 && filteredFolders.every(f => selectedFoldersSet.has(f.id));
  const someSelected = filteredFolders.some(f => selectedFoldersSet.has(f.id)) && !allSelected;

  const handleBulkAction = (action) => {
    setSelectedBulkAction(action);

    if (action === "Verwijder uit map") {
      if (selectedFoldersSet.size > 0) {
        setDeleteMode("bulk");
        setIsDeleteModalOpen(true);
      } else {
        alert("Selecteer eerst mappen om het document uit te verwijderen.");
        setSelectedBulkAction("Bulkacties");
      }
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (onDeleteDocuments && selectedFoldersSet.size > 0) {
        const documentsToDelete = [];

        Array.from(selectedFoldersSet).forEach(folderId => {
          const [roleName, folderName] = folderId.split("::");
          const documentEntry = findDocumentEntry(selectedDocName, folderName, roleName);
          if (documentEntry) {
            documentsToDelete.push(documentEntry);
          }
        });

        if (documentsToDelete.length > 0) {
          await onDeleteDocuments(documentsToDelete);
          setSelectedFoldersSet(new Set());
        }
      }
    } catch (err) {
      console.error("Failed to remove document from folders:", err);
      alert("Failed to remove document from folders. Please try again.");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedBulkAction("Bulkacties");
    }
  };

  const findDocumentEntry = (fileName, folderName, roleFilter = null) => {
    if (!documents) return null;

    for (const [roleName, roleData] of Object.entries(documents)) {
      if (roleFilter && roleName !== roleFilter) continue;

      for (const folder of roleData.folders || []) {
        if (folder.name === folderName) {
          const doc = folder.documents?.find(d => d.file_name === fileName);
          if (doc) {
            return {
              fileName: doc.file_name,
              folderName: folderName,
              path: doc.path
            };
          }
        }
      }
    }
    return null;
  };

  const handleDeleteClick = (folder) => {
    setSelectedFoldersSet(new Set([folder.id]));
    setDeleteMode("single");
    setIsDeleteModalOpen(true);
  };

  const getSelectedFoldersData = () => {
    return Array.from(selectedFoldersSet).map(id => {
      const [roleName, folderName] = id.split("::");
      return { id, role: roleName, name: folderName };
    });
  };

  const getSingleFolderName = () => {
    const folders = getSelectedFoldersData();
    return folders.length > 0 ? folders[0].name : "";
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="mb-[29px] font-montserrat font-extrabold text-[18px] leading-[100%]">
        {filteredFolders.length} map{filteredFolders.length !== 1 ? 'pen' : ''} waar &quot;{selectedDocName}&quot; in voorkomt
        {selectedFoldersSet.size > 0 && (
          <span className="ml-2 text-gray-600">
            ({selectedFoldersSet.size} geselecteerd)
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
              disabled={!canWrite}
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

        {canWrite && <AddButton onClick={onMoveToToevoegen} text="Voeg toe aan map" />}
        {!canWrite && <div className="text-gray-500 text-sm italic">Alleen-lezen modus: U heeft geen schrijfrechten</div>}
      </div>

      {/* Folders Table */}
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
                  {canWrite && (
                    <CheckBox
                      toggle={allSelected}
                      indeterminate={someSelected}
                      onChange={handleSelectAll}
                      color='#23BD92'
                    />
                  )}
                  {!canWrite && <div className="w-5" />}
                  Map
                </div>
              </SortableHeader>

              <th className="w-[120px] px-4 py-2 font-montserrat font-bold text-[16px] leading-6 text-black text-center">
                Acties
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredFolders.length === 0 ? (
              <tr>
                <td colSpan="2" className="px-4 py-6 text-center text-gray-500 font-montserrat">
                  {searchQuery ? 'Geen mappen gevonden voor deze zoekopdracht.' : 'Geen mappen gevonden.'}
                </td>
              </tr>
            ) : (
              filteredFolders.map((folder) => (
                <tr 
                  key={folder.id} 
                  className="h-[51px] border-b border-[#C5BEBE] hover:bg-[#F9FBFA] transition-colors"
                >
                  <td className="px-4 py-2 font-montserrat font-normal text-[16px] leading-6 text-black">
                    <div className="flex items-center gap-5">
                      {canWrite && (
                        <CheckBox
                          toggle={selectedFoldersSet.has(folder.id)}
                          onChange={(isSelected) => handleFolderSelect(folder.id, isSelected)}
                          color='#23BD92'
                        />
                      )}
                      {!canWrite && <div className="w-5" />}
                      <div className="flex gap-3 items-center">
                        <span>{folder.name}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-2">
                    <div className="flex justify-center items-center gap-3">
                      {canWrite && (
                        <>
                          <button 
                            className="hover:opacity-80 transition-opacity"
                            aria-label={`Edit ${folder.name}`}
                          >
                            <EditIcon />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(folder)}
                            className="hover:opacity-80 transition-opacity"
                            aria-label={`Remove from ${folder.name}`}
                          >
                            <RedCancelIcon />
                          </button>
                        </>
                      )}
                      {!canWrite && <span className="text-xs text-gray-400 italic">-</span>}
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
            <DeleteDocumentFromFoldersModal
              folders={deleteMode === "bulk" ? getSelectedFoldersData() : []}
              folderName={deleteMode === "single" ? getSingleFolderName() : ""}
              roleName={deleteMode === "single" ? getSelectedFoldersData()[0]?.role : ""}
              documentName={selectedDocName}
              onClose={() => {
                setIsDeleteModalOpen(false);
                setSelectedBulkAction("Bulkacties");
              }}
              onConfirm={handleDeleteConfirm}
              isMultiple={deleteMode === "bulk"}
            />
          </div>
        </div>
      )}
    </div>
  );
}