<template>
  <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
    <h2 class="text-2xl font-bold text-slate-800 mb-6">Turnierteilnahme (Allgemeine Information)</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

      <!-- Tournament -->
      <div>
        <UFormField label="Turnier">
          <USelectMenu
          v-model="participation.tournament"
          :items="tournamentList"
          value-key="id"
          @change="update('tournament', $event.target.value)"
          class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
          />
        </UFormField>
      </div>

      <!-- Participant -->
      <div>
        <UFormField label="Schütze">
          <USelectMenu 
          v-model="participation.participant" 
          :items="participantsList" 
          value-key="id" 
          @change="update('participant', $event.target.value)"
          class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" 
          />
        </UFormField>
      </div>

      <!-- Club -->
      <div>
        <label class="block text-sm font-semibold text-slate-700 mb-2">Verein *</label>
        <select
        v-model="participation.club"
        @change="update('club', $event.target.value)"
        class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Verein Auswählen (Oder Gast)...</option>
          <option v-for="c in clubs" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
          
      <!-- Age Bracket -->
      <div>
        <label class="block text-sm font-semibold text-slate-700 mb-2">Altersklasse *</label>
        <select
        v-model="participation.ageBracket"
        @change="update('ageBracket', $event.target.value)"
        class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Altersklasse Auswählen...</option>
          <option v-for="a in ageBrackets" :key="a.id" :value="a.id">{{ a.name }}</option>
        </select>
      </div>

      <!-- Bow Class -->
      <div>
        <label class="block text-sm font-semibold text-slate-700 mb-2">Bogenklasse</label>
        <select
        v-model="participation.bowClass"
        @change="update('bowClass', $event.target.value)"
        class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Bogenklasse Auswählen...</option>
          <option v-for="b in bowClasses" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
      </div>

      <!-- Rank -->
      <div>
        <label class="block text-sm font-semibold text-slate-700 mb-2">Finaler Platz</label>
        <input
        v-model="participation.rank"
        @change="update('rank', $event.target.value)"
        type="number"
        placeholder="Finaler Platz"
        class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Total Tens -->
      <div>
        <label class="block text-sm font-semibold text-slate-700 mb-2">10er</label>
        <input
        v-model="participation.totalTens"
        @change="update('totalTens', $event.target.value)"
        type="number"
        placeholder="Summe der 10er inklusive Xer"
        class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Total Centers -->
      <div>
        <label class="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
          X-er
        </label>
        <input
        v-model="participation.totalCenters"
        @change="update('totalCenters', $event.target.value)"
        type="number"
        placeholder="Summe der X-er"
        class="w-full px-4 py-3 rounded-lg border border-slate-300 disabled:bg-slate-100 disabled:text-slate-400"
        />
      </div>

      <!-- Total Nines -->
      <div>
        <label class="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
          9er
        </label>
        <input
        v-model="participation.totalNines"
        @change="update('totalNines', $event.target.value)"
        type="number"
        placeholder="Summe der 9er inklusive 10er"
        class="w-full px-4 py-3 rounded-lg border border-slate-300 disabled:bg-slate-100 disabled:text-slate-400"
        />
      </div>

      <!-- Data in Absence -->
      <div>
        <label class="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
          Abwesend (n.z.Q.)
        </label>
        <input
        v-model="participation.absent"
        type="checkbox"
        class="rounded border-gray-300"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
  const props = defineProps({
    participation: Object,
    tournaments: Array,
    participants: Array,
    clubs: Array,
    ageBrackets: Array,
    bowClasses: Array
  })

  const tournamentList = computed(() => {
    return props.tournaments.map(tournament => ({
      label: tournament.name,
      id: tournament.id
    }))
  })

  const participantsList = computed(() => {
    return props.participants.map(participant => ({
      label: `${participant.lastname} ${participant.title? participant.title + ' ' : ''}${participant.firstname}`,
      id: participant.id
    }))
  })

  const update = (field, value) => {
    props.participation[field] = value   // fully reactive since participation is useState()
  }
</script>