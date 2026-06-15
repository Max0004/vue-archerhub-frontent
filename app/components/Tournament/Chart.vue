<template>
  <div class="mr-12" ref="chartRoot">
    <Line v-if="allArchers && selectedArcherIds" :data="chartData" :options="chartOptions" />
    <Line v-else :data="individualData" :options="chartOptions" />
  </div>
</template>
<script setup lang="ts">
  import type { ArcherEntry } from '~/models/ArcherEntry'
  import { Line } from 'vue-chartjs'
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js'
  
  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

  const props = defineProps({
    allArchers: {
      type: Array
    },
    selectedArcherIds: {
      type: Array
    },
    uniqueTournaments: {
      type: Array
    },
    type: {
      type: String,
      required: true
    },
    individualData: {
      type: Object
    },
    chartOptions: {
      type: Object
    }
  })

  const chartRoot = ref<HTMLElement | null>(null)

  function archerId(a: ArcherEntry) {
    if(a.title) {
      return a.title + " " + a.firstname + ' ' + a.lastname
    }
    return a.firstname + ' ' + a.lastname
  }

  const relevantTournaments = ref([]);
  
  const chartData = computed(() => {
  if (props.selectedArcherIds.length === 0) {
    return {
      labels: [],
      datasets: [],
    }
  }

  // Get tournaments where at least one selected archer participated
  relevantTournaments.value = props.uniqueTournaments.filter(tournament => {
    return props.allArchers.some(entry =>
      props.selectedArcherIds.includes(archerId(entry)) &&
      entry.tournament_name === tournament.name
    )
  })

  const labels = relevantTournaments.value.map(t => t.name)

  const datasets = props.selectedArcherIds.map((id, index) => {
    const archerEntries = props.allArchers.filter(a => archerId(a) === id)

    const data = labels.map(tournamentName => {
      const entry = archerEntries.find(e => e.tournament_name === tournamentName)
      if(props.type === "totalscore") {
        return entry ? entry.total_score : null
      } else if(props.type === "avghits") {
        return entry ? entry.ring_average : null
      } else if(props.type === "avggoldhits") {
        if (entry && entry.goldcounted) {
          if(entry.absent && !entry.totaltens && !entry.totalnines) {
            return null
          }
          const totalCenters = entry.totalcenters ?? 0
          const totalTens = entry.totaltens - totalCenters
          const totalNines = entry.totalnines ? entry.totalnines - totalTens : 0
          const avg = (totalTens + totalNines) / entry.total_arrows;
          return avg * 100;
        }
        return null;
      }
    })

    const colors = [
      'rgba(255, 99, 132)',
      'rgba(54, 162, 235)',
      'rgba(255, 206, 86)',
      'rgba(75, 192, 192)',
      'rgba(153, 102, 255)',
      'rgba(255, 159, 64)',
      'rgba(100, 181, 246)',
      'rgba(129, 199, 132)',
      'rgba(255, 138, 128)',
      'rgba(174, 213, 129)'
    ]


    const color = colors[index % colors.length]

    return {
      label: id,
      data,
      fill: false,
      borderColor: color,
      backgroundColor: color,
      tension: 0.3,
      spanGaps: true,
      segment: props.type === "totalscore" || props.type === "avghits"
        ? {
          borderDash: ctx => {
            const i = ctx.p1DataIndex;
            const entry = archerEntries.find(
              e => e.tournament_name === labels[i]
            );

            // If absent → dotted segment BEFORE this point
            return entry?.absent ? [6, 6] : undefined;
          }
        } : undefined,
      pointStyle: ctx => {
        const i = ctx.dataIndex;
        const entry = archerEntries.find(
          e => e.tournament_name === labels[i]
        );
        return entry?.absent ? 'rectRot' : 'circle'; // or any supported style
      }
    }
  })

  return {
    labels,
    datasets,
  }
})

  let yAxisTitle = 'Punkte'
  if (props.type === 'avghits') {
    yAxisTitle = 'Durchschnitt'
  } else if (props.type === 'avggoldhits') {
    yAxisTitle = 'Anteil (%)'
  }
  
  const chartOptions = computed(() => {
    return {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Turnierhistorie',
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
          callbacks: {
            label: (tooltipItem) => {
              const datasetLabel = tooltipItem.dataset.label;
              const value = tooltipItem.formattedValue;
              const tournamentName = tooltipItem.label;

              // Find archer entries for this dataset
              const archerEntries = props.allArchers.filter(
                a => datasetLabel === (a.title ? a.title + " " + a.firstname + " " + a.lastname : a.firstname + " " + a.lastname)
              );

              // Find the specific tournament entry
              const entry = archerEntries.find(e => e.tournament_name === tournamentName);

              // Build display label
              if (entry?.absent) {
                return `${datasetLabel} (n.z.Q.): ${value}`;
              }
              return `${datasetLabel}: ${value}`;
            }
          }
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: yAxisTitle,
          },
        },
        x: {
          ticks: {
            display: true,
            maxTicksLimit: 3
          }
        }
      },
    }
  })

  defineExpose({
    chartRoot,
    chartData,
    relevantTournaments
  })
</script>