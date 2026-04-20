<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div v-for="stat in statCards" :key="stat.label" class="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
      <div class="flex items-center justify-between mb-4">
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ stat.label }}</p>
        <div class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform">
          <span class="text-xl">{{ stat.icon }}</span>
        </div>
      </div>
      <p class="text-3xl font-black text-gray-900 italic tracking-tighter">{{ stat.value }}</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  total: Number,
  count: Number,
  page: Number,
  totalPages: Number
})

const statCards = computed(() => [
  { label: 'Toplam Zincir', value: props.total, icon: '⛓️' },
  { label: 'Gösterilen', value: props.count, icon: '👁️' },
  { label: 'Sayfa', value: `${props.page} / ${props.totalPages}`, icon: '📄' }
])
</script>
