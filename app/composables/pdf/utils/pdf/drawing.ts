export function drawWrappedHeader(
  pdf: any,
  startX: number,
  startY: number,
  colWidths: number[],
  headers: string[]
) {
  const padding = 2;
  const lineHeight = 5;

  const headerHeights = headers.map((header, index) => {
    const wrapped = pdf.splitTextToSize(
      header,
      colWidths[index] - padding * 2
    );

    return wrapped.length * lineHeight;
  });

  const rowHeight = Math.max(...headerHeights, 8);

  pdf.setFillColor(230, 230, 230);

  pdf.rect(
    startX,
    startY,
    colWidths.reduce((a, b) => a + b),
    rowHeight,
    "F"
  );

  let x = startX;

  headers.forEach((header, index) => {
    const wrapped = pdf.splitTextToSize(
      header,
      colWidths[index] - padding * 2
    );

    pdf.text(wrapped, x + padding, startY + lineHeight);

    pdf.rect(x, startY, colWidths[index], rowHeight);

    x += colWidths[index];
  });

  return rowHeight;
}

export async function addFullPageChart(
  pdf: any,
  chart: any,
  title = "Diagramm"
) {
  const img = chart.toBase64Image()
  const height = chart.height
  const width = chart.width

  pdf.addPage("a4", "landscape");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (height * imgWidth) / width;

  const imgY = (pageHeight - imgHeight) / 2;

  pdf.setFontSize(18);

  pdf.text(title, pageWidth / 2, 12, {
    align: "center"
  });

  pdf.addImage(
    img,
    "PNG",
    0,
    imgY,
    imgWidth,
    imgHeight
  );
}