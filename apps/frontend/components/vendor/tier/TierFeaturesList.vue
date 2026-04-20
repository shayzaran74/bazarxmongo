<script setup lang="ts">
defineProps<{
  tierData: any
}>()
</script>

<template>
  <div v-if="tierData?.description" class="p-8 space-y-8">
    <div>
        <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">SERVİS YETKİNLİKLERİ</h4>
        <p class="text-xs font-bold text-gray-900 border-l-4 border-orange-500 pl-4 py-2 bg-gray-50 rounded-r-xl leading-relaxed italic">{{ tierData.description }}</p>
    </div>

    <div class="grid grid-cols-3 gap-3">
      <div v-for="item in [
        { icon: '📦', name: 'Toplu Yükleme', active: tierData?.limits?.maxProducts >= 100 },
        { icon: '🔌', name: 'API Erişimi', active: tierData?.roiRate >= 0.85 },
        { icon: '📌', name: 'Öncelik', active: tierData?.limits?.featuredProductSlots > 0 },
        { icon: '📢', name: 'Promosyon', active: tierData?.xpMultiplier >= 1.3 },
        { icon: '👤', name: 'Özel Destek', active: tierData?.roiRate >= 1.0 },
        { icon: '🏪', name: 'Özel Mağaza', active: tierData?.limits?.barterPoolLimit === null }
      ]" :key="item.name" class="flex flex-col items-center justify-center p-4 rounded-3xl border transition-all" :class="item.active ? 'bg-orange-50/50 border-orange-100 text-orange-600 scale-105 shadow-sm' : 'bg-gray-50/30 border-gray-100 text-gray-300 opacity-40 grayscale'">
        <span class="text-3xl mb-3">{{ item.icon }}</span>
        <span class="text-[8px] font-black uppercase tracking-widest text-center">{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>
