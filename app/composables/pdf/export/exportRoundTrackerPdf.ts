import jsPDF from "jspdf";
import { addFullPageChart } from "../utils/pdf/drawing";

export async function useExportRoundTrackerPdf(options: {
  chartEl: HTMLElement | null;
  tableEl: HTMLElement | null;
  selectedArchers: Array<Object>;
  tournament: String
}) {
  const { chartEl, tableEl, selectedArchers, tournament } = options;

  const pdf = new jsPDF("p", "mm", "a4");
  const today = new Date().toLocaleDateString("de-DE");

  // === PAGE 1: Cover ===
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(28);
  pdf.text(
    `Turnier-Tracker`,
    105,
    40,
    { align: "center" }
  );

  pdf.text(
    `${tournament}`,
    105,
    55,
    { align: "center" }
  );

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.text(`Erstellt am: ${today}`, 105, 75, { align: "center" });

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text("Für die Schützen", 105, 95, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);

  let y = 110;
  selectedArchers.forEach(a => {
    pdf.text(userHasTitle(a)+a.name, 105, y, { align: "center" });
    y += 7;
  });

  // === PAGE 2: Chart ===
  if (chartEl) {
    await addFullPageChart(pdf, chartEl, "Rundentracker")
  }

  // === PAGE 3: Table ===
  if (tableEl) {
    await addFullPageChart(pdf, tableEl, "")
  }

  // === Save ===
  pdf.save(`Turniertracker-${convertStringForFileName(tournament)}.pdf`);
}