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
      <div class="w-full">
        <UButton
        v-if="filteredSessions.length > 0"
        icon="i-heroicons-arrow-down-tray-20-solid"
        color="primary"
        @click="exportPdf"
        />
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

          <UButton
          color="neutral"
          variant="soft"
          @click="() => {
            startDate = null
            endDate = null
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
              <TrainingDoughnutChart :target-data="record" />
            </div>
          </div>
        </div>
      </div>
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

  // const filteredSessions = ref([])

  const historyChart = ref<HTMLElement | null>(null)

  const startDate = ref<string | null>(null)
  const endDate = ref<string | null>(null)

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
    if(!trainingData.value?.length) return []

    return trainingData.value.filter((session) => {
      const sessionDate = new Date(session.trainingstart)

      if(startDate.value) {
        const start = new Date(startDate.value)
        start.setHours(0, 0, 0, 0)

        if(sessionDate < start) return false
      }

      if(endDate.value) {
        const end = new Date(endDate.value)
        end.setHours(0, 0, 0, 0)

        if(sessionDate > end) return false
      }

      return true
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

  const chartOptions = { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:true, position:'top'}}, scales:{y:{beginAtZero:false}} }

  async function exportPdf() {
    console.log("User Data: ",archerData.value)
    console.log("Sessions: ",filteredSessions.value)
    console.log("Chart El: ",historyChart.value?.$el)
    await useExportTrainingPdf({userData: archerData.value, sessions: filteredSessions.value, chartEl: historyChart.value?.$el})
  }

  onMounted(() => {
    fetchData()
  })
</script>