<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="px-4 py-6 sm:px-0">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">
        Yorumlarım
      </h1>

      <!-- Loading state -->
      <div
        v-if="loading"
        class="flex justify-center items-center h-64"
      >
        <div class="spinner h-12 w-12" />
      </div>

      <!-- Error state -->
      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-md p-4 mb-6"
      >
        <div class="flex">
          <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
          <div class="ml-3">
            <p class="text-sm text-red-800">
              {{ error }}
            </p>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="reviews.length === 0"
        class="text-center py-12"
      >
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">
          Henüz yorum yapmadınız
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          Ürün satın aldıktan sonra yorum yapabilirsiniz.
        </p>
        <div class="mt-6">
          <NuxtLink
            to="/products"
            class="btn-primary"
          >
            Alışverişe Devam Et
          </NuxtLink>
        </div>
      </div>

      <!-- Reviews list -->
      <div v-else>
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <ul class="divide-y divide-gray-200">
            <li
              v-for="review in reviews"
              :key="review.id"
              class="p-6"
            >
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-700">
                      {{ review.user.name?.charAt(0) || 'U' }}
                    </span>
                  </div>
                </div>

                <div class="ml-4 flex-1">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="text-sm font-medium text-gray-900">
                        {{ review.user.name }}
                      </h3>
                      <div class="flex items-center mt-1">
                        <div class="flex items-center">
                          <StarIcon
                            v-for="rating in [1, 2, 3, 4, 5]"
                            :key="rating"
                            :class="[
                              rating <= review.rating
                                ? 'text-yellow-400'
                                : 'text-gray-300',
                              'h-5 w-5 flex-shrink-0'
                            ]"
                            aria-hidden="true"
                          />
                        </div>
                        <p class="ml-2 text-sm text-gray-500">
                          {{ formatDate(review.createdAt) }}
                        </p>
                      </div>
                    </div>

                    <span
                      :class="[
                        review.status === 'Approved'
                          ? 'bg-green-100 text-green-800'
                          : review.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800',
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
                      ]"
                    >
                      {{ getStatusText(review.status) }}
                    </span>
                  </div>

                  <div class="mt-2">
                    <h4 class="text-base font-medium text-gray-900">
                      {{ review.title }}
                    </h4>
                    <p class="mt-1 text-sm text-gray-700">
                      {{ review.comment }}
                    </p>
                  </div>

                  <div class="mt-4 flex items-center">
                    <div class="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
                      <img
                        :src="review.product.image"
                        :alt="review.product.name"
                        class="w-full h-full object-cover"
                        @error="handleImageError"
                      >
                    </div>
                    <div class="ml-3">
                      <NuxtLink
                        :to="`/products/${review.product.id}`"
                        class="text-sm font-medium text-primary-600 hover:text-primary-500"
                      >
                        {{ review.product.name }}
                      </NuxtLink>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <!-- Pagination -->
        <div
          v-if="pagination.pages > 1"
          class="mt-8 flex justify-center"
        >
          <nav
            class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            <button
              :disabled="pagination.page === 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              @click="goToPage(pagination.page - 1)"
            >
              <span class="sr-only">Previous</span>
              <ChevronLeftIcon class="h-5 w-5" />
            </button>

            <template
              v-for="page in pagination.pages"
              :key="page"
            >
              <button
                v-if="Math.abs(page - pagination.page) <= 2 || page === 1 || page === pagination.pages"
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
              <span
                v-else-if="Math.abs(page - pagination.page) === 3"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
              >
                ...
              </span>
            </template>

            <button
              :disabled="pagination.page === pagination.pages"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              @click="goToPage(pagination.page + 1)"
            >
              <span class="sr-only">Next</span>
              <ChevronRightIcon class="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ExclamationTriangleIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'

// Layout
definePageMeta({
  layout: 'default'
})

// Page meta
useHead({
  title: 'Yorumlarım - E-Commerce Platform',
  meta: [
    {
      name: 'description',
      content: 'Yaptığınız ürün yorumları'
    }
  ]
})

// State
const reviews = ref([])
const loading = ref(false)
const error = ref(null)
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0
})

// Auth store
const authStore = useAuthStore()
const { $api } = useApi()

// Fetch reviews
const fetchReviews = async (page = 1) => {
  if (!authStore.isAuthenticated) {
    // Redirect to login if not authenticated
    await navigateTo('/login')
    return
  }

  loading.value = true
  error.value = null

  try {
    const data = await $api('/reviews/my-reviews', {
      query: {
        page,
        limit: pagination.value.limit
      }
    })

    if (data.success) {
      reviews.value = data.data
      pagination.value = {
        ...pagination.value,
        ...data.pagination
      }
    } else {
      throw new Error(data.error || 'Yorumlar yüklenirken bir hata oluştu')
    }
  } catch (err) {
    error.value = err.message || 'Yorumlar yüklenirken bir hata oluştu'
    console.error('Fetch reviews error:', err)
  } finally {
    loading.value = false
  }
}

// Pagination
const goToPage = (page) => {
  if (page >= 1 && page <= pagination.value.pages) {
    fetchReviews(page)
  }
}

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Get status text
const getStatusText = (status) => {
  switch (status) {
    case 'Approved':
      return 'Onaylandı'
    case 'Pending':
      return 'Beklemede'
    case 'Rejected':
      return 'Reddedildi'
    default:
      return status
  }
}

// Handle image error
const handleImageError = (event) => {
  if (event?.target) {
    event.target.onerror = null
    event.target.src = 'https://placehold.co/64x64?text=Ürün'
  }
}

// Fetch reviews on mount
onMounted(() => {
  fetchReviews()
})
</script>