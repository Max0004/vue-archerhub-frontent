<template>
  <div v-if="loading">
    Lade...
  </div>
  <div v-else-if="error">
    {{ error }}
  </div>
  <div v-else>
    <TournamentHistoryChartSelector />

    <div>
      <label for="archers-select">Wähle einen/mehrere Schützen:</label><br>
      <input type="checkbox" id="archers-select-checkbox" v-model="showInactiveArchers">
      <label for="archers-select-checkbox">Inaktive Schützen anzeigen</label><br>

      <USelectMenu v-model="selectedArcherIds" multiple :items="archerMenuContent" class="w-full h-8" />
    </div>

    <TournamentHistoryFilter :tournamentGroups="tournamentGroups" />

    <UButton
    v-if="chartComponent && selectedArcherIds.length > 0"
    icon="i-heroicons-arrow-down-tray-20-solid"
    color="secondary"
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

  const selectedChart = useHistoryChartTypeState();
  const showInactiveArchers = ref(false);
  
  const allArchers = ref<ArcherEntry[]>([])
  const error = ref<string | null>(null)
  const loading = ref(true)

  const filterSettings = useHistoryFilterSettingsState()

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
  const archerMenuContent = computed(() => {
    return uniqueArchers.value.map((entry) => entry.id)
  })
  
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
      chartElement: chartComponent.value?.chartRoot?.querySelector('canvas'),
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
        filterSettings.value.selectedTournamentGroups.length > 0 &&
        !filterSettings.value.selectedTournamentGroups.includes(entry.tournament_group)
      ) {
        return false
      }

      // Date filter
      const tournamentDate = new Date(entry.tournament_date)

      if (filterSettings.value.startDate) {
        const start = new Date(filterSettings.value.startDate)

        if (tournamentDate < start) {
          return false
        }
      }

      if (filterSettings.value.endDate) {
        const end = new Date(filterSettings.value.endDate)

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