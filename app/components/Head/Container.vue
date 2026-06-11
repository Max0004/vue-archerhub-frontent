<template>
  <header class="bg-gray-900 text-white shadow-md">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between md:justify-center py-4">
        <!-- Logo -->
        <NuxtLink
          href="/"
          class="md:absolute left-4 text-2xl font-bold hover:text-gray-300"
        >
          Archerhub
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex space-x-8">
          <div
            v-for="item in menuItems"
            :key="item.title"
            class="relative"
            @mouseenter="showDropdown(item)"
            @mouseleave="hideDropdownWithDelay(item)"
          >
            <button class="hover:text-gray-300 font-semibold">
              {{ item.title }}
            </button>

            <div
              v-if="item.showDropdown"
              class="absolute left-0 mt-2 bg-white text-gray-900 rounded-lg shadow-lg z-10 min-w-[150px]"
              @mouseenter="cancelHideDropdown(item)"
              @mouseleave="hideDropdownWithDelay(item)"
            >
              <ul>
                <li
                  v-for="sub in item.subMenu"
                  :key="sub.name"
                  class="p-2 hover:bg-gray-200"
                >
                  <NuxtLink :href="sub.link">
                    {{ sub.name }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <!-- Mobile Hamburger -->
        <button
          class="md:hidden"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      <!-- Mobile Navigation -->
      <div
        v-if="mobileMenuOpen"
        class="md:hidden pb-4"
      >
        <div
          v-for="item in menuItems"
          :key="item.title"
          class="border-t border-gray-700"
        >
          <button
            class="w-full flex justify-between items-center py-3 font-semibold"
            @click="toggleMobileDropdown(item)"
          >
            <span>{{ item.title }}</span>
            <span>{{ item.mobileOpen ? '−' : '+' }}</span>
          </button>

          <div
            v-if="item.mobileOpen"
            class="pl-4 pb-2"
          >
            <NuxtLink
              v-for="sub in item.subMenu"
              :key="sub.name"
              :href="sub.link"
              class="block py-2 text-gray-300 hover:text-white"
              @click="mobileMenuOpen = false"
            >
              {{ sub.name }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import navigationItems from '~/assets/data/navigationItems';

const mobileMenuOpen = ref(false);

const menuItems = ref(
  navigationItems.map(item => ({
    ...item,
    showDropdown: false,
    mobileOpen: false,
    hideTimeout: null as ReturnType<typeof setTimeout> | null,
  }))
);

const showDropdown = (item: any) => {
  if (item.hideTimeout) clearTimeout(item.hideTimeout);
  item.showDropdown = true;
};

const hideDropdownWithDelay = (item: any) => {
  item.hideTimeout = setTimeout(() => {
    item.showDropdown = false;
  }, 200);
};

const cancelHideDropdown = (item: any) => {
  if (item.hideTimeout) clearTimeout(item.hideTimeout);
};

const toggleMobileDropdown = (item: any) => {
  item.mobileOpen = !item.mobileOpen;
};
</script>