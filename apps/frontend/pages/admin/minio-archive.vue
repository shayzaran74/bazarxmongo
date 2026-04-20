<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 mb-6">
      MinIO Arşivi
    </h2>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">
          Toplam Dosya
        </p>
        <p class="text-2xl font-bold">
          {{ stats.totalFiles || 0 }}
        </p>
      </div>
      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">
          Son Arşivlenen
        </p>
        <p class="text-lg font-semibold">
          {{ stats.lastArchiveDate || '-' }}
        </p>
      </div>
      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">
          Hizmet Durumu
        </p>
        <p class="text-lg font-semibold text-green-600">
          Aktif
        </p>
      </div>
    </div>

    <!-- Filters & Actions -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex gap-4">
        <select
          v-model="filterCategory"
          class="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          <option value="">
            Tüm Kategoriler
          </option>
          <option value="financial">
            Finansal
          </option>
          <option value="system">
            Sistem
          </option>
          <option value="legal">
            Hukuki
          </option>
          <option value="trade">
            Takas
          </option>
        </select>
        <button
          class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition flex items-center"
          @click="fetchLogs"
        >
          <ArrowPathIcon
            class="h-4 w-4 mr-2"
            :class="{ 'animate-spin': loading }"
          />
          Yenile
        </button>
      </div>
    </div>

    <!-- Logs Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div
        v-if="loading"
        class="p-8 text-center text-gray-500"
      >
        <div
          class="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
        />
        Arşivler yükleniyor...
      </div>
      <div
        v-else-if="logs.length === 0"
        class="p-8 text-center text-gray-500"
      >
        Arşivlenmiş dosya bulunmuyor.
      </div>
      <table
        v-else
        class="min-w-full divide-y divide-gray-200"
      >
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dosya
              Adı
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kategori
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Boyut
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tarih
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              İşlem
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="log in logs"
            :key="log.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <DocumentIcon class="h-5 w-5 text-gray-400 mr-3" />
                <span class="text-sm font-medium text-gray-900">{{ log.fileName }}</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="px-2 py-1 text-xs font-semibold rounded-full"
                :class="getCategoryClass(log.category)"
              >
                {{ getCategoryLabel(log.category) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatSize(log.fileSize) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(log.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <a
                :href="log.viewUrl"
                target="_blank"
                class="inline-flex items-center text-blue-600 hover:text-blue-900 font-bold"
              >
                <ArrowDownTrayIcon class="h-4 w-4 mr-1" />
                İndir
              </a>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div
        v-if="pagination.total > pagination.limit"
        class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between"
      >
        <div class="text-sm text-gray-700">
          Toplam <strong>{{ pagination.total }}</strong> kayıttan <strong>{{ (pagination.page - 1) *
            pagination.limit + 1 }}</strong> - <strong>{{ Math.min(pagination.page * pagination.limit,
                                                                 pagination.total) }}</strong> arası gösteriliyor
        </div>
        <div class="flex space-x-2">
          <button
            :disabled="pagination.page === 1"
            class="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm disabled:opacity-50"
            @click="changePage(pagination.page - 1)"
          >
            Geri
          </button>
          <button
            :disabled="pagination.page * pagination.limit >= pagination.total"
            class="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm disabled:opacity-50"
            @click="changePage(pagination.page + 1)"
          >
            İleri
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
    ArrowPathIcon,
    DocumentIcon,
    ArrowDownTrayIcon,
    
} from '@heroicons/vue/24/outline'

definePageMeta({
    layout: 'admin', middleware: 'super-admin'
})

const { $api } = useApi()
const toast = useNuxtApp().$toast

const logs = ref([])
const loading = ref(true)
const filterCategory = ref('')
const stats = ref({
    totalFiles: 0,
    lastArchiveDate: '-'
})
const pagination = ref({
    page: 1,
    limit: 20,
    total: 0
})

const fetchLogs = async () => {
    loading.value = true
    try {
        const response = await $api('/api/v1/admin/logs/archived', {
            params: {
                page: pagination.value.page,
                limit: pagination.value.limit,
                category: filterCategory.value
            }
        })

        if (response.success) {
            logs.value = response.data
            pagination.value.total = response.pagination.total

            // Get stats as well
            const statsRes = await $api('/api/v1/admin/logs/stats')
            if (statsRes.success) {
                stats.value = statsRes.stats
            }
        }
    } catch (error) {
        console.error('Fetch logs error:', error)
        toast.error('Dosyalar yüklenirken bir hata oluştu.')
    } finally {
        loading.value = false
    }
}

const changePage = (newPage) => {
    pagination.value.page = newPage
    fetchLogs()
}

const formatSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (date) => {
    return new Date(date).toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const getCategoryLabel = (cat) => {
    const labels = {
        FINANCIAL: 'Finansal',
        SYSTEM_LOG: 'Sistem',
        LEGAL: 'Hukuki',
        TRADE_PROOF: 'Takas'
    }
    return labels[cat] || cat
}

const getCategoryClass = (cat) => {
    switch (cat) {
        case 'FINANCIAL': return 'bg-green-100 text-green-800'
        case 'SYSTEM_LOG': return 'bg-blue-100 text-blue-800'
        case 'LEGAL': return 'bg-purple-100 text-purple-800'
        case 'TRADE_PROOF': return 'bg-orange-100 text-orange-800'
        default: return 'bg-gray-100 text-gray-800'
    }
}

watch(filterCategory, () => {
    pagination.value.page = 1
    fetchLogs()
})

onMounted(() => {
    fetchLogs()
})
</script>
