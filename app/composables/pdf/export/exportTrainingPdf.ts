import jsPDF from "jspdf";
import ringSettings from "~/assets/data/RingSettings.json";
import { addFullPageChart } from "../utils/pdf/drawing";
import { captureElementAsImage } from "../utils/pdf/image";

export async function useExportTrainingPdf(options: {userData: any; chartEl: HTMLElement | null; sessions: any[]}) {
  const { userData, chartEl, sessions } = options;

  const pdf = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();

  const fullName = `${userHasTitle(userData)} ${userData.firstname} ${userData.lastname}`
  const dateString = `${new Date().toLocaleDateString("de-DE")}`

  // -------------------------  
  // PAGE 1 — COVER PAGE  
  // -------------------------
  pdf.setFontSize(26);
  pdf.text("Trainingslog", pageWidth / 2, 40, { align: "center" });

  pdf.setFontSize(16);
  pdf.text(fullName, pageWidth / 2, 55, { align: "center" });

  pdf.setFontSize(14);
  pdf.text(`Erstellt am: ${dateString}`, pageWidth / 2, 70, { align: "center" });

  // -------------------------  
  // PAGE 2 — CHART SNAPSHOT  
  // -------------------------
  if (chartEl) await addFullPageChart(pdf, chartEl, "Trainingsverlauf");

  // -------------------------  
  // PAGE 3+ — TRAINING SESSIONS  
  // -------------------------
  for (const session of sessions) {
    pdf.addPage();

    pdf.setFontSize(16);
    pdf.text(new Date(session.trainingstart).toLocaleDateString("de-DE"), 14, 20);

    let y = 30;

    // Basic info
    const addField = (label, value) => {
      pdf.text(label, 14, y);
      pdf.text(String(value || "-"), 50, y);
      y += 8;
    };

    addField("Beschreibung:", session.description);
    addField("Start:", new Date(session.trainingstart).toLocaleString("de-DE"));
    addField("Ende:", new Date(session.trainingend).toLocaleString("de-DE"));
    addField("Ort:", session.location);

    // Record blocks
    y += 4;
    pdf.setFontSize(13);
    pdf.text("Ziele:", 14, y);
    y += 6;
    pdf.setFontSize(11);

    for (const record of session.training_records) {

      pdf.text(`Scheibe: ${record.target}`, 14, y);
      pdf.text(`Entfernung: ${record.distance}m`, 80, y);
      y += 6;

      pdf.text(`Ringe Gesamt: ${record.score}`, 14, y);
      pdf.text(`Pfeile: ${record.arrowsShot}`, 80, y);
      y += 6;

      pdf.text(`Durchschnitt: ${record.avgRingsHit.toFixed(2)}`, 14, y);
      y += 10;

      // ----- DONUT CHART -----

      const chartEl = document.querySelector(
        `[data-chart-id="${session.trainingstart}-${record.targetTitle}"]`
      ) as HTMLElement | null;

      if (chartEl) {
        const { img } = await captureElementAsImage(chartEl);
        pdf.addImage(img, "PNG", 120, 30, 70, 70);
      }
      
      // ----- TABLE: Hits per Ring -----
      {
        const tableStartX = 14;
        const tableStartY = y;
        const colWidth = 14;
        const rowHeight = 8;

        // Load ring settings JSON
        // Each item = { key, label, color }
        const columns = ringSettings;

        const totalShots = record.arrowsShot || 1;

        // Helper — choose white or black text for contrast
        function getTextColor(hex: string) {
          const c = hex.replace("#", "");
          const r = parseInt(c.substr(0, 2), 16);
          const g = parseInt(c.substr(2, 2), 16);
          const b = parseInt(c.substr(4, 2), 16);
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          return luminance > 160 ? "#000000" : "#FFFFFF";
        }

        // -------------------------
        // Header row with colors
        // -------------------------
        pdf.setFontSize(10);
        pdf.setFont(undefined, "bold");

        let x = tableStartX;

        columns.forEach((col) => {
          const bg = col.color;
          const textColor = getTextColor(bg);

          // Colored header cell
          pdf.setFillColor(bg);
          pdf.rect(x, tableStartY, colWidth, rowHeight, "F");

          // Header text
          pdf.setTextColor(textColor);
          pdf.text(col.label, x + colWidth / 2, tableStartY + 5, { align: "center" });

          x += colWidth;
        });

        // Reset text defaults
        pdf.setTextColor("#000000");
        pdf.setFont(undefined, "normal");

        // -------------------------
        // Values row
        // -------------------------
        const valueY = tableStartY + rowHeight;
        x = tableStartX;

        columns.forEach((col) => {
          pdf.rect(x, valueY, colWidth, rowHeight);
          const val = record[col.key] !== undefined ? String(record[col.key]) : "0";
          pdf.text(val, x + colWidth / 2, valueY + 5, { align: "center" });
          x += colWidth;
        });

        // -------------------------
        // Percent row
        // -------------------------
        const percentY = valueY + rowHeight;
        x = tableStartX;

        columns.forEach((col) => {
          pdf.rect(x, percentY, colWidth, rowHeight);
          const value = record[col.key] ?? 0;
          const percent = ((value / totalShots) * 100).toFixed(1) + "%";
          pdf.text(percent, x + colWidth / 2, percentY + 5, { align: "center" });
          x += colWidth;
        });

        // Move down after table
        y = percentY + rowHeight + 10;
      }
    }
  }

  // -------------------------  
  // FINALLY SAVE  
  // -------------------------
  pdf.save(`Trainingslog-${convertStringForFileName(fullName)}-${dateString}.pdf`);
}