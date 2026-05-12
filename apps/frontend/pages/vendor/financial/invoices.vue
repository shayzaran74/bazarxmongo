<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 italic uppercase italic tracking-tighter">
          Finansal Raporlar
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          Aylık barter komisyon mutabakat raporlarınız ve faturalarınız.
        </p>
      </div>
      <button 
        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all shadow-sm" 
        @click="fetchInvoices"
      >
        <ArrowPathIcon
          class="h-4 w-4 mr-2"
          :class="{ 'animate-spin': loading }"
        />
        Yenile
      </button>
    </div>

    <!-- Stats Summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <p class="text-xs font-black text-gray-400 uppercase tracking-widest">
            Kayıtlı Rapor
          </p>
          <DocumentTextIcon class="h-5 w-5 text-indigo-500" />
        </div>
        <p class="text-3xl font-black mt-2">
          {{ invoices.length }}
        </p>
      </div>
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <p class="text-xs font-black text-gray-400 uppercase tracking-widest">
            Son Ay Komisyon
          </p>
          <CurrencyDollarIcon class="h-5 w-5 text-green-500" />
        </div>
        <p class="text-3xl font-black mt-2">
          ₺{{ formatAmount(lastMonthAmount) }}
        </p>
      </div>
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <p class="text-xs font-black text-gray-400 uppercase tracking-widest">
            Durum
          </p>
          <CheckBadgeIcon class="h-5 w-5 text-blue-500" />
        </div>
        <p class="text-xl font-black mt-2 text-blue-600">
          MUTABIK
        </p>
      </div>
    </div>

    <!-- Invoices List -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest"
              >
                Dönem
              </th>
              <th
                scope="col"
                class="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest"
              >
                Fatura No / Dosya
              </th>
              <th
                scope="col"
                class="px-6 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest"
              >
                Tutar (TL)
              </th>
              <th
                scope="col"
                class="px-6 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest"
              >
                İşlem
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <template v-if="loading">
              <tr
                v-for="i in 3"
                :key="i"
                class="animate-pulse"
              >
                <td class="px-6 py-4">
                  <div class="h-4 bg-gray-100 rounded w-24" />
                </td>
                <td class="px-6 py-4">
                  <div class="h-4 bg-gray-100 rounded w-32" />
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="h-4 bg-gray-100 rounded w-16 ml-auto" />
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="h-8 bg-gray-100 rounded w-20 ml-auto" />
                </td>
              </tr>
            </template>
            <template v-else-if="invoices.length > 0">
              <tr
                v-for="invoice in invoices"
                :key="invoice.id"
                class="hover:bg-gray-50/50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <span class="text-sm font-bold text-gray-900 italic">
                      {{ getMonthNameFromDate(invoice.issuedAt) }} {{ getYearFromDate(invoice.issuedAt) }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-col">
                    <span class="text-xs font-medium text-gray-600 truncate max-w-[200px]">{{ invoice.invoiceNumber }}</span>
                    <span class="text-[10px] text-gray-400 uppercase tracking-tighter">{{ invoice.status }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <span class="text-sm font-black text-gray-900">₺{{ formatAmount(invoice.totalAmount) }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a 
                    :href="invoice.pdfUrl" 
                    target="_blank"
                    class="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md transition-colors"
                  >
                    <EyeIcon class="h-4 w-4 mr-1.5" />
                    Görüntüle
                  </a>
                </td>
              </tr>
            </template>
            <tr v-else>
              <td
                colspan="4"
                class="px-6 py-12 text-center"
              >
                <div class="flex flex-col items-center">
                  <div class="p-3 bg-gray-50 rounded-full mb-3">
                    <DocumentArrowDownIcon class="h-8 w-8 text-gray-300" />
                  </div>
                  <p class="text-sm text-gray-500">
                    Henüz yayınlanmış bir fatura bulunmuyor.
                  </p>
                  <p class="text-[10px] text-gray-400 mt-1 uppercase italic">
                    Fatura kesim tarihleri her ayın 1. günüdür.
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Info Footer -->
    <div class="bg-indigo-50 p-4 rounded-xl flex items-start space-x-3">
      <InformationCircleIcon class="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
      <div class="text-xs text-indigo-700 leading-relaxed font-medium">
        <p class="font-bold uppercase tracking-wider mb-1">
          Bilgilendirme
        </p>
        Bu raporlar, platform üzerindeki barter takas komisyonlarınızı içerir. 
        Her ayın başında sistem tarafından otomatik olarak oluşturulur. 
        Görüntüleme linkleri güvenlik gereği süreli (presigned) URL'lerdir, 
        yenilemek için sayfayı tazeleyebilirsiniz.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  ArrowPathIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon, 
  CheckBadgeIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'vendor',
  middleware: 'vendor'
})

interface Invoice {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  pdfUrl: string;
  status: string;
  issuedAt: string | Date;
}

const loading = ref<boolean>(false)
const invoices = ref<Invoice[]>([])

const fetchInvoices = async () => {
  loading.value = true
  try {
    const { $api } = useApi()
    const res = await $api<any>('/api/vendors/invoices')
    if (res.success && res.data) {
      invoices.value = res.data.items || []
    }
  } catch (err: unknown) {
    console.error('Failed to fetch invoices:', err)
    const error = err as { data?: { error?: string }; message?: string };
    useNuxtApp().$toast.error(error.data?.error || error.message || 'Faturalar yüklenemedi')
  } finally {
    loading.value = false
  }
}

const lastMonthAmount = computed(() => {
  if (!invoices.value || invoices.value.length === 0) return 0
  return invoices.value[0].totalAmount || 0
})

const getMonthNameFromDate = (dateStr?: string | Date) => {
  if (!dateStr) return 'Bilinmeyen'
  const date = new Date(dateStr)
  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ]
  return months[date.getMonth()] || 'Bilinmeyen'
}

const getYearFromDate = (dateStr?: string | Date) => {
  if (!dateStr) return ''
  return new Date(dateStr).getFullYear()
}

const formatAmount = (val?: number | string) => {
  if (!val) return '0,00'
  return parseFloat(val.toString()).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatFileSize = (bytes: number) => {
  if (!bytes || bytes === 0) return ''
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

onMounted(() => {
  fetchInvoices()
})
</script>
