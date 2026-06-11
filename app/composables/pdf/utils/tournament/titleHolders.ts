import { sortParticipantsForPdf } from "./ranking";

export function collectTitleHolders(
  tournament: any,
  processedBrackets: any[]) 
{
  if (!tournament.titlebywinning) return []
  
  const forbiddenAgeIds = [24, 25, 26, 29]
  const forbiddenBowIds = [6, 7]
  
  const titleHolders: {
    titleName: string
    archer: string
    club: string
  }[] = []
  
  for (const bracket of processedBrackets) {
    if (forbiddenAgeIds.includes(bracket.originalBracketId)) continue
    if (forbiddenBowIds.includes(bracket.bowClassId)) continue
  
    const sorted = sortParticipantsForPdf(bracket.participants)
  
    const winner = sorted.find(p => !p.absent && p.rank === 1)
    if (!winner) continue
  
    titleHolders.push({
      titleName: bracket.combinedName,
      archer: `${winner.title ?? ""} ${winner.firstname} ${winner.lastname}`.trim(),
      club: winner.clubName
    })
  }
  
  return titleHolders
}