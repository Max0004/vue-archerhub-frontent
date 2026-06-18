<template>
  <div v-if="tableData?.rows?.length" class="bg-white rounded-lg shadow p-6 mt-10">
    <h2 class="text-xl font-semibold mb-4">Rundenübersicht</h2>
    <table class="min-w-full border-collapse">
      <thead>
        <tr>
          <th class="border-b p-2 text-left">Schütze</th>
          <th v-for="round in tableData?.maxRound" :key="round" class="border-b p-2 text-center">
            Runde {{ round }}<br/>
          </th>
          <th class="border-b p-2 text-center">Gesamt</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in tableData?.rows" :key="row.id" class="border-t">
          <td class="p-2 font-semibold">{{ row.name }}</td>
          <td v-for="r in row.rounds" :key="r.round" class="p-2 text-center">
            <div>{{ r.score }}</div>
            <div v-if="r.diff !== null" :class="r.diff > 0 ? 'text-green-600' : r.diff < 0 ? 'text-red-600' : 'text-gray-600'" class="text-sm">
              <span v-if="r.diff > 0">▲</span>
              <span v-else-if="r.diff < 0">▼</span>
              {{ r.diff.toFixed(1) }}%
            </div>
          </td>
          <td class="p-2 font-bold text-center">{{ row.total }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup lang="ts">
  const props = defineProps({
    tableData: Object
  })
</script>