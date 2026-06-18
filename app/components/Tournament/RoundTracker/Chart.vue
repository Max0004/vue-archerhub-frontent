<template>
  <div class="bg-white rounded-lg shadow p-6 py-1">
    <div v-if="!chartData" class="h-96 flex items-center justify-center text-gray-500 italic">
      No data selected for this selection
    </div>

    <div class="h-200">
      <Line v-if="chartData" :data="chartData" :options="roundTrackerChartOptions" />
    </div>
  </div>
</template>
<script setup lang="ts">
  import { Line } from 'vue-chartjs'
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  } from 'chart.js'

  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

  const props = defineProps({
    selectedParticipants: Array,
    allParticipantsInTournament: Array
  })

  const colors = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#84cc16']

  // CHART DATA BASED ON SELECTED PARTICIPANTS ONLY
  const chartData = computed(() => {
    if (!props.selectedParticipants.length) return null

    const participants = props.allParticipantsInTournament
      .filter(p => props.selectedParticipants.includes(p.participantId))

    if (!participants.length) return null

    const maxRound = Math.max(
      ...participants.flatMap(p => p.rounds.map(r => r.round))
    )

    const labels = []
    const datasets = participants.map((p, idx) => ({
      label: `${p.title ? p.title + " " : ""}${p.firstname} ${p.lastname}`,
      borderColor: colors[idx % colors.length],
      backgroundColor: colors[idx % colors.length] + '55',
      data: []
    }))

    for (let round = 0; round <= maxRound; round++) {
      labels.push(round)

      participants.forEach((p, idx) => {
        if (round === 0) {
          datasets[idx].data.push(0)
        } else {
          const roundEntry = p.rounds.find(r => r.round == round)
          if(!roundEntry) {
            datasets[idx].data.push(null)
          } else {
          const total = p.rounds
            .filter(r => r.round <= round)
            .reduce((sum, r) => sum + r.score, 0)

          datasets[idx].data.push(total)
          }
        }
      })
    }

    return Object.freeze({ labels, datasets })
  })

  const roundTrackerChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 50
          }
        }
      }
    }
  }
</script>