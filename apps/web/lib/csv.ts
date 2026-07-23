function escapeCsvCell(value: unknown): string {
  const str = value == null ? "" : String(value);
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
