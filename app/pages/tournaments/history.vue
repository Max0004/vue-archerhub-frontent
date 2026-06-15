<template>
  <div v-if="loading">
    Lade...
  </div>
  <div v-else-if="error">
    {{ error }}
  </div>
  <div v-else>
    <div class="grid grid-cols-3 my-2 gap-2">
      <button
      class="w-full border-2 py-2 cursor-pointer"
      :class="selectedChart === 'totalscore' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-black border-gray-300'"
      @click="selectedChart = 'totalscore'"
      >
        Gesamtpunktzahl
      </button>
      <button
      class="w-full border-2 py-2 cursor-pointer"
      :class="selectedChart === 'avghits' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-black border-gray-300'"
      @click="selectedChart = 'avghits'"
      >
        Trefferquote
      </button>
      <button
      class="w-full border-2 py-2 cursor-pointer"
      :class="selectedChart === 'avggoldhits' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-black border-gray-300'"
      @click="selectedChart = 'avggoldhits'"
      >
        Bullseyerate (X, 10, 9)
      </button>
    </div>
    <label for="archers-select">Wähle einen/mehrere Schützen:</label><br>
    <input type="checkbox" id="archers-select-checkbox" v-model="showInactiveArchers">
    <label for="archers-select-checkbox">Inaktive Schützen anzeigen</label><br>
    <select
    id="archers-select"
    multiple
    size="5"
    v-model="selectedArcherIds"
    class="w-full h-32 py-2 border-4"
    >
      <option 
      v-for="archer in uniqueArchers" 
      :key="archer.id" 
      :value="archer.id"
      >
        {{ archer.lastname }} {{ archer.title }} {{ archer.firstname }}
      </option>
    </select>

    <TournamentFilter />

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">

      <!-- Tournament groups -->
      <div>
        <label class="font-bold">Turnierarten</label>

        <select
        multiple
        v-model="selectedTournamentGroups"
        class="w-full h-48 py-2 border-2"
        >
          <option
          v-for="(label, value) in tournamentGroups"
          :key="value"
          :value="Number(value)"
          :disabled="selectedChart == 'avggoldhits' && (value == 66 || value == 67)"
          >
            {{ label }}
          </option>
        </select>
      </div>

      <!-- Start date -->
      <div>
        <label class="font-bold">Von</label>

        <input
        v-model="startDate"
        type="date"
        class="w-full border-2 p-2"
        >
      </div>

      <!-- End date -->
      <div>
        <label class="font-bold">Bis</label>

        <input
        v-model="endDate"
        type="date"
        class="w-full border-2 p-2"
        >
      </div>

    </div>

    <UButton
    v-if="chartComponent && selectedArcherIds.length > 0"
    icon="i-heroicons-arrow-down-tray-20-solid"
    classs="w-full justify-center"
    @click="exportPdf"
    >
      Download Pdf
    </UButton>

    <TournamentChart 
    ref="chartComponent" 
    :all-archers="filteredArchers" 
    :selected-archer-ids="selectedArcherIds" 
    :unique-tournaments="uniqueTournaments" 
    :type="selectedChart"
    />
  </div>
</template>  
<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useExportTournamentHistoryPdf } from '~/composables/pdf/export/exportTournamentHistoryPdf';
  import type { ArcherEntry } from '~/models/ArcherEntry'

  const selectedChart = ref('totalscore');
  const showInactiveArchers = ref(false);
  
  const allArchers = ref<ArcherEntry[]>([])
  const error = ref<string | null>(null)
  const loading = ref(true)

  const selectedTournamentGroups = ref<number[]>([])

  const startDate = ref('')
  const endDate = ref('')

  const chartComponent = ref()

  // build datasetMap from chart datasets
  const datasetMap = computed(() => {
    if (!chartComponent.value?.chartData?.datasets) return {}
    const map: Record<string, (number | null)[]> = {}

    chartComponent.value.chartData.datasets.forEach((ds: any) => {
      map[ds.label] = ds.data
    })

    return map
  })
  
  const selectedArcherIds = ref<string[]>([])
  
  function archerId(a: ArcherEntry) {
    if(a.title) {
      return a.title + " " + a.firstname + ' ' + a.lastname
    }
    return a.firstname + ' ' + a.lastname
  }
  
  const uniqueArchers = computed(() => {
    const map = new Map<string, ArcherEntry>()
    for (const entry of allArchers.value) {
      if(!showInactiveArchers.value && entry.active === false) {
        continue
      }

      const id = archerId(entry)
      if (!map.has(id)) {
        map.set(id, entry)
      }
    }
    return Array.from(map.entries()).map(([id, archer]) => ({ ...archer, id }))
  })
  
  const uniqueTournaments = computed(() => {
    const map = new Map<string, { name: string; date: string }>()

    for (const entry of filteredArchers.value) {
      if (!map.has(entry.tournament_name)) {
        map.set(entry.tournament_name, {
          name: entry.tournament_name,
          date: entry.tournament_date
        })
      }
    }

    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    )
  })

  watch(showInactiveArchers, () => {
    const visibleIds = uniqueArchers.value.map(a => a.id)
    selectedArcherIds.value = selectedArcherIds.value.filter(id =>
      visibleIds.includes(id)
    )
  })
  
  async function fetchData() {
    loading.value = true
    try {
      const response = await $fetch('/api/postgres/tournaments/history', { method: "GET" })
      if (response.error) {
        error.value = 'Fehler beim Einholen der Schützendaten eingetreten'
      } else {
        allArchers.value = response
      }
    } catch (e) {
      error.value = 'Fehler beim Einholen der Schützendaten eingetreten'
    } finally {
      loading.value = false
    }
  }
  
  onMounted(() => {
    fetchData()
  })
  
  function exportPdf() {
    if (!chartComponent.value) {
      alert("Chart nicht gefunden!")
      return
    }

    useExportTournamentHistoryPdf({
      chartElement: chartComponent.value?.chartRoot,
      selectedArchers: selectedArcherIds.value,
      tournaments: chartComponent.value?.relevantTournaments,
      datasetMap: datasetMap.value,
      selectedOption: selectedChart.value
    })
  }

  const tournamentGroups: Record<number, string> = {
    1: "Vereinsmeisterschaft Halle",
    2: "Bezirksmeisterschaft Halle",
    3: "Landesverbandsmeisterschaft Halle",
    4: "Deutsche Meisterschaft Halle",
    5: "Vereinsmeisterschaft Freiluft",
    6: "Kreismeisterschaft Freiluft",
    7: "Bezirksmeisterschaft Freiluft",
    8: "Landesverbandsmeisterschaft Freiluft",
    9: "Deutsche Meisterschaft Freiluft",
    66: "Apfelturnier",
    67: "Fackelschießen"
  }

  const filteredArchers = computed(() => {
    return allArchers.value.filter(entry => {

      // Tournament group filter
      if (
        selectedTournamentGroups.value.length > 0 &&
        !selectedTournamentGroups.value.includes(entry.tournament_group)
      ) {
        return false
      }

      // Date filter
      const tournamentDate = new Date(entry.tournament_date)

      if (startDate.value) {
        const start = new Date(startDate.value)

        if (tournamentDate < start) {
          return false
        }
      }

      if (endDate.value) {
        const end = new Date(endDate.value)

        // Include full day
        end.setHours(23, 59, 59, 999)

        if (tournamentDate > end) {
          return false
        }
      }

      return true
    })
  })
</script>