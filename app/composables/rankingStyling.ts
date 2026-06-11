export function getRankingStyle(index: Number) {
  switch(index) {
    case 0: return 'text-yellow-500 font-bold';
    case 1: return 'text-gray-400 font-bold';
    case 2: return 'text-orange-500 font-bold';
    default: return 'text-gray-600 text-sm';
  }
}