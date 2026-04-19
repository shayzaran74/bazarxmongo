<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">
          Envanter
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          Tüm ürünlerinizin stok durumunu buradan yönetin
        </p>
      </div>
      <div class="flex space-x-3">
        <button
          :disabled="exporting"
          class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          @click="exportPDF"
        >
          <DocumentArrowDownIcon
            v-if="!exporting"
            class="h-5 w-5 mr-2 text-gray-500"
          />
          <div
            v-else
            class="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"
          />
          Raporu İndir
        </button>
        <NuxtLink
          to="/vendor/purchase-orders"
          class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <DocumentPlusIcon class="h-5 w-5 mr-2 text-gray-500" />
          Satın Alım Yönetimi
        </NuxtLink>
        <NuxtLink
          to="/vendor/product-form"
          class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
        >
          <PlusIcon class="h-5 w-5 mr-2" />
          Yeni Ürün
        </NuxtLink>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div class="text-sm font-medium text-gray-500">
          Toplam Ürün
        </div>
        <div class="mt-1 text-2xl font-bold text-gray-900">
          {{ stats?.totalProducts || 0 }}
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-red-500">
        <div class="text-sm font-medium text-gray-500">
          Stokta Yok
        </div>
        <div class="mt-1 text-2xl font-bold text-red-600">
          {{ stats?.outOfStock || 0 }}
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-yellow-500">
        <div class="text-sm font-medium text-gray-500">
          Düşük Stok
        </div>
        <div class="mt-1 text-2xl font-bold text-yellow-600">
          {{ stats?.lowStock || 0 }}
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-green-500">
        <div class="text-sm font-medium text-gray-500">
          Sağlıklı Stok
        </div>
        <div class="mt-1 text-2xl font-bold text-green-600">
          {{ stats?.healthyStock || 0 }}
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ara</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="İsim, Barkod, SKU..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
          <select
            v-model="filters.categoryId"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">
              Tüm Kategoriler
            </option>
            <option
              v-for="cat in categories"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Stok Durumu</label>
          <select
            v-model="filters.stockStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">
              Tümü
            </option>
            <option value="in_stock">
              Stokta (Yeterli)
            </option>
            <option value="low_stock">
              Düşük Stok
            </option>
            <option value="out_of_stock">
              Stokta Yok
            </option>
          </select>
        </div>
        <div class="flex items-end space-x-2">
          <button
            class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            @click="fetchProducts"
          >
            Filtrele
          </button>
          <button
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md transition-colors"
            @click="resetFilters"
          >
            Sıfırla
          </button>
        </div>
      </div>
    </div>

    <!-- Inventory Table -->
    <div
      v-if="loading"
      class="text-center py-12"
    >
      <div
        class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
      />
      <p class="mt-2 text-gray-500">
        Yükleniyor...
      </p>
    </div>

    <div
      v-else-if="products.length === 0"
      class="bg-white rounded-lg shadow-sm border border-gray-200"
    >
      <EmptyState
        :icon="CubeIcon"
        title="Envanter boş"
        description="Ürünlerinizin stok seviyelerini buradan görüntüleyin ve yönetin."
        action-text="Ürün Ekle"
        action-link="/vendor/product-form"
      />
    </div>

    <div
      v-else
      class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Ürün
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              SKU
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Stok
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Durum
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr
            v-for="product in products"
            :key="product.id"
            class="hover:bg-gray-50"
          >
            <td class="px-6 py-4">
              <div class="flex items-center">
                <img
                  :src="resolveImageUrl(product.image)"
                  :alt="product.name"
                  class="h-10 w-10 rounded object-cover"
                >
                <div class="ml-3">
                  <div class="text-sm font-bold text-gray-900 uppercase tracking-tight">
                    {{ product.name }}
                  </div>
                  <div class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    {{ product.Category?.name
                      || '-' }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {{ product.sku || '-' }}
            </td>
            <td class="px-6 py-4 text-right">
              <div class="text-sm font-medium text-gray-900">
                {{ product.stock }}
              </div>
            </td>
            <td class="px-6 py-4">
              <span
                :class="[
                  'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                  getStockStatusClass(product)
                ]"
              >
                {{ getStockStatusText(product) }}
              </span>
            </td>
            <td class="px-6 py-4 text-right text-sm font-medium space-x-3">
              <button
                class="text-gray-600 hover:text-gray-900"
                @click="openHistoryModal(product)"
              >
                Geçmiş
              </button>
              <button
                class="text-blue-600 hover:text-blue-900 font-bold"
                @click="openStockModal(product)"
              >
                Stok Düzelt
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Stock Update Modal (Audit Log Version) -->
    <div
      v-if="showStockModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-lg font-bold text-gray-900">
            Stok Düzeltme
          </h3>
          <button
            class="text-gray-400 hover:text-gray-600 text-2xl"
            @click="closeStockModal"
          >
            &times;
          </button>
        </div>
        <div class="p-6">
          <div class="flex items-center mb-6 p-3 bg-gray-50 rounded-xl">
            <img
              :src="resolveImageUrl(selectedProduct?.image)"
              :alt="selectedProduct?.name"
              class="h-12 w-12 rounded-lg object-cover"
            >
            <div class="ml-3">
              <div class="text-sm font-bold text-gray-900">
                {{ selectedProduct?.name }}
              </div>
              <div class="text-sm text-gray-500">
                Mevcut stok: <span class="font-bold text-gray-900">{{
                  selectedProduct?.stock }}</span>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Düzeltme Miktarı</label>
              <input
                v-model.number="stockChange"
                type="number"
                placeholder="Örn: +10 veya -2"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-bold"
              >
              <p class="mt-1 text-xs text-gray-500">
                Stok eklemek için pozitif, çıkarmak için negatif sayı girin.
              </p>
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Düzeltme Nedeni</label>
              <select
                v-model="adjustReason"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="MANUAL_ADJUSTMENT">
                  Manuel Düzeltme
                </option>
                <option value="DAMAGE">
                  Hasarlı Ürün
                </option>
                <option value="RETURN">
                  Müşteri İadesi
                </option>
                <option value="OTHER_SALE">
                  Diğer Platform Satışı
                </option>
                <option value="LOST">
                  Kayıp / Fire
                </option>
                <option value="FOUND">
                  Bulunan Stok
                </option>
              </select>
            </div>
          </div>
          <div class="mt-8 flex justify-end space-x-3">
            <button
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              @click="closeStockModal"
            >
              İptal
            </button>
            <button
              :disabled="!stockChange || stockChange === 0"
              class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
              @click="updateStock"
            >
              Değişikliği Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- History Modal -->
    <div
      v-if="showHistoryModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-lg font-bold text-gray-900">
            Stok Geçmişi: {{ selectedProduct?.name }}
          </h3>
          <button
            class="text-gray-400 hover:text-gray-600 text-2xl"
            @click="showHistoryModal = false"
          >
            &times;
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-6">
          <div
            v-if="historyLoading"
            class="text-center py-8"
          >
            <div
              class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"
            />
          </div>
          <div
            v-else-if="history.length === 0"
            class="text-center py-8 text-gray-500"
          >
            Kayıt bulunamadı.
          </div>
          <div
            v-else
            class="space-y-4"
          >
            <div
              v-for="log in history"
              :key="log.id"
              class="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <div
                  class="font-bold"
                  :class="log.change > 0 ? 'text-green-600' : 'text-red-600'"
                >
                  {{ log.change > 0 ? '+' : '' }}{{ log.change }} Adet
                </div>
                <div class="text-xs text-gray-500">
                  {{ formatDate(log.createdAt) }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium text-gray-900">
                  {{ formatReason(log.reason) }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ log.referenceId || '-' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CubeIcon, PlusIcon, DocumentPlusIcon, DocumentArrowDownIcon } from '@heroicons/vue/24/outline'

const { resolveImageUrl } = useAppImage()

definePageMeta({
  layout: 'vendor',
  middleware: 'vendor'
})

const products = ref([])
const categories = ref([])
const loading = ref(false)
const exporting = ref(false)
const stats = ref(null)

// ... existing refs ...

const exportPDF = async () => {
  exporting.value = true
  try {
    const { $api } = useApi()
    const response = await $api('/api/vendors/inventory/export', {
      responseType: 'blob'
    })

    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `envanter-raporu-${new Date().getTime()}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()

    useNuxtApp().$toast.success('Rapor başarıyla oluşturuldu!')
  } catch (error) {
    console.error('Export error:', error)
    useNuxtApp().$toast.error('Rapor oluşturulurken hata oluştu.')
  } finally {
    exporting.value = false
  }
}

const showStockModal = ref(false)
const selectedProduct = ref(null)
const stockChange = ref(0)
const adjustReason = ref('MANUAL_ADJUSTMENT')

const showHistoryModal = ref(false)
const history = ref([])
const historyLoading = ref(false)

const filters = ref({
  search: '',
  categoryId: '',
  stockStatus: ''
})

// Fetch stats
const fetchStats = async () => {
  try {
    const { $api } = useApi()
    const response = await $api('/api/vendors/inventory/stats')
    stats.value = response.data
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

// Fetch products
const fetchProducts = async () => {
  loading.value = true
  try {
    const query = new URLSearchParams()
    query.append('limit', '100')
    if (filters.value.search) query.append('search', filters.value.search)
    if (filters.value.categoryId) query.append('categoryId', filters.value.categoryId)

    const { $api } = useApi()
    const response = await $api(`/api/vendors/products?${query.toString()}`)

    let filtered = response.data

    // Filter by stock status
    if (filters.value.stockStatus === 'in_stock') {
      filtered = filtered.filter(p => p.stock > (p.lowStockThreshold || 5))
    } else if (filters.value.stockStatus === 'low_stock') {
      filtered = filtered.filter(p => p.stock > 0 && p.stock <= (p.lowStockThreshold || 5))
    } else if (filters.value.stockStatus === 'out_of_stock') {
      filtered = filtered.filter(p => p.stock === 0)
    }

    products.value = filtered
  } catch (error) {
    console.error('Error fetching products:', error)
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value = {
    search: '',
    categoryId: '',
    stockStatus: ''
  }
  fetchProducts()
}

// Fetch categories
const fetchCategories = async () => {
  try {
    const { $api } = useApi()
    const response = await $api('/api/categories')
    categories.value = response.data
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

// Stock status
const getStockStatusClass = (product) => {
  if (product.stock === 0) return 'bg-red-100 text-red-800'
  if (product.stock <= (product.lowStockThreshold || 5)) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

const getStockStatusText = (product) => {
  if (product.stock === 0) return 'Stokta Yok'
  if (product.stock <= (product.lowStockThreshold || 5)) return 'Düşük Stok'
  return 'Yeterli'
}

// Stock modal
const openStockModal = (product) => {
  selectedProduct.value = product
  stockChange.value = 0
  adjustReason.value = 'MANUAL_ADJUSTMENT'
  showStockModal.value = true
}

const closeStockModal = () => {
  showStockModal.value = false
  selectedProduct.value = null
}

const updateStock = async () => {
  try {
    const { $api } = useApi()
    await $api(`/api/vendors/products/${selectedProduct.value.id}/stock`, {
      method: 'PATCH',
      body: {
        change: stockChange.value,
        reason: adjustReason.value
      }
    })

    const toast = useNuxtApp().$toast
    toast.success('Stok başarıyla düzeltildi!')
    closeStockModal()
    fetchProducts()
    fetchStats()
  } catch (error) {
    const toast = useNuxtApp().$toast
    toast.error('Girdiğiniz miktarı kontrol edin.')
  }
}

// History modal
const openHistoryModal = async (product) => {
  selectedProduct.value = product
  showHistoryModal.value = true
  historyLoading.value = true
  try {
    const { $api } = useApi()
    const response = await $api(`/api/vendors/inventory/logs/${product.id}`)
    history.value = response.data
  } catch (error) {
    console.error('Error fetching history:', error)
  } finally {
    historyLoading.value = false
  }
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

const formatReason = (reason) => {
  const reasons = {
    'INITIAL_STOCK': 'Başlangıç Stoğu',
    'MANUAL_ADJUSTMENT': 'Manuel Düzeltme',
    'PURCHASE_ORDER': 'Satınalma Alımı',
    'PARTIALLY_RECEIVED': 'Kısmi Kabul',
    'SALE': 'Satış',
    'DAMAGE': 'Hasar',
    'RETURN': 'İade',
    'OTHER_SALE': 'Diğer Platform Satışı',
    'LOST': 'Kayıp / Fire',
    'FOUND': 'Bulunan Stok',
    'BULK_IMPORT': 'Toplu Yükleme',
    'BULK_IMPORT_UPDATE': 'Toplu Güncelleme'
  }
  return reasons[reason] || reason
}

onMounted(() => {
  fetchProducts()
  fetchCategories()
  fetchStats()
})
</script>
