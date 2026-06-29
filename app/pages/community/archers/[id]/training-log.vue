<template>
  <div class="p-4">
    <h1 class="primary-header text-center mb-4">Trainingslog von {{ archerData.title }} {{ archerData.firstname }} {{ archerData.lastname }}</h1>
  </div>
  <div v-if="loading" class="text-center">
      <p class="text-gray-500">Loading training sessions...</p>
    </div>
    <div v-else-if="!trainingData.length" class="text-center">
      <p class="text-gray-500">Keine Trainingsdaten vorhanden.</p>
    </div>
    <div v-else>
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-lg font-semibold">Trainingseinheiten</h2>
          <p class="text-sm text-gray-500">
            {{ filteredSessions.length }} Einträge
          </p>
        </div>

        <div class="flex gap-3">
          <UButton
          v-if="filteredSessions.length > 0"
          icon="i-heroicons-arrow-down-tray-20-solid"
          color="neutral"
          variant="soft"
          @click="exportPdf"
          >
          PDF exportieren
          </UButton>
          <UButton
          icon="i-heroicons-plus"
          color="primary"
          @click="showModal = true"
          >
            Neuen Eintrag erstellen
          </UButton>
        </div>
      </div>
      <div>
        <div class="my-5 flex flex-wrap gap-4 items-end">
          <div class="w-48">
            <label class="text-sm font-medium mb-1 block">
              Von
            </label>

            <UInput
            v-model="startDate"
            type="date"
            />
          </div>

          <div class="w-48">
            <label class="text-sm font-medium mb-1 block">
              Bis
            </label>

            <UInput
            v-model="endDate"
            type="date"
            />
          </div>

          <div class="w-48">
            <label class="text-sm font-medium block mb-1">
              Auflage und Entfernung
            </label>

            <select
            v-model="selectedTargetType"
            class="border rounded px-3 py-2 w-full">
              <option value="all">Alle Zieltypen</option>
              <option v-for="type in targetTypes" :key="type" :value="type.value">
                {{ type.text }}
              </option>
            </select>
          </div>

          <UButton
          color="neutral"
          variant="soft"
          @click="() => {
            startDate = null
            endDate = null
            selectedTargetType = 'all'
          }"
          >
            Filter zurücksetzen
          </UButton>
        </div>
        <div>
          <p v-if="!pointDistributionHistory.labels.length" class="text-gray-500 mt-2">
            Keine Daten für den ausgewählten Zeitraum vorhanden
          </p>
          <Line
          :data="pointDistributionHistory"
          :options="chartOptions"
          ref="historyChart"
          />
        </div>
      </div>
      <hr />
      <div>
        <div v-for="(session, index) in filteredSessions" :key="index" class="mt-12">
          <h4 class="text-center">{{ formatDateWithoutTime(session.trainingstart) }}</h4>
          <span v-if="!session.training_records.length" class="text-center">Keine Grafik vorhanden</span>
          <div class="grid grid-cols-3 gap-6">
            <div 
            v-for="record in session.training_records" 
            :key="record.targetTitle"
            :data-chart-id="session.trainingstart + '-' + record.targetTitle">
              <TrainingDoughnutChart ref="chartRefs" :target-data="record" />
            </div>
          </div>
        </div>
      </div>
      <TrainingModal v-if="showModal" :show="showModal" @save="submitTrainingData" @close="showModal = false" />
    </div>
</template>
<script setup lang="ts">
  import { useExportTrainingPdf } from '~/composables/pdf/export/exportTrainingPdf'
  import { Line } from 'vue-chartjs';
  import {
    Chart as ChartJS,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement
  } from 'chart.js';


  const route = useRoute()
  const archerId = route.params.id as string

  const loading = ref(false)
  const archerData = ref({})
  const trainingData = ref([])

  const historyChart = ref<HTMLElement | null>(null)

  const startDate = ref<string | null>(null)
  const endDate = ref<string | null>(null)
  
  const selectedTargetType = ref("all");
  const targetTypes = ref<string[]>([]);

  const showModal = ref(false)

  const toast = useToast()

  async function fetchData() {
    loading.value = true
    try {
      const archerResponse = await $fetch(`/api/postgres/archer/${archerId}`, { method: "GET" })
      archerData.value = archerResponse

      const trainingResponse = await $fetch(`/api/postgres/training/${archerId}`, { method: "GET" })

      const sortedSessions = [...trainingResponse].sort((a,b) => 
        new Date(a.trainingstart).getTime() -
        new Date(b.trainingstart).getTime()
      )

      trainingData.value = sortedSessions

      const typeMap = new Map<string, { value: string; text: string }>()

      trainingData.value.forEach(session => {
        session.training_records.forEach(record => {
          if(record.target && record.distance) {
            const key = `${record.target}|${record.distance}`
            if(!typeMap.has(key)) {
              typeMap.set(key, {
                value: key,
                text: `${record.target} (${record.distance}m)`
              })
            }
          }
        })
      })

      targetTypes.value = Array.from(typeMap.values())

      if(sortedSessions.length) {
        startDate.value = sortedSessions[0].trainingstart.split('T')[0]
        endDate.value = sortedSessions[sortedSessions.length - 1].trainingstart.split('T')[0]
      }
    } catch(error) {
      console.error('Error fetching log data:', error);
    } finally {
      loading.value = false
    }
  }

  const filteredSessions = computed(() => {
    if (!trainingData.value?.length) return []

    return trainingData.value
      .map(session => {
        // filter records inside the session
        const training_records =
          selectedTargetType.value === "all"
            ? session.training_records
            : session.training_records.filter(record =>
              `${record.target}|${record.distance}` === selectedTargetType.value
            )

        return {
          ...session,
          training_records
        }
      })
      .filter(session => {
        const sessionDate = new Date(session.trainingstart)

        if (startDate.value) {
          const start = new Date(startDate.value)
          start.setHours(0, 0, 0, 0)

          if (sessionDate < start) return false
        }

        if (endDate.value) {
          const end = new Date(endDate.value)
          end.setHours(23, 59, 59, 999)

          if (sessionDate > end) return false
        }

        // hide sessions that have no matching records
        return session.training_records.length > 0
      })
  })

  const pointDistributionHistory = computed(() => {
    const labels: string[] = []
    const data: number[] = []

    if(!filteredSessions.value.length) return { labels: [], datasets: [] }

    filteredSessions.value.forEach((session) => {
      const date = new Date(session.trainingstart)
      const label = date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })

      labels.push(label)

      let sumOfAvgs = 0
      session.training_records.forEach((target) => {
        sumOfAvgs += target.avgRingsHit
      })

      const avg = session.training_records.length ? sumOfAvgs / session.training_records.length : 0
      data.push(Number(avg.toFixed(2)))
    })

    return {
      labels,
      datasets: [
        {
          label: "Durchschnittliche Ringe",
          data,
          borderColor: 'rgb(147,51,234)',
          backgroundColor: 'rgba(147,51,234,0.1)',
          tension:0.4,
          fill: true
        }
      ]
    }
  })

  const chartOptions = { responsive:true, plugins:{legend:{display:true, position:'top'}}, scales:{y:{beginAtZero:true, max: 10},x:{ticks: {maxTicksLimit: 20}}} }

  async function exportPdf() {
    await useExportTrainingPdf({userData: archerData.value, sessions: filteredSessions.value, chart: historyChart.value?.chart})
  }

  async function submitTrainingData(newTrainingData: any) {
    try {
      const payload = {
        description: newTrainingData.description,
        location: newTrainingData.location,
        trainingStart: newTrainingData.trainingStart,
        trainingEnd: newTrainingData.trainingEnd,

        records: newTrainingData.scores.map((group: any) => {
          const distribution = {
            X: 0,
            '10': 0,
            '9': 0,
            '8': 0,
            '7': 0,
            '6': 0,
            '5': 0,
            '4': 0,
            '3': 0,
            '2': 0,
            '1': 0,
            M: 0
          }

          group.rounds.forEach((round: any) => {
            round.arrows.forEach((arrow: any) => {
              if(arrow.value) {
                distribution[arrow.value]++
              }
            })
          })

          return {
            targetId: group.target,
            distance: group.distance,

            totalCenters: distribution.X,
            totalTens: distribution['10'],
            totalNines: distribution['9'],
            totalEights: distribution['8'],
            totalSevens: distribution['7'],
            totalSixs: distribution['6'],
            totalFives: distribution['5'],
            totalFours: distribution['4'],
            totalThrees: distribution['3'],
            totalTwos: distribution['2'],
            totalOnes: distribution['1'],
            missed: distribution.M
          }
        })
      }

      const response = await $fetch('/api/postgres/training', { method: 'POST', body: {archerId,payload} })

      if(response.statusCode == 200) {

        fetchData()
        showModal.value = false
      }
    } catch(error) {
      console.error('An Error occured while submitting Training Data: ',error)
      toast.add({
        title: 'Fehler',
        description: 'Beim Speichern der Trainingsdaten ist ein Fehler aufgetreten',
        color: 'error'
      })
    }
  }

  onMounted(() => {
    fetchData()
  })
</script>