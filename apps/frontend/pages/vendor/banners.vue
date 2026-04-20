<template>
  <div class="px-4 py-6 sm:px-0">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">
        Mağaza Banner Yönetimi
      </h1>
      <NuxtLink
        to="/vendor"
        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        <ArrowLeftIcon class="h-5 w-5 mr-2" />
        Panele Dön
      </NuxtLink>
    </div>

    <!-- Info Card -->
    <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <InformationCircleIcon
            class="h-5 w-5 text-blue-400"
            aria-hidden="true"
          />
        </div>
        <div class="ml-3">
          <p class="text-sm text-blue-700">
            Mağaza sayfanızda en fazla 5 adet banner gösterebilirsiniz. Bannerlar sıralamasına göre döner.
            <br>
            Önerilen boyut: 1920x450px veya 16:9 oranında yüksek çözünürlüklü görseller.
          </p>
        </div>
      </div>
    </div>

    <!-- Banners List -->
    <div class="bg-white shadow overflow-hidden sm:rounded-md mb-8">
      <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          Mevcut Bannerlar ({{ banners.length }}/5)
        </h3>
        <button
          v-if="banners.length < 5"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          @click="showAddModal = true"
        >
          <PlusIcon class="h-5 w-5 mr-2" />
          Yeni Banner Ekle
        </button>
      </div>

      <ul
        v-if="loading"
        class="divide-y divide-gray-200"
      >
        <li
          v-for="i in 3"
          :key="i"
          class="px-4 py-4 sm:px-6 animate-pulse"
        >
          <div class="h-24 bg-gray-200 rounded w-full" />
        </li>
      </ul>

      <ul
        v-else-if="banners.length > 0"
        class="divide-y divide-gray-200"
      >
        <li
          v-for="banner in banners"
          :key="banner.id"
          class="px-4 py-4 sm:px-6 hover:bg-gray-50"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div
                class="flex-shrink-0 h-24 w-40 relative rounded overflow-hidden bg-gray-100 border border-gray-200"
              >
                <img
                  :src="resolveImageUrl(banner.imageUrl)"
                  class="h-full w-full object-cover"
                >
              </div>
              <div>
                <div class="text-sm font-medium text-primary-600 truncate">
                  URL: {{ banner.linkUrl || 'Yönlendirme yok' }}
                </div>
                <div class="mt-1 flex items-center text-sm text-gray-500">
                  <span class="mr-2">Sıra: {{ banner.order }}</span>
                  <span class="mr-2">|</span>
                  <span :class="banner.isActive ? 'text-green-600' : 'text-red-600'">
                    {{ banner.isActive ? 'Aktif' : 'Pasif' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button
                class="text-gray-400 hover:text-gray-600 p-2"
                title="Durumu Değiştir"
                @click="toggleStatus(banner)"
              >
                <EyeIcon
                  v-if="banner.isActive"
                  class="h-5 w-5"
                />
                <EyeSlashIcon
                  v-else
                  class="h-5 w-5"
                />
              </button>
              <button
                class="text-red-400 hover:text-red-600 p-2"
                title="Sil"
                @click="deleteBanner(banner.id)"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
        </li>
      </ul>

      <div
        v-else
        class="p-8 text-center text-gray-500"
      >
        Henüz hiç banner eklemediniz. "Yeni Banner Ekle" butonunu kullanarak başlayın.
      </div>
    </div>

    <!-- Add Banner Modal -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          @click="showAddModal = false"
        />

        <span
          class="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >&#8203;</span>

        <div
          class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        >
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3
                  id="modal-title"
                  class="text-lg leading-6 font-medium text-gray-900"
                >
                  Yeni Banner Ekle
                </h3>
                <div class="mt-4 space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Banner Görseli
                      URL</label>
                    <div class="mt-1 flex rounded-md shadow-sm">
                      <input
                        v-model="newBanner.imageUrl"
                        type="text"
                        class="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                        placeholder="https://..."
                      >
                    </div>
                    <p class="mt-1 text-xs text-gray-500">
                      Görsel yükleme alanı opsiyonel
                      eklenebilir, şimdilik URL giriniz.
                    </p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Yönlendirme URL
                      (Opsiyonel)</label>
                    <div class="mt-1">
                      <input
                        v-model="newBanner.linkUrl"
                        type="text"
                        class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="/products/..."
                      >
                    </div>
                  </div>
                  <div class="flex items-center">
                    <input
                      v-model="newBanner.isActive"
                      type="checkbox"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    >
                    <label class="ml-2 block text-sm text-gray-900">
                      Aktif Olarak Yayınla
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
              :disabled="submitting"
              @click="createBanner"
            >
              {{ submitting ? 'Kaydediliyor...' : 'Kaydet' }}
            </button>
            <button
              type="button"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              @click="showAddModal = false"
            >
              İptal
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
    ArrowLeftIcon,
    PlusIcon,
    InformationCircleIcon,
    TrashIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
    layout: 'vendor',
    middleware: 'vendor'
})

useHead({
    title: 'Banner Yönetimi - Satıcı Paneli'
})

interface Banner {
  id: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
  order?: number;
}

const { resolveImageUrl } = useAppImage()
const toast = useNuxtApp().$toast

const banners = ref<Banner[]>([])
const loading = ref<boolean>(true)
const showAddModal = ref<boolean>(false)
const submitting = ref<boolean>(false)

const newBanner = ref({
    imageUrl: '',
    linkUrl: '',
    isActive: true
})

const fetchBanners = async () => {
    loading.value = true
    try {
        const { $api } = useApi()
        const data = await $api<Banner[]>('/api/vendor-banners')

        if (data.success && data.data) {
            banners.value = data.data
        }
    } catch (err: unknown) {
        console.error('Fetch banner error:', err)
        const error = err as { data?: { error?: string }; message?: string };
        toast.error(error.data?.error || error.message || 'Bannerlar yüklenirken hata oluştu')
    } finally {
        loading.value = false
    }
}

const createBanner = async () => {
    if (!newBanner.value.imageUrl) {
        toast.error('Görsel URL zorunludur')
        return
    }

    submitting.value = true
    try {
        const { $api } = useApi()
        const data = await $api<Banner>('/api/vendor-banners', {
            method: 'POST',
            body: newBanner.value
        })

        if (data.success) {
            toast.success('Banner başarıyla eklendi')
            showAddModal.value = false
            newBanner.value = { imageUrl: '', linkUrl: '', isActive: true }
            fetchBanners()
        }
    } catch (err: unknown) {
        console.error('Create banner error:', err)
        const error = err as { data?: { error?: string }; message?: string };
        toast.error(error.data?.error || error.message || 'Banner eklenirken hata oluştu')
    } finally {
        submitting.value = false
    }
}

const deleteBanner = async (id: string) => {
    if (!confirm('Bu bannerı silmek istediğinize emin misiniz?')) return

    try {
        const { $api } = useApi()
        const data = await $api<{success: boolean}>(`/api/vendor-banners/${id}`, {
            method: 'DELETE'
        })

        if (data.success) {
            toast.success('Banner silindi')
            fetchBanners()
        }
    } catch (err: unknown) {
        console.error('Delete banner error:', err)
        const error = err as { data?: { error?: string }; message?: string };
        toast.error(error.data?.error || error.message || 'Silme işlemi başarısız')
    }
}

const toggleStatus = async (banner: Banner) => {
    try {
        const { $api } = useApi()
        const data = await $api<{success: boolean}>(`/api/vendor-banners/${banner.id}`, {
            method: 'PUT',
            body: {
                isActive: !banner.isActive
            }
        })

        if (data.success) {
            toast.success('Durum güncellendi')
            fetchBanners()
        }
    } catch (err: unknown) {
        console.error('Update banner error:', err)
        const error = err as { data?: { error?: string }; message?: string };
        toast.error(error.data?.error || error.message || 'Güncelleme başarısız')
    }
}

onMounted(() => {
    fetchBanners()
})
</script>
