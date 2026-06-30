<template>
  <div class="container mx-auto max-w-7xl p-6">

    <div class="flex items-center justify-between mb-8">
      <h1 class="primary-header">
        Vereine & Organisationen
      </h1>

      <UButton
        icon="i-lucide-plus"
        @click="router.push('/form/club')"
      >
        Neuer Verein
      </UButton>
    </div>

    <div class="grid gap-8 lg:grid-cols-2">

      <section>
        <h2 class="secondary-header mb-4">Vereine</h2>

        <div class="space-y-4">
          <ClubCard
          v-for="club in clubs"
          :key="club.id"
          :club="club"
          />
        </div>
      </section>

      <section>
        <h2 class="secondary-header mb-4">Organisationen/Dachvereine</h2>

        <div class="space-y-4">
          <ClubCard
          v-for="organization in organizations"
          :key="organization.id"
          :club="organization"
          />
        </div>
      </section>

    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();

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