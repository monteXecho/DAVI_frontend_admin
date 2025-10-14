import React, { useRef, useState, useEffect, useCallback } from "react";

import Button from "../Button";
import { toLocaleDateString } from "../../helpers/date";
import {
  download2CSV,
  downloadBlob,
  downloadPDF,
} from "../../helpers/download";

export default function DownloadDropdownButton({ day, days, data }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClickCSV = useCallback(() => {
    const dData = data.find((item) => item.day === day);
    if (dData) {
      download2CSV(day, [dData]);
    } else {
      alert("Select date first");
    }
  }, [day, data]);

  const handleClickJSON = useCallback(() => {
    const dData = data.find((item) => item.day === day);
    if (dData) {
      const json = JSON.stringify(dData, null, 2);
      downloadBlob(json, "application/json;charset=utf-8", `${day}.json`);
    } else {
      alert("Select date first");
    }
  }, [day, data]);

  const handleClickPDF = useCallback(() => {
    const dData = data.find((item) => item.day === day);
    if (dData) {
      downloadPDF(day, [dData]);
    } else {
      alert("Select date first");
    }
  }, [day, data]);

  const handleClickCSVAll = useCallback(() => {
    const dayStr = days[0] + (days.length !== 1 && `_${days[days.length - 1]}`);
    download2CSV(dayStr, data);
  }, [days, data]);

  const handleClickJSONAll = useCallback(() => {
    const dayStr = days[0] + (days.length !== 1 && `_${days[days.length - 1]}`);
    const json = JSON.stringify(data, null, 2);
    downloadBlob(json, "application/json;charset=utf-8", `${dayStr}.json`);
  }, [days, data]);

  const handleClickPDFAll = useCallback(() => {
    const dayStr = days[0] + (days.length !== 1 && `_${days[days.length - 1]}`);
    downloadPDF(dayStr, data);
  }, [days, data]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <Button
        onClick={() => setOpen(!open)}
        className="inline-flex justify-center items-center text-sm !py-1"
        variant="normal"
      >
        Download
        <svg
          className={`ml-2 h-5 w-5 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Button>

      {open && (
        <div className="absolute right-0 w-40 bg-white rounded-md border shadow-lg ring-1 ring-black ring-opacity-5 z-10 animate-fade-in">
          <div className="py-1">
            {day && (
              <>
                <p className="block w-full text-right px-4 border-b text-xs text-gray-500">
                  Download {toLocaleDateString(day)}
                </p>
                <button
                  onClick={handleClickCSV}
                  className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                >
                  naar EXCEL
                </button>
                <button
                  onClick={handleClickJSON}
                  className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                >
                  naar JSON
                </button>
                <button
                  onClick={handleClickPDF}
                  className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                >
                  naar PDF
                </button>
              </>
            )}
            {days && days.length > 1 && (
              <>
                <p className="block w-full text-right px-4 border-b text-xs text-gray-500">
                  Alles downloaden
                </p>
                <button
                  onClick={handleClickCSVAll}
                  className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                >
                  naar EXCEL
                </button>
                <button
                  onClick={handleClickJSONAll}
                  className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                >
                  naar JSON
                </button>
                <button
                  onClick={handleClickPDFAll}
                  className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                >
                  naar PDF
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
