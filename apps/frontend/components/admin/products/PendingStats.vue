<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 italic">
    <div v-for="stat in items" :key="stat.label" class="bg-white rounded-[2.5rem] p-10 border border-neutral-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
      <div v-if="stat.color" :class="stat.color" class="absolute left-0 top-0 bottom-0 w-2" />
      <div class="flex items-center gap-6 relative z-10">
        <div class="w-16 h-16 rounded-2xl bg-neutral-50 flex items-center justify-center p-4 border border-black/5 group-hover:scale-110 transition-transform">
          <component :is="stat.icon" class="w-full h-full text-indigo-600" />
        </div>
        <div>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ stat.label }}</p>
          <p class="text-3xl font-black text-gray-900 mt-1 tracking-tighter">{{ stat.value }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/vue/24/outline'

const props = defineProps({ total: Number, approved: Number, rejected: Number })
const items = computed(() => [
  { label: 'ONAY BEKLEYEN', value: props.total, icon: ClockIcon, color: 'bg-amber-500' },
  { label: 'BUGÜN ONAYLANAN', value: props.approved, icon: CheckCircleIcon, color: 'bg-emerald-500' },
  { label: 'BUGÜN REDDEDİLEN', value: props.rejected, icon: XCircleIcon, color: 'bg-red-500' }
])
</script>
