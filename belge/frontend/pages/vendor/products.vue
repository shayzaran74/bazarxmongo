<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            📦 Ürün Yönetimi
          </h1>
          <p class="text-gray-600 mt-1">
            Ürünlerinizi ekleyin, düzenleyin ve yönetin
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <!-- Excel Tools Section -->
          <div class="flex items-center gap-3 mr-6 p-2 bg-gray-100/50 rounded-xl border border-gray-200">
            <div class="flex flex-col">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1 px-1">Toplu Ürün
                Yükleme</span>
              <div class="flex items-center gap-2">
                <!-- Template Downloads -->
                <div class="flex items-center border-r border-gray-300 pr-2 mr-1">
                  <button
                    class="bg-white text-gray-700 h-10 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all font-bold flex items-center text-xs whitespace-nowrap"
                    title="Trendyol Excel Şablonu"
                    @click="downloadTemplate"
                  >
                    <ArrowDownTrayIcon class="h-4 w-4 mr-1.5 text-orange-500" />
                    Trendyol Şablonu
                  </button>
                  <button
                    class="bg-white text-gray-700 h-10 px-3 ml-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all font-bold flex items-center text-xs whitespace-nowrap"
                    title="BazarX Bayi Excel Şablonu"
                    @click="downloadSimpleTemplate"
                  >
                    <ArrowDownTrayIcon class="h-4 w-4 mr-1.5 text-blue-500" />
                    Bayi Şablonu
                  </button>
                </div>

                <!-- Upload -->
                <label
                  class="cursor-pointer bg-emerald-600 text-white h-10 px-4 rounded-lg hover:bg-emerald-700 transition-all font-bold flex items-center text-xs shadow-sm"
                  :class="{ 'opacity-50 pointer-events-none': loadingProducts }"
                  title="Excel dosyanızı buraya yükleyin"
                >
                  <ArrowUpTrayIcon class="h-4 w-4 mr-2" />
                  <span v-if="!loadingProducts">Excel Yükle</span>
                  <span
                    v-else
                    class="flex items-center gap-1"
                  >
                    <svg
                      class="animate-spin h-3 w-3"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                        fill="none"
                      />
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    ...
                  </span>
                  <input
                    type="file"
                    class="hidden"
                    accept=".xlsx, .xls"
                    :disabled="loadingProducts"
                    @change="handleExcelUpload"
                  >
                </label>
              </div>
            </div>
          </div>

          <button
            class="bg-blue-600 text-white px-5 py-3 h-14 rounded-xl hover:bg-blue-700 transition-all font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-500/20 flex items-center"
            @click="showCatalogModal = true"
          >
            <MagnifyingGlassIcon class="h-5 w-5 mr-2" />
            Katalogdan Ekle
          </button>
          <NuxtLink
            to="/vendor/product-form"
            class="bg-primary-600 text-white px-5 py-3 h-14 rounded-xl hover:bg-primary-700 transition-all font-black uppercase text-xs tracking-widest shadow-lg shadow-primary-500/20 flex items-center"
          >
            <PlusIcon class="h-5 w-5 mr-2" />
            Yeni Ürün
          </NuxtLink>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-6 mb-8 border border-gray-100">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Ara</label>
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="İsim, Barkod, SKU..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                @keyup.enter="fetchProducts"
              >
              <MagnifyingGlassIcon class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Görünürlük</label>
            <select
              v-model="selectedVisibility"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              @change="fetchProducts"
            >
              <option value="">
                Tüm Ürünler
              </option>
              <option value="PUBLIC">
                Genel Pazar Yeri
              </option>
              <option value="PRIVATE_ECOSYSTEM">
                Sadece Ekosistem (Bayi Özel)
              </option>
            </select>
          </div>
          <div class="flex items-end text-right">
            <button
              class="text-sm font-bold text-primary-600 hover:text-primary-700 mr-4 py-2"
              @click="resetFilters"
            >
              Filtreleri Sıfırla
            </button>
            <button
              class="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
              @click="fetchProducts"
            >
              Filtrele
            </button>
          </div>
        </div>
      </div>

      <!-- Bulk Actions Bar -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform -translate-y-4 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform -translate-y-4 opacity-0"
      >
        <div
          v-if="selectedProductIds.length > 0"
          class="bg-primary-600 text-white p-4 rounded-xl shadow-lg mb-8 flex items-center justify-between"
        >
          <div class="flex items-center space-x-4">
            <span class="font-bold">{{ selectedProductIds.length }} ürün seçildi</span>
            <div class="h-4 w-px bg-primary-400" />
            <button
              :disabled="bulkProcessing"
              class="bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center"
              @click="openBulkEditModal"
            >
              <PencilSquareIcon class="h-4 w-4 mr-1" />
              Toplu Düzenle
            </button>
            <button
              :disabled="bulkProcessing"
              class="bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
              @click="bulkDelete"
            >
              Sil
            </button>
          </div>
          <button
            class="text-white/80 hover:text-white"
            @click="selectedProductIds = []"
          >
            Seçimi Temizle
          </button>
        </div>
      </Transition>

      <!-- Modals (Bulk Edit, Catalog Search) -->
      <CatalogSearchModal
        :is-open="showCatalogModal"
        @close="showCatalogModal = false"
        @select="handleCatalogSelect"
        @create-new="navigateTo('/vendor/product-form'); showCatalogModal = false"
      />

      <div
        v-if="showBulkEditModal"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
      >
        <div
          class="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl p-8 border border-white/20 animate-in fade-in zoom-in duration-300"
        >
          <div class="flex justify-between items-center mb-8">
            <h3 class="text-xl font-black text-gray-900 uppercase italic tracking-tighter">
              🚀 Toplu Güncelleme
            </h3>
            <button
              class="text-gray-400 hover:text-black transition-colors"
              @click="showBulkEditModal = false"
            >
              ✕
            </button>
          </div>
          <div class="space-y-6">
            <div class="p-5 bg-primary-50 rounded-2xl border border-primary-100 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="p-3 bg-white rounded-xl shadow-sm">
                  <Bars3Icon class="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p class="font-black text-primary-900 uppercase text-xs tracking-widest">
                    Görünürlük
                  </p>
                </div>
              </div>
              <select
                v-model="bulkUpdateForm.action"
                class="bg-white border-primary-200 rounded-xl px-4 py-2 text-xs font-bold text-primary-900 w-full ml-4"
              >
                <option value="">
                  Değiştirme
                </option>
                <option value="publish_public">
                  Yayına Al (Herkese Açık)
                </option>
                <option value="publish_private">
                  Sadece Kendi Ekosistemim
                </option>
                <option value="unpublish">
                  Yayından Kaldır
                </option>
              </select>
            </div>
            <div class="flex gap-4">
              <button
                class="flex-1 py-4 bg-gray-50 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100"
                @click="showBulkEditModal = false"
              >
                İPTAL
              </button>
              <button
                class="flex-[2] py-4 bg-primary-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary-500/30"
                @click="executeBulkUpdate"
              >
                GÜNCELLEMEYİ
                YAP
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Import Results Modal -->
      <div
        v-if="showImportResults"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm"
      >
        <div
          class="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-300"
        >
          <!-- Header -->
          <div class="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 text-white">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-xl font-bold flex items-center gap-2">
                  📊 Excel İçe Aktarma Sonuçları
                </h3>
                <p class="text-green-100 text-sm mt-1">
                  Format: {{ importResults?.format === 'trendyol' ? '🏷️ Trendyol' : '📋 Standart' }}
                </p>
              </div>
              <button
                class="text-white/80 hover:text-white text-2xl font-bold"
                @click="showImportResults = false"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Summary Cards -->
          <div class="grid grid-cols-4 gap-3 px-8 py-5 bg-gray-50 border-b">
            <div class="bg-white rounded-xl p-3 text-center shadow-sm border">
              <div class="text-2xl font-black text-green-600">
                {{ importResults?.results?.success || 0 }}
              </div>
              <div class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Yeni Eklenen
              </div>
            </div>
            <div class="bg-white rounded-xl p-3 text-center shadow-sm border">
              <div class="text-2xl font-black text-blue-600">
                {{ importResults?.results?.updated || 0 }}
              </div>
              <div class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Güncellenen
              </div>
            </div>
            <div class="bg-white rounded-xl p-3 text-center shadow-sm border">
              <div class="text-2xl font-black text-yellow-600">
                {{ importResults?.results?.skipped || 0 }}
              </div>
              <div class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Atlanan
              </div>
            </div>
            <div class="bg-white rounded-xl p-3 text-center shadow-sm border">
              <div class="text-2xl font-black text-red-600">
                {{ importResults?.results?.failed || 0 }}
              </div>
              <div class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Hatalı
              </div>
            </div>
          </div>

          <!-- Details -->
          <div class="overflow-y-auto max-h-[40vh] px-8 py-4">
            <!-- Details List -->
            <div
              v-if="importResults?.results?.details?.length > 0"
              class="mb-4"
            >
              <h4 class="text-sm font-bold text-gray-700 mb-2">
                📋 Detaylar
              </h4>
              <div class="space-y-1.5">
                <div
                  v-for="(detail, idx) in importResults.results.details"
                  :key="idx"
                  class="flex items-center gap-2 text-sm py-1.5 px-3 rounded-lg"
                  :class="detail.status === 'created' ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-800'"
                >
                  <span class="text-xs">{{ detail.status === 'created' ? '✅' : '🔄' }}</span>
                  <span class="font-medium truncate flex-1">{{ detail.name }}</span>
                  <span
                    class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                    :class="detail.status === 'created' ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'"
                  >
                    {{ detail.status === 'created' ? 'YENİ' : 'GÜNCELLEME' }}
                  </span>
                  <span
                    v-if="detail.sku"
                    class="text-[10px] text-gray-400"
                  >SKU: {{ detail.sku }}</span>
                </div>
              </div>
            </div>

            <!-- Errors -->
            <div
              v-if="importResults?.results?.errors?.length > 0"
              class="mb-4"
            >
              <h4 class="text-sm font-bold text-red-700 mb-2">
                ⚠️ Hatalar
              </h4>
              <div class="space-y-1.5">
                <div
                  v-for="(err, idx) in importResults.results.errors"
                  :key="'err-' + idx"
                  class="text-sm py-2 px-3 bg-red-50 text-red-700 rounded-lg border border-red-100"
                >
                  {{ err }}
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div
              v-if="!importResults?.results?.details?.length && !importResults?.results?.errors?.length"
              class="text-center py-8 text-gray-400"
            >
              <p class="text-sm">
                Detay bilgisi bulunmuyor.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="border-t px-8 py-4 bg-gray-50 flex justify-end">
            <button
              class="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
              @click="showImportResults = false"
            >
              Tamam
            </button>
          </div>
        </div>
      </div>

      <!-- Products List -->
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div
          v-if="loadingProducts"
          class="flex flex-col justify-center items-center h-96 space-y-4"
        >
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
          <p class="text-primary-900 font-black uppercase text-xs tracking-widest italic animate-pulse">
            Ürünler
            Yükleniyor...
          </p>
        </div>

        <div
          v-else-if="products.length === 0"
          class="flex flex-col justify-center items-center h-96 space-y-4"
        >
          <PhotoIcon class="h-16 w-16 text-gray-200" />
          <p class="text-gray-400 font-bold uppercase text-sm tracking-widest">
            Henüz ürün eklemediniz
          </p>
        </div>

        <div
          v-else
          class="overflow-x-auto"
        >
          <table class="w-full text-left">
            <thead class="bg-gray-900 text-white uppercase text-[10px] tracking-widest font-black">
              <tr>
                <th class="px-6 py-5 w-10">
                  <input
                    type="checkbox"
                    :checked="isAllSelected"
                    class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    @change="toggleSelectAll"
                  >
                </th>
                <th class="px-6 py-5">
                  Ürün Bilgisi
                </th>
                <th class="px-6 py-5">
                  Fiyat / Stok
                </th>
                <th class="px-6 py-5">
                  Durum
                </th>
                <th class="px-6 py-5 text-right">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="product in products"
                :key="product.id"
                class="group hover:bg-primary-50/30 transition-all duration-300"
              >
                <td class="px-6 py-5">
                  <input
                    v-model="selectedProductIds"
                    type="checkbox"
                    :value="product.id"
                    class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  >
                </td>
                <td class="px-6 py-5">
                  <div class="flex items-center space-x-4">
                    <div
                      class="relative w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border group-hover:scale-105 transition-transform"
                    >
                      <img
                        :src="resolveImageUrl(product.image)"
                        :alt="product.CatalogProduct?.name || product.name"
                        class="w-full h-full object-cover"
                      >
                    </div>
                    <div>
                      <h4
                        class="text-sm font-black text-gray-900 uppercase tracking-tight group-hover:text-primary-600 transition-colors"
                      >
                        {{ product.CatalogProduct?.name || product.name }}
                      </h4>
                      <p class="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">
                        SKU: {{ product.sku || '-' }} | BARKOD: {{ product.barcode || '-' }}
                      </p>
                      <div class="flex gap-2 mt-2">
                        <span
                          v-if="product.CatalogProduct?.brand || product.Brand"
                          class="text-[9px] bg-primary-100 text-primary-600 px-2 py-0.5 rounded font-black uppercase"
                        >{{
                          product.CatalogProduct?.brand || product.Brand?.name }}</span>
                        <span
                          v-if="product.CatalogProduct?.Category || product.Category"
                          class="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-black uppercase"
                        >{{
                          product.CatalogProduct?.Category?.name || product.Category?.name }}</span>
                        <span
                          v-if="product.isFeatured"
                          class="text-[9px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-black uppercase"
                        >✨ Öne
                          Çıkan</span>
                        <span
                          v-if="product.isSpecialOffer"
                          class="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-black uppercase"
                        >🔥
                          Fırsat</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <div>
                    <p class="text-sm font-black text-gray-900">
                      {{ formatPrice(product.price) }}
                    </p>
                    <div class="mt-1 flex items-center">
                      <div class="w-24 bg-gray-100 h-1.5 rounded-full mr-2 overflow-hidden">
                        <div
                          :class="['h-full rounded-full transition-all', product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-orange-500' : 'bg-red-500']"
                          :style="{ width: Math.min(100, (product.stock / 100) * 100) + '%' }"
                        />
                      </div>
                      <span
                        class="text-[10px] font-black uppercase"
                        :class="product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-orange-600' : 'text-red-600'"
                      >{{
                        product.stock }} ADET</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <span
                    :class="[
                      'px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors',
                      product.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      product.status === 'PENDING' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                      product.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      product.status === 'DRAFT' ? 'bg-gray-100 text-gray-500' :
                      product.status === 'INACTIVE' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-400'
                    ]"
                  >
                    {{
                      product.status === 'ACTIVE' ? '✅ YAYINDA' :
                      product.status === 'PENDING' ? '⏳ ONAY BEKLİYOR' :
                      product.status === 'REJECTED' ? '❌ REDDEDİLDİ' :
                      product.status === 'DRAFT' ? '📝 TASLAK' :
                      product.status === 'INACTIVE' ? '⏸️ PASİF' : 'BELİRSİZ'
                    }}
                  </span>
                </td>
                <td class="px-6 py-5 text-right">
                  <div class="flex justify-end space-x-2">
                    <button
                      class="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      title="Düzenle"
                      @click="editProduct(product)"
                    >
                      <PencilSquareIcon class="h-4 w-4" />
                    </button>
                    <button
                      class="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                      title="Sil"
                      @click="deleteProduct(product.id)"
                    >
                      <XMarkIcon class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
    PhotoIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  Bars3Icon,
      XMarkIcon,
  
} from '@heroicons/vue/24/outline'

const { resolveImageUrl } = useAppImage()

definePageMeta({
  layout: 'vendor',
  middleware: 'vendor'
})

useHead({
  title: 'Ürün Yönetimi - Vendor Panel',
})

const products = ref([])
const loadingProducts = ref(false)
const showCatalogModal = ref(false)
const searchQuery = ref('')
const selectedVisibility = ref('')
const selectedProductIds = ref([])
const bulkProcessing = ref(false)
const showBulkEditModal = ref(false)
const bulkUpdateForm = ref({ action: '' })
const showImportResults = ref(false)
const importResults = ref(null)

const isAllSelected = computed(() => {
  return products.value.length > 0 && selectedProductIds.value.length === products.value.length
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedProductIds.value = []
  } else {
    selectedProductIds.value = products.value.map(p => p.id)
  }
}

const openBulkEditModal = () => {
  bulkUpdateForm.value = { action: '' }
  showBulkEditModal.value = true
}

const bulkDelete = async () => {
  if (!selectedProductIds.value.length) return
  if (!confirm(`${selectedProductIds.value.length} ürünü silmek istediğinizden emin misiniz?`)) return

  bulkProcessing.value = true
  try {
    const { $api } = useApi()
    await $api('/api/vendors/products/bulk-delete', {
      method: 'POST',
      body: { productIds: selectedProductIds.value }
    })
    useNuxtApp().$toast.success('Seçili ürünler silindi')
    selectedProductIds.value = []
    await fetchProducts()
  } catch (error) {
    useNuxtApp().$toast.error('Toplu silme sırasında hata oluştu')
  } finally {
    bulkProcessing.value = false
  }
}

const executeBulkUpdate = async () => {
  if (!selectedProductIds.value.length) return
  if (!bulkUpdateForm.value.action) {
    useNuxtApp().$toast.warning('Lütfen bir işlem seçin')
    return
  }
  bulkProcessing.value = true

  const updates = {}
  if (bulkUpdateForm.value.action === 'publish_public') {
    updates.isActive = true
    updates.visibility = 'PUBLIC'
  } else if (bulkUpdateForm.value.action === 'publish_private') {
    updates.isActive = true
    updates.visibility = 'PRIVATE_ECOSYSTEM'
  } else if (bulkUpdateForm.value.action === 'unpublish') {
    updates.isActive = false
  }

  try {
    const { $api } = useApi()
    await $api('/api/vendors/products/bulk-update', {
      method: 'POST',
      body: {
        productIds: selectedProductIds.value,
        updates
      }
    })
    useNuxtApp().$toast.success('Ürünler güncellendi')
    showBulkEditModal.value = false
    selectedProductIds.value = []
    await fetchProducts()
  } catch (error) {
    useNuxtApp().$toast.error('Toplu güncelleme sırasında hata oluştu')
  } finally {
    bulkProcessing.value = false
  }
}


const handleCatalogSelect = (product) => {
  navigateTo(`/vendor/product-form?catalogId=${product.id}`)
  showCatalogModal.value = false
}

const fetchProducts = async () => {
  loadingProducts.value = true
  try {
    const params = new URLSearchParams()
    params.append('limit', '100')

    if (searchQuery.value) params.append('search', searchQuery.value)
    if (selectedVisibility.value) params.append('visibility', selectedVisibility.value)

    const url = `/api/vendors/products?${params.toString()}`

    const { $api } = useApi()
    const response = await $api(url)
    if (response.success) {
      products.value = response.data
    }
  } catch (error) {
    console.error('Ürünler yüklenirken hata:', error)
  } finally {
    loadingProducts.value = false
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedVisibility.value = ''
  fetchProducts()
}

const downloadTemplate = async () => {
  const toast = useNuxtApp().$toast
  const toastId = toast.info('Trendyol şablonu hazırlanıyor...', { timeout: false })
  try {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()
    const headers = {}
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }

    const response = await fetch(`${config.public.apiBase}/api/vendors/products/bulk/template/trendyol`, {
      headers,
      credentials: 'include'
    })

    if (!response.ok) throw new Error('Sunucu hatası')

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bazarx_trendyol_sablonu.xlsx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    toast.dismiss(toastId)
    toast.success('Şablon indirildi')
  } catch (error) {
    toast.dismiss(toastId)
    toast.error('Trendyol şablonu indirilirken hata oluştu')
    console.error('Download error:', error)
  }
}

const downloadSimpleTemplate = async () => {
  const toast = useNuxtApp().$toast
  const toastId = toast.info('Sade şablon hazırlanıyor...', { timeout: false })
  try {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()
    const headers = {}
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }

    const response = await fetch(`${config.public.apiBase}/api/vendors/products/bulk/template/bayi`, {
      headers,
      credentials: 'include'
    })

    if (!response.ok) throw new Error('Sunucu hatası')

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bazarx_sade_sablon.xlsx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    toast.dismiss(toastId)
    toast.success('Sade şablon indirildi')
  } catch (error) {
    toast.dismiss(toastId)
    toast.error('Sade şablon indirilirken hata oluştu')
    console.error('Download error:', error)
  }
}

const handleExcelUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  const toast = useNuxtApp().$toast

  loadingProducts.value = true
  toast.info('📊 Excel dosyası işleniyor, lütfen bekleyiniz...')
  try {
    const { $api } = useApi()
    const response = await $api('/api/vendors/products/bulk/import', {
      method: 'POST',
      body: formData
    })

    if (response.success) {
      // Show detailed results modal
      importResults.value = response
      showImportResults.value = true

      const total = (response.results.success || 0) + (response.results.updated || 0)
      toast.success(`✅ ${total} ürün başarıyla işlendi (${response.results.success} yeni, ${response.results.updated} güncellendi)`)

      if (response.results.errors?.length > 0) {
        toast.warning(`⚠️ ${response.results.failed} ürün hatalıydı.`)
      }
      if (response.results.skipped > 0) {
        toast.info(`ℹ️ ${response.results.skipped} ürün atlandı (isim boş).`)
      }
      fetchProducts()
    }
  } catch (error) {
    toast.error(error.data?.error || 'Dosya yüklenirken hata oluştu')
  } finally {
    loadingProducts.value = false
    event.target.value = '' // Clear input
  }
}

const editProduct = (product) => {
  navigateTo(`/vendor/product-form?id=${product.id}`)
}

const deleteProduct = async (id) => {
  if (!confirm('Ürünü silmek istediğinizden emin misiniz?')) return

  try {
    const { $api } = useApi()
    const response = await $api(`/api/vendors/products/${id}`, {
      method: 'DELETE'
    })

    if (response.success) {
      await fetchProducts()
      useNuxtApp().$toast.success('Ürün silindi')
    }
  } catch (error) {
    console.error('Hata:', error)
    useNuxtApp().$toast.error('Ürün silinirken hata oluştu')
  }
}

const formatPrice = (price) => {
  if (!price) return '0,00 ₺'
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price)
}

onMounted(() => {
  fetchProducts()
})
</script>
