import React, { useEffect, useRef, useState } from "react";
import { getCheckProgress } from "../services/api";
import { useI18n } from "../../contexts/i18n/I18nContext";
import clsx from "clsx";

export default function ProgressBarPolling({
  checkId,
  intervalMs = 3000,
  className = "",
  onComplete,
}) {
  const { t } = useI18n();
  const [data, setData] = useState({
    status: t("progress.beginning"),
    progress: 0,
  });
  const timeoutRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const fetchStatus = async () => {
      // cancel any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      let isDone = false;

      try {
        const res = await getCheckProgress(checkId);
        setData({ status: res.status.message, progress: res.status.progress });
        if (res.status.message === "completed") {
          isDone = true;
          onComplete(res);
        }
      } catch (err) {
        console.log(err);
      } finally {
        if (mounted && !isDone) {
          timeoutRef.current = window.setTimeout(fetchStatus, intervalMs);
        }
      }
    };

    fetchStatus();

    return () => {
      mounted = false;
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      abortRef.current?.abort();
    };
  }, [checkId, intervalMs]);

  const pct = typeof data.progress === "number" ? Math.round(data.progress) : 0;

  return data.status === "completed" ? (
    <></>
  ) : (
    <div className={clsx("space-y-2 w-full", className)} aria-live="polite">
      <div className="text-sm font-medium text-gray-800 capitalize">
        {data.status ?? t("progress.processing")}
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Voortgang"
        className="relative h-2 w-full rounded-full bg-gray-200 overflow-hidden"
      >
        <div
          className={clsx(
            "h-full rounded-full bg-blue-600 transition-all duration-500 ease-out",
            pct === 100 && "bg-green-600"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
