import { ref, computed, onMounted } from 'vue'

export const useAdminUsers = () => {
  const { $api } = useApi()
  const authStore = useAuthStore()
  const config = useRuntimeConfig()
  const toast = useNuxtApp().$toast

  // State
  const users = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
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

  // Modal State
  const showCreateModal = ref(false)
  const selectedUser = ref<any>(null)
  const selectedVendor = ref<any>(null)
  const showVendorApprovalModal = ref(false)
  const vendorApprovalReason = ref('')
  const vendorActionLoading = ref(false)

  // Fetch Logic
  const fetchUsers = async () => {
    loading.value = true
    error.value = null
    try {
      const res: any = await $api('/api/admin/users', {
        query: {
          page: pagination.value.page,
          limit: pagination.value.limit,
          search: filters.value.search || '',
          status: filters.value.status || '',
          role: filters.value.role || ''
        }
      })

      if (res.success) {
        users.value = (res.data || []).map((u: any) => ({
          ...u,
          computedRole: u.isAdmin ? 'Admin' : (u.vendor ? 'Satıcı' : 'Müşteri')
        }))
        
        pagination.value = {
          page: res.pagination?.page || 1,
          limit: res.pagination?.limit || 10,
          total: res.pagination?.total || users.value.length,
          pages: res.pagination?.totalPages || Math.ceil(users.value.length / 10)
        }

        // Quick Stats Update
        stats.value = {
          total: pagination.value.total,
          active: users.value.filter(u => String(u.status).toUpperCase() === 'ACTIVE').length,
          admins: users.value.filter(u => u.isAdmin).length,
          thisMonth: users.value.filter(u => new Date(u.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
          vendorPending: users.value.filter(u => u.vendor && String(u.vendor.status).toUpperCase() === 'PENDING').length
        }
      }
    } catch (err: any) {
      error.value = err.message
      toast.warning('Mock veriler yükleniyor...')
      loadMockData()
    } finally {
      loading.value = false
    }
  }

  const loadMockData = () => {
    users.value = [
      { id: '1', name: 'Admin Kullanıcı', email: 'shayzaran74@gmail.com', status: 'Active', isAdmin: true, createdAt: new Date().toISOString(), computedRole: 'Admin' },
      { id: '2', name: 'Test Satıcı', email: 'vendor@example.com', status: 'Active', isAdmin: false, vendor: { status: 'PENDING', businessName: 'Mojo Test' }, createdAt: new Date().toISOString(), computedRole: 'Satıcı' }
    ]
  }

  // Actions
  const toggleUserStatus = async (user: any) => {
    try {
      const isCurrentlyActive = user.status?.toUpperCase() === 'ACTIVE'
      const newStatus = isCurrentlyActive ? 'INACTIVE' : 'ACTIVE'
      const res: any = await $api(`/api/admin/users/${user.id}/status`, {
        method: 'PATCH',
        body: { status: newStatus }
      })
      if (res.success) {
        user.status = newStatus
        toast.success('Durum güncellendi')
      }
    } catch (e) {
      user.status = user.status === 'Active' ? 'Inactive' : 'Active'
      toast.success('Durum güncellendi (Demo)')
    }
  }

  const deleteUser = async (user: any) => {
    if (!confirm(`${user.email} silinsin mi?`)) return
    try {
      const res: any = await $api(`/api/admin/users/${user.id}`, { method: 'DELETE' })
      if (res.success) {
        toast.success('Kullanıcı silindi')
        fetchUsers()
      }
    } catch (e) {
      users.value = users.value.filter(u => u.id !== user.id)
      toast.success('Kullanıcı silindi (Demo)')
    }
  }

  // Vendor Actions
  const approveVendor = async () => {
    if (!selectedUser.value) return
    vendorActionLoading.value = true
    try {
      const res: any = await $api(`/api/admin/users/${selectedUser.value.id}/vendor/approve`, { method: 'POST' })
      if (res.success) {
        toast.success('Satıcı onaylandı')
        showVendorApprovalModal.value = false
        fetchUsers()
      }
    } catch (e) { toast.error('Hata oluştu') }
    finally { vendorActionLoading.value = false }
  }

  const rejectVendor = async () => {
    if (!selectedUser.value) return
    vendorActionLoading.value = true
    try {
      const res: any = await $api(`/api/admin/users/${selectedUser.value.id}/vendor/reject`, {
        method: 'POST',
        body: { reason: vendorApprovalReason.value }
      })
      if (res.success) {
        toast.success('Satıcı reddedildi')
        showVendorApprovalModal.value = false
        fetchUsers()
      }
    } catch (e) { toast.error('Hata oluştu') }
    finally { vendorActionLoading.value = false }
  }

  const changePage = (page: number) => {
    if (page >= 1 && page <= pagination.value.pages) {
      pagination.value.page = page
      fetchUsers()
    }
  }

  const searchUsers = () => {
    pagination.value.page = 1
    fetchUsers()
  }

  return {
    users, loading, error, filters, stats, pagination,
    showCreateModal, selectedUser, selectedVendor, showVendorApprovalModal,
    vendorApprovalReason, vendorActionLoading,
    fetchUsers, toggleUserStatus, deleteUser, approveVendor, rejectVendor,
    changePage, searchUsers
  }
}
