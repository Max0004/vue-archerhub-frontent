<template>
  <div class="p-6">
    <div class="header-bar py-8 px-6">
      <h1 class="text-3xl font-bold mb-2">Turnierarchiv</h1>
    </div>

    <!-- Filter Section -->
    <div class="bg-white shadow-sm">
      <div class="mx-auto px-6 py-6">
        <h2 class="text-lg font-semibold mb-4 text-gray-800">Filter</h2>
  
        <div class="flex flex-wrap gap-4 mb-4">
          <!-- Year Filter -->
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-2">Saison</label>
            <button
            @click="isYearOpen = !isYearOpen"
            class="dropdown-menu"
            >
              <span class="text-gray-700">
                {{ selectedSeason === 'Alle Saisons' ? 'Alle Saisons' : `Saison ${Number(selectedSeason)+1}` }}
              </span>
              <ChevronDown :class="['w-4 h-4 text-gray-500 transition-transform', isYearOpen ? 'rotate-180' : '']"/>
            </button>
  
            <div
            v-if="isYearOpen"
            class="absolute z-10 mt-1 w-48 bg-white border border-gray-300 rounded shadow-lg"
            >
              <button
              v-for="season in seasons"
              :key="season"
              @click="selectYear(season)"
              class="dropdown-menu-selection"
              >
                {{ season === "Alle Saisons" ? season : Number(season) + 1 }}
              </button>
            </div>
          </div>

          <!-- Organizer Filter -->
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-2">Veranstalter</label>
            <button
            @click="isOrganizerOpen = !isOrganizerOpen"
            class="dropdown-menu"
            >
              <span class="text-gray-700 truncate">{{ selectedOrganizer }}</span>
              <ChevronDown
              :class="[
                'w-4 h-4 text-gray-500 transition-transform shrink-0 ml-2',
                isOrganizerOpen ? 'rotate-180' : ''
              ]"
              />
            </button>
  
            <div
            v-if="isOrganizerOpen"
            class="absolute z-10 mt-1 w-64 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto"
            >
              <button
              v-for="organizer in organizers"
              :key="organizer"
              @click="selectOrganizer(organizer)"
              class="dropdown-menu-selection"
              >
                {{ organizer }}
              </button>
            </div>
          </div>
        </div>
  
        <!-- Active Filters -->
        <div v-if="activeFilters.length > 0" class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-700">Aktive Filter</span>
          <span
          v-for="filter in activeFilters"
          :key="filter"
          class="bg-orange-500 text-white text-sm px-3 py-1 rounded-full flex items-center gap-2"
          >
            {{ filter }}
            <button
            @click="removeFilter(filter)"
            class="hover:bg-orange-600 rounded-full cursor-pointer"
            >
              ×
            </button>
          </span>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div class="max-w-full mx-auto py-4">
      <p class="text-gray-600 mb-6 font-medium">
        {{ filteredTournaments.length }} Turniere gefunden
      </p>
  
      <div class="space-y-4">
        <TournamentCard
        v-for="tournament in filteredTournaments"
        :key="tournament.id"
        :tournament="tournament"
        @open-modal="openTournamentModal"
        >
        </TournamentCard>
      </div>
    </div>

    <TournamentModal v-if="showModal" :show="showModal" :tournament="selectedTournament" @close="closeTournamentModal" />
  </div>
</template>
<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { ChevronDown } from 'lucide-vue-next'

  const loading = ref(false)

  const selectedSeason = ref('Alle Saisons')
  const selectedOrganizer = ref('Alle Veranstalter')
  const isYearOpen = ref(false)
  const isOrganizerOpen = ref(false)

  const tournaments = ref([])

  const seasons = computed(() => {
    const uniqueSeasons = [
      ...new Set(
        tournaments.value.map(t => getSeasonYear(t.startdate))
      )
    ]

    return [...uniqueSeasons.sort((a,b) => Number(b) - Number(a))]
  })

  const organizers = computed(() => {
    const uniqueOrganizers = [
      ...new Set(
        tournaments.value.flatMap(t =>
          t.organizers?.map(organizer => organizer.name) ?? []
        )
      )
    ]

    return uniqueOrganizers.sort()
  })

  const filteredTournaments = computed(() => {
    return tournaments.value.filter(t => {
      const tournamentSeason = getSeasonYear(t.startdate)

      return (
        (selectedSeason.value === 'Alle Saisons' ||
          tournamentSeason === selectedSeason.value) &&
        (selectedOrganizer.value === 'Alle Veranstalter' ||
          t.organizers?.some(organizer => organizer.name === selectedOrganizer.value))
      )
    })
  })
  
  const activeFilters = computed(() => {
    const filters = []
    if (selectedSeason.value !== 'Alle Saisons') filters.push(`Saison ${Number(selectedSeason.value) + 1}`)
    if (selectedOrganizer.value !== 'Alle Veranstalter') filters.push(selectedOrganizer.value)
    return filters
  })

  function getSeasonYear(dateString: string) {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1

    return month >= 10 ? year.toString() : (year - 1).toString()
  }
  
  function selectYear(year) {
    selectedSeason.value = year
    isYearOpen.value = false
  }
  
  function selectOrganizer(org) {
    selectedOrganizer.value = org
    isOrganizerOpen.value = false
  }
  
  function removeFilter(filter) {
    if (filter.includes('Saison')) {
      selectedSeason.value = 'Alle Saisons'
    } else {
      selectedOrganizer.value = 'Alle Veranstalter'
    }
  }

  const showModal = ref(false);
  const selectedTournament = ref(null);

  const openTournamentModal = (tournament) => {
    selectedTournament.value = tournament;
    showModal.value = true;
  }

  const closeTournamentModal = () => {
    showModal.value = false;
    selectedTournament.value = null;
  }

  async function fetchTournamentData() {
    loading.value = true
    tournaments.value = await $fetch('/api/postgres/tournaments/archive/allTournamentsWithScores', {method: "GET"})
    loading.value = false
  }

  onMounted(() => {
    fetchTournamentData()
  })
</script>