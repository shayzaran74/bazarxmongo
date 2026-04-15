<template>
  <div class="product-sort flex items-center gap-3">
    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline-block">
      Sıralama:
    </span>
    <select
      v-model="internalValue"
      class="bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all cursor-pointer min-w-[160px]"
    >
      <option value="">{{ $t('products.sortOptions.recommended') }}</option>
      <option value="priceAsc">{{ $t('products.sortOptions.priceAsc') }}</option>
      <option value="priceDesc">{{ $t('products.sortOptions.priceDesc') }}</option>
      <option value="newest">{{ $t('products.sortOptions.newest') }}</option>
      <option value="popular">{{ $t('products.sortOptions.popular') }}</option>
      <option value="rating">{{ $t('products.sortOptions.rating') }}</option>
    </select>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>
