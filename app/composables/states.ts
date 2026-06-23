export const useParticipationState = () =>  useState('participation', () => ref({
  tournament: '',
  participant: '',
  club: '',
  ageBracket: '',
  bowClass: '',
  rank: null,
  totalTens: null,
  totalCenters: null,
  totalNines: null,
  absent: false
}))

export const useRoundsState = () => useState('rounds', () => ref([
  { round: 1, target: '', distance: '', arrowsshot: '', score: '' }
]))