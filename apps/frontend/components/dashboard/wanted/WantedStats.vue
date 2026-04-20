<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 italic">
    <div v-for="stat in items" :key="stat.label" class="group bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm hover:shadow-2xl hover:shadow-neutral-200 transition-all flex items-center gap-8 relative overflow-hidden">
      <div v-if="stat.color" :class="stat.color" class="absolute left-0 top-0 bottom-0 w-2" />
      <div class="w-16 h-16 rounded-[1.5rem] bg-neutral-50 flex items-center justify-center border border-black/5 group-hover:scale-110 transition-transform shadow-inner">
        <component :is="stat.icon" class="h-8 w-8 text-indigo-600" />
      </div>
      <div>
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">{{ stat.label }}</p>
        <p class="text-4xl font-black text-gray-900 tracking-tightest leading-none">{{ stat.value }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { MagnifyingGlassIcon, CheckCircleIcon, TagIcon } from '@heroicons/vue/24/outline'

const props = defineProps({ total: Number, active: Number, categories: Number })
const items = computed(() => [
  { label: 'TOPLAM İSTEK', value: props.total, icon: MagnifyingGlassIcon },
  { label: 'AKTİF ARAMA', value: props.active, icon: CheckCircleIcon, color: 'bg-emerald-500' },
  { label: 'KATEGORİ', value: props.categories, icon: TagIcon, color: 'bg-indigo-500' }
])
</script>
