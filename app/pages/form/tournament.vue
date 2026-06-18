<template>
  <div class="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
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
      :schema="tournamentSchema"
      :state="tournament"
      class="space-y-8"
      @submit="createTournament"
      >
        <!-- General -->
        <div>
          <h2 class="text-lg font-semibold text-slate-800 mb-4">
            Allgemeine Informationen
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Turniername" name="name" required>
              <UInput v-model="tournament.name" class="w-full rounded-lg border border-slate-300" />
            </UFormField>

            <UFormField label="Veranstalter" name="organizedBy" required>
              <USelect v-model="tournament.organizedBy" :items="clubs" class="w-full border border-slate-300" />
            </UFormField>

            <UFormField label="Turniergruppe" name="tournamentGroup" required>
              <USelect v-model="tournament.tournamentGroup" :items="tournamentGroups" class="w-full border border-slate-300" />
            </UFormField>

            <UFormField label="Austragungsort" name="place" required>
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
            <UFormField label="Begin" name="from" required>
              <UInputDate v-model="tournament.from" :default-value="defaultStartDate" />
            </UFormField>

            <UFormField label="Ende" name="until">
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
            <UFormField label="X Auflisten" name="centersCounted">
              <UCheckbox v-model="tournament.centersCounted" />
            </UFormField>
            <UFormField label="Neuner Auflisten" name="ninesCounted">
              <UCheckbox v-model="tournament.ninesCounted" />
            </UFormField>
            <UFormField label="Gold-Treffer (X, 10, 9) Auflisten" name="goldCounted">
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
            <UFormField label="Titel für Gewinner" name="titleByWinning">
              <UInput v-model="tournament.titleByWinning" class="w-full rounded-lg border border-slate-300" placeholder="z.B. Landesmeister" />
            </UFormField>
            <UFormField label="Medaille auch bei Abwesenheit vergeben" name="earnMedalInAbsence">
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
import type { FormSubmitEvent } from '@nuxt/ui'
import { format } from 'date-fns'
import { tournamentSchema } from '~/composables/validation/tournament'
  const tournament = ref<tournamentSchema>({
    name: '',
    organizedBy: 999,
    from: '',
    until: undefined,
    tournamentGroup: 0,
    place: '',
    centersCounted: false,
    ninesCounted: false,
    titleByWinning: null,
    earnMedalInAbsence: false,
    goldCounted: true
  })

  const toast = useToast()

  const clubs = ref([])

  const tournamentGroups = ref([])

  const currentDate = new Date()

  const defaultStartDate = shallowRef(new CalendarDate(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate()))

  async function createTournament(event: FormSubmitEvent<tournamentSchema>) {
    const data = event.data

    const response = await $fetch('/api/postgres/tournaments', {
      method: 'POST',
      body: {
        ...data,
        from: format(new Date(data.from),"yyyy-MM-dd"),
        until: data.until
          ? format(new Date(data.until),"yyyy-MM-dd")
          : null
      }
    })

    if(!response.statusCode) {
      toast.add({
        title: "Turnier konnte nicht erstellt werden."
      })
    }

    await navigateTo('/tournaments')
  }

  async function fetchClubs() {
    const response = await $fetch('/api/postgres/club', {
      method: 'GET'
    })
    clubs.value = response.map((club: any) => ({
      label: club.name,
      value: club.id
    }))
  }

  async function fetchTournamentGroups() {
    const response = await $fetch('/api/postgres/tournaments/groups', { method: "GET" })
    tournamentGroups.value = response.map((group: any) => ({
      label: group.description,
      value: group.id
    }))
  }

  onMounted(() => {
    fetchClubs()
    fetchTournamentGroups()
  })
</script>