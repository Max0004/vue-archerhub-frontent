<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">

  <USelectMenu 
  v-model="filterSettings.selectedTournamentGroups" 
  :items="tournamentOptions" 
  multiple
  value-key="value"
  label-key="label" 
  class="w-full" />

  <!-- Start date -->
  <div>
    <label class="font-bold">Von</label>
    <UInputDate v-model="startDate" class="w-full" />
  </div>

  <!-- End date -->
  <div>
    <label class="font-bold">Bis</label>
    <UInputDate v-model="endDate" class="w-full" />
  </div>

  </div>
</template>
<script setup lang="ts">
  import { CalendarDate, parseDate } from "@internationalized/date"

  const props = defineProps<{
    tournamentGroups: Record<number, string>
  }>()

  const selectedChart = useHistoryChartTypeState()
  const filterSettings = useHistoryFilterSettingsState()

  const tournamentOptions = computed(() =>
    Object.entries(props.tournamentGroups).map(([value, label]) => ({
      label,
      value: Number(value),
      disabled:
        selectedChart.value === "avggoldhits" &&
        (Number(value) === 66 || Number(value) === 67)
    }))
  )

  const startDate = computed({
    get() {
      return filterSettings.value.startDate
        ? parseDate(filterSettings.value.startDate)
        : null
    },
    set(value: CalendarDate | null) {
      filterSettings.value.startDate = value?.toString() ?? ""
    }
  })

  const endDate = computed({
    get() {
      return filterSettings.value.endDate
        ? parseDate(filterSettings.value.endDate)
        : null
    },
    set(value: CalendarDate | null) {
      filterSettings.value.endDate = value?.toString() ?? ""
    }
  })
</script>