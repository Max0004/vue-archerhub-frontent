<template>
  <div class="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-xl shadow-lg p-8">
        <div class="flex items-center gap-3 mb-6">
          <Users class="w-8 h-8 text-blue-600" />
          <h1 class="text-3xl font-bold text-gray-900">Teamergebnisse Eintragen</h1>
        </div>

        <!-- Error -->
        <div
          v-if="error"
          class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
        >
          <AlertCircle class="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p class="text-red-800">{{ error }}</p>
        </div>

        <!-- Success -->
        <div
          v-if="success"
          class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
        >
          <CheckCircle class="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <p class="text-green-800">Teamergebnisse erfolgreich gespeichert!</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Tournament -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Turnier *
            </label>
            <select
              v-model="selectedTournament"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Turnier Auswählen...</option>
              <option
                v-for="t in tournaments"
                :key="t.id"
                :value="t.id"
              >
                {{ t.name }}
              </option>
            </select>
          </div>

          <!-- Club -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Verein *
            </label>
            <select
              v-model="selectedClub"
              :disabled="!selectedTournament"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg disabled:bg-gray-100"
              required
            >
              <option value="">Verein Auswählen...</option>
              <option v-for="c in clubs" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Age Bracket -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Altersklasse *
              </label>
              <select
                v-model="selectedAgeBracket"
                :disabled="!selectedTournament"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg disabled:bg-gray-100"
                required
              >
                <option value="">Altersklasse Auswählen...</option>
                <option
                  v-for="ab in ageBrackets"
                  :key="ab.id"
                  :value="ab.id"
                >
                  {{ ab.name }}
                  <span v-if="ab.minimumAge && ab.maximumAge">
                    ({{ ab.minimumAge }}-{{ ab.maximumAge }})
                  </span>
                </option>
              </select>
            </div>

            <!-- Bow Class -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Bogenklasse *
              </label>
              <select
                v-model="selectedBowClass"
                :disabled="!selectedTournament"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg disabled:bg-gray-100"
                required
              >
                <option value="">Bogenklasse Auswählen...</option>
                <option
                  v-for="bc in bowClasses"
                  :key="bc.id"
                  :value="bc.id"
                >
                  {{ bc.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Participants -->
          <div v-if="participants.length">
            <label class="block text-sm font-semibold text-gray-700 mb-3">
              Teammitglieder Auswählen *
            </label>
            <div class="border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto bg-gray-50">
              <div class="space-y-2">
                <label
                  v-for="p in participants"
                  :key="p.id"
                  class="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                  :class="selectedParticipants.includes(p.id)
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-white border-2 border-transparent'"
                >
                  <input
                    type="checkbox"
                    v-model="selectedParticipants"
                    :value="Number(p.id)"
                    class="w-5 h-5"
                  />
                  <div class="flex-1">
                    <div class="font-medium">
                      {{ p.title }} {{ p.firstname }} {{ p.lastname }}
                    </div>
                    <div class="text-sm text-gray-600">
                      {{ convertGender(p.gender) }} • Klassenplatzierung: {{ p.rank || 'n.z.Q.' }}
                    </div>
                    <div class="text-sm text-gray-600">
                      Gesamtergebnis: {{ p.total_score }}
                    </div>
                  </div>
                </label>
              </div>
            </div>
            <p class="text-sm text-gray-600 mt-2">
              {{ selectedParticipants.length }} Mitglieder ausgewählt
            </p>
            <div>
              <label class="block text-sm font-semibold text-gray-700 my-2">Platzierung</label>
              <input 
              v-model="rank"
              type="number"
              placeholder="Final rank"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg disabled:bg-gray-100"
              />
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex gap-4 pt-4">
            <button
              type="submit"
              :disabled="loading || selectedParticipants.length < 3 || !rank"
              class="flex-1 bg-blue-600 text-white py-3 rounded-lg disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed"
            >
              {{ loading ? 'Team wird erstellt...' : 'Team erstellen' }}
            </button>
            <button
              type="button"
              @click="hardResetForm"
              class="px-6 py-3 border-2 rounded-lg cursor-pointer"
            >
              Zurücksetzen
            </button>
          </div>
        </form>

        <!-- Info -->
        <div class="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 class="font-semibold mb-2">Team-Anforderungen</h3>
          <ul class="text-sm space-y-1">
            <li>• Selber Verein</li>
            <li>• Selbe Bogenklasse</li>
            <li>• Selbe Altersklasse</li>
            <li>• Geschlechterübergreifend möglich</li>
            <li>• Nicht angetretene Schützen sind als Teammitglieder zulässig</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { AlertCircle, Users, CheckCircle } from 'lucide-vue-next'
import connectedAgeBrackets from "~/assets/data/connectedAgeBrackets.json"

const tournaments = ref([])
const clubs = ref([])
const ageBrackets = ref([])
const bowClasses = ref([])
const participants = ref([])

const selectedTournament = ref('')
const selectedClub = ref('')
const selectedAgeBracket = ref('')
const selectedBowClass = ref('')
const selectedParticipants = ref([])

const rank = ref('')

const loading = ref(false)
const error = ref('')
const success = ref(false)

onMounted(fetchTournaments)

watch(selectedTournament, async (val) => {
  if (!val) return
  resetDependentSelections()
  await fetchTournamentData()
})

watch([selectedTournament, selectedClub, selectedAgeBracket, selectedBowClass],
  async ([t, c, a, b]) => {
    if (t && c && a && b) {
      await fetchParticipants()
    }
  }
)

async function fetchTournaments() {
  loading.value = true
  try {
    const res = await $fetch('/api/postgres/tournaments')
    tournaments.value = res
  } catch {
    error.value = 'Turniere konnten nicht geladen werden'
  } finally {
    loading.value = false
  }
}

async function fetchTournamentData() {
  loading.value = true
  try {
    const tournamentId = selectedTournament.value

    const [clubsData, bracketsData, classesData] = await Promise.all([
      $fetch(`/api/postgres/club/${tournamentId}`, { method: 'GET' }),
      $fetch(`/api/postgres/ageBrackets/${tournamentId}`, { method: 'GET' }),
      $fetch(`/api/postgres/bowClasses/${tournamentId}`, { method: 'GET' })
    ])

    clubs.value = clubsData
    // ageBrackets.value = bracketsData.sort((a, b) => a.position - b.position)
    bowClasses.value = classesData.sort((a, b) => a.position - b.position)

    const sortedBrackets = bracketsData.sort((a,b) => a.position - b.position)
    const mergedBrackets = [...sortedBrackets]
    const parentIdsToAdd = []
    
    sortedBrackets.forEach(bracket => {
      connectedAgeBrackets.forEach(jsonBracket => {
        if(jsonBracket.children.includes(bracket.id)) parentIdsToAdd.push({id: jsonBracket.parent, name: jsonBracket.parentName})
      })
    })

    parentIdsToAdd.forEach((p => {
      if(!mergedBrackets.some(b => b.id === p.id)) mergedBrackets.push({ id: p.id, name: p.name, position: 0 })
    }))

    ageBrackets.value = mergedBrackets.sort((a, b) => a.name.localeCompare(b.name))
  } catch (err) {
    error.value = 'Turnierdaten konnten nicht erfolgreich abgerufen werden'
  } finally {
    loading.value = false
  }
}

async function fetchParticipants() {
  loading.value = true

  const tournamentId = selectedTournament.value;
  const clubId = selectedClub.value;
  const bowClassId = selectedBowClass.value;

  const ageBracketIds = connectedAgeBrackets.find(bracket => bracket.parent === selectedAgeBracket.value)?.children ?? [Number(selectedAgeBracket.value)]

  try {
    participants.value = await $fetch(`/api/postgres/archer/filteredParticipants`,{
      method: 'GET',
      query: { tournamentId, clubId, ageBracketIds: ageBracketIds.join(','), bowClassId }
    })
  } catch {
    error.value = 'Es konnten keine Schützen basierend auf den Turnierdaten abgerufen werden'
  } finally {
    loading.value = false
  }
}

function resetDependentSelections() {
  selectedClub.value = ''
  selectedAgeBracket.value = ''
  selectedBowClass.value = ''
  participants.value = []
  selectedParticipants.value = []
  rank.value = ''
}

function resetForm() {
  resetDependentSelections()
  error.value = ''
}

function hardResetForm() {
  resetForm()
  clubs.value = []
  ageBrackets.value = []
  bowClasses.value = []
  selectedTournament.value = ''
}

async function handleSubmit() {
  error.value = ''
  success.value = false

  if (selectedParticipants.value.length < 3) {
    error.value = 'Bitte mindestens drei Schützen auswählen'
    return
  }

  loading.value = true

  const data = {
    team: {
      tournament: selectedTournament.value,
      bowClass: selectedBowClass.value,
      ageBracket: selectedAgeBracket.value,
      rank: rank.value
    },
    teamMembers: selectedParticipants.value
  }
  try {
    const res = await $fetch('/api/postgres/tournaments/team', {
      method: 'POST',
      body: data
    })

    if (!res.success) throw new Error()

    success.value = true
    selectedParticipants.value = []

    setTimeout(() => {
      success.value = false
      resetForm()
    }, 2000)
  } catch {
    error.value = 'Team konnte nicht erstellt werden. Versuche es später erneut.'
  } finally {
    loading.value = false
  }
}
</script>