<template>
  <div class="space-y-12 italic">
    <div class="flex flex-wrap items-center gap-4 bg-white/5 p-2 rounded-[2rem] w-fit border border-white/5">
      <button v-for="t in tabs" :key="t.id" :class="activeTab === t.id ? t.activeClass : 'text-indigo-200/40 hover:text-white'" class="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300" @click="$emit('update:activeTab', t.id)">{{ t.label }}</button>
    </div>

    <div v-if="loading" class="py-32 flex flex-col items-center justify-center space-y-8">
      <div class="w-16 h-16 border-[6px] border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin shadow-2xl shadow-indigo-500/20" />
      <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">İŞLEMLER ANALİZ EDİLİYOR...</p>
    </div>

    <div v-else-if="transactions.length === 0" class="py-32 text-center bg-white/5 rounded-[4rem] border border-dashed border-white/10 italic">
       <div class="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl"><InboxIcon class="h-10 w-10 text-indigo-300/20" /></div>
       <p class="text-[10px] font-black text-indigo-200/40 uppercase tracking-widest">KAYIT BULUNAMADI.</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-6">
      <div v-for="tx in transactions" :key="tx.id" class="group bg-white/5 hover:bg-white/10 backdrop-blur-3xl border border-white/5 hover:border-white/10 p-8 rounded-[2.5rem] transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div class="flex items-center gap-8 relative z-10">
          <div :class="isPositive(tx) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'" class="w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl border border-white/5">
            <component :is="isPositive(tx) ? ArrowDownLeftIcon : ArrowUpRightIcon" class="h-7 w-7" />
          </div>
          <div class="space-y-1.5">
            <p class="text-lg font-black uppercase tracking-tight text-white leading-none mb-1 group-hover:text-indigo-400 transition-colors">{{ tx.description }}</p>
            <div class="flex items-center gap-3">
              <p class="text-[9px] font-black text-indigo-200/40 uppercase tracking-widest italic">{{ formatDate(tx.createdAt) }}</p>
              <div v-if="tx.type === 'TRANSFER'" class="flex items-center gap-2">
                <span class="text-indigo-200/10 text-xl font-black">/</span>
                <p class="text-[9px] font-black text-indigo-400 uppercase tracking-widest italic">{{ tx.amount > 0 ? `GÖNDEREN: ${tx.fromUser || 'SİSTEM'}` : `ALICI: ${tx.toUser || 'SİSTEM'}` }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between md:justify-end gap-12 relative z-10">
          <div class="text-right space-y-1">
            <div class="flex items-baseline justify-end gap-3">
              <span :class="isPositive(tx) ? 'text-emerald-400' : 'text-rose-400'" class="text-3xl font-black italic tracking-tightest">{{ isPositive(tx) ? '+' : '-' }}{{ formatNumber(tx.amount) }}</span>
              <span class="text-[9px] font-black text-indigo-200/30 uppercase tracking-[0.2em] italic">{{ getUnit(tx) }}</span>
            </div>
            <p v-if="tx.balanceAfter !== undefined" class="text-[9px] font-black text-white/40 uppercase tracking-widest italic leading-none">BAKİYE ANALİZİ: <span class="text-white">{{ formatNumber(tx.balanceAfter) }}</span></p>
          </div>
          <div class="bg-indigo-500/10 px-6 py-2.5 rounded-xl border border-indigo-500/20 hidden sm:block">
            <span class="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] italic">TAMAMLANDI</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { InboxIcon, ArrowUpRightIcon, ArrowDownLeftIcon } from '@heroicons/vue/24/outline'

defineProps({ transactions: Array, loading: Boolean, activeTab: String })
defineEmits(['update:activeTab'])

const tabs = [
  { id: 'financial', label: 'FİNANSAL İŞLEMLER', activeClass: 'bg-indigo-600 text-white shadow-2xl shadow-indigo-500/20' },
  { id: 'trade', label: 'TİCARET HACMİ', activeClass: 'bg-indigo-600 text-white shadow-2xl shadow-indigo-500/20' },
  { id: 'xp', label: 'PUAN / XP GEÇMİŞİ', activeClass: 'bg-purple-600 text-white shadow-2xl shadow-purple-500/20' }
]

const formatNumber = (n) => new Intl.NumberFormat('tr-TR').format(n || 0)
const formatDate = (d) => new Date(d).toLocaleString('tr-TR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })
const isPositive = (tx) => tx.type === 'CREDIT' || tx.type === 'XP_EARNED' || tx.type.includes('BONUS') || (tx.type === 'TRANSFER' && (tx.description || '').toLowerCase().includes('gelen'))
const getUnit = (tx) => {
  if (tx.currency?.includes('XP')) return tx.currency.split('_')[1] + ' XP'
  return tx.description.includes('Nakit') ? 'TL' : 'PUAN'
}
</script>
