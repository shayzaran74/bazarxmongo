<template>
  <div v-if="isOpen" class="fixed inset-0 z-[200] flex justify-end italic">
    <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" @click="$emit('close')" />
    
    <div class="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-slide-left border-l border-neutral-100">
      <div class="absolute top-0 left-0 w-1 h-full bg-indigo-600" />
      
      <!-- Modal Header -->
      <div class="p-10 bg-neutral-50/50 border-b border-neutral-100 flex items-center justify-between">
        <div class="flex items-center gap-6">
          <div :class="getTierBadgeColor(form.tier)" class="p-5 rounded-2xl shadow-2xl">
            <ChartBarIcon class="h-10 w-10 text-white" />
          </div>
          <div>
            <div class="flex items-center gap-4">
              <h2 class="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">{{ form.tier }} KURALINI DÜZENLE</h2>
            </div>
            <p class="text-[10px] font-black text-gray-400 mt-2 tracking-widest uppercase italic">DİNAMİK SEVİYE AVANTAJ VE LİMİTLERİNİ YAPILANDIRIN.</p>
          </div>
        </div>
        <button class="w-12 h-12 bg-white text-gray-400 hover:text-gray-900 rounded-xl transition-all shadow-sm border border-neutral-100 flex items-center justify-center" @click="$emit('close')">
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>

      <!-- Modal Content -->
      <div class="flex-1 overflow-y-auto p-12 space-y-12 bg-white">
        <!-- Finance -->
        <section class="space-y-8">
          <h3 class="text-xs font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-3 border-b border-neutral-50 pb-4">
            <CurrencyDollarIcon class="h-5 w-5 text-indigo-600" />
            FİNANSAL PARAMETRELER
          </h3>
          <div class="grid grid-cols-2 gap-8">
            <div v-for="f in [{l:'NAKİT KOMİSYON (%)', k:'commissionCash', p:true}, {l:'BARTER KOMİSYON (%)', k:'commissionBarter', p:true}, {l:'YILLIK AİDAT (₺)', k:'annualFee'}, {l:'BURN RATE', k:'burnRate'}]" :key="f.k" class="space-y-3">
              <label class="block text-[9px] font-black text-gray-400 uppercase tracking-widest italic ml-1">{{ f.l }}</label>
              <div class="relative group">
                <input v-model.number="form[f.k]" type="number" step="0.01" class="w-full bg-neutral-50 border-2 border-transparent rounded-2xl px-6 py-5 text-sm font-black focus:bg-white focus:border-indigo-600 transition-all outline-none shadow-inner group-hover:bg-white">
                <span v-if="f.p" class="absolute right-6 top-5 text-gray-400 font-black text-xs uppercase shadow-sm bg-white px-2 rounded-lg border border-neutral-100">%{{ (form[f.k] * 100).toFixed(0) }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Limits -->
        <section class="space-y-8">
          <h3 class="text-xs font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-3 border-b border-neutral-50 pb-4">
            <ShieldCheckIcon class="h-5 w-5 text-purple-600" />
            LİMİTLER & XP SİSTEMİ
          </h3>
          <div class="grid grid-cols-2 gap-8">
            <div v-for="f in [{l:'ÜRÜN KAPASİTESİ', k:'listingLimit'}, {l:'API LİMİT (DK)', k:'apiRatePerMin'}, {l:'XP ÇARPANI', k:'xpMultiplier', s:0.1}, {l:'MAKS. ROI (%)', k:'roiRate', p:true}]" :key="f.k" class="space-y-3">
              <label class="block text-[9px] font-black text-gray-400 uppercase tracking-widest italic ml-1">{{ f.l }}</label>
              <div class="relative group">
                <input v-model.number="form[f.k]" type="number" :step="f.s || 1" class="w-full bg-neutral-50 border-2 border-transparent rounded-2xl px-6 py-5 text-sm font-black focus:bg-white focus:border-indigo-600 transition-all outline-none shadow-inner group-hover:bg-white">
                <span v-if="f.p" class="absolute right-6 top-5 text-gray-400 font-black text-xs uppercase shadow-sm bg-white px-2 rounded-lg border border-neutral-100">%{{ (form[f.k] * 100).toFixed(0) }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Footer -->
      <div class="p-10 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-end gap-6">
        <button class="px-10 py-5 rounded-2xl text-[10px] font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest transition-all" @click="$emit('close')">VAZGEÇ</button>
        <button :disabled="loading" class="bg-gray-900 text-white px-14 py-5 rounded-2xl hover:bg-black transition-all font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-gray-200 active:scale-95 disabled:opacity-50" @click="$emit('save')">
          {{ loading ? 'KAYDEDİLİYOR...' : 'KONFİGÜRASYONU GÜNCELLE' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ChartBarIcon, XMarkIcon, CurrencyDollarIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline'

defineProps({ isOpen: Boolean, form: Object, loading: Boolean })
defineEmits(['close', 'save'])

const getTierBadgeColor = (tierName) => {
  const colors = {
    'CORE': 'bg-slate-900',
    'PRIME': 'bg-blue-600',
    'ELITE': 'bg-purple-600',
    'APEX': 'bg-amber-500 shadow-amber-200',
  }
  return colors[tierName] || 'bg-gray-400'
}
</script>

<style scoped>
@keyframes slide-left { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
.animate-slide-left { animation: slide-left 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
</style>
