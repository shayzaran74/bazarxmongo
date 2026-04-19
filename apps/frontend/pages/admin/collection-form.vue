<template>
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
      <div class="flex items-center">
        <NuxtLink
          to="/admin/collections"
          class="text-gray-500 hover:text-gray-700 mr-4"
        >
          <ChevronLeftIcon class="h-5 w-5" />
        </NuxtLink>
        <h1 class="text-2xl font-semibold text-gray-900">
          {{ isEditing ? 'Koleksiyonu Düzenle' : 'Yeni Koleksiyon' }}
        </h1>
      </div>
      <div class="flex items-center space-x-3">
        <NuxtLink
          to="/admin/collections"
          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          İptal
        </NuxtLink>
        <button
          :disabled="saving"
          class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          @click="saveCollection"
        >
          {{ saving ? 'Kaydediliyor...' : 'Kaydet' }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Basic Info -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
              <input
                v-model="form.title"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Örn: Yaz Koleksiyonu"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
              <textarea
                v-model="form.description"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Bu koleksiyondaki ürünler hakkında bilgi..."
              />
            </div>
          </div>
        </div>

        <!-- Collection Type -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-sm font-medium text-gray-900 mb-4">
            Koleksiyon Türü
          </h3>

          <div class="space-y-4">
            <label class="flex items-start">
              <input
                v-model="form.type"
                type="radio"
                value="Manual"
                class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
              >
              <div class="ml-3">
                <div class="text-sm font-medium text-gray-900">Manuel</div>
                <div class="text-sm text-gray-500">Ürünleri kendiniz seçin</div>
              </div>
            </label>

            <label class="flex items-start">
              <input
                v-model="form.type"
                type="radio"
                value="Automatic"
                class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
              >
              <div class="ml-3">
                <div class="text-sm font-medium text-gray-900">Otomatik</div>
                <div class="text-sm text-gray-500">Kurallara göre otomatik ürün ekleme (Yakında)</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Products (Manual) -->
        <div
          v-if="form.type === 'Manual'"
          class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 class="text-sm font-medium text-gray-900 mb-4">
            Ürünler
          </h3>

          <!-- Search Products -->
          <div class="mb-4">
            <input
              v-model="productSearch"
              type="text"
              placeholder="Ürün ara..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              @input="searchProducts"
            >
          </div>

          <!-- Search Results -->
          <div
            v-if="searchResults.length > 0"
            class="mb-4 max-h-60 overflow-y-auto border border-gray-200 rounded-md"
          >
            <div
              v-for="product in searchResults"
              :key="product.id"
              class="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
              @click="addProduct(product)"
            >
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
                  <div class="text-sm text-gray-500">
                    ₺{{ product.price }}
                  </div>
                </div>
              </div>
              <PlusIcon class="h-5 w-5 text-gray-400" />
            </div>
          </div>

          <!-- Selected Products -->
          <div
            v-if="selectedProducts.length > 0"
            class="space-y-2"
          >
            <div
              v-for="(product, index) in selectedProducts"
              :key="product.id"
              class="flex items-center justify-between p-3 border border-gray-200 rounded-md"
            >
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
                  <div class="text-sm text-gray-500">
                    ₺{{ product.price }}
                  </div>
                </div>
              </div>
              <button
                class="text-red-600 hover:text-red-900"
                @click="removeProduct(index)"
              >
                <XMarkIcon class="h-5 w-5" />
              </button>
            </div>
          </div>

          <div
            v-else
            class="text-center py-8 text-gray-500 text-sm"
          >
            Henüz ürün eklenmedi
          </div>
        </div>

        <!-- Conditions (Automatic) -->
        <div
          v-else-if="form.type === 'Automatic'"
          class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 class="text-sm font-medium text-gray-900 mb-4">
            Koşullar
          </h3>

          <!-- Condition Type -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Ürünler aşağıdaki koşullardan:</label>
            <select
              v-model="form.conditionType"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">
                Tümünü karşılamalı
              </option>
              <option value="any">
                Herhangi birini karşılamalı
              </option>
            </select>
          </div>

          <!-- Conditions List -->
          <div class="space-y-3">
            <div
              v-for="(condition, index) in conditions"
              :key="index"
              class="flex items-center space-x-2"
            >
              <select
                v-model="condition.field"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="tag">
                  Etiket
                </option>
                <option value="vendor">
                  Satıcı
                </option>
                <option value="productType">
                  Tür
                </option>
                <option value="price">
                  Fiyat
                </option>
              </select>

              <select
                v-model="condition.operator"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="equals">
                  Eşittir
                </option>
                <option value="not_equals">
                  Eşit değildir
                </option>
                <option value="contains">
                  İçerir
                </option>
                <option value="not_contains">
                  İçermez
                </option>
                <option
                  v-if="condition.field === 'price'"
                  value="greater_than"
                >
                  Büyüktür
                </option>
                <option
                  v-if="condition.field === 'price'"
                  value="less_than"
                >
                  Küçüktür
                </option>
              </select>

              <input
                v-model="condition.value"
                type="text"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                :placeholder="condition.field === 'price' ? '0.00' : 'Değer'"
              >

              <button
                class="text-red-600 hover:text-red-900"
                @click="removeCondition(index)"
              >
                <XMarkIcon class="h-5 w-5" />
              </button>
            </div>
          </div>

          <button
            class="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            @click="addCondition"
          >
            <PlusIcon class="h-4 w-4 mr-2" />
            Koşul Ekle
          </button>
        </div>

        <!-- SEO -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-sm font-medium text-gray-900 mb-4">
            Arama Motoru Optimizasyonu
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Meta Başlık</label>
              <input
                v-model="form.metaTitle"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Meta Açıklama</label>
              <textarea
                v-model="form.metaDescription"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">URL Handle</label>
              <input
                v-model="form.handle"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="yaz-koleksiyonu"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="space-y-6">
        <!-- Status -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-sm font-medium text-gray-900 mb-4">
            Durum
          </h3>
          <select
            v-model="form.isPublished"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option :value="true">
              Yayında
            </option>
            <option :value="false">
              Taslak
            </option>
          </select>
        </div>

        <!-- Image -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-sm font-medium text-gray-900 mb-4">
            Görsel
          </h3>
          <div
            v-if="form.image"
            class="mb-4"
          >
            <img
              :src="form.image"
              alt="Collection"
              class="w-full rounded-lg"
            >
            <button
              class="mt-2 text-sm text-red-600 hover:text-red-700"
              @click="form.image = ''"
            >
              Görseli Kaldır
            </button>
          </div>
          <input
            v-model="form.image"
            type="text"
            placeholder="Görsel URL'si"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ChevronLeftIcon, PlusIcon, XMarkIcon } from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const route = useRoute()
const { $api } = useApi()
const isEditing = computed(() => !!route.query.id)
const saving = ref(false)
const productSearch = ref('')
const searchResults = ref([])
const selectedProducts = ref([])
const conditions = ref([{ field: 'tag', operator: 'equals', value: '' }])

const form = ref({
  title: '',
  description: '',
  type: 'Manual',
  image: '',
  conditionType: 'all',
  conditions: null,
  metaTitle: '',
  metaDescription: '',
  handle: '',
  isPublished: true
})

// Fetch collection if editing
const fetchCollection = async () => {
  if (!route.query.id) return

  try {
    const response = await $api(`/api/admin/collections/${route.query.id}`)

    const collection = response.data
    Object.keys(form.value).forEach(key => {
      if (collection[key] !== undefined) {
        form.value[key] = collection[key]
      }
    })

    // Load selected products
    if (collection.products) {
      selectedProducts.value = collection.products.map(cp => cp.product)
    }

    // Load conditions for automatic collections
    if (collection.type === 'Automatic' && collection.conditions) {
      conditions.value = collection.conditions
    }
  } catch (error) {
    console.error('Error fetching collection:', error)
    const toast = useNuxtApp().$toast
    toast.error('Koleksiyon yüklenirken hata oluştu')
  }
}

// Search products
let searchTimeout
const searchProducts = () => {
  clearTimeout(searchTimeout)
  if (!productSearch.value) {
    searchResults.value = []
    return
  }

  searchTimeout = setTimeout(async () => {
    try {
      const response = await $api('/api/products', {
        query: {
          search: productSearch.value,
          limit: 10
        }
      })
      searchResults.value = response.data.filter(
        p => !selectedProducts.value.find(sp => sp.id === p.id)
      )
    } catch (error) {
      console.error('Error searching products:', error)
    }
  }, 300)
}

// Add product
const addProduct = (product) => {
  if (!selectedProducts.value.find(p => p.id === product.id)) {
    selectedProducts.value.push(product)
    searchResults.value = []
    productSearch.value = ''
  }
}

// Remove product
const removeProduct = (index) => {
  selectedProducts.value.splice(index, 1)
}

// Add condition
const addCondition = () => {
  conditions.value.push({ field: 'tag', operator: 'equals', value: '' })
}

// Remove condition
const removeCondition = (index) => {
  if (conditions.value.length > 1) {
    conditions.value.splice(index, 1)
  }
}

// Save collection
const saveCollection = async () => {
  saving.value = true
  try {
    const url = isEditing.value
      ? `/api/admin/collections/${route.query.id}`
      : '/api/admin/collections'

    const method = isEditing.value ? 'PUT' : 'POST'

    const data = {
      ...form.value,
      productIds: form.value.type === 'Manual' ? selectedProducts.value.map(p => p.id) : [],
      conditions: form.value.type === 'Automatic' ? conditions.value : null
    }

    const response = await $api(url, {
      method,
      body: data
    })

    if (response.success) {
      const toast = useNuxtApp().$toast
      toast.success(isEditing.value ? 'Koleksiyon güncellendi!' : 'Koleksiyon oluşturuldu!')
      await navigateTo('/admin/collections')
    }
  } catch (error) {
    console.error('Error saving collection:', error)
    const toast = useNuxtApp().$toast
    const errorMessage = error.data?.error || 'Koleksiyon kaydedilirken hata oluştu'
    toast.error(errorMessage)
  } finally {
    saving.value = false
  }
}

// Auto-generate handle from title
watch(() => form.value.title, (newTitle) => {
  if (!isEditing.value && (!form.value.handle || form.value.handle === '')) {
    form.value.handle = newTitle
      .toLowerCase()
      .replace(/ş/g, 's')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }
})

onMounted(() => {
  fetchCollection()
})
</script>
