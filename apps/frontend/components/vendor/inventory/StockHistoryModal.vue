<template>
  <div v-if="isOpen" class="fixed inset-0 z-[200] flex items-center justify-center p-6 italic">
    <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" @click="$emit('close')" />
    
    <div class="relative w-full max-w-2xl bg-white rounded-[4rem] shadow-3xl flex flex-col overflow-hidden animate-in border border-neutral-100 max-h-[85vh]">
      <div class="p-10 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <h3 class="text-2xl font-black text-gray-900 uppercase tracking-tightest italic leading-none">STOK GEÇMİŞİ</h3>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{{ product?.name }} // DENETİM KAYITLARI</p>
        </div>
        <button class="w-12 h-12 bg-neutral-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all shadow-inner flex items-center justify-center text-2xl font-black" @click="$emit('close')">&times;</button>
      </div>

      <div class="flex-1 overflow-y-auto p-10 space-y-4 custom-scrollbar">
        <div v-if="loading" class="p-20 flex flex-col items-center justify-center">
          <div class="animate-spin h-12 w-12 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full mb-4" />
          <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest">KAYITLAR OKUNUYOR...</p>
        </div>

        <div v-else-if="history.length === 0" class="p-20 text-center italic">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">BU ÜRÜNE AİT HAREKET KAYDI BULUNAMADI.</p>
        </div>

        <div v-else v-for="log in history" :key="log.id" class="flex items-center justify-between p-6 bg-neutral-50 rounded-[2rem] border border-transparent hover:bg-white hover:border-neutral-100 transition-all shadow-inner hover:shadow-xl group">
          <div class="flex items-center gap-6">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm bg-white" :class="log.change > 0 ? 'text-green-600' : 'text-red-600'">
              {{ log.change > 0 ? '+' : '' }}{{ log.change }}
            </div>
            <div>
              <div class="text-sm font-black text-gray-900 uppercase tracking-tight">{{ formatReason(log.reason) }}</div>
              <div class="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 opacity-60 italic">{{ formatDate(log.createdAt) }}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1 italic">REFERANS NO</div>
            <div class="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">{{ log.referenceId || '---' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ isOpen: Boolean, product: Object, history: Array, loading: Boolean })
defineEmits(['close'])

const formatDate = (date) => new Date(date).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const formatReason = (r) => {
  const reasons = {
    'INITIAL_STOCK': 'BAŞLANGIÇ STOĞU',
    'MANUAL_ADJUSTMENT': 'MANUEL DÜZELTME',
    'PURCHASE_ORDER': 'SATINALMA ALIMI',
    'PARTIALLY_RECEIVED': 'KISMİ KABUL',
    'SALE': 'SATIŞ İŞLEMİ',
    'DAMAGE': 'HASAR / FİRE',
    'RETURN': 'MÜŞTERİ İADESİ',
    'OTHER_SALE': 'DİĞER PLATFORM SATIŞI',
    'LOST': 'KAYIP / FİRE',
    'FOUND': 'BULUNAN STOK',
    'BULK_IMPORT': 'TOPLU YÜKLEME',
    'BULK_IMPORT_UPDATE': 'TOPLU GÜNCELLEME'
  }
  return reasons[r] || r
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
</style>
