<template>
  <div class="bg-white border-b border-gray-100 shadow-sm mb-8">
    <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-gray-900 tracking-tight">
            {{ title }}
          </h1>
          <p
            v-if="subtitle"
            class="text-sm text-gray-500 mt-1"
          >
            {{ subtitle }}
          </p>
        </div>
        <div class="flex items-center space-x-4">
          <slot name="actions" />
        </div>
      </div>
      
      <!-- Stats -->
      <div
        v-if="stats && stats.length > 0"
        class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6"
      >
        <div
          v-for="(stat, index) in stats"
          :key="index" 
          class="bg-gray-50 rounded-xl p-4 border border-gray-100"
        >
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {{ stat.label }}
          </p>
          <p class="text-2xl font-black text-gray-900 mt-1">
            {{ stat.value }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  stats: { type: Array, default: () => [] }
})
</script>
