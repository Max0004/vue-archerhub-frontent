interface TableRowStyle {
  fill: number[] | null
  text: number[],
  fontStyle?: "normal" | "bold",
  fontSize?: 6 | 8
}

/**
 * Draw a simple table manually using jsPDF
 */
export function drawManualTable(pdf: any, startX: number, startY: number, columnWidths: number[], rows: any[][], headers?: string[], rowStyles: TableRowStyle[] = []) {
  const lineHeight = 8
  let y = startY
  let x = startX
  
  // Draw header background
  if(headers) {
    pdf.setFillColor(230, 230, 230)
    pdf.rect(startX, y, columnWidths.reduce((a, b) => a + b), lineHeight, "F")
  
    // Draw header text
    pdf.setTextColor(0, 0, 0)
    pdf.setFont("helvetica", "bold")

    headers.forEach((h, i) => {
      pdf.text(String(h), x + 2, y + 5)
      x += columnWidths[i]
    })

    // Draw header borders
    pdf.setDrawColor(0)
    x = startX
    headers.forEach((_, i) => {
      pdf.rect(x, y, columnWidths[i], lineHeight)
      x += columnWidths[i]
    })
    y += lineHeight
  }
  
  // Draw rows
  pdf.setFont("helvetica", "normal")
  rows.forEach((row, rowIndex) => {

    const style = rowStyles[rowIndex] ?? {
      fill: null,
      text: [0, 0, 0],
      fontStyle: "normal",
      fontSize: 6
    }

    pdf.setFontSize(style.fontSize)

    x = startX
  
    row.forEach((cell, i) => {
      const width = columnWidths[i]

      if(style.fill) {
        pdf.setFillColor(...style.fill)
        pdf.rect(x, y, width, lineHeight, "F")
      }

      pdf.rect(x, y, width, lineHeight)

      pdf.setTextColor(...style.text)
      pdf.setFont("helvetica", style.fontStyle ?? "normal")
      
      pdf.text(String(cell ?? ""), x + 2, y + 5)

      pdf.rect(x, y, width, lineHeight)
      x += width
    })
  
    y += lineHeight
    if (y > 270) {
      pdf.addPage()
      y = 20
    }
  })
}