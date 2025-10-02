'use client'

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { FileKind, uploadFile, startCheck, getCheckIds } from "./services/api";
import { useChecks } from "./contexts/ChecksContext";
import { datesBetween } from "./helpers/date";
import { isFormatNeedFile } from "./helpers/file";
import CheckResults from "./components/CheckResults";
import FileUploadCard from "./components/FileUploadCard";
import Toggle from "./components/Toggle";
import FileItem from "./components/FileItem";
import ComplianceCheckButton from "./components/ComplianceCheckButton";
import ProgressBarPolling from "./components/ProgressBarPolling";

const Checkbox = memo(function Checkbox({
  label,
  checked,
  onChange,
  disabled,
  readOnly,
}) {
  return (
    <div>
      <Toggle
        label={label}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        readOnly={readOnly}
      />
    </div>
  );
});

const UploadSection = memo(function UploadSection({ title, kind, format }) {
  const { fileMap, onAdded, onRemoved } = useChecks();

  const file = fileMap[kind];

  const [isUploading, setIsUploading] = useState(false);

  const handlePickAndUpload = useCallback(
    async function handlePickAndUpload() {
      try {
        const input = document.createElement("input");
        input.type = "file";
        input.accept =
          // kind ===
          "image/*,application/pdf,application/msword,application/json,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.doc,.docx";
        input.onchange = async () => {
          if (input.files && input.files[0]) {
            setIsUploading(true);
            try {
              const result = await uploadFile(input.files[0], kind);
              onAdded(kind, result);
            } finally {
              setIsUploading(false);
            }
          }
        };
        input.click();
      } catch (e) {
        console.error(e);
        alert(e.message || "Upload failed");
      }
    },
    [kind, onAdded]
  );

  async function handleDelete() {
    // await removeFile(file.objectKey);
    onRemoved(kind, file.objectKey);
  }

  return (
    <FileUploadCard
      className="min-w-[320px]"
      kind={kind}
      format={format && file && isFormatNeedFile(file.fileUrl)}
      action={
        <div className="flex items-center gap-2">
          <ComplianceCheckButton
            onClick={handlePickAndUpload}
            disabled={isUploading}
            size="lg"
            variant={isUploading ? "uploading" : file ? "uploaded" : "normal"}
          >
            {isUploading
              ? "uploaden..."
              : file
              ? file.fileUrl.split(/[/\\]/).pop().substr(9)
              : title}
          </ComplianceCheckButton>
          {file && (
            <ComplianceCheckButton
              onClick={handleDelete}
              variant="remove"
              size="xs"
              className="!rounded-full !p-0.5"
            />
          )}
        </div>
      }
    >
      {false && (
        <div className="flex flex-wrap gap-2">
          {file && <FileItem key={file.objectKey} kind={kind} file={file} />}
        </div>
      )}
    </FileUploadCard>
  );
});

const DateInput = memo(function DateInput({ title, date, onChange }) {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex gap-2 items-center">
      {title && <span className="text-sm">{title}</span>}
      <input
        type="date"
        id="dateInput"
        value={date}
        onChange={handleChange}
        className="border-b border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
    </div>
  );
});

const uploadSectionItems = [
  { title: "Upload kindplanning", kind: FileKind.CHILD_PLANNING, format: true },
  {
    title: "Upload kindregistratie",
    kind: FileKind.CHILD_REGISTRATION,
    format: true,
  },
  {
    title: "Upload personeelsplanning",
    kind: FileKind.STAFF_PLANNING,
    format: true,
  },
  { title: "VGC List", kind: FileKind.VGC_LIST },
];

export default function ChecksPage() {
  const { fileMap } = useChecks();

  const [enableBkr, setEnableBkr] = useState(true);
  const [enableVgc, setEnableVgc] = useState(false);
  const [enableThreeHours, setEnableThreeHours] = useState(false);
  const [checkDate, setCheckDate] = useState("");
  const [checkToDate, setCheckToDate] = useState("");

  const requiredVisibleKinds = useMemo(() => {
    const kinds = new Set([FileKind.STAFF_PLANNING, FileKind.CHILD_PLANNING]);
    if (enableVgc) kinds.add(FileKind.VGC_LIST);
    if (enableThreeHours) kinds.add(FileKind.CHILD_REGISTRATION);
    return Array.from(kinds);
  }, [enableVgc, enableThreeHours]);

  const [isStartingCheck, setIsStartingCheck] = useState(false);
  const [lastCheckId, setLastCheckId] = useState("");
  const [progressCheckId, setProgressCheckId] = useState("");
  const [checkIds, setCheckIds] = useState([]);
  const [progressResult, setProgressResult] = useState(null);

  const validation = useMemo(() => {
    const hasStaff = fileMap[FileKind.STAFF_PLANNING];
    const hasChildPlan = fileMap[FileKind.CHILD_PLANNING];
    const hasVgc = fileMap[FileKind.VGC_LIST];
    const hasReg = fileMap[FileKind.CHILD_REGISTRATION];

    const missing = [];
    if (!hasStaff) missing.push("staff-planning");
    if (!hasChildPlan) missing.push("child-planning");
    if (enableVgc && !hasVgc) missing.push("vgc_list");
    if (enableThreeHours && !hasReg) missing.push("child-registration");
    if (!checkDate && !checkToDate) missing.push("Checking date");

    let date1 = null;
    let date2 = null;
    if (checkDate && checkToDate) {
      date1 = new Date(checkDate);
      date2 = new Date(checkToDate);
      if (date1 > date2) {
        missing.push("Check from and to date again.");
      }
    }

    return {
      hasStaff,
      hasChildPlan,
      hasVgc,
      hasReg,
      missing,
      canStart:
        hasStaff &&
        hasChildPlan &&
        (!enableVgc || hasVgc) &&
        (!enableThreeHours || hasReg) &&
        (checkDate || checkToDate) &&
        (date1 && date2 ? date1 <= date2 : true),
    };
  }, [fileMap, enableVgc, enableThreeHours, checkDate, checkToDate]);

  const handleDateChange = useCallback(function handleDateChange(value) {
    setCheckDate(value);
  });

  const handleToDateChange = useCallback(function handleDateChange(value) {
    setCheckToDate(value);
  });

  async function handleStartCheck() {
    if (!validation.canStart) {
      alert(`Missing required documents: ${validation.missing.join(", ")}`);
      return;
    }
    const modules = [];
    if (enableBkr) modules.push("bkr");
    if (enableVgc) modules.push("vgc");
    if (enableThreeHours) modules.push("threeHours");

    if (enableVgc && !fileMap[FileKind.VGC_LIST]) {
      alert("Please upload VGC list (JSON) to run VGC.");
      return;
    }
    if (enableThreeHours && !fileMap[FileKind.CHILD_REGISTRATION]) {
      alert("Please upload child-registration to run 3-UURs.");
      return;
    }

    const documentKeys = [
      fileMap[FileKind.STAFF_PLANNING],
      fileMap[FileKind.CHILD_PLANNING],
      fileMap[FileKind.VGC_LIST],
      fileMap[FileKind.CHILD_REGISTRATION],
    ];

    const source = "flexkids";
    const date = datesBetween(checkDate, checkToDate);
    try {
      setIsStartingCheck(true);
      const res = await startCheck({
        date,
        modules,
        documentKeys,
        source,
      });
      const checkId = res.id || res.checkId || String(res);
      setLastCheckId(checkId);
      setProgressCheckId(checkId);
      setCheckIds((prev) => [...prev, checkId]);
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to start check");
    } finally {
      setIsStartingCheck(false);
    }
  }

  function handleUpdateProgressResult(res) {
    setProgressResult(res);
  }

  useEffect(() => {
    async function getAllCheckIds() {
      try {
        const result = await getCheckIds();
        setCheckIds(result);
      } catch (error) {
        console.log(error);
      }
    }

    getAllCheckIds();
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-3 md:py-35 p-4 max-w-[980px] mx-auto">
      <h2 className="text-2xl font-bold">Check documenten</h2>
      <p className="my-4 text-gray-800">Wat wil je checken?</p>

      <div className="flex gap-4 flex-col">
        <Checkbox
          label="BeroepsKracht-Kindratio "
          checked={enableBkr}
          onChange={() => setEnableBkr((v) => !v)}
          readOnly={true}
          disabled={true}
        />
        <Checkbox
          label="Vaste Gezichten Criterium"
          checked={enableVgc}
          onChange={() => setEnableVgc((v) => !v)}
        />
        <Checkbox
          label="3-3-uursregeling"
          checked={enableThreeHours}
          onChange={() => setEnableThreeHours((v) => !v)}
        />
      </div>

      <p className="mt-6 text-gray-800">
        Om deze check te doen, heb ik de volgende documenten nodig:
      </p>

      <div className="grid grid-cols-1 gap-2">
        {uploadSectionItems.map(
          (item, index) =>
            requiredVisibleKinds.includes(item.kind) && (
              <UploadSection key={index} {...item} />
            )
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-4 items-center">
          <DateInput
            title={"From"}
            date={checkDate}
            onChange={handleDateChange}
          />
          <DateInput
            title={"To"}
            date={checkToDate}
            onChange={handleToDateChange}
          />
        </div>
        <div className="flex gap-2 items-center">
          <ComplianceCheckButton
            onClick={handleStartCheck}
            disabled={!validation.canStart || isStartingCheck}
            icon={isStartingCheck ? "loader-2" : "play"}
            title={
              !validation.canStart && validation.missing.length
                ? `Missing: ${validation.missing.join(", ")}`
                : undefined
            }
            variant={
              !validation.canStart || isStartingCheck ? "disabled" : "normal"
            }
          >
            {isStartingCheck ? "Starting…" : "Start de check"}
          </ComplianceCheckButton>
          {lastCheckId && (
            <span className="text-gray-500">
              Last Check ID: <strong>{lastCheckId}</strong>
            </span>
          )}
        </div>
      </div>

      {checkIds && checkIds.length > 0 && (
        <div className="pt-3 flex flex-col gap-2">
          <strong>Check Progress</strong>
          <div className="flex gap-2 items-center flex-wrap">
            <select
              value={progressCheckId}
              onChange={(e) => setProgressCheckId(e.target.value)}
              placeholder="Enter check id"
              className="w-96 px-2 py-1 border border-gray-300 rounded-md"
            >
              <option value=""></option>
              {checkIds.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {progressCheckId && (
            <ProgressBarPolling
              checkId={progressCheckId}
              onComplete={handleUpdateProgressResult}
              className="max-w-[400px]"
            />
          )}

          {progressCheckId && progressResult && (
            <CheckResults data={progressResult} />
          )}
        </div>
      )}
    </div>
  );
}
