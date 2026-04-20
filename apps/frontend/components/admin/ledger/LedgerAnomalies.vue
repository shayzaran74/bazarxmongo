<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
      <div class="flex items-center gap-3">
        <div class="relative">
          <span class="text-lg">🔴</span>
          <span v-if="summary.high > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-black text-white">
            {{ summary.high }}
          </span>
        </div>
        <div>
          <h3 class="text-sm font-black text-gray-900 uppercase tracking-tight">Anomali Uyarıları</h3>
          <p class="text-xs text-gray-400 mt-0.5">Son 60 dakikada tespit edilen şüpheli işlemler</p>
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <div class="flex gap-1">
          <button
            v-for="s in severityFilters" :key="s.value"
            class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
            :class="severityFilter === s.value ? s.activeClass : 'bg-gray-100 text-gray-500'"
            @click="$emit('update:severityFilter', s.value); $emit('refresh')"
          >
            {{ s.label }}
          </button>
        </div>
        <button class="p-1.5 bg-gray-50 rounded-lg border border-gray-100" @click="$emit('refresh')">
          <ArrowPathIcon class="h-4 w-4 text-gray-500" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
    </div>

    <!-- Summary Badges -->
    <div v-if="!loading && summary.total > 0" class="px-6 py-3 bg-gray-50 border-b border-gray-100 flex gap-4">
      <span class="flex items-center gap-1.5 text-[10px] font-black text-gray-500 uppercase">
        <span class="w-2 h-2 rounded-full bg-red-500" /> {{ summary.high }} Yüksek
      </span>
      <span class="flex items-center gap-1.5 text-[10px] font-black text-gray-500 uppercase">
        <span class="w-2 h-2 rounded-full bg-amber-400" /> {{ summary.medium }} Orta
      </span>
      <span class="flex items-center gap-1.5 text-[10px] font-black text-gray-500 uppercase">
        <span class="w-2 h-2 rounded-full bg-green-400" /> {{ summary.low }} Düşük
      </span>
    </div>

    <!-- Alert List -->
    <div class="divide-y divide-gray-50">
      <div v-if="loading" v-for="i in 3" :key="i" class="px-6 py-4 animate-pulse">
        <div class="h-4 bg-gray-100 rounded w-3/4 mb-2" />
        <div class="h-3 bg-gray-50 rounded w-1/2" />
      </div>
      
      <div v-else-if="!alerts.length" class="px-6 py-10 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
        ✅ Şüpheli işlem tespit edilmedi
      </div>

      <div v-for="alert in alerts" :key="alert.detectedAt" class="px-6 py-4 flex items-start justify-between gap-4 hover:bg-gray-50/50">
        <div class="flex items-start gap-4 flex-1 min-w-0">
          <span class="text-base mt-0.5">{{ alert.severity === 'HIGH' ? '🔴' : alert.severity === 'MEDIUM' ? '🟡' : '🟢' }}</span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest" :class="getSeverityBadge(alert.severity)">
                {{ alert.severity }}
              </span>
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-md">
                {{ alert.rule?.replace(/_/g, ' ') }}
              </span>
            </div>
            <p class="text-sm text-gray-800 font-medium mt-1">{{ alert.message }}</p>
            <div class="flex items-center gap-3 mt-1 text-xs text-gray-400 font-bold">
              <span v-if="alert.userName">👤 {{ alert.userName }}</span>
              <span>{{ formatDate(alert.detectedAt) }}</span>
            </div>
          </div>
        </div>
        <NuxtLink v-if="alert.userId" :to="`/admin/users?search=${alert.userEmail || alert.userId}`" class="px-3 py-1.5 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg text-[10px] font-black uppercase transition-colors">
          İncele →
        </NuxtLink>
      </div>
    </div>

    <!-- Last Scanned -->
    <div v-if="lastScanned" class="px-6 py-3 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 font-bold">
      Son tarama: {{ formatDate(lastScanned) }} — 5 dakikada bir otomatik yenilenir
    </div>
  </div>
</template>

<script setup>
import { ArrowPathIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  alerts: Array,
  summary: Object,
  loading: Boolean,
  severityFilter: String,
  lastScanned: [String, Date],
  formatDate: Function
})

defineEmits(['update:severityFilter', 'refresh'])

const severityFilters = [
  { label: 'Tümü', value: '', activeClass: 'bg-gray-800 text-white' },
  { label: '🔴 High', value: 'HIGH', activeClass: 'bg-red-50 text-white' },
  { label: '🟡 Medium', value: 'MEDIUM', activeClass: 'bg-amber-400 text-white' },
  { label: '🟢 Low', value: 'LOW', activeClass: 'bg-green-500 text-white' },
]

const getSeverityBadge = (severity) => ({
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  LOW: 'bg-green-100 text-green-700',
})[severity] || 'bg-gray-100 text-gray-600'
</script>
