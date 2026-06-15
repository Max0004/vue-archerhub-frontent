<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
    <!-- Header -->
    <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div class="flex items-center gap-3 mb-2">
        <Target class="w-8 h-8 text-blue-600" />
        <h1 class="text-3xl font-bold text-slate-800">
          Turnier erstellen
        </h1>
      </div>
    </div>

    <!-- Form -->
    <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <UForm
      class="space-y-8"
      @submit.prevent="createTournament"
      >
        <!-- General -->
        <div>
          <h2 class="text-lg font-semibold text-slate-800 mb-4">
            Allgemeine Informationen
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Turniername" required>
              <UInput v-model="tournament.name" class="w-full rounded-lg border border-slate-300" />
            </UFormField>

            <UFormField label="Veranstalter" required>
              <USelect v-model="tournament.organizedBy" :items="clubs" class="w-full border border-slate-300" />
            </UFormField>

            <UFormField label="Turniergruppe" required>
              <UInputNumber v-model="tournament.tournamentGroup" :min="0" class="w-full border border-slate-300 " />
            </UFormField>

            <UFormField label="Austragungsort" required>
              <UInput v-model="tournament.place" class="w-full rounded-lg border border-slate-300" />
            </UFormField>
          </div>
        </div>

        <!-- Dates -->
        <div>
          <h2 class="text-lg font-semibold text-slate-800 mb-4">
            Datum
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Begin" required>
              <UInputDate v-model="tournament.from" :default-value="defaultStartDate" />
            </UFormField>

            <UFormField label="Ende">
              <UInputDate v-model="tournament.until" />
            </UFormField>
          </div>
        </div>

        <!-- Scoring -->
        <div>
          <h2 class="text-lg font-semibold text-slate-800 mb-4">
            Wertungsregeln
          </h2>

          <div class="space-y-3">
            <UFormField label="X Auflisten">
              <UCheckbox v-model="tournament.centersCounted" />
            </UFormField>
            <UFormField label="Neuner Auflisten">
              <UCheckbox v-model="tournament.ninesCounted" />
            </UFormField>
            <UFormField label="Gold-Treffer (X, 10, 9) Auflisten">
              <UCheckbox v-model="tournament.goldCounted" />
            </UFormField>
          </div>
        </div>

        <!-- Awards -->
        <div>
          <h2 class="text-lg font-semibold text-slate-800 mb-4">
            Auszeichnungen
          </h2>

          <div class="space-y-4">
            <UFormField label="Titel für Gewinner">
              <UInput v-model="tournament.titleByWinning" class="w-full rounded-lg border border-slate-300" placeholder="z.B. Landesmeister" />
            </UFormField>
            <UFormField label="Medaille auch bei Abwesenheit vergeben">
              <UCheckbox v-model="tournament.earnMedalInAbsence" />
            </UFormField>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end">
          <button
          type="submit"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition"
          >
            Turnier erstellen
          </button>
        </div>
      </UForm>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { CalendarDate } from '@internationalized/date'
  const tournament = ref({
    name: '',
    organizedBy: null,
    from: '',
    until: '',
    tournamentGroup: 0,
    place: '',
    centersCounted: false,
    ninesCounted: false,
    titleByWinning: null,
    earnMedalInAbsence: false,
    goldCounted: true
  })

  const clubs = ref([])

  const currentDate = new Date()

  const defaultStartDate = shallowRef(new CalendarDate(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate()))

  async function createTournament() {
    await $fetch('/api/postgres/tournaments', {
      method: 'POST',
      body: {
        ...tournament.value,
        from: new Date(tournament.value.from),
        until: tournament.value.until
          ? new Date(tournament.value.until)
          : null
      }
    })
  }

  async function fetchClubs() {
    const response = await $fetch('/api/postgres/clubs', {
      method: 'GET'
    })
    clubs.value = response.map((club: any) => ({
      label: club.name,
      value: club.id
    }))
  }

  onMounted(() => {
    fetchClubs()
  })
</script>