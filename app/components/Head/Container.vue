<template>
  <header class="header-bar">
    <div class="container mx-auto px-4">
      <div class="relative flex items-center justify-center py-4">
        <!-- Logo -->
        <NuxtLink
          href="/"
          class="absolute left-0 text-xl font-bold hover:text-gray-300"
        >
          Archerhub
        </NuxtLink>
        <div>
          <UNavigationMenu arrow content-orientation="vertical" :items="navigationItems" class="w-full justify-center cursor-pointer" />
        </div>
      </div>
    </div>
  </header>
</template>
<script setup lang="ts">
  import navigationItems from '~/assets/data/navigationItems'
</script>