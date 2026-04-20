<template>
  <div class="bg-white rounded-[3.5rem] shadow-2xl shadow-black/[0.02] p-10 lg:p-12 border border-neutral-100 italic">
    <div class="flex items-center justify-between mb-12">
      <h3 class="text-2xl font-black text-gray-900 uppercase tracking-tightest italic leading-none">TEKLİF GEÇMİŞİ</h3>
      <div class="px-5 py-2 bg-neutral-50 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border border-neutral-100 shadow-inner">{{ bids.length }} TEKLİF</div>
    </div>

    <div class="space-y-6 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
      <div v-for="(bid, index) in bids" :key="bid.id" class="flex items-center justify-between p-6 rounded-[2rem] transition-all border group relative" :class="index === 0 ? 'bg-indigo-600 border-indigo-200 shadow-2xl shadow-indigo-100 scale-[1.02]' : 'bg-neutral-50 border-transparent hover:bg-white hover:border-neutral-100'">
        <div class="flex items-center gap-6">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shadow-inner" :class="index === 0 ? 'bg-white text-indigo-600' : 'bg-neutral-200 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-400'">
            #{{ bids.length - index }}
          </div>
          <div>
            <span class="block text-sm font-black uppercase tracking-tight" :class="index === 0 ? 'text-white' : 'text-gray-900'">{{ maskEmail(bid.User?.email) }}</span>
            <span class="text-[9px] font-black uppercase tracking-widest mt-1 opacity-60" :class="index === 0 ? 'text-indigo-100' : 'text-gray-400'">{{ formatDate(bid.createdAt) }}</span>
          </div>
        </div>
        <div class="text-right">
          <span class="block text-xl font-black tracking-tighter" :class="index === 0 ? 'text-white' : 'text-gray-900'">{{ formatPrice(bid.amount) }}</span>
          <span v-if="bid.userId === authStore.user?.id" class="text-[8px] font-black uppercase tracking-widest leading-none mt-1" :class="index === 0 ? 'text-indigo-200' : 'text-indigo-500/60'">TEKLİFİN</span>
        </div>
      </div>

      <div v-if="bids.length === 0" class="text-center py-20 italic">
        <div class="w-20 h-20 bg-neutral-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-gray-200 shadow-inner">
          <ChatBubbleBottomCenterTextIcon class="w-10 h-10" />
        </div>
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">HENÜZ TEKLİF VERİLMEDİ.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ChatBubbleBottomCenterTextIcon } from '@heroicons/vue/24/outline'

defineProps({ bids: Array })
const authStore = useAuthStore()

const formatPrice = (p) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(p || 0)
const maskEmail = (e) => e ? `${e.split('@')[0].slice(0,3)}***@${e.split('@')[1]}` : '---'
const formatDate = (d) => new Date(d).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
</style>
