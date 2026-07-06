<template>
  <div class="container mx-auto py-10 space-y-12">
    <div class="bg-white p-2 rounded-xl">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">
            Turniere
          </h1>
          <p class="text-slate-600">
            {{ tournaments.length }} Turnier{{ tournaments.length !== 1 ? 'e' : '' }}
          </p>
        </div>

        <div class="relative">
          <button
          class="primary-btn inline-flex items-center gap-2"
          @click="showAddMenu = !showAddMenu"
          >
            <Plus size="16" />
            Neu hinzufügen
            <ChevronDown size="16" />
          </button>

          <div
          v-if="showAddMenu"
          class="absolute right-0 mt-2 w-64 bg-blue-600 text-white rounded-lg shadow-lg z-10"
          >
            <NuxtLink
            to="/form/tournament"
            class="block px-4 py-3 hover:bg-blue-700 border"
            @click="showAddMenu = false"
            >
              Turnier erstellen
            </NuxtLink>

            <NuxtLink
            to="/form/tournament/participation"
            class="block px-4 py-3 hover:bg-blue-700 border"
            @click="showAddMenu = false"
            >
              Turnierergebnisse hinzufügen
            </NuxtLink>

            <NuxtLink
            to="/form/tournament/teams"
            class="block px-4 py-3 hover:bg-blue-700 border"
            @click="showAddMenu = false"
            >
              Teamergebnisse hinzufügen
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Tournament list -->
      <div class="grid gap-4">
        <TournamentCard
        v-for="tournament in tournaments"
        :key="tournament.id"
        :tournament="tournament"
        >
        </TournamentCard>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import {  
    Plus ,
    ChevronDown
  } from 'lucide-vue-next'

  const showAddMenu = ref(false)

  const tournaments = ref([])

  function formatDate(date) {
    return new Date(date).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
  }

  async function fetchTournaments() {
    tournaments.value = await $fetch('/api/postgres/tournaments', {
      method: 'GET'
    })
  }

  onMounted(() => {
    fetchTournaments()
  })
</script>