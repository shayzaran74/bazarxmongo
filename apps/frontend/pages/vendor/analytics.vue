<template>
  <div class="p-4 md:p-8 space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight">
          Satış Analizi
        </h1>
        <p class="text-gray-500 mt-1">
          İşletmenizin performansını ve satış trendlerini takip edin.
        </p>
      </div>
      <div class="flex items-center space-x-2 bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
        <button
          v-for="p in periods"
          :key="p.id"
          :class="[
            'px-4 py-2 text-sm font-bold rounded-xl transition-all',
            selectedPeriod === p.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-500 hover:bg-gray-50'
          ]"
          @click="selectedPeriod = p.id"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="stat in quickStats"
        :key="stat.label"
        class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      >
        <div :class="[stat.bg, 'w-12 h-12 rounded-2xl flex items-center justify-center mb-4']">
          <component
            :is="stat.icon"
            :class="[stat.color, 'h-6 w-6']"
          />
        </div>
        <div class="text-sm font-bold text-gray-400 uppercase tracking-wider">
          {{ stat.label }}
        </div>
        <div class="text-2xl font-black text-gray-900 mt-1">
          {{ stat.prefix }}{{ (stat.value || 0).toLocaleString('tr-TR') }}{{ stat.suffix }}
        </div>
      </div>
    </div>

    <!-- Charts and Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-8">
        <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 class="text-xl font-black text-gray-900 mb-8">Gelir Trendi</h3>
          <div class="h-64 flex items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
             <span class="text-gray-400 font-medium italic">Grafik verisi yakında burada olacak</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 class="text-lg font-black text-gray-900 mb-6">Kategori Dağılımı</h3>
            <div class="h-48 flex items-center justify-center bg-gray-50 rounded-2xl">
               <span class="text-gray-400 text-xs italic">Veri yok</span>
            </div>
          </div>
          <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 class="text-lg font-black text-gray-900 mb-6">İade Analizi</h3>
            <div class="space-y-4">
               <p class="text-sm text-gray-500 italic">Henüz iade kaydı bulunamadı.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit">
        <h3 class="text-xl font-black text-gray-900 mb-8">En Çok Satanlar</h3>
        <div class="space-y-6">
           <p class="text-sm text-gray-400 italic">Satış verisi bekleniyor...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as HeroIcons from '@heroicons/vue/24/outline'
import { useVendorService } from '~/services/api/VendorService'

definePageMeta({
  layout: 'vendor',
  middleware: 'vendor'
})

useHead({
  title: 'Satış Analizi - BarterBorsa'
})

const vendorService = useVendorService()
const selectedPeriod = ref('30d')

const periods = [
  { id: '7d', label: '7 Gün' },
  { id: '30d', label: '30 Gün' },
  { id: '90d', label: '90 Gün' }
]

const { data: analytics, pending, refresh } = await useAsyncData('vendor-analytics', () => 
  vendorService.getAnalytics()
)

const quickStats = computed(() => {
  const s = analytics.value?.data?.stats || { totalRevenue: 0, totalSalesCount: 0, uniqueOrders: 0, averageOrderValue: 0 }
  return [
    { label: 'Toplam Gelir', value: s.totalRevenue, prefix: '₺', suffix: '', icon: HeroIcons.BanknotesIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Sipariş Sayısı', value: s.uniqueOrders, prefix: '', suffix: '', icon: HeroIcons.ShoppingCartIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Satılan Ürün', value: s.totalSalesCount, prefix: '', suffix: '', icon: HeroIcons.ShoppingBagIcon, color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: 'Ort. Sepet', value: s.averageOrderValue, prefix: '₺', suffix: '', icon: HeroIcons.ChartBarIcon, color: 'text-orange-600', bg: 'bg-orange-50' }
  ]
})
</script>
