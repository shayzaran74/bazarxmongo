import { ref, computed, onMounted } from 'vue'

export const useVendorUsers = () => {
  const { $api } = useApi()
  const toast = useNuxtApp().$toast

  // State
  const users = ref<any[]>([])
  const loading = ref(false)
  
  const filters = ref({
    search: '',
    status: '',
    sortBy: 'created_desc'
  })

  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  const showCreateModal = ref(false)
  const selectedUser = ref<any>(null)

  // Methods
  const fetchUsers = async () => {
    loading.value = true
    try {
      // Not: Şu an admin API kullanılıyor, gerçek senaryoda /api/vendor-users olmalı
      const res: any = await $api('/api/admin/users', {
        query: {
          page: pagination.value.page,
          limit: pagination.value.limit,
          search: filters.value.search || ''
        }
      })
      if (res.success) {
        users.value = res.data || []
        pagination.value = res.pagination || pagination.value
      }
    } catch (e) {
      toast.error('Kullanıcılar yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  const toggleUserStatus = async (user: any) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active'
    user.status = newStatus
    toast.success('Personel durumu güncellendi (Demo)')
  }

  const deleteUser = (user: any) => {
    if (confirm('Personel kaydını silmek istediğinize emin misiniz?')) {
      users.value = users.value.filter(u => u.id !== user.id)
      toast.success('Personel silindi')
    }
  }

  return {
    users, loading, filters, pagination,
    showCreateModal, selectedUser,
    fetchUsers, toggleUserStatus, deleteUser
  }
}
