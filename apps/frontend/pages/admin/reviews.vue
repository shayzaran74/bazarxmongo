<template>
  <div class="px-4 py-6 sm:px-0">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">
        Yorum Yönetimi
      </h1>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ürün</label>
          <input
            v-model="filters.product"
            type="text"
            placeholder="Ürün adı"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Kullanıcı</label>
          <input
            v-model="filters.user"
            type="text"
            placeholder="Kullanıcı adı"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Durum</label>
          <select
            v-model="filters.approved"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">
              Tümü
            </option>
            <option :value="true">
              Onaylı
            </option>
            <option :value="false">
              Beklemede
            </option>
          </select>
        </div>
      </div>
      <div class="mt-4 flex justify-end">
        <button
          class="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          @click="applyFilters"
        >
          Filtrele
        </button>
      </div>
    </div>

    <!-- Reviews Table -->
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Ürün
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Kullanıcı
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Yorum
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Puan
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Durum
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tarih
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="review in reviews"
              :key="review.id"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ review.CatalogProduct?.name || '-' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ review.User?.name || review.User?.email || 'Anonim' }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 max-w-md truncate">
                  {{ review.comment }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <StarIcon
                    v-for="i in 5"
                    :key="i"
                    :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
                    class="h-5 w-5 fill-current"
                  />
                  <span class="ml-1 text-sm text-gray-500">({{ review.rating }}/5)</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    review.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  ]"
                >
                  {{ review.isApproved ? 'Onaylı' : 'Beklemede' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(review.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  v-if="!review.isApproved"
                  class="text-green-600 hover:text-green-900 mr-3"
                  @click="approveReview(review.id)"
                >
                  Onayla
                </button>
                <button
                  class="text-red-600 hover:text-red-900"
                  @click="deleteReview(review.id)"
                >
                  Sil
                </button>
              </td>
            </tr>
            <tr v-if="reviews.length === 0">
              <td
                colspan="7"
                class="px-6 py-4 text-center text-sm text-gray-500"
              >
                Hiç yorum bulunamadı
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="mt-6 flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Toplam {{ pagination.total }} yorum, {{ pagination.pages }} sayfa
      </div>
      <div class="flex space-x-2">
        <button
          :disabled="pagination.page <= 1"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          @click="changePage(pagination.page - 1)"
        >
          Önceki
        </button>
        <button
          :disabled="pagination.page >= pagination.pages"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          @click="changePage(pagination.page + 1)"
        >
          Sonraki
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
                StarIcon
} from '@heroicons/vue/24/outline'

// Layout
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

// Page meta
useHead({
  title: 'Yorum Yönetimi - E-Commerce Platform',
  meta: [
    {
      name: 'description',
      content: 'Yorum yönetimi'
    }
  ]
})

// State
const reviews = ref([])
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0
})

const filters = ref({
  product: '',
  user: '',
  approved: ''
})

// Format date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('tr-TR', options)
}

// Fetch reviews
const { $api } = useApi()

const fetchReviews = async () => {
  try {
    const query = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      ...filters.value
    }
    // Remove empty filters
    Object.keys(query).forEach(key => {
      if (query[key] === '' || query[key] === null || query[key] === undefined) {
        delete query[key]
      }
    })

    const response = await $api('/api/admin/reviews', {
      query
    })
    reviews.value = response.data || []
    pagination.value = { ...pagination.value, ...response.pagination }
  } catch (error) {
    console.error('Error fetching reviews:', error)
  }
}

// Apply filters
const applyFilters = () => {
  pagination.value.page = 1
  fetchReviews()
}

// Change page
const changePage = (newPage) => {
  pagination.value.page = newPage
  fetchReviews()
}

// Approve review
const approveReview = async (reviewId) => {
  try {
    await $api(`/api/admin/reviews/${reviewId}/approve`, {
      method: 'POST'
    })
    fetchReviews()
  } catch (error) {
    console.error('Error approving review:', error)
    alert('Yorum onaylanırken bir hata oluştu')
  }
}

// Delete review
const deleteReview = async (reviewId) => {
  if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) {
    return
  }

  try {
    await $api(`/api/admin/reviews/${reviewId}`, {
      method: 'DELETE'
    })
    fetchReviews()
  } catch (error) {
    console.error('Error deleting review:', error)
    alert('Yorum silinirken bir hata oluştu')
  }
}

// Initial fetch
onMounted(() => {
  fetchReviews()
})
</script>