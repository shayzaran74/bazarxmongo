<script setup lang="ts">
import { ref, computed } from 'vue'
import { InformationCircleIcon } from '@heroicons/vue/24/outline'

const { formatCurrency } = useCalculators()

const shippingDesi = ref(1)
const shippingType = ref('standard')

const baseShippingPrices = [
  { max: 1, price: 45 },
  { max: 5, price: 65 },
  { max: 10, price: 85 },
  { max: 20, price: 120 },
  { max: 30, price: 160 }
]

const baseShippingPrice = computed(() => {
  const found = baseShippingPrices.find(p => shippingDesi.value <= p.max)
  return found ? found.price : 180
})

const extraShippingCost = computed(() => {
  if (shippingDesi.value > 30) return (shippingDesi.value - 30) * 5
  return 0
})

const expressFee = computed(() => shippingType.value === 'express' ? (baseShippingPrice.value + extraShippingCost.value) * 0.4 : 0)
const totalShippingCost = computed(() => baseShippingPrice.value + extraShippingCost.value + expressFee.value)
</script>

<template>
  <div class="animate-in fade-in slide-in-from-top-4 duration-300">
    <div class="mb-10 bg-blue-50/50 p-6 rounded-[2rem] flex items-start gap-4 border border-blue-100/50">
      <InformationCircleIcon class="w-6 h-6 text-blue-500 shrink-0 mt-1" />
      <div>
        <p class="text-xs font-bold text-blue-900/70 leading-relaxed uppercase tracking-widest">Önemli Bilgilendirme</p>
        <p class="text-xs text-blue-800/60 font-medium mt-1">Kargo fiyatları firmalar arası değişiklik gösterir. Bu hesaplama tahmini bir sonuç verir.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div class="space-y-8">
        <div>
          <label class="block text-[10px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em] px-2">GÖNDERİ HACMİ / AĞIRLIĞI</label>
          <div class="relative group">
            <input v-model.number="shippingDesi" type="number" class="w-full pl-6 pr-24 py-6 bg-gray-100/50 border border-transparent focus:bg-white focus:border-orange-500 rounded-3xl text-2xl font-black italic transition-all outline-none" placeholder="0">
            <span class="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase tracking-widest">DESİ / KG</span>
          </div>
        </div>

        <div>
           <label class="block text-[10px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em] px-2">TESLİMAT AYRICALIĞI</label>
           <div class="grid grid-cols-2 gap-4">
              <button :class="shippingType === 'standard' ? 'bg-orange-600 text-white shadow-xl shadow-orange-100' : 'bg-gray-100 text-gray-400 hover:bg-white border border-transparent hover:border-gray-200'" class="py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all" @click="shippingType = 'standard'">Standart Kargo</button>
              <button :class="shippingType === 'express' ? 'bg-orange-600 text-white shadow-xl shadow-orange-100' : 'bg-gray-100 text-gray-400 hover:bg-white border border-transparent hover:border-gray-200'" class="py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all" @click="shippingType = 'express'">Express Teslimat</button>
           </div>
        </div>
      </div>

      <div class="bg-gray-50 rounded-[3rem] p-10 border border-gray-100 flex flex-col justify-center font-black">
        <div class="space-y-6">
          <div class="flex justify-between items-center text-gray-400">
            <span class="text-[10px] uppercase tracking-widest">BAZ FİYAT (1-5 DESİ)</span>
            <span class="text-lg">₺{{ baseShippingPrice }}</span>
          </div>
          <div v-if="shippingDesi > 30" class="flex justify-between items-center text-gray-400">
            <span class="text-[10px] uppercase tracking-widest">EK DESİ MALİYETİ</span>
            <span class="text-lg text-red-400">+₺{{ extraShippingCost }}</span>
          </div>
          <div v-if="shippingType === 'express'" class="flex justify-between items-center text-orange-600">
            <span class="text-[10px] uppercase tracking-widest">EXPRESS HİZMET FARKI</span>
            <span class="text-lg">+₺{{ expressFee.toFixed(2) }}</span>
          </div>
          <div class="h-px bg-gray-200/50 w-full" />
          <div class="flex justify-between items-center">
            <span class="text-[11px] uppercase tracking-[0.3em] text-gray-900">Tahmini Toplam</span>
            <span class="text-5xl italic tracking-tighter text-green-600">{{ formatCurrency(totalShippingCost) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
