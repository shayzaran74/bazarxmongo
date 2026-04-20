<template>
  <div class="grid grid-cols-1 gap-8 font-sans italic">
    <div
      v-for="campaign in campaigns"
      :key="campaign.id"
      class="bg-white rounded-[3.5rem] p-10 border border-neutral-100 shadow-2xl shadow-black/[0.02] hover:shadow-black/[0.05] transition-all group relative overflow-hidden"
    >
      <div class="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transition-transform group-hover:rotate-12 group-hover:scale-110">
        <UserGroupIcon class="h-48 w-48 text-gray-900" />
      </div>

      <div class="flex flex-col xl:flex-row items-center gap-10 relative z-10">
        <!-- Product Preview -->
        <div class="w-40 h-40 rounded-[2.5rem] overflow-hidden ring-4 ring-neutral-50 shadow-inner group-hover:ring-blue-50 transition-all shrink-0">
          <img
            :src="campaign.Product?.image || 'https://placehold.co/600x600?text=PRODUCT'"
            class="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
          >
        </div>

        <!-- Info Section -->
        <div class="flex-1 space-y-4 text-center xl:text-left">
          <div class="flex flex-wrap items-center justify-center xl:justify-start gap-3">
             <span
                class="px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm"
                :class="campaign.isActive ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'"
              >
                {{ campaign.isActive ? 'AKTİF KAMPANYA' : 'PASİF / DURDURULDU' }}
              </span>
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-neutral-50 px-4 py-1.5 rounded-full flex items-center gap-2">
                <ClockIcon class="h-3 w-3" />
                {{ formatDate(campaign.startDate) }} — {{ formatDate(campaign.endDate) }}
              </span>
          </div>
          <div>
            <h3 class="text-3xl font-black text-gray-900 uppercase tracking-tightest leading-none">{{ campaign.title || campaign.Product?.name }}</h3>
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{{ campaign.Product?.name || 'BELİRSİZ ÜRÜN MODÜLÜ' }}</p>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-8 text-center xl:text-right px-10 xl:border-l border-neutral-100 shrink-0">
          <div>
            <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">KATILIM</p>
            <p class="text-2xl font-black text-gray-900 tracking-tighter">{{ campaign.currentQuantity }} <span class="text-xs">ADET</span></p>
          </div>
          <div>
            <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">BAZ FİYAT</p>
            <p class="text-xl font-black text-gray-400 line-through tracking-tighter opacity-50">₺{{ formatPrice(campaign.Product?.price) }}</p>
          </div>
          <div class="col-span-2 md:col-span-1">
             <p class="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1 italic">AKTİF FİYAT</p>
             <p class="text-3xl font-black text-blue-600 tracking-tighter">₺{{ formatPrice(getCurrentPrice(campaign)) }}</p>
          </div>
        </div>
      </div>

      <!-- Tiers Visualizer -->
      <div class="mt-8 pt-8 border-t border-neutral-50 relative z-10">
        <div class="flex flex-wrap gap-3">
           <span
            v-for="tier in campaign.tiers"
            :key="tier.minQuantity"
            class="px-5 py-3 bg-slate-900 rounded-2xl border border-slate-800 text-white flex flex-col gap-1 transition-all hover:translate-y-[-2px] hover:shadow-xl"
          >
            <span class="text-[8px] font-black text-slate-500 uppercase tracking-widest">{{ tier.minQuantity }}+ SİPARİŞ</span>
            <span class="text-xs font-black tracking-tightest">₺{{ formatPrice(tier.price) }}</span>
          </span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-8 flex justify-center xl:justify-end gap-3 relative z-10">
        <button
          class="p-4 bg-white border border-neutral-200 text-gray-400 hover:text-blue-600 hover:border-blue-600 rounded-2xl transition-all shadow-sm active:scale-90"
          @click="$emit('edit', campaign)"
        >
          <PencilSquareIcon class="h-5 w-5" />
        </button>
        <button
          class="p-4 bg-white border border-neutral-200 text-gray-400 hover:text-red-600 hover:border-red-600 rounded-2xl transition-all shadow-sm active:scale-90"
          @click="$emit('delete', campaign.id)"
        >
          <TrashIcon class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserGroupIcon, ClockIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'

defineProps<{
  campaigns: any[]
}>()

defineEmits(['edit', 'delete'])

const formatPrice = (price: number) => {
  return Number(price || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const getCurrentPrice = (campaign: any) => {
  const quantity = campaign.currentQuantity || 0
  const sortedTiers = [...campaign.tiers].sort((a, b) => b.minQuantity - a.minQuantity)
  const applicableTier = sortedTiers.find(t => quantity >= t.minQuantity)
  return applicableTier ? applicableTier.price : (campaign.Product?.price || 0)
}
</script>

<style scoped>
.tracking-tightest { letter-spacing: -0.06em; }
</style>
