import type { Participant } from "~/models/Participant";

export function sortParticipantsForPdf(
  participants: Participant[]
): Participant[] {
  return [...participants].sort((a, b) => {
    if (a.absent && !b.absent) return 1;
    if (!a.absent && b.absent) return -1;

    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }

    if ((b.totalCenters ?? 0) !== (a.totalCenters ?? 0)) {
      return (b.totalCenters ?? 0) - (a.totalCenters ?? 0);
    }

    if ((b.totalTens ?? 0) !== (a.totalTens ?? 0)) {
      return (b.totalTens ?? 0) - (a.totalTens ?? 0);
    }

    return (b.totalNines ?? 0) - (a.totalNines ?? 0);
  });
}