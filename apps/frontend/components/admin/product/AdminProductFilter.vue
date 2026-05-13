<template>
  <div class="bg-white rounded-lg shadow p-6 mb-8">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Ara</label>
        <input 
          id="search-query" 
          v-model="searchQuery" 
          type="text"
          placeholder="İsim, Barkod, SKU..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
        <select 
          id="filter-category" 
          v-model="selectedCategoryId"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">
            Tüm Kategoriler
          </option>
          <option
            v-for="cat in categories"
            :key="cat.id"
            :value="cat.id"
          >
            {{ cat.name }}
          </option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Satıcı</label>
        <select 
          id="filter-vendor" 
          v-model="selectedVendorId"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">
            Platform Ürünleri & Tümü
          </option>
          <option
            v-for="vendor in vendors"
            :key="vendor.id"
            :value="vendor.id"
          >
            {{ vendor.name }}
          </option>
        </select>
      </div>
      <div class="flex items-end">
        <button 
          class="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
          @click="$emit('filter')"
        >
          Filtrele
        </button>
      </div>
    </div>

    <div class="flex flex-wrap gap-6 items-center pt-4 border-t border-gray-100">
      <div class="flex items-center">
        <input 
          id="show-vendor-products" 
          v-model="showVendorProducts" 
          type="checkbox"
          class="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
          @change="$emit('filter')"
        >
        <label
          for="show-vendor-products"
          class="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
        >
          Satıcı Ürünlerini Göster
        </label>
      </div>
      <div class="flex items-center">
        <input 
          id="show-pending-products" 
          v-model="showPendingProducts" 
          type="checkbox"
          class="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
          @change="$emit('filter')"
        >
        <label
          for="show-pending-products"
          class="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
        >
          Onay Bekleyenler
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from '#imports'

const props = defineProps({
  categories: { type: Array, default: () => [] },
  vendors: { type: Array, default: () => [] },
  search: { type: String, default: '' },
  categoryId: { type: [String, Number], default: '' },
  vendorId: { type: [String, Number], default: '' },
  vendorProductsOnly: { type: Boolean, default: false },
  pendingOnly: { type: Boolean, default: false }
})

const emit = defineEmits(['update:search', 'update:categoryId', 'update:vendorId', 'update:vendorProductsOnly', 'update:pendingOnly', 'filter'])

const searchQuery = computed({
  get: () => props.search,
  set: (val) => emit('update:search', val)
})

const selectedCategoryId = computed({
  get: () => props.categoryId,
  set: (val) => emit('update:categoryId', val)
})

const selectedVendorId = computed({
  get: () => props.vendorId,
  set: (val) => emit('update:vendorId', val)
})

const showVendorProducts = computed({
  get: () => props.vendorProductsOnly,
  set: (val) => emit('update:vendorProductsOnly', val)
})

const showPendingProducts = computed({
  get: () => props.pendingOnly,
  set: (val) => emit('update:pendingOnly', val)
})
</script>
