<template>
  <div class="min-h-screen bg-gray-50 p-6 lg:p-10">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight italic uppercase">
          👥 Personel <span class="text-indigo-600">Yönetimi</span>
        </h1>
        <p class="text-gray-500 mt-1 font-medium italic opacity-70">Mağaza alt-kullanıcılarını ve yetkilerini yönetin.</p>
      </div>
      <button class="px-8 py-4 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-gray-900 transition-all shadow-lg flex items-center gap-3 uppercase tracking-widest" @click="showCreateModal = true">
        <PlusIcon class="w-5 h-5" /> YENİ PERSONEL
      </button>
    </div>

    <!-- Filters (Reused from Admin) -->
    <AdminUsersUserFilters 
      :filters="filters"
      @change="fetchUsers"
      @search="fetchUsers"
    />

    <!-- User Table (Reused from Admin) -->
    <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div v-if="loading" class="flex justify-center py-24">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
      
      <AdminUsersUserTable 
        v-else
        :users="users"
        :pagination="pagination"
        :visible-pages="visiblePages"
        @change-page="p => { pagination.page = p; fetchUsers() }"
        @edit="u => { selectedUser = u; showCreateModal = true }"
        @delete="deleteUser"
      />
    </div>

    <!-- User Form Modal -->
    <UserModal
      v-if="showCreateModal || selectedUser"
      :user="selectedUser"
      @close="closeModal"
      @saved="onUserSaved"
    />
  </div>
</template>

<script setup>
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useVendorUsers } from '~/composables/useVendorUsers'

definePageMeta({ layout: 'vendor', middleware: 'auth' })
useHead({ title: 'Personel Yönetimi - BazarX' })

const {
  users, loading, filters, pagination,
  showCreateModal, selectedUser,
  fetchUsers, deleteUser
} = useVendorUsers()

const visiblePages = computed(() => {
  const pages = []
  const max = pagination.value.pages || 1
  for (let i = 1; i <= max; i++) pages.push(i)
  return pages
})

const closeModal = () => { selectedUser.value = null; showCreateModal.value = false }
const onUserSaved = () => { closeModal(); fetchUsers() }

onMounted(fetchUsers)
</script>