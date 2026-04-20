<template>
  <div class="bg-blue-600/5 p-10 rounded-[3rem] border border-blue-500/20 font-sans italic space-y-8 backdrop-blur-xl relative overflow-hidden group">
    <div class="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
    
    <div class="relative z-10 flex items-center gap-4">
      <div class="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-xl shadow-blue-900/20">ℹ</div>
      <div>
        <h4 class="text-sm font-black text-slate-100 uppercase tracking-widest leading-none">İŞLEM TALİMATLARI</h4>
        <p class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-2">ÖDEMENİN TAMAMLANMASI İÇİN GEREKLİ BİLGİLER</p>
      </div>
    </div>

    <div v-if="method === 'BANK_TRANSFER' || method === 'EFT'" class="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
      <div class="space-y-2">
        <label class="text-[9px] font-black text-slate-600 uppercase tracking-widest block ml-1">BANKA / ALICI</label>
        <div class="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2">
          <div class="text-[11px] font-black text-slate-200 uppercase tracking-tightest">TÜRKİYE İŞ BANKASI</div>
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">E-COMMERCE PLATFORM LTD.</div>
        </div>
      </div>
      <div class="space-y-2">
        <label class="text-[9px] font-black text-slate-600 uppercase tracking-widest block ml-1">IBAN ADRESİ</label>
        <div class="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-center justify-between group/iban">
          <span class="text-xs font-mono font-black text-blue-400 tracking-widest truncate">TR98 0006 4... 6789 01</span>
          <button class="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-[8px] font-black text-slate-400 hover:text-white rounded-lg transition-all border border-slate-800">KOPYALA</button>
        </div>
      </div>
      <div class="md:col-span-2 p-6 bg-slate-950/50 rounded-2xl border border-slate-800/50">
        <label class="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-4">TRANSFER AÇIKLAMASI (ZORUNLU)</label>
        <div class="flex items-center justify-between gap-6">
          <div class="text-lg font-black text-slate-100 uppercase tracking-tightest leading-none">
            {{ userEmail || 'MÜŞTERİ' }} - BAKİYE YÜKLEME
          </div>
          <span class="px-4 py-2 bg-blue-600/10 text-blue-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-500/20 transition-all">REFERANS #{{ Date.now().toString().slice(-4) }}</span>
        </div>
      </div>
    </div>

    <div v-else-if="method === 'CREDIT_CARD'" class="relative z-10 space-y-6">
      <div class="p-8 bg-slate-950 rounded-[2.5rem] border border-slate-800 space-y-4">
        <div class="flex items-center gap-4 text-amber-500">
          <span class="text-2xl">🛡️</span>
          <h4 class="text-xs font-black uppercase tracking-widest">PROVİZYON GÜVENLİĞİ</h4>
        </div>
        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
          Kredi kartı ve banka kartı ödemelerinde BDDK standartlarına göre <span class="text-amber-500 font-black underline decoration-amber-500/30">%2.69</span> işlem ücreti banka tarafından kesilmektedir.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  method: string
  userEmail?: string
}>()
</script>

<style scoped>
.tracking-tightest { letter-spacing: -0.06em; }
</style>
