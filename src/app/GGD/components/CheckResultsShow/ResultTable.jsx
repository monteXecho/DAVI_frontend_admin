import { useCallback, useEffect, useState } from "react";
import { toLocaleDateString } from "../../helpers/date";
import DownloadDropdownButton from "./DownloadDropdownButton";

export default function ResultTable({ days, resultData, modules }) {
  const [selectedDate, setSelectedDate] = useState("");

  const handleSelectDate = useCallback(({ target: { value } }) => {
    setSelectedDate(value);
  }, []);

  const checkVGC = modules.includes("vgc");
  const checkThreeHours = modules.includes("threeHours");

  useEffect(() => {
    setSelectedDate(days[0]);
  }, [days]);

  if (!resultData || resultData.length === 0 || !resultData[0].slices)
    return <></>;

  return (
    <>
      <div className="flex justify-between items-end mb-2">
        <div>
          <select
            className="border-b px-2"
            value={selectedDate}
            onChange={handleSelectDate}
          >
            <option value={""}></option>
            {days &&
              days.length > 0 &&
              days.map((item, index) => (
                <option key={index} value={item}>
                  {toLocaleDateString(item)}
                </option>
              ))}
          </select>
        </div>
        <DownloadDropdownButton
          data={resultData}
          day={selectedDate}
          days={days}
        />
      </div>
      <div className="overflow-x-auto h-[60vh] max-h-[60vh] overflow-y-scroll border">
        <table className="min-w-full border border-gray-300 rounded">
          <thead className="bg-green-100">
            <tr>
              <th className="sticky top-0 z-0 border border-greeb-300 bg-green-100 text-green-700 px-3 py-2 text-left">
                From
              </th>
              <th className="sticky top-0 z-0 border border-greeb-300 bg-green-100 text-green-700 px-3 py-2 text-left">
                To
              </th>
              <th className="sticky top-0 z-0 border border-greeb-300 bg-green-100 text-green-700 px-3 py-2 text-center">
                Children
              </th>
              <th className="sticky top-0 z-0 border border-greeb-300 bg-green-100 text-green-700 px-3 py-2 text-center">
                Required Staff
              </th>
              <th className="sticky top-0 z-0 border border-greeb-300 bg-green-100 text-green-700 px-3 py-2 text-center">
                Staff
              </th>
              <th className="sticky top-0 z-0 border border-greeb-300 bg-green-100 text-green-700 px-3 py-2 text-center">
                BKR
              </th>
              {checkVGC && (
                <th className="sticky top-0 z-0 border border-greeb-300 bg-green-100 text-green-700 px-3 py-2 text-center">
                  VGC
                </th>
              )}
              {checkThreeHours && (
                <th className="sticky top-0 z-0 border border-greeb-300 bg-green-100 text-green-700 px-3 py-2 text-center">
                  3-UURS
                </th>
              )}
              <th className="sticky top-0 z-0 border border-greeb-300 bg-green-100 text-green-700 px-3 py-2 text-left">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {resultData
              .find((item) => item.day === selectedDate)
              ?.slices.map((slice, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="border border-gray-300 px-3 py-1">
                    {slice["From Time"]}
                  </td>
                  <td className="border border-gray-300 px-3 py-1">
                    {slice["To Time"]}
                  </td>
                  <td className="border border-gray-300 px-3 py-1 text-center">
                    {slice["#Children"]}
                  </td>
                  <td className="border border-gray-300 px-3 py-1 text-center">
                    {slice["RequiredStaff"]}
                  </td>
                  <td className="border border-gray-300 px-3 py-1 text-center">
                    {slice["#Staff"]}
                  </td>
                  <td className="border border-gray-300 px-3 py-1 text-center">
                    {slice["BKR"]}
                  </td>
                  {checkVGC && (
                    <td className="border border-gray-300 px-3 py-1 text-center">
                      {slice["VGC"]}
                    </td>
                  )}
                  {checkThreeHours && (
                    <td className="border border-gray-300 px-3 py-1 text-center">
                      {slice["3-UURS"]}
                    </td>
                  )}
                  <td className="border border-gray-300 px-3 py-1">
                    {slice.Details.map((item, index) => (
                      <p key={index}>{item}</p>
                    ))}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
