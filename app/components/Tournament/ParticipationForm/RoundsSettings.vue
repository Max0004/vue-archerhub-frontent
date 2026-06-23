<template>
  <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-slate-800">Rundenergebnisse</h2>
      <button 
      @click="addRound" 
      class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Runde hinzufügen
      </button>
    </div>

    <div class="space-y-4">
      <div
      v-for="(round, index) in rounds"
      :key="index"
      class="p-4 border-2 border-slate-200 rounded-xl hover:border-blue-300 transition-colors"
      >
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-slate-700">Runde {{ round.round }}</h3>
          <button
          v-if="rounds.length > 1"
          @click="removeRound(index)"
          class="p-2 text-red-500 hover:bg-red-50 rounded-lg"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>

        <div class="grid grid-cols-4 gap-2">

          <!-- Target -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Scheibenauflage *</label>
            <select
            :value="round.target"
            @change="updateRound(index, 'target', $event.target.value)"
            class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Auflage Auswählen...</option>
              <option v-for="t in targets" :key="t.id" :value="t.id">
                {{ t.targettitle }}
              </option>
            </select>
          </div>

          <!-- Distance -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Entfernung (m) *</label>
            <input
            type="number"
            :value="round.distance"
            @input="updateRound(index, 'distance', +$event.target.value)"
            placeholder="z.B. 70"
            class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Arrows Shot -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Geschossene Pfeile *</label>
            <input
            type="number"
            :value="round.arrowsshot"
            @input="updateRound(index, 'arrowsshot', +$event.target.value)"
            placeholder="z.B. 30"
            class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Score -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Rundenergebnis *</label>
            <input
            type="number"
            :value="round.score"
            @input="updateRound(index, 'score', +$event.target.value)"
            placeholder="z.B. 280"
            class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { Trash2 } from 'lucide-vue-next'

  const props = defineProps({
    rounds: Array,
    targets: Array,
  })

  const updateRound = (index, field, value) => {
    props.rounds[index][field] = value
  }

  const addRound = () => {
    const lastRound = props.rounds[props.rounds.length - 1];
    props.rounds.push({
      round: props.rounds.length + 1,
      target: lastRound?.target || '',   // carry over previous target
      distance: lastRound?.distance || '', // carry over previous distance
      arrowsshot: lastRound?.arrowsshot || '', // carry over previous number of arrows
      score: ''  // score starts empty
    })
  }

  const removeRound = (index) => {
    if(props.rounds.length > 1) {
      props.rounds.splice(index, 1)
      props.rounds.forEach((round, i) => round.round = i + 1)
    }
  }
</script>