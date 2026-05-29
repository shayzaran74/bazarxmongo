<template>
  <div class="min-h-screen bg-gray-50 p-6 lg:p-10">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight italic uppercase">
          👥 Kullanıcı <span class="text-indigo-600">Yönetimi</span>
        </h1>
        <p class="text-gray-500 mt-1 font-medium italic opacity-70">Müşterileri, adminleri ve satıcı adaylarını denetleyin.</p>
      </div>
      <div class="flex gap-3">
        <button class="px-6 py-3 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-gray-900 transition-all shadow-lg flex items-center gap-2" @click="showCreateModal = true">
          <PlusIcon class="w-5 h-5" /> KULLANICI EKLE
        </button>
        <button class="p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-sm border border-gray-100 transition-all group" @click="fetchUsers">
          <ArrowPathIcon class="h-6 w-6 text-indigo-600 group-hover:rotate-180 transition-all duration-500" />
        </button>
      </div>
    </div>

    <!-- Summary Stats -->
    <UserStats :stats="stats" />

    <!-- Filters -->
    <UserFilters 
      :filters="filters" 
      @change="fetchUsers" 
      @search="searchUsers" 
    />

    <!-- Table -->
    <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-[32px] border border-gray-100">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
        <p class="text-sm font-black text-gray-400 uppercase tracking-widest italic leading-none">Veriler Yükleniyor...</p>
      </div>
      
      <UserTable 
        v-else
        :users="users"
        :pagination="pagination"
        :visible-pages="visiblePages"
        @change-page="changePage"
        @edit="editUser"
        @delete="deleteUser"
        @approve-vendor="openVendorApproval"
      />
    </div>

    <!-- Modals -->
    <UserModal
      v-if="showCreateModal || selectedUser"
      :user="selectedUser"
      @close="closeModal"
      @saved="onUserSaved"
    />

    <VendorApprovalModal
      :show="showVendorApprovalModal"
      :user="selectedUser"
      v-model:reason="vendorApprovalReason"
      :loading="vendorActionLoading"
      @close="showVendorApprovalModal = false"
      @approve="approveVendor"
      @reject="rejectVendor"
    />
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { PlusIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import { useAdminUsers } from '~/composables/useAdminUsers'

// Modüler Bileşenler
import UserStats from '~/components/admin/users/UserStats.vue'
import UserFilters from '~/components/admin/users/UserFilters.vue'
import UserTable from '~/components/admin/users/UserTable.vue'
import VendorApprovalModal from '~/components/admin/users/VendorApprovalModal.vue'
import UserModal from '~/components/modals/UserModal.vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Kullanıcı Yönetimi - BazarX Admin' })

const {
  users, loading, filters, stats, pagination,
  showCreateModal, selectedUser, showVendorApprovalModal,
  vendorApprovalReason, vendorActionLoading,
  fetchUsers, deleteUser, approveVendor, rejectVendor,
  changePage, searchUsers
} = useAdminUsers()

// Pagination Helper
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, pagination.value.page - 2)
  const end = Math.min(pagination.value.pages, start + 4)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

// Handlers
const editUser = (user) => { selectedUser.value = user }
const closeModal = () => { selectedUser.value = null; showCreateModal.value = false }
const onUserSaved = () => { closeModal(); fetchUsers() }
const openVendorApproval = (user) => { selectedUser.value = user; showVendorApprovalModal.value = true }

onMounted(fetchUsers)
</script>