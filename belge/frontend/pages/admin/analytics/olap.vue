<template>
  <div class="admin-olap-analytics py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
            <span class="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
              <PresentationChartLineIcon class="h-6 w-6" />
            </span>
            ClickHouse Insight <span class="text-indigo-600 font-light text-sm tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 ml-2">PREMIUM OLAP</span>
          </h1>
          <p class="text-slate-500 mt-2 font-medium">
            Büyük veri analizi ve pazar yeri ısı haritası platformu
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button
            :disabled="loading"
            class="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            @click="fetchData"
          >
            <ArrowPathIcon :class="['h-4 w-4', loading ? 'animate-spin' : '']" />
            Verileri Yenile
          </button>
          <NuxtLink
            to="/admin/analytics"
            class="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
          >
            Standart Analitik
          </NuxtLink>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div
          v-for="stat in quickStats"
          :key="stat.label" 
          class="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform group"
        >
          <div class="flex items-center justify-between mb-4">
            <div :class="`p-3 rounded-2xl ${stat.bg} ${stat.color} shadow-inner`">
              <component
                :is="stat.icon"
                class="h-6 w-6"
              />
            </div>
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ stat.label }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-2xl font-black text-slate-900 tracking-tighter">{{ stat.value }}</span>
            <span :class="`text-xs font-bold mt-1 ${stat.trendColor}`">{{ stat.trend }}</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Marketplace Heatmap -->
        <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/60 p-8 flex flex-col h-[500px]">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h3 class="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <MapIcon class="h-5 w-5 text-indigo-500" />
                Şehir Bazlı Talep Yoğunluğu
              </h3>
              <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                Marketplace Heatmap
              </p>
            </div>
            <div class="flex gap-2">
              <span
                v-for="l in ['Düşük', 'Orta', 'Yüksek']"
                :key="l"
                class="text-[10px] font-bold text-slate-400 uppercase"
              >{{ l }}</span>
            </div>
          </div>
          
          <div class="flex-1 min-h-0 flex items-center justify-center">
            <ClientOnly>
              <apexchart
                type="bar"
                height="100%"
                width="100%"
                :options="heatmapOptions"
                :series="heatmapSeries"
              />
            </ClientOnly>
          </div>
        </div>

        <!-- Trend Analysis -->
        <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/60 p-8 flex flex-col h-[500px]">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h3 class="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <SparklesIcon class="h-5 w-5 text-purple-500" />
                Kategori Trend Analizi
              </h3>
              <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                Event-Based Trends (High Velocity)
              </p>
            </div>
          </div>
          
          <div class="flex-1 min-h-0">
            <ClientOnly>
              <apexchart
                type="line"
                height="100%"
                width="100%"
                :options="trendOptions"
                :series="trendSeries"
              />
            </ClientOnly>
          </div>
        </div>
      </div>

      <!-- Anomaly Reports Table -->
      <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/60 overflow-hidden">
        <div class="p-8 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h3 class="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldExclamationIcon class="h-5 w-5 text-rose-500" />
              Anomali ve Güvenlik Alarmları
            </h3>
            <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
              Real-time Anomaly Detection
            </p>
          </div>
          <div class="flex gap-2">
            <span class="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase">{{ anomalies.length }} ALARM</span>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/50">
                <th class="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Şerit/Etkinlik
                </th>
                <th class="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Bölge / IP
                </th>
                <th class="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Şiddet
                </th>
                <th class="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Durum
                </th>
                <th class="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Zaman
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, i) in anomalies"
                :key="i"
                class="border-b border-slate-50 hover:bg-slate-50/30 transition-colors"
              >
                <td class="px-8 py-5">
                  <div class="flex flex-col">
                    <span class="text-sm font-black text-slate-800">{{ item.activity }}</span>
                    <span class="text-[10px] text-slate-400 font-bold">{{ item.type }}</span>
                  </div>
                </td>
                <td class="px-8 py-5">
                  <span class="text-xs font-bold text-slate-600">{{ item.location || 'Bilinmiyor' }}</span>
                </td>
                <td class="px-8 py-5">
                  <span :class="`px-2 py-1 rounded-md text-[9px] font-black uppercase ${getSeverityClass(item.severity)}`">
                    {{ item.severity }}
                  </span>
                </td>
                <td class="px-8 py-5">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span class="text-[10px] font-bold text-slate-500 italic">İnceleniyor</span>
                  </div>
                </td>
                <td class="px-8 py-5 text-right">
                  <span class="text-[10px] font-black text-slate-400">{{ formatTime(item.timestamp) }}</span>
                </td>
              </tr>
              <tr v-if="anomalies.length === 0">
                <td
                  colspan="5"
                  class="px-8 py-20 text-center"
                >
                  <div class="flex flex-col items-center gap-2 text-slate-300">
                    <CheckCircleIcon class="h-12 w-12" />
                    <span class="text-sm font-bold uppercase tracking-widest">Anomalous aktivite tespit edilmedi</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  PresentationChartLineIcon, 
  ArrowPathIcon,
  MapIcon,
  SparklesIcon,
  ShieldExclamationIcon,
  UsersIcon,
      BoltIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/solid'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { $api } = useApi()
const loading = ref(false)
const heatmapData = ref([])
const trendData = ref([])
const anomalies = ref([])

const quickStats = ref([
  { label: 'Live Sessions', value: '429', icon: UsersIcon, bg: 'bg-blue-50', color: 'text-blue-600', trend: '+12% vs last hour', trendColor: 'text-green-500' },
  { label: 'Event Throughput', value: '1.2k/min', icon: BoltIcon, bg: 'bg-amber-50', color: 'text-amber-600', trend: 'Stable', trendColor: 'text-slate-400' },
  { label: 'Unique Locations', value: '81 Şehir', icon: MapIcon, bg: 'bg-emerald-50', color: 'text-emerald-600', trend: '+3 New', trendColor: 'text-emerald-500' },
  { label: 'Heat Score', value: '8.4', icon: SparklesIcon, bg: 'bg-purple-50', color: 'text-purple-600', trend: 'Growing', trendColor: 'text-purple-500' }
])

const fetchData = async () => {
  loading.value = true
  try {
    // 1. Fetch Heatmap
    const heatmapRes = await $api('/api/admin/analytics/heatmap')
    if (heatmapRes.success) heatmapData.value = heatmapRes.data

    // 2. Fetch Trends
    const trendRes = await $api('/api/admin/analytics/trends-heavy')
    if (trendRes.success) trendData.value = trendRes.data

    // 3. Fetch Anomalies
    const anomalyRes = await $api('/api/admin/analytics/anomalies')
    if (anomalyRes.success) anomalies.value = anomalyRes.data.alerts || []
    
  } catch (error) {
    console.error('Error fetching OLAP data:', error)
  } finally {
    loading.value = false
  }
}

// Charts Config
const heatmapSeries = computed(() => [{
  name: 'İşlem Yoğunluğu',
  data: heatmapData.value.map(d => d.total_actions)
}])

const heatmapOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
  plotOptions: { bar: { borderRadius: 10, columnWidth: '50%', distributed: true } },
  colors: ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'],
  dataLabels: { enabled: false },
  xaxis: { 
    categories: heatmapData.value.map(d => d.city),
    labels: { style: { fontWeight: 900, fontSize: '10px' } }
  },
  yaxis: { labels: { show: false } },
  grid: { show: false }
}))

const trendSeries = computed(() => {
  const dates = trendDates.value
  const categories = [...new Set(trendData.value.map(d => d.category))].slice(0, 5) // Top 5 categories
  
  return categories.map(cat => ({
    name: cat,
    data: dates.map(date => {
      const match = trendData.value.find(d => d.category === cat && d.event_date === date)
      return match ? match.action_count : 0
    })
  }))
})

const trendDates = computed(() => {
  return [...new Set(trendData.value.map(d => d.event_date))].sort()
})

const trendOptions = computed(() => {
  const formattedDates = trendDates.value.map(d => {
    const date = new Date(d)
    return `${date.getDate()} ${date.toLocaleString('tr-TR', { month: 'short' })}`
  })
  
  return {
    chart: { type: 'line', toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'Inter, sans-serif' },
    colors: ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#fcd34d'],
    stroke: { width: 3, curve: 'smooth' },
    xaxis: { 
      categories: formattedDates, 
      labels: { style: { fontWeight: 900, fontSize: '10px' } } 
    },
    legend: { position: 'top', horizontalAlign: 'right', fontWeight: 900, fontSize: '10px' }
  }
})

const getSeverityClass = (sev) => {
  if (sev === 'CRITICAL') return 'bg-rose-100 text-rose-600'
  if (sev === 'HIGH') return 'bg-orange-100 text-orange-600'
  return 'bg-amber-100 text-amber-600'
}

const formatTime = (ts) => {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

onMounted(fetchData)
</script>
