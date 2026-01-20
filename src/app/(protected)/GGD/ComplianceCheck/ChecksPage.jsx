import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { FileKind, uploadFile, startCheck, getCheckList } from "./services/api";
import { useChecks } from "./contexts/ChecksContext";
import { useToast } from "./contexts/ToastContext";
import { useI18n } from "../contexts/i18n/I18nContext";
import { datesBetween } from "./helpers/date";
import { isFormatNeedFile } from "./helpers/file";
import CheckResults from "./components/CheckResults";
import FileUploadCard from "./components/FileUploadCard";
import Toggle from "./components/Toggle";
import FileItem from "./components/FileItem";
import ComplianceCheckButton from "./components/ComplianceCheckButton";
import ProgressBarPolling from "./components/ProgressBarPolling";
import CustomizedSelect from "./components/CheckResultsShow/CustomizedSelect";

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
  const { addToast } = useToast();
  const { fileMap, onAdded, onRemoved } = useChecks();
  const { t } = useI18n();

  const file = fileMap[kind];

  const [isUploading, setIsUploading] = useState(false);

  const handlePickAndUpload = useCallback(
    async function handlePickAndUpload() {
      try {
        const input = document.createElement("input");
        input.type = "file";
        input.accept =
          // kind ===
          "image/*,application/pdf,application/msword,application/json,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.doc,.docx,.xlsx,.pdf";
        input.onchange = async () => {
          if (input.files && input.files[0]) {
            setIsUploading(true);
            try {
              const result = await uploadFile(input.files[0], kind);
              onAdded(kind, result);
            } catch (e) {
              addToast({
                type: "error",
                message: e.message || t("complianceCheck.uploadFailed"),
              });
              console.log(e);
            } finally {
              setIsUploading(false);
            }
          }
        };
        input.click();
      } catch (e) {
        console.error(e);
        addToast({
          type: "error",
          message: e.message || t("complianceCheck.uploadFailed"),
        });
      }
    },
    [kind, onAdded, addToast, t]
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
              ? t("complianceCheck.uploading")
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
  {
    titleKey: "complianceCheck.uploadKindPlanning",
    kind: FileKind.CHILD_PLANNING,
    format: true,
  },
  {
    titleKey: "complianceCheck.uploadKindRegistratie",
    kind: FileKind.CHILD_REGISTRATION,
    format: true,
  },
  {
    titleKey: "complianceCheck.uploadPersoneelsPlanning",
    kind: FileKind.STAFF_PLANNING,
    format: true,
  },
  { titleKey: "complianceCheck.vgcList", kind: FileKind.VGC_LIST },
];

export default function ChecksPage() {
  const { addToast } = useToast();
  const { fileMap } = useChecks();
  const { t } = useI18n();

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
  const [progressCheckId, setProgressCheckId] = useState("");
  const [checkList, setCheckList] = useState([]);
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
      addToast({
        type: "warn",
        message: `${t(
          "complianceCheck.missingRequiredDocuments"
        )}: ${validation.missing.join(", ")}`,
      });
      return;
    }
    const modules = [];
    if (enableBkr) modules.push("bkr");
    if (enableVgc) modules.push("vgc");
    if (enableThreeHours) modules.push("threeHours");

    if (enableVgc && !fileMap[FileKind.VGC_LIST]) {
      addToast({
        type: "warn",
        message: t("complianceCheck.uploadVGCListToRun"),
      });
      return;
    }
    if (enableThreeHours && !fileMap[FileKind.CHILD_REGISTRATION]) {
      addToast({
        type: "warn",
        message: t("complianceCheck.uploadChildRegistrationToRun"),
      });
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
      setCheckList((prev) => [...prev, res]);
      setProgressResult(null);
      setProgressCheckId(res.check_id);
    } catch (e) {
      console.error(e);
      addToast({
        type: "error",
        message: e.message || t("complianceCheck.checkFailed"),
      });
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
        const result = await getCheckList();
        setCheckList(result);
      } catch (error) {
        addToast({
          type: "error",
          message: error.message.includes("Failed to fetch")
            ? t("complianceCheck.networkError")
            : `${t("complianceCheck.error")}: ${error.message}`,
        });
        console.log(error);
      }
    }

    getAllCheckIds();
  }, [addToast, t]);

  return (
    <div className="w-full flex flex-col gap-3 p-4  mx-auto">
      <div className="w-full flex flex-col gap-3 min-h-[50vh]">
        <h2 className="text-2xl font-bold">{t("complianceCheck.title")}</h2>
        <p className="my-4 text-gray-800">{t("complianceCheck.subtitle")}</p>

        <div className="flex gap-4 flex-col">
          <Checkbox
            label={t("complianceCheck.bkr")}
            checked={enableBkr}
            onChange={() => setEnableBkr((v) => !v)}
          />
          <Checkbox
            label={t("complianceCheck.vgc")}
            checked={enableVgc}
            onChange={() => setEnableVgc((v) => !v)}
          />
          <Checkbox
            label={t("complianceCheck.threeHours")}
            checked={enableThreeHours}
            onChange={() => setEnableThreeHours((v) => !v)}
          />
        </div>

        <p className="mt-6 text-gray-800">
          {t("complianceCheck.requiredDocuments")}
        </p>

        <div className="grid grid-cols-1 gap-2">
          {uploadSectionItems.map(
            (item, index) =>
              requiredVisibleKinds.includes(item.kind) && (
                <UploadSection
                  key={index}
                  title={t(item.titleKey)}
                  kind={item.kind}
                  format={item.format}
                />
              )
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-4 items-center">
            <DateInput
              title={t("complianceCheck.from")}
              date={checkDate}
              onChange={handleDateChange}
            />
            <DateInput
              title={t("complianceCheck.to")}
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
                  ? `${t(
                      "complianceCheck.missingRequiredDocuments"
                    )}: ${validation.missing.join(", ")}`
                  : undefined
              }
              variant={
                !validation.canStart || isStartingCheck ? "disabled" : "normal"
              }
            >
              {isStartingCheck
                ? t("complianceCheck.starting")
                : t("complianceCheck.startCheckButton")}
            </ComplianceCheckButton>
          </div>
        </div>
      </div>

      {checkList && Array.isArray(checkList) && checkList.length > 0 && (
        <div className="pt-3 flex flex-col gap-2">
          <strong>{t("complianceCheck.history")}</strong>
          <div className="flex gap-2 items-center flex-wrap">
            <CustomizedSelect
              options={checkList}
              value={progressCheckId}
              onChange={setProgressCheckId}
            />
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
