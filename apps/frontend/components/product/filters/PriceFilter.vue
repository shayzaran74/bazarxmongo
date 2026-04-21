<template>
  <div class="space-y-3">
    <div class="grid grid-cols-2 gap-3">
      <div class="space-y-1">
        <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Min</label>
        <div class="relative">
          <input
            v-model.number="min"
            type="number"
            class="w-full pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            @change="$emit('update:minPrice', min)"
          >
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₺</span>
        </div>
      </div>
      <div class="space-y-1">
        <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Max</label>
        <div class="relative">
          <input
            v-model.number="max"
            type="number"
            class="w-full pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            @change="$emit('update:maxPrice', max)"
          >
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₺</span>
        </div>
      </div>
    </div>
    <button
      class="w-full px-4 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 active:scale-95 transition-all shadow-md shadow-primary-900/10"
      @click="$emit('apply')"
    >
      {{ $t('products.filters.apply') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  minPrice?: number
  maxPrice?: number
}>()

const emit = defineEmits<{
  (e: 'update:minPrice', value: number | undefined): void
  (e: 'update:maxPrice', value: number | undefined): void
  (e: 'apply'): void
}>()

const min = ref(props.minPrice)
const max = ref(props.maxPrice)

watch(() => props.minPrice, (val) => min.value = val)
watch(() => props.maxPrice, (val) => max.value = val)
</script>
