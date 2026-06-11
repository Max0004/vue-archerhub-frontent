import type { Participant } from "~/models/Participant";

export interface RowStyle {
  fill: number[] | null;
  text: number[];
}

export function getRowStyle(
  participant: Participant
): RowStyle {
  if (participant.absent) {
    return {
      fill: [230, 230, 230],
      text: [120, 120, 120]
    };
  }

  switch (participant.rank) {
    case 1:
      return {
        fill: [255, 215, 0],
        text: [0, 0, 0]
      };

    case 2:
      return {
        fill: [192, 192, 192],
        text: [0, 0, 0]
      };

    case 3:
      return {
        fill: [205, 127, 50],
        text: [0, 0, 0]
      };

    default:
      return {
        fill: null,
        text: [0, 0, 0]
      };
  }
}