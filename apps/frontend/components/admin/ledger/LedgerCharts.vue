<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Daily Activity Chart -->
      <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div class="mb-6">
          <h3 class="text-sm font-black text-gray-900 uppercase tracking-tight">Günlük Ledger Aktivitesi</h3>
          <p class="text-xs text-gray-400 mt-0.5">Finansal ve sipariş olaylarının günlük dağılımı</p>
        </div>
        <ClientOnly>
          <apexchart v-if="dailySeries[0]?.data?.length" type="area" height="280" :options="dailyOptions" :series="dailySeries" />
          <div v-else class="flex items-center justify-center h-64 text-xs text-gray-400 font-bold uppercase tracking-widest">Gösterilecek veri yok</div>
        </ClientOnly>
      </div>

      <!-- Event Distribution Donut -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div class="mb-6">
          <h3 class="text-sm font-black text-gray-900 uppercase tracking-tight">Event Dağılımı</h3>
          <p class="text-xs text-gray-400 mt-0.5">Ledger türlerine göre dağılım</p>
        </div>
        <ClientOnly>
          <apexchart v-if="distSeries.length" type="donut" height="280" :options="distOptions" :series="distSeries" />
          <div v-else class="flex items-center justify-center h-64 text-xs text-gray-400 font-bold uppercase tracking-widest">Gösterilecek veri yok</div>
        </ClientOnly>
      </div>
    </div>

    <!-- Volume Bar Chart -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div class="mb-6">
        <h3 class="text-sm font-black text-gray-900 uppercase tracking-tight">Günlük Finansal Hacim (TL)</h3>
        <p class="text-xs text-gray-400 mt-0.5">Wallet TX işlemlerinin günlük parasal büyüklüğü</p>
      </div>
      <ClientOnly>
        <apexchart v-if="volumeSeries[0]?.data?.length" type="bar" height="220" :options="volumeOptions" :series="volumeSeries" />
        <div v-else class="flex items-center justify-center h-48 text-xs text-gray-400 font-bold uppercase tracking-widest">Gösterilecek veri yok</div>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  dailySeries: Array,
  dailyOptions: Object,
  distSeries: Array,
  distOptions: Object,
  volumeSeries: Array,
  volumeOptions: Object
})
</script>
