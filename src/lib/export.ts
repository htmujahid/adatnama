export interface CsvColumn<TData> {
  header: string
  value: (row: TData) => unknown
}

function escapeCsvCell(value: unknown): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`
}

export function toCsv<TData>(
  rows: TData[],
  columns: CsvColumn<TData>[],
): string {
  const lines = [
    columns.map((column) => escapeCsvCell(column.header)).join(","),
    ...rows.map((row) =>
      columns.map((column) => escapeCsvCell(column.value(row))).join(","),
    ),
  ]

  return lines.join("\r\n")
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportRowsToCsv<TData>(
  filename: string,
  rows: TData[],
  columns: CsvColumn<TData>[],
): void {
  downloadCsv(filename, toCsv(rows, columns))
}
