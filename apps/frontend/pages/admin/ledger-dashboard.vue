<template>
  <div class="space-y-8">
    <!-- Header & Period Selector -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
      <div>
        <h1 class="text-3xl font-black text-gray-900 uppercase tracking-tight italic">
          📊 Genel <span class="text-indigo-600">Mizan</span>
        </h1>
        <p class="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1 opacity-70">Immutable Ledger ve ACID Mutabakat Analizi</p>
      </div>
      <div class="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
        <div class="flex bg-gray-100 p-1 rounded-xl">
          <button
            v-for="d in periods" :key="d.value"
            class="px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg"
            :class="selectedDays === d.value ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
            @click="handlePeriodChange(d.value)"
          >
            {{ d.label }}
          </button>
        </div>
        <button class="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all" @click="fetchLedgerData">
          <ArrowPathIcon class="h-5 w-5 text-gray-600" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
    </div>

    <!-- KPIs -->
    <LedgerKPIs 
      :kpis="kpis" 
      :selected-days="selectedDays" 
      :format-currency="formatCurrency" 
      :format-number="formatNumber" 
    />

    <!-- Charts -->
    <LedgerCharts 
      v-if="!loading"
      :daily-series="dailySeries"
      :daily-options="dailyChartOptions"
      :dist-series="distSeries"
      :dist-options="distChartOptions"
      :volume-series="volumeSeries"
      :volume-options="volumeChartOptions"
    />
    <div v-else class="h-96 bg-white rounded-[2rem] animate-pulse" />

    <!-- Ledger & Security Rows -->
    <div class="grid grid-cols-1 gap-8">
      <LedgerRecentEntries 
        :entries="recentEntries" 
        :loading="loading"
        :format-date="formatDate"
        :format-currency="formatCurrency"
        :get-type-badge="getTypeBadge"
      />

      <LedgerAnomalies 
        v-model:severity-filter="anomalySeverityFilter"
        :alerts="anomalyAlerts"
        :summary="anomalySummary"
        :loading="anomalyLoading"
        :last-scanned="anomalyLastScanned"
        :format-date="formatDate"
        @refresh="fetchAnomalies"
      />

      <LedgerReconciliation 
        :result="reconResult"
        :loading="reconLoading"
        :format-number="formatNumber"
        @trigger="triggerReconciliation"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { ArrowPathIcon } from '@heroicons/vue/24/outline'
import { useAdminLedger } from '~/composables/useAdminLedger'

// Modüler Bileşenler
import LedgerKPIs from '~/components/admin/ledger/LedgerKPIs.vue'
import LedgerCharts from '~/components/admin/ledger/LedgerCharts.vue'
import LedgerAnomalies from '~/components/admin/ledger/LedgerAnomalies.vue'
import LedgerReconciliation from '~/components/admin/ledger/LedgerReconciliation.vue'
import LedgerRecentEntries from '~/components/admin/ledger/LedgerRecentEntries.vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Finansal Denetim - BazarX Admin' })

const {
  loading, selectedDays, periods, ledgerData, recentEntries, kpis,
  anomalyAlerts, anomalySummary, anomalyLoading, anomalySeverityFilter, anomalyLastScanned,
  reconLoading, reconResult,
  fetchLedgerData, fetchAnomalies, triggerReconciliation,
  formatCurrency, formatNumber, formatCurrencyShort
} = useAdminLedger()

// --- Chart Data Transformers (Keep here for reactivity context) ---
const dailyCategories = computed(() => ledgerData.value.daily.map(d => {
  const dt = new Date(d.date)
  return `${dt.getDate()} ${dt.toLocaleString('tr-TR', { month: 'short' })}`
}))

const dailySeries = computed(() => [
  { name: 'Cüzdan TX', data: ledgerData.value.daily.map(d => d.WALLET_TX || 0) },
  { name: 'Sipariş Olayı', data: ledgerData.value.daily.map(d => d.ORDER_STATUS || 0) },
  { name: 'Diğer', data: ledgerData.value.daily.map(d => d.OTHER || 0) }
])

const distSeries = computed(() => ledgerData.value.distribution.map(d => d.value))
const distLabels = computed(() => ledgerData.value.distribution.map(d => d.name.replace(/_/g, ' ')))

const volumeSeries = computed(() => [
  { name: 'Finansal Hacim (TL)', data: ledgerData.value.daily.map(d => Math.round(d.totalTxVolume || 0)) }
])

// --- Chart Options ---
const dailyChartOptions = computed(() => ({
  chart: { type: 'area', fontFamily: 'inherit', toolbar: { show: false } },
  colors: ['#6366f1', '#f59e0b', '#10b981'],
  stroke: { curve: 'smooth', width: 2 },
  xaxis: { categories: dailyCategories.value, labels: { style: { fontSize: '10px', fontWeight: 700 } } },
  yaxis: { labels: { style: { fontSize: '10px' } } },
  legend: { position: 'top', horizontalAlign: 'right', fontSize: '11px', fontWeight: 700 },
  grid: { strokeDashArray: 4 }
}))

const distChartOptions = computed(() => ({
  chart: { type: 'donut', fontFamily: 'inherit' },
  labels: distLabels.value,
  colors: ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#06b6d4'],
  legend: { position: 'bottom', fontSize: '10px', fontWeight: 700 },
}))

const volumeChartOptions = computed(() => ({
  chart: { type: 'bar', fontFamily: 'inherit', toolbar: { show: false } },
  colors: ['#6366f1'],
  plotOptions: { bar: { borderRadius: 8, columnWidth: '60%' } },
  xaxis: { categories: dailyCategories.value, labels: { style: { fontSize: '10px', fontWeight: 700 } } },
  yaxis: { labels: { formatter: val => formatCurrencyShort(val), style: { fontSize: '10px' } } },
  grid: { strokeDashArray: 4 }
}))

// --- Helpers ---
const formatDate = (date) => new Date(date).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
const getTypeBadge = (type) => ({
  WALLET_TX: 'bg-indigo-100 text-indigo-700',
  ORDER_STATUS_CHANGED: 'bg-amber-100 text-amber-700',
  FINANCIAL_HOLD: 'bg-blue-100 text-blue-700',
  FINANCIAL_RELEASE: 'bg-green-100 text-green-700'
})[type] || 'bg-gray-100 text-gray-600'

const handlePeriodChange = (days) => {
  selectedDays.value = days
  fetchLedgerData()
}

// Lifecycle
let anomalyTimer = null
onMounted(() => {
  fetchLedgerData()
  fetchAnomalies()
  anomalyTimer = setInterval(fetchAnomalies, 5 * 60 * 1000)
})
onUnmounted(() => { if (anomalyTimer) clearInterval(anomalyTimer) })
</script>
