<template>
  <div class="grid grid-cols-3 my-2 gap-2">
    <UButton
    class="w-full border-2 py-2 cursor-pointer"
    :color="selectedChart === 'totalscore' ? 'secondary' : 'neutral'"
    @click="selectedChart = 'totalscore'"
    >
      Gesamtpunktzahl
    </UButton>
    <UButton
    class="w-full border-2 py-2 cursor-pointer"
    :color="selectedChart === 'avghits' ? 'secondary' : 'neutral'"
    @click="selectedChart = 'avghits'"
    >
      Trefferquote
    </UButton>
    <UButton
    class="w-full border-2 py-2 cursor-pointer"
    :color="selectedChart === 'avggoldhits' ? 'secondary' : 'neutral'"
    @click="selectedChart = 'avggoldhits'"
    >
      Bullseyerate (X, 10, 9)
    </UButton>
  </div>
</template>
<script setup lang="ts">
  const selectedChart = useHistoryChartTypeState()
</script>