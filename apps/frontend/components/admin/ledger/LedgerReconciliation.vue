<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
      <div>
        <h3 class="text-sm font-black text-gray-900 uppercase tracking-tight">Finansal Mutabakat Analizi</h3>
        <p class="text-xs text-gray-400 mt-0.5">Cüzdan bakiyeleri ile işlem geçmişlerinin çapraz kontrolü (ACID Audit)</p>
      </div>
      <button
        :disabled="loading"
        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm"
        @click="$emit('trigger')"
      >
        <ArrowPathIcon class="h-4 w-4" :class="{ 'animate-spin': loading }" />
        Sistemi Denetle (Audit)
      </button>
    </div>

    <!-- Summary Stats -->
    <div v-if="result" class="grid grid-cols-1 sm:grid-cols-3 divide-x divide-gray-100 border-b border-gray-100 bg-white">
      <div class="p-6 text-center">
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Denetlenen Birim</p>
        <p class="text-2xl font-black text-gray-900 mt-1">{{ formatNumber((result.stats.totalAccounts || 0) + (result.stats.totalVendors || 0)) }}</p>
      </div>
      <div class="p-6 text-center">
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tespit Edilen Hata</p>
        <p class="text-2xl font-black mt-1" :class="result.stats.issuesCount > 0 ? 'text-red-600' : 'text-green-600'">{{ formatNumber(result.stats.issuesCount) }}</p>
      </div>
      <div class="p-6 text-center">
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sistem Durumu</p>
        <div class="mt-2 flex justify-center">
          <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" :class="result.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
            {{ result.success ? '✅ GÜVENLİ (STABLE)' : '⚠️ RİSKLİ (DISCREPANCY)' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Discrepancy Table -->
    <div v-if="result && result.discrepancies?.length" class="overflow-x-auto">
      <table class="w-full text-left">
        <thead class="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <tr>
            <th class="px-6 py-3">Hesap/Üye/Satıcı</th>
            <th class="px-6 py-3">Tür</th>
            <th class="px-6 py-3">Sorun</th>
            <th class="px-6 py-3 text-right">Beklenen vs Mevcut</th>
            <th class="px-6 py-3 text-right">Fark</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="d in result.discrepancies" :key="d.accountId || d.vendorId" class="hover:bg-red-50/30 transition-colors">
            <td class="px-6 py-4">
              <div class="flex flex-col">
                <span class="text-xs font-black text-gray-900 uppercase">{{ d.vendorName || d.userEmail || d.userId }}</span>
                <span class="text-[9px] font-mono text-gray-400">{{ d.accountId || d.vendorId }}</span>
              </div>
            </td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 rounded bg-gray-100 text-gray-600 text-[9px] font-black uppercase">{{ d.accountType || d.currency }}</span>
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-col gap-1">
                <span v-for="issue in d.issues" :key="issue.type" class="text-[10px] text-red-600 font-bold uppercase truncate max-w-[200px]">❌ {{ issue.type.replace(/_/g, ' ') }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-right">
              <div v-for="issue in d.issues" :key="issue.type" class="flex flex-col">
                <span class="text-[10px] text-gray-400 font-mono">Beklenen: {{ issue.expected }}</span>
                <span class="text-xs text-gray-900 font-black font-mono">Mevcut: {{ issue.actual }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-right font-black" :class="d.issues.some(i => Number(i.diff) !== 0) ? 'text-red-600' : 'text-gray-400'">
              <template v-for="issue in d.issues" :key="issue.type">
                {{ issue.diff }}
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty/Success State -->
    <div v-else-if="result" class="px-6 py-12 text-center">
      <div class="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircleIcon class="h-6 w-6" />
      </div>
      <p class="text-sm font-black text-gray-900 uppercase tracking-tight">Mükemmel Uyum</p>
      <p class="text-xs text-gray-400 mt-1">Tüm cüzdanlar ve vendor bakiyeleri işlem geçmişiyle %100 örtüşüyor.</p>
    </div>
  </div>
</template>

<script setup>
import { ArrowPathIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  result: Object,
  loading: Boolean,
  formatNumber: Function
})

defineEmits(['trigger'])
</script>
