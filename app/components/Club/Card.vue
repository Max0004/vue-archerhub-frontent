<template>
  <div class="rounded-lg bg-white p-4 shadow transition hover:shadow-lg">
    <h2 class="secondary-header">{{ club.name }}</h2>
    <p class="comment">{{ club.description }}</p>
    <a 
    v-if="club.website" 
    :href="club.website" 
    class="text-blue-500 hover:underline mt-2 inline-block" 
    target="_blank" 
    rel="noopener noreferrer">
      Besuche Ihre Website
    </a>
  </div>
</template>
<script setup lang="ts">
  const props = defineProps({
    club: Object
  })
</script>