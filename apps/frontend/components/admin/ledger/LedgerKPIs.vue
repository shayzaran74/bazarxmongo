<template>
  <div v-if="kpis" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Total Volume -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest relative">Toplam Finansal Hacim</p>
      <p class="text-3xl font-black text-gray-900 mt-2 relative">{{ formatCurrency(kpis.totalVolume) }}</p>
      <div class="mt-3 flex items-center gap-1 relative">
        <span class="text-[10px] text-indigo-600 font-bold uppercase">Son {{ selectedDays }} gün</span>
      </div>
      <div class="absolute -bottom-4 -right-4 w-20 h-20 bg-indigo-100 rounded-full opacity-30" />
    </div>

    <!-- Wallet TX -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
      <div class="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest relative">Cüzdan İşlemleri</p>
      <p class="text-3xl font-black text-gray-900 mt-2 relative">{{ formatNumber(kpis.walletTxCount) }}</p>
      <div class="mt-3 relative">
        <span class="text-[10px] text-green-600 font-bold uppercase">WALLET_TX eventi</span>
      </div>
      <div class="absolute -bottom-4 -right-4 w-20 h-20 bg-green-100 rounded-full opacity-30" />
    </div>

    <!-- Order Events -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
      <div class="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest relative">Sipariş Olayları</p>
      <p class="text-3xl font-black text-gray-900 mt-2 relative">{{ formatNumber(kpis.orderEventCount) }}</p>
      <div class="mt-3 relative">
        <span class="text-[10px] text-amber-600 font-bold uppercase">ORDER_STATUS eventi</span>
      </div>
      <div class="absolute -bottom-4 -right-4 w-20 h-20 bg-amber-100 rounded-full opacity-30" />
    </div>

    <!-- Total Events -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
      <div class="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest relative">Toplam Ledger Kaydı</p>
      <p class="text-3xl font-black text-gray-900 mt-2 relative">{{ formatNumber(kpis.totalEvents) }}</p>
      <div class="mt-3 relative">
        <span class="text-[10px] text-purple-600 font-bold uppercase">Tüm event türleri</span>
      </div>
      <div class="absolute -bottom-4 -right-4 w-20 h-20 bg-purple-100 rounded-full opacity-30" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  kpis: Object,
  selectedDays: [Number, String],
  formatCurrency: Function,
  formatNumber: Function
})
</script>
