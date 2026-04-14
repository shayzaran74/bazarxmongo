<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div class="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-4 text-white shadow-lg">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-indigo-100 text-sm font-medium">
            Aktif Kullanıcılar (Son 30dk)
          </p>
          <h3 class="text-3xl font-bold mt-1">
            {{ stats.activeUsers }}
          </h3>
        </div>
        <div class="bg-indigo-400 bg-opacity-30 p-2 rounded-full">
          <UsersIcon class="h-6 w-6 text-white animate-pulse" />
        </div>
      </div>
      <p class="text-indigo-200 text-xs mt-2">
        Anlık site trafiği
      </p>
    </div>

    <div class="bg-white rounded-lg p-4 shadow border border-gray-100">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-gray-500 text-sm font-medium">
            Bugünkü Görüntülenme
          </p>
          <h3 class="text-3xl font-bold mt-1 text-gray-900">
            {{ stats.pageViews }}
          </h3>
        </div>
        <div class="bg-blue-50 p-2 rounded-full">
          <EyeIcon class="h-6 w-6 text-blue-600" />
        </div>
      </div>
      <p class="text-green-600 text-xs mt-2 flex items-center">
        <ArrowTrendingUpIcon class="h-3 w-3 mr-1" />
        Canlı veri
      </p>
    </div>

    <div class="bg-white rounded-lg p-4 shadow border border-gray-100">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-gray-500 text-sm font-medium">
            Bugünkü Siparişler
          </p>
          <h3 class="text-3xl font-bold mt-1 text-gray-900">
            {{ stats.orders }}
          </h3>
        </div>
        <div class="bg-green-50 p-2 rounded-full">
          <ShoppingBagIcon class="h-6 w-6 text-green-600" />
        </div>
      </div>
      <p class="text-gray-400 text-xs mt-2">
        Günlük performans
      </p>
    </div>
  </div>
</template>

<script setup>
import { UsersIcon, EyeIcon, ShoppingBagIcon, ArrowTrendingUpIcon } from '@heroicons/vue/24/solid'

const { getRealTimeStats } = useAnalytics()
const stats = ref({ activeUsers: 0, pageViews: 0, orders: 0 })
let timer = null

const fetch = async () => {
    try {
        const res = await getRealTimeStats()
        if (res.success) {
            stats.value = res.data
        }
    } catch (e) {
        // silent fail
    }
}

onMounted(() => {
    fetch()
    timer = setInterval(fetch, 30000) // Refresh every 30s
})

onUnmounted(() => {
    if (timer) clearInterval(timer)
})
</script>
