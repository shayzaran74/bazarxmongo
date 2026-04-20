<template>
  <div class="group bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden ring-1 ring-black/[0.02]">
    <div class="absolute right-0 top-0 w-32 h-32 bg-gray-50 -rotate-12 translate-x-12 -translate-y-12 rounded-[3rem] group-hover:bg-primary-50 transition-colors" />

    <div class="relative flex flex-col lg:flex-row lg:items-center gap-8">
      <!-- Trade Flow Visual -->
      <div class="flex items-center space-x-4 lg:w-1/3">
        <div class="flex flex-col items-center">
          <div class="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 mb-2">
            <img v-if="offer.offeredItem?.images?.[0]" :src="getMainImage(offer.offeredItem)" class="w-full h-full object-cover rounded-xl">
            <ArchiveBoxIcon v-else class="h-6 w-6 text-gray-300" />
          </div>
          <p class="text-[9px] font-black text-gray-400 uppercase tracking-tighter truncate max-w-[80px]">
            {{ offer.offeredItem?.title || 'NAKİT' }}
          </p>
        </div>

        <div class="flex flex-col items-center flex-1">
          <ArrowsRightLeftIcon class="h-6 w-6 text-primary-500 mb-2 animate-pulse" />
          <div class="h-0.5 w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        </div>

        <div class="flex flex-col items-center">
          <div class="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 mb-2">
            <img v-if="offer.requestedItem?.images?.[0]" :src="getMainImage(offer.requestedItem)" class="w-full h-full object-cover rounded-xl">
            <ArchiveBoxIcon v-else class="h-6 w-6 text-gray-300" />
          </div>
          <p class="text-[9px] font-black text-gray-400 uppercase tracking-tighter truncate max-w-[80px]">
            {{ offer.requestedItem?.title }}
          </p>
        </div>
      </div>

      <!-- Offer Details -->
      <div class="flex-1">
        <div class="flex items-center space-x-3 mb-3">
          <span class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border" :class="getStatusClass(offer.status)">
            {{ getStatusText(offer.status) }}
          </span>
          <ReviewStatusBadge v-if="offer.status === 'COMPLETED' || offer.status === 'ACCEPTED'" :trade-offer-id="offer.id" />
          <span class="text-xs font-bold text-gray-400 italic">{{ formatDate(offer.createdAt) }}</span>
        </div>

        <h4 class="text-xl font-black text-gray-900 mb-2 uppercase italic tracking-tight">
          {{ activeTab === 'received' ? offer.fromCompany?.name : offer.toCompany?.name }}
        </h4>

        <p class="text-sm font-medium text-gray-500 mb-4 line-clamp-1 italic">
          "{{ offer.message || 'Mesaj bırakılmadı.' }}"
        </p>

        <div class="flex flex-wrap gap-4">
          <div class="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-xl">
            <span class="text-[10px] font-black text-gray-400">NAKİT FARK:</span>
            <span class="text-xs font-black" :class="offer.cashDifference > 0 ? 'text-red-500' : 'text-green-500'">
              {{ (offer.cashDifference || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-2 lg:flex-col lg:w-48">
        <template v-if="activeTab === 'received' && ['PENDING', 'WAITING_APPROVAL'].includes(offer.status.toUpperCase())">
          <button
            :disabled="updatingStatus === offer.id"
            class="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95"
            @click.stop="$emit('update-status', { id: offer.id, status: 'ACCEPTED' })"
          >
            {{ updatingStatus === offer.id ? '...' : 'KABUL ET' }}
          </button>
          <button
            class="bg-white border border-primary-200 text-primary-600 hover:bg-primary-50 rounded-2xl py-3 text-center text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
            @click.stop="$emit('counter', offer)"
          >
            KARŞI TEKLİF
          </button>
          <button
            :disabled="updatingStatus === offer.id"
            class="bg-white border border-gray-200 text-red-500 hover:bg-red-50 rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
            @click.stop="$emit('update-status', { id: offer.id, status: 'REJECTED' })"
          >
            REDDET
          </button>
        </template>
        
        <button
          class="bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all font-black"
          @click="$emit('view', offer)"
        >
          İNCELE
        </button>

        <template v-if="['ACCEPTED', 'COMPLETED'].includes(offer.status.toUpperCase())">
          <NuxtLink
            :to="`/my/surplus/swap/${offer.id}`"
            class="text-center bg-amber-50 text-amber-700 border border-amber-100 rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all font-black"
          >
            TAKASI YÖNET
          </NuxtLink>
          <button
            v-if="offer.status.toUpperCase() === 'COMPLETED'"
            :class="[hasReviewed ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-900 text-white hover:bg-black']"
            class="rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
            @click="!hasReviewed && $emit('review', offer)"
          >
            <component :is="hasReviewed ? CheckIcon : StarIcon" class="h-3 w-3" :class="hasReviewed ? 'text-green-500' : 'text-amber-400'" />
            {{ hasReviewed ? 'DEĞERLENDİRİLDİ' : 'DEĞERLENDİR' }}
          </button>
        </template>
        <NuxtLink
          v-else
          :to="'/surplus/' + (offer.requestedItemId || offer.offeredItemId)"
          class="bg-gray-50 border border-gray-100 text-[10px] font-black text-gray-400 hover:text-primary-600 rounded-2xl py-3 text-center uppercase tracking-widest transition-colors italic"
        >
          İLAN GÖR
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  ArchiveBoxIcon, 
  ArrowsRightLeftIcon, 
  StarIcon, 
  CheckIcon 
} from '@heroicons/vue/24/outline'
import ReviewStatusBadge from '~/components/trade/ReviewStatusBadge.vue'

defineProps({
  offer: Object,
  activeTab: String,
  updatingStatus: [String, Number],
  hasReviewed: Boolean
})

defineEmits(['view', 'counter', 'update-status', 'review'])

const getMainImage = (item) => {
  if (item?.images && item.images.length > 0) {
    const img = item.images[0]
    return typeof img === 'string' ? img : img.url
  }
  return '/placeholder-surplus.jpg'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const getStatusText = (status) => {
  const labels = {
    'PENDING': 'BEKLEMEDE',
    'WAITING_APPROVAL': 'ONAY BEKLİYOR',
    'ACCEPTED': 'KABUL EDİLDİ',
    'REJECTED': 'REDDEDİLDİ',
    'COMPLETED': 'TAMAMLANDI',
    'CANCELLED': 'İPTAL EDİLDİ',
    'COUNTER_OFFERED': 'KARŞI TEKLİF VERİLDİ'
  }
  return labels[status.toUpperCase()] || status
}

const getStatusClass = (status) => {
  const s = status.toUpperCase()
  switch (s) {
    case 'PENDING':
    case 'WAITING_APPROVAL': return 'bg-yellow-100 text-yellow-800'
    case 'ACCEPTED':
    case 'COMPLETED': return 'bg-green-100 text-green-800'
    case 'REJECTED':
    case 'CANCELLED': return 'bg-red-100 text-red-800'
    case 'COUNTER_OFFERED': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}
</script>
