<template>
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
    <div>
      <button class="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center mb-3 hover:translate-x-1 transition-transform group" @click="$router.back()">
        <ChevronLeftIcon class="h-3 w-3 mr-1" /> GERİ DÖN
      </button>
      <h1 class="text-3xl font-black text-gray-900 uppercase italic tracking-tight leading-none mb-2">
        Takas Süreci <span class="text-indigo-600 underline decoration-indigo-200">Yönetimi</span>
      </h1>
      <div class="flex items-center gap-3">
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          İlan: {{ session.offer.requestedItem?.title }} <span class="mx-2 opacity-30">|</span> ID: #{{ session.id.slice(-6) }}
        </p>
        <ReviewStatusBadge :trade-offer-id="session.offerId" />
      </div>
    </div>

    <div class="flex items-center gap-4">
      <button class="p-3 bg-white hover:bg-gray-50 rounded-2xl border border-gray-100 shadow-sm transition-all group" @click="$emit('refresh')">
        <ArrowPathIcon class="h-5 w-5 text-gray-400 group-hover:text-indigo-600 group-hover:rotate-180 transition-all duration-500" :class="{ 'animate-spin': loading }" />
      </button>
      <NuxtLink :to="chatLink" class="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center gap-2">
        <ChatBubbleLeftEllipsisIcon class="w-4 h-4" /> CANLI SOHBET
      </NuxtLink>
      <span v-if="status" :class="status.class" class="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-lg shadow-indigo-100/10">
        {{ status.label }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ChevronLeftIcon, ArrowPathIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/vue/24/outline'
import ReviewStatusBadge from '~/components/trade/ReviewStatusBadge.vue'

const props = defineProps({
  session: Object,
  chatLink: String,
  status: Object,
  loading: Boolean
})
defineEmits(['refresh'])
</script>
