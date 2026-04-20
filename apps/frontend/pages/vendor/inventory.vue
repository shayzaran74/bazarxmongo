<template>
  <div class="py-6 space-y-12 italic uppercase">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-10">
      <div>
        <h2 class="text-5xl font-black text-gray-900 tracking-tightest leading-none italic">
          STOK <span class="text-indigo-600">ENVANTERİ</span>
        </h2>
        <p class="mt-4 text-[10px] font-black text-gray-400 tracking-widest leading-none">
          TÜM ÜRÜNLERİNİZİN STOK DURUMUNU VE DENETİM KAYITLARINI BURADAN YÖNETİN.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <button
          :disabled="exporting"
          class="h-14 px-8 bg-white border border-neutral-100 text-gray-400 rounded-2xl shadow-xl hover:text-gray-900 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-4 disabled:opacity-50 active:scale-95 group"
          @click="exportPDF"
        >
          <DocumentArrowDownIcon v-if="!exporting" class="h-6 w-6 text-indigo-400 group-hover:scale-110 transition-transform" />
          <div v-else class="h-6 w-6 animate-spin rounded-full border-[3px] border-indigo-600 border-r-transparent" />
          RAPORU İNDİR
        </button>

        <NuxtLink
          to="/vendor/purchase-orders"
          class="h-14 px-8 bg-white border border-neutral-100 text-gray-400 rounded-2xl shadow-xl hover:text-gray-900 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-4 group"
        >
          <DocumentPlusIcon class="h-6 w-6 text-indigo-400 group-hover:scale-110 transition-transform" />
          SATINALMA YÖNETİMİ
        </NuxtLink>

        <NuxtLink
          to="/vendor/product-form"
          class="h-14 px-10 bg-indigo-600 text-white rounded-2xl shadow-2xl shadow-indigo-100 hover:bg-black transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-4 active:scale-95"
        >
          <PlusIcon class="h-6 w-6" />
          YENİ ÜRÜN EKLE
        </NuxtLink>
      </div>
    </div>

    <!-- Stats -->
    <InventoryStats :stats="stats" />

    <!-- Filters -->
    <InventoryFilters v-model="filters" :categories="categories" @fetch="fetchProducts" @reset="fetchProducts" />

    <!-- Table -->
    <InventoryTable :products="products" :loading="loading" @history="fetchHistory" @adjust="(p) => { selectedProduct = p; showStockModal = true }" />

    <!-- Modals -->
    <StockAdjustModal
      :is-open="showStockModal"
      :product="selectedProduct"
      v-model:stock-change="stockChange"
      v-model:reason="adjustReason"
      @close="showStockModal = false"
      @save="updateStock"
    />

    <StockHistoryModal
      :is-open="showHistoryModal"
      :product="selectedProduct"
      :history="history"
      :loading="historyLoading"
      @close="showHistoryModal = false"
    />
  </div>
</template>

<script setup>
import { PlusIcon, DocumentPlusIcon, DocumentArrowDownIcon } from '@heroicons/vue/24/outline'
import InventoryStats from '~/components/vendor/inventory/InventoryStats.vue'
import InventoryFilters from '~/components/vendor/inventory/InventoryFilters.vue'
import InventoryTable from '~/components/vendor/inventory/InventoryTable.vue'
import StockAdjustModal from '~/components/vendor/inventory/StockAdjustModal.vue'
import StockHistoryModal from '~/components/vendor/inventory/StockHistoryModal.vue'

definePageMeta({ layout: 'vendor', middleware: 'vendor' })
useHead({ title: 'ENVANTER YÖNETİMİ // BAZARX' })

const {
  products, categories, loading, exporting, stats, filters,
  showStockModal, showHistoryModal, selectedProduct, stockChange, adjustReason, history, historyLoading,
  fetchStats, fetchCategories, fetchProducts, exportPDF, updateStock, fetchHistory
} = useVendorInventory()

onMounted(() => {
  fetchProducts()
  fetchCategories()
  fetchStats()
})
</script>
