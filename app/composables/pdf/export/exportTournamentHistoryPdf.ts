import jsPDF from "jspdf";
import { getOptionHeader } from "../utils/formatting/headers";
import { addFullPageChart } from "../utils/pdf/drawing";
import { formatCellValue } from "../utils/formatting/numbers";
import { calculateColumnWidths } from "../utils/pdf/layout";
import { drawManualTable } from "../utils/renderers/tableRenderer";

export async function useExportTournamentHistoryPdf(options: {
  chartElement: any; 
  selectedArchers: string[]; 
  tournaments: { name: string; date: string }[]; 
  datasetMap: Record<string, (number | null)[]>}) {
  
  const { chartElement, selectedArchers, tournaments, datasetMap, selectedOption } = options

  const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  const today = new Date().toLocaleDateString("de-DE");

  // === PAGE 1: Cover ===
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(28);
  pdf.text(
    `Turnierhistorie (${getOptionHeader(selectedOption)})`,
    105,
    40,
    { align: "center" }
  );

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.text(`Erstellt am: ${today}`, 105, 55, { align: "center" });

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text("Für die Schützen", 105, 75, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);

  let y = 90;
  selectedArchers.forEach(a => {
    pdf.text(a, 105, y, { align: "center" });
    y += 7;
  });

  // === PAGE 2: CHART (LANDSCAPE, FULL PAGE) ===
  pdf.addPage("a4", "landscape")

  const img = chartElement.toDataURL('image/png')

  const landscapePageWidth = pdf.internal.pageSize.getWidth();
  const landscapePageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = landscapePageWidth
  const imgHeight = (chartElement.height * imgWidth) / chartElement.width

  const imgY = (landscapePageHeight - imgHeight) / 2

  pdf.addImage(img, "PNG", 0, imgY, imgWidth, imgHeight)  
  // await addFullPageChart(pdf, chartElement, "Entwicklung");

  // === PAGE 2: DATAPOINT TABLE ===
  pdf.addPage("a4", "p");

  pdf.setFontSize(16);
  pdf.text("Alle Wertungen", 10, 15);
  pdf.setFontSize(6);

  const tournamentNames = tournaments.map(t => t.name);
  const columnHeaders = ["Turnier", ...selectedArchers];
  const rows = tournaments.map((t, rowIndex) => [
    t.name,
    ...selectedArchers.map(a => formatCellValue(datasetMap[a][rowIndex]))
  ]);

  const colWidths = calculateColumnWidths(pdf, tournamentNames, selectedArchers.length);

  drawManualTable(pdf, 10, 25, colWidths, rows, columnHeaders);

  // === PAGE 3: HIGHEST / LOWEST ===
  pdf.addPage();

  pdf.setFontSize(16);
  pdf.text("Höchste / Niedrigste Werte", 10, 15);
  pdf.setFontSize(6);

  const minMaxHead = ["Schütze", "Höchste Wertung", "Niedrigste Wertung"];
  const minMaxRows = selectedArchers.map(a => {
    const vals = (datasetMap[a] ?? []).filter(v => v !== null) as number[];
    return [a, formatCellValue(Math.max(...vals)), formatCellValue(Math.min(...vals))];
  });

  drawManualTable(pdf, 10, 25, [40, 40, 40], minMaxRows, minMaxHead);

  // === Save ===
  pdf.save(`Turnierhistorie-${new Date().toLocaleDateString("de-DE")}.pdf`)
}