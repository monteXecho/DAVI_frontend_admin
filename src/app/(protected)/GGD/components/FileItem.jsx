import ModalImage from "react-modal-image";
import { useChecks } from "../contexts/ChecksContext";
import { getFileDownloadUrl, getFileStatus } from "../services/api";
import Button from "./Button";

export default function FileItem({ kind, file }) {
  const { onRemoved } = useChecks();

  const fileName = file.fileUrl.split(/[/\\]/).pop().substr(9);

  const filePath = getFileDownloadUrl(file.fileUrl);

  function handleDownload() {
    window.open(getFileDownloadUrl(file.fileUrl), "_blank");
  }
  async function handleCheckStatus() {
    try {
      const res = await getFileStatus(file.objectKey);
      alert(typeof res === "string" ? res : JSON.stringify(res, null, 2));
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to get file status");
    }
  }
  async function handleDelete() {
    await removeFile(file.objectKey);
    onRemoved(kind, file.objectKey);
  }
  const handleRemove = async () => {
    onRemoved(kind, file.objectKey);
  };

  return (
    <div className="border rounded p-1 flex flex-col items-center justify-between gap-2">
      <span
        className="text-gray-500 truncate max-w-40 text-sm shrink"
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
      <div className="flex gap-1 shrink-0">
        <Button
          variant="ghost"
          size="xs"
          icon="download"
          onClick={handleDownload}
          title="Download"
        ></Button>
        <Button
          variant="secondary"
          size="xs"
          icon="info"
          onClick={handleCheckStatus}
          title="Status"
        ></Button>
        {/* <Button
          variant="secondary"
          size="xs"
          icon="trash-2"
          onClick={handleDelete}
          title="Remove"
        ></Button> */}
        <Button
          variant="secondary"
          size="xs"
          icon="x"
          onClick={handleRemove}
          title="Remvoe from check list"
          className="bg-yellow-300 text-blue-900 px-4"
        />
      </div>
    </div>
  );
}
