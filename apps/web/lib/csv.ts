// A leading '=', '+', '-', or '@' makes Excel/Google Sheets treat a cell as
// a formula (CWE-1236, "CSV injection") — several of these exports include
// fully anonymous, public-form-submitted text (contact messages, new-convert
// inquiries, registration notes) verbatim, so this isn't hypothetical: a
// visitor can plant a formula payload that runs when staff open the export.
// Prefixing with a single quote is the standard mitigation — every major
// spreadsheet app treats a leading `'` as "force this cell to text."
const FORMULA_TRIGGER_CHARS = /^[=+\-@\t\r]/;

function escapeCsvCell(value: unknown): string {
  let str = value == null ? "" : String(value);
  if (FORMULA_TRIGGER_CHARS.test(str)) {
    str = `'${str}`;
  }
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

/** Builds a CSV string from column headers + rows. Small, bounded exports only — see callers for the `take` limit that keeps this from ever loading an unbounded table. */
export function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers.map(escapeCsvCell).join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeCsvCell).join(","));
  }
  return lines.join("\n");
}
