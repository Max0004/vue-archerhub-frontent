<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center" @click.self="closeModal">
    <div class="bg-white p-6 pt-0 rounded-lg max-w-5xl w-full max-h-[80vh] overflow-y-auto">
      
      <div class="sticky top-0 bg-white z-10 p-6">
        <div class="py-4">
          <h2 class="primary-header mb-2">{{ tournament.tournament_name }}</h2>
          <p class="comment">Datum: {{ formattedDate }}</p>
          <p class="comment">Ort: {{ tournament.place }}</p>
          <p class="comment">Organisiert durch: {{ tournament.organizer_name }}</p>
        </div>
        <button 
        v-if="processedBrackets.length"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer mb-4"
        @click="exportPdf">
          Ergebnisse exportieren
        </button>
        <hr/>
      </div>

      <div v-if="!processedBrackets.length">
        <span class="text-gray-500 px-8">Es gibt (noch) keine Daten zu diesem Turnier</span>
      </div>

      <div 
        v-else
        v-for="bracket in processedBrackets" 
        :key="bracket.combinedName" 
        class="mb-6 px-6"
      >
        <h3 
          class="secondary-header cursor-pointer flex items-center justify-between"
          @click="toggleBracket(bracket.combinedName)"
        >
          {{ bracket.combinedName }}
          <span>
            <svg v-if="expandedBrackets.get(bracket.combinedName)" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </span>
        </h3>

        <div v-if="expandedBrackets.get(bracket.combinedName)" class="mt-2">
          <div class="grid grid-cols-1 gap-4 mt-2">
            <table class="w-full text-left">
              <tr>
                <th>Pl.</th>
                <th>Teilnehmer</th>
                <th>Verein</th>
                <th v-for="round in bracket.maxRounds" :key="round" class="text-right">R{{ round }}</th>
                <th v-if="tournament.centerscounted" class="text-right">X</th>
                <th class="text-right">10</th>
                <th v-if="tournament.ninescounted" class="text-right">9</th>
                <th class="text-right">Ges.</th>
              </tr>

              <tr 
                v-for="participant in sortParticipants(bracket.participants)"
                :key="participant.participantId"
                :class="[
                  getRankingStyle(participant.rank - 1),
                  participant.absent && !tournament.earnmedalinabsence ? 'opacity-50 bg-gray-100' : ''
                ]"
              >
                <td>
                  <span v-if="participant.absent && !tournament.earnmedalinabsence">n.z.Q.</span>
                  <span v-else>{{ participant.rank }}.</span>
                </td>
                <td>
                  <span v-if="participant.title">{{ participant.title }}</span>
                  {{ participant.firstname }} {{ participant.lastname }}
                </td>
                <td>{{ participant.clubName }}</td>
                <td
                v-for="roundIndex in bracket.maxRounds"
                :key="roundIndex"
                class="text-right"
                >
                  {{ getRoundScore(participant, roundIndex) }}
                </td>
                <td v-if="tournament.centerscounted" class="text-right">
                  <span v-if="participant.absent && !tournament.earnmedalinabsence">-</span>
                  <span v-else>{{ participant.totalCenters }}</span>
                </td>
                <td class="text-right">
                  <span v-if="participant.absent && !tournament.earnmedalinabsence">-</span>
                  <span v-else>{{ participant.totalTens }}</span>
                </td>
                <td v-if="tournament.ninescounted" class="text-right">
                  <span v-if="participant.absent && !tournament.earnmedalinabsence">-</span>
                  <span v-else>{{ participant.totalNines }}</span>
                </td>
                <td class="text-right">{{ participant.totalScore }}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref, defineProps, defineEmits, computed } from 'vue';
  import { format } from 'date-fns';
  import { useExportTournamentResultsPdf } from '~/composables/pdf/export/exportTournamentResultsPdf';

  const props = defineProps({
    show: Boolean,
    tournament: Object,
  });

  const emit = defineEmits(['close']);
  function closeModal() { emit('close'); }

  const expandedBrackets = ref(new Map());

  function toggleBracket(name: string) {
    const current = expandedBrackets.value.get(name) || false;
    expandedBrackets.value.set(name, !current);
  }

  /* ---------------------------------------------------------
     1) SPLIT AGE BRACKETS BY BOW CLASS
  --------------------------------------------------------- */
  function splitAgeBracketsByBowClass(agebrackets) {
    const result = [];

    agebrackets.forEach((bracket) => {
      const grouped = {};

      bracket.participants?.forEach((p) => {
        if (!grouped[p.bowClass]) grouped[p.bowClass] = [];
        grouped[p.bowClass].push(p);
      });

      Object.entries(grouped).forEach(([bowClass, participants]) => {
        result.push({
          originalBracketId: bracket.ageBracketId,
          bowClass,
          bowClassPosition: participants[0].bowClassPosition,
          ageBracketPosition: bracket.ageBracketPosition,
          ageGroupName: bracket.ageBracketName,
          combinedName: `${bowClass != "[Ohne Name]" ? bowClass + " " : ""}${bracket.ageBracketName != "[Ohne Name]" ? bracket.ageBracketName : ""}`,
          participants
        });
      });
    });

    return result;
  }

  /* ---------------------------------------------------------
     2) COMPUTED: USE PROCESSED BRACKETS IN TEMPLATE
  --------------------------------------------------------- */
  const processedBrackets = computed(() => {
    if (!props.tournament?.agebrackets) return [];

    const split = splitAgeBracketsByBowClass(props.tournament.agebrackets);

    return split.sort((a,b) => {
      if(a.bowClassPosition !== b.bowClassPosition) {
        return a.bowClassPosition - b.bowClassPosition
      }

      if(a.ageBracketPosition !== b.ageBracketPosition) {
        return a.ageBracketPosition - b.ageBracketPosition
      }

      return a.combinedName.localeCompare(b.combinedName);
    })
  });

  /* ---------------------------------------------------------
     OTHER HELPERS
  --------------------------------------------------------- */

  const formattedDate = computed(() => {
    const startDate = format(new Date(props.tournament.startdate), 'dd. MMMM yyyy');
    if (props.tournament.enddate)
      return `${startDate} - ${format(new Date(props.tournament.enddate), 'dd. MMMM yyyy')}`;
    return startDate;
  });

  processedBrackets.value.forEach((bracket) => {
      let maxRounds = 0;
      bracket.participants.forEach((participant) => {
        if(participant.scores?.length > maxRounds) maxRounds = participant.scores.length;
      });
      bracket.maxRounds = maxRounds
    })

  function getRoundScore(participant, roundIndex) {
    const scoreObj = participant.scores?.find(s => s.round === roundIndex);
    return scoreObj ? scoreObj.score : '';
  }

  /* ---------------------------------------------------------
     PDF EXPORT
  --------------------------------------------------------- */
  async function exportPdf() {
    await useExportTournamentResultsPdf({tournament: props.tournament, date: formattedDate.value, processedBrackets: processedBrackets.value})
  }

</script>