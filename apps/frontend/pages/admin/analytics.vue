<template>
  <div class="px-4 py-6 sm:px-0">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">
        Analitik Dashboard
      </h1>
      <div class="flex items-center gap-3">
        <NuxtLink
          to="/admin/analytics/olap"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none uppercase tracking-widest"
        >
          🚀 Advanced Insights (ClickHouse)
        </NuxtLink>
        <NuxtLink
          to="/admin"
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          ← Geri Dön
        </NuxtLink>
      </div>
    </div>

    <!-- Overview Cards -->
    <div
      v-if="!loading && data.overview"
      class="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8"
    >
      <div class="bg-white overflow-hidden shadow rounded-lg border-l-4 border-primary-600">
        <div class="px-4 py-5 sm:p-6">
          <dt class="text-sm font-medium text-gray-500 truncate">
            Toplam Sayfa Görüntüleme (Son 30 Gün)
          </dt>
          <dd class="mt-1 text-3xl font-semibold text-gray-900">
            {{ formatNumber(data.overview.totalPageViews)
            }}
          </dd>
        </div>
      </div>
      <div class="bg-white overflow-hidden shadow rounded-lg border-l-4 border-indigo-600">
        <div class="px-4 py-5 sm:p-6">
          <dt class="text-sm font-medium text-gray-500 truncate">
            Tekil Ziyaretçi (Session)
          </dt>
          <dd class="mt-1 text-3xl font-semibold text-gray-900">
            {{ formatNumber(data.overview.uniqueVisitors)
            }}
          </dd>
        </div>
      </div>
      <div class="bg-white overflow-hidden shadow rounded-lg border-l-4 border-green-600">
        <div class="px-4 py-5 sm:p-6">
          <dt class="text-sm font-medium text-gray-500 truncate">
            Toplam Olay (Event Hacmi)
          </dt>
          <dd class="mt-1 text-3xl font-semibold text-gray-900">
            {{ formatNumber(data.overview.totalEvents) }}
          </dd>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex justify-center items-center h-64"
    >
      <div class="spinner h-10 w-10 text-primary-600" />
    </div>

    <!-- Charts -->
    <div
      v-else-if="data.charts"
      class="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      <!-- Timeline Chart (Spans 2 columns on large screens) -->
      <div class="lg:col-span-2 bg-white shadow rounded-lg p-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Günlük Aktivite Eğilimi
        </h3>
        <ClientOnly>
          <apexchart
            type="area"
            height="350"
            :options="areaChartOptions"
            :series="areaChartSeries"
          />
        </ClientOnly>
      </div>

      <!-- Donut Chart -->
      <div class="bg-white shadow rounded-lg p-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Etkileşim Dağılımı
        </h3>
        <ClientOnly>
          <apexchart
            type="donut"
            height="350"
            :options="donutChartOptions"
            :series="donutChartSeries"
          />
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

definePageMeta({
    layout: 'admin',
    middleware: 'admin'
})

const { $api } = useApi()
const loading = ref(true)
const data = ref({
    overview: null,
    charts: {
        daily: [],
        distribution: []
    }
})

// Formatting
const formatNumber = (value) => {
    return new Intl.NumberFormat('tr-TR').format(value || 0)
}

// Fetch Logic
const fetchAnalytics = async () => {
    try {
        const res = await $api('/api/v1/admin/analytics?days=30')
        if (res && res.success) {
            data.value = res.data
        }
    } catch (err) {
        console.error('Failed to fetch analytics', err)
    } finally {
        loading.value = false
    }
}

// Chart Configurations
const areaChartSeries = computed(() => {
    return [
        {
            name: 'Sayfa Görüntüleme',
            data: data.value.charts.daily.map(d => d.PAGE_VIEW)
        },
        {
            name: 'Tıklamalar',
            data: data.value.charts.daily.map(d => d.CLICK)
        },
        {
            name: 'Diğer İşlemler',
            data: data.value.charts.daily.map(d => d.OTHER)
        }
    ]
})

const areaChartOptions = computed(() => {
    return {
        chart: {
            type: 'area',
            fontFamily: 'inherit',
            toolbar: { show: false },
            zoom: { enabled: false }
        },
        colors: ['#0ea5e9', '#8b5cf6', '#10b981'],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        xaxis: {
            categories: data.value.charts.daily.map(d => {
                const dateObj = new Date(d.date)
                return `${dateObj.getDate()} ${dateObj.toLocaleString('tr-TR', { month: 'short' })}`
            }),
            tooltip: { enabled: false }
        },
        yaxis: {
            min: 0,
            labels: {
                formatter: (val) => Math.floor(val)
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.05,
                stops: [0, 100]
            }
        },
        legend: { position: 'top', horizontalAlign: 'right' }
    }
})

const donutChartSeries = computed(() => {
    return data.value.charts.distribution.map(item => item.value)
})

const donutChartOptions = computed(() => {
    return {
        chart: {
            type: 'donut',
            fontFamily: 'inherit'
        },
        labels: data.value.charts.distribution.map(item => item.name.replace('_', ' ')),
        colors: ['#0ea5e9', '#8b5cf6', '#84cc16', '#f59e0b', '#f43f5e'],
        legend: { position: 'bottom' },
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                    labels: {
                        show: true,
                        name: { show: true },
                        value: { show: true, formatter: (val) => formatNumber(val) },
                        total: {
                            show: true,
                            label: 'Toplam',
                            formatter: () => formatNumber(data.value.overview?.totalEvents)
                        }
                    }
                }
            }
        }
    }
})

onMounted(() => {
    fetchAnalytics()
})
</script>

<style scoped>
.spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-left-color: currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
