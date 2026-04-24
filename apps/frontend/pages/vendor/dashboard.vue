<template>
  <div class="px-4 py-6 sm:px-0">

    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Satıcı Paneli</h1>
        <p class="text-sm text-gray-500 mt-1">Hoş geldiniz, {{ authStore.fullName }}</p>
      </div>
      <NuxtLink
        to="/"
        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        <HomeIcon class="h-5 w-5 mr-2" />
        Ana Sayfaya Dön
      </NuxtLink>
    </div>

    <!-- Ana İstatistik Kartları -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <!-- Kazanç -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-green-100 rounded-md p-3">
              <CurrencyDollarIcon class="h-6 w-6 text-green-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dt class="text-sm font-medium text-gray-500 truncate">Toplam Kazanç</dt>
              <dd class="text-2xl font-semibold text-gray-900">{{ stats.totalSales }}</dd>
            </div>
          </div>
        </div>
      </div>

      <!-- Ürünler -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-primary-100 rounded-md p-3">
              <ShoppingBagIcon class="h-6 w-6 text-primary-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dt class="text-sm font-medium text-gray-500 truncate">Toplam Ürün</dt>
              <dd class="text-2xl font-semibold text-gray-900">{{ stats.productCount }}</dd>
            </div>
          </div>
        </div>
      </div>

      <!-- Kullanıcılar -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <UsersIcon class="h-6 w-6 text-blue-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dt class="text-sm font-medium text-gray-500 truncate">Toplam Kullanıcı</dt>
              <dd class="text-2xl font-semibold text-gray-900">{{ stats.users }}</dd>
            </div>
          </div>
        </div>
      </div>

      <!-- Bekleyen Siparişler -->
      <NuxtLink
        to="/vendor/orders"
        class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
      >
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-yellow-100 rounded-md p-3">
              <ShoppingCartIcon class="h-6 w-6 text-yellow-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dt class="text-sm font-medium text-gray-500 truncate">Bekleyen Siparişler</dt>
              <dd class="text-2xl font-semibold text-gray-900">{{ stats.pendingOrders }}</dd>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- XP / Barter Kartları -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Komisyon XP -->
      <div class="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest opacity-70">İndirim Paneli</p>
            <p class="text-2xl font-black mt-1">{{ formatPrice(xpStats.commissionXP) }}</p>
          </div>
          <div
            v-if="vendorTierData?.currentTier"
            class="bg-white/20 px-2 py-1 rounded text-[10px] font-bold uppercase backdrop-blur-sm"
          >
            {{ vendorTierData.currentTier.nametr || vendorTierData.currentTier.name }} TIER
          </div>
        </div>
        <p class="text-[10px] mt-2 opacity-80 italic">Komisyon indirimlerinde kullanılır</p>
      </div>

      <!-- Reklam Bakiyesi -->
      <div class="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-5 text-white shadow-lg">
        <p class="text-[10px] font-black uppercase tracking-widest opacity-70">Reklam Bakiyesi</p>
        <p class="text-2xl font-black mt-1">{{ formatPrice(xpStats.adXP) }}</p>
        <p class="text-[10px] mt-2 opacity-80 italic">Ürün öne çıkarma ve reklamlar</p>
      </div>

      <!-- Sistem Giderleri -->
      <div class="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-5 text-white shadow-lg">
        <p class="text-[10px] font-black uppercase tracking-widest opacity-70">Sistem Giderleri</p>
        <p class="text-2xl font-black mt-1">{{ formatPrice(xpStats.serviceXP) }}</p>
        <p class="text-[10px] mt-2 opacity-80 italic">Kargo ve servis giderleri</p>
      </div>

      <!-- Barter Havuzu -->
      <div class="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest opacity-70">Barter Havuzu</p>
            <p class="text-2xl font-black mt-1">{{ formatPrice(xpStats.barterBalance) }}</p>
          </div>
          <div class="flex gap-1">
            <button
              title="Nakit Cüzdana Çek"
              class="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg transition-colors"
              @click="handleBarterWithdraw"
            >
              <ArrowDownTrayIcon class="h-4 w-4" />
            </button>
            <button
              title="Havuza Nakit Aktar"
              class="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg transition-colors"
              @click="handleBarterDeposit"
            >
              <PlusCircleIcon class="h-4 w-4" />
            </button>
          </div>
        </div>
        <p class="text-[10px] mt-2 opacity-80 italic">Aktif takas bakiyeniz</p>
      </div>
    </div>

    <!-- Tier Kartı + Ekosistem -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      <!-- Vendor Tier Card -->
      <div class="lg:col-span-2">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Satıcı Tier Seviyeniz</h2>
        <VendorTierCard
          :tier-data="vendorTierData?.currentTier"
          :progress="vendorTierData?.progress"
          :stats="vendorTierStats"
          :regional="vendorTierData?.regional"
          :current-commission-rate="stats.commissionRate"
        />
      </div>

      <!-- Ekosistem Paneli -->
      <div class="flex flex-col">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Eko-Sistem Paneli</h2>

        <!-- Mevcut ekosistem -->
        <div v-if="myEcosystem" class="bg-white shadow rounded-lg p-6 flex-1">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-bold text-gray-900">{{ myEcosystem.name }}</h3>
              <p class="text-sm text-gray-500">{{ myEcosystem.description }}</p>
            </div>
            <NuxtLink
              :to="`/ecosystem/${myEcosystem.id}`"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              Yönet
            </NuxtLink>
          </div>
          <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div class="text-center">
              <p class="text-2xl font-bold text-primary-600">{{ myEcosystem._count?.members || 0 }}</p>
              <p class="text-xs text-gray-500">Üye</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-green-600">{{ myEcosystem._count?.products || 0 }}</p>
              <p class="text-xs text-gray-500">Ürün</p>
            </div>
          </div>
        </div>

        <!-- Ekosistem yok — APEX / ApexPlus için oluştur -->
        <NuxtLink
          v-else-if="authStore.isApexPlus"
          to="#"
          class="group bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1 transition-all duration-300 flex-1 flex flex-col justify-center"
          @click.prevent="createDefaultEcosystem"
        >
          <div class="flex items-center mb-4">
            <div class="p-3 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:bg-white transition-colors">
              <ShieldCheckIcon class="h-8 w-8 text-white group-hover:text-indigo-600" />
            </div>
          </div>
          <div>
            <span class="block font-black uppercase tracking-widest text-xs text-indigo-100 mb-1">BazarX Private</span>
            <span class="block font-black uppercase tracking-widest text-xl text-white italic">İş Ortağı Portalı</span>
            <p class="text-indigo-100/70 text-[10px] mt-2 font-medium">Özel bayi ağınızı hemen aktifleştirin.</p>
          </div>
        </NuxtLink>

        <!-- Standart satıcı — ekosisteme davet edilmiş olabilir -->
        <div v-else class="bg-indigo-600 rounded-lg p-6 text-white flex-1 flex flex-col justify-center">
          <h3 class="text-lg font-bold mb-2">Özel Bayi Ağınızı Kurun</h3>
          <p class="text-indigo-100 text-sm mb-4">APEX Plus üyeliği ile bayilerinize özel fiyatlar ve kataloglar sunun.</p>
          <NuxtLink
            to="/premium"
            class="bg-white text-indigo-600 px-4 py-2 rounded-md font-bold text-sm hover:bg-indigo-50 text-center"
          >
            Premium'a Geç
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Marka Satış Analizi -->
    <div v-if="brandStats?.distribution?.length > 0" class="mb-8">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Marka Satış Analizi</h2>
      <div class="bg-white shadow rounded-lg p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Haftalık Performans -->
          <div>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Haftalık Performans (₺)</h3>
            <div class="space-y-4">
              <div v-for="week in brandStats.weeklyPerformance" :key="week.name" class="relative pt-1">
                <div class="flex mb-2 items-center justify-between">
                  <span class="text-xs font-semibold text-primary-600 uppercase">{{ week.name }}</span>
                  <span class="text-xs font-semibold text-primary-600">₺{{ week.value.toLocaleString('tr-TR') }}</span>
                </div>
                <div class="overflow-hidden h-2 mb-4 rounded bg-primary-100">
                  <div
                    class="h-full bg-primary-500"
                    :style="{ width: `${(week.value / brandStats.totalRevenue) * 100}%` }"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Marka Dağılımı -->
          <div>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Marka Dağılımı</h3>
            <div class="space-y-3">
              <div v-for="brand in brandStats.distribution" :key="brand.name" class="flex items-center">
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm font-medium text-gray-700">{{ brand.name }}</span>
                    <span class="text-xs text-gray-500">₺{{ brand.revenue.toLocaleString('tr-TR') }}</span>
                  </div>
                  <div class="w-full bg-gray-100 rounded-full h-1.5">
                    <div class="bg-indigo-600 h-1.5 rounded-full" :style="{ width: `${brand.percentage}%` }" />
                  </div>
                </div>
                <span class="ml-4 text-xs font-bold text-gray-900 w-12 text-right">{{ brand.percentage.toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Son Aktiviteler + Bekleyen Siparişler -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Son Aktiviteler -->
      <div>
        <h2 class="text-lg font-medium text-gray-900 mb-4">Son Aktiviteler</h2>
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <div v-if="loading" class="p-4 text-center">
            <div class="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto" />
          </div>
          <ul v-else-if="recentActivities.length > 0" class="divide-y divide-gray-200">
            <li v-for="activity in recentActivities" :key="activity.id">
              <div class="px-4 py-4 sm:px-6">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-primary-600 truncate">{{ activity.title }}</p>
                  <p
                    class="ml-2 flex-shrink-0"
                    :class="getStatusBadgeClass(activity.statusRaw)"
                  >
                    {{ activity.status }}
                  </p>
                </div>
                <div class="mt-2 sm:flex sm:justify-between">
                  <p class="flex items-center text-sm text-gray-500">{{ activity.description }}</p>
                  <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <CalendarIcon class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    <p>{{ formatDate(activity.createdAt) }}</p>
                  </div>
                </div>
              </div>
            </li>
          </ul>
          <div v-else class="p-4 text-center text-gray-500">Henüz aktivite bulunmuyor.</div>
        </div>
      </div>

      <!-- Bekleyen Siparişler -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium text-gray-900">Bekleyen Siparişler</h2>
          <NuxtLink to="/vendor/orders" class="text-sm font-medium text-primary-600 hover:text-primary-500">
            Tümünü Gör
          </NuxtLink>
        </div>
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <div v-if="loading" class="p-4 text-center">
            <div class="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto" />
          </div>
          <ul v-else-if="pendingOrdersList.length > 0" class="divide-y divide-gray-200">
            <li v-for="order in pendingOrdersList" :key="order.id">
              <NuxtLink to="/vendor/orders" class="block hover:bg-gray-50">
                <div class="px-4 py-4 sm:px-6">
                  <div class="flex items-center justify-between">
                    <div class="flex flex-col">
                      <p class="text-sm font-bold text-gray-900">#{{ order.orderNumber }}</p>
                      <p class="text-xs text-gray-500">{{ order.User?.name || 'İsimsiz' }}</p>
                    </div>
                    <div class="flex flex-col items-end">
                      <p class="text-sm font-bold text-primary-600">
                        {{ formatPrice(orderTotalForVendor(order)) }}
                      </p>
                      <p class="text-[10px] text-gray-400">{{ formatDate(order.createdAt) }}</p>
                    </div>
                  </div>
                </div>
              </NuxtLink>
            </li>
          </ul>
          <div v-else class="p-8 text-center">
            <span class="text-3xl mb-2 block">🎉</span>
            <p class="text-sm text-gray-500">Bekleyen siparişiniz bulunmuyor.</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import {
  HomeIcon, CurrencyDollarIcon, ShoppingBagIcon, UsersIcon,
  ShoppingCartIcon, CalendarIcon, ArrowDownTrayIcon,
  PlusCircleIcon, ShieldCheckIcon,
} from '@heroicons/vue/24/outline'
import VendorTierCard from '~/components/vendor/VendorTierCard.vue'
import { useVendorDashboard } from '~/composables/useVendorDashboard'

definePageMeta({ layout: 'vendor', middleware: 'vendor' })
useHead({ title: 'Satıcı Paneli - BazarX' })

const {
  loading, stats, xpStats,
  recentActivities, pendingOrdersList,
  myEcosystem, vendorTierData, vendorTierStats, brandStats,
  formatPrice, formatDate, getStatusBadgeClass, orderTotalForVendor,
  fetchStats, fetchXPStats, fetchVendorTier, fetchBrandStats, fetchEcosystemStatus,
  createDefaultEcosystem, handleBarterDeposit, handleBarterWithdraw,
  authStore,
} = useVendorDashboard()

onMounted(async () => {
  await fetchStats()
  await Promise.all([
    fetchXPStats(),
    fetchVendorTier(),
    fetchBrandStats(),
    fetchEcosystemStatus(),
  ])
})
</script>
