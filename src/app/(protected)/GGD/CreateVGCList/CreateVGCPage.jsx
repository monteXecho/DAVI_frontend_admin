import { memo, useCallback, useMemo, useState, useEffect } from "react";
import { useToast } from "../ComplianceCheck/contexts/ToastContext";
import { useChecks } from "../ComplianceCheck/contexts/ChecksContext";
import { useI18n } from "../contexts/i18n/I18nContext";
import {
  FileKind,
  uploadFile,
  startCreatingVGCList,
  getCheckVGCCreatingProgress,
  getCheckVGCCreatingList,
} from "../ComplianceCheck/services/api";
import FileUploadCard from "../ComplianceCheck/components/FileUploadCard";
import ComplianceCheckButton from "../ComplianceCheck/components/ComplianceCheckButton";
import VGCProgressBar from "./components/VGCProgressBar";
import Button from "../ComplianceCheck/components/Button";
import VGCResultTable from "./VGCResultTable";
import {
  downloadJSON,
  downloadExcel,
  downloadDOC,
  downloadTextFile,
} from "./utils/download";

const UploadSection = memo(function UploadSection({ title, kind }) {
  const { addToast } = useToast();
  const { fileMap, onAdded } = useChecks();
  const { t } = useI18n();
  const [isUploading, setIsUploading] = useState(false);

  const file = fileMap[kind];

  const handlePickAndUpload = useCallback(
    async function handlePickAndUpload() {
      try {
        const input = document.createElement("input");
        input.type = "file";
        input.accept =
          "image/*,application/pdf,application/msword,application/json,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.doc,.docx,.xlsx,.pdf";
        // "image/*,application/pdf";
        input.onchange = async () => {
          if (input.files && input.files[0]) {
            setIsUploading(true);
            try {
              const result = await uploadFile(input.files[0], kind);
              onAdded(kind, result);
              addToast({
                type: "success",
                message: t("createVGCList.fileUploaded"),
              });
            } catch (e) {
              addToast({
                type: "error",
                message: e.message || t("createVGCList.uploadFailed"),
              });
            } finally {
              setIsUploading(false);
            }
          }
        };
        input.click();
      } catch (e) {
        addToast({
          type: "error",
          message: e.message || t("createVGCList.uploadFailed"),
        });
      }
    },
    [kind, onAdded, addToast, t],
  );

  return (
    <FileUploadCard kind={kind}>
      <ComplianceCheckButton
        onClick={handlePickAndUpload}
        disabled={isUploading}
        variant={isUploading ? "uploading" : file ? "uploaded" : "normal"}
      >
        {isUploading
          ? t("createVGCList.uploading")
          : file
            ? t("createVGCList.fileUploaded")
            : title}
      </ComplianceCheckButton>
    </FileUploadCard>
  );
});

const uploadSectionItems = [
  {
    titleKey: "createVGCList.uploadKindPlanning",
    kind: FileKind.CHILD_PLANNING,
  },
  {
    titleKey: "createVGCList.uploadKindRegistratie",
    kind: FileKind.CHILD_REGISTRATION,
  },
  {
    titleKey: "createVGCList.uploadPersoneelsPlanning",
    kind: FileKind.STAFF_PLANNING,
  },
];

export default function CreateVGCPage() {
  const { addToast } = useToast();
  const { fileMap } = useChecks();
  const { t } = useI18n();

  const [isCreating, setIsCreating] = useState(false);
  const [progressCheckId, setProgressCheckId] = useState("");
  const [progressResult, setProgressResult] = useState(null);
  const [vgcResult, setVgcResult] = useState(null);
  const [checkList, setCheckList] = useState([]);

  const validation = useMemo(() => {
    const hasStaff = fileMap[FileKind.STAFF_PLANNING];
    const hasChildPlan = fileMap[FileKind.CHILD_PLANNING];
    const hasReg = fileMap[FileKind.CHILD_REGISTRATION];

    const missing = [];
    if (!hasStaff) missing.push("personeelsplanning");
    if (!hasChildPlan) missing.push("kindplanning");
    if (!hasReg) missing.push("kindregistratie");

    return {
      hasStaff,
      hasChildPlan,
      hasReg,
      missing,
      canStart: hasStaff && hasChildPlan && hasReg,
    };
  }, [fileMap]);

  async function handleStartCreating() {
    if (!validation.canStart) {
      addToast({
        type: "error",
        message: `${t(
          "createVGCList.missingDocuments",
        )}: ${validation.missing.join(", ")}`,
      });
      return;
    }

    const documentKeys = [
      fileMap[FileKind.STAFF_PLANNING],
      fileMap[FileKind.CHILD_PLANNING],
      fileMap[FileKind.CHILD_REGISTRATION],
    ].filter(Boolean);

    try {
      setIsCreating(true);
      const source = "flexkids";
      const group = "";
      const res = await startCreatingVGCList({
        documentKeys,
        source,
        group,
      });
      setProgressResult(null);
      setVgcResult(null);
      setProgressCheckId(res.check_id);
      setCheckList((prev) => [
        ...prev,
        { check_id: res.check_id, updatedAt: new Date() },
      ]);
    } catch (e) {
      console.error(e);
      addToast({
        type: "error",
        message: e.message || t("createVGCList.creatingFailed"),
      });
    } finally {
      setIsCreating(false);
    }
  }

  function handleProgressComplete(res) {
    setProgressResult(res);
    if (res.result) {
      setVgcResult(res);
    }
  }

  async function handleGetProgress() {
    if (!progressCheckId) {
      addToast({
        type: "error",
        message: t("createVGCList.enterCheckId"),
      });
      return;
    }
    try {
      const res = await getCheckVGCCreatingProgress(progressCheckId);
      setProgressResult(res);
      if (res.status?.message === "completed" && res.result) {
        setVgcResult(res);
      }
    } catch (e) {
      console.error(e);
      addToast({
        type: "error",
        message: e.message || t("createVGCList.getProgressFailed"),
      });
    }
  }

  const handleDownloadJSON = () => {
    if (vgcResult) {
      try {
        const data = vgcResult.result.vgc_list.map(
          ({ child, fixed_faces }) => ({
            [child]: fixed_faces.map(({ staff }) => staff),
          }),
        );
        downloadJSON(data, "vgc-list.json");
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleDownloadExcel = () => {
    if (vgcResult) {
      try {
        const data = vgcResult.result.vgc_list.map(({ child, fixed_faces }) => [
          child,
          fixed_faces.map(({ staff }) => staff),
        ]);
        downloadExcel(data, "vgc-list.xlsx");
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleDownloadText = () => {
    if (vgcResult) {
      try {
        const data = vgcResult.result.vgc_list.map(({ child, fixed_faces }) => [
          child,
          fixed_faces.map(({ staff }) => staff),
        ]);
        downloadTextFile(data, "vgc-list.txt");
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    async function getAllCheckIds() {
      try {
        const result = await getCheckVGCCreatingList();
        setCheckList(
          (result || []).map(({ check_id, updatedAt }) => ({
            check_id,
            updatedAt,
          })),
        );
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
    <div className="w-full flex flex-col gap-3 p-4 mx-auto">
      <div className="w-full flex flex-col gap-3 min-h-[50vh]">
        <h2 className="text-2xl font-bold">{t("createVGCList.title")}</h2>
        <p className="my-4 text-gray-800">{t("createVGCList.subtitle")}</p>

        <div className="flex gap-4 flex-col">
          {uploadSectionItems.map((item, index) => (
            <UploadSection
              key={index}
              title={t(item.titleKey)}
              kind={item.kind}
            />
          ))}
        </div>

        <div className="flex gap-2 items-center mt-4">
          <Button
            onClick={handleStartCreating}
            disabled={!validation.canStart || isCreating}
            variant="normal"
            title={
              !validation.canStart && validation.missing.length
                ? `${t(
                    "createVGCList.missingDocuments",
                  )}: ${validation.missing.join(", ")}`
                : undefined
            }
          >
            {isCreating
              ? t("createVGCList.creating")
              : t("createVGCList.createVGCList")}
          </Button>
        </div>

        {progressCheckId && (
          <VGCProgressBar
            checkId={progressCheckId}
            onComplete={handleProgressComplete}
          />
        )}

        <div className="border-t border-gray-200 pt-3 flex flex-col gap-2 mt-4">
          <strong>{t("createVGCList.checkProgress")}</strong>

          <div className="flex gap-2 items-center flex-wrap">
            <select
              value={progressCheckId}
              onChange={(e) => setProgressCheckId(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md min-w-[260px]"
            >
              <option value="" disabled>
                {t("createVGCList.selectCheckId")}
              </option>

              {checkList &&
                Array.isArray(checkList) &&
                checkList.length > 0 &&
                checkList.map((item, idx) => {
                  // supports either: string IDs OR objects like { id, label }
                  const id =
                    typeof item === "string" ? item : (item?.check_id ?? "");
                  const label =
                    typeof item === "string"
                      ? item
                      : (item?.updatedAt ?? `#${idx + 1}`);

                  if (!id || !label) return null;

                  return (
                    <option key={id} value={id}>
                      {new Date(label).toLocaleString()} {id.substring(0, 5)}...
                      {id.substring(id.length - 5)}
                    </option>
                  );
                })}
            </select>

            <Button
              onClick={handleGetProgress}
              variant="secondary"
              disabled={!progressCheckId}
            >
              {t("createVGCList.getProgress")}
            </Button>
          </div>
        </div>

        {vgcResult && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                {t("createVGCList.vgcResultTitle")}
              </h3>
              <div className="flex gap-2">
                <Button
                  onClick={handleDownloadJSON}
                  variant="secondary"
                  icon="download"
                >
                  {t("createVGCList.downloadJSON")}
                </Button>
                <Button
                  onClick={handleDownloadExcel}
                  variant="secondary"
                  icon="download"
                >
                  {t("createVGCList.downloadExcel")}
                </Button>
                <Button
                  onClick={handleDownloadText}
                  variant="secondary"
                  icon="download"
                >
                  {t("createVGCList.downloadTXT")}
                </Button>
              </div>
            </div>
            <VGCResultTable data={vgcResult} />
          </div>
        )}
      </div>
    </div>
  );
}
