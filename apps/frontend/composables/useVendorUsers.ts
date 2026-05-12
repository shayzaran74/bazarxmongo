export const useVendorUsers = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  const users = ref<any[]>([])
  const loading = ref(false)
  const selectedUser = ref<any>(null)
  const showCreateModal = ref(false)

  const filters = reactive({ search: '', role: '', page: 1, limit: 10 })
  const pagination = ref({ page: 1, pages: 1, total: 0, limit: 10 })

  const fetchUsers = async () => {
    loading.value = true
    try {
      const res = await $api<any>(
        '/api/vendors/users',
        { query: { ...filters } }
      )
      users.value = res.data || []
      const resAny = res as any
      if (resAny.pagination) pagination.value = {
        page: resAny.pagination.page || 1,
        pages: resAny.pagination.totalPages || 1,
        total: resAny.pagination.total || 0,
        limit: resAny.pagination.limit || 10,
      }
    } catch { /* ignore */ } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return
    try {
      await $api(`/api/vendors/users/${id}`, { method: 'DELETE' })
      $toast.success('Kullanıcı kaldırıldı')
      fetchUsers()
    } catch {
      $toast.error('Silinemedi')
    }
  }

  return {
    users, loading, filters, pagination,
    selectedUser, showCreateModal,
    fetchUsers, deleteUser,
  }
}
