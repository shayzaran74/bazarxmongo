<template>
  <div class="p-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">📦 Sipariş Yönetimi</h1>
        <p class="text-gray-600 mt-1">Tüm müşteri siparişlerini ve kargo süreçlerini yönetin</p>
      </div>
      <div class="flex items-center space-x-3">
        <select
          v-model="filterVendorId"
          class="p-2 border border-gray-100 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">Tüm Satıcılar</option>
          <option v-for="vendor in vendors" :key="vendor.id" :value="vendor.id">
            {{ vendor.businessName }}
          </option>
        </select>
        <button class="btn-outline flex items-center shadow-sm" @click="fetchOrders">
          <ArrowPathIcon class="h-5 w-5 mr-2" :class="{ 'animate-spin': loading }" />
          Yenile
        </button>
      </div>
    </div>

    <!-- Bulk Actions -->
    <AdminOrderBulkActions
      v-model:bulk-status="bulkStatus"
      :selected-count="selectedOrderIds.length"
      :bulk-processing="bulkProcessing"
      @apply="bulkUpdateStatus"
      @cancel="selectedOrderIds = []"
    />

    <!-- Stats -->
    <AdminOrderStats :orders="orders" />

    <!-- Filters -->
    <AdminOrderFilter
      v-model:status-filter="filterStatus"
      v-model:search-query="searchQuery"
    />

    <!-- Table -->
    <AdminOrderTable
      v-model:selected-ids="selectedOrderIds"
      :orders="filteredOrders"
      :loading="loading"
      :is-all-selected="isAllOrdersSelected"
      @toggle-select-all="toggleSelectAllOrders"
    />

    <!-- Pagination -->
    <div class="mt-6 flex justify-between items-center px-4">
      <p class="text-sm text-gray-500">
        Toplam {{ totalOrders }} sipariş
        <span v-if="totalPages > 1" class="ml-2">— Sayfa {{ pagination.page }} / {{ totalPages }}</span>
      </p>
      <div v-if="totalPages > 1" class="flex gap-2">
        <button
          v-for="p in totalPages"
          :key="p"
          :class="pagination.page === p ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:text-gray-900'"
          class="w-9 h-9 rounded-lg text-xs font-bold border border-gray-100 transition-colors"
          @click="pagination.page = p"
        >
          {{ p }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { ArrowPathIcon } from '@heroicons/vue/24/outline'
import AdminOrderStats from '~/components/admin/order/AdminOrderStats.vue'
import AdminOrderFilter from '~/components/admin/order/AdminOrderFilter.vue'
import AdminOrderBulkActions from '~/components/admin/order/AdminOrderBulkActions.vue'
import AdminOrderTable from '~/components/admin/order/AdminOrderTable.vue'
import { useAdminOrders } from '~/composables/useAdminOrders'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const {
  orders,
  vendors,
  loading,
  filterStatus,
  filterVendorId,
  searchQuery,
  totalOrders,
  totalPages,
  pagination,
  selectedOrderIds,
  bulkProcessing,
  bulkStatus,
  filteredOrders,
  isAllOrdersSelected,
  fetchVendors,
  fetchOrders,
  toggleSelectAllOrders,
  bulkUpdateStatus,
} = useAdminOrders()

onMounted(() => {
  fetchVendors()
  fetchOrders()
})
</script>
