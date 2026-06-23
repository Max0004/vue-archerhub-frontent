<template>
  <div class="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
    <div class="max-w-7xl mx-auto p-6">
      <div class="bg-white rounded-xl shadow-lg p-6">

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
          <div
            v-for="t in tournaments"
            :key="t.id"
            class="border border-slate-200 rounded-lg p-4 hover:shadow-md"
          >
            <h3 class="text-xl font-semibold text-slate-800 mb-2">
              {{ t.name }}
            </h3>

            <div class="grid grid-cols-1 gap-2 text-sm text-slate-600">
              <div class="flex items-center gap-2">
                <Award size="16" />
                <span>Organisiert durch: {{ t.organizer }}</span>
              </div>

              <div class="flex items-center gap-2">
                <Calendar size="16" />
                <span v-if="t.until">Von: {{ formatDate(t.from) }}</span>
                <span v-else>{{ formatDate(t.from) }}</span>
              </div>

              <div v-if="t.until" class="flex items-center gap-2">
                <Calendar size="16" />
                <span>Bis: {{ formatDate(t.until) }}</span>
              </div>

              <div class="flex items-center gap-2">
                <MapPin size="16" />
                <span>{{ t.place }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import {  
    Calendar, 
    Award, 
    MapPin ,
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