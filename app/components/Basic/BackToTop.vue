<template>
    <div
      v-if="isVisible"
      class="fixed bottom-5 right-5 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-all"
      @click="scrollToTop"
      @keydown.space.prevent="scrollToTop"
      tabindex="0"
      role="button"
      aria-label="Back to top"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m3 3l-3-3 3-3" />
      </svg>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  
  const isVisible = ref(false);
  
  const checkScroll = () => {
    isVisible.value = window.scrollY > 200;
  };
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  onMounted(() => {
    window.addEventListener('scroll', checkScroll);
  });
  
  onUnmounted(() => {
    window.removeEventListener('scroll', checkScroll);
  });
  </script>