import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function downloadBlob(content, mime, filename) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), {
    href: url,
    download: filename,
  });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function collectColumns(allDays) {
  const cols = [];
  for (const d of allDays) {
    for (const row of d.slices || []) {
      Object.keys(row).forEach((k) => {
        if (!cols.includes(k)) cols.push(k);
      });
    }
  }
  return cols;
}

function normalizeRows(rows, columns) {
  return rows.map((r) => {
    const obj = {};
    columns.forEach((c) => {
      let v = r[c];
      if (Array.isArray(v)) v = v.join(", ");
      else if (v && typeof v === "object") v = JSON.stringify(v);
      obj[c] = v == null ? "" : v;
    });
    return obj;
  });
}

function safeSheetName(name) {
  return (name || "Sheet").replace(/[\\\/\?\*\:\[\]]/g, "_").slice(0, 31);
}

export const download2CSV = (dateStr, data) => {
  if (!Array.isArray(data) || data.length === 0) {
    alert("No data");
    return;
  }

  const allDays = data.filter(
    (d) => d && d.day && Array.isArray(d.slices) && d.slices.length
  );

  if (!allDays.length) {
    alert("No day slices to export");
    return;
  }

  const columns = collectColumns(allDays);
  const wb = XLSX.utils.book_new();

  allDays.forEach((d) => {
    const rows = normalizeRows(d.slices, columns);
    const ws = XLSX.utils.json_to_sheet(rows, { header: columns });
    XLSX.utils.book_append_sheet(wb, ws, safeSheetName(d.day));
  });

  const filename = `${dateStr}.xlsx`;
  XLSX.writeFile(wb, filename);
};

export const downloadPDF = (dateStr, data) => {
  if (!Array.isArray(data) || data.length === 0) {
    alert("No data to export");
    return;
  }

  const days = data.filter(
    (d) => d && d.day && Array.isArray(d.slices) && d.slices.length
  );
  if (!days.length) {
    alert("No day slices to export");
    return;
  }

  // Build a unified column set so all tables align
  const columns = days.reduce((acc, d) => {
    d.slices.forEach((row) => {
      Object.keys(row).forEach((k) => {
        if (!acc.includes(k)) acc.push(k);
      });
    });
    return acc;
  }, []);

  const formatCell = (v) => {
    if (v == null) return "";
    if (Array.isArray(v)) return v.join(", ");
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  };

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;

  days.forEach((d, idx) => {
    if (idx > 0) doc.addPage(); // new page per day prevents overlap

    const title = `Compliance check ${d.day}`;
    doc.setFontSize(14);
    doc.text(title, margin, margin);

    const body = d.slices.map((r) => columns.map((c) => formatCell(r[c])));

    autoTable(doc, {
      startY: margin + 10,
      head: [columns],
      body,
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [66, 66, 66], textColor: 255 },
      margin: { left: margin, right: margin },
      tableWidth: "auto",
      pageBreak: "auto",
    });

    // If you need the Y position after the table, read it from doc.lastAutoTable:
    // const finalY = doc.lastAutoTable?.finalY ?? (margin + 10);
    // (Not needed when you add a new page per day.)
  });

  doc.save(`${dateStr}.pdf`);
};
