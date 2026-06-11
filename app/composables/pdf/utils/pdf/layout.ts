export function calculateColumnWidths(
  pdf: any,
  tournamentNames: string[],
  archerCount: number
): number[] {
  const longest = tournamentNames.reduce((a, b) =>
    pdf.getTextWidth(a) > pdf.getTextWidth(b) ? a : b
  );

  const firstColWidth = pdf.getTextWidth(longest) + 10;

  const totalWidth = 190;
  const remainingWidth = totalWidth - firstColWidth;

  return [
    firstColWidth,
    ...Array(archerCount).fill(remainingWidth / archerCount)
  ];
}

export interface BracketWidthOptions {
  place: number;
  name: number;
  club: number;
  total: number;
}

export function calculateBracketColumnWidths(
  tableWidth: number,
  options: BracketWidthOptions,
  dynamicColumnCount: number,
  minDynamicWidth = 8
) {
  const fixedTotal =
    options.place +
    options.name +
    options.club +
    options.total;

  const remaining = tableWidth - fixedTotal;

  return {
    fixed: options,
    dynamicWidth: Math.max(
      minDynamicWidth,
      remaining / dynamicColumnCount
    )
  };
}