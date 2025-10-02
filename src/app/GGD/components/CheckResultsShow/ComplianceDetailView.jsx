import { toLocaleDateString } from "../../helpers/date";
import Icon from "../Icon";

function toMin(t) {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function minToStr(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}
function mergeFailRanges(slices, key /* "BKR" | "VGC" */) {
  const failing = (slices || []).filter((s) => s && s[key] === "No");
  if (!failing.length) return { ranges: [], totalFailMins: 0, slots: 0 };

  failing.sort((a, b) => toMin(a["From Time"]) - toMin(b["From Time"]));
  const merged = [];
  let total = 0;

  for (const s of failing) {
    const a = toMin(s["From Time"]);
    const b = toMin(s["To Time"]);
    total += b - a;

    if (!merged.length) {
      merged.push([a, b]);
      continue;
    }
    const last = merged[merged.length - 1];
    if (a === last[1]) last[1] = b; // contiguous -> extend
    else merged.push([a, b]);
  }

  const ranges = merged.map(([a, b]) => ({
    text: `${minToStr(a)}-${minToStr(b)}`,
    durMins: b - a,
  }));
  return { ranges, totalFailMins: total, slots: failing.length };
}
function countPassedBKR(slices) {
  return (slices || []).filter((s) => s && s.BKR === "Pass").length;
}
function minutesToHoursStr(mins) {
  const hours = mins / 60;
  // show with 1 decimal if needed
  return (Math.round(hours * 10) / 10).toFixed(hours % 1 === 0 ? 0 : 1);
}
function countUnknownVgc(slices) {
  return (slices || []).filter((s) => s && s.VGC === "Unknown").length;
}
function recommendStaffFromDetails(slices) {
  const counts = new Map();
  for (const s of slices || []) {
    for (const line of s.Details || []) {
      // "VGC failed: A, B for Child X"
      const m = line.match(/^VGC failed:\s*(.+?)\s+for\s+/i);
      if (!m) continue;
      const namesPart = m[1];
      const names = namesPart
        .split(/[,;&]/)
        .map((x) => x.trim())
        .filter(Boolean);
      for (const nm of names) counts.set(nm, (counts.get(nm) || 0) + 1);
    }
  }
  if (!counts.size) return null;
  let best = null,
    bestCnt = -1;
  for (const [name, cnt] of counts.entries()) {
    if (cnt > bestCnt) {
      best = name;
      bestCnt = cnt;
    }
  }
  return best;
}

export default function ComplianceDetailView({
  checkResult,
  modules,
  groupName, // optional: "Dolfijntjes"
  groupType = "Group", // optional: "Baby Group"
  showUnknownNote = true, // show note about Unknown slots for VGC
}) {
  const dateStr = checkResult?.day || "";
  const slices = checkResult?.slices || [];
  const three = checkResult?.three_uurs_summary || [];

  const checkVGC = modules.includes("vgc");
  const checkThreeHours = modules.includes("threeHours");

  const groupLabel = groupName ? `${groupType} "${groupName}"` : groupType;

  // Module computations
  const bkr = mergeFailRanges(slices, "BKR");
  const vgc = mergeFailRanges(slices, "VGC");
  const bkrPassSlots = countPassedBKR(slices);
  const emptyDay = slices.length === bkrPassSlots;
  const vgcUnknownSlots = countUnknownVgc(slices);
  const vgcRec = recommendStaffFromDetails(slices);

  // 3-UURS block straight from summary
  const threeFlag = three["3-UURS"];
  const threeReason = three.Reason;
  const threeDevs = Array.isArray(three.Deviations) ? three.Deviations : [];

  return (
    <div
      style={{ fontFamily: "system-ui, sans-serif", lineHeight: 1.6 }}
      className="border rounded shadow-lg p-2 flex flex-col gap-2"
    >
      <div className="font-bold mb-2 pl-2 border-b">
        {toLocaleDateString(dateStr)} — {groupLabel}
      </div>

      {/* BKR */}
      <section>
        <div className="font-bold pl-2">BKR</div>
        {emptyDay ? (
          <div className="flex items-center gap-1">
            <Icon size={14} name="yellowRoundWarning" /> No child present.
          </div>
        ) : bkr.ranges.length ? (
          <>
            {bkr.ranges.map((r, i) => (
              <div key={`bkr-range-${i}`} className="flex items-center gap-1">
                <Icon size={14} name="redRoundWarning" /> {r.text}
              </div>
            ))}
            <div className="text-gray-700 text-sm my-2">
              {`BKR failed in ${bkr.slots} slot${
                bkr.slots !== 1 ? "s" : ""
              } (${minutesToHoursStr(bkr.totalFailMins)} ${
                bkr.totalFailMins === 60 ? "hour" : "hours"
              } total).`}{" "}
              The 3-hours allowance is evaluated separately below.
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1">
            <Icon size={14} name="greenRoundCheck" /> All slots compliant.
          </div>
        )}
      </section>

      {/* VGC */}
      {checkVGC && (
        <section>
          <div className="font-bold pl-2">VGC</div>
          {emptyDay ? (
            <div className="flex items-center gap-1">
              <Icon size={14} name="yellowRoundWarning" /> No child present.
            </div>
          ) : vgc.ranges.length ? (
            <>
              {vgc.ranges.map((r, i) => (
                <div key={`vgc-range-${i}`} className="flex items-center gap-1">
                  <Icon size={14} name="redRoundWarning" /> {r.text}
                </div>
              ))}
              <div className="text-gray-700 text-sm my-2">
                {`VGC not met in ${vgc.slots} slot${
                  vgc.slots !== 1 ? "s" : ""
                } (${minutesToHoursStr(vgc.totalFailMins)} ${
                  vgc.totalFailMins === 60 ? "hour" : "hours"
                } total).`}
                {vgcRec
                  ? ` Recommendation: try scheduling staff member ${vgcRec}.`
                  : ""}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1">
              <Icon size={14} name="greenRoundCheck" /> All slots compliant.
            </div>
          )}
          {showUnknownNote && vgcUnknownSlots > 0 ? (
            <div className="text-xs text-gray-500">
              {`${vgcUnknownSlots} slot${
                vgcUnknownSlots !== 1 ? "s were" : " was"
              } marked as "Unknown" and not counted in VGC results (likely outside staffed windows or missing data).`}
            </div>
          ) : null}
        </section>
      )}

      {/* 3-UURS */}
      {checkThreeHours && (
        <section>
          <div className="font-bold pl-2">3-UURS</div>
          {emptyDay ? (
            <div className="flex items-center gap-1">
              <Icon size={14} name="yellowRoundWarning" /> No child present.
            </div>
          ) : (
            <>
              {threeFlag && (
                <div>
                  {threeFlag === "Yes" ? (
                    <Icon size={14} name="greenRoundCheck" />
                  ) : (
                    <Icon size={14} name="redRoundWarning" />
                  )}
                </div>
              )}
              {threeReason ? <div className="mt-1">{threeReason}</div> : null}
              {threeDevs.length ? (
                <ul>
                  {threeDevs.map((d, i) => (
                    <li key={`dev-${i}`}>{d}</li>
                  ))}
                </ul>
              ) : null}
            </>
          )}
        </section>
      )}
    </div>
  );
}
