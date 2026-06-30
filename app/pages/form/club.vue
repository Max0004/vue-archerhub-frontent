<template>
  <div class="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
    <!-- Header -->
    <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div class="flex items-center gap-3 mb-2">
        <Target class="w-8 h-8 text-blue-600" />
        <h1 class="text-3xl font-bold text-slate-800">
          Verein/Organisation erstellen
        </h1>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <UForm class="space-y-8" :schema="clubSchema" :state="form" @submit="submit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="Vereinsname" name="name">
            <UInput v-model="form.name" />
          </UFormField>

          <UFormField label="Bezeichnung für Ergebnislisten" name="tournamentBoardName">
            <UInput v-model="form.tournamentBoardName" />
          </UFormField>

          <UFormField label="Kurzbeschreibung" name="description">
            <UInput v-model="form.description" />
          </UFormField>

          <UFormField label="Website" name="webURL">
            <UInput v-model="form.webURL" />
          </UFormField>

          <UFormField label="Organisation/Dachverband" name="organization">
            <UCheckbox v-model="form.organization" />
          </UFormField>
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
  import { clubSchema } from '~/composables/validation/club';
  import type { FormSubmitEvent } from '@nuxt/ui'

  const toast = useToast()

  const form = reactive({
    name: '',
    tournamentBoardName: '',
    description: '',
    webURL: '',
    organization: false
  })

  async function submit(event: FormSubmitEvent<tournamentSchema>) {
    const data = event.data

    const response = await $fetch('/api/postgres/club', { method: 'POST', body: data })

    if(!response.statusCode) {
      toast.add({
        title: "Verein konnte nicht erstellt werden."
      })
    }

    await navigateTo('/community/clubs')
  }
</script>