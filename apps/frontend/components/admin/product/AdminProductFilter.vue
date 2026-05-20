<template>
  <div class="bg-white rounded-lg shadow p-6 mb-8 space-y-4">
    <!-- Satır 1: Metin + Kategori + Satıcı + Şehir -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Ara</label>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="İsim, Barkod, SKU..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
        <select
          v-model="selectedCategoryId"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Tüm Kategoriler</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Satıcı</label>
        <select
          v-model="selectedVendorId"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Platform Ürünleri & Tümü</option>
          <option v-for="vendor in vendors" :key="vendor.id" :value="vendor.id">{{ vendor.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Şehir / Konum</label>
        <input
          v-model="cityFilter"
          type="text"
          placeholder="İstanbul, Ankara..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
      </div>
    </div>

    <!-- Satır 2: Bayraklar + Filtrele butonu -->
    <div class="flex flex-wrap gap-4 items-center pt-4 border-t border-gray-100">
      <!-- Mevcut toggle'lar -->
      <label class="flex items-center gap-2 cursor-pointer">
        <input v-model="showVendorProducts" type="checkbox" class="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" @change="$emit('filter')">
        <span class="text-sm font-medium text-gray-700">Satıcı Ürünleri</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer">
        <input v-model="showPendingProducts" type="checkbox" class="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" @change="$emit('filter')">
        <span class="text-sm font-medium text-gray-700">Onay Bekleyenler</span>
      </label>

      <div class="h-5 w-px bg-gray-200" />

      <!-- Görünürlük bayrak filtreleri -->
      <label class="flex items-center gap-2 cursor-pointer">
        <input v-model="featuredFilter" type="checkbox" class="w-5 h-5 text-blue-600 rounded border-gray-300" @change="$emit('filter')">
        <span class="text-sm font-medium text-blue-700">✨ Featured</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer">
        <input v-model="flashFilter" type="checkbox" class="w-5 h-5 text-orange-600 rounded border-gray-300" @change="$emit('filter')">
        <span class="text-sm font-medium text-orange-700">⚡ Flash Sale</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer">
        <input v-model="specialFilter" type="checkbox" class="w-5 h-5 text-red-600 rounded border-gray-300" @change="$emit('filter')">
        <span class="text-sm font-medium text-red-700">🔥 Özel Fırsat</span>
      </label>

      <div class="ml-auto">
        <button
          class="bg-primary-600 text-white py-2 px-6 rounded-lg hover:bg-primary-700 transition-colors font-semibold text-sm"
          @click="$emit('filter')"
        >Filtrele</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  categories:         { type: Array,   default: () => [] },
  vendors:            { type: Array,   default: () => [] },
  search:             { type: String,  default: '' },
  categoryId:         { type: [String, Number], default: '' },
  vendorId:           { type: [String, Number], default: '' },
  vendorProductsOnly: { type: Boolean, default: false },
  pendingOnly:        { type: Boolean, default: false },
  city:               { type: String,  default: '' },
  isFeatured:         { type: Boolean, default: false },
  isFlashSale:        { type: Boolean, default: false },
  isSpecialOffer:     { type: Boolean, default: false },
})

const emit = defineEmits([
  'update:search', 'update:categoryId', 'update:vendorId',
  'update:vendorProductsOnly', 'update:pendingOnly',
  'update:city', 'update:isFeatured', 'update:isFlashSale', 'update:isSpecialOffer',
  'filter',
])

const searchQuery       = computed({ get: () => props.search,             set: v => emit('update:search', v) })
const selectedCategoryId = computed({ get: () => props.categoryId,        set: v => emit('update:categoryId', v) })
const selectedVendorId  = computed({ get: () => props.vendorId,           set: v => emit('update:vendorId', v) })
const showVendorProducts = computed({ get: () => props.vendorProductsOnly, set: v => emit('update:vendorProductsOnly', v) })
const showPendingProducts = computed({ get: () => props.pendingOnly,       set: v => emit('update:pendingOnly', v) })
const cityFilter        = computed({ get: () => props.city,               set: v => emit('update:city', v) })
const featuredFilter    = computed({ get: () => props.isFeatured,         set: v => emit('update:isFeatured', v) })
const flashFilter       = computed({ get: () => props.isFlashSale,        set: v => emit('update:isFlashSale', v) })
const specialFilter     = computed({ get: () => props.isSpecialOffer,     set: v => emit('update:isSpecialOffer', v) })
</script>
