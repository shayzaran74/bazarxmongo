<template>
  <div class="p-8 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          📦 Aktarımlar
        </h1>
        <p class="text-gray-600 mt-1">
          Excel ile toplu ürün yükleyin ve envanterinizi yönetin
        </p>
      </div>
      <div class="flex gap-4">
        <button
          class="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold flex items-center"
          :disabled="uploading"
          @click="triggerFileInput"
        >
          <ArrowUpTrayIcon
            v-if="!uploading"
            class="h-5 w-5 mr-2"
          />
          <div
            v-else
            class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"
          />
          {{ uploading ? 'Yükleniyor...' : 'Excel ile Ürün Yükle' }}
        </button>
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          accept=".xlsx, .xls"
          @change="handleFileUpload"
        >
      </div>
    </div>

    <!-- Stats/Info -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div class="flex items-center text-blue-600 mb-2">
          <DocumentTextIcon class="h-6 w-6 mr-2" />
          <span class="font-semibold text-lg">Örnek Şablon</span>
        </div>
        <p class="text-gray-600 text-sm">
          Trendyol uyumlu Excel şablonlarını kullanarak binlerce ürünü saniyeler içinde
          yükleyebilirsiniz.
        </p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div class="flex items-center text-green-600 mb-2">
          <CheckCircleIcon class="h-6 w-6 mr-2" />
          <span class="font-semibold text-lg">Otomatik Eşleme</span>
        </div>
        <p class="text-gray-600 text-sm">
          Ürün adı, fiyat, stok ve görseller otomatik olarak sistemimizle eşleştirilir.
        </p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div class="flex items-center text-orange-600 mb-2">
          <ClockIcon class="h-6 w-6 mr-2" />
          <span class="font-semibold text-lg">Onay Süreci</span>
        </div>
        <p class="text-gray-600 text-sm">
          Yüklenen ürünler 'Onay Bekliyor' olarak kaydedilir ve admin onayından sonra
          satışa çıkar.
        </p>
      </div>
    </div>

    <!-- Import Results -->
    <div
      v-if="importResults"
      class="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h2 class="text-lg font-bold text-gray-900">
          Son Yükleme Sonucu
        </h2>
        <button
          class="text-gray-400 hover:text-gray-600"
          @click="importResults = null"
        >
          ✕
        </button>
      </div>
      <div class="p-6 grid grid-cols-3 gap-8">
        <div class="text-center">
          <div class="text-3xl font-bold text-green-600">
            {{ importResults.results.success }}
          </div>
          <div class="text-sm text-gray-500 uppercase tracking-wider font-semibold">
            Başarılı
          </div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-red-600">
            {{ importResults.results.failed }}
          </div>
          <div class="text-sm text-gray-500 uppercase tracking-wider font-semibold">
            Hatalı
          </div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-primary-600">
            {{ importResults.results.success +
              importResults.results.failed }}
          </div>
          <div class="text-sm text-gray-500 uppercase tracking-wider font-semibold">
            Toplam
          </div>
        </div>
      </div>
      <div
        v-if="importResults.results.errors.length > 0"
        class="p-6 border-t border-gray-100 bg-red-50"
      >
        <h3 class="text-sm font-bold text-red-800 mb-2">
          Hata Detayları:
        </h3>
        <ul class="text-xs text-red-700 space-y-1">
          <li
            v-for="(err, idx) in importResults.results.errors.slice(0, 10)"
            :key="idx"
          >
            • {{ err }}
          </li>
          <li v-if="importResults.results.errors.length > 10">
            ... ve {{ importResults.results.errors.length - 10 }} hata
            daha
          </li>
        </ul>
      </div>
    </div>

    <!-- Transfers Table -->
    <div class="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div class="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 class="text-xl font-bold text-gray-900">
          Son Aktarımlar
        </h2>
      </div>

      <div
        v-if="loading"
        class="flex justify-center items-center py-20"
      >
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>

      <div
        v-else-if="transfers.length === 0"
        class="flex flex-col items-center py-20 bg-gray-50"
      >
        <div class="bg-gray-100 p-6 rounded-full mb-4">
          <ArrowsRightLeftIcon class="h-12 w-12 text-gray-400" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900">
          Henüz aktarım bulunmuyor
        </h3>
        <p class="text-gray-500 mb-6">
          İlk ürün aktarımınızı Excel dosyası yükleyerek başlatın.
        </p>
        <button
          class="text-primary-600 font-bold hover:underline"
          @click="triggerFileInput"
        >
          Dosya Yükle →
        </button>
      </div>

      <div
        v-else
        class="overflow-x-auto"
      >
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 text-left">
              <th class="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                No
              </th>
              <th class="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                Durum
              </th>
              <th class="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                Hedef
              </th>
              <th class="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                Ürün Sayısı
              </th>
              <th class="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                Tarih
              </th>
              <th class="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider text-right">
                İşlem
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="tr in transfers"
              :key="tr.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 text-sm font-bold text-gray-900">
                {{ tr.transferNumber }}
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-bold uppercase',
                    tr.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    tr.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                  ]"
                >
                  {{ tr.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ tr.toLocation }}
              </td>
              <td class="px-6 py-4 text-sm font-semibold text-gray-900">
                {{ tr._count?.items || 0 }} ürün
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ formatDate(tr.createdAt) }}
              </td>
              <td class="px-6 py-4 text-right">
                <button class="text-primary-600 hover:text-primary-800 font-bold">
                  Detay
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowsRightLeftIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { $api } = useApi()
const toast = useNuxtApp().$toast

const fileInput = ref(null)
const uploading = ref(false)
const loading = ref(false)
const transfers = ref([])
const importResults = ref(null)

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  uploading.value = true
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await $api('/api/admin/transfers/import-excel', {
      method: 'POST',
      body: formData
    })

    if (response.success) {
      toast.success('Excel başarıyla işlendi!')
      importResults.value = response
      await fetchTransfers()
    } else {
      toast.error(response.error || 'Yükleme başarısız')
      importResults.value = null
    }
  } catch (error) {
    console.error('Upload error:', error)
    if (error.data && error.data.error) {
      toast.error(error.data.error)
    } else {
      toast.error('Dosya yüklenirken bir hata oluştu')
    }
    importResults.value = null
  } finally {
    uploading.value = false
    event.target.value = '' // Reset input
  }
}

const fetchTransfers = async () => {
  loading.value = true
  try {
    const response = await $api('/api/admin/transfers')
    if (response.success) {
      transfers.value = response.data
    }
  } catch (error) {
    console.error('Fetch transfers error:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchTransfers()
})
</script>
