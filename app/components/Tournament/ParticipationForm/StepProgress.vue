<template>
  <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
    <div class="flex items-center justify-between">    
      <div class="flex items-center gap-2 flex-1">
        <div
        class="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
        :class="step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'"
        >
          1
        </div>
        <div class="flex-1 h-1 bg-slate-200 mx-2">
          <div
          class="h-full transition-all duration-300"
          :class="step >= 2 ? 'bg-blue-600 w-full' : 'w-0'"
          ></div>
        </div>
      </div>

      <div class="flex items-center gap-2 flex-1">
        <div
        class="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
        :class="step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'"
        >
          2
        </div>
        <div class="flex-1 h-1 bg-slate-200 mx-2">
          <div
          class="h-full transition-all duration-300"
          :class="step >= 3 ? 'bg-blue-600 w-full' : 'w-0'"
          ></div>
        </div>
      </div>

      <div
      class="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
      :class="step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'"
      >
        3
      </div>
    </div>

    <div class="flex justify-between mt-3 text-sm font-medium">
      <span :class="step >= 1 ? 'text-blue-600' : 'text-slate-500'">Allgemeines</span>
      <span :class="step >= 2 ? 'text-blue-600' : 'text-slate-500'">Rundenergebnisse</span>
      <span :class="step >= 3 ? 'text-blue-600' : 'text-slate-500'">Bestätigen</span>
    </div>
  </div>
</template>
<script setup lang="ts">
  const props = defineProps({
    step: Number
  })
</script>