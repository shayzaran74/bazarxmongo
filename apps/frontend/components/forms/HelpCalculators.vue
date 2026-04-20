<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
    CalculatorIcon, InformationCircleIcon, TruckIcon, CubeIcon, ScaleIcon 
} from '@heroicons/vue/24/outline'

import CommissionCalculator from '../calculators/CommissionCalculator.vue'
import DesiCalculator from '../calculators/DesiCalculator.vue'
import ShippingCalculator from '../calculators/ShippingCalculator.vue'
import VatCalculator from '../calculators/VatCalculator.vue'
import CalculatorDocs from '../calculators/CalculatorDocs.vue'

const { data: dynamicData } = await useFetch('/api/dynamic/contents?category=help', {
    baseURL: useRuntimeConfig().public.apiBase
})

const activeCalculator = ref('commission')

const calculators = {
    commission: { name: 'Komisyon', shortName: 'Komisyon', icon: CalculatorIcon, desc: 'Pazaryerlerine göre net kazanç' },
    desi: { name: 'Desi', shortName: 'Desi', icon: CubeIcon, desc: 'Hacimsel ağırlık hesabı' },
    shipping: { name: 'Kargo Ücreti', shortName: 'Kargo', icon: TruckIcon, desc: 'Tahmini gönderim maliyeti' },
    vat: { name: 'KDV', shortName: 'KDV', icon: ScaleIcon, desc: 'Vergi dahil/hariç çevrim' }
}

const activeCalculatorName = computed(() => calculators[activeCalculator.value as keyof typeof calculators].name)
const activeCalculatorDesc = computed(() => calculators[activeCalculator.value as keyof typeof calculators].desc)
const activeCalculatorIcon = computed(() => calculators[activeCalculator.value as keyof typeof calculators].icon)

defineExpose({
    setCalculator: (key: string) => { activeCalculator.value = key }
})

const getDynamicDoc = (key: string, fallback: string) => {
    if (!(dynamicData.value as any)?.success) return fallback
    const item = (dynamicData.value as any).data.find((d: any) => d.key === key)
    return item ? item.content : fallback
}

const currentDocTitle = computed(() => activeCalculatorName.value + ' Rehberi')
const currentDocContent = computed(() => {
    const map: Record<string, string> = {
        commission: getDynamicDoc('doc-commission', 'Komisyon hesaplama detayları yakında eklenecektir.'),
        desi: getDynamicDoc('doc-desi', 'Desi hesaplama formülleri ve standartları.'),
        shipping: getDynamicDoc('doc-shipping', 'Kargo fiyatlandırma politikaları.'),
        vat: getDynamicDoc('doc-vat', 'Vergi mevzuatına göre KDV hesaplama rehberi.')
    }
    return map[activeCalculator.value] || ''
})
</script>

<template>
  <div class="space-y-12">
    <!-- Main UI Card -->
    <div class="bg-white rounded-[3.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
      <!-- Premium Header -->
      <div class="px-10 py-10 border-b border-gray-50 flex flex-col lg:flex-row items-center justify-between gap-8 bg-gray-50/50">
        <div class="flex items-center gap-6">
          <div class="w-16 h-16 rounded-[2rem] bg-orange-600 flex items-center justify-center text-white shadow-xl shadow-orange-200">
            <component :is="activeCalculatorIcon" class="w-8 h-8" />
          </div>
          <div>
            <h2 class="text-3xl font-black text-gray-900 italic tracking-tighter uppercase leading-none mb-2">
              {{ activeCalculatorName }}
            </h2>
            <p class="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
              {{ activeCalculatorDesc }}
            </p>
          </div>
        </div>

        <div class="flex bg-gray-200/50 p-1.5 rounded-[2rem] backdrop-blur-xl border border-gray-200/20">
          <button
            v-for="(calc, key) in calculators"
            :key="key"
            :class="activeCalculator === key ? 'bg-white text-gray-900 shadow-xl' : 'text-gray-500 hover:text-gray-900'"
            class="px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300"
            @click="activeCalculator = key"
          >
            {{ calc.shortName }}
          </button>
        </div>
      </div>

      <!-- Calculator Viewport -->
      <div class="p-10 lg:p-14 min-h-[500px]">
        <CommissionCalculator v-if="activeCalculator === 'commission'" />
        <DesiCalculator v-if="activeCalculator === 'desi'" />
        <ShippingCalculator v-if="activeCalculator === 'shipping'" />
        <VatCalculator v-if="activeCalculator === 'vat'" />
      </div>
    </div>

    <!-- Documentation Section -->
    <CalculatorDocs 
      :title="currentDocTitle"
      :content="currentDocContent"
    />
  </div>
</template>
