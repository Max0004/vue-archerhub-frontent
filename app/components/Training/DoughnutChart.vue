<template>
  <div>
    <p v-if="targetData.score <= 0" class="text-center text-sm">Keine Punkte aufgeschrieben für diese Scheibe</p>
      <div v-else>
        <Doughnut :data="getPointDistributionData(targetData)" :options="getPieChartOptions()"/>
        <p class="text-center text-sm text-gray-600">Geschossene Pfeile: {{ targetData.arrowsShot }}</p>
        <p class="text-center text-sm text-gray-600">Durchschnitt: {{ roundAvgHits(targetData.avgRingsHit) }}</p>
      </div>
      <p class="text-center text-sm text-gray-600">Scheibe: {{ targetData.target }} ({{ targetData.distance }}m)</p>
  </div>
</template>
<script setup lang="ts">
  import ringSettings from "~/assets/data/RingSettings.json";
  import { Doughnut } from 'vue-chartjs';
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
  
  // Register necessary components for Chart.js
  ChartJS.register(CategoryScale, ArcElement, LinearScale, Title, Tooltip, Legend, PointElement, LineElement);

  defineProps({
    targetData: {
      type: Object,
      required: true
    }
  })

  const getPointDistributionData = (target: any) => {
    const pointData = {
      labels: ringSettings.map((settings) => settings.label),
      datasets: [
        {
          data: [
            target.totalCenters,
            target.totalTens,
            target.totalNines,
            target.totalEights,
            target.totalSevens,
            target.totalSixs,
            target.totalFives,
            target.totalFours,
            target.totalThrees,
            target.totalTwos,
            target.totalOnes,
            target.missed,
          ],
          backgroundColor: ringSettings.map((settings) => settings.color)
        },
      ],
    };
    return pointData;
  };

  function getPieChartOptions() {
    const options = {
      aspectRatio: 2,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              const dataset = context.dataset;
              const total = dataset.data.reduce((sum: number, val: number) => sum + val, 0);
              const value = dataset.data[context.dataIndex];
              const percentage = total ? ((value / total) * 100).toFixed(1) : 0;
              return `${percentage}%`;
            }
          }
        },
      }
    }
    return options;
  }

  const roundAvgHits = (avgHits: any) => {
    return avgHits.toFixed(2);
  }
</script>