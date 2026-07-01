<template>
  <div class="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8 px-4">
    <div v-if="loading">
      ...loading
    </div>

    <div v-else-if="!userData">
      Nutzer konte nicht gefunden werden
    </div>

    <div v-else class="max-w-4xl mx-auto">

      <!-- Header Card -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <div class="flex items-start justify-between mb-6">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 mb-2">
              {{ userData?.title ? userData?.title + " " : "" }}{{ userData?.firstname }} {{ userData?.lastname }}
            </h1>
            <p v-if="userData?.active" class="text-lg text-gray-600">
              <span v-if="userData?.birthday">{{ calculateAge(userData?.birthday) }} Jahre alt •</span> {{ convertGender(userData?.gender) }}
            </p>
          </div>
        </div>

        <!-- Club Memberships -->
        <div v-if="userData?.active" class="mb-6">
          <div class="flex items-center gap-2 mb-3">
            <Users class="text-indigo-600" :size="20" />
            <h2 class="text-xl font-semibold text-gray-900">Vereine</h2>
          </div>

          <div v-if="userData?.clubs" class="grid gap-3">
            <div
              v-for="club in userData?.clubs"
              :key="club.id"
              class="bg-linear-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200"
            >
              <h3 class="font-semibold text-gray-900 mb-1">{{ club?.name }}</h3>
            </div>
          </div>
        </div>

        <div v-else class="mb-6 bg-linear-to-r from-red-500 to-red-300 rounded-lg p-4 border border-indigo-200">
          <h3 class="font-semibold text-gray-900 mb-1">{{ userData?.gender == "FEMALE" ? "Diese Nutzerin" : "Dieser Nutzer" }} ist nicht mehr aktiv</h3>
        </div>

        <!-- Medal Board -->
        <div class="space-y-4">
          <h2 class="text-2xl font-bold text-gray-900 mb-4 px-1">Medallienspiegel</h2>

          <p class="font-semibold text-gray-900 mb-1">Turnierteilnahmen: {{ userData?.tournamentparticipations }}</p>

          <!-- Medal Sections -->
          <ArcherMedalSection
          :medals="userData?.medals?.gold"
          :gender="userData?.gender"
          color="gold"
          />

          <ArcherMedalSection
          :medals="userData?.medals?.silver"
          color="silber"
          />

          <ArcherMedalSection
          :medals="userData?.medals?.bronze"
          color="bronze"
          />
        </div>

        <NuxtLink
        v-if="userData?.active"
        :to="`${archerId}/training-log`"
        class="w-full bg-linear-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200 mt-6 block text-center font-semibold text-gray-900"
        >
          Trainingslog
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
<script setup>
  import { ref } from 'vue'
  import { Users } from 'lucide-vue-next'

  const route = useRoute();

  const loading = ref(true)
  
  const archerId = route.params.id;
  const userData = ref(null);

  const fetchUserData = async () => {
    try {
      loading.value = true
      const response = await $fetch(`/api/postgres/archer/${archerId}`, {
        method: "GET"
      })
      if(response.id) {
        userData.value = response
      }
    } catch(error) {
      console.error(error);
    } finally {
      loading.value = false
    }
  }

  // --- Logic functions ---
  const calculateAge = birthday => {
    const today = new Date()
    const birth = new Date(birthday)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  onMounted(() => {
    fetchUserData();
  })
</script>