<template>
  <div class="min-h-screen bg-slate-950 p-8 font-sans italic">
    <div class="max-w-[1600px] mx-auto space-y-12">
      <!-- ── HEADER PROTOCOL ── -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-slate-900/40 p-10 rounded-[3rem] border border-slate-800 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
        <div class="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        <div class="relative z-10 space-y-2">
          <h1 class="text-4xl md:text-6xl font-black text-slate-100 uppercase tracking-tightest leading-none">
            WATCHTOWER <span class="text-indigo-500">AUDIT TRAIL</span>
          </h1>
          <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1">SİSTEM ÜZERİNDEKİ TÜM YÖNETİCİ AKSİYONLARININ ADLİ DÖKÜMÜ</p>
        </div>

        <div class="flex items-center gap-6 relative z-10">
          <button
            :disabled="loading"
            class="px-8 py-5 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white hover:border-slate-600 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-40"
            @click="fetchLogs"
          >
            <span :class="{ 'animate-spin': loading }">🔄</span> SİNYALİ YENİLE
          </button>
        </div>
      </div>

      <!-- ── FILTRATION ENGINE ── -->
      <AuditLogsFilters
        v-model="filters"
        :action-types="actionTypes"
        @search="fetchLogs"
      />

      <!-- ── DATA GRID ── -->
      <AuditLogsTable
        :logs="logs"
        :loading="loading"
        :pagination="pagination"
        :format-date="formatDate"
        :format-time="formatTime"
        :get-action-badge-class="getActionBadgeClass"
        @view="showDetails"
        @paginate="changePage"
      />

      <!-- ── FORENSIC MODAL ── -->
      <AuditLogsDetailModal
        :is-open="isModalOpen"
        :selected-log="selectedLog || {}"
        :format-date="formatDate"
        :format-time="formatTime"
        :get-action-badge-class="getActionBadgeClass"
        @close="isModalOpen = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import AuditLogsFilters from '~/components/admin/audit/AuditLogsFilters.vue'
import AuditLogsTable from '~/components/admin/audit/AuditLogsTable.vue'
import AuditLogsDetailModal from '~/components/admin/audit/AuditLogsDetailModal.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'super-admin'
})

useHead({
  title: 'WATCHTOWER AUDIT TRAIL // BAZARX'
})

const {
  logs, loading, pagination, filters, isModalOpen, selectedLog, actionTypes,
  fetchLogs, changePage, showDetails, formatDate, formatTime, getActionBadgeClass
} = useAdminAuditLogs()
</script>

<style scoped>
.tracking-tightest { letter-spacing: -0.06em; }
</style>
