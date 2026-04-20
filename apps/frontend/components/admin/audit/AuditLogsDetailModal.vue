<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-12 font-sans italic"
  >
    <div
      class="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
      @click="$emit('close')"
    />
    <div
      class="relative bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[3.5rem] border border-slate-800 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col"
    >
      <!-- Header -->
      <div class="p-10 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
        <div>
          <h3 class="text-3xl font-black text-slate-100 uppercase tracking-tightest leading-none">
            DATA FORENSICS <span class="text-blue-500">// LOG #{{ selectedLog.id?.toString().slice(-4).toUpperCase() }}</span>
          </h3>
          <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 opacity-60">SİSTEM KAYIT ANALİZİ VE VERİ KARŞILAŞTIRMA</p>
        </div>
        <button
          class="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-800 text-slate-500 hover:text-white hover:bg-slate-700 transition-all text-3xl font-light border border-slate-700"
          @click="$emit('close')"
        >
          &times;
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
        <!-- Action & Metadata -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div class="space-y-4">
             <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">İCRA EDİLEN PROTOKOL</label>
             <div class="flex">
               <span
                  :class="getActionBadgeClass(selectedLog.action)"
                  class="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border"
                >
                  {{ selectedLog.action }}
                </span>
             </div>
          </div>
          <div class="space-y-4">
             <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">MÜHÜRLENME ZAMANI</label>
             <div class="text-lg font-black text-slate-200 tracking-tightest uppercase">
                {{ formatDate(selectedLog.createdAt) }} <span class="opacity-30 mx-2">—</span> {{ formatTime(selectedLog.createdAt) }}
             </div>
          </div>
        </div>

        <!-- Data Comparison -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <!-- After Value (Target) -->
           <div class="space-y-4">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                HEDEF VERİ (AFTER)
              </label>
              <div class="bg-slate-950 rounded-[2.5rem] p-8 border border-slate-800 shadow-inner group">
                <pre class="text-[11px] font-mono text-blue-400 overflow-x-auto whitespace-pre-wrap leading-relaxed custom-scrollbar max-h-[300px]">{{ selectedLog.afterValue || 'VERİ BULUNAMADI' }}</pre>
              </div>
           </div>

           <!-- Before Value -->
           <div class="space-y-4">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                ÖNCEKİ DURUM (BEFORE)
              </label>
              <div class="bg-slate-950 rounded-[2.5rem] p-8 border border-slate-800 shadow-inner group">
                <pre class="text-[11px] font-mono text-red-400 overflow-x-auto whitespace-pre-wrap leading-relaxed custom-scrollbar max-h-[300px]">{{ selectedLog.beforeValue || 'HİKAYE KAYDI YOK' }}</pre>
              </div>
           </div>
        </div>

        <!-- Secondary Info -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div class="bg-slate-950/50 p-8 rounded-[2rem] border border-slate-800/50 space-y-2">
              <label class="text-[9px] font-black text-slate-600 uppercase tracking-widest">BİRİM / MİKTAR</label>
              <div class="text-2xl font-black text-slate-200 tracking-tighter">{{ selectedLog.amount || 'N/A' }}</div>
           </div>
           <div class="bg-slate-950/50 p-8 rounded-[2rem] border border-slate-800/50 space-y-2">
              <label class="text-[9px] font-black text-slate-600 uppercase tracking-widest">YÖNETİCİ IP</label>
              <div class="text-lg font-black text-slate-200 tracking-tightest">{{ selectedLog.ip }}</div>
           </div>
           <div class="bg-slate-950/50 p-8 rounded-[2rem] border border-slate-800/50 space-y-2">
              <label class="text-[9px] font-black text-slate-600 uppercase tracking-widest">SİNYAL KAYNAĞI</label>
              <div class="text-[10px] font-bold text-slate-500 truncate uppercase tracking-tightest" :title="selectedLog.userAgent">{{ selectedLog.userAgent || 'UNKNOWN DEVICE' }}</div>
           </div>
        </div>

        <!-- Reason -->
        <div v-if="selectedLog.reason" class="space-y-4">
           <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">DENETÇİ NOTU / SEBEP</label>
           <div class="bg-slate-800/30 p-8 rounded-[2rem] border border-slate-800 text-sm font-black text-slate-400 leading-relaxed uppercase tracking-tight">
              {{ selectedLog.reason }}
           </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="p-10 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md flex justify-end sticky bottom-0 z-20">
        <button
          class="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-blue-900/20 transition-all hover:scale-105 active:scale-95"
          @click="$emit('close')"
        >
          ANALİZİ TAMAMLA
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
  selectedLog: any
  formatDate: (d: string) => string
  formatTime: (d: string) => string
  getActionBadgeClass: (a: string) => string
}>()

defineEmits(['close'])
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
.tracking-tightest { letter-spacing: -0.06em; }
</style>
