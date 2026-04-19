<template>
  <div class="p-8 max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 flex items-center">
          <MegaphoneIcon class="h-8 w-8 mr-3 text-primary-600" />
          {{ currentEcosystem === 'GLOBAL' ? '' : currentEcosystem + ' ' }}Yan Reklam Yönetimi
        </h1>
        <p class="text-gray-600 mt-1">
          Sol ve sağ sütun için en fazla 10'ar reklam ekleyebilirsiniz.
        </p>
      </div>
      <button
        v-if="sideAds.length < 20"
        class="bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-all font-bold flex items-center shadow-lg shadow-primary-200"
        @click="openModal()"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        Yeni Reklam Ekle
      </button>
    </div>

    <!-- Warnings -->
    <div
      v-if="localLeftAds.length >= 10 || localRightAds.length >= 10"
      class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-sm font-medium"
    >
      <ExclamationTriangleIcon class="h-5 w-5 text-amber-500 shrink-0" />
      Bir tarafta en fazla 10 reklam görüntülenebilir. Mevcut {{ localLeftAds.length + localRightAds.length }}
      reklamınız
      var.
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Left Column -->
      <div class="space-y-4">
        <div class="flex items-center justify-between px-2">
          <h2 class="text-lg font-black text-primary-900 flex items-center uppercase tracking-widest">
            <ArrowLeftIcon class="h-5 w-5 mr-2" /> Fırsat Alanı (Sol)
          </h2>
          <span
            :class="localLeftAds.length > 10 ? 'text-red-500' : 'text-gray-400'"
            class="text-xs font-bold bg-gray-100 px-2 py-1 rounded-lg"
          >
            {{ localLeftAds.length }}/10
          </span>
        </div>

        <div
          v-if="loading"
          class="space-y-4"
        >
          <div
            v-for="i in 3"
            :key="'skeleton-l-' + i"
            class="h-32 bg-gray-100 animate-pulse rounded-2xl"
          />
        </div>

        <div
          v-else
          class="min-h-[200px] border-2 border-dashed border-gray-100 rounded-[2rem] p-4"
        >
          <draggable
            v-model="localLeftAds"
            item-key="id"
            handle=".drag-handle"
            tag="div"
            class="space-y-4"
            @end="handleDragEnd"
          >
            <template #item="{ element }">
              <div
                class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex items-center gap-4"
              >
                <div class="drag-handle cursor-grab active:cursor-grabbing p-1 text-gray-300 hover:text-gray-600">
                  <Bars2Icon class="h-5 w-5" />
                </div>
                <div class="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                  <img
                    v-if="element.image"
                    :src="resolveImageUrl(element.image)"
                    class="w-full h-full object-cover"
                  >
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center text-2xl"
                  >
                    {{ element.emoji || '🎁'
                    }}
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-bold text-gray-900 truncate">
                    {{ element.title }}
                  </h4>
                  <p class="text-xs text-gray-500 truncate">
                    {{ element.subtitle }}
                  </p>
                  <div class="flex items-center gap-2 mt-1">
                    <span
                      :class="element.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
                      class="text-[8px] font-black uppercase px-2 py-0.5 rounded-full"
                    >
                      {{ element.isActive ? 'Aktif' : 'Pasif' }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    @click="openModal(element)"
                  >
                    <PencilIcon class="h-5 w-5" />
                  </button>
                  <button
                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    @click="deleteAd(element.id)"
                  >
                    <TrashIcon class="h-5 w-5" />
                  </button>
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>

      <!-- Right Column -->
      <div class="space-y-4">
        <div class="flex items-center justify-between px-2">
          <h2 class="text-lg font-black text-purple-900 flex items-center uppercase tracking-widest">
            Reklam Alanı (Sağ)
            <ArrowRightIcon class="h-5 w-5 ml-2" />
          </h2>
          <span
            :class="localRightAds.length > 10 ? 'text-red-500' : 'text-gray-400'"
            class="text-xs font-bold bg-gray-100 px-2 py-1 rounded-lg"
          >
            {{ localRightAds.length }}/10
          </span>
        </div>

        <div
          v-if="loading"
          class="space-y-4"
        >
          <div
            v-for="i in 3"
            :key="'skeleton-r-' + i"
            class="h-32 bg-gray-100 animate-pulse rounded-2xl"
          />
        </div>

        <div
          v-else
          class="min-h-[200px] border-2 border-dashed border-gray-100 rounded-[2rem] p-4"
        >
          <draggable
            v-model="localRightAds"
            item-key="id"
            handle=".drag-handle"
            tag="div"
            class="space-y-4"
            @end="handleDragEnd"
          >
            <template #item="{ element }">
              <div
                class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex items-center gap-4"
              >
                <div class="drag-handle cursor-grab active:cursor-grabbing p-1 text-gray-300 hover:text-gray-600">
                  <Bars2Icon class="h-5 w-5" />
                </div>
                <div class="w-16 h-16 rounded-xl bg-purple-100 overflow-hidden flex-shrink-0">
                  <img
                    v-if="element.image"
                    :src="resolveImageUrl(element.image)"
                    class="w-full h-full object-cover"
                  >
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center text-2xl"
                  >
                    {{ element.emoji || '🚀'
                    }}
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-bold text-gray-900 truncate">
                    {{ element.title }}
                  </h4>
                  <p class="text-xs text-gray-500 truncate">
                    {{ element.subtitle }}
                  </p>
                  <div class="flex items-center gap-2 mt-1">
                    <span
                      :class="element.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
                      class="text-[8px] font-black uppercase px-2 py-0.5 rounded-full"
                    >
                      {{ element.isActive ? 'Aktif' : 'Pasif' }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    @click="openModal(element)"
                  >
                    <PencilIcon class="h-5 w-5" />
                  </button>
                  <button
                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    @click="deleteAd(element.id)"
                  >
                    <TrashIcon class="h-5 w-5" />
                  </button>
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="modalOpen"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <div
        class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm shadow-xl"
        @click="closeModal"
      />
      <div
        class="relative bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
      >
        <div class="p-8 overflow-y-auto custom-scrollbar">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-2xl font-black text-gray-900 uppercase italic">
              {{ editingAd ? 'Reklamı Düzenle' : 'Yeni Reklam Ekle' }}
            </h3>
            <button
              class="p-2 hover:bg-gray-100 rounded-xl"
              @click="closeModal"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>

          <div class="space-y-6">
            <!-- Product Search (Quick Fill) -->
            <div class="relative">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1">🔍 Ürün
                Seçerek
                Hızlı Doldur</label>
              <div class="relative">
                <input
                  v-model="productSearch"
                  type="text"
                  placeholder="Ürün adı ile ara..."
                  class="w-full pl-11 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 outline-none"
                  @input="handleProductSearch"
                >
                <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              <!-- Search Results Dropdown -->
              <div
                v-if="searchResults.length > 0"
                class="absolute z-50 w-full mt-2 bg-white border rounded-[2rem] shadow-2xl max-h-60 overflow-y-auto border-gray-100 p-2"
              >
                <div
                  v-for="product in searchResults"
                  :key="product.id"
                  class="p-3 hover:bg-gray-50 cursor-pointer flex items-center space-x-4 rounded-2xl transition-all"
                  @click="selectProduct(product)"
                >
                  <img
                    :src="resolveImageUrl(product.image)"
                    class="w-12 h-12 rounded-xl object-cover bg-gray-100"
                  >
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-gray-900 truncate">
                      {{ product.name }}
                    </p>
                    <p class="text-xs text-gray-500 truncate">
                      {{ product.Category?.name }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1">Sütun
                  Seçimi</label>
                <select
                  v-model="form.side"
                  class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="LEFT">
                    Fırsat Alanı (Sol)
                  </option>
                  <option value="RIGHT">
                    Reklam Alanı (Sağ)
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1">Kategori
                  (Etiket)</label>
                <input
                  v-model="form.category"
                  type="text"
                  placeholder="Örn: EMLAK"
                  class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
                >
              </div>
              <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1">Emoji /
                  Simge</label>
                <input
                  v-model="form.emoji"
                  type="text"
                  placeholder="🎁"
                  class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
                >
              </div>
            </div>

            <div>
              <label
                class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1"
              >Başlık</label>
              <input
                v-model="form.title"
                type="text"
                class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
              >
            </div>

            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1">Alt
                Yazı</label>
              <input
                v-model="form.subtitle"
                type="text"
                class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
              >
            </div>

            <div class="space-y-4">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1">Görüneceği
                Sayfalar</label>
              <div class="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-2xl">
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input
                    v-model="form.ecosystems"
                    type="checkbox"
                    value="GLOBAL"
                    class="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  >
                  <span class="text-xs font-bold text-gray-700">Tümü (GLOBAL)</span>
                </label>
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input
                    v-model="form.ecosystems"
                    type="checkbox"
                    value="BAZARX"
                    class="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  >
                  <span class="text-xs font-bold text-gray-700">BazarX (Ana Sayfa)</span>
                </label>
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input
                    v-model="form.ecosystems"
                    type="checkbox"
                    value="TICARITAKAS"
                    class="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  >
                  <span class="text-xs font-bold text-gray-700">Ticari Takas (Surplus)</span>
                </label>
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input
                    v-model="form.ecosystems"
                    type="checkbox"
                    value="BARTER_BORSA"
                    class="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  >
                  <span class="text-xs font-bold text-gray-700">Barter Borsa</span>
                </label>
              </div>
            </div>

            <div class="space-y-4">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1">Hedef
                Bölge</label>
              <div class="grid grid-cols-2 gap-4">
                <select
                  v-model="form.locationTags.city"
                  class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
                  @change="form.locationTags.district = ''"
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
                <select
                  v-model="form.locationTags.district"
                  :disabled="!form.locationTags.city"
                  class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
                >
                  <option value="">
                    Tüm İlçeler
                  </option>
                  <option
                    v-for="district in districtList"
                    :key="district"
                    :value="district"
                  >
                    {{ district }}
                  </option>
                </select>
              </div>
            </div>

            <div class="space-y-4">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1">Görsel
                (Emoji
                veya URL)</label>

              <!-- Image Preview in Modal -->
              <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                <div
                  class="w-20 h-20 rounded-xl bg-white shadow-inner flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100 relative group"
                >
                  <img
                    v-if="form.image && form.image !== '[object Object]'"
                    :src="resolveImageUrl(form.image)"
                    class="w-full h-full object-cover"
                  >
                  <div
                    v-else
                    class="text-3xl"
                  >
                    {{ form.emoji || '🎁' }}
                  </div>

                  <div
                    v-if="uploading"
                    class="absolute inset-0 bg-white/80 flex items-center justify-center"
                  >
                    <div class="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
                <div class="flex-1 space-y-2">
                  <div class="flex items-center justify-between">
                    <p class="text-xs font-bold text-gray-600">
                      Görsel Önizleme
                    </p>
                    <button
                      :disabled="uploading"
                      class="text-[10px] font-black text-primary-600 uppercase hover:underline"
                      @click="triggerUpload"
                    >
                      {{ uploading ? 'YÜKLENİYOR...' : 'GÖRSEL YÜKLE' }}
                    </button>
                    <input
                      ref="fileInput"
                      type="file"
                      class="hidden"
                      accept="image/*"
                      @change="handleFileUpload"
                    >
                  </div>
                  <p class="text-[10px] text-gray-400">
                    Cihazınızdan bir görsel yükleyebilir veya aşağıdan URL
                    girebilirsiniz.
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1">Görsel
                    URL /
                    Yol</label>
                  <input
                    v-model="form.image"
                    type="text"
                    placeholder="https://... veya uploads/..."
                    class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-mono focus:ring-2 focus:ring-primary-500/20"
                  >
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1">Link /
                    Ürün
                    URL</label>
                  <input
                    v-model="form.link"
                    type="text"
                    placeholder="/products/..."
                    class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-mono focus:ring-2 focus:ring-primary-500/20"
                  >
                </div>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <button
                :class="form.isActive ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'"
                class="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                @click="form.isActive = !form.isActive"
              >
                {{ form.isActive ? 'Aktif' : 'Pasif' }}
              </button>
              <button
                :disabled="saving"
                class="flex-[2] btn-primary h-14 uppercase tracking-widest text-xs font-black shadow-xl shadow-primary-500/30"
                @click="saveAd"
              >
                {{ saving ? 'KAYDEDİLİYOR...' : 'REKLAMI KAYDET' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  MegaphoneIcon,
  PlusIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  Bars2Icon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline'
import draggable from 'vuedraggable'
import { debounce } from 'lodash-es'
import { iller } from '~/assets/css/data/component/iller'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { $api } = useApi()
const { $toast } = useNuxtApp()
const { resolveImageUrl } = useAppImage()
const route = useRoute()

const currentEcosystem = computed(() => route.query.ecosystem || 'GLOBAL')

const loading = ref(true)
const saving = ref(false)
const sideAds = ref([])
const modalOpen = ref(false)
const editingAd = ref(null)

const localLeftAds = ref([])
const localRightAds = ref([])

const productSearch = ref('')
const searchResults = ref([])
const fileInput = ref(null)
const uploading = ref(false)

const triggerUpload = () => fileInput.value?.click()

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  uploading.value = true
  try {
    const res = await $api('/api/upload?type=banner', {
      method: 'POST',
      body: formData
    })
    if (res.success) {
      form.value.image = res.url // This will be the full S3 URL or relative path
      $toast.success('Görsel yüklendi')
    }
  } catch (e) {
    $toast.error('Yükleme başarısız')
  } finally {
    uploading.value = false
  }
}

const handleProductSearch = debounce(async () => {
  if (productSearch.value.length < 2) {
    searchResults.value = []
    return
  }
  try {
    const res = await $api(`/api/products?search=${productSearch.value}`)
    searchResults.value = res.data || []
  } catch (e) {
    console.error('Search error:', e)
  }
}, 300)

const selectProduct = (product) => {
  form.value.title = product.name
  form.value.category = product.Category?.name?.toUpperCase() || ''
  form.value.subtitle = product.description?.substring(0, 60) + (product.description?.length > 60 ? '...' : '')
  form.value.link = `/products/${product.id}`
  form.value.image = product.image?.url || product.image || ''
  searchResults.value = []
  productSearch.value = ''
}

const form = ref({
  side: 'LEFT',
  title: '',
  category: '',
  subtitle: '',
  image: '',
  emoji: '',
  link: '',
  isActive: true,
  order: 0,
  ecosystems: ['GLOBAL'],
  locationTags: { city: '', district: '' }
})

// Computed for cities and districts
const cityList = computed(() => Object.keys(iller))
const districtList = computed(() => {
  if (form.value.locationTags?.city && iller[form.value.locationTags.city]) {
    return iller[form.value.locationTags.city]
  }
  return []
})

// Helper: Backend locations array'ini { city, district } formata çevir
const parseLocationsToTags = (locations) => {
  if (!locations || locations.length === 0) return { city: '', district: '' }
  const tags = locations.map(l => l.tag)
  const districtTag = tags.find(t => t.includes('-'))
  if (districtTag) {
    const [city, district] = districtTag.split('-')
    return { city, district }
  }
  return { city: tags[0] || '', district: '' }
}

const fetchAds = async () => {
  loading.value = true
  try {
    const res = await $api(`/api/admin/side-ads?ecosystem=${currentEcosystem.value}`)
    sideAds.value = res.data || []

    // Sync local lists
    localLeftAds.value = sideAds.value.filter(ad => ad.side === 'LEFT').sort((a, b) => a.order - b.order)
    localRightAds.value = sideAds.value.filter(ad => ad.side === 'RIGHT').sort((a, b) => a.order - b.order)
  } catch (e) {
    $toast.error('Reklamlar yüklenemedi')
  } finally {
    loading.value = false
  }
}

const openModal = (ad = null) => {
  editingAd.value = ad
  if (ad) {
    form.value = { ...ad, locationTags: parseLocationsToTags(ad.locations) }
  } else {
    form.value = {
      side: 'LEFT',
      title: '',
      category: '',
      subtitle: '',
      image: '',
      emoji: '',
      link: '',
      isActive: true,
      order: sideAds.value.length,
      ecosystems: [currentEcosystem.value],
      locationTags: { city: '', district: '' }
    }
  }
  modalOpen.value = true
}

const closeModal = () => {
  modalOpen.value = false
  editingAd.value = null
  productSearch.value = ''
  searchResults.value = []
}

const saveAd = async () => {
  if (!form.value.title) return $toast.error('Başlık zorunludur')

  saving.value = true
  try {
    const url = editingAd.value
      ? `/api/admin/side-ads/${editingAd.value.id}`
      : '/api/admin/side-ads'
    const method = editingAd.value ? 'PUT' : 'POST'

    await $api(url, {
      method,
      body: { ...form.value }
    })

    $toast.success('Reklam kaydedildi')
    await fetchAds()
    closeModal()
  } catch (e) {
    $toast.error('Hata oluştu')
  } finally {
    saving.value = false
  }
}

const deleteAd = async (id) => {
  if (!confirm('Bu reklamı silmek istediğinize emin misiniz?')) return

  try {
    await $api(`/api/admin/side-ads/${id}`, {
      method: 'DELETE'
    })
    $toast.success('Reklam silindi')
    fetchAds()
  } catch (e) {
    $toast.error('Hata oluştu')
  }
}

const handleDragEnd = async () => {
  // Combine lists with new order
  const updatedAds = [
    ...localLeftAds.value.map((ad, idx) => ({ ...ad, order: idx })),
    ...localRightAds.value.map((ad, idx) => ({ ...ad, order: idx }))
  ]

  try {
    const updatePromises = updatedAds.map(ad =>
      $api(`/api/admin/side-ads/${ad.id}`, {
        method: 'PUT',
        body: ad
      })
    )
    await Promise.all(updatePromises)
    $toast.success('Sıralama güncellendi')
  } catch (e) {
    console.error('Reorder update failed')
  }
}

onMounted(fetchAds)
</script>

<style scoped>
.drag-handle {
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #f1f5f9;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #e2e8f0;
}
</style>
