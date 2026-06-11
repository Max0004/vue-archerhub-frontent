export function formatCellValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const num = Number(value);

  if (Number.isNaN(num)) {
    return String(value);
  }

  return Number.isInteger(num)
    ? String(num)
    : num.toFixed(2);
}