<script setup lang="ts">
import { ref, computed } from 'vue'

const { formatCurrency, formatNumber } = useCalculators()

const vatAmount = ref(1000)
const vatRate = ref(20)
const vatType = ref('exclude') 

const calculatedVat = computed(() => (vatAmount.value || 0) * (vatRate.value / 100))
const calculatedInnerVat = computed(() => {
  const val = vatAmount.value || 0
  return val * (vatRate.value / (100 + vatRate.value))
})
</script>

<template>
  <div class="animate-in fade-in slide-in-from-top-4 duration-300">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div class="space-y-8">
        <div>
          <label class="block text-[10px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em] px-2">İŞLEM TUTARI</label>
          <div class="relative group">
            <input v-model.number="vatAmount" type="number" class="w-full pl-6 pr-16 py-6 bg-gray-100/50 border border-transparent focus:bg-white focus:border-orange-500 rounded-3xl text-2xl font-black italic transition-all outline-none" placeholder="0">
            <span class="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">TL</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-8">
          <div>
            <label class="block text-[10px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em] px-2">KDV ORANI</label>
            <div class="flex gap-2 p-1 bg-gray-100 rounded-2xl">
              <button v-for="rate in [1, 10, 20]" :key="rate" :class="vatRate === rate ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400'" class="flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all" @click="vatRate = rate">%{{ rate }}</button>
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em] px-2">HESAPLAMA TÜRÜ</label>
            <select v-model="vatType" class="w-full px-5 py-4 bg-gray-100/50 border border-transparent focus:bg-white focus:border-orange-500 rounded-2xl font-bold text-xs transition-all appearance-none cursor-pointer">
              <option value="exclude">KDV HARİÇ -> DAHİL</option>
              <option value="include">KDV DAHİL -> HARİÇ</option>
            </select>
          </div>
        </div>
      </div>

      <div class="bg-gray-950 rounded-[3rem] p-10 text-white flex flex-col justify-center font-black relative overflow-hidden group shadow-2xl">
        <div class="absolute inset-0 bg-gradient-to-tr from-orange-600/10 to-transparent pointer-events-none"></div>
        
        <div v-if="vatType === 'exclude'" class="space-y-6">
          <div class="flex justify-between items-center text-white/40">
            <span class="text-[10px] uppercase tracking-widest">KDV HARİÇ TUTAR</span>
            <span class="text-lg">₺{{ formatNumber(vatAmount) }}</span>
          </div>
          <div class="flex justify-between items-center text-orange-400">
            <span class="text-[10px] uppercase tracking-widest">HESAPLANAN KDV (%{{ vatRate }})</span>
            <span class="text-xl">+₺{{ formatNumber(calculatedVat) }}</span>
          </div>
          <div class="h-px bg-white/5 w-full" />
          <div class="pt-4">
            <span class="block text-[10px] text-white/40 uppercase tracking-widest mb-2">Genel Toplam (Dahil)</span>
            <span class="text-6xl italic tracking-tighter text-green-400">₺{{ formatNumber((vatAmount || 0) + calculatedVat) }}</span>
          </div>
        </div>

        <div v-else class="space-y-6">
          <div class="flex justify-between items-center text-white/40">
            <span class="text-[10px] uppercase tracking-widest">KDV DAHİL TUTAR</span>
            <span class="text-lg">₺{{ formatNumber(vatAmount) }}</span>
          </div>
          <div class="flex justify-between items-center text-orange-400">
            <span class="text-[10px] uppercase tracking-widest">İÇİNDEKİ KDV (%{{ vatRate }})</span>
            <span class="text-xl">-₺{{ formatNumber(calculatedInnerVat) }}</span>
          </div>
          <div class="h-px bg-white/5 w-full" />
          <div class="pt-4">
            <span class="block text-[10px] text-white/40 uppercase tracking-widest mb-2">Vergisiz Net Tutar</span>
            <span class="text-6xl italic tracking-tighter text-green-400">₺{{ formatNumber((vatAmount || 0) - calculatedInnerVat) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
