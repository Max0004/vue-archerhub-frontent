export function convertGender(genderString: string) {
  switch(genderString) {
    case "MALE":
      return "Männlich"
    case "FEMALE":
      return "Weiblich"
    default:
      return "Divers"
  }
}

export function sortParticipants(participants) {
  return [...participants].sort((a, b) => {
    if(a.rank !== null && b.rank === null) return -1;
    if(a.rank === null && b.rank !== null) return 1;

    if(a.rank !== null && b.rank !== null) return a.rank - b.rank;

    return b.totalScore - a.totalScore;
  });
}

export function convertStringForFileName(text: string) {
  return text
  .replaceAll(" ","-")
  .replaceAll("ä","ae")
  .replaceAll("ö","oe")
  .replaceAll("ü","ue")
  .replaceAll("ß","ss")
  .replace("Dr.","")
}

export const userHasTitle = (userData) => userData?.title || "";