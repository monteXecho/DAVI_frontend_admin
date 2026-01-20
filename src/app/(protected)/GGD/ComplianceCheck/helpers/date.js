export const formatDate = (dateString) => {
  if (!dateString) return "";

  let dateObj;

  if (dateString instanceof Date) {
    dateObj = dateString;
  } else {
    const normalized = dateString.replace(/\./g, "-").replace(/\//g, "-");

    const parts = normalized.split("-");
    if (parts.length === 3 && parts[0].length === 2 && parts[2].length === 4) {
      dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    } else {
      dateObj = new Date(normalized);
    }
  }

  if (isNaN(dateObj)) return "";

  let day = dateObj.getDate();
  let month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();

  day = day < 10 ? "0" + day : day;
  month = month < 10 ? "0" + month : month;

  return `${day}-${month}-${year}`;
};

export function datesBetween(from, to) {
  if (!from && !to) return [];
  if (!from) from = to;
  if (!to) to = from;
  const a = new Date(from);
  const b = new Date(to);
  if (isNaN(a) || isNaN(b) || a > b) return [];

  let start = new Date(
    Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate())
  );
  let end = new Date(
    Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate())
  );
  if (start > end) [start, end] = [end, start];

  const out = [];
  while (start <= end) {
    out.push(formatDate(start));
    start.setUTCDate(start.getUTCDate() + 1);
  }
  return out;
}

export function toLocaleDateString(input) {
  if (!input) return "";
  const [day, month, year] = input.split("-");

  const dateObj = new Date(`${year}-${month}-${day}`);
  return dateObj.toLocaleDateString();
}
