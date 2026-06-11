export function getOptionHeader(selectedOption: number): string {
  const headers: Record<number, string> = {
    1: "Gesamtergebnis",
    2: "Trefferdurchschnitt",
    3: "Goldanteil",
    4: "Delta"
  };

  return headers[selectedOption] ?? "";
}

export function getLeaderboardHeaders(leaderboardType: number) {
  switch(leaderboardType) {
    case 1:
      return ["Rang", "Schütze", "Klasse", "Turnier", ""]
    case 2:
      return ["Rang", "Schütze", ""]
    case 3:
      return ["Rang", "Schütze", "Gold", "Silber", "Bronze"]
    default:
      return []
  }
}