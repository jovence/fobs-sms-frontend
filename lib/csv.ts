type Cell = string | number | null | undefined;

/**
 * Escape a value for CSV, neutralizing spreadsheet formula injection (OWASP):
 * a cell beginning with =, +, -, @, tab or CR is executed as a formula by
 * Excel/Sheets, so we prefix it with a single quote before quote-escaping.
 */
function escapeCell(value: Cell): string {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function toCsv(header: string[], rows: Cell[][]): string {
  return [header, ...rows].map((r) => r.map(escapeCell).join(",")).join("\r\n");
}

/** Build a safe CSV (with UTF-8 BOM for Excel) and trigger a client-side download. */
export function downloadCsv(filename: string, header: string[], rows: Cell[][]): void {
  const csv = toCsv(header, rows);
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
