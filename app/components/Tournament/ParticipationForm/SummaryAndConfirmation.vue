<template>
  <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
    <h2 class="text-2xl font-bold mb-6">Bestätigen</h2>

    <!-- Participation summary -->
    <div class="p-4 bg-slate-50 rounded-xl">
      <h3 class="text-lg font-semibold mb-3">Allgemeine Informationen</h3>

      <div class="grid grid-cols-2 gap-3 text-sm">
        <div><b>Turnier:</b> {{ tournaments.find(t => t.id == participation.tournament)?.name }}</div>
        <div><b>Teilnehmer:</b>
          {{
            (() => {
              const p = participants.find(p => p.id == participation.participant)
              return p ? `${p.title ?? ''} ${p.firstname} ${p.lastname}` : ''
            })()
          }}
        </div>
        <!-- ... same structure for age bracket, club, etc ... -->
        <div>
          <span class="font-semibold">Klasse:</span>
          {{ bowClasses.find(a => a.id == participation.bowClass)?.name }} {{ ageBrackets.find(a => a.id == participation.ageBracket)?.name }}
        </div>

        <div>
          <span class="font-semibold">Verein:</span>
          {{ clubs.find(c => c.id == participation.club)?.name }}
        </div>

        <div v-if="participation.rank">
          <span class="font-semibold">Platzierung:</span> {{ participation.rank }}
        </div>

        <div v-if="participation.totalTens">
          <span class="font-semibold">10er:</span> {{ participation.totalTens }}
        </div>

        <div v-if="participation.totalCenters">
          <span class="font-semibold">X-er:</span> {{ participation.totalCenters }}
        </div>

        <div v-if="participation.totalNines">
          <span class="font-semibold">9er:</span> {{ participation.totalNines }}
        </div>
      </div>
    </div>

    <!-- Rounds -->
    <div class="p-4 bg-slate-50 rounded-xl mt-6">
      <h3 class="text-lg font-semibold mb-3">Runden ({{ rounds.length }})</h3>

      <div v-for="round in rounds" :key="round.round" class="p-3 bg-white rounded-lg flex justify-between">
        <strong>Runde {{ round.round }}</strong>
        <div class="flex gap-4 text-sm">
          <span>Auflage: {{ targets.find(t => t.id == round.target)?.targettitle }}</span>
          <span>Entfernung: {{ round.distance }}m</span>
          <span>Geschossene Pfeile: {{ round.arrowsshot }}</span>
          <span class="font-semibold text-blue-600">Rundenergebnis: {{ round.score }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
  defineProps({
    participation: Object,
    rounds: Array,
    tournaments: Array,
    participants: Array,
    clubs: Array,
    ageBrackets: Array,
    bowClasses: Array,
    targets: Array
  })
</script>