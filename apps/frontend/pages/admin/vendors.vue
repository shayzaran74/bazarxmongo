<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">
          👥 Satıcı Yönetimi
        </h1>
        <AdminVendorFilter 
          v-model:search-query="vendorSearchQuery"
          v-model:status-filter="statusFilter"
        />
      </div>

      <!-- Satıcılar Tablosu -->
      <AdminVendorTable 
        :vendors="filteredVendors"
        :loading="loading"
        @open-detail="openVendorDetail"
        @approve="approveVendor"
        @show-reject="openVendorDetail($event); showRejectForm = true"
      />

      <!-- Satıcı Detay Modal -->
      <AdminVendorDetailModal 
        v-if="selectedVendor"
        v-model:selected-category-id="selectedCategoryId"
        v-model:show-reject-form="showRejectForm"
        v-model:rejection-reason="rejectionReason"
        v-model:vendor="selectedVendor"
        :available-categories="availableCategories"
        :action-loading="vendorActionLoading"
        @close="closeVendorDetail"
        @approve="approveVendor"
        @reject="rejectVendor"
        @cancel-reject="showRejectForm = false"
        @save-b2b="saveB2BSettings"
        @toggle-featured="toggleFeatured"
        @remove-category="removeCategory"
        @add-category="addCategory"
        @update-type="updateVendorType"
        @toggle-barter="toggleBarterEnabled"
        @delete="deleteVendor"
        @suspend="suspendVendor"
        @reinstate="reinstateVendor"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useAdminVendors } from '~/composables/useAdminVendors'
import AdminVendorFilter from '~/components/admin/vendor/AdminVendorFilter.vue'
import AdminVendorTable from '~/components/admin/vendor/AdminVendorTable.vue'
import AdminVendorDetailModal from '~/components/admin/vendor/AdminVendorDetailModal.vue'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
})

useHead({
  title: 'Satıcı Yönetimi',
})

const {
  loading, vendorActionLoading,
  selectedVendor, selectedCategoryId, 
  statusFilter, vendorSearchQuery,
  showRejectForm, rejectionReason,
  filteredVendors, availableCategories,
  fetchVendors, fetchCategories, openVendorDetail, closeVendorDetail,
  approveVendor, rejectVendor, toggleFeatured, toggleBarterEnabled, saveB2BSettings,
  addCategory, removeCategory, updateVendorType, deleteVendor,
  suspendVendor, reinstateVendor
} = useAdminVendors()

onMounted(async () => {
  const authStore = useAuthStore()
  await authStore.init()
  Promise.all([
    fetchVendors(),
    fetchCategories()
  ])
})
</script>
