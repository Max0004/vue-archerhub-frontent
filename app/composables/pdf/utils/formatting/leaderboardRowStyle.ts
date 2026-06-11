export interface LeaderboardRowStyle {
  fill: number[] | null,
  text: number[],
  fontStyle?: "normal" | "bold",
  fontSize?: 6 | 8
}

export function getLeaderboardRowStyle(entry: any, leaderboardType: number, rowIndex: number): LeaderboardRowStyle {
  // Medal leaderboard special handling
  if(leaderboardType === 3) {
    const medals = 
      Number(entry.gold ?? 0) +
      Number(entry.silver ?? 0) +
      Number(entry.bronze ?? 0)

    if(medals === 0) {
      return {
        fill: [240, 240, 240],
        text: [130, 130, 130],
        fontStyle: "normal",
        fontSize: 6
      }
    }
  }

  const rank = Number(entry.rnk ?? entry.place ?? rowIndex + 1)

  switch(rank) {
    //Gold
    case 1:
      return {
        fill: [255, 215, 0],
        text: [0, 0, 0],
        fontStyle: "bold",
        fontSize: 8
      }
    //Silver
    case 2:
      return {
        fill: [192, 192, 192],
        text: [0, 0, 0],
        fontStyle: "bold",
        fontSize: 8
      }
    //Bronze
    case 3:
      return {
        fill: [205, 127, 50],
        text: [0, 0, 0],
        fontStyle: "bold",
        fontSize: 8
      }
    //Everyone Else (Highlight Top 10)
    default:
      return {
        fill: null,
        text: [0, 0, 0],
        fontStyle: rank <= 10 ? "bold" : "normal",
        fontSize: rank <= 10 ? 8 : 6
      }
  }
}