<template>
  <div class="space-y-8">
    <div class="bg-gradient-to-br from-gray-900 to-indigo-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
      <div class="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
        <ShieldCheckIcon class="h-48 w-48" />
      </div>
      <p class="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-8 italic">Ekosistem Performansı</p>

      <div class="space-y-8">
        <div v-for="stat in stats" :key="stat.label" class="flex justify-between items-center group/item">
          <span class="text-gray-400 text-xs flex items-center gap-2 italic uppercase font-bold tracking-tight">
            <component :is="stat.icon" class="h-4 w-4" />
            {{ stat.label }}
          </span>
          <span :class="['text-2xl font-black tabular-nums transition-colors italic tracking-tighter', stat.colorClass]">
            {{ stat.value }}
          </span>
        </div>
      </div>

      <div class="mt-10 pt-8 border-t border-white/5">
        <NuxtLink to="/vendor/product-form" class="flex items-center justify-center gap-3 w-full py-4 bg-white text-indigo-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-xl">
          <PlusIcon class="h-4 w-4" /> EKO-SİSTEME ÜRÜN EKLE
        </NuxtLink>
      </div>
    </div>

    <!-- Management Info -->
    <div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
      <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 italic">Ekosistem Detayları</h4>
      <div class="space-y-5">
        <div>
          <label class="text-[9px] font-black text-gray-300 uppercase block mb-1">EKOSİSTEM ADI</label>
          <p class="text-sm font-black text-gray-900 italic uppercase">{{ ecosystem.name }}</p>
        </div>
        <div v-if="ecosystem.description">
          <label class="text-[9px] font-black text-gray-300 uppercase block mb-1">VİZYON</label>
          <p class="text-xs text-gray-500 italic font-bold leading-relaxed">{{ ecosystem.description }}</p>
        </div>
        <div class="pt-6 mt-6 border-t border-gray-50 flex flex-col gap-3">
          <NuxtLink :to="`/ecosystem/${ecosystem.id}`" class="w-full py-4 bg-indigo-50 text-indigo-700 rounded-2xl text-[10px] font-black border border-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all uppercase italic">
            <ArrowTopRightOnSquareIcon class="h-4 w-4" /> PORTALI AÇ
          </NuxtLink>
          <button class="w-full py-3 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black border border-red-100 flex items-center justify-center gap-2 hover:bg-red-100 transition-all uppercase italic">
            ASKIYA AL
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  ShieldCheckIcon, CircleStackIcon, ArrowTrendingUpIcon, 
  ShieldExclamationIcon, PlusIcon, ArrowTopRightOnSquareIcon 
} from '@heroicons/vue/24/outline'

defineProps({ ecosystem: Object })

const stats = [
  { label: 'TOPLAM İZOLE STOK', value: '3.450 ADET', icon: CircleStackIcon, colorClass: 'text-white' },
  { label: 'AYLIK EKO-HACİM', value: '₺1.2M', icon: ArrowTrendingUpIcon, colorClass: 'text-green-400' },
  { label: 'ÖNLENEN İHLALLER', value: '12 ADET', icon: ShieldExclamationIcon, colorClass: 'text-orange-400' }
]
</script>
