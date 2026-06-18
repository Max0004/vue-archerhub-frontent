<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-full mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Archerhub Turniertracker</h1>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Turniere</h2>
          <div class="space-y-2 max-h-64 overflow-y-auto pr-2">
            <button
              v-for="t in tournaments"
              :key="t.tournament_id"
              @click="selectedTournament = t.tournament_id; selectedTournamentName = t.tournament_name; selectedAgeBracket = null"
              class="w-full text-left p-4 rounded-lg border-2 transition-colors cursor-pointer"
              :class="selectedTournament === t.tournament_id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'"
            >
              <div class="font-semibold text-gray-900">{{ t.tournament_name }}</div>
              <div class="text-sm text-gray-600 mt-1">
                {{ t.place }}
              </div>
            </button>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Altersklassen</h2>

          <p v-if="!selectedTournament" class="text-gray-500 italic">Please select a tournament first</p>
          <p v-else-if="availableAgeBrackets.length === 0" class="text-gray-500 italic">No age groups available for this tournament</p>

          <div v-else class="space-y-2 max-h-64 overflow-y-auto pr-2">
            <button
              v-for="ab in availableAgeBrackets"
              :key="ab.id"
              @click="selectedAgeBracket = ab.id"
              class="w-full text-left p-4 rounded-lg border-2 transition-colors cursor-pointer"
              :class="selectedAgeBracket === ab.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'"
            >
              <div class="font-semibold text-gray-900">{{ ab.name }}</div>
            </button>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Teilnehmer</h2>

          <p v-if="!selectedTournament" class="text-gray-500 italic">Please select a tournament first</p>
          <p v-else-if="allParticipantsInTournament.length === 0" class="text-gray-500 italic">No archers available for this tournament</p>
          <div v-else class="space-y-2 max-h-64 overflow-y-auto pr-2">
            <label
            v-for="p in availableParticipants"
            :key="p.participantId"
            class="flex items-center space-x-2"
            >
              <input
              type="checkbox"
              v-model="selectedParticipants"
              :value="p.participantId"
              class="rounded border-gray-300"
              />
                <span>{{ p.title ? p.title + " " : "" }}{{ p.firstname }} {{ p.lastname }}</span>
              </label>
          </div>
        </div>
      </div>

      <UButton
      v-if="selectedParticipants.length > 0"
      icon="i-heroicons-arrow-down-tray-20-solid"
      class="w-full justify-center"
      @click="exportPdf"
      > 
        Download Pdf
      </UButton>

      <div ref="roundTrackerChart">
        <TournamentRoundTrackerChart
        :selectedParticipants="selectedParticipants"
        :allParticipantsInTournament="allParticipantsInTournament"
        />
      </div>

      <div>
        <TournamentRoundTrackerTable
        :tableData="tableData"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
  import { ref, computed } from 'vue'
import { useExportRoundTrackerPdf } from '~/composables/pdf/export/exportRoundTrackerPdf';
import { buildRoundTrackerRows } from '~/composables/roundTracker/buildRoundTrackerRows';

  const tournaments = ref([])

  const roundTrackerChart = ref(null)

  const selectedTournament = ref(null)
  const selectedTournamentName = ref(null);
  const selectedAgeBracket = ref(null)

  const selectedParticipants = ref([])
  const selectedParticipantsNames = ref([])

  const tableData = ref({maxRound: 0, rows: []})

  async function exportPdf() {
    await useExportRoundTrackerPdf({
      chartEl: roundTrackerChart.value.querySelector('canvas'),
      tableData: tableData.value,
      selectedArchers: selectedParticipantsNames.value,
      tournament: selectedTournamentName.value
    })
  }

  // AGE GROUPS FOR SELECTED TOURNAMENT
  const availableAgeBrackets = computed(() => {
    if (!selectedTournament.value) return []

    const tournament = tournaments.value.find(t => t.tournament_id === selectedTournament.value)
    if (!tournament) return []

    const groups = {}

    for(const p of tournament.participants) {
      const key = `${p.ageBracketId}-${p.bowClassId}`

      const bowClassName = p.bowClassName === '[Ohne Name]' ? "" : p.bowClassName

      const ageBracket = tournament.age_brackets.find(a => a.ageBracketId === p.ageBracketId)
      
      const ageBracketNameRaw = ageBracket?.ageBracketName ?? ""
      const ageBracketName = ageBracketNameRaw === '[Ohne Name]' ? "" : ageBracketNameRaw

      if(!groups[key]) {
        groups[key] = {
          id: key,
          ageBracketId: p.ageBracketId,
          bowClassId: p.bowClassId,
          name: `${bowClassName ? bowClassName + " " : ""}${ageBracketName}`.trim(),
          bowClassPosition: p.bowClassPosition ?? 0,
          ageBracketPosition: ageBracket?.ageBracketPosition ?? 0
        }
      }
    }

    return Object.values(groups).sort((a, b) => {
      if(a.bowClassPosition !== b.bowClassPosition) {
        return a.bowClassPosition - b.bowClassPosition
      }
      return a.ageBracketPosition - b.ageBracketPosition
    })
  })

  // ALL PARTICIPANTS FOR SELECTED TOURNAMENT
  const allParticipantsInTournament = computed(() => {
    if (!selectedTournament.value) return []
    const t = tournaments.value.find(t => t.tournament_id === selectedTournament.value)
    return t ? t.participants.sort((a,b) => a.lastname.localeCompare(b.lastname)) : []
  })

  // PARTICIPANT LIST TO DISPLAY IN CHECKBOXES
  const availableParticipants = computed(() => {
    // Now independent of age bracket
    return allParticipantsInTournament.value
  })

  // AUTO-SELECT PARTICIPANTS FROM SELECTED AGE BRACKET
  watch(selectedAgeBracket, (newKey) => {
    if (!newKey) {
      selectedParticipants.value = []
      return
    }

    const [ageId, bowId] = newKey.split('-').map(Number)

    const fromBracket = allParticipantsInTournament.value
      .filter(p => p.ageBracketId === ageId && p.bowClassId === bowId)
      .map(p => p.participantId)

    const fromBracketToNames = allParticipantsInTournament.value
      .filter(p => p.ageBracketId === ageId && p.bowClassId === bowId)
      .map(p => {return { title: p.title, name: p.firstname + " " + p.lastname }})

    selectedParticipants.value = fromBracket
    selectedParticipantsNames.value = fromBracketToNames
  })

  // FETCH TOURNAMENTS
  async function fetchTournaments() {
    tournaments.value = await $fetch('/api/postgres/tournaments/roundTracker', { method: "GET" })
    tournaments.value = tournaments.value.filter((tournament => {
      const participants = tournament.participants.filter(participant => {return participant.rounds && participant.rounds.length > 0})
      return participants && participants.length > 0
    }))
  }

  onMounted(() => {
    fetchTournaments()
  })

  watch([allParticipantsInTournament,selectedParticipants],() => {
    tableData.value = buildRoundTrackerRows(allParticipantsInTournament.value,selectedParticipants.value)
  })
</script>