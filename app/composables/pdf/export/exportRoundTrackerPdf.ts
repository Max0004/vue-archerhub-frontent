import jsPDF from "jspdf";
import { addFullPageChart } from "../utils/pdf/drawing";
import autoTable from "jspdf-autotable";

export async function useExportRoundTrackerPdf(options: {
  chartEl: any;
  tableData: Object,
  selectedArchers: Array<Object>;
  tournament: String
}) {
  const { chartEl, tableData, selectedArchers, tournament } = options;

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
    pdf.addPage("a4", "landscape")
    
    const img = chartEl.toDataURL('image/png')
    
    const landscapePageWidth = pdf.internal.pageSize.getWidth();
    const landscapePageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = landscapePageWidth
    const imgHeight = (chartEl.height * imgWidth) / chartEl.width

    const imgY = (landscapePageHeight - imgHeight) / 2

    pdf.addImage(img, "PNG", 0, imgY, imgWidth, imgHeight)  
  }

  // === PAGE 3: Table ===
  if (tableData && tableData.rows?.length) {
    pdf.addPage("a4", "p")

    const head = [
      [
        "Schütze",
        ...Array.from(
          { length: tableData.maxRound },
          (_, i) => `Runde ${i + 1}`
        ),
        "Gesamt"
      ]
    ]

    const body = tableData.rows?.map(row => [
      row.name,
      ...row.rounds.map(r => {
        if(r.score === "-") {
          return "-"
        }

        return r.diff === null
          ? `${r.score}`
          : `${r.score}\n${r.diff.toFixed(1)}%`
      }),
      row.total
    ])

    autoTable(pdf, {
      head,
      body,
      startY: 20,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fontStyle: "bold"
      }
    })
  }

  // === Save ===
  pdf.save(`Turniertracker-${convertStringForFileName(tournament)}.pdf`);
}