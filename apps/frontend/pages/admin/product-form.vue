<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <NuxtLink
              to="/admin/products"
              class="text-gray-500 hover:text-gray-700 mr-4"
            >
              <ChevronLeftIcon class="h-5 w-5" />
            </NuxtLink>
            <h1 class="text-xl font-semibold text-gray-900">
              {{ isEditing ? 'Ürünü Düzenle' : 'Ürün Ekle' }}
            </h1>
          </div>
          <div class="flex items-center space-x-3">
            <NuxtLink
              to="/admin/products"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              İptal
            </NuxtLink>
            <button
              :disabled="saving"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              @click="saveProduct"
            >
              {{ saving ? 'Kaydediliyor...' : 'Kaydet' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Başlık ve Açıklama -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Başlık
                  </label>
                  <input
                    v-model="form.name"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Kısa kollu tişört"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    v-model="form.description"
                    rows="8"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ürün açıklaması..."
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Medya -->
          <div class="p-6">
            <h3 class="text-sm font-medium text-gray-900 mb-4 flex items-center justify-between">
              Medya (3-5 Görsel)
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
                {{ form.productImages.length }} / 5
              </span>
            </h3>

            <div class="space-y-4">
              <div
                class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors bg-gray-50/30"
              >
                <div class="space-y-3">
                  <div class="flex justify-center">
                    <div class="bg-blue-100 p-3 rounded-full">
                      <PhotoIcon class="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <div class="text-sm text-gray-600">
                    <label class="cursor-pointer text-blue-600 hover:text-blue-700 font-bold">
                      <span>Dosya yükle</span>
                      <input
                        type="file"
                        class="hidden"
                        accept="image/*"
                        multiple
                        @change="handleFileUpload"
                      >
                    </label>
                    veya sürükle bırak
                  </div>
                  <p class="text-xs text-gray-500 font-medium tracking-tight">
                    En az 3, en fazla 5 görsel (WebP formatına
                    otomatik dönüştürülür)
                  </p>
                </div>
              </div>

              <!-- Multiple Images Preview & Management -->
              <div
                v-if="form.productImages.length > 0"
                class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6"
              >
                <div
                  v-for="(img, index) in form.productImages"
                  :key="index"
                  class="relative group aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm hover:border-blue-500 transition-all"
                >
                  <img
                    :src="img"
                    alt="Ürün Görseli"
                    class="w-full h-full object-cover"
                  >

                  <!-- Tools Overlay -->
                  <div
                    class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2"
                  >
                    <button
                      type="button"
                      class="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      title="Sil"
                      @click="removeImage(index)"
                    >
                      <TrashIcon class="h-4 w-4" />
                    </button>
                    <button
                      v-if="index !== 0"
                      type="button"
                      class="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors shadow-lg"
                      title="Ana Görsel Yap"
                      @click="setAsMain(index)"
                    >
                      <StarIcon class="h-4 w-4" />
                    </button>
                  </div>

                  <!-- Main Image Badge -->
                  <div
                    v-if="index === 0"
                    class="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm"
                  >
                    ANA GÖRSEL
                  </div>
                </div>
              </div>

              <!-- Empty State / Placeholder for Min Count -->
              <div
                v-if="form.productImages.length < 3"
                class="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center text-amber-800 text-sm"
              >
                <ExclamationTriangleIcon class="h-5 w-5 mr-3 flex-shrink-0" />
                Lütfen en az 3 görsel yükleyin. (Şu an: {{ form.productImages.length }}/3)
              </div>
            </div>
          </div>

          <!-- Fiyat -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-6">
              <h3 class="text-sm font-medium text-gray-900 mb-4">
                Fiyat
              </h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm text-gray-700 mb-1">Fiyat</label>
                  <div class="relative">
                    <span class="absolute left-3 top-2 text-gray-500">₺</span>
                    <input
                      v-model.number="form.price"
                      type="number"
                      step="0.01"
                      class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    >
                  </div>
                </div>

                <div>
                  <label class="block text-sm text-gray-700 mb-1">Karşılaştırma fiyatı</label>
                  <div class="relative">
                    <span class="absolute left-3 top-2 text-gray-500">₺</span>
                    <input
                      v-model.number="form.compareAtPrice"
                      type="number"
                      step="0.01"
                      class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    >
                  </div>
                </div>
              </div>

              <div class="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm text-gray-700 mb-1">Ürün başına maliyet</label>
                  <div class="relative">
                    <span class="absolute left-3 top-2 text-gray-500">₺</span>
                    <input
                      v-model.number="form.costPerItem"
                      type="number"
                      step="0.01"
                      class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    >
                  </div>
                </div>

                <div class="flex items-end">
                  <label class="flex items-center space-x-2">
                    <input
                      v-model="form.isTaxable"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    >
                    <span class="text-sm text-gray-700">Vergi al</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Envanter -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-6">
              <h3 class="text-sm font-medium text-gray-900 mb-4">
                Envanter
              </h3>

              <div class="space-y-4">
                <div class="flex items-center">
                  <input
                    v-model="form.trackInventory"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  >
                  <label class="ml-2 text-sm text-gray-700">Envanter takip ediliyor</label>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm text-gray-700 mb-1">Miktar</label>
                    <input
                      v-model.number="form.stock"
                      type="number"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    >
                  </div>

                  <div>
                    <label class="block text-sm text-gray-700 mb-1">Mağaza konumu</label>
                    <select
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option>Mağaza konumu mevcut adedi</option>
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm text-gray-700 mb-1">SKU</label>
                    <input
                      v-model="form.sku"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="SKU"
                    >
                  </div>

                  <div>
                    <label class="block text-sm text-gray-700 mb-1">Barkod</label>
                    <input
                      v-model="form.barcode"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Barkod"
                    >
                  </div>
                </div>

                <div>
                  <label class="flex items-center space-x-2">
                    <span class="text-sm text-gray-700">Stokta yokken sat</span>
                    <div class="relative inline-block w-10 mr-2 align-middle select-none">
                      <input
                        v-model="form.continueSellingOutOfStock"
                        type="checkbox"
                        class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      >
                      <label
                        class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                      />
                    </div>
                    <span
                      class="text-sm"
                      :class="form.continueSellingOutOfStock ? 'text-blue-600' : 'text-gray-500'"
                    >
                      {{ form.continueSellingOutOfStock ? 'Açık' : 'Kapalı' }}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Kargo -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-6">
              <h3 class="text-sm font-medium text-gray-900 mb-4">
                Kargo
              </h3>

              <div class="space-y-4">
                <div class="flex items-center">
                  <input
                    v-model="form.requiresShipping"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  >
                  <label class="ml-2 text-sm text-gray-700">Fiziksel ürün</label>
                </div>

                <div>
                  <label class="block text-sm text-gray-700 mb-1">Ürün ağırlığı (kg)</label>
                  <input
                    v-model.number="form.weight"
                    type="number"
                    step="0.01"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.0"
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Arama Motoru Liste Kaydı -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-6">
              <h3 class="text-sm font-medium text-gray-900 mb-2">
                Arama Motoru Liste Kaydı
              </h3>
              <p class="text-sm text-gray-500 mb-4">
                Bu ürün öğesinin bir arama motoru liste kaydında nasıl görünebileceğini görmek için başlık ve açıklama
                ekleyin
              </p>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm text-gray-700 mb-1">Sayfa başlığı</label>
                  <input
                    v-model="form.metaTitle"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Örn: Kısa kollu tişört"
                  >
                </div>

                <div>
                  <label class="block text-sm text-gray-700 mb-1">Meta açıklama</label>
                  <textarea
                    v-model="form.metaDescription"
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ürün açıklaması..."
                  />
                </div>

                <div>
                  <label class="block text-sm text-gray-700 mb-1">URL Slug</label>
                  <input
                    v-model="form.slug"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="kisa-kollu-tisort"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
          <!-- Durum -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-6">
              <h3 class="text-sm font-medium text-gray-900 mb-4">
                Durum
              </h3>
              <select
                v-model="form.isActive"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option :value="true">
                  Aktif
                </option>
                <option :value="false">
                  Taslak
                </option>
              </select>
            </div>
          </div>

          <!-- Yayınlama -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-6">
              <h3 class="text-sm font-medium text-gray-900 mb-4">
                Yayınlama
              </h3>
              <div class="space-y-2 text-sm">
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">Online Mağaza</span>
                  <CheckIcon class="h-5 w-5 text-green-600" />
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">Point of Sale</span>
                  <CheckIcon class="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          <!-- Ürün organizasyonu -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-6">
              <h3 class="text-sm font-medium text-gray-900 mb-4">
                Ürün organizasyonu
              </h3>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm text-gray-700 mb-2">Kategori (Trendyol Stili) *</label>

                  <div class="space-y-3">
                    <!-- Ana Kategori -->
                    <select
                      v-model="selectedMainCategory"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      @change="handleMainCategoryChange"
                    >
                      <option value="">
                        Ana Kategori Seçin
                      </option>
                      <option
                        v-for="cat in mainCategories"
                        :key="cat.id"
                        :value="cat.id"
                      >
                        {{ cat.name }}
                      </option>
                    </select>

                    <!-- Alt Kategori 1 -->
                    <select
                      v-if="selectedMainCategory && subCategories1.length > 0"
                      v-model="selectedSubCategory1"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      @change="handleSubCategory1Change"
                    >
                      <option value="">
                        Alt Kategori Seçin
                      </option>
                      <option
                        v-for="cat in subCategories1"
                        :key="cat.id"
                        :value="cat.id"
                      >
                        {{ cat.name }}
                      </option>
                    </select>

                    <!-- Alt Kategori 2 (Leaf) -->
                    <select
                      v-if="selectedSubCategory1 && subCategories2.length > 0"
                      v-model="selectedSubCategory2"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      @change="handleSubCategory2Change"
                    >
                      <option value="">
                        Alt Kategori (Detay) Seçin
                      </option>
                      <option
                        v-for="cat in subCategories2"
                        :key="cat.id"
                        :value="cat.id"
                      >
                        {{ cat.name }}
                      </option>
                    </select>
                  </div>

                  <div
                    v-if="form.categoryId"
                    class="mt-2 text-xs text-blue-600 font-medium"
                  >
                    Seçili Kategori ID: {{ form.categoryId }}
                  </div>
                </div>

                <div>
                  <label class="block text-sm text-gray-700 mb-1">Tür</label>
                  <input
                    v-model="form.productType"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Örn: Giyim"
                  >
                </div>

                <div>
                  <label class="block text-sm text-gray-700 mb-1">Satıcı</label>
                  <input
                    v-model="form.vendor"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Örn: Nike"
                  >
                </div>

                <div>
                  <label class="block text-sm text-gray-700 mb-1">Etiketler</label>
                  <input
                    v-model="form.tags"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Virgülle ayırın"
                  >
                  <p class="mt-1 text-xs text-gray-500">
                    Virgülle ayrılmış etiketler girin
                  </p>
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
import {
  ChevronLeftIcon,
  PhotoIcon,
    CheckIcon,
  TrashIcon,
  StarIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

console.log('🔵 CREATE PAGE LOADED!')

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const route = useRoute()
const { $api } = useApi()
const isEditing = computed(() => !!route.params.id)
const saving = ref(false)
const allCategories = ref([])
const mainCategories = computed(() => allCategories.value.filter(c => !c.parentId))

const selectedMainCategory = ref('')
const selectedSubCategory1 = ref('')
const selectedSubCategory2 = ref('')

const subCategories1 = computed(() => {
  if (!selectedMainCategory.value) return []
  return allCategories.value.filter(c => c.parentId === selectedMainCategory.value)
})

const subCategories2 = computed(() => {
  if (!selectedSubCategory1.value) return []
  return allCategories.value.filter(c => c.parentId === selectedSubCategory1.value)
})

const form = ref({
  name: '',
  description: '',
  image: '',
  productImages: [],
  price: 0,
  compareAtPrice: 0,
  costPerItem: 0,
  stock: 0,
  sku: '',
  barcode: '',
  trackInventory: true,
  continueSellingOutOfStock: false,
  weight: 0,
  requiresShipping: true,
  isActive: true,
  isTaxable: true,
  categoryId: '',
  productType: '',
  vendor: '',
  tags: '',
  metaTitle: '',
  metaDescription: '',
  slug: ''
})

// Match category hierarchy when categories load or product loads
watch([allCategories, () => form.value.categoryId], ([newCats, newCatId]) => {
  if (newCats.length > 0 && newCatId) {
    setCascadingFromCategoryId(newCatId)
  }
}, { immediate: true })

// Handlers
const handleMainCategoryChange = () => {
  selectedSubCategory1.value = ''
  selectedSubCategory2.value = ''
  form.value.categoryId = selectedMainCategory.value
}

const handleSubCategory1Change = () => {
  selectedSubCategory2.value = ''
  form.value.categoryId = selectedSubCategory1.value || selectedMainCategory.value
}

const handleSubCategory2Change = () => {
  form.value.categoryId = selectedSubCategory2.value || selectedSubCategory1.value || selectedMainCategory.value
}

const setCascadingFromCategoryId = (catId) => {
  const cat = allCategories.value.find(c => c.id === catId)
  if (!cat) return

  if (!cat.parentId) {
    selectedMainCategory.value = cat.id
  } else {
    const parent = allCategories.value.find(c => c.id === cat.parentId)
    if (parent && !parent.parentId) {
      selectedMainCategory.value = parent.id
      selectedSubCategory1.value = cat.id
    } else if (parent && parent.parentId) {
      const grandParent = allCategories.value.find(c => c.id === parent.parentId)
      if (grandParent) {
        selectedMainCategory.value = grandParent.id
        selectedSubCategory1.value = parent.id
        selectedSubCategory2.value = cat.id
      }
    }
  }
}

// Fetch categories
const fetchCategories = async () => {
  console.log('🟡 Fetching categories...')
  try {
    const response = await $api('/api/categories', {
      query: { all: true } // Fetch all levels
    })
    allCategories.value = response.data
    console.log('✅ Categories fetched:', allCategories.value.length)
  } catch (error) {
    console.error('❌ Error fetching categories:', error)
  }
}

// Fetch product if editing
const fetchProduct = async () => {
  if (!route.query.id) {
    console.log('🆕 New product mode - skipping fetch')
    return
  }

  console.log('🔄 Fetching product:', route.query.id)
  try {
    const response = await $api(`/api/admin/products/${route.query.id}`)

    console.log('✅ Product fetched:', response)
    const product = response.data

    // Populate form with product data
    Object.keys(form.value).forEach(key => {
      if (product[key] !== undefined && product[key] !== null) {
        form.value[key] = product[key]
      }
    })

    // Map existing ProductImage relation
    if (product.ProductImage && Array.isArray(product.ProductImage)) {
      form.value.productImages = product.ProductImage
        .sort((a, b) => a.order - b.order)
        .map(img => img.url)
    }
    console.log('✅ Form populated')
  } catch (error) {
    console.error('❌ Error fetching product:', error)
    alert('Ürün yüklenirken bir hata oluştu')
  }
}

// Image Handlers
const handleFileUpload = async (event) => {
  const files = Array.from(event.target.files)
  if (files.length === 0) return

  const remainingSlots = 5 - form.value.productImages.length
  if (remainingSlots <= 0) {
    useNuxtApp().$toast.error('En fazla 5 görsel yükleyebilirsiniz')
    return
  }

  const uploadLimit = Math.min(files.length, remainingSlots)
  const toast = useNuxtApp().$toast

  // Validate each file first
  for (let i = 0; i < uploadLimit; i++) {
    const validation = validateImage(files[i])
    if (!validation.isValid) {
      toast.error(`${files[i].name}: ${validation.error}`)
      return // Stop the process if any file is invalid
    }
  }

  for (let i = 0; i < uploadLimit; i++) {
    const formData = new FormData()
    formData.append('file', files[i])

    const categoryName = allCategories.value.find(c => c.id === form.value.categoryId)?.name || 'unkown'

    try {
      const response = await $api(`/api/upload`, {
        method: 'POST',
        query: {
          type: 'product',
          category: categoryName
        },
        body: formData
      })

      if (response.success) {
        form.value.productImages.push(response.url)
        // If it's the first image, set as main
        if (!form.value.image) {
          form.value.image = response.url
        }
      }
    } catch (error) {
      console.error('Görsel yüklenirken hata:', error)
      toast.error(`${files[i].name} yüklenirken bir hata oluştu`)
    }
  }
}

const removeImage = (index) => {
  const removedUrl = form.value.productImages[index]
  form.value.productImages.splice(index, 1)

  if (form.value.image === removedUrl) {
    form.value.image = form.value.productImages.length > 0 ? form.value.productImages[0] : ''
  }
}

const setAsMain = (index) => {
  const selectedUrl = form.value.productImages[index]
  form.value.productImages.splice(index, 1)
  form.value.productImages.unshift(selectedUrl)
  form.value.image = selectedUrl
  useNuxtApp().$toast.success('Ana görsel güncellendi')
}

// Save product
const saveProduct = async () => {
  const toast = useNuxtApp().$toast

  // Validation
  if (form.value.productImages.length < 3) {
    toast.error('Lütfen en az 3 görsel yükleyin')
    return
  }

  saving.value = true

  try {
    const url = isEditing.value
      ? `/api/admin/products/${route.query.id}`
      : '/api/admin/products'

    const method = isEditing.value ? 'PUT' : 'POST'

    // Prepare data - ensure required fields have values
    const productData = {
      ...form.value,
      description: form.value.description || '',
      image: form.value.image || 'https://placehold.co/300x300?text=Ürün+Resmi'
    }

    const response = await $api(url, {
      method,
      body: productData
    })

    if (response.success) {
      const toast = useNuxtApp().$toast
      toast.success(isEditing.value ? 'Ürün başarıyla güncellendi!' : 'Ürün başarıyla eklendi!')
      await navigateTo('/admin/products')
    }
  } catch (error) {
    console.error('Error saving product:', error)
    const toast = useNuxtApp().$toast
    const errorMessage = error.data?.error || 'Ürün kaydedilirken bir hata oluştu'
    toast.error(errorMessage)
  } finally {
    saving.value = false
  }
}

// Auto-generate slug from name (only for new products)
watch(() => form.value.name, (newName) => {
  // Only auto-generate if creating new product and slug is empty
  if (!isEditing.value && (!form.value.slug || form.value.slug === '')) {
    const trMap = {
      'ç': 'c', 'Ç': 'C', 'ğ': 'g', 'Ğ': 'G', 'ı': 'i', 'İ': 'I',
      'ö': 'o', 'Ö': 'O', 'ş': 's', 'Ş': 'S', 'ü': 'u', 'Ü': 'U'
    }
    let s = newName.toString()
    Object.keys(trMap).forEach(key => {
      s = s.replace(new RegExp(key, 'g'), trMap[key])
    })
    form.value.slug = s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }
})

onMounted(() => {
  console.log('🚀 Component mounted!')
  fetchCategories()
  fetchProduct()
  console.log('✅ onMounted complete')
})
</script>

<style scoped>
.toggle-checkbox:checked {
  right: 0;
  border-color: #3b82f6;
}

.toggle-checkbox:checked+.toggle-label {
  background-color: #3b82f6;
}
</style>
