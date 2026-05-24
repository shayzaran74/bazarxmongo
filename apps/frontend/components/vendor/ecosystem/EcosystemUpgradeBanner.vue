<script setup lang="ts">
const props = defineProps<{
  currentTier: string
  currentCount: number
  limit: number
  upgradeRequired: string
}>()

const tierLabel: Record<string, string> = {
  CORE: 'Core',
  PRIME: 'Premium',
  ELITE: 'Elite',
}
const nextLimit: Record<string, number> = {
  CORE: 5,
  PRIME: 10,
}
</script>

<template>
  <div class="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between gap-4">
    <div>
      <p class="text-sm font-medium text-purple-900">
        {{ tierLabel[currentTier] }} kotanı doldurdun ({{ currentCount }}/{{ limit }})
      </p>
      <p class="text-xs text-purple-700 mt-0.5">
        {{ upgradeRequired }} üyeliğine geçerek {{ nextLimit[currentTier] }} ekosisteme erişebilirsin
      </p>
    </div>
    <NuxtLink
      to="/pricing"
      class="flex-shrink-0 text-sm px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
    >
      Yükselt →
    </NuxtLink>
  </div>
</template>