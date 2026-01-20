import * as XLSX from "xlsx";

export function downloadJSON(data, filename = "vgc_pairs.json") {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadExcel(data, filename = "vgc_pairs.xlsx") {
  // Data is: { [childName]: string[] staffNames }
  const rows = [["Child", "Personnel"]];

  (data || []).forEach(([child, staffList]) => {
    const staffText = Array.isArray(staffList)
      ? staffList.join("&")
      : String(staffList ?? "");
    rows.push([child, staffText]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // (Optional) Make columns wider for readability
  ws["!cols"] = [{ wch: 28 }, { wch: 45 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "VGC Pairs");
  XLSX.writeFile(wb, filename);
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function downloadDOC(data, filename = "vgc_pairs.doc") {
  // Word can open HTML saved as .doc (more reliable than .docx without a docx library)
  let html = `
    <html>
      <head>
        <meta charset="utf-8">
        <title>VGC Lijst</title>
      </head>
      <body>
        <h1>VGC Lijst</h1>
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr style="background-color: #23BD92; color: white;">
              <th>Kind</th>
              <th>Personeel</th>
            </tr>
          </thead>
          <tbody>
  `;

  (data || []).forEach(([child, staffList]) => {
    const staffText = Array.isArray(staffList)
      ? staffList.join(", ")
      : String(staffList ?? "");
    html += `
      <tr>
        <td>${escapeHtml(child)}</td>
        <td>${escapeHtml(staffText)}</td>
      </tr>
    `;
  });

  html += `
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadTextFile(data, filename = "vgc_pairs.txt") {
  // Build rows: header + data
  const rows = [["Child", "Personnel"]];

  (data || []).forEach(([child, staffList]) => {
    const staffText = Array.isArray(staffList)
      ? staffList.join("&")
      : String(staffList ?? "");
    rows.push([String(child ?? ""), staffText]);
  });

  // Convert to plain text (TSV). Each row = new line, columns separated by tab.
  // Also quote/escape tabs/newlines just in case.
  const escapeCell = (v) =>
    String(v ?? "")
      .replaceAll("\t", " ")
      .replaceAll("\r\n", "\n")
      .replaceAll("\r", "\n")
      .replaceAll("\n", " ");

  const text = rows.map((r) => r.map(escapeCell).join("\t")).join("\n");

  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
