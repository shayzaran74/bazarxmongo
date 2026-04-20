<template>
  <header class="bg-white/80 backdrop-blur-xl border-b border-gray-100 px-8 py-5 flex items-center justify-between z-10">
    <div class="flex items-center gap-6">
      <h1 class="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
        <div class="w-2 h-8 bg-primary-600 rounded-full" />
        {{ pageTitle }}
      </h1>
    </div>

    <div class="flex items-center gap-4">
      <button class="relative p-2.5 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-2xl transition-all">
        <BellIcon class="h-6 w-6" />
        <span class="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full" />
      </button>

      <div class="h-8 w-px bg-gray-100 mx-2" />

      <NuxtLink
        to="/"
        class="group inline-flex items-center px-6 py-2.5 bg-gray-900 text-white rounded-2xl text-sm font-black hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
      >
        <EyeIcon class="h-4 w-4 mr-2 transition-transform group-hover:scale-125" />
        SİTEYİ GÖR
      </NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
import { BellIcon, EyeIcon } from '@heroicons/vue/24/outline'

defineProps<{
  pageTitle: string
}>()
</script>
