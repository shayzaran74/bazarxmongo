<template>
  <div class="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col font-sans italic">
    <div class="overflow-x-auto custom-scrollbar">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-950/50 border-b border-slate-800">
            <th class="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">ZAMAN / TARİH</th>
            <th class="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">OPERATÖR</th>
            <th class="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">PROTOKOL</th>
            <th class="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">HEDEF ID</th>
            <th class="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">DİJİTAL İZ / IP</th>
            <th class="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">AKSİYON</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/50">
          <!-- Loading State -->
          <template v-if="loading">
            <tr v-for="i in 5" :key="i" class="animate-pulse">
              <td v-for="j in 6" :key="j" class="px-8 py-6">
                <div class="h-4 bg-slate-800/50 rounded-lg w-full" />
              </td>
            </tr>
          </template>

          <!-- Empty State -->
          <tr v-else-if="logs.length === 0">
            <td colspan="6" class="px-8 py-20 text-center">
              <div class="space-y-4 opacity-30">
                 <div class="text-4xl">📡</div>
                 <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">SİSTEM KAYIDI BULUNAMADI.</p>
              </div>
            </td>
          </tr>

          <!-- Data -->
          <tr
            v-for="log in logs"
            :key="log.id"
            class="hover:bg-slate-800/30 transition-all group"
          >
            <td class="px-8 py-6">
              <div class="text-[11px] font-black text-slate-200 uppercase tracking-tight">
                {{ formatDate(log.createdAt) }}
              </div>
              <div class="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">
                {{ formatTime(log.createdAt) }}
              </div>
            </td>
            <td class="px-8 py-6">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 shadow-lg flex items-center justify-center text-blue-500 text-sm font-black">
                  {{ log.admin?.name?.charAt(0) || 'A' }}
                </div>
                <div>
                  <div class="text-[11px] font-black text-slate-200 uppercase tracking-tight leading-none">
                    {{ log.admin?.name || 'ANONYMOUS' }}
                  </div>
                  <div class="text-[9px] text-slate-600 font-bold tracking-widest mt-1">
                    {{ log.admin?.email }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-8 py-6">
              <span
                :class="getActionBadgeClass(log.action)"
                class="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border"
              >
                {{ log.action }}
              </span>
            </td>
            <td class="px-8 py-6">
              <div class="text-[10px] font-mono text-slate-500 tracking-widest truncate max-w-[120px]" :title="log.targetId || log.targetUserId">
                {{ log.targetId || log.targetUserId || '—' }}
              </div>
            </td>
            <td class="px-8 py-6">
              <div class="text-[10px] font-black text-slate-400 tracking-tight">
                {{ log.ip }}
              </div>
              <div class="text-[9px] text-slate-600 font-bold truncate max-w-[180px] uppercase tracking-widest mt-1" :title="log.reason || log.userAgent">
                {{ log.reason || log.userAgent || '—' }}
              </div>
            </td>
            <td class="px-8 py-6 text-right">
              <button
                class="px-6 py-2 bg-slate-950 border border-slate-800 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-white hover:border-blue-500 transition-all active:scale-90"
                @click="$emit('view', log)"
              >
                DETAYLAR
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      v-if="pagination.pages > 1"
      class="p-8 border-t border-slate-800/50 bg-slate-950 flex flex-col md:flex-row items-center justify-between gap-6"
    >
      <div class="text-[9px] font-black text-slate-600 uppercase tracking-widest">
        DÖKÜM {{ (pagination.page - 1) * pagination.limit + 1 }} — {{ Math.min(pagination.page * pagination.limit, pagination.total) }} / TOPLAM {{ pagination.total }} KAYIT
      </div>
      <div class="flex items-center gap-3">
        <button
          :disabled="pagination.page === 1"
          class="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 disabled:opacity-20 transition-all"
          @click="$emit('paginate', pagination.page - 1)"
        >
          ←
        </button>
        <div class="px-8 py-3 bg-blue-600 rounded-xl text-white text-[10px] font-black tracking-widest shadow-xl shadow-blue-900/20">
          {{ pagination.page }} / {{ pagination.pages }}
        </div>
        <button
          :disabled="pagination.page === pagination.pages"
          class="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 disabled:opacity-20 transition-all"
          @click="$emit('paginate', pagination.page + 1)"
        >
          →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  logs: any[]
  loading: boolean
  pagination: any
  formatDate: (d: string) => string
  formatTime: (d: string) => string
  getActionBadgeClass: (a: string) => string
}>()

defineEmits(['view', 'paginate'])
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { height: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
</style>
