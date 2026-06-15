<template>
  <div v-if="tableRows.length" class="bg-white rounded-lg shadow p-6 mt-10">
    <h2 class="text-xl font-semibold mb-4">Rundenübersicht</h2>
    <table class="min-w-full border-collapse">
      <thead>
        <tr>
          <th class="border-b p-2 text-left">Schütze</th>
          <th v-for="round in maxRound" :key="round" class="border-b p-2 text-center">
            Runde {{ round }}<br/>
          </th>
          <th class="border-b p-2 text-center">Gesamt</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in sortedTableRows" :key="row.id" class="border-t">
          <td class="p-2 font-semibold">{{ row.name }}</td>
          <td v-for="r in row.rounds" :key="r.round" class="p-2 text-center">
            <div>{{ r.score }}</div>
            <div v-if="r.diff !== null" :class="r.diff > 0 ? 'text-green-600' : r.diff < 0 ? 'text-red-600' : 'text-gray-600'" class="text-sm">
              <span v-if="r.diff > 0">▲</span>
              <span v-else-if="r.diff < 0">▼</span>
              {{ r.diff.toFixed(1) }}%
            </div>
          </td>
          <td class="p-2 font-bold text-center">{{ row.total }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup lang="ts">
  const props = defineProps({
    allParticipantsInTournament: Array,
    selectedParticipants: Array
  })

  const maxRound = computed(() => {
    const participants = props.allParticipantsInTournament.filter(p => props.selectedParticipants.includes(p.participantId))
    if (!participants.length) return 0
    return Math.max(...participants.flatMap(p => p.rounds.map(r => r.round)))
  })

  const tableRows = computed(() => {
    const participants = props.allParticipantsInTournament.filter(p => props.selectedParticipants.includes(p.participantId))
    if (!participants.length) return []

    return participants.map(p => {
      const rounds = []
      let lastScore = null
      for (let r = 1; r <= maxRound.value; r++) {
        const entry = p.rounds.find(x => x.round === r)

        if(!entry) {
          rounds.push({ round: r, score: '-', diff: null })
          continue
        }

        const score = entry ? entry.score : 0
        let diff = null
        if (lastScore !== null) diff = ((score - lastScore) / lastScore) * 100
        rounds.push({ round: r, score, diff })
        lastScore = score
      }
      const total = p.rounds.reduce((s,r)=>s+r.score,0)
      return {
        id: p.participantId,
        name: `${p.title ? p.title + " " : ""}${p.firstname} ${p.lastname}`,
        rounds,
        total
      }
    })
  })

  const sortedTableRows = computed(() => {
    return [...tableRows.value].sort((a,b) => b.total - a.total)
  })
</script>