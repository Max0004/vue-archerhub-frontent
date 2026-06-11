<template>
  <div class="bg-white shadow rounded-xl p-6">
    <div v-if="loading" class="text-gray-500 italic">
      Loading...
    </div>

    <div v-else-if="!items.length" class="text-gray-500 italic">
      No data available.
    </div>

    <template v-else>
      <ul class="divide-y">
        <li
          v-for="(item, i) in displayedItems"
          :key="i"
          class="flex justify-between py-3"
        >
          <div class="font-medium">
            <slot name="left" :item="item" :index="i">
              {{ item.place }}. {{ item.firstname }} {{ item.lastname }}
            </slot>
          </div>

          <div class="font-semibold">
            <slot name="right" :item="item" :index="i">
              {{ metricKey ? item[metricKey] : '' }}
            </slot>
          </div>
        </li>
      </ul>

      <!-- Accordion Button -->
      <div
        v-if="items.length > limit"
        class="mt-4 flex justify-center"
      >
        <button
          @click="expanded = !expanded"
          class="expand-btn"
        >
          {{
            expanded
              ? 'Weniger anzeigen'
              : `Alle anzeigen (${items.length - limit} weitere)`
          }}
        </button>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
  import { computed, ref } from 'vue'

  const props = withDefaults(
    defineProps<{
      items: Array<any>
      loading: boolean
      metricKey?: string
      metricLabel?: string
      useRanks: boolean 
    }>(),
    {
      useRanks: true
    }
  )

  const expanded = ref(false)
  const limit = 10

  const displayedItems = computed(() => {
    return expanded.value
      ? props.items
      : props.useRanks 
        ? props.items.filter(item => {
          if(item.place || item.rnk) {
            return item.place <= 10 || item.rnk <= 10
          }
        }) 
        : props.items.slice(0, limit)
  })
</script>