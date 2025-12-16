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

export default function AppearInRoleTab({ documents = {}, selectedDocName, onDeleteDocuments, canWrite = true }) {
  const allOptions = ["Bulkacties", "Verwijder document"]; 
  const [selectedBulkAction, setSelectedBulkAction] = useState(allOptions[0]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEntriesSet, setSelectedEntriesSet] = useState(new Set());
  const [deleteMode, setDeleteMode] = useState("single");

  /** Extract all role-folder combinations that contain this document */
  const allEntries = useMemo(() => {
    const entries = [];
    
    if (!documents || !selectedDocName) return entries;

    Object.entries(documents).forEach(([roleName, roleData]) => {
      if (!roleData?.folders) return;

      roleData.folders.forEach(folder => {
        const matchingDoc = folder.documents?.find(doc => doc.file_name === selectedDocName);
        if (matchingDoc) {
          const entryId = `${roleName}::${folder.name}`;
          entries.push({
            id: entryId,
            role: roleName,
            folder: folder.name,
            fileName: selectedDocName,
            path: matchingDoc.path || "",
            uploaded_at: matchingDoc.uploaded_at
          });
        }
      });
    });

    return entries;
  }, [documents, selectedDocName]);

  const { items: sortedEntries, requestSort, sortConfig } = useSortableData(allEntries);

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return sortedEntries;
    const lower = searchQuery.toLowerCase();
    return sortedEntries.filter(entry => 
      entry.role.toLowerCase().includes(lower) ||
      entry.folder.toLowerCase().includes(lower)
    );
  }, [sortedEntries, searchQuery]);

  const handleEntrySelect = (entryId, isSelected) => {
    setSelectedEntriesSet(prev => {
      const newSet = new Set(prev);
      isSelected ? newSet.add(entryId) : newSet.delete(entryId);
      return newSet;
    });
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedEntriesSet(new Set(filteredEntries.map(e => e.id)));
    } else {
      setSelectedEntriesSet(new Set());
    }
  };

  const allSelected =
    filteredEntries.length > 0 &&
    filteredEntries.every(entry => selectedEntriesSet.has(entry.id));

  const someSelected =
    filteredEntries.some(entry => selectedEntriesSet.has(entry.id)) && !allSelected;

  const handleBulkAction = (action) => {
    setSelectedBulkAction(action);

    if (action === "Verwijder document") {
      if (selectedEntriesSet.size > 0) {
        setDeleteMode("bulk");
        setIsDeleteModalOpen(true);
      } else {
        alert("Selecteer eerst items om het document uit te verwijderen.");
        setSelectedBulkAction("Bulkacties");
      }
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const documentsToDelete = [];

      selectedEntriesSet.forEach(entryId => {
        const entry = filteredEntries.find(e => e.id === entryId);
        if (entry) {
          documentsToDelete.push({
            fileName: entry.fileName,
            role: entry.role,
            folderName: entry.folder,
            path: entry.path
          });
        }
      });

      if (documentsToDelete.length > 0) {
        await onDeleteDocuments(documentsToDelete);
        setSelectedEntriesSet(new Set());
      }
    } catch (err) {
      console.error("Failed to remove document from roles:", err);
      alert("Failed to remove document from roles. Please try again.");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedBulkAction("Bulkacties");
    }
  };

  const handleDeleteClick = (entry) => {
    setSelectedEntriesSet(new Set([entry.id]));
    setDeleteMode("single");
    setIsDeleteModalOpen(true);
  };

  const getSelectedEntriesData = () => {
    return Array.from(selectedEntriesSet).map(entryId => {
      const entry = filteredEntries.find(e => e.id === entryId);
      return {
        id: entryId,
        role: entry?.role ?? "",
        folder: entry?.folder ?? "",
        fileName: entry?.fileName ?? selectedDocName,
        path: entry?.path ?? ""
      };
    });
  };

  const countRoles = useMemo(() => {
    const uniqueRoles = new Set(filteredEntries.map(entry => entry.role));
    return uniqueRoles.size;
  }, [filteredEntries]);

  const countFolders = useMemo(() => {
    return filteredEntries.length;
  }, [filteredEntries]);

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="mb-[29px] font-montserrat font-extrabold text-[18px]">
        {selectedDocName} komt voor in {countRoles} rol{countRoles !== 1 ? "len" : ""} 
        {" "}en {countFolders} map{countFolders !== 1 ? "pen" : ""}
        {selectedEntriesSet.size > 0 && (
          <span className="ml-2 text-gray-600">({selectedEntriesSet.size} geselecteerd)</span>
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
            disabled={!canWrite}
          />
          <SearchBox
            placeholderText="Zoek rol of map..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {!canWrite && <div className="text-gray-500 text-sm italic">Alleen-lezen modus: U heeft geen schrijfrechten</div>}
      </div>

      {/* Entries Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#F9FBFA]">
            <tr className="h-[51px] border-b border-[#C5BEBE]">
              {/* Role Column */}
              <SortableHeader
                sortKey="role"
                onSort={requestSort}
                currentSort={sortConfig}
                className="w-2/5 px-4 py-2"
              >
                <div className="flex items-center gap-5 whitespace-nowrap">
                  {canWrite && (
                    <CheckBox
                      toggle={allSelected}
                      indeterminate={someSelected}
                      onChange={handleSelectAll}
                      color="#23BD92"
                    />
                  )}
                  {!canWrite && <div className="w-5" />}
                  Rol
                </div>
              </SortableHeader>

              {/* Folder Column */}
              <SortableHeader
                sortKey="folder"
                onSort={requestSort}
                currentSort={sortConfig}
                className="w-2/5 px-4 py-2"
              >
                Map
              </SortableHeader>

              {/* Actions Column */}
              <th className="w-[120px] px-4 py-2 font-montserrat font-bold text-[16px] text-end">
                Acties
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredEntries.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-6 text-center text-gray-500 font-montserrat"
                >
                  {searchQuery
                    ? "Geen resultaten gevonden voor deze zoekopdracht."
                    : "Geen rollen of mappen gevonden waar dit document in voorkomt."}
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => (
                <tr
                  key={entry.id}
                  className="h-[51px] border-b border-[#C5BEBE] hover:bg-[#F9FBFA]"
                >
                  {/* Checkbox */}
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-5">
                      {canWrite && (
                        <CheckBox
                          toggle={selectedEntriesSet.has(entry.id)}
                          onChange={(isSelected) =>
                            handleEntrySelect(entry.id, isSelected)
                          }
                          color="#23BD92"
                        />
                      )}
                      {!canWrite && <div className="w-5" />}
                      <div className="py-2">
                        <span className="truncate">{entry.role}</span>
                      </div>
                    </div>
                  </td>

                  {/* Folder Name */}
                  <td className="px-4 py-2">
                    <div className="flex flex-col">
                      <span className="truncate">{entry.folder}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="w-[120px] px-4 py-2">
                    <div className="flex justify-end">
                      {canWrite && (
                        <button
                          onClick={() => handleDeleteClick(entry)}
                          className="hover:opacity-80"
                          title="Verwijder document uit deze rol en map"
                        >
                          <RedCancelIcon />
                        </button>
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
              entries={getSelectedEntriesData()}
              documentName={selectedDocName}
              onClose={() => {
                setIsDeleteModalOpen(false);
                setSelectedBulkAction("Bulkacties");
              }}
              onConfirm={handleDeleteConfirm}
              isMultiple={selectedEntriesSet.size > 1}
            />
          </div>
        </div>
      )}
    </div>
  );
}