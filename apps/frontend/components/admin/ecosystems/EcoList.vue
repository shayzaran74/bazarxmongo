<template>
  <div class="space-y-6 italic">
    <h2 class="text-sm font-black text-gray-400 uppercase tracking-widest px-1 ml-2">MARKA EKOSİSTEMLERİ</h2>
    
    <div v-if="loading && !items.length" class="space-y-6 animate-pulse">
      <div v-for="i in 3" :key="i" class="h-32 bg-white rounded-[3rem] border border-neutral-100" />
    </div>
    
    <div v-else class="space-y-6">
      <div v-for="eco in items" :key="eco.id" :class="selectedId === eco.id ? 'ring-4 ring-indigo-500 shadow-2xl' : 'hover:shadow-xl hover:shadow-neutral-200'" class="bg-white rounded-[3rem] border border-neutral-100 p-8 transition-all group overflow-hidden relative cursor-pointer" @click="$emit('select', eco)">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-6">
            <div class="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl font-black text-indigo-600 shadow-inner border border-black/5">{{ eco.name.charAt(0) }}</div>
            <div>
              <h3 class="text-xl font-black text-gray-900 uppercase tracking-tightest leading-none mb-2 italic">{{ eco.name }}</h3>
              <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest italic opacity-60">{{ eco.Owner?.businessName }}</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-2xl font-black text-gray-900 tracking-tightest leading-none mb-1 italic">{{ formatCurrency(eco.stats.totalValue) }}</div>
            <div class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] italic">{{ eco.stats.totalStok }} ADET STOK</div>
          </div>
        </div>
        
        <div class="mt-8 flex gap-3">
          <span class="bg-neutral-50 text-gray-400 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all italic">{{ eco.stats.memberCount }} ÜYE</span>
          <span class="bg-neutral-50 text-gray-400 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all italic">{{ eco.stats.listingCount }} ÜRÜN</span>
          <span v-if="eco.stats.logCount > 0" class="bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl italic">{{ eco.stats.logCount }} GÜVENLİK OLAYI</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ items: Array, loading: Boolean, selectedId: String })
defineEmits(['select'])
const formatCurrency = (v) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v || 0)
</script>
