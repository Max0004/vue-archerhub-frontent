<template>
  <div class="container grid grid-cols-2 mx-auto p-4">
    <div>
      <h1 class="primary-header mb-6 ml-3">Vereine</h1>
      <div>
        <div v-for="club in clubs" :key="club.id" class="bg-white m-2 shadow-md rounded-lg p-4 hover:shadow-lg transition">
          <h2 class="secondary-header">{{ club.name }}</h2>
          <p class="comment">{{ club.description }}</p>
          <a
          :href="club.website"
          class="text-blue-500 hover:underline mt-2 inline-block"
          target="_blank"
          rel="noopener noreferrer"
          >Besuche Ihre Website
          </a>
        </div>
      </div>
    </div>
    <div class="ml-8">
      <h1 class="primary-header mb-6 ml-3">Organisationen</h1>
      <div>
        <div v-for="organization in organizations" :key="organization.id" class="bg-white m-2 shadow-md rounded-lg p-4 hover:shadow-lg transition">
          <h2 class="secondary-header">{{ organization.name }}</h2>
          <p class="comment">{{ organization.description }}</p>
          <a
          :href="organization.website"
          class="text-blue-500 hover:underline mt-2 inline-block"
          target="_blank"
          rel="noopener noreferrer"
          >Besuche Ihre Website
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';

  const allClubs = ref([]);

  const clubs = computed(() => {
    return allClubs.value.filter(club => club.id !== 998 && club.id !== 999)
  });

  const organizations = computed(() => {
    return allClubs.value.filter(club => club.id === 998 || club.id === 999)
  });

  onMounted(async () => {
    const data = await $fetch('/api/postgres/club',{ method: "GET" });
    if(data.error) {
      console.error('Error fetching clubs:',data.error);
    } else {
      allClubs.value = data || [];
    }
  });
</script>