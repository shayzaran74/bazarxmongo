<template>
  <div class="bg-white rounded-[2rem] shadow-md p-8 border border-gray-100">
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <h2 class="text-xl font-black text-gray-900 flex items-center gap-2">
        <span>💸</span> Cüzdan Hareketlerim
      </h2>

      <!-- Account Switcher -->
      <div class="flex bg-gray-100/50 p-1.5 rounded-2xl items-center gap-1 overflow-x-auto no-scrollbar max-w-full border border-gray-100">
        <button
          v-if="isVendor"
          class="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
          :class="selectedAccountId === 'all' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'"
          @click="$emit('switch-account', 'all')"
        >
          Tümü
        </button>
        <button
          v-for="acc in accounts"
          :key="acc.id"
          class="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
          :class="selectedAccountId === acc.id ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'"
          @click="$emit('switch-account', acc.id)"
        >
          {{ getAccountLabel(acc.type) }}
        </button>
      </div>

      <div class="flex items-center gap-4">
        <button
          class="text-xs text-blue-600 font-black uppercase tracking-widest hover:underline"
          @click="$emit('refresh')"
        >
          Yenile
        </button>
        <NuxtLink
          to="/wallet/transactions"
          class="text-[10px] font-black uppercase tracking-widest bg-gray-900 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-gray-200 hover:bg-black transition-all"
        >
          Tümü →
        </NuxtLink>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-16">
      <div class="animate-spin h-10 w-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full" />
    </div>

    <div v-else-if="transactions.length > 0" class="overflow-x-auto">
      <table class="w-full text-left border-separate border-spacing-y-2">
        <thead class="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
          <tr>
            <th class="px-6 py-4 rounded-l-2xl">Tarih</th>
            <th class="px-6 py-4">Açıklama</th>
            <th class="px-6 py-4">Hesap Türü</th>
            <th class="px-6 py-4 text-right rounded-r-2xl">Miktar</th>
          </tr>
        </thead>
        <tbody class="divide-y-0">
          <tr
            v-for="tx in transactions"
            :key="tx.id"
            class="group hover:bg-gray-50/50 transition-all"
          >
            <td class="px-6 py-5 text-[11px] font-bold text-gray-500 whitespace-nowrap group-hover:text-blue-600">
              {{ new Date(tx.createdAt).toLocaleDateString('tr-TR') }}
            </td>
            <td class="px-6 py-5">
              <div class="font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                {{ tx.description || (tx.direction === 'CREDIT' ? 'Bakiye Girişi' : 'Harcama') }}
              </div>
              <div class="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                {{ tx.type }}
              </div>
            </td>
            <td class="px-6 py-5">
              <span
                class="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border"
                :class="getAccountBadgeClass(tx.account?.type || tx.accountType)"
              >
                {{ getAccountLabel(tx.account?.type || tx.accountType) }}
              </span>
            </td>
            <td
              class="px-6 py-5 text-right font-black text-sm whitespace-nowrap"
              :class="tx.direction === 'DEBIT' ? 'text-red-500' : 'text-green-600'"
            >
              {{ tx.direction === 'DEBIT' ? '-' : '+' }}{{ formatPrice(tx.amount) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-center py-20 bg-gray-50/30 rounded-[2rem] border border-dashed border-gray-100">
      <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
        <span class="text-3xl">📑</span>
      </div>
      <p class="text-gray-400 font-black uppercase tracking-widest text-xs">Henüz bir işlem hareketiniz bulunmuyor.</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  transactions: Array,
  accounts: Array,
  isVendor: Boolean,
  loading: Boolean,
  selectedAccountId: [String, Number],
  formatPrice: Function
})

defineEmits(['switch-account', 'refresh'])

const getAccountLabel = (type) => {
  if (type === 'MAIN') return 'Nakit'
  if (type === 'BARTER') return 'Barter'
  if (type === 'SYSTEM') return 'Sistem'
  if (type && type.includes('XP_COMMISSION')) return 'XP İndirim'
  if (type && type.includes('XP_AD')) return 'XP Reklam'
  if (type && type.includes('XP_SERVICE')) return 'XP Servis'
  if (type && type.includes('XP')) return 'XP'
  return 'Genel'
}

const getAccountBadgeClass = (type) => {
  if (type === 'MAIN') return 'bg-blue-50 text-blue-700 border-blue-100'
  if (type === 'BARTER') return 'bg-orange-50 text-orange-700 border-orange-100'
  if (type === 'SYSTEM') return 'bg-gray-100 text-gray-700 border-gray-200'
  if (type && type.includes('XP')) return 'bg-purple-50 text-purple-700 border-purple-100'
  return 'bg-gray-50 text-gray-700 border-gray-100'
}
</script>
