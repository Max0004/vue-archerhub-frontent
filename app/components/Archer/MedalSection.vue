<template>
  <div :class="`border-2 ${styles.border} rounded-lg overflow-hidden`">
    <!-- Toggle Header -->
    <button
      @click="isOpen = !isOpen"
      :class="`w-full ${styles.bg} px-6 py-4 flex items-center justify-between hover:opacity-80 transition-opacity ${props.medals ? 'cursor-pointer' : ''}`"
    >
      <div class="flex items-center gap-3">
        <span class="text-3xl">{{ styles.medal }}</span>

        <div class="text-left">
          <h3 :class="`text-lg font-semibold ${styles.text} capitalize`">
            {{ props.color }}medallien
          </h3>
          <p v-if="props.medals" :class="`text-sm ${styles.text} opacity-75`">
            {{ props.medals?.length }}
            {{ props.medals?.length === 1 ? "Medallie" : "Medallien" }}
          </p>
          <p v-else :class="`text-sm ${styles.text} opacity-75`">
            Keine Medalien
          </p>
        </div>
      </div>

      <div v-if="props.medals">
        <ChevronUp
        v-if="isOpen"
        :size="24"
        :class="styles.text"
        />
        <ChevronDown
        v-else
        :size="24"
        :class="styles.text"
        />
      </div>
    </button>

    <!-- Medal List -->
    <div v-if="isOpen" class="bg-white divide-y divide-gray-200">
      <div
        v-for="(medal, index) in props.medals"
        :key="index"
        class="px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <h4 v-if="medal.title && color === 'gold' && medal.bowClass !== 'Freie Klasse'" class="font-semibold" :class="colorClasses.gold.text">
              {{ getTitlePronounciation(medal.title) }}
            </h4>
            <h4 class="font-semibold text-gray-900 mb-2">
              {{ medal.tournament }}
            </h4>

            <div class="space-y-1 text-sm text-gray-600">
              <!-- Trophy / Category -->
              <div class="flex items-center gap-2">
                <Trophy size="16" class="text-gray-400" />
                <span>{{ medal.bowClass === "[Ohne Name]" ? "" : medal.bowClass + " " }}{{ medal.ageBracket === "[Ohne Name]" ? "" : medal.ageBracket }}</span>
              </div>

              <!-- Date -->
              <div class="flex items-center gap-2">
                <Calendar size="16" class="text-gray-400" />
                <span>
                  {{
                    new Date(medal.date).toLocaleDateString("de-DE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })
                  }}
                </span>
              </div>

              <!-- Location -->
              <div class="flex items-center gap-2">
                <MapPin size="16" class="text-gray-400" />
                <span>{{ medal.place }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
  import { ref } from 'vue'
  import { Trophy, ChevronDown, ChevronUp, Calendar, MapPin } from 'lucide-vue-next'

  const props = defineProps({
    medals: { type: Array, required: true },
    gender: { type: String, required: false },
    color: { type: String, required: true }
  })

  const isOpen = ref(false)

  const colorClasses = {
    gold: {
      border: 'border-yellow-300',
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      medal: '🥇'
    },
    silber: {
      border: 'border-gray-300',
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      medal: '🥈'
    },
    bronze: {
      border: 'border-orange-300',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      medal: '🥉'
    }
  }

  const getTitlePronounciation = (title) => {
    switch(props.gender) {
      case "Female":
        return title+"in"
      default:
        return title
    }
  }

  const styles = colorClasses[props.color]
</script>