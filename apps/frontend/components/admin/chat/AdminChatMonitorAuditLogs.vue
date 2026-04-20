<template>
  <div class="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-full font-sans italic">
    <div class="p-10 border-b border-slate-800 bg-slate-800/10">
      <h3 class="text-2xl font-black text-slate-100 uppercase tracking-tightest">DENETİM LOGLARI</h3>
      <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">GHOST MODE OPERASYONEL KAYIT DEFTERİ</p>
    </div>

    <div class="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
      <table class="w-full text-left border-collapse">
        <thead class="bg-slate-950 sticky top-0 z-10 border-b border-slate-800">
          <tr class="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
            <th class="px-8 py-6">TARİH / ZAMAN</th>
            <th class="px-8 py-6">YÖNETİCİ</th>
            <th class="px-8 py-6">AKSİYON</th>
            <th class="px-8 py-6">HEDEF ODA</th>
            <th class="px-8 py-6">SEBEP / NOT</th>
            <th class="px-8 py-6">IP ADRESİ</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/50">
          <tr v-if="loading" class="animate-pulse">
            <td colspan="6" class="px-8 py-20 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest">VERİ AKIŞI BEKLENİYOR...</td>
          </tr>
          <tr v-else-if="logs.length === 0">
            <td colspan="6" class="px-8 py-20 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest">SİSTEMDE KAYIT BULUNAMADI.</td>
          </tr>
          <tr
            v-for="log in logs"
            :key="log.id"
            class="hover:bg-slate-800/30 transition-all group"
          >
            <td class="px-8 py-6 whitespace-nowrap">
              <div class="text-[11px] text-slate-200 font-black uppercase tracking-tight">
                {{ new Date(log.createdAt).toLocaleDateString('tr-TR') }}
              </div>
              <div class="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-50">
                {{ new Date(log.createdAt).toLocaleTimeString('tr-TR') }}
              </div>
            </td>
            <td class="px-8 py-6 whitespace-nowrap">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 text-sm font-black">
                  {{ log.admin.name ? log.admin.name.charAt(0).toUpperCase() : 'A' }}
                </div>
                <div>
                  <div class="text-[11px] font-black text-slate-200 uppercase tracking-tight">
                    {{ log.admin.name || 'ANONYMOUS ADMIN' }}
                  </div>
                  <div class="text-[9px] text-slate-600 font-bold tracking-widest">
                    @{{ log.admin.username }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-8 py-6">
              <span
                class="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg border"
                :class="{
                  'bg-blue-600/10 text-blue-400 border-blue-500/20': log.action === 'JOIN_GHOST_MODE',
                  'bg-amber-600/10 text-amber-400 border-amber-500/20': log.action === 'SEND_WARNING',
                  'bg-red-600/20 text-red-500 border-red-500/30': log.action === 'FREEZE_CHAT',
                  'bg-slate-800 text-slate-400 border-slate-700': log.action === 'SEND_SYSTEM_MESSAGE'
                }"
              >
                {{ log.action }}
              </span>
            </td>
            <td class="px-8 py-6 font-mono text-[9px] text-slate-500 tracking-widest">
              {{ log.targetId || 'GLOBAL' }}
            </td>
            <td class="px-8 py-6">
              <div class="text-[11px] font-black text-slate-400 max-w-xs truncate uppercase tracking-tight" :title="log.reason">
                {{ log.reason || 'NOT EKLENMEDİ' }}
              </div>
            </td>
            <td class="px-8 py-6 whitespace-nowrap text-[9px] text-slate-600 font-black tracking-widest">
              {{ log.ip }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Audit Pagination -->
    <div
      v-if="pagination.totalPages > 1"
      class="p-8 border-t border-slate-800/50 bg-slate-950 flex items-center justify-between"
    >
      <button
        :disabled="pagination.page <= 1"
        class="px-6 py-3 text-[10px] bg-slate-900 border border-slate-800 rounded-xl font-black uppercase tracking-widest text-slate-500 hover:text-slate-200 disabled:opacity-20 transition-all shadow-xl"
        @click="$emit('paginate', pagination.page - 1)"
      >
        ← Önceki Sayfa
      </button>
      <div class="flex items-center gap-6">
        <span class="text-[10px] font-black text-slate-200">{{ pagination.page }}</span>
        <span class="text-[10px] text-slate-700 font-black">/</span>
        <span class="text-[10px] text-slate-500 font-black">{{ pagination.totalPages }}</span>
      </div>
      <button
        :disabled="pagination.page >= pagination.totalPages"
        class="px-6 py-3 text-[10px] bg-slate-900 border border-slate-800 rounded-xl font-black uppercase tracking-widest text-slate-500 hover:text-slate-200 disabled:opacity-20 transition-all shadow-xl"
        @click="$emit('paginate', pagination.page + 1)"
      >
        Sonraki Sayfa →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  logs: any[]
  loading: boolean
  pagination: any
}>()

defineEmits(['paginate'])
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
</style>
