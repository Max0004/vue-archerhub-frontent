<template>
  <div
  v-if="show"
  class="fixed inset-0 bg-black/50 flex items-center justify-center"
  @click.self="closeModal"
  >
    <UForm ref="form" :state="formState" :schema="trainingSchema" @submit="saveSession" class="bg-white p-6 pt-0 rounded-lg max-w-5xl w-full max-h-[80vh] overflow-y-auto">
      <div class="py-6">
        <h2 class="text-xl font-semibold mb-6">Neue Trainingseinheit</h2>

        <!-- Session Details -->
        <div class="border rounded-lg p-4 mb-4">
          <h3 class="font-medium mb-4">Session Details</h3>

          <UFormField label="Beschreibung" name="description" class="mb-3" required>
            <UInput v-model="session.description" class="w-full border rounded px-3 py-2" />
          </UFormField>

          <UFormField label="Ort" name="location" class="mb-3" required>
            <UInput v-model="session.location" class="w-full border rounded px-3 py-2" />
          </UFormField>

          <div class="gap-3">
            <h4 class="mb-4">Trainingsdauer</h4>

            <UFormField label="Datum" name="trainingDate" class="mb-3" required>
              <UInputDate v-model="date" locale="de-DE" class="w-full border rounded px-3 py-2" />
            </UFormField>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Startzeit" name="startTime" class="mb-3" required>
              <UInputTime v-model="startTime" locale="de-DE" class="w-full border rounded px-3 py-2" />
            </UFormField>

            <UFormField label="Schlusszeit" name="endTime" class="mb-3" required>
              <UInputTime v-model="endTime" locale="de-DE" class="w-full border rounded px-3 py-2" />
            </UFormField>
          </div>
        </div>

        <!-- Target Records -->
        <div
        v-for="(group, groupIndex) in targetGroups"
        :key="group.id"
        class="border rounded-lg p-4 mb-6"
        >
          <div class="flex justify-between mb-4">
            <h3 class="font-semibold">
              Auflagengruppe {{ groupIndex + 1 }}
            </h3>

            <UButton
            color="neutral"
            variant="link"
            type="button"
            class="text-red-600 text-sm disabled:text-red-400 disabled:cursor-not-allowed"
            :disabled="targetGroups.length <= 1"
            @click="removeTargetGroup(group.id)"
            >
              Auflagengruppe Entfernen
            </UButton>
          </div>

          <!-- Target Settings -->
          <div class="grid grid-cols-2 gap-3 mb-4">
            <UFormField label="Auflage" :name="`scores.${groupIndex}.target`" class="mb-3" required>
              <USelect v-model="group.target" :items="targetTypes" class="w-full border rounded px-3 py-2" />
            </UFormField>

            <UFormField label="Entfernung" :name="`scores.${groupIndex}.distance`" class="mb-3" required>
              <UInputNumber v-model="group.distance" min="0" class="w-full border rounded px-3 py-2" />
            </UFormField>
          </div>

          <!-- Rounds -->
          <div
          v-for="(round, roundIndex) in group.rounds"
          :key="round.id"
          class="border rounded p-3 mb-3"
          >
            <div class="flex justify-between mb-3">
              <span>
                Passe {{ roundIndex + 1 }}
              </span>

              <UButton
              color="neutral"
              variant="link"
              type="button"
              class="text-red-600 text-sm disabled:text-red-400 disabled:cursor-not-allowed"
              :disabled="group.rounds.length <= 1"
              @click="removeRound(group.id, round.id)"
              >
                Passe entfernen
              </UButton>
            </div>

            <!-- Arrows -->
            <div class="flex flex-wrap gap-2">
              <div v-for="(arrow, arrowIndex) in round.arrows" :key="arrow.id" class="flex flex-col items-center">
                <UFormField :label="`Pfeil ${arrowIndex + 1}`" :name="`scores.${groupIndex}.rounds.${roundIndex}.arrows.${arrowIndex}.value`" class="mb-3" required>
                  <USelect v-model="arrow.value" class="border rounded px-2 py-1 w-16 text-center" :items="SCORE_OPTIONS" />
                  <UButton
                  color="neutral"
                  variant="link"
                  type="button"
                  v-if="round.arrows.length > 1"
                  class="text-xs text-red-600"
                  @click="removeArrow(group.id, round.id, arrow.id)"
                  >
                    ✕
                  </UButton>
                </UFormField>
              </div>

              <div class="flex items-end">
                <UButton
                color="neutral"
                variant="soft"
                type="button"
                class="border rounded px-2 py-1 text-sm"
                @click="addArrow(group.id, round.id)">
                  + Pfeil
                </UButton>
              </div>
            </div>
          </div>

          <div class="mt-4">
            <div class="font-medium mb-2">
              Ringverteilung
            </div>

            <div class="grid grid-cols-6 md:grid-cols-12 gap-2">
              <div
              v-for="score in SCORE_OPTIONS"
              :key="score"
              class="border rounded p-2 text-center"
              >
                <div class="text-xs text-gray-500">
                  {{ score }}
                </div>

                <div class="font-semibold">
                  {{ scoreDistribution(group)[score] }}
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 text-sm">
            Punkte:
            <strong>{{ groupTotal(group) }}</strong>

            Pfeile:
            <strong>{{ groupArrowCount(group) }}</strong>
          </div>

          <UButton
          color="secondary"
          variant="solid"
          type="button"
          class="border rounded px-3 py-2"
          @click="addRound(group.id)"
          >
            + Passe hinzufügen
          </UButton>
        </div>

        <div class="justify-end mb-4">
          <UButton
          color="secondary"
          variant="solid"
          type="button"
          class="border rounded px-3 py-2"
          @click="addTargetGroup">
            + Auflagengruppe Hinzufügen
          </UButton>
        </div>

        <!-- Summary -->
        <div class="border rounded-lg p-4">
          <h3 class="font-medium mb-4">Zusammenfassung</h3>

          <div class="flex gap-4">
            <div>
              <div class="text-sm text-gray-500">Gesamtergebnis</div>
              <div class="text-xl font-semibold">{{ totalScore }}</div>
            </div>

            <div>
              <div class="text-sm text-gray-500">Geschossene Pfeile</div>
              <div class="text-xl font-semibold">{{ totalArrows }}</div>
            </div>

            <div>
              <div class="text-sm text-gray-500">Durchschnitt</div>
              <div class="text-xl font-semibold">
                {{ averageScore }}
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <UButton
          color="error"
          variant="soft"
          type="button"
          class="border px-4 py-2 rounded"
          @click="closeModal"
          >
            Abbrechen
          </UButton>

          <UButton
          color="success"
          variant="subtle"
          class="px-4 py-2 rounded"
          type="submit"
          @click="form?.submit()"
          >
            Session Speichern
          </UButton>
        </div>
      </div>
    </UForm>
  </div>
</template>
<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { CalendarDate, Time } from '@internationalized/date'
  import { formatDateTime } from '~/composables/datetime'
  import { trainingSchema } from '~/composables/validation/training'

  defineProps({
    show: Boolean,
  })

  const form = ref()

  const targetTypes = ref([])

  const emit = defineEmits(['close', 'save'])

  const SCORE_OPTIONS = ['X', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1', 'M']

  const SCORE_VALUES: Record<string, number> = {
    X: 10,
    '10': 10,
    '9': 9,
    '8': 8,
    '7': 7,
    '6': 6,
    '5': 5,
    '4': 4,
    '3': 3,
    '2': 2,
    '1': 1,
    M: 0,
  }

  const date = shallowRef(new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()))
  const startTime = shallowRef(new Time(new Date().getHours(), new Date().getMinutes(), 0))
  const endTime = shallowRef(new Time(new Date().getHours() + 1, new Date().getMinutes(), 0))

  const session = ref({
    description: '',
    location: '',
    date: date,
    start: startTime,
    end: endTime,
  })

  const targetGroups = ref([
    createTargetGroup(),
  ])

  function createTargetGroup() {
    return {
      id: crypto.randomUUID(),
      target: null,
      distance: 0,
      rounds: [createRound()],
    }
  }

  const formState = computed(() => ({
    description: session.value.description,
    location: session.value.location,
    trainingStart: formatDateTime(date.value, startTime.value),
    trainingEnd: formatDateTime(date.value, endTime.value),
    scores: targetGroups.value
  }))

  function createRound() {
    return {
      id: crypto.randomUUID(),
      arrows: [
        {
          id: crypto.randomUUID(),
          value: '-',
        },
      ],
    }
  }

  function addTargetGroup() {
    targetGroups.value.push(createTargetGroup())
  }

  function removeTargetGroup(groupId: string) {
    targetGroups.value = targetGroups.value.filter(
      g => g.id !== groupId,
    )
  }

  function addRound(groupId: string) {
    const group = targetGroups.value.find(
      g => g.id === groupId,
    )

    if (!group) return

    group.rounds.push(createRound())
  }

  function removeRound(groupId: string,roundId: string) {
    const group = targetGroups.value.find(
      g => g.id === groupId,
    )

    if (!group) return

    group.rounds = group.rounds.filter(
      r => r.id !== roundId,
    )
  }

  function addArrow(groupId: string,roundId: string) {
    const group = targetGroups.value.find(
      g => g.id === groupId,
    )

    if (!group) return

    const round = group.rounds.find(
      r => r.id === roundId,
    )

    if (!round) return

    round.arrows.push({
      id: crypto.randomUUID(),
      value: '',
    })
  }

  function removeArrow(groupId: string,roundId: string,arrowId: string) {
    const group = targetGroups.value.find(
      g => g.id === groupId,
    )

    if (!group) return

    const round = group.rounds.find(
      r => r.id === roundId,
    )

    if (!round) return

    round.arrows = round.arrows.filter(
      a => a.id !== arrowId,
    )
  }

  function roundTotal(round: any) {
    return round.arrows.reduce(
      (sum: number, arrow: any) =>
        sum + (SCORE_VALUES[arrow.value] ?? 0),
      0,
    )
  }

  const totalScore = computed(() =>
    targetGroups.value.reduce(
      (groupSum, group) => 
        groupSum + groupTotal(group),
      0,
    ),
  )

  function groupTotal(group: any) {
    return group.rounds.reduce(
      (sum: number, round: any) => 
        sum + roundTotal(round),
      0,
    )
  }

  function groupArrowCount(group: any) {
    return group.rounds.reduce(
      (sum: number, round: any) => 
        sum + round.arrows.filter(a => a.value).length,
      0,
    )
  }

  const totalArrows = computed(() =>
    targetGroups.value.reduce(
      (groupSum, group) =>
        groupSum + groupArrowCount(group),
      0,
    ),
  )

  const averageScore = computed(() =>
    totalArrows.value
      ? (totalScore.value / totalArrows.value).toFixed(2)
      : '—',
  )

  function scoreDistribution(group: any) {
    const distribution: Record<string, number> = {}

    SCORE_OPTIONS.forEach(score => {
      distribution[score] = 0
    })

    group.rounds.forEach((round: any) => {
      round.arrows.forEach((arrow: any) => {
        if (arrow.value) {
          distribution[arrow.value]++
        }
      })
    })

    return distribution
  }

  async function saveSession(event) {
    if(!event?.data) return
    emit('save', event.data)
  }

  function closeModal() {
    emit('close')
  }

  async function fetchTargetTypes() {
    const response = await $fetch('/api/postgres/targets', { method: "GET" })
    if(response.length) {
      targetTypes.value = response.map(targetType => ({
        label: targetType.targettitle,
        value: targetType.id
      }))
    }
  }

  onMounted(() => {
    fetchTargetTypes()
  })
</script>