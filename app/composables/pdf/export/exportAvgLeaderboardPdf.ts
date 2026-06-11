import jsPDF from "jspdf"
import { getLeaderboardHeaders } from "../utils/formatting/headers"
import { drawManualTable } from "../utils/renderers/tableRenderer"
import { getLeaderboardRowStyle } from "../utils/formatting/leaderboardRowStyle"

export async function useExportLeaderboardPdf(options: {
  leaderboard: any[],
  leaderboardHeader: string,
  leaderboardType: number
}) {
  const { leaderboard, leaderboardHeader, leaderboardType } = options

  const pdf = new jsPDF("p", "mm", "a4")

  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(16)

  pdf.text(
    leaderboardHeader,
    10,
    20
  )

  pdf.setFontSize(8)

  pdf.text(
    getSubHeader(leaderboardType),
    10,
    25
  )

  pdf.setFontSize(6)

  const columnHeaders = getLeaderboardHeaders(leaderboardType)

  const rows = buildRows(leaderboard, leaderboardType)

  const colWidths = getColWidths(leaderboardType)

  const rowStyles = leaderboard.map((entry, index) => getLeaderboardRowStyle(entry, leaderboardType, index))

  drawManualTable(
    pdf,
    10,
    35,
    colWidths,
    rows,
    columnHeaders,
    rowStyles
  )

  pdf.setTextColor(0, 0, 0)
  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(6)

  pdf.save(`${leaderboardHeader}.pdf`)
}

function getSubHeader(leaderboardType: number): string {
  switch(leaderboardType) {
    case 3:
      return "Die folgenden Medallien wurden während Turnieren des RSB, DSB und SFT inklusive Teamwertungen in der laufenden Seison erziehlt"
    default:
      return ""
  }
}

function buildRows(
  leaderboard: any[],
  leaderboardType: number
): string[][] {

  switch (leaderboardType) {

    // Average leaderboard
    case 1:
      return leaderboard.map((entry) => [
        String(entry.rnk ?? ""),
        formatName(entry),
        `${entry.bowclass_name ?? ""} ${formatAgeBracketName(entry.agebracket_name) ?? ""}`,
        String(entry.tournament_name ?? ""),
        formatAverage(entry.yearly_average)
      ])

    // Improvement leaderboard
    case 2:
      return leaderboard.map((entry, index) => [
        String(entry.rnk ?? index + 1),
        formatName(entry),
        formatImprovement(entry.improvement)
      ])

    // Medal leaderboard
    case 3:
      return leaderboard.map((entry) => [
        String(entry.place ?? entry.rnk ?? ""),
        formatName(entry),
        `${entry.gold ?? 0}`,
        `${entry.silver ?? 0}`,
        `${entry.bronze ?? 0}`
      ])

    default:
      return []
  }
}

function formatAgeBracketName(ageBracket: string): string | null {
  if(ageBracket != "[Ohne Name]") return ageBracket
  return null
}

function formatName(entry: any): string {
  return [
    entry.title,
    entry.firstname,
    entry.lastname
  ]
    .filter(Boolean)
    .join(" ")
}

function formatAverage(value: number | string): string {
  if (value == null) return "-"

  const num = Number(value)

  return Number.isNaN(num)
    ? "-"
    : num.toFixed(2)
}

function formatImprovement(value: number | string): string {
  const num = Number(value)

  if (Number.isNaN(num)) {
    return "0"
  }

  if (num > 0) {
    return `+${num.toFixed(2)}`
  }

  if (num < 0) {
    return `${num.toFixed(2)}`
  }

  return `±${num.toFixed(2)}`
}

function getColWidths(leaderboardType: number): number[] {

  switch (leaderboardType) {

    case 1:
      return [10, 40, 60, 70, 10]

    case 2:
      return [10, 130, 20]

    case 3:
      return [10, 120, 10, 10, 10]

    default:
      return []
  }
}