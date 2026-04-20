<template>
  <div class="py-8 space-y-12 italic uppercase">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-10">
      <div>
        <h1 class="text-5xl font-black text-gray-900 tracking-tightest leading-none italic">
          ÜRÜN <span class="text-indigo-600">ONAYLARI</span>
        </h1>
        <p class="mt-4 text-[10px] font-black text-gray-400 tracking-widest leading-none">
          SATICILAR TARAFINDAN EKLENEN VE ONAY BEKLEYEN ÜRÜN SPEKTRUMLARINI BURADAN YÖNETİN.
        </p>
      </div>

      <NuxtLink
        to="/admin"
        class="h-14 px-8 bg-white border border-neutral-100 text-gray-400 rounded-2xl shadow-xl hover:text-gray-900 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-4 group italic"
      >
        <span class="group-hover:-translate-x-2 transition-transform">←</span> DASHBOARD'A DÖN
      </NuxtLink>
    </div>

    <!-- Stats -->
    <PendingStats :total="pagination.total" :approved="approvedToday" :rejected="rejectedToday" />

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-100 px-10 py-6 rounded-3xl text-red-600 font-black text-xs shadow-inner">
      {{ error }}
    </div>

    <!-- Table -->
    <PendingTable
      :products="products"
      :pagination="pagination"
      @view="(p) => { selectedProduct = p; showModal = true }"
      @approve="approveProduct"
      @reject="rejectProduct"
      @page="fetchPendingProducts"
    />

    <!-- Detail Modal -->
    <PendingDetailModal
      :is-open="showModal"
      :product="selectedProduct"
      @close="showModal = false"
      @approve="approveProduct"
      @reject="rejectProduct"
    />
  </div>
</template>

<script setup>
import PendingStats from '~/components/admin/products/PendingStats.vue'
import PendingTable from '~/components/admin/products/PendingTable.vue'
import PendingDetailModal from '~/components/admin/products/PendingDetailModal.vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'ÜRÜN ONAY MERKEZİ // BAZARX' })

const {
  products, loading, error, pagination, approvedToday, rejectedToday,
  showModal, selectedProduct,
  fetchPendingProducts, approveProduct, rejectProduct
} = useAdminPendingProducts()
</script>
