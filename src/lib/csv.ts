/** Minimal RFC-4180 CSV serialiser. Guards against spreadsheet formula injection. */
export function toCsv(rows: Record<string, unknown>[], columns?: string[]): string {
  if (rows.length === 0) return "";
  const cols = columns ?? Object.keys(rows[0]);
  const escape = (value: unknown): string => {
    let s = value === null || value === undefined ? "" : String(value);
    // Neutralise formula injection when the file is opened in Excel/Sheets.
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => escape(r[c])).join(","))].join("\r\n");
}
