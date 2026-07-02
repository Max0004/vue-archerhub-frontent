<template>
  <div class="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
    <!-- Header -->
    <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div class="flex items-center gap-3 mb-2">
        <Target class="w-8 h-8 text-blue-600" />
        <h1 class="text-3xl font-bold text-slate-800">
          Schützen erstellen
        </h1>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <UForm class="space-y-8" :schema="archerSchema" :state="form" @submit="submit">

        <div>
          <h2 class="text-lg font-semibold text-slate-800 mb-4">
            Allgemeine Informationen
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Vorname" name="firstname">
              <UInput v-model="form.firstname" />
            </UFormField>

            <UFormField label="Nachname" name="lastname">
              <UInput v-model="form.lastname" />
            </UFormField>

            <UFormField label="Titel" name="title">
              <UInput v-model="form.title" />
            </UFormField>

            <UFormField label="Geschlecht" name="gender">
              <USelect
              v-model="form.gender"
              :items="[
                { label: 'Männlich', value: 'MALE' },
                { label: 'Weiblich', value: 'FEMALE' },
                { label: 'Divers', value: 'OTHER' }
              ]"
              />
            </UFormField>

            <UFormField label="Geburtstag" name="birthday">
              <UInput
              v-model="form.birthday"
              type="date"
              />
            </UFormField>
          </div>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-slate-800 mb-4">
            Aktivität
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Aktiv" name="active">
              <UCheckbox v-model="form.active" />
            </UFormField>

            <UFormField label="Vereine" name="clubIds">
              <USelectMenu
              class="w-full"
              v-model="form.clubIds"
              multiple
              value-key="id"
              :items="clubs"
              />
            </UFormField>
          </div>
        </div>

        <div class="flex justify-end">
          <UButton type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition">
            Speichern
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { archerSchema } from '~/composables/validation/archer'

  const clubs = ref([])

  const toast = useToast()

  const form = reactive({
    firstname: '',
    lastname: '',
    title: '',
    gender: '',
    birthday: '',
    active: true,
    clubIds: []
  })

  async function fetchClubs() {
    const clubsResponse = await $fetch('/api/postgres/club', { method: 'GET' })

    if(clubsResponse.length) clubs.value = clubsResponse.map(club => ({
      label: club.name,
      id: club.id
    }))
  }

  async function submit() {
    const response = await $fetch('/api/postgres/archer', { method: 'POST', body: form })

    if(!response.statusCode) {
      toast.add({
        title: "Schütze konnte nicht angelegt werden."
      })
    }

    await navigateTo('/community/archers')
  }

  onMounted(() => {
    fetchClubs()
  })
</script>