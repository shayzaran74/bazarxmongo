<template>
  <div class="p-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          📦 Sipariş Yönetimi
        </h1>
        <p class="text-gray-600 mt-1">
          Tüm müşteri siparişlerini ve kargo süreçlerini yönetin
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <select 
          v-model="filterVendorId" 
          class="p-2 border border-gray-100 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">
            Tüm Satıcılar
          </option>
          <option
            v-for="vendor in vendors"
            :key="vendor.id"
            :value="vendor.id"
          >
            {{ vendor.businessName }}
          </option>
        </select>
        <button
          class="btn-outline flex items-center shadow-sm"
          @click="fetchOrders"
        >
          <ArrowPathIcon
            class="h-5 w-5 mr-2"
            :class="{ 'animate-spin': loading }"
          />
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

    <!-- Filters & Stats -->
    <AdminOrderStats :orders="orders" />

    <!-- Orders Filter Bar -->
    <AdminOrderFilter 
      v-model:status-filter="filterStatus"
      v-model:search-query="searchQuery"
    />

    <!-- Orders Table -->
    <AdminOrderTable 
      v-model:selected-ids="selectedOrderIds"
      :orders="filteredOrders"
      :loading="loading"
      :is-all-selected="isAllOrdersSelected"
      @toggle-select-all="toggleSelectAllOrders"
    />

    <!-- Pagination placeholder -->
    <div class="mt-6 flex justify-between items-center px-4">
      <p class="text-sm text-gray-500">
        Toplam {{ totalOrders }} sipariş
      </p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { ArrowPathIcon } from '@heroicons/vue/24/outline'
import AdminOrderStats from '~/components/admin/order/AdminOrderStats.vue'
import AdminOrderFilter from '~/components/admin/order/AdminOrderFilter.vue'
import AdminOrderBulkActions from '~/components/admin/order/AdminOrderBulkActions.vue'
import AdminOrderTable from '~/components/admin/order/AdminOrderTable.vue'
import { useAdminOrders } from '~/composables/useAdminOrders'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const {
  orders,
  vendors,
  loading,
  filterStatus,
  filterVendorId,
  searchQuery,
  totalOrders,
  selectedOrderIds,
  bulkProcessing,
  bulkStatus,
  filteredOrders,
  isAllOrdersSelected,
  fetchVendors,
  fetchOrders,
  toggleSelectAllOrders,
  bulkUpdateStatus
} = useAdminOrders()

onMounted(() => {
  fetchVendors()
  fetchOrders()
})
</script>
