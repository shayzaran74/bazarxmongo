<template>
  <div class="p-4 md:p-8 max-w-5xl mx-auto">
    <div class="mb-8">
      <NuxtLink
        to="/vendor/purchase-orders"
        class="text-sm font-bold text-blue-600 hover:underline flex items-center mb-4"
      >
        <ArrowLeftIcon class="h-4 w-4 mr-1" />
        Geri Dön
      </NuxtLink>
      <h1 class="text-3xl font-black text-gray-900 tracking-tight">
        Yeni Satın Alım Emri
      </h1>
      <p class="mt-2 text-gray-600">
        Tedarikçinizden alacağınız ürünleri listeleyin.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-6">
        <!-- Supplier Details -->
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 class="text-lg font-bold text-gray-900 mb-4">
            Tedarikçi Bilgileri
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Tedarikçi Adı</label>
              <input
                v-model="form.supplier"
                type="text"
                placeholder="Örn: ABC Lojistik A.Ş."
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              >
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Tahmini Varış</label>
              <input
                v-model="form.estimatedArrival"
                type="date"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              >
            </div>
          </div>
        </div>

        <!-- Selected Products -->
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-gray-900">
              Ürün Listesi
            </h3>
            <button
              class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors text-sm"
              @click="showProductSearch = true"
            >
              <MagnifyingGlassIcon class="h-4 w-4 mr-2" />
              Ürün Ekle
            </button>
          </div>

          <div
            v-if="form.items.length === 0"
            class="py-12 text-center border-2 border-dashed border-gray-100 rounded-3xl"
          >
            <div class="text-gray-400 mb-2 font-medium">
              Henüz ürün eklenmedi
            </div>
            <p class="text-xs text-gray-400">
              Tedarikçiden alınan ürünleri seçmek için "Ürün Ekle" butonuna basın.
            </p>
          </div>

          <div
            v-else
            class="space-y-4"
          >
            <div
              v-for="(item, index) in form.items"
              :key="index"
              class="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4"
            >
              <img
                :src="item.image"
                class="h-16 w-16 rounded-xl object-cover"
              >
              <div class="flex-1 min-w-0">
                <div class="text-sm font-bold text-gray-900 truncate">
                  {{ item.name }}
                </div>
                <div class="text-xs text-gray-500">
                  SKU: {{ item.sku }}
                </div>
              </div>
              <div class="w-24">
                <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Miktar</label>
                <input
                  v-model.number="item.quantity"
                  type="number"
                  min="1"
                  class="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg text-sm font-bold"
                >
              </div>
              <div class="w-32">
                <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Maliyet (₺)</label>
                <input
                  v-model.number="item.costPerItem"
                  type="number"
                  min="0"
                  class="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg text-sm font-bold"
                >
              </div>
              <button
                class="text-red-400 hover:text-red-600 p-2"
                @click="removeItem(index)"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Sidebar -->
      <div class="space-y-6">
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-8">
          <h3 class="text-lg font-bold text-gray-900 mb-6">
            Özet
          </h3>
          <div class="space-y-3 mb-6">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Ürün Çeşit</span>
              <span class="font-bold text-gray-900">{{ form.items.length }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Toplam Adet</span>
              <span class="font-bold text-gray-900">{{ totalQuantity }}</span>
            </div>
            <div class="pt-3 border-t border-gray-50 flex justify-between">
              <span class="text-gray-900 font-bold">Toplam Maliyet</span>
              <span class="text-blue-600 font-black">₺{{ totalCost.toLocaleString('tr-TR') }}</span>
            </div>
          </div>
          <button
            :disabled="loading || !isValid"
            class="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 transition-all"
            @click="submitPO"
          >
            Siparişi Oluştur
          </button>
        </div>
      </div>
    </div>

    <!-- Product Selection Modal -->
    <div
      v-if="showProductSearch"
      class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
    >
      <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-xl font-black text-gray-900">
            Ürün Seçin
          </h3>
          <button
            class="text-gray-400 hover:text-gray-600 text-3xl"
            @click="showProductSearch = false"
          >
            &times;
          </button>
        </div>
        <div class="p-4 bg-gray-50">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Ürün adı veya SKU ile ara..."
            class="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium"
            @input="searchProducts"
          >
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-2">
          <div
            v-if="searching"
            class="text-center py-8"
          >
            <div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto" />
          </div>
          <div
            v-else-if="foundProducts.length === 0"
            class="text-center py-8 text-gray-500 font-medium"
          >
            Ürün bulunamadı.
          </div>
          <div
            v-for="p in foundProducts"
            :key="p.id"
            class="flex items-center p-3 hover:bg-blue-50 rounded-2xl cursor-pointer transition-colors border border-transparent hover:border-blue-100"
            @click="addItem(p)"
          >
            <img
              :src="p.image"
              class="h-12 w-12 rounded-lg object-cover"
            >
            <div class="ml-4 flex-1">
              <div class="text-sm font-bold text-gray-900">
                {{ p.name }}
              </div>
              <div class="text-xs text-gray-500">
                SKU: {{ p.sku }}
              </div>
            </div>
            <div class="text-blue-600 font-bold text-sm">
              Ekle +
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowLeftIcon, MagnifyingGlassIcon, TrashIcon } from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'vendor',
  middleware: 'vendor'
})

const form = ref({
  supplier: '',
  estimatedArrival: '',
  items: []
})

const loading = ref(false)
const showProductSearch = ref(false)
const searchQuery = ref('')
const searching = ref(false)
const foundProducts = ref([])

const searchProducts = async () => {
  if (searchQuery.value.length < 2) return
  searching.value = true
  try {
    const { $api } = useApi()
    const response = await $api(`/api/vendors/products?search=${searchQuery.value}`)
    foundProducts.value = response.data
  } catch (error) {
    console.error('Search error:', error)
  } finally {
    searching.value = false
  }
}

const addItem = (product) => {
  if (form.value.items.some(i => i.productId === product.id)) {
    useNuxtApp().$toast.warning('Bu ürün zaten listede.')
    return
  }
  form.value.items.push({
    productId: product.id,
    name: product.name,
    sku: product.sku,
    image: product.image,
    quantity: 1,
    costPerItem: product.costPerItem || 0
  })
}

const removeItem = (index) => {
  form.value.items.splice(index, 1)
}

const totalQuantity = computed(() => {
  return form.value.items.reduce((acc, item) => acc + (parseInt(item.quantity) || 0), 0)
})

const totalCost = computed(() => {
  return form.value.items.reduce((acc, item) => acc + ((parseInt(item.quantity) || 0) * (parseFloat(item.costPerItem) || 0)), 0)
})

const isValid = computed(() => {
  return form.value.supplier && form.value.items.length > 0 && form.value.items.every(i => i.quantity > 0)
})

const submitPO = async () => {
  loading.value = true
  try {
    const { $api } = useApi()
    await $api('/api/vendors/purchase-orders', {
      method: 'POST',
      body: {
        supplier: form.value.supplier,
        estimatedArrival: form.value.estimatedArrival,
        items: form.value.items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          costPerItem: i.costPerItem
        }))
      }
    })

    useNuxtApp().$toast.success('Satın alım emri başarıyla oluşturuldu!')
    navigateTo('/vendor/purchase-orders')
  } catch (error) {
    useNuxtApp().$toast.error('Hata oluştu. Bilgileri kontrol edin.')
  } finally {
    loading.value = false
  }
}
</script>
