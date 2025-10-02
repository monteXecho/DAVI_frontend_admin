export default function SummaryView ({ result, modules }) {
  if (!result || result.length < 2) return <></>;
  const checkVGC = modules.includes("vgc");
  const checkThreeHours = modules.includes("threeHours");

  const resultData = result[1];
  const slices = resultData.slices || [];
  const summary = resultData.three_uurs_summary || {};

  // Calculate BKR and VGC summaries
  const bkrSummary = slices.reduce(
    (acc, slice) => {
      if (slice.BKR === "Yes") acc.yes++;
      else if (slice.BKR === "No") acc.no++;
      return acc;
    },
    { yes: 0, no: 0 }
  );

  const vgcSummary = checkVGC
    ? slices.reduce(
        (acc, slice) => {
          if (slice.VGC === "Yes") acc.yes++;
          else if (slice.VGC === "No") acc.no++;
          return acc;
        },
        { yes: 0, no: 0 }
      )
    : null;

  return (
    <>
      <p>
        <strong>BKR:</strong> Yes ({bkrSummary.yes}), No ({bkrSummary.no})
      </p>
      {checkVGC && (
        <p>
          <strong>VGC:</strong> Yes ({vgcSummary.yes}), No ({vgcSummary.no})
        </p>
      )}
      {checkThreeHours && (
        <p>
          <strong>3-UURS:</strong> {summary["3-UURS"] || "N/A"}
        </p>
      )}
      {summary.Reason && (
        <p>
          <strong>Reason:</strong> {summary.Reason}
        </p>
      )}
      {summary.Deviations && summary.Deviations.length > 0 && (
        <div>
          <strong>Deviations:</strong>
          <ul className="list-disc list-inside ml-4">
            {summary.Deviations.map((dev, i) => (
              <li key={i}>{dev}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};
