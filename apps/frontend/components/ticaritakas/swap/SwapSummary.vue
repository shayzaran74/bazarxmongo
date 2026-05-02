<template>
  <div class="space-y-6">
    <!-- User A (From) -->
    <div class="bg-white rounded-3xl p-6 border border-gray-100 flex items-center gap-5 relative group overflow-hidden">
      <div class="absolute inset-y-0 left-0 w-1.5 bg-gray-100 group-hover:bg-indigo-500 transition-colors" />
      <div class="absolute -top-3 right-4 px-2 py-0.5 bg-gray-50 rounded-lg text-[8px] font-black text-gray-400 uppercase border border-gray-100 italic">GÖNDEREN TARAF</div>
      <img :src="getMainImage(session.offer.offeredItem)" class="w-24 h-24 rounded-2xl object-cover border border-gray-100 shadow-sm shrink-0">
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-black text-gray-900 leading-none mb-1 truncate">{{ session.offer.fromCompany.name }}</h4>
        <p class="text-[10px] text-gray-400 font-bold uppercase truncate italic opacity-80">{{ session.offer.offeredItem?.title }}</p>
        <div class="mt-3 flex items-center gap-2">
          <div :class="session.fromCompanyCollateral ? 'bg-green-500' : 'bg-gray-200'" class="w-1.5 h-1.5 rounded-full" />
          <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Teminat: {{ session.fromCompanyCollateral ? 'KİLİTLENDİ' : 'BEKLENİYOR' }}</span>
        </div>
      </div>
    </div>

    <!-- Swap Icon -->
    <div class="flex justify-center -my-3 relative z-10">
      <div class="bg-white p-2.5 rounded-full shadow-lg border border-gray-100 transform group-hover:rotate-180 transition-transform duration-700">
        <ArrowsRightLeftIcon class="h-4 w-4 text-indigo-600" />
      </div>
    </div>

    <!-- User B (To) -->
    <div class="bg-white rounded-3xl p-6 border border-gray-100 flex items-center gap-5 relative group overflow-hidden">
      <div class="absolute inset-y-0 left-0 w-1.5 bg-gray-100 group-hover:bg-indigo-500 transition-colors" />
      <div class="absolute -top-3 right-4 px-2 py-0.5 bg-gray-50 rounded-lg text-[8px] font-black text-gray-400 uppercase border border-gray-100 italic">ALICI TARAF</div>
      <img :src="getMainImage(session.offer.requestedItem)" class="w-24 h-24 rounded-2xl object-cover border border-gray-100 shadow-sm shrink-0">
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-black text-gray-900 leading-none mb-1 truncate">{{ session.offer.toCompany.name }}</h4>
        <p class="text-[10px] text-gray-400 font-bold uppercase truncate italic opacity-80">{{ session.offer.requestedItem?.title }}</p>
        <div class="mt-3 flex items-center gap-2">
          <div :class="session.toCompanyCollateral ? 'bg-green-500' : 'bg-gray-200'" class="w-1.5 h-1.5 rounded-full" />
          <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Teminat: {{ session.toCompanyCollateral ? 'KİLİTLENDİ' : 'BEKLENİYOR' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowsRightLeftIcon } from '@heroicons/vue/24/outline'

const props = defineProps({ session: Object })

const getMainImage = (item) => {
  if (!item?.media?.length) return '/images/no-product.png'
  const img = item.media.find(m => m.isMain) || item.media[0]
  return img.url.startsWith('http') ? img.url : `${useRuntimeConfig().public.apiBase}${img.url}`
}
</script>
