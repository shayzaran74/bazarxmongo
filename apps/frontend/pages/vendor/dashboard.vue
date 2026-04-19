<template>
  <div class="px-4 py-6 sm:px-0">
    <!-- Header with Home Button -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">
        Satıcı Paneli
      </h1>
      <NuxtLink
        to="/"
        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
      >
        <HeroIcons.HomeIcon class="h-5 w-5 mr-2" />
        Ana Sayfaya Dön
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Earnings Card -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-green-100 rounded-md p-3">
              <HeroIcons.CurrencyDollarIcon class="h-6 w-6 text-green-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Toplam Kazanç
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ formatPrice(stats.sales) }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Products Card -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-primary-100 rounded-md p-3">
              <HeroIcons.ShoppingBagIcon class="h-6 w-6 text-primary-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Toplam Ürün
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ stats.products || 0 }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Rating Card -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <HeroIcons.StarIcon class="h-6 w-6 text-blue-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Mağaza Puanı
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ stats.rating.toFixed(1) }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Orders Card -->
      <NuxtLink
        to="/vendor/orders"
        class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
      >
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-yellow-100 rounded-md p-3">
              <HeroIcons.ShoppingCartIcon class="h-6 w-6 text-yellow-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Bekleyen Siparişler
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ stats.pendingOrders || 0 }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Recent Activity -->
      <div>
        <h2 class="text-lg font-medium text-gray-900 mb-4">
          Son Aktiviteler
        </h2>
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <ul
            v-if="recentActivities.length > 0"
            class="divide-y divide-gray-200"
          >
            <li
              v-for="activity in recentActivities"
              :key="activity.id"
            >
              <div class="px-4 py-4 sm:px-6">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-primary-600 truncate">
                    {{ activity.title }}
                  </p>
                  <div class="ml-2 flex-shrink-0 flex">
                    <p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {{ activity.status }}
                    </p>
                  </div>
                </div>
                <div class="mt-2 sm:flex sm:justify-between">
                  <div class="sm:flex">
                    <p class="flex items-center text-sm text-gray-500">
                      {{ activity.description }}
                    </p>
                  </div>
                  <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <HeroIcons.CalendarIcon class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    <p>{{ formatDate(activity.createdAt) }}</p>
                  </div>
                </div>
              </div>
            </li>
          </ul>
          <div
            v-else
            class="p-4 text-center text-gray-500"
          >
            Henüz aktivite bulunmuyor.
          </div>
        </div>
      </div>

      <!-- Ecosystem Section -->
      <div>
        <h2 class="text-lg font-medium text-gray-900 mb-4">
          Eko-Sistem Paneli
        </h2>
        <div
          v-if="myEcosystem"
          class="bg-white shadow rounded-lg p-6"
        >
          <div class="flex items-center justify-between">
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
        </div>
        <div
          v-else
          class="bg-indigo-600 rounded-lg p-6 text-white"
        >
          <h3 class="text-lg font-bold mb-2">Özel Bayi Ağınızı Kurun</h3>
          <p class="text-indigo-100 text-sm mb-4">Bayilerinize özel fiyatlar ve kataloglar sunun.</p>
          <button
            @click="createDefaultEcosystem"
            class="bg-white text-indigo-600 px-4 py-2 rounded-md font-bold text-sm hover:bg-indigo-50"
          >
            Ekosistem Oluştur
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as HeroIcons from '@heroicons/vue/24/outline'
import { useVendorDashboard } from '~/composables/useVendorDashboard'

definePageMeta({
  layout: 'vendor',
  middleware: 'vendor'
})

useHead({
  title: 'Satıcı Paneli - BarterBorsa'
})

const { stats, recentActivities, myEcosystem, fetchStats, fetchEcosystemStatus, createDefaultEcosystem } = useVendorDashboard()

// Use useAsyncData for SSR
const { pending } = await useAsyncData('vendor-dashboard', async () => {
  await Promise.all([
    fetchStats(),
    fetchEcosystemStatus()
  ])
  return true
})

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(value || 0)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>