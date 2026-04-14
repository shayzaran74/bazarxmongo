<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">
          Koleksiyonlar
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          Ürünlerinizi koleksiyonlar halinde organize edin
        </p>
      </div>
      <a
        href="/admin/collection-form"
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        Koleksiyon Ekle
      </a>
    </div>

    <!-- Filters -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ara</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Koleksiyon adı..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tür</label>
          <select
            v-model="filters.type"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">
              Tümü
            </option>
            <option value="Manual">
              Manuel
            </option>
            <option value="Automatic">
              Otomatik
            </option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            class="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
            @click="fetchCollections"
          >
            Filtrele
          </button>
        </div>
      </div>
    </div>

    <!-- Collections List -->
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
      v-else-if="collections.length === 0"
      class="bg-white rounded-lg shadow-sm border border-gray-200"
    >
      <EmptyState
        :icon="FolderIcon"
        title="Henüz koleksiyon yok"
        description="Ürünlerinizi organize etmek için ilk koleksiyonunuzu oluşturun"
        action-text="Koleksiyon Ekle"
        action-link="/admin/collection-form"
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
              Koleksiyon
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Tür
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Ürünler
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
            v-for="collection in collections"
            :key="collection.id"
            class="hover:bg-gray-50"
          >
            <td class="px-6 py-4">
              <div class="flex items-center">
                <div
                  v-if="collection.image"
                  class="h-10 w-10 flex-shrink-0"
                >
                  <img
                    :src="collection.image"
                    :alt="collection.title"
                    class="h-10 w-10 rounded object-cover"
                  >
                </div>
                <div :class="collection.image ? 'ml-4' : ''">
                  <div class="text-sm font-medium text-gray-900">
                    {{ collection.title }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ collection.handle }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="['px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full', COLLECTION_TYPE_MAP[collection.type]?.class || 'bg-gray-100 text-gray-800']">
                {{ COLLECTION_TYPE_MAP[collection.type]?.label || collection.type }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ collection._count?.products || 0 }} ürün
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="['px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full', PUBLISH_STATUS_MAP[collection.isPublished]?.class]">
                {{ PUBLISH_STATUS_MAP[collection.isPublished]?.label }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <a
                :href="`/admin/collection-form?id=${collection.id}`"
                class="text-blue-600 hover:text-blue-900 mr-4"
              >
                Düzenle
              </a>
              <button
                class="text-red-600 hover:text-red-900"
                @click="deleteCollection(collection.id)"
              >
                Sil
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      v-if="pagination.pages > 1"
      class="mt-6 flex items-center justify-between"
    >
      <div class="text-sm text-gray-700">
        Toplam {{ pagination.total }} koleksiyon
      </div>
      <div class="flex space-x-2">
        <button
          :disabled="pagination.page <= 1"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          @click="changePage(pagination.page - 1)"
        >
          Önceki
        </button>
        <button
          :disabled="pagination.page >= pagination.pages"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          @click="changePage(pagination.page + 1)"
        >
          Sonraki
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PlusIcon, FolderIcon } from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { $api } = useApi()
const collections = ref([])
const loading = ref(false)
const filters = ref({
  search: '',
  type: ''
})
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  pages: 0
})

// Fetch collections
const fetchCollections = async () => {
  loading.value = true
  try {
    const query = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      search: filters.value.search || undefined,
      type: filters.value.type || undefined
    }

    const response = await $api('/api/admin/collections', { query })

    collections.value = response.data
    pagination.value = { ...pagination.value, ...response.pagination }
  } catch (error) {
    console.error('Error fetching collections:', error)
    const toast = useNuxtApp().$toast
    toast.error('Koleksiyonlar yüklenirken hata oluştu')
  } finally {
    loading.value = false
  }
}

// Delete collection
const deleteCollection = async (id) => {
  if (!confirm('Bu koleksiyonu silmek istediğinize emin misiniz?')) return

  try {
    await $api(`/api/admin/collections/${id}`, {
      method: 'DELETE'
    })

    const toast = useNuxtApp().$toast
    toast.success('Koleksiyon silindi')
    fetchCollections()
  } catch (error) {
    console.error('Error deleting collection:', error)
    const toast = useNuxtApp().$toast
    toast.error('Koleksiyon silinirken hata oluştu')
  }
}

// Change page
const changePage = (page) => {
  pagination.value.page = page
  fetchCollections()
}

// UI Configuration Maps
const COLLECTION_TYPE_MAP = {
  Manual: { label: 'Manuel', class: 'bg-blue-100 text-blue-800' },
  Automatic: { label: 'Otomatik', class: 'bg-purple-100 text-purple-800' }
}

const PUBLISH_STATUS_MAP = {
  true: { label: 'Yayında', class: 'bg-green-100 text-green-800' },
  false: { label: 'Taslak', class: 'bg-gray-100 text-gray-800' }
}

onMounted(() => {
  fetchCollections()
})
</script>
