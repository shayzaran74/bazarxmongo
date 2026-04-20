<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
      <div>
        <h3 class="text-sm font-black text-gray-900 uppercase tracking-tight">Son Ledger Kayıtları</h3>
        <p class="text-xs text-gray-400 mt-0.5">En son 20 immutable journal girişi</p>
      </div>
      <NuxtLink to="/admin/wallet-transactions" class="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors">
        Tüm Hareketler →
      </NuxtLink>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead class="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <tr>
            <th class="px-6 py-3">Tarih</th>
            <th class="px-6 py-3">Tür</th>
            <th class="px-6 py-3">Açıklama</th>
            <th class="px-6 py-3">Miktar</th>
            <th class="px-6 py-3 whitespace-nowrap">Ref. ID</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-if="loading" v-for="i in 5" :key="i" class="animate-pulse">
            <td colspan="5" class="px-6 py-5"><div class="h-4 bg-gray-100 rounded w-full" /></td>
          </tr>
          
          <tr v-else-if="!entries.length">
            <td colspan="5" class="px-6 py-12 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">Henüz ledger kaydı yok</td>
          </tr>

          <tr v-for="entry in entries" :key="entry.id" class="hover:bg-gray-50/50 transition-colors text-sm">
            <td class="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">{{ formatDate(entry.createdAt) }}</td>
            <td class="px-6 py-4">
              <span :class="getTypeBadge(entry.type)" class="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                {{ entry.type }}
              </span>
            </td>
            <td class="px-6 py-4 text-gray-600 text-xs max-w-xs truncate">{{ entry.description || '—' }}</td>
            <td class="px-6 py-4 font-black text-xs" :class="entry.amount > 0 ? 'text-green-600' : entry.amount < 0 ? 'text-red-500' : 'text-gray-400'">
              {{ entry.amount ? formatCurrency(Math.abs(entry.amount)) : '—' }}
            </td>
            <td class="px-6 py-4 text-gray-400 text-xs font-mono">
              {{ entry.referenceId ? String(entry.referenceId).slice(0, 12) + '…' : '—' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  entries: Array,
  loading: Boolean,
  formatDate: Function,
  formatCurrency: Function,
  getTypeBadge: Function
})
</script>
