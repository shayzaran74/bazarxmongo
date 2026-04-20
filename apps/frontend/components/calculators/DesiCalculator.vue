<script setup lang="ts">
import { ref, computed } from 'vue'

const desiWidth = ref(0)
const desiLength = ref(0)
const desiHeight = ref(0)
const desiDivisor = ref(3000)

const calculatedDesi = computed(() => {
  const res = (desiWidth.value * desiLength.value * desiHeight.value) / desiDivisor.value
  return res > 0 ? res.toFixed(2) : '0.00'
})
</script>

<template>
  <div class="animate-in fade-in slide-in-from-top-4 duration-300">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
      <div class="space-y-6">
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">BOYUTLAR (CM)</label>
        <div class="grid grid-cols-3 gap-4">
          <div class="space-y-2">
            <input v-model.number="desiWidth" type="number" class="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl font-black text-center focus:ring-2 focus:ring-orange-500 transition-all" placeholder="EN">
            <span class="block text-[9px] font-black text-gray-400 text-center uppercase tracking-widest">EN</span>
          </div>
          <div class="space-y-2">
            <input v-model.number="desiLength" type="number" class="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl font-black text-center focus:ring-2 focus:ring-orange-500 transition-all" placeholder="BOY">
            <span class="block text-[9px] font-black text-gray-400 text-center uppercase tracking-widest">BOY</span>
          </div>
          <div class="space-y-2">
            <input v-model.number="desiHeight" type="number" class="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl font-black text-center focus:ring-2 focus:ring-orange-500 transition-all" placeholder="YÜK.">
            <span class="block text-[9px] font-black text-gray-400 text-center uppercase tracking-widest">YÜKSEKLİK</span>
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest px-2">HESAPLAMA STANDARDI</label>
          <select v-model="desiDivisor" class="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl font-bold text-sm focus:ring-2 focus:ring-orange-500 transition-all appearance-none cursor-pointer">
            <option :value="3000">YURTİÇİ STANDART (3000)</option>
            <option :value="5000">ULUSLARARASI (5000)</option>
          </select>
        </div>
      </div>

      <div class="bg-gray-900 rounded-[3rem] p-12 text-center relative overflow-hidden group shadow-2xl">
        <div class="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-transparent pointer-events-none"></div>
        <h3 class="text-white/40 font-black uppercase text-[10px] tracking-[0.3em] mb-4">HESAPLANAN DESİ</h3>
        <div class="text-[8rem] font-black italic tracking-tighter text-white leading-none mb-6 group-hover:scale-105 transition-transform duration-500">
          {{ calculatedDesi }}
        </div>
        <div class="inline-flex items-center px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-white/40 uppercase tracking-widest">
           ( EN x BOY x YÜK ) / {{ desiDivisor }}
        </div>
      </div>
    </div>
  </div>
</template>
