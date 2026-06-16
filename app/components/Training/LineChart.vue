<template>
  <div class="h-full">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>
<script setup lang="ts">
  import { Chart } from 'chart.js/auto';

  const props = defineProps({
    chartData: { type: Object, required: true },
    chartOptions: { type: Object, required: true }
  })
  
  const chartCanvas = ref(null)
  let chartInstance = null
  
  const renderChart = () => {
    if (chartInstance) chartInstance.destroy()
    if (!chartCanvas.value) return
  
    chartInstance = new Chart(chartCanvas.value.getContext('2d'), {
      type: 'line',
      data: props.chartData,
      options: props.chartOptions
    })
  }
  
  watch(() => props.chartData, renderChart, { deep: true })
  watch(() => props.chartOptions, renderChart, { deep: true })
  
  onMounted(renderChart)
</script>