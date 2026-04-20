<template>
  <div class="bg-gray-900 rounded-[3rem] p-10 text-white shadow-3xl shadow-gray-900/40 relative overflow-hidden ring-1 ring-white/10 group italic">
    <div class="absolute -right-20 -top-20 w-80 h-80 bg-indigo-600 rounded-full blur-[120px] opacity-20 transition-opacity duration-1000 group-hover:opacity-30" />
    <div class="absolute -left-20 -bottom-20 w-60 h-60 bg-primary-600 rounded-full blur-[100px] opacity-15 transition-opacity duration-1000 group-hover:opacity-25" />

    <div class="relative z-10 space-y-10">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-3 h-3 rounded-full animate-pulse bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
          <span class="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">CANLI YAYINDA</span>
        </div>
        <span class="text-[9px] font-black text-gray-500 uppercase tracking-widest">GÜNCELLEME: {{ formatDate(item.createdAt) }}</span>
      </div>

      <div class="grid grid-cols-1 xs:grid-cols-2 gap-10 divide-y xs:divide-y-0 xs:divide-x divide-white/10">
        <div class="pb-8 xs:pb-0 space-y-3">
          <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">BİRİM FİYAT</p>
          <p class="text-4xl sm:text-5xl font-black text-white tracking-tighter leading-none">{{ item.unitPrice ? formatCurrency(item.unitPrice) : 'TEKLİF ALIN' }}</p>
          <p class="text-[10px] font-black text-emerald-400 uppercase tracking-widest">1 {{ item.unit }}</p>
        </div>
        <div class="pt-8 xs:pt-0 xs:pl-10 space-y-3">
          <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">TAHMİNİ TOPLAM</p>
          <p class="text-4xl sm:text-5xl font-black text-indigo-400 tracking-tighter leading-none">{{ item.unitPrice ? formatCurrency(item.unitPrice * item.quantity) : '—' }}</p>
          <p class="text-[10px] font-black text-indigo-500/60 uppercase tracking-widest">{{ item.quantity }} {{ item.unit }} STOK</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div v-for="s in [{l:'MEVCUT', v:availableQuantity, c:'text-white'}, {l:'REZERVE', v:item.blockedQuantity || 0, c:'text-amber-400'}]" :key="s.l" class="bg-white/5 rounded-[2rem] p-6 border border-white/5 backdrop-blur-3xl group/card hover:bg-white/10 transition-all shadow-inner">
          <p class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">{{ s.l }}</p>
          <div class="flex items-baseline space-x-2">
            <span class="text-3xl font-black" :class="s.c">{{ s.v }}</span>
            <span class="text-[9px] text-gray-500 uppercase font-black italic">{{ item.unit }}</span>
          </div>
        </div>
      </div>

      <div class="space-y-4 pt-4">
        <div class="flex justify-between items-end">
          <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest">STOK DURUMU</p>
          <p class="text-xl font-black text-white tracking-tighter leading-none">%{{ availablePercent }}</p>
        </div>
        <div class="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 p-1">
          <div class="h-full rounded-full transition-all duration-1000 ease-out shadow-2xl" :class="availablePercent > 50 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : availablePercent > 20 ? 'bg-gradient-to-r from-amber-500 to-orange-400' : 'bg-gradient-to-r from-red-600 to-rose-400'" :style="{ width: availablePercent + '%' }" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ item: Object, availableQuantity: Number, availablePercent: Number })

const formatCurrency = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val || 0)
const formatDate = (val) => new Date(val).toLocaleDateString('tr-TR')
</script>
