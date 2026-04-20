<template>
  <header class="bg-white border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold text-gray-900">{{ pageTitle }}</h1>
      <div class="flex items-center space-x-4">
        <button class="p-2 text-gray-400 hover:text-gray-600 rounded-md">
          <BellIcon class="h-6 w-6" />
        </button>
        <NuxtLink
          to="/"
          class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <EyeIcon class="h-4 w-4 mr-2" /> Siteyi Görüntüle
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { BellIcon, EyeIcon } from '@heroicons/vue/24/outline'
defineProps<{ pageTitle: string }>()
</script>
