import { useCallback, useEffect, useState } from "react";
import ModalImage from "react-modal-image";
import clsx from "clsx";
import {
  FileKind,
  getFileDownloadUrl,
  getFileStatus,
  getModuleDocuments,
} from "../services/api";
import { useChecks } from "../contexts/ChecksContext";
import { getKeyFromFileName } from "../helpers/file";
import Button from "./Button";
import Icon from "./Icon";
import FileFormatModal from "./FileFormatModal";

export default function FileUploadCard({
  kind,
  format,
  action,
  children,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenFormatModal, setIsOpenFormatModal] = useState(false);

  const handleClickOpenButton = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleClickFormatModalOpenButton = useCallback(() => {
    setIsOpenFormatModal(true);
  }, []);

  const handleFormatModalCloseDialog = useCallback(() => {
    setIsOpenFormatModal(false);
  }, []);

  return (
    <div
      className={`${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        {action}
        {false && (
          <div className="flex items-center gap-2">
            {format && (
              <Button
                onClick={handleClickFormatModalOpenButton}
                icon={"edit"}
                size="sm"
                variant="o-primary"
              >
                Edit format
              </Button>
            )}
            <Button
              onClick={handleClickOpenButton}
              size="sm"
              variant="o-primary"
            >
              View uploaded files
            </Button>
          </div>
        )}
      </div>

      {children}

      {isOpen && <EditFileDialog kind={kind} onClose={handleCloseDialog} />}
      {isOpenFormatModal && (
        <FileFormatModal kind={kind} onClose={handleFormatModalCloseDialog} />
      )}
    </div>
  );
}

function EditFileDialog({ kind, onClose }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const module = `bkr${
          kind === FileKind.CHILD_REGISTRATION ? ",threeHours" : ""
        }${kind === FileKind.VGC_LIST ? ",vgc" : ""}`;
        const res = await getModuleDocuments(module);
        setDocuments(res["requiredDocuments"][kind]);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.log(error);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();

    return () => {};
  }, [kind]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit File</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <Icon name="x" size={20} />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-scroll flex flex-wrap gap-2">
          {loading ? (
            "Loading..."
          ) : documents && documents.length > 0 ? (
            documents.map((item) => (
              <DocumentItem
                key={item}
                kind={kind}
                doc={item}
                onClick={(docKey) => setActiveIndex(docKey)}
                active={activeIndex}
              />
            ))
          ) : (
            <p>No documentations</p>
          )}
        </div>
      </div>
    </div>
  );
}

function DocumentItem({ kind, doc, onClick, active }) {
  const { fileMap, onAdded, onRemoved } = useChecks();

  const file = fileMap[kind];
  const fileKey = file?.objectKey;

  const docKey = getKeyFromFileName(doc);

  const fileName = doc.split(/[/\\]/).pop().substr(9);

  const filePath = getFileDownloadUrl(`/documents/${kind}/${doc}`);

  const handleDownload = () => {
    window.open(filePath, "_blank");
  };
  const handleCheckStatus = async () => {
    try {
      const res = await getFileStatus(docKey);
      alert(typeof res === "string" ? res : JSON.stringify(res, null, 2));
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to get file status");
    }
  };
  const handleDelete = async () => {
    await removeFile(docKey);
    onRemoved(kind, docKey);
  };
  const handleAdd = async () => {
    onAdded(kind, { objectKey: docKey, fileUrl: `/documents/${kind}/${doc}` });
  };
  const handleRemove = async () => {
    onRemoved(kind, docKey);
  };
  const handleClick = () => {
    onClick(docKey);
  };

  return (
    <div
      className={clsx(
        "border rounded p-1 flex flex-col items-center justify-between gap-2",
        { "border-blue-500 bg-gray-200": active === docKey }
      )}
      onClick={handleClick}
    >
      <span
        className="text-gray-500 max-w-40 text-sm truncate shrink"
        title={fileName}
      >
        {fileName}
      </span>
      {[".png", ".jpg"].includes(fileName.substr(fileName.length - 4)) && (
        <ModalImage
          small={filePath}
          large={filePath}
          alt={fileName}
          className="h-24"
        />
      )}
      <div className="flex gap-2 shrink-0">
        <Button
          variant="ghost"
          size="xs"
          icon="download"
          onClick={handleDownload}
          title="Download"
        />
        <Button
          variant="secondary"
          size="xs"
          icon="info"
          onClick={handleCheckStatus}
          title="Status"
        />
        {/* <Button
          variant="secondary"
          size="xs"
          icon="trash-2"
          onClick={handleDelete}
          title="Remove"
        /> */}
        {fileKey === docKey ? (
          <Button
            variant="secondary"
            size="xs"
            icon="x"
            onClick={handleRemove}
            title="Remvoe from check list"
            className="bg-yellow-300 text-blue-900 px-4"
          />
        ) : (
          <Button
            variant="secondary"
            size="xs"
            icon="check"
            onClick={handleAdd}
            title="Add to check list"
            className="bg-blue-300 text-yellow-200 hover:text-yellow-600 px-4"
          />
        )}
      </div>
    </div>
  );
}
