<template>
  <div class="px-4 py-6 sm:px-0">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          Pazarlama Performansı
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          Gerçek zamanlı analiz ve kampanya yönetimi
        </p>
      </div>
    </div>

    <!-- Real Time Stats -->
    <AnalyticsRealTimeWidget />

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Channel Breakdown -->
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Kanal Performansı (Satış Kaynağı)
        </h3>
        <div class="overflow-hidden">
          <ul class="divide-y divide-gray-200">
            <li
              v-for="channel in channels"
              :key="channel.source"
              class="py-3 flex justify-between items-center"
            >
              <div class="flex items-center">
                <span
                  class="inline-block h-2 w-2 rounded-full mr-3"
                  :class="channel.source.includes('google') ? 'bg-blue-400' :
                    channel.source.includes('instagram') ? 'bg-pink-400' :
                    channel.source === 'Direct / Organic' ? 'bg-gray-400' : 'bg-green-400'"
                />
                <span class="text-sm font-medium text-gray-700">{{ channel.source }}</span>
              </div>
              <div class="text-right">
                <div class="text-sm font-bold text-gray-900">
                  {{ formatCurrency(channel.revenue) }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ channel.count }} sipariş
                </div>
              </div>
            </li>
            <li
              v-if="channels.length === 0"
              class="text-center text-gray-500 py-4 text-sm"
            >
              Veri bulunamadı.
            </li>
          </ul>
        </div>
      </div>

      <!-- User Trends (Placeholder for now) -->
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Kullanıcı Trendleri (Son 24s)
        </h3>
        <div class="h-64 flex items-end space-x-2">
          <div
            v-for="(point, i) in trends"
            :key="i"
            class="bg-indigo-200 hover:bg-indigo-300 w-full rounded-t"
            :style="{ height: `${(point.count / maxTrend) * 100}%` }"
            :title="point.time + ': ' + point.count"
          />
        </div>
        <div class="flex justify-between text-xs text-gray-400 mt-2">
          <span>24s önce</span>
          <span>Şimdi</span>
        </div>
      </div>
    </div>

    <!-- Campaign Manager -->
    <AnalyticsCampaignManager />
  </div>
</template>

<script setup>
definePageMeta({
    layout: 'admin',
    middleware: 'admin'
})

useHead({
    title: 'Pazarlama Analitiği - Admin Paneli'
})

const { getChannelBreakdown, getUserTrends } = useAnalytics()
const channels = ref([])
const trends = ref([])

const maxTrend = computed(() => {
    return Math.max(...trends.value.map(t => t.count), 1)
})

const fetchData = async () => {
    try {
        const [cRes, tRes] = await Promise.all([
            getChannelBreakdown(),
            getUserTrends()
        ])
        if (cRes.success) channels.value = cRes.data
        if (tRes.success) trends.value = tRes.data
    } catch (e) {
        console.error(e)
    }
}

const formatCurrency = (val) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val)
}

onMounted(() => {
    fetchData()
})
</script>
