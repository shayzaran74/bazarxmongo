<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6 italic">
    <div v-for="stat in dynamicStats" :key="stat.label" class="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all flex flex-col gap-4 relative overflow-hidden">
      <div v-if="stat.border" :class="stat.border" class="absolute left-0 top-0 bottom-0 w-1.5" />
      <div class="relative z-10">
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ stat.label }}</p>
        <p class="text-3xl font-black mt-1 tracking-tighter" :class="stat.color">{{ stat.value }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ stats: Object })

const dynamicStats = computed(() => [
  { label: 'TOPLAM ÜRÜN', value: props.stats?.totalProducts || 0, color: 'text-gray-900' },
  { label: 'STOKTA YOK', value: props.stats?.outOfStock || 0, color: 'text-red-600', border: 'bg-red-500' },
  { label: 'DÜŞÜK STOK', value: props.stats?.lowStock || 0, color: 'text-amber-600', border: 'bg-amber-500' },
  { label: 'SAĞLIKLI STOK', value: props.stats?.healthyStock || 0, color: 'text-green-600', border: 'bg-green-500' }
])
</script>
