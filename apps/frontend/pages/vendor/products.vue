<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            📦 Ürün Yönetimi
          </h1>
          <p class="text-gray-600 mt-1">
            Ürünlerinizi ekleyin, düzenleyin ve yönetin
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <!-- Excel Tools Section -->
          <div class="flex items-center gap-3 mr-6 p-2 bg-gray-100/50 rounded-xl border border-gray-200">
            <div class="flex flex-col">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1 px-1">Toplu Ürün Yükleme</span>
              <div class="flex items-center gap-2">
                <button
                  class="bg-white text-gray-700 h-10 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all font-bold flex items-center text-xs whitespace-nowrap"
                  title="Bayi Excel Şablonu"
                  @click="downloadSimpleTemplate"
                >
                  <HeroIcons.ArrowDownTrayIcon class="h-4 w-4 mr-1.5 text-blue-500" />
                  Şablon İndir
                </button>
                <label
                  class="cursor-pointer bg-emerald-600 text-white h-10 px-4 rounded-lg hover:bg-emerald-700 transition-all font-bold flex items-center text-xs shadow-sm"
                  :class="{ 'opacity-50 pointer-events-none': loading }"
                  title="Excel dosyanızı buraya yükleyin"
                >
                  <HeroIcons.ArrowUpTrayIcon class="h-4 w-4 mr-2" />
                  <span>Excel Yükle</span>
                  <input
                    type="file"
                    class="hidden"
                    accept=".xlsx, .xls"
                    @change="handleExcelUpload"
                  >
                </label>
                <button
                  class="bg-orange-500 text-white h-10 px-4 rounded-lg hover:bg-orange-600 transition-all font-bold flex items-center text-xs shadow-sm whitespace-nowrap"
                  title="Trendyol JSON dosyasından ürün aktar"
                  @click="showTrendyolModal = true"
                >
                  <HeroIcons.ArrowDownTrayIcon class="h-4 w-4 mr-2" />
                  Trendyol'dan Aktar
                </button>
              </div>
            </div>
          </div>

          <NuxtLink
            to="/vendor/product-form"
            class="bg-primary-600 text-white px-5 py-3 h-14 rounded-xl hover:bg-primary-700 transition-all font-black uppercase text-xs tracking-widest shadow-lg shadow-primary-500/20 flex items-center"
          >
            <HeroIcons.PlusIcon class="h-5 w-5 mr-2" />
            Yeni Ürün
          </NuxtLink>
        </div>
      </div>

      <!-- Filters & Bulk Actions -->
      <div class="bg-white rounded-lg shadow p-6 mb-8 border border-gray-100">
        <div class="flex flex-col md:flex-row md:items-end gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Ara</label>
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="İsim, Barkod, SKU..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                @keyup.enter="refresh()"
              >
              <HeroIcons.MagnifyingGlassIcon class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div class="flex gap-2">
            <button
              class="bg-primary-600 text-white py-2 px-6 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
              @click="refresh()"
            >
              Filtrele
            </button>
            <button
              v-if="selectedIds.length > 0"
              class="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 transition-colors font-semibold flex items-center"
              @click="handleBulkDelete"
            >
              <HeroIcons.TrashIcon class="h-5 w-5 mr-2" />
              Seçilenleri Sil ({{ selectedIds.length }})
            </button>
          </div>
        </div>
      </div>

      <!-- Products List -->
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div
          v-if="pending"
          class="flex flex-col justify-center items-center h-96 space-y-4"
        >
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
          <p class="text-primary-900 font-black uppercase text-xs tracking-widest italic animate-pulse">Ürünler Yükleniyor...</p>
        </div>

        <div
          v-else-if="!products.length"
          class="flex flex-col justify-center items-center h-96 space-y-4"
        >
          <HeroIcons.PhotoIcon class="h-16 w-16 text-gray-200" />
          <p class="text-gray-400 font-bold uppercase text-sm tracking-widest">Henüz ürün eklemediniz</p>
        </div>

        <div
          v-else
          class="overflow-x-auto"
        >
          <table class="w-full text-left">
            <thead class="bg-gray-900 text-white uppercase text-[10px] tracking-widest font-black">
              <tr>
                <th class="px-6 py-5 w-10">
                  <input 
                    type="checkbox" 
                    class="rounded border-gray-700 text-primary-600 focus:ring-primary-500 h-4 w-4"
                    :checked="isAllSelected"
                    @change="toggleSelectAll"
                  >
                </th>
                <th class="px-6 py-5">Ürün Bilgisi</th>
                <th class="px-6 py-5">Fiyat / Stok</th>
                <th class="px-6 py-5">Durum</th>
                <th class="px-6 py-5 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="product in products"
                :key="product.id"
                class="group hover:bg-primary-50/30 transition-all duration-300"
                :class="{ 'bg-primary-50/50': selectedIds.includes(product.id) }"
              >
                <td class="px-6 py-5">
                  <input 
                    type="checkbox" 
                    class="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                    :checked="selectedIds.includes(product.id)"
                    @change="toggleSelect(product.id)"
                  >
                </td>
                <td class="px-6 py-5">
                  <div class="flex items-center space-x-4">
                    <div class="relative w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border">
                      <img
                        :src="product.images?.[0] || '/images/placeholder.png'"
                        class="w-full h-full object-cover"
                      >
                    </div>
                    <div>
                      <h4 class="text-sm font-black text-gray-900 uppercase tracking-tight group-hover:text-primary-600">
                        {{ product.name || product.title }}
                      </h4>
                      <p class="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">
                        SKU: {{ product.sku || '-' }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <p class="text-sm font-black text-gray-900">{{ formatPrice(product.price) }}</p>
                  <p class="text-[10px] font-black uppercase text-gray-500">{{ product.stock }} ADET</p>
                </td>
                <td class="px-6 py-5">
                  <span 
                    v-if="product.status === 'ACTIVE'"
                    class="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-green-100 text-green-700"
                  >
                    AKTİF
                  </span>
                  <span 
                    v-else-if="product.status === 'PENDING'"
                    class="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-700"
                  >
                    ONAY BEKLİYOR
                  </span>
                  <span 
                    v-else-if="product.status === 'OUT_OF_STOCK'"
                    class="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-red-100 text-red-700"
                  >
                    STOK YOK
                  </span>
                  <span 
                    v-else
                    class="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-700"
                  >
                    {{ product.status }}
                  </span>
                </td>
                <td class="px-6 py-5 text-right">
                  <div class="flex justify-end space-x-2">
                    <NuxtLink
                      :to="`/vendor/product-form?id=${product.id}`"
                      class="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                      <HeroIcons.PencilSquareIcon class="h-4 w-4" />
                    </NuxtLink>
                    <button
                      class="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                      @click="deleteProduct(product.id)"
                    >
                      <HeroIcons.XMarkIcon class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p class="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Toplam {{ totalCount }} ürün | Sayfa {{ currentPage }} / {{ totalPages }}
          </p>
          <div class="flex items-center space-x-2">
            <button
              class="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all"
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              <HeroIcons.ChevronLeftIcon class="h-5 w-5 text-gray-600" />
            </button>
            <div class="flex items-center space-x-1">
              <button
                v-for="p in displayedPages"
                :key="p"
                class="w-10 h-10 rounded-lg text-xs font-black transition-all"
                :class="p === currentPage ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'"
                @click="currentPage = p"
              >
                {{ p }}
              </button>
            </div>
            <button
              class="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all"
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            >
              <HeroIcons.ChevronRightIcon class="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Trendyol İçe Aktarım Modalı -->
  <TrendyolImportModal
    v-model="showTrendyolModal"
    mode="vendor"
    @imported="() => refresh()"
  />
</template>

<script setup lang="ts">
import * as HeroIcons from '@heroicons/vue/24/outline'
import { useVendorService } from '~/services/api/VendorService'

definePageMeta({
  layout: 'vendor',
  middleware: 'vendor'
})

useHead({
  title: 'Ürün Yönetimi - BarterBorsa'
})

const vendorService = useVendorService()
const searchQuery = ref('')
const loading = ref(false)
const showTrendyolModal = ref(false)
const currentPage = ref(1)
const itemsPerPage = 50
const selectedIds = ref<string[]>([])

const { data: listingData, pending, refresh } = await useAsyncData('vendor-products', () => 
  vendorService.getMyListings({ 
    search: searchQuery.value,
    page: currentPage.value,
    limit: itemsPerPage
  }),
  { watch: [currentPage] }
)

const products = computed(() => listingData.value?.data?.items || [])
const totalCount = computed(() => {
  const data = listingData.value?.data as any
  return data?.pagination?.total ?? data?.total ?? 0
})
const totalPages = computed(() => {
  const data = listingData.value?.data as any
  return data?.pagination?.totalPages ?? data?.totalPages ?? 1
})

const isAllSelected = computed(() => {
  return products.value.length > 0 && products.value.every(p => selectedIds.value.includes(p.id))
})

const toggleSelect = (id: string) => {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) selectedIds.value.push(id)
  else selectedIds.value.splice(index, 1)
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = selectedIds.value.filter(id => !products.value.some(p => p.id === id))
  } else {
    products.value.forEach(p => {
      if (!selectedIds.value.includes(p.id)) selectedIds.value.push(p.id)
    })
  }
}

const displayedPages = computed(() => {
  const pages = []
  const max = 5
  let start = Math.max(1, currentPage.value - 2)
  let end = Math.min(totalPages.value, start + max - 1)
  
  if (end - start < max - 1) start = Math.max(1, end - max + 1)
  
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(value || 0)
}

const { $api } = useApi()
const toast = useNuxtApp().$toast

const deleteProduct = async (id: string) => {
  if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return
  try {
    const res = await $api(`/api/listings/${id}`, { method: 'DELETE' })
    if (res.success) {
      toast.success('Ürün silindi')
      selectedIds.value = selectedIds.value.filter(sid => sid !== id)
      refresh()
    }
  } catch (err: any) {
    toast.error('Silme hatası')
  }
}

const handleBulkDelete = async () => {
  if (!confirm(`${selectedIds.value.length} ürünü silmek istediğinize emin misiniz?`)) return
  
  loading.value = true
  let successCount = 0
  
  try {
    for (const id of selectedIds.value) {
      const res = await $api(`/api/listings/${id}`, { method: 'DELETE' })
      if (res.success) successCount++
    }
    
    toast.success(`${successCount} ürün başarıyla silindi.`)
    selectedIds.value = []
    refresh()
  } catch (err: any) {
    toast.error('Bazı ürünler silinemedi.')
  } finally {
    loading.value = false
  }
}

const handleExcelUpload = async (event: any) => {
  const file = event.target.files[0]
  if (!file) return
  const formData = new FormData()
  formData.append('file', file)
  loading.value = true
  try {
    const res = await vendorService.importExcel(formData)
    if (res.success) {
      alert('Ürünler başarıyla yüklendi!')
      refresh()
    }
  } catch (err: any) {
    alert('Hata oluştu')
  } finally {
    loading.value = false
    event.target.value = ''
  }
}

const downloadSimpleTemplate = () => {
  vendorService.downloadTemplate()
}
</script>
