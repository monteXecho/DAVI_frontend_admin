import { useEffect, useRef } from "react";
import { toLocaleDateString } from "../helpers/date";
import ComplianceDetailView from "./CheckResultsShow/ComplianceDetailView";
import FoldableDetailView from "./CheckResultsShow/FoldableDetailView";
import ResultTable from "./CheckResultsShow/ResultTable";

const CheckResults = ({ data }) => {
  const bottomRef = useRef(null);

  const days = data.date;
  const modules = data.modules;
  const resultData = data.result;
  const groupName = data.group;

  function goBottom() {
    if (bottomRef && bottomRef.current) {
      bottomRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
      bottomRef.current.focus();
    }
  }

  useEffect(() => {
    goBottom();
  }, [data]);

  return (
    <>
      <div className="py-6 space-y-6 max-w-7xl">
        <div className="flex items-end gap-2">
          <span className="text-lg">Resultaten</span>
          {days && days.length > 0 && (
            <span className="text-2xl font-semibold">
              {toLocaleDateString(days[0])}
              {days.length !== 1 &&
                `~${toLocaleDateString(days[days.length - 1])}`}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto py-2">
          {resultData && resultData.length > 0 ? (
            resultData.map((item, index) => (
              <ComplianceDetailView
                key={index}
                checkResult={item}
                modules={modules}
                groupName={groupName}
                bkrDailyLimitHours={3}
              />
            ))
          ) : (
            <p>Geen gegevens beschikbaar</p>
          )}
        </div>

        <FoldableDetailView goBottom={goBottom}>
          <div className="flex flex-col gap-2 mb-4">
            <h3 className="font-semibold text-lg">Samenvatting</h3>
            <p>{data.summary}</p>
            {days && days.length > 0 && (
              <span className="">
                {toLocaleDateString(days[0])}
                {days.length !== 1 &&
                  `~${toLocaleDateString(days[days.length - 1])}`}
              </span>
            )}
            <div>
              <p>Bestanden</p>
              {data.references.flat().map((item, index) => (
                <p key={index} className="pl-2 text-sm">
                  {item.substring(9)}
                </p>
              ))}
            </div>
          </div>

          <ResultTable resultData={resultData} modules={modules} days={days} />
        </FoldableDetailView>

        <div ref={bottomRef} />
      </div>
    </>
  );
};

export default CheckResults;
