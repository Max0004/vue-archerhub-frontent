<template>
  <div class="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4 sm:p-8">

    <!-- Header -->
    <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div class="flex items-center gap-3 mb-2">
        <Target class="w-8 h-8 text-blue-600" />
        <h1 class="text-3xl font-bold text-slate-800">
          Tournierergebnisse eintragen
        </h1>
      </div>
      <p class="text-slate-600">
        Turnierergebnisse einzelner Schützen pro Runde eintragen
      </p>
    </div>

    <TournamentParticipationFormStepProgress :step="step" />

    <TournamentParticipationFormGeneralSettings
    v-if="step === 1"
    :participation="participation"
    :tournaments="tournaments"
    :participants="participants"
    :clubs="clubs"
    :ageBrackets="ageBrackets"
    :bowClasses="bowClasses"
    />

    <TournamentParticipationFormRoundsSettings
    v-if="step === 2"
    v-model:rounds="rounds"
    :targets="targets"
    />

    <TournamentParticipationFormSummaryAndConfirmation
    v-if="step === 3"
    :participation="participation"
    :rounds="rounds"
    :tournaments="tournaments"
    :participants="participants"
    :clubs="clubs"
    :ageBrackets="ageBrackets"
    :bowClasses="bowClasses"
    :targets="targets"
    />

    <!-- Navigation -->
    <div class="mt-6">
      <button 
      v-if="step > 1" 
      @click="step--" 
      class="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-semibold"
      >
        <ArrowLeft class="w-4 h-4" />
        Zurück
      </button>
      <button 
      v-if="step < 3" 
      @click="step++" 
      :disabled="step === 1 ? !isStep1Valid : !isStep2Valid"
      class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-slate-300 disabled:cursor-not-allowed ml-auto"
      >
        Weiter
        <ArrowRight class="w-4 h-4" />
      </button>
      <button 
      v-if="step === 3" 
      @click="handleSubmit"
      class="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold ml-auto"
      >
        <Save class="w-4 h-4" />
        Ergebnis speichern
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ArrowLeft, ArrowRight, Save, Target } from 'lucide-vue-next';
  const step = ref(1)
  const saved = ref(false)

  const participation = useParticipationState();

  const rounds = useRoundsState();

  const tournaments = ref([]);
  const participants = ref([]);
  const ageBrackets = ref([]);
  const clubs = ref([]);
  const targets = ref([]);
  const bowClasses = ref([]);

  const isStep1Valid = computed(() => 
    participation.value.tournament &&
    participation.value.participant &&
    participation.value.ageBracket &&
    participation.value.club &&
    participation.value.bowClass
  )

  const isStep2Valid = computed(() => 
    rounds.value.every(r => r.target && r.distance && r.arrowsshot && r.score)
  )

  const isEmpty = (v) => v === '' || v == null; // null or undefined

  const handleSubmit = async () => {
    const data = {
      tournamentParticipation: {
        ...participation.value,
        bowClass: isEmpty(participation.value.bowClass) ? null : participation.value.bowClass,
        totalCenters: isEmpty(participation.value.totalCenters) ? null : participation.value.totalCenters,
        totalTens:    isEmpty(participation.value.totalTens)    ? null : participation.value.totalTens,
        totalNines:   isEmpty(participation.value.totalNines)   ? null : participation.value.totalNines,
      },
      participantTournamentRounds: rounds.value
    };

    try {
      const res = await $fetch('/api/postgres/tournaments/participation', {
        method: 'POST',
        body: data
      });

      saved.value = true;
      setTimeout(() => saved.value = false, 3000);

      // Optional: reset form
      step.value = 1;
      const lastRound = rounds.value[rounds.value.length - 1];
      rounds.value = [{ round: 1, target: lastRound.target, distance: lastRound.distance, arrowsshot: lastRound.arrowsshot, score: '' }];
    } catch(error) {
      console.error("Insert error:", error);
      alert("Error saving data. See console for details.");
    }
  }

  async function fetchTournaments() {
    tournaments.value = await $fetch('/api/postgres/tournaments', { method: 'GET' })
  }

  async function fetchParticipants() {
    participants.value = await $fetch('/api/postgres/archer', { method: 'GET' })
  }

  async function fetchAgeBrackets() {
    ageBrackets.value = await $fetch('/api/postgres/ageBrackets', { method: 'GET' })
  }

  async function fetchClubs() {
    clubs.value = await $fetch('/api/postgres/club', { method: 'GET', query: { includeGuest: true } })
  }

  async function fetchTargets() {
    targets.value = await $fetch('/api/postgres/targets', { method: 'GET' })
  }

  async function fetchBowClasses() {
    bowClasses.value = await $fetch('/api/postgres/bowClasses', { method: 'GET' })
  }

  onMounted(() => {
    fetchParticipants();
    fetchClubs();
    fetchTargets();
    fetchTournaments();
    fetchAgeBrackets();
    fetchBowClasses();
  })
</script>