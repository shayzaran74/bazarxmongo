<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">
        Envanter
      </h2>
      <p class="mt-1 text-sm text-gray-500">
        Tüm ürünlerinizin stok durumunu buradan yönetin
      </p>
    </div>

    <!-- Filters -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ara</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Ürün adı, SKU..."
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
          <label class="block text-sm font-medium text-gray-700 mb-1">Satıcı</label>
          <select
            v-model="filters.vendorId"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">
              Tüm Satıcılar
            </option>
            <option
              v-for="vendor in vendors"
              :key="vendor.id"
              :value="vendor.id"
            >
              {{ vendor.businessName }}
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
              Stokta (10+)
            </option>
            <option value="low_stock">
              Düşük Stok (1-10)
            </option>
            <option value="out_of_stock">
              Stokta Yok (0)
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
        Yükleniy or...
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
        action-link="/admin/product-form"
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
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Kategori / Satıcı
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Stok
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Fiyat
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
                  :src="product.image"
                  :alt="product.name"
                  class="h-10 w-10 rounded object-cover"
                >
                <div class="ml-3">
                  <div class="text-sm font-medium text-gray-900">
                    {{ product.name }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {{ product.sku || '-' }}
            </td>
            <td class="px-6 py-4 text-sm">
              <div class="text-gray-900">
                {{ product.Category?.name || '-' }}
              </div>
              <div class="text-gray-500 text-xs">
                {{ product.Vendor?.businessName || 'Platform' }}
              </div>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="text-sm font-medium text-gray-900">
                {{ product.stock }}
              </div>
            </td>
            <td class="px-6 py-4 text-right text-sm text-gray-900">
              ₺{{ product.price.toFixed(2) }}
            </td>
            <td class="px-6 py-4">
              <span
                :class="[
                  'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                  getStockStatusClass(product.stock)
                ]"
              >
                {{ getStockStatusText(product.stock) }}
              </span>
            </td>
            <td class="px-6 py-4 text-right text-sm font-medium">
              <button
                class="text-blue-600 hover:text-blue-900"
                @click="openStockModal(product)"
              >
                Stok Güncelle
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Stock Update Modal -->
    <div
      v-if="showStockModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg max-w-md w-full">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            Stok Güncelle
          </h3>
        </div>
        <div class="px-6 py-4">
          <div class="mb-4">
            <div class="flex items-center mb-4">
              <img
                :src="selectedProduct?.image"
                :alt="selectedProduct?.name"
                class="h-12 w-12 rounded object-cover"
              >
              <div class="ml-3">
                <div class="text-sm font-medium text-gray-900">
                  {{ selectedProduct?.name }}
                </div>
                <div class="text-sm text-gray-500">
                  Mevcut stok: {{ selectedProduct?.stock }}
                </div>
              </div>
            </div>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Yeni Stok Miktarı</label>
              <input
                v-model.number="newStock"
                type="number"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <button
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              @click="closeStockModal"
            >
              İptal
            </button>
            <button
              class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              @click="updateStock"
            >
              Güncelle
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CubeIcon } from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { $api } = useApi()
const products = ref([])
const categories = ref([])
const vendors = ref([])
const loading = ref(false)
const showStockModal = ref(false)
const selectedProduct = ref(null)
const newStock = ref(0)
const filters = ref({
  search: '',
  categoryId: '',
  vendorId: '',
  stockStatus: ''
})

// Fetch products
const fetchProducts = async () => {
  loading.value = true
  try {
    const query = new URLSearchParams()
    query.append('limit', '100') // Increase limit to see "all" or more
    if (filters.value.search) query.append('search', filters.value.search)
    if (filters.value.categoryId) query.append('categoryId', filters.value.categoryId)
    if (filters.value.vendorId) query.append('vendorId', filters.value.vendorId)

    const response = await $api(`/api/admin/products?${query.toString()}`)

    let filtered = response.data

    // Filter by stock status
    if (filters.value.stockStatus === 'in_stock') {
      filtered = filtered.filter(p => p.stock > 10)
    } else if (filters.value.stockStatus === 'low_stock') {
      filtered = filtered.filter(p => p.stock > 0 && p.stock <= 10)
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
    vendorId: '',
    stockStatus: ''
  }
  fetchProducts()
}

// Fetch vendors
const fetchVendors = async () => {
  try {
    const response = await $api('/api/admin/vendors')
    if (response.success) {
      vendors.value = response.data
    }
  } catch (error) {
    console.error('Error fetching vendors:', error)
  }
}

// Fetch categories
const fetchCategories = async () => {
  try {
    const response = await $api('/api/categories')
    categories.value = response.data
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

// Stock status
const getStockStatusClass = (stock) => {
  if (stock === 0) return 'bg-red-100 text-red-800'
  if (stock <= 10) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

const getStockStatusText = (stock) => {
  if (stock === 0) return 'Stokta Yok'
  if (stock <= 10) return 'Düşük Stok'
  return 'Stokta'
}

// Stock modal
const openStockModal = (product) => {
  selectedProduct.value = product
  newStock.value = product.stock
  showStockModal.value = true
}

const closeStockModal = () => {
  showStockModal.value = false
  selectedProduct.value = null
}

const updateStock = async () => {
  try {
    await $api(`/api/admin/products/${selectedProduct.value.id}`, {
      method: 'PUT',
      body: { stock: newStock.value }
    })

    const toast = useNuxtApp().$toast
    toast.success('Stok güncellendi!')
    closeStockModal()
    fetchProducts()
  } catch (error) {
    console.error('Error updating stock:', error)
    const toast = useNuxtApp().$toast
    toast.error('Stok güncellenirken hata oluştu')
  }
}

onMounted(() => {
  fetchProducts()
  fetchCategories()
  fetchVendors()
})
</script>
