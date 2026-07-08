import jsPDF from "jspdf";
import { collectTitleHolders } from "../utils/tournament/titleHolders";
import { drawWrappedHeader } from "../utils/pdf/drawing";
import { drawManualTable } from "../utils/renderers/tableRenderer";
import { calculateBracketColumnWidths } from "../utils/pdf/layout";
import { sortParticipantsForPdf } from "../utils/tournament/ranking";
import { getRowStyle } from "../utils/formatting/tableRows";

export async function useExportTournamentResultsPdf(options: {
  tournament: any;
  date: string;
  processedBrackets: any[];
}) {
  // PDF INIT
  const { tournament, date, processedBrackets } = options
  const pdf = new jsPDF("p", "mm", "a4")
  
  const pageWidth = pdf.internal.pageSize.getWidth()
  const marginX = 10
  const tableWidth = pageWidth - marginX * 2

  // TOC TRACKING
  const tocEntries: {title: string; page: number}[] = []
  const addTocEntry = (title: string, page: number) => {
    tocEntries.push({title, page})
  }
  
  // ---------- COVER ----------
  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(22)
  pdf.text(tournament.tournament_name, pageWidth / 2, 30, { align: "center" })
  
  pdf.setFontSize(12)
  pdf.setFont("helvetica", "normal")
  pdf.text(`Datum: ${date}`, pageWidth / 2, 45, { align: "center" })
  pdf.text(`Ort: ${tournament.place}`, pageWidth / 2, 55, { align: "center" })

  // ------------TABLE OF CONTENT------------
  pdf.addPage()
  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(20)
  pdf.text("Inhaltsverzeichnis", marginX, 20)

  let tocY = 35

  // Placeholder TOC entries (filled later after generation)
  const tocPlaceholders: {
    title: string;
    page: number;
  }[] = []

  const pushTocLine = (label: string, page: number) => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);

    pdf.text(label, marginX, tocY);
    pdf.text(String(page), pageWidth - marginX, tocY, { align: "right" });

    // clickable link
    pdf.textWithLink(" ", marginX, tocY, {
      pageNumber: page,
    });

    tocY += 8;
  };

  // we will fill after sections are created
  const registerToc = (label: string, page: number) => {
    tocPlaceholders.push({ title: label, page });
  };

  // ---------- TITLE HOLDERS PAGE ----------
  const titleHolders = collectTitleHolders(tournament, processedBrackets)

  if (titleHolders.length > 0) {
    pdf.addPage()

    const page = pdf.getNumberOfPages();
    registerToc("Titelträger", page);

    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(20)
    pdf.text(tournament.titlebywinning, pageWidth / 2, 25, { align: "center" })

    pdf.setFontSize(11)
    pdf.setFont("helvetica", "normal")
    pdf.text(
      "Die folgenden Schützinnen und Schützen errangen einen Titel durch Klassensieg.",
      pageWidth / 2,
      35,
      { align: "center" }
    )

    const headers = ["Klasse", tournament.titlebywinning, "Verein"]
    const colWidths = [70, 55, 55]

    let y = 45

    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(10)

    const headerHeight = drawWrappedHeader(pdf, 15, y, colWidths, headers)

    y += headerHeight

    pdf.setFont("helvetica", "normal")

    const rows = titleHolders.map(t => [
      t.titleName,
      t.archer,
      t.club
    ])

    drawManualTable(pdf, 15, y, colWidths, rows)
  }

  // ------------SCORE RANKING------------
  const allParticipants = processedBrackets.flatMap((b) => b.participants);

  const top10 = [...allParticipants]
    .filter((p) => !p.absent)
    .sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0))

  if (top10.length > 0) {
    pdf.addPage();
    const page = pdf.getNumberOfPages();
    registerToc("Ranking", page);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("Ringzahl Gesamtranking", pageWidth / 2, 20, {
      align: "center",
    });

    const headers = ["Platz", "Name", "Verein", "Gesamt"];
    const colWidths = [20, 90, 50, 30];

    let y = 30;

    pdf.setFontSize(10);

    const rows = top10.map((p, i) => [
      i + 1,
      `${p.firstname} ${p.lastname}`,
      p.clubName,
      p.totalScore,
    ]);

    drawManualTable(pdf, marginX, y, colWidths, rows);
  }
  // ---------- BRACKETS ----------
  for (const bracket of processedBrackets) {
    pdf.addPage()

    const page = pdf.getNumberOfPages();
    registerToc(bracket.combinedName, page);
  
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(16)
    pdf.setTextColor(0, 0, 0)
    pdf.setDrawColor(0)
    pdf.setFillColor(255, 255, 255)
    pdf.text(bracket.combinedName, marginX, 20)
  
    const headers = ["Pl.", "Name", "Verein"]
    for (let r = 1; r <= bracket.maxRounds; r++) headers.push(`R${r}`)
    if (tournament.goldcounted && tournament.centerscounted) headers.push("X")
    if (tournament.goldcounted) headers.push("10")
    if (tournament.goldcounted && tournament.ninescounted) headers.push("9")
    headers.push("Ges.")
  
    // ---------- COLUMN WIDTHS ----------
    const fixed = {
      place: 10,
      name: 42,
      club: 48,
      total: 18
    }
  
    const dynamicColumnCount =
      bracket.maxRounds +
      (tournament.goldcounted && tournament.centerscounted ? 1 : 0) +
      (tournament.goldcounted ? 1 : 0) +
      (tournament.goldcounted && tournament.ninescounted ? 1 : 0)

    const { dynamicWidth } = calculateBracketColumnWidths(
      tableWidth,
      fixed,
      dynamicColumnCount
    )

    const colWidths = [
      fixed.place,
      fixed.name,
      fixed.club,
      ...Array(dynamicColumnCount).fill(dynamicWidth),
      fixed.total
    ]
  
    let y = 28
    const baseRowHeight = 8
  
    // ---------- HEADER ----------
    pdf.setFillColor(230, 230, 230)
    pdf.rect(marginX, y, tableWidth, baseRowHeight, "F")
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(9)
    pdf.setTextColor(0, 0, 0)
    pdf.setFillColor(230, 230, 230)
  
    let x = marginX
    headers.forEach((h, i) => {
      pdf.text(h, x + 2, y + 5)
      pdf.rect(x, y, colWidths[i], baseRowHeight)
      x += colWidths[i]
    })
  
    y += baseRowHeight
    pdf.setFont("helvetica", "normal")
  
    // ---------- ROWS ----------

    const sorted = sortParticipantsForPdf(bracket.participants)
    for (const p of sorted) {
  
      const style = getRowStyle(p)
  
      const row = [
        p.absent ? "n.z.Q." : `${p.rank}.`,
        `${p.title ?? ""} ${p.firstname} ${p.lastname}`.trim(),
        p.clubName,
        ...Array.from({ length: bracket.maxRounds }, (_, i) => {
          const s = p.scores?.find(r => r.round === i + 1)
          return s?.score ?? ""
        }),
        ...(tournament.goldcounted && tournament.centerscounted ? [p.absent ? "-" : p.totalCenters] : []),
        ...(tournament.goldcounted ? [p.absent ? "-" : p.totalTens] : []),
        ...(tournament.goldcounted && tournament.ninescounted ? [p.absent ? "-" : p.totalNines] : []),
        p.totalScore
      ]
  
      // Calculate dynamic row height (for wrapped text)
      const wrappedHeights = row.map((cell, i) => {
        const text = pdf.splitTextToSize(String(cell), colWidths[i] - 4)
        return text.length * 5
      })
  
      const rowHeight = Math.max(baseRowHeight, ...wrappedHeights)
  
      if (y + rowHeight > 280) {
        pdf.addPage()
        y = 20
      }
  
      x = marginX
  
      row.forEach((cell, i) => {
        if (style.fill) {
          pdf.setFillColor(...style.fill)
          pdf.rect(x, y, colWidths[i], rowHeight, "F")
        }
  
        pdf.setTextColor(...style.text)
        const text = pdf.splitTextToSize(String(cell), colWidths[i] - 4)
        pdf.text(text, x + 2, y + 5)
  
        pdf.setDrawColor(0)
        pdf.rect(x, y, colWidths[i], rowHeight)
  
        x += colWidths[i]
      })
  
      y += rowHeight
    }
  }

  // RENDER FINAL TOC AND SAVE
  pdf.setPage(2)

  tocY = 35

  for(const entry of tocPlaceholders) {
    pdf.setFont("helvetica", "normal")
    pdf.text(entry.title, marginX, tocY)
    pdf.text(String(entry.page), pageWidth - marginX, tocY, {
      align: "right"
    })

    pdf.textWithLink(" ", marginX, tocY, {
      pageNumber: entry.page
    })

    tocY += 8
  }
  
  pdf.save(`${convertStringForFileName(tournament.tournament_name)}-Ergebnisse.pdf`)
}