import { ref, reactive, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'

export const useAdminUsers = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  const users = ref<any[]>([])
  const loading = ref(false)
  const selectedUser = ref<any>(null)
  const showCreateModal = ref(false)
  const showVendorApprovalModal = ref(false)
  const vendorApprovalReason = ref('')
  const vendorActionLoading = ref(false)

  const filters = reactive({
    search: '',
    status: '',
    role: '',
    page: 1,
    limit: 10,
  })

  const stats = reactive({
    total: 0,
    active: 0,
    vendors: 0,
    admins: 0,
  })

  const pagination = ref({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  })

  const fetchUsers = async () => {
    loading.value = true
    try {
      const res = await $api<any[]>('/api/v1/admin/users', {
        query: {
          page: filters.page,
          limit: filters.limit,
          search: filters.search || undefined,
          status: filters.status || undefined,
          role: filters.role || undefined,
        }
      })
      
      const items = res.data || []
      const p = (res.pagination as any) || {}
      
      users.value = items.map((u: any) => ({
        ...u,
        computedRole: u.role === 'SUPER_ADMIN' ? 'SÜPER ADMİN' : 
                      u.role === 'ADMIN' ? 'ADMİN' : 
                      u.role === 'VENDOR' ? 'SATICİ' : 'MÜŞTERİ'
      }))
      
      pagination.value = {
        page: p.page || filters.page,
        pages: p.totalPages || 1,
        total: p.total || 0,
        limit: p.limit || filters.limit,
      }
      // Stats
      stats.total = pagination.value.total
      stats.active = users.value.filter((u: any) => u.status === 'ACTIVE').length
      stats.vendors = users.value.filter((u: any) => u.role === 'VENDOR').length
      stats.admins = users.value.filter(
        (u: any) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN'
      ).length
    } catch (e: any) {
      $toast.error('Kullanıcılar yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  const searchUsers = useDebounceFn(() => {
    filters.page = 1
    fetchUsers()
  }, 400)

  const changePage = (page: number) => {
    filters.page = page
    fetchUsers()
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return
    try {
      await $api(`/api/v1/admin/users/${userId}`, { method: 'DELETE' })
      $toast.success('Kullanıcı silindi')
      fetchUsers()
    } catch {
      $toast.error('Kullanıcı silinemedi')
    }
  }

  const approveVendor = async () => {
    if (!selectedUser.value) return
    vendorActionLoading.value = true
    try {
      await $api(`/api/v1/admin/vendors/${selectedUser.value.vendor?.id}/approve`, {
        method: 'PUT'
      })
      $toast.success('Satıcı onaylandı')
      showVendorApprovalModal.value = false
      fetchUsers()
    } catch {
      $toast.error('Onaylama başarısız')
    } finally {
      vendorActionLoading.value = false
    }
  }

  const rejectVendor = async () => {
    if (!selectedUser.value) return
    vendorActionLoading.value = true
    try {
      await $api(`/api/v1/admin/vendors/${selectedUser.value.vendor?.id}/reject`, {
        method: 'PUT',
        body: { rejectionReason: vendorApprovalReason.value }
      })
      $toast.success('Satıcı reddedildi')
      showVendorApprovalModal.value = false
      vendorApprovalReason.value = ''
      fetchUsers()
    } catch {
      $toast.error('Reddetme başarısız')
    } finally {
      vendorActionLoading.value = false
    }
  }

  return {
    users, loading, filters, stats, pagination,
    selectedUser, showCreateModal,
    showVendorApprovalModal, vendorApprovalReason, vendorActionLoading,
    fetchUsers, searchUsers, changePage, deleteUser,
    approveVendor, rejectVendor,
  }
}
