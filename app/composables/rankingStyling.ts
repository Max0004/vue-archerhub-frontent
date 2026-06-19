export function getRankingStyle(index: Number) {
  switch(index) {
    case 0: return 'text-yellow-500 font-bold';
    case 1: return 'text-gray-400 font-bold';
    case 2: return 'text-orange-500 font-bold';
    default: return 'text-gray-600 text-sm';
  }
}

export const ringBackgroundPlugin = {
  id: 'ringBackground',

  beforeDraw(chart: any) {
    const { ctx, chartArea, scales } = chart
    const y = scales.y

    if(!y || !chartArea) return

    const bands = [
      { from: 0, to: 1, color: 'rgba(158,158,158,0.1)' }, // gray
      { from: 1, to: 3, color: '#ffffff' }, // white (merged 1-2 + 2-3)
      { from: 3, to: 5, color: 'rgba(0,0,0,0.1)' }, // black
      { from: 5, to: 7, color: 'rgba(33,150,243,0.1)' }, // blue
      { from: 7, to: 9, color: 'rgba(244,67,54,0.1)' }, // red
      { from: 9, to: 10, color: 'rgba(255,215,0,0.1)' }, // gold
    ]

    ctx.save()

    for(const band of bands) {
      const yTop = y.getPixelForValue(band.to)
      const yBottom = y.getPixelForValue(band.from)

      ctx.fillStyle = band.color
      ctx.fillRect(
        chartArea.left,
        yTop,
        chartArea.right - chartArea.left,
        yBottom - yTop
      )
    }

    ctx.restore()
  }
}