<template>
  <div class="group relative bg-white rounded-[3rem] overflow-hidden border border-neutral-100 shadow-sm hover:shadow-[0_40px_100px_rgba(0,0,0,0.06)] transition-all duration-700 flex flex-col italic">
    <!-- Status Accent -->
    <div class="h-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

    <div class="p-10 flex-1 space-y-8">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-5">
          <div class="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center border border-black/5 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <span class="text-2xl">📂</span>
          </div>
          <div>
            <span class="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl border border-indigo-100">{{ item.category?.name || 'GENEL' }}</span>
            <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2 ml-1 italic opacity-60">{{ formatDate(item.createdAt) }}</p>
          </div>
        </div>
      </div>

      <h3 class="text-2xl font-black text-gray-900 leading-[1.1] min-h-[3.5rem] uppercase tracking-tighter group-hover:text-indigo-600 transition-colors">{{ item.description || 'DETAYLI AÇIKLAMA GİRİLMEMİŞ' }}</h3>

      <div class="bg-neutral-50 p-6 rounded-[2rem] border border-neutral-100 shadow-inner group-hover:bg-white transition-all">
        <p class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 italic">BÜTÇE ARALIĞI</p>
        <div class="flex items-center gap-3">
          <CurrencyDollarIcon class="h-6 w-6 text-indigo-500" />
          <span v-if="item.minPrice || item.maxPrice" class="text-xl font-black text-gray-900 tracking-tightest">{{ formatPrice(item.minPrice) }} — {{ formatPrice(item.maxPrice) }}</span>
          <span v-else class="text-gray-400 font-black text-sm italic uppercase">BELİRTİLMEDİ</span>
        </div>
      </div>

      <div v-if="item.keywords && item.keywords.length > 0" class="flex flex-wrap gap-2.5">
        <span v-for="(keyword, idx) in item.keywords.slice(0, 5)" :key="idx" class="px-4 py-2 bg-white text-gray-600 text-[9px] font-black uppercase tracking-widest rounded-xl border border-neutral-200 group-hover:border-indigo-100 group-hover:text-indigo-600 transition-all shadow-sm">#{{ keyword }}</span>
        <span v-if="item.keywords.length > 5" class="px-4 py-2 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg">+{{ item.keywords.length - 5 }}</span>
      </div>
    </div>

    <!-- Status Footer -->
    <div class="p-10 border-t border-neutral-50 bg-neutral-50/30 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="relative flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
        </span>
        <span class="text-[10px] font-black text-emerald-600 uppercase tracking-widest pt-0.5">{{ getStatusText(item.status) }}</span>
      </div>
      <button v-if="canEdit" class="text-[9px] font-black text-gray-400 hover:text-indigo-600 uppercase tracking-widest transition-all" @click="$emit('edit', item)">DÜZENLE →</button>
    </div>
  </div>
</template>

<script setup>
import { CurrencyDollarIcon } from '@heroicons/vue/24/outline'

defineProps({ item: Object, canEdit: Boolean })
defineEmits(['edit'])

const formatPrice = (p) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(p || 0)
const formatDate = (d) => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
const getStatusText = (s) => ({
  APPROVED: 'ONAYLANDI',
  REJECTED: 'REDDEDİLDİ',
  PENDING: 'ONAY BEKLİYOR'
}[s] || 'AKTİF')
</script>
