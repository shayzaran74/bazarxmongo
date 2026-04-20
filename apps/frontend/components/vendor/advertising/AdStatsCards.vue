<!-- apps/frontend/pages/vendor/advertising/components/AdStatsCards.vue -->
<script setup lang="ts">
import { ArrowTrendingUpIcon, MinusIcon } from '@heroicons/vue/24/outline'
import type { SummaryStat } from '~/types/advertising'

defineProps<{
  stats: SummaryStat[]
}>()
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div class="flex items-center justify-between mb-4">
        <div :class="`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`">
          <component
            :is="stat.icon"
            class="w-6 h-6"
          />
        </div>
        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">{{ stat.label }}</span>
      </div>
      <div class="flex flex-col">
        <span class="text-2xl font-bold text-gray-900">{{ stat.value }}</span>
        <div
          class="flex items-center gap-1 text-sm mt-1"
          :class="stat.trend > 0 ? 'text-green-500' : 'text-gray-400'"
        >
          <ArrowTrendingUpIcon
            v-if="stat.trend > 0"
            class="w-4 h-4"
          />
          <MinusIcon
            v-else
            class="w-4 h-4"
          />
          <span class="font-medium">Sektör ortalamasında</span>
        </div>
      </div>
    </div>
  </div>
</template>
