<template>
  <div class="container mx-auto py-10 space-y-12">
    <!-- By Point Average -->
    <section>
      <div class="bg-white p-2 rounded-xl">
        <h2 class="text-2xl font-semibold mb-4">🏅 Schützen nach höchstem Ringdurchschnitt (Saison {{ currentYear }})</h2>
        <div v-if="!topTenByPoints.length" class="bg-white shadow rounded-xl p-6">
          <p>Es gibt momentan noch keine Ergebnisse für dieses Jahr</p>
        </div>
        <MainLeaderboard
        v-else
        :items="topTenByPoints"
        :loading="loadingPoints"
         >
          <template #left="{ item, index }">
            <div :class="getRankingStyle(item.rnk - 1)" class="flex flex-col">
              <!-- First row: rank + name -->
              <div class="flex items-center justify-between w-full">
                <span class="font-medium">
                  {{ item.rnk }}. {{ item.title }} {{ item.firstname }} {{ item.lastname }}
                </span>
              </div>

              <!-- Second row: tournament + class info -->
              <div class="text-sm text-gray-600">
                {{ item.tournament_name }}
                <span>
                  (
                    {{
                      item.bowclass_name === "[Ohne Name]" ? "" : item.bowclass_name + " "
                    }}{{
                      item.agebracket_name === "[Ohne Name]" ? "" : item.agebracket_name
                    }}
                  )
                </span>
              </div>
            </div>
          </template>

          <template #right="{ item }">
            <div
            class="flex items-center gap-3 justify-end"
            :class="getRankingStyle(item.rnk - 1)"
            >
              <span class="flex items-center gap-1 font-bold">
                {{ item.yearly_average }}
              </span>
            </div>
          </template>
        </MainLeaderboard>
      </div>
      <button
      v-if="topTenByPoints.length > 0"
      class="primary-btn"
      @click="downloadLeaderboard(topTenByPoints, `Schützen nach höchstem Ringdurchschnitt (Saison ${currentYear})`, 1)"
      >
        Download Tabelle
      </button>
    </section>

    <!-- By Improvement -->
    <section>
      <div class="bg-white p-2 rounded-xl">
        <h2 class="text-2xl font-semibold mb-4">📈 Schützen nach Verbesserung zum Vorjahr ({{ currentYear - 1 }} - {{ currentYear }})</h2>
        <div v-if="!topTenByYearImprovement.length" class="bg-white shadow rounded-xl p-6">
          <p>Es gibt momentan noch keine Ergebnisse für dieses Jahr</p>
        </div>
        <MainLeaderboard
        v-else
        :items="topTenByYearImprovement"
        :loading="loadingImprovement"
        :useRanks="false"
        >
          <template #left="{ item, index }">
            <div :class="getRankingStyle(index)">
              {{ index + 1 }}. {{ item.title }} {{ item.firstname }} {{ item.lastname }}
            </div>
          </template>

          <template #right="{ item, index }">
            <div class="flex items-center gap-3" :class="getRankingStyle(index)">
              <span class="flex items-center gap-1">
                <span :class="
                  {
                    'text-green-600': item.improvement > 0,
                    'text-red-600': item.improvement < 0,
                    'text-gray-500': item.improvement === 0
                  }"
                >
                  {{ improvementSymbol(item.improvement) }}
                </span>
                <strong>{{ item.improvement >= 0 ? item.improvement : item.improvement * -1 }}</strong>
              </span>
            </div>
          </template>
        </MainLeaderboard>
      </div>
      <button
      v-if="topTenByYearImprovement.length > 0"
      class="primary-btn"
      @click="downloadLeaderboard(topTenByYearImprovement, `Schützen nach Verbesserung zum Vorjahr (${currentYear - 1} - ${currentYear})`, 2)"
      >
        Download Tabelle
      </button>
    </section>

    <!-- Medals -->
    <section>
      <div class="bg-white p-2 rounded-xl">
        <h2 class="text-2xl font-semibold mb-4">
    🥇    Medaillenspiegel (Saison {{ currentYear }})
        </h2>
        <div v-if="!topTenMedalists.length" class="bg-white shadow rounded-xl p-6">
          <p>Es gibt momentan noch keine Ergebnisse für dieses Jahr</p>
        </div>
        <MainLeaderboard
        v-else
        :items="topTenMedalists"
        :loading="loadingMedals"
        >
          <template #left="{ item }">
            <div :class="getRankingStyle(Number(item.place)-1)">
              {{ item.place }}. {{ item.title }} {{ item.firstname }} {{ item.lastname }}
            </div>
          </template>

          <template #right="{ item }">
            <div class="flex items-center gap-3">
              <span class="flex items-center gap-1">
                🥇 <strong>{{ item.gold }}</strong>
              </span>
              <span class="flex items-center gap-1">
                🥈 <strong>{{ item.silver }}</strong>
              </span>
              <span class="flex items-center gap-1">
                🥉 <strong>{{ item.bronze }}</strong>
              </span>
            </div>
          </template>
        </MainLeaderboard>
      </div>
      <button
      v-if="topTenMedalists.length > 0"
      class="primary-btn"
      @click="downloadLeaderboard(topTenMedalists, `Medallienspiegel (${currentYear})`, 3)"
      >
        Download Tabelle
      </button>
    </section>
  </div>
</template>
<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useExportLeaderboardPdf } from '~/composables/pdf/export/exportAvgLeaderboardPdf'

  const topTenByPoints = ref([])
  const topTenByYearImprovement = ref([])

  const loadingPoints = ref(true)
  const loadingImprovement = ref(true)

  const topTenMedalists = ref([])
  const loadingMedals = ref(true)

  const currentYear = new Date().getFullYear()

  function improvementSymbol(value: number) {
    if (value > 0) return "▲"
    if (value < 0) return "▼"
    return "◼"
  }

  async function downloadLeaderboard(leaderboard, leaderboardHeader, leaderboardType) {
    await useExportLeaderboardPdf({leaderboard, leaderboardHeader, leaderboardType})
  }

  async function fetchTopTenByPoints() {
    loadingPoints.value = true
    topTenByPoints.value = await $fetch('/api/postgres/leaderboard/topAverageScoresOfCurrentSeason', { method: 'GET' });
    loadingPoints.value = false
  }

  async function fetchTopTenByImprovement() {
    loadingImprovement.value = true
    topTenByYearImprovement.value = await $fetch('/api/postgres/leaderboard/topImprovementsOfCurrentSeason', { method: 'GET' });
    loadingImprovement.value = false
  }

  async function fetchTopTenMedalists() {
    loadingMedals.value = true
    topTenMedalists.value = await $fetch('/api/postgres/leaderboard/topMedalistsOfCurrentSeason', { method: 'GET' });
    loadingMedals.value = false
  }

  onMounted(() => {
    fetchTopTenByPoints()
    fetchTopTenByImprovement()
    fetchTopTenMedalists()
  })
</script>