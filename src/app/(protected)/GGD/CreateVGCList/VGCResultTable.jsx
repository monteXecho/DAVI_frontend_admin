import DateItem from "../ComplianceCheck/components/DateItem";
import { useI18n } from "../contexts/i18n/I18nContext";

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleString();
}

function formatPercent(x) {
  if (x === null || x === undefined || Number.isNaN(Number(x))) return "-";
  return `${Math.round(Number(x) * 100)}%`;
}

export default function VGCResultTable({ data }) {
  const { t } = useI18n();

  if (!data || typeof data !== "object") {
    return <p>{t("common.noData")}</p>;
  }

  // Your example payload has the list under data.result.vgc_list.
  // But sometimes you might pass just `result` in. Support both.
  const root = data.result ? data : { result: data };
  const result = root.result || {};
  const vgcList = Array.isArray(result.vgc_list) ? result.vgc_list : [];

  const inputs = result.inputs || {};
  const status = root.status || {};
  const summary = root.summary || "";
  const updatedAt = root.updatedAt;

  if (!vgcList.length) {
    return <p>{t("common.noData")}</p>;
  }

  return (
    <div className="space-y-4">
      {/* Header / Summary */}
      <div className="border border-gray-200 rounded-md p-3 bg-white">
        <div className="font-semibold text-gray-800">
          {summary || t("common.result")}
        </div>
        <div className="text-sm text-gray-600 mt-1 flex flex-wrap gap-x-4 gap-y-1">
          <span>
            <b>{t("common.status") ?? "Status"}:</b> {status.message ?? "-"}
          </span>
          <span>
            <b>{t("common.progress") ?? "Progress"}:</b>{" "}
            {status.progress ?? "-"}%
          </span>
          <span>
            <b>{t("common.updatedAt") ?? "Updated"}:</b> {formatDate(updatedAt)}
          </span>
        </div>

        {/* Inputs */}
        <div className="mt-3 grid md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
          <div className="bg-gray-50 border border-gray-200 rounded p-2">
            <div className="text-gray-500">
              {t("vgc.staffPlanningRows") ?? "Staff planning rows"}
            </div>
            <div className="font-medium">
              {inputs.staff_planning_rows ?? "-"}
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded p-2">
            <div className="text-gray-500">
              {t("vgc.childPlanningChildren") ?? "Child planning children"}
            </div>
            <div className="font-medium">
              {inputs.child_planning_children ?? "-"}
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded p-2">
            <div className="text-gray-500">
              {t("vgc.childPlanningDays") ?? "Child planning days"}
            </div>
            <div className="font-medium">
              {inputs.child_planning_days ?? "-"}
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded p-2">
            <div className="text-gray-500">
              {t("vgc.childRegistrationDays") ?? "Child registration days"}
            </div>
            <div className="font-medium">
              {inputs.child_registration_days ?? "-"}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-w-[400px] lg:max-w-[900px]">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-green-100">
            <tr>
              <th className="border border-gray-300 bg-green-100 text-green-700 text-sm px-4 py-2 text-left">
                {t("common.child") ?? "Child"}
              </th>
              <th className="border border-gray-300 bg-green-100 text-green-700 text-sm px-4 py-2 text-left">
                {t("common.age") ?? "Age"}
              </th>
              <th className="border border-gray-300 bg-green-100 text-green-700 text-sm px-4 py-2 text-left">
                {t("vgc.daysPresent") ?? "Days present"}
              </th>
              <th className="border border-gray-300 bg-green-100 text-green-700 text-sm px-4 py-2 text-left">
                {t("common.personnel") ?? "Personnel"}
              </th>
              <th className="border border-gray-300 bg-green-100 text-green-700 text-sm px-4 py-2 text-left">
                {t("vgc.overlapDays") ?? "Overlap days"}
              </th>
              <th className="border border-gray-300 bg-green-100 text-green-700 text-sm px-4 py-2 text-left">
                {t("vgc.overlapMinutes") ?? "Overlap minutes"}
              </th>
              <th className="border border-gray-300 bg-green-100 text-green-700 text-sm px-4 py-2 text-left">
                {t("vgc.coverage") ?? "Coverage"}
              </th>
            </tr>
          </thead>

          <tbody>
            {vgcList.map((row, idx) => {
              const fixedFaces = Array.isArray(row.fixed_faces)
                ? row.fixed_faces
                : [];

              const baseClass = idx % 2 === 0 ? "bg-white" : "bg-gray-50";

              // Show multiple staff rows per child.
              // If no staff matches, show one empty row.
              const staffRows = fixedFaces.length ? fixedFaces : [{}];

              return staffRows.map((ff, ffIdx) => (
                <tr key={`${idx}-${ffIdx}`} className={baseClass}>
                  {/* Only show child/age/days on first staff row (rowSpan) */}
                  {ffIdx === 0 && (
                    <>
                      <td
                        className="border border-gray-300 px-4 py-2 font-medium"
                        rowSpan={staffRows.length}
                      >
                        {row.child ?? "-"}
                      </td>
                      <td
                        className="border border-gray-300 px-4 py-2"
                        rowSpan={staffRows.length}
                      >
                        {row.age ?? "-"}
                      </td>
                      <td
                        className="border border-gray-300 px-4 py-2"
                        rowSpan={staffRows.length}
                      >
                        {row.child_days_present &&
                        Array.isArray(row.child_days_present)
                          ? row.child_days_present.map((item, index) => (
                              <DateItem key={index} date={item} />
                            ))
                          : "-"}
                      </td>
                    </>
                  )}

                  <td className="border border-gray-300 px-4 py-2">
                    {ff.staff ?? "-"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {ff.overlap_days && Array.isArray(ff.overlap_days)
                      ? ff.overlap_days.map((item, index) => (
                          <div className="text-nowrap" key={index}>
                            <DateItem key={index} date={item} />
                          </div>
                        ))
                      : "-"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {ff.overlap_minutes ?? "-"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {formatPercent(ff.coverage)}
                  </td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
