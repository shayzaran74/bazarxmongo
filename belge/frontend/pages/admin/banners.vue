<template>
  <div class="p-6 max-w-10xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          🖼️ {{ currentEcosystem === 'GLOBAL' ? '' :
            currentEcosystem + ' ' }}Banner Yönetimi
        </h1>
        <p class="text-gray-500 mt-1">
          Ana sayfa üst kısmında görünen kayan banner'ları yönetin
        </p>
      </div>
      <button
        class="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-bold flex items-center shadow-lg shadow-primary-200"
        @click="openCreateModal"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        Yeni Banner Ekle
      </button>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex items-center justify-center py-20"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="banners.length === 0"
      class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center"
    >
      <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <PhotoIcon class="h-10 w-10 text-gray-400" />
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">
        Henüz Banner Eklenmemiş
      </h3>
      <p class="text-gray-500 mb-6">
        Ana sayfada görüntülenecek banner'lar ekleyin.
      </p>
      <button
        class="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-bold"
        @click="openCreateModal"
      >
        İlk Banner'ı Ekle
      </button>
    </div>

    <!-- Banners Grid -->
    <div
      v-else
      class="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      <div
        v-for="(banner, index) in banners"
        :key="banner.id"
        class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all"
      >
        <!-- Banner Preview -->
        <div class="relative h-48 overflow-hidden">
          <img
            :src="getImageUrl(banner.imageUrl)"
            :alt="banner.title"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          <!-- Status Badge -->
          <div class="absolute top-3 left-3">
            <span :class="['px-3 py-1 rounded-full text-xs font-bold', STATUS_CONFIG[banner.isActive].class]">
              {{ STATUS_CONFIG[banner.isActive].label }}
            </span>
          </div>

          <!-- Order Badge -->
          <div class="absolute top-3 right-3">
            <span class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold text-white">
              #{{ index + 1 }}
            </span>
          </div>

          <!-- Position Badge -->
          <div class="absolute bottom-3 right-3">
            <span
              class="px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20"
            >
              {{ POSITION_CONFIG[banner.position]?.label || banner.position }}
            </span>
          </div>

          <!-- Content Overlay -->
          <div class="absolute bottom-0 left-0 right-0 p-4">
            <h3 class="text-xl font-bold text-white mb-1">
              {{ banner.title }}
            </h3>
            <p
              v-if="banner.description"
              class="text-sm text-white/80 line-clamp-1"
            >
              {{ banner.description }}
            </p>
          </div>
        </div>

        <!-- Banner Details -->
        <div class="p-4">
          <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span class="text-gray-500 block text-xs font-medium mb-1">Başlangıç</span>
              <span class="font-bold text-gray-900">{{ formatDate(banner.startDate) }}</span>
            </div>
            <div>
              <span class="text-gray-500 block text-xs font-medium mb-1">Bitiş</span>
              <span class="font-bold text-gray-900">{{ banner.endDate ? formatDate(banner.endDate) :
                'Süresiz' }}</span>
            </div>
          </div>

          <div
            v-if="banner.linkUrl"
            class="mb-4"
          >
            <span class="text-gray-500 block text-xs font-medium mb-1">Link</span>
            <a
              :href="banner.linkUrl"
              target="_blank"
              class="text-primary-600 hover:underline text-sm truncate block"
            >
              {{ banner.linkUrl }}
            </a>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 pt-4 border-t border-gray-100">
            <button
              class="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-700 transition-colors flex items-center justify-center"
              @click="editBanner(banner)"
            >
              <PencilSquareIcon class="h-4 w-4 mr-1" />
              Düzenle
            </button>
            <button
              class="flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center"
              :class="TOGGLE_CONFIG[banner.isActive].class"
              @click="toggleBannerStatus(banner)"
            >
              {{ TOGGLE_CONFIG[banner.isActive].label }}
            </button>
            <button
              class="p-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-600 transition-colors"
              @click="confirmDelete(banner)"
            >
              <TrashIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 class="text-xl font-bold text-gray-900">
            {{ isEditing ? '🖼️ Banner Düzenle' : '➕ Yeni Banner Ekle' }}
          </h2>
          <button
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            @click="closeModal"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-6">
          <!-- Title -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Başlık *</label>
            <input
              v-model="formData.title"
              type="text"
              placeholder="Banner başlığı"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Açıklama</label>
            <textarea
              v-model="formData.description"
              rows="3"
              placeholder="Banner açıklaması (opsiyonel)"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
            />
          </div>

          <!-- Image Upload -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Banner Görseli *</label>
            <div class="space-y-4">
              <!-- Preview -->
              <div
                v-if="formData.imageUrl || imagePreview"
                class="relative h-32 rounded-xl overflow-hidden border border-gray-200"
              >
                <img
                  :src="imagePreview || getImageUrl(formData.imageUrl)"
                  class="w-full h-full object-cover"
                >
                <button
                  class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  @click="removeImage"
                >
                  <TrashIcon class="h-4 w-4" />
                </button>
              </div>

              <!-- Upload Button -->
              <div
                v-else
                class="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary-300 transition-colors"
              >
                <PhotoIcon class="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p class="text-sm text-gray-500 mb-3">
                  PNG, JPG veya WebP (Maks. 5MB)
                </p>
                <p class="text-xs text-gray-400 mb-3">
                  Önerilen boyut: 1920x400 piksel
                </p>
              </div>

              <div class="flex gap-2">
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleFileChange"
                >
                <button
                  :disabled="uploading"
                  class="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold text-gray-700 transition-colors flex items-center justify-center disabled:opacity-50"
                  @click="$refs.fileInput.click()"
                >
                  <ArrowUpTrayIcon class="h-4 w-4 mr-2" />
                  {{ uploading ? 'Yükleniyor...' : 'Görsel Yükle' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Link URL -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Link URL</label>
            <input
              v-model="formData.linkUrl"
              type="text"
              placeholder="https://... veya /products/..."
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
            <p class="text-xs text-gray-500 mt-1">
              Tıklandığında yönlendirilecek adres
            </p>
          </div>

          <!-- Dates -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Başlangıç Tarihi</label>
              <input
                v-model="formData.startDate"
                type="datetime-local"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Bitiş Tarihi</label>
              <input
                v-model="formData.endDate"
                type="datetime-local"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
              <p class="text-xs text-gray-500 mt-1">
                Boş bırakılırsa süresiz kalır
              </p>
            </div>
          </div>

          <!-- Order -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Sıralama</label>
            <input
              v-model.number="formData.order"
              type="number"
              min="0"
              placeholder="0"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
            <p class="text-xs text-gray-500 mt-1">
              Küçük numara önce gösterilir
            </p>
          </div>

          <!-- Position Selection -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Görünüm Pozisyonu</label>
            <div class="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl">
              <label
                class="flex items-center space-x-3 cursor-pointer p-3 rounded-lg transition-all"
                :class="formData.position === 'home_top' ? 'bg-white shadow-sm ring-1 ring-primary-500/20' : ''"
              >
                <input
                  v-model="formData.position"
                  type="radio"
                  value="home_top"
                  class="w-5 h-5 border-gray-300 text-primary-600 focus:ring-primary-500"
                >
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-gray-900">Üst Slider</span>
                  <span class="text-[10px] text-gray-500 uppercase tracking-wider">Home Top</span>
                </div>
              </label>
              <label
                class="flex items-center space-x-3 cursor-pointer p-3 rounded-lg transition-all"
                :class="formData.position === 'home_middle' ? 'bg-white shadow-sm ring-1 ring-primary-500/20' : ''"
              >
                <input
                  v-model="formData.position"
                  type="radio"
                  value="home_middle"
                  class="w-5 h-5 border-gray-300 text-primary-600 focus:ring-primary-500"
                >
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-gray-900">Orta Alan</span>
                  <span class="text-[10px] text-gray-500 uppercase tracking-wider">Home Middle</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Ecosystem Selection -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Görüneceği Sayfalar</label>
            <div class="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl">
              <label class="flex items-center space-x-3 cursor-pointer">
                <input
                  v-model="formData.ecosystems"
                  type="checkbox"
                  value="GLOBAL"
                  class="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                >
                <span class="text-sm font-medium text-gray-700">Tümü (GLOBAL)</span>
              </label>
              <label class="flex items-center space-x-3 cursor-pointer">
                <input
                  v-model="formData.ecosystems"
                  type="checkbox"
                  value="BAZARX"
                  class="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                >
                <span class="text-sm font-medium text-gray-700">BazarX (Ana Sayfa)</span>
              </label>
              <label class="flex items-center space-x-3 cursor-pointer">
                <input
                  v-model="formData.ecosystems"
                  type="checkbox"
                  value="TICARITAKAS"
                  class="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                >
                <span class="text-sm font-medium text-gray-700">Ticari Takas (Surplus)</span>
              </label>
              <label class="flex items-center space-x-3 cursor-pointer">
                <input
                  v-model="formData.ecosystems"
                  type="checkbox"
                  value="BARTER_BORSA"
                  class="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                >
                <span class="text-sm font-medium text-gray-700">Barter Borsa</span>
              </label>
            </div>
          </div>

          <!-- Location Targeting (City & District) -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Hedef İl</label>
              <select
                v-model="formData.locationTags.city"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
                @change="formData.locationTags.district = ''"
              >
                <option value="">
                  Tüm İller
                </option>
                <option
                  v-for="city in cityList"
                  :key="city"
                  :value="city"
                >
                  {{ city }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Hedef İlçe</label>
              <select
                v-model="formData.locationTags.district"
                :disabled="!formData.locationTags.city"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">
                  Tüm İlçeler
                </option>
                <option
                  v-for="district in districtList"
                  :key="district"
                  :value="district"
                >
                  {{ district
                  }}
                </option>
              </select>
            </div>
          </div>

          <!-- Active Status -->
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h4 class="font-bold text-gray-900">
                Aktif
              </h4>
              <p class="text-sm text-gray-500">
                Banner ana sayfada görünsün mü?
              </p>
            </div>
            <button
              :class="[
                'relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                formData.isActive ? 'bg-primary-600' : 'bg-gray-200'
              ]"
              @click="formData.isActive = !formData.isActive"
            >
              <span
                :class="[
                  'pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow transition',
                  formData.isActive ? 'translate-x-7' : 'translate-x-0'
                ]"
              />
            </button>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
          <button
            class="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-bold transition-colors"
            @click="closeModal"
          >
            İptal
          </button>
          <button
            :disabled="saving || !formData.title || !formData.imageUrl"
            class="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-xl text-white font-bold transition-colors disabled:opacity-50 flex items-center"
            @click="saveBanner"
          >
            <div
              v-if="saving"
              class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"
            />
            {{ saving ? 'Kaydediliyor...' : (isEditing ? 'Güncelle' : 'Ekle') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="showDeleteModal = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div class="text-center">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrashIcon class="h-8 w-8 text-red-600" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            Banner'ı Sil
          </h3>
          <p class="text-gray-500 mb-6">
            "{{ bannerToDelete?.title }}" banner'ını silmek istediğinize emin misiniz? Bu işlem geri
            alınamaz.
          </p>
          <div class="flex gap-3">
            <button
              class="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-700 transition-colors"
              @click="showDeleteModal = false"
            >
              İptal
            </button>
            <button
              :disabled="deleting"
              class="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-white transition-colors disabled:opacity-50"
              @click="deleteBanner"
            >
              {{ deleting ? 'Siliniyor...' : 'Sil' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
    PlusIcon,
    PhotoIcon,
    PencilSquareIcon,
    TrashIcon,
    XMarkIcon,
    ArrowUpTrayIcon
} from '@heroicons/vue/24/outline'
import { iller } from '~/assets/css/data/component/iller'

definePageMeta({
    layout: 'admin',
    middleware: 'admin'
})

useHead({
    title: 'Banner Yönetimi - Admin'
})

const config = useRuntimeConfig()
const toast = useNuxtApp().$toast
const { $api } = useApi()
const route = useRoute()

const currentEcosystem = computed(() => route.query.ecosystem || 'GLOBAL')

// State
const banners = ref([])
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const uploading = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const editingBannerId = ref(null)
const bannerToDelete = ref(null)
const imagePreview = ref(null)

const defaultFormData = {
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    order: 0,
    isActive: true,
    startDate: '',
    endDate: '',
    ecosystems: ['GLOBAL'],
    position: 'home_top',
    locationTags: { city: '', district: '' }
}

const formData = ref({ ...defaultFormData })

// Computed for cities and districts
const cityList = computed(() => Object.keys(iller))
const districtList = computed(() => {
    if (formData.value.locationTags?.city && iller[formData.value.locationTags.city]) {
        return iller[formData.value.locationTags.city]
    }
    return []
})

// Helper: Backend locations array'ini { city, district } formata çevir
const parseLocationsToTags = (locations) => {
    if (!locations || locations.length === 0) return { city: '', district: '' }
    // En uzun tag'i bul (şehir-ilçe formatı)
    const tags = locations.map(l => l.tag)
    const districtTag = tags.find(t => t.includes('-'))
    if (districtTag) {
        const [city, district] = districtTag.split('-')
        return { city, district }
    }
    // Sadece şehir var
    return { city: tags[0] || '', district: '' }
}

// Methods
const getImageUrl = (url) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    return `${config.public.apiBase}${url}`
}

const formatDate = (dateString) => {
    if (!dateString) return 'Süresiz'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Süresiz'
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const fetchBanners = async () => {
    loading.value = true
    try {
        const data = await $api(`/api/admin/banners?ecosystem=${currentEcosystem.value}`)
        if (data.success) {
            banners.value = data.data
        }
    } catch (error) {
        console.error('Fetch banners error:', error)
        toast.error('Banner\'lar yüklenirken hata oluştu')
    } finally {
        loading.value = false
    }
}

const openCreateModal = () => {
    isEditing.value = false
    editingBannerId.value = null
    formData.value = { ...defaultFormData, locationTags: { city: '', district: '' } }
    imagePreview.value = null
    showModal.value = true
}

const editBanner = (banner) => {
    isEditing.value = true
    editingBannerId.value = banner.id
    formData.value = {
        title: banner.title,
        description: banner.description || '',
        imageUrl: banner.imageUrl,
        linkUrl: banner.linkUrl || '',
        order: banner.order,
        isActive: banner.isActive,
        startDate: banner.startDate ? new Date(new Date(banner.startDate).getTime() - new Date(banner.startDate).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '',
        endDate: banner.endDate ? new Date(new Date(banner.endDate).getTime() - new Date(banner.endDate).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '',
        ecosystems: banner.ecosystems || ['GLOBAL'],
        position: banner.position || 'home_top',
        locationTags: parseLocationsToTags(banner.locations)
    }
    imagePreview.value = null
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    formData.value = { ...defaultFormData, locationTags: { city: '', district: '' } }
    imagePreview.value = null
}

const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Frontend validation
    const validation = validateImage(file)
    if (!validation.isValid) {
        toast.error(validation.error)
        return
    }

    if (!file.type.startsWith('image/')) {
        toast.error('Lütfen bir görsel dosyası seçin')
        return
    }

    if (file.size > 5 * 1024 * 1024) {
        toast.error('Dosya boyutu 5MB\'dan küçük olmalı')
        return
    }

    uploading.value = true
    imagePreview.value = URL.createObjectURL(file)

    try {
        const uploadFormData = new FormData()
        uploadFormData.append('file', file)

        const data = await $api('/api/upload?type=banner', {
            method: 'POST',
            body: uploadFormData
        })

        if (data.success) {
            formData.value.imageUrl = data.url
            toast.success('Görsel yüklendi')
        }
    } catch (error) {
        console.error('Upload error:', error)
        toast.error('Görsel yüklenirken hata oluştu')
        imagePreview.value = null
    } finally {
        uploading.value = false
        event.target.value = ''
    }
}

const removeImage = () => {
    formData.value.imageUrl = ''
    imagePreview.value = null
}

const saveBanner = async () => {
    if (!formData.value.title || !formData.value.imageUrl) {
        toast.error('Başlık ve görsel gereklidir')
        return
    }

    saving.value = true
    try {
        const payload = {
            title: formData.value.title,
            description: formData.value.description || null,
            imageUrl: formData.value.imageUrl,
            linkUrl: formData.value.linkUrl || null,
            order: formData.value.order,
            isActive: formData.value.isActive,
            startDate: formData.value.startDate || null,
            endDate: formData.value.endDate || null,
            ecosystems: formData.value.ecosystems,
            position: formData.value.position,
            locationTags: formData.value.locationTags
        }

        let data
        if (isEditing.value) {
            data = await $api(`/api/admin/banners/${editingBannerId.value}`, {
                method: 'PUT',
                body: payload
            })
        } else {
            data = await $api('/api/admin/banners', {
                method: 'POST',
                body: payload
            })
        }

        if (data.success) {
            toast.success(isEditing.value ? 'Banner güncellendi' : 'Banner oluşturuldu')
            closeModal()
            fetchBanners()
        }
    } catch (error) {
        console.error('Save banner error:', error)
        toast.error('Banner kaydedilemedi')
    } finally {
        saving.value = false
    }
}

const toggleBannerStatus = async (banner) => {
    try {
        const data = await $api(`/api/admin/banners/${banner.id}`, {
            method: 'PUT',
            body: {
                isActive: !banner.isActive
            }
        })

        if (data.success) {
            toast.success(banner.isActive ? 'Banner pasifleştirildi' : 'Banner aktifleştirildi')
            fetchBanners()
        }
    } catch (error) {
        console.error('Toggle status error:', error)
        toast.error('Durum güncellenemedi')
    }
}

const confirmDelete = (banner) => {
    bannerToDelete.value = banner
    showDeleteModal.value = true
}

const deleteBanner = async () => {
    if (!bannerToDelete.value) return

    deleting.value = true
    try {
        const data = await $api(`/api/admin/banners/${bannerToDelete.value.id}`, {
            method: 'DELETE'
        })

        if (data.success) {
            toast.success('Banner silindi')
            showDeleteModal.value = false
            bannerToDelete.value = null
            fetchBanners()
        }
    } catch (error) {
        console.error('Delete banner error:', error)
        toast.error('Banner silinemedi')
    } finally {
        deleting.value = false
    }
}

// UI Configuration Maps
const STATUS_CONFIG = {
    true: { label: '✅ Aktif', class: 'bg-green-500 text-white' },
    false: { label: '⏸️ Pasif', class: 'bg-gray-500 text-white' }
}

const POSITION_CONFIG = {
    home_top: { label: 'ÜST SLIDER' },
    home_middle: { label: 'ORTA ALAN' }
}

const TOGGLE_CONFIG = {
    true: { label: '⏸️ Pasifle', class: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
    false: { label: '▶️ Aktifle', class: 'bg-green-100 text-green-700 hover:bg-green-200' }
}

// Initialize
onMounted(() => {
    fetchBanners()
})
</script>
