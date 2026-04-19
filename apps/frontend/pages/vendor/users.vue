<template>
  <div class="px-4 py-6 sm:px-0">
    <!-- Header with Create Button -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          Müşteriler
        </h1>
        <p class="text-gray-600 mt-1">
          Müşterilerinizi yönetin
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <NuxtLink
          to="/admin/segments"
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Segmentler
        </NuxtLink>
        <a
          href="/admin/customer-form"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon class="h-5 w-5 mr-2" />
          Müşteri ekle
        </a>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow mb-6 p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Arama</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="İsim, email ara..."
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
            @input="debounceSearch"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Durum</label>
          <select
            v-model="filters.status"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
            @change="fetchUsers"
          >
            <option value="">
              Tüm Durumlar
            </option>
            <option value="Active">
              Aktif
            </option>
            <option value="Inactive">
              Pasif
            </option>
            <option value="Suspended">
              Askıya Alınmış
            </option>
            <option value="Banned">
              Banlanmış
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
          <select
            v-model="filters.role"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
            @change="fetchUsers"
          >
            <option value="">
              Tüm Roller
            </option>
            <option value="admin">
              Admin
            </option>
            <option value="user">
              Kullanıcı
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Satıcı Durumu</label>
          <select
            v-model="filters.vendorStatus"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
            @change="fetchUsers"
          >
            <option value="">
              Tüm Satıcılar
            </option>
            <option value="PENDING">
              Onay Beklemede
            </option>
            <option value="APPROVED">
              Onaylı
            </option>
            <option value="REJECTED">
              Reddedilmiş
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Sıralama</label>
          <select
            v-model="filters.sortBy"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
            @change="fetchUsers"
          >
            <option value="created_desc">
              Yeni Kayıtlar
            </option>
            <option value="created_asc">
              Eski Kayıtlar
            </option>
            <option value="name_asc">
              İsim (A-Z)
            </option>
            <option value="name_desc">
              İsim (Z-A)
            </option>
            <option value="lastLogin_desc">
              Son Giriş
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <UsersIcon class="h-6 w-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">
              Toplam Kullanıcı
            </p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ stats.total }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <CheckCircleIcon class="h-6 w-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">
              Aktif Kullanıcı
            </p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ stats.active }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 rounded-lg">
            <ShieldCheckIcon class="h-6 w-6 text-purple-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">
              Admin
            </p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ stats.admins }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <CalendarIcon class="h-6 w-6 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">
              Bu Ay Yeni
            </p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ stats.thisMonth }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-2 bg-orange-100 rounded-lg">
            <ShoppingBagIcon class="h-6 w-6 text-orange-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">
              Satıcı Adayları
            </p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ stats.vendorPending }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div
        v-if="loading"
        class="p-8 text-center"
      >
        <div class="spinner h-8 w-8 mx-auto" />
        <p class="mt-2 text-gray-500">
          Kullanıcılar yükleniyor...
        </p>
      </div>

      <div
        v-else-if="error"
        class="p-8 text-center text-red-500"
      >
        {{ error }}
      </div>

      <div v-else>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kullanıcı
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Satıcı Durumu
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kayıt Tarihi
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Son Giriş
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="user in users"
              :key="user.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img
                      v-if="user.profile?.avatar"
                      class="h-10 w-10 rounded-full"
                      :src="user.profile.avatar.startsWith('http') ? user.profile.avatar : `${useRuntimeConfig().public.apiBase}${user.profile.avatar}`"
                      :alt="user.profile.firstName"
                    >
                    <div
                      v-else
                      class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center"
                    >
                      <span class="text-sm font-medium text-gray-700">
                        {{ (user.profile?.firstName || user.email)?.charAt(0) }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ user.profile ? `${user.profile.firstName} ${user.profile.lastName || ''}`.trim() : 'İsimsiz' }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ user.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getStatusBadgeClass(user.status)"
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                >
                  {{ getStatusText(user.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span
                  v-if="user.isAdmin"
                  class="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full"
                >
                  Admin
                </span>
                <span
                  v-else
                  class="text-gray-500"
                >Kullanıcı</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span
                  v-if="user.vendor"
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    user.vendor.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    user.vendor.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    user.vendor.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ user.vendor.status === 'APPROVED' ? '✓ Onaylı' :
                    user.vendor.status === 'PENDING' ? '⌛ Beklemede' :
                    user.vendor.status === 'REJECTED' ? '✗ Reddedildi' :
                    user.vendor.status }}
                </span>
                <span
                  v-else
                  class="text-gray-400 text-xs"
                >-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ user.lastLogin ? formatDate(user.lastLogin) : 'Hiç giriş yapmamış' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button
                    v-if="user.vendor && user.vendor.status === 'PENDING'"
                    class="text-green-600 hover:text-green-900 text-xs font-semibold"
                    @click="openVendorApproval(user)"
                  >
                    Satıcı Onayla
                  </button>
                  <button
                    class="text-primary-600 hover:text-primary-900 text-xs"
                    @click="editUser(user)"
                  >
                    Düzenle
                  </button>
                  <button
                    :class="user.status === 'Active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
                    class="text-xs"
                    @click="toggleUserStatus(user)"
                  >
                    {{ user.status === 'Active' ? 'Pasif Yap' : 'Aktif Yap' }}
                  </button>
                  <button
                    class="text-red-600 hover:text-red-900 text-xs"
                    @click="deleteUser(user)"
                  >
                    Sil
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div
          v-if="pagination.pages > 1"
          class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
        >
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              :disabled="pagination.page <= 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              @click="changePage(pagination.page - 1)"
            >
              Önceki
            </button>
            <button
              :disabled="pagination.page >= pagination.pages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              @click="changePage(pagination.page + 1)"
            >
              Sonraki
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                <span class="font-medium">{{ (pagination.page - 1) * pagination.limit + 1 }}</span>
                -
                <span class="font-medium">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span>
                of
                <span class="font-medium">{{ pagination.total }}</span>
                results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <!-- Pagination buttons -->
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  :class="[
                    page === pagination.page
                      ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                  ]"
                  @click="changePage(page)"
                >
                  {{ page }}
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit User Modal -->
    <UserModal
      v-if="showCreateModal || selectedUser"
      :user="selectedUser"
      @close="closeModal"
      @saved="onUserSaved"
    />

    <!-- Vendor Approval Modal -->
    <Teleport to="body">
      <div
        v-if="showVendorApprovalModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div class="bg-gray-50 px-6 py-4 flex justify-between items-center border-b">
            <h2 class="text-lg font-semibold">
              {{ selectedUser?.name }} - Satıcı Onayı
            </h2>
            <button
              class="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              @click="closeVendorModal"
            >
              ×
            </button>
          </div>

          <div class="p-6 space-y-4">
            <!-- Vendor Info -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <p class="font-semibold text-blue-900 mb-2">
                🏢 İşletme Bilgileri
              </p>
              <p><strong>İletme Adı:</strong> {{ selectedVendor?.businessName }}</p>
              <p><strong>Telefon:</strong> {{ selectedVendor?.phone }}</p>
              <p><strong>Kategoriler:</strong> {{ selectedVendor?.categories?.length || 0 }}</p>
            </div>

            <!-- Durum -->
            <div class="flex gap-2">
              <span
                v-if="selectedVendor?.status === 'PENDING'"
                class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold"
              >
                ⌛ Onay Beklemede
              </span>
            </div>

            <!-- Red Sebebi Input -->
            <div>
              <label class="block text-sm font-medium mb-2">Red Sebebi (Réd etme durumunda)</label>
              <textarea
                v-model="vendorApprovalReason"
                rows="3"
                placeholder="Neden reddedildiğinını belirtiniz..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            <!-- Buttons -->
            <div class="flex gap-3">
              <button
                :disabled="vendorActionLoading"
                class="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
                @click="approveVendor"
              >
                {{ vendorActionLoading ? 'İşleniyor...' : '✅ Onayla' }}
              </button>
              <button
                :disabled="vendorActionLoading"
                class="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-semibold"
                @click="rejectVendor"
              >
                {{ vendorActionLoading ? 'İşleniyor...' : '✗ Reddet' }}
              </button>
            </div>
            <button
              class="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-semibold"
              @click="closeVendorModal"
            >
              İptal
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import {
  PlusIcon,
  UsersIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ShoppingBagIcon
} from '@heroicons/vue/24/outline'

// Layout
definePageMeta({
  layout: 'vendor',
  middleware: 'vendor'
})

// Page meta
useHead({
  title: 'Kullanıcı Yönetimi - Admin Panel',
  meta: [
    { name: 'description', content: 'Kullanıcı yönetimi sayfası' }
  ]
})

// Stores
const authStore = useAuthStore()

// State
const users = ref([])
const loading = ref(false)
const error = ref(null)
const showCreateModal = ref(false)
const selectedUser = ref(null)
const selectedVendor = ref(null)
const showVendorApprovalModal = ref(false)
const vendorApprovalReason = ref('')
const vendorActionLoading = ref(false)

const filters = ref({
  search: '',
  status: '',
  role: '',
  vendorStatus: '',
  sortBy: 'created_desc'
})

const stats = ref({
  total: 0,
  active: 0,
  admins: 0,
  thisMonth: 0,
  vendorPending: 0
})

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0
})

// Computed
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, pagination.value.page - 2)
  const end = Math.min(pagination.value.pages, start + 4)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// Methods
const fetchUsers = async () => {
  loading.value = true
  error.value = null

  try {
    console.log('Fetching users with token:', authStore.token ? 'Present' : 'Missing')
    console.log('User:', authStore.user)

    const { $api } = useApi()
    const response = await $api('/api/admin/users', {
      query: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: filters.value.search || '',
        status: filters.value.status || '',
        role: filters.value.role || ''
      }
    })

    console.log('API Response:', response)

    if (response.success) {
      users.value = response.data || []

      // Update stats
      stats.value = {
        total: response.pagination?.total || users.value.length,
        active: users.value.filter(u => u.status === 'Active').length,
        admins: users.value.filter(u => u.isAdmin).length,
        thisMonth: users.value.filter(u => new Date(u.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
        vendorPending: users.value.filter(u => u.vendor && u.vendor.status === 'PENDING').length
      }

      pagination.value = {
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 10,
        total: response.pagination?.total || users.value.length,
        pages: response.pagination?.totalPages || Math.ceil(users.value.length / 10)
      }

      console.log('Successfully loaded users:', users.value.length)
      useNuxtApp().$toast.success(`${users.value.length} kullanıcı başarıyla yüklendi`)
    } else {
      throw new Error(response.error || 'Kullanıcılar yüklenirken hata oluştu')
    }
  } catch (err) {
    console.error('Fetch users error:', err)
    error.value = err.message || 'Bilinmeyen hata'

    // Check for specific error types
    if (err.statusCode === 401 || err.message.includes('401') || err.message.includes('Unauthorized')) {
      useNuxtApp().$toast.error('Yetkilendirme hatası. Lütfen tekrar giriş yapın.')
      await authStore.logout()
      return
    }

    if (err.statusCode === 403 || err.message.includes('403') || err.message.includes('Forbidden')) {
      useNuxtApp().$toast.error('Bu işlem için yönetici yetkisi gerekli.')
      await navigateTo('/')
      return
    }

    if (err.statusCode === 429 || err.message.includes('429') || err.message.includes('Rate limit')) {
      useNuxtApp().$toast.warning('API çok meşgul, demo veriler gösteriliyor')
    } else {
      useNuxtApp().$toast.warning('API bağlantısı kurulamadı, demo veriler gösteriliyor.')
    }

    // Fallback to mock data on error
    const mockUsers = [
      {
        id: '1',
        name: 'Admin Kullanıcı',
        email: 'shayzaran74@gmail.com',
        status: 'Active',
        isAdmin: true,
        avatar: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        lastLogin: '2024-01-15T10:30:00.000Z'
      },
      {
        id: '2',
        name: 'Test Kullanıcı',
        email: 'test@example.com',
        status: 'Active',
        isAdmin: false,
        avatar: null,
        createdAt: '2024-01-10T00:00:00.000Z',
        lastLogin: '2024-01-14T15:45:00.000Z'
      }
    ]

    users.value = mockUsers
    stats.value = {
      total: mockUsers.length,
      active: mockUsers.filter(u => u.status === 'Active').length,
      admins: mockUsers.filter(u => u.isAdmin).length,
      thisMonth: mockUsers.filter(u => new Date(u.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length
    }

    pagination.value = {
      page: 1,
      limit: 10,
      total: mockUsers.length,
      pages: Math.ceil(mockUsers.length / 10)
    }
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.pages) {
    pagination.value.page = page
    fetchUsers()
  }
}

const editUser = (user) => {
  selectedUser.value = user
}

const deleteUser = async (user) => {
  if (confirm(`${user.name || user.email} kullanıcısını silmek istediğinizden emin misiniz?`)) {
    try {
      const { $api } = useApi()
      const response = await $api(`/api/admin/users/${user.id}`, {
        method: 'DELETE'
      })

      if (response.success) {
        await fetchUsers() // Refresh data
        useNuxtApp().$toast.success('Kullanıcı başarıyla silindi')
      }
    } catch (err) {
      console.error('Delete user error:', err)
      // Fallback to mock delete
      users.value = users.value.filter(u => u.id !== user.id)
      useNuxtApp().$toast.success('Kullanıcı başarıyla silindi (demo mod)')
    }
  }
}

const toggleUserStatus = async (user) => {
  try {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active'

    const { $api } = useApi()
    const response = await $api(`/api/admin/users/${user.id}/status`, {
      method: 'PATCH',
      body: {
        status: newStatus
      }
    })

    if (response.success) {
      user.status = newStatus
      useNuxtApp().$toast.success(`Kullanıcı durumu ${newStatus === 'Active' ? 'aktif' : 'pasif'} yapıldı`)
    }
  } catch (err) {
    console.error('Toggle user status error:', err)
    // Fallback to local update
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active'
    user.status = newStatus
    useNuxtApp().$toast.success(`Kullanıcı durumu ${newStatus === 'Active' ? 'aktif' : 'pasif'} yapıldı (demo mod)`)
  }
}

const closeModal = () => {
  showCreateModal.value = false
  selectedUser.value = null
}

const onUserSaved = () => {
  closeModal()
  fetchUsers()
}

// Helper methods
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800'
    case 'Inactive':
      return 'bg-gray-100 text-gray-800'
    case 'Suspended':
      return 'bg-yellow-100 text-yellow-800'
    case 'Banned':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'Active':
      return 'Aktif'
    case 'Inactive':
      return 'Pasif'
    case 'Suspended':
      return 'Askıya Alınmış'
    case 'Banned':
      return 'Banlanmış'
    default:
      return status
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Debounced search
let searchTimeout = null
const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchUsers()
  }, 500)
}

const openVendorApproval = (user) => {
  selectedVendor.value = user.vendor
  selectedUser.value = user
  showVendorApprovalModal.value = true
  vendorApprovalReason.value = ''
}

const closeVendorModal = () => {
  showVendorApprovalModal.value = false
  selectedVendor.value = null
  selectedUser.value = null
  vendorApprovalReason.value = ''
}

const approveVendor = async () => {
  if (!selectedVendor.value) return

  vendorActionLoading.value = true
  try {
    const { $api } = useApi()
    await $api(`/api/admin/vendors/${selectedVendor.value.id}/approve`, {
      method: 'PUT'
    })

    // Update user data
    if (selectedUser.value) {
      selectedUser.value.vendor.status = 'APPROVED'
      selectedUser.value.vendor.verifiedAt = new Date().toISOString()
    }

    useNuxtApp().$toast.success(`✅ ${selectedUser.value?.name || 'Satıcı'} onaylandı`)
    closeVendorModal()
    await fetchUsers()
  } catch (error) {
    console.error('Hata:', error)
    useNuxtApp().$toast.error('Bir hata oluştu')
  } finally {
    vendorActionLoading.value = false
  }
}

const rejectVendor = async () => {
  if (!selectedVendor.value) return

  vendorActionLoading.value = true
  try {
    const { $api } = useApi()
    await $api(`/api/vendors/${selectedVendor.value.id}/reject`, {
      method: 'PUT',
      body: { rejectionReason: vendorApprovalReason.value }
    })

    // Update user data
    if (selectedUser.value) {
      selectedUser.value.vendor.status = 'REJECTED'
      selectedUser.value.vendor.rejectionReason = vendorApprovalReason.value
    }

    useNuxtApp().$toast.success(`✗ ${selectedUser.value?.name || 'Satıcı'} reddedildi`)
    closeVendorModal()
    await fetchUsers()
  } catch (error) {
    console.error('Hata:', error)
    useNuxtApp().$toast.error('Bir hata oluştu')
  } finally {
    vendorActionLoading.value = false
  }
}

// Initialize
onMounted(() => {
  fetchUsers()
})
</script>