<template>
  <div class="px-4 py-6 sm:px-0">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          Onay Bekleyen Satıcı Ürünleri
        </h1>
        <p class="mt-1 text-sm text-gray-600">
          Satıcılar tarafından eklenen ve onay bekleyen ürünler
        </p>
      </div>
      <NuxtLink
        to="/admin"
        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        ← Dashboard'a Dön
      </NuxtLink>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ClockIcon class="h-6 w-6 text-orange-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Onay Bekleyen
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ pagination.total }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <CheckCircleIcon class="h-6 w-6 text-green-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Bugün Onaylanan
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ approvedToday }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <XCircleIcon class="h-6 w-6 text-red-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Bugün Reddedilen
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ rejectedToday }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex justify-center items-center h-64"
    >
      <div class="spinner h-12 w-12" />
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-md p-4"
    >
      <p class="text-red-800">
        {{ error }}
      </p>
    </div>

    <!-- Products Table -->
    <div
      v-else
      class="bg-white shadow overflow-hidden sm:rounded-lg"
    >
      <div
        v-if="products.length === 0"
        class="text-center py-12"
      >
        <CheckCircleIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">
          Onay bekleyen ürün yok
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          Tüm satıcı ürünleri onaylanmış durumda.
        </p>
      </div>

      <div
        v-else
        class="overflow-x-auto"
      >
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ürün
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Satıcı
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kategori
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fiyat
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stok
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarih
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="product in products"
              :key="product.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-16 w-16">
                    <img
                      :src="product.image"
                      :alt="product.name"
                      class="h-16 w-16 rounded-lg object-cover"
                      @error="handleImageError"
                    >
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ product.name }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ product.sku || 'SKU yok' }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ product.Vendor?.businessName || 'Bilinmiyor' }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ product.Vendor?.user?.email }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ product.Category?.name || '-' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ formatPrice(product.price) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  {{ product.stock }} adet
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(product.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button
                    class="text-blue-600 hover:text-blue-900"
                    title="Görüntüle"
                    @click="viewProduct(product)"
                  >
                    <EyeIcon class="h-5 w-5" />
                  </button>
                  <button
                    class="text-green-600 hover:text-green-900"
                    title="Onayla"
                    @click="approveProduct(product.id)"
                  >
                    <CheckCircleIcon class="h-5 w-5" />
                  </button>
                  <button
                    class="text-red-600 hover:text-red-900"
                    title="Reddet"
                    @click="rejectProduct(product.id)"
                  >
                    <XCircleIcon class="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination.pages > 1"
        class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
      >
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            :disabled="pagination.page === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            @click="goToPage(pagination.page - 1)"
          >
            Önceki
          </button>
          <button
            :disabled="pagination.page === pagination.pages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            @click="goToPage(pagination.page + 1)"
          >
            Sonraki
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Toplam <span class="font-medium">{{ pagination.total }}</span> üründen
              <span class="font-medium">{{ (pagination.page - 1) * pagination.limit + 1 }}</span>
              -
              <span class="font-medium">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span>
              arası gösteriliyor
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                :disabled="pagination.page === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                @click="goToPage(pagination.page - 1)"
              >
                ←
              </button>
              <button
                v-for="page in visiblePages"
                :key="page"
                :class="[
                  page === pagination.page
                    ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                ]"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
              <button
                :disabled="pagination.page === pagination.pages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                @click="goToPage(pagination.page + 1)"
              >
                →
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Detail Modal -->
    <TransitionRoot
      as="template"
      :show="showModal"
    >
      <Dialog
        as="div"
        class="relative z-10"
        @close="showModal = false"
      >
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <div class="fixed inset-0 z-10 overflow-y-auto">
          <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <TransitionChild
              as="template"
              enter="ease-out duration-300"
              enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enter-to="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leave-from="opacity-100 translate-y-0 sm:scale-100"
              leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel
                class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6"
              >
                <div v-if="selectedProduct">
                  <div class="flex justify-between items-start mb-4">
                    <DialogTitle
                      as="h3"
                      class="text-lg font-medium leading-6 text-gray-900"
                    >
                      Ürün Detayları
                    </DialogTitle>
                    <button
                      class="text-gray-400 hover:text-gray-500"
                      @click="showModal = false"
                    >
                      <XMarkIcon class="h-6 w-6" />
                    </button>
                  </div>

                  <div class="mt-4">
                    <img
                      :src="selectedProduct.image"
                      :alt="selectedProduct.name"
                      class="w-full h-64 object-cover rounded-lg mb-4"
                      @error="handleImageError"
                    >

                    <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div>
                        <dt class="text-sm font-medium text-gray-500">
                          Ürün Adı
                        </dt>
                        <dd class="mt-1 text-sm text-gray-900">
                          {{ selectedProduct.name }}
                        </dd>
                      </div>
                      <div>
                        <dt class="text-sm font-medium text-gray-500">
                          Satıcı
                        </dt>
                        <dd class="mt-1 text-sm text-gray-900">
                          {{ selectedProduct.Vendor?.businessName }}
                        </dd>
                      </div>
                      <div>
                        <dt class="text-sm font-medium text-gray-500">
                          Kategori
                        </dt>
                        <dd class="mt-1 text-sm text-gray-900">
                          {{ selectedProduct.Category?.name || '-' }}
                        </dd>
                      </div>
                      <div>
                        <dt class="text-sm font-medium text-gray-500">
                          Fiyat
                        </dt>
                        <dd class="mt-1 text-sm text-gray-900">
                          {{ formatPrice(selectedProduct.price) }}
                        </dd>
                      </div>
                      <div>
                        <dt class="text-sm font-medium text-gray-500">
                          Stok
                        </dt>
                        <dd class="mt-1 text-sm text-gray-900">
                          {{ selectedProduct.stock }} adet
                        </dd>
                      </div>
                      <div>
                        <dt class="text-sm font-medium text-gray-500">
                          SKU
                        </dt>
                        <dd class="mt-1 text-sm text-gray-900">
                          {{ selectedProduct.sku || '-' }}
                        </dd>
                      </div>
                      <div class="sm:col-span-2">
                        <dt class="text-sm font-medium text-gray-500">
                          Açıklama
                        </dt>
                        <dd class="mt-1 text-sm text-gray-900">
                          {{ selectedProduct.description || 'Açıklama yok' }}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div class="mt-6 flex justify-end space-x-3">
                    <button
                      class="inline-flex justify-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                      @click="rejectProduct(selectedProduct.id)"
                    >
                      Reddet
                    </button>
                    <button
                      class="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                      @click="approveProduct(selectedProduct.id)"
                    >
                      Onayla
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ClockIcon, CheckCircleIcon, XCircleIcon, EyeIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

// Layout
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

// Page meta
useHead({
  title: 'Onay Bekleyen Ürünler - Admin',
  meta: [
    {
      name: 'description',
      content: 'Satıcı ürünlerini onayla veya reddet'
    }
  ]
})

const { $api } = useApi()

// State
const products = ref([])
const loading = ref(false)
const error = ref(null)
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  pages: 0
})
const approvedToday = ref(0)
const rejectedToday = ref(0)
const showModal = ref(false)
const selectedProduct = ref(null)

// Computed
const visiblePages = computed(() => {
  const pages = []
  const total = pagination.value.pages
  const current = pagination.value.page

  for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
    pages.push(i)
  }

  return pages
})

// Methods
const fetchPendingProducts = async (page = 1) => {
  try {
    loading.value = true
    error.value = null

    const response = await $api('/api/v1/admin/products/pending', {
      query: {
        page,
        limit: pagination.value.limit
      }
    })

    if (response.success) {
      products.value = response.data
      pagination.value = {
        ...pagination.value,
        ...response.pagination
      }
    } else {
      error.value = response.error || 'Ürünler yüklenirken bir hata oluştu'
    }
  } catch (err) {
    console.error('Error fetching pending products:', err)
    error.value = 'Ürünler yüklenirken bir hata oluştu'
  } finally {
    loading.value = false
  }
}

const approveProduct = async (productId) => {
  try {
    const response = await $api(`/api/v1/admin/products/${productId}/approve`, {
      method: 'PUT'
    })

    if (response.success) {
      const toast = useNuxtApp().$toast
      toast.success('Ürün onaylandı!')
      approvedToday.value++

      // Refresh list
      await fetchPendingProducts(pagination.value.page)

      // Close modal if open
      showModal.value = false
      selectedProduct.value = null
    }
  } catch (err) {
    console.error('Error approving product:', err)
    const toast = useNuxtApp().$toast
    toast.error('Ürün onaylanırken bir hata oluştu')
  }
}

const rejectProduct = async (productId) => {
  try {
    const response = await $api(`/api/v1/admin/products/${productId}/reject`, {
      method: 'PUT',
      body: {
        rejectionReason: 'Admin tarafından reddedildi'
      }
    })

    if (response.success) {
      const toast = useNuxtApp().$toast
      toast.success('Ürün reddedildi')
      rejectedToday.value++

      // Refresh list
      await fetchPendingProducts(pagination.value.page)

      // Close modal if open
      showModal.value = false
      selectedProduct.value = null
    }
  } catch (err) {
    console.error('Error rejecting product:', err)
    const toast = useNuxtApp().$toast
    toast.error('Ürün reddedilirken bir hata oluştu')
  }
}

const viewProduct = (product) => {
  selectedProduct.value = product
  showModal.value = true
}

const goToPage = (page) => {
  if (page >= 1 && page <= pagination.value.pages) {
    fetchPendingProducts(page)
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleImageError = (event) => {
  if (event?.target) {
    event.target.onerror = null
    event.target.src = 'https://placehold.co/400x400/e2e8f0/64748b?text=Ürün+Resmi'
  }
}

// Initialize
onMounted(() => {
  fetchPendingProducts()
})
</script>

<style scoped>
.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #6366f1;
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
