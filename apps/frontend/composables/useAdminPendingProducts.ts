export const useAdminPendingProducts = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  const products = ref<any[]>([])
  const loading = ref(false)
  const selectedProduct = ref<any>(null)
  const showDetailModal = ref(false)

  const stats = reactive({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  })

  const fetchPendingProducts = async () => {
    loading.value = true
    try {
      const res = await $api<any>('/api/admin/products', {
        query: { status: 'PENDING', limit: 100 }
      })
      products.value = res.data?.items || []
      stats.pending = products.value.length
      stats.total = res.pagination?.total || products.value.length
    } catch {
      $toast.error('Ürünler yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  const approveProduct = async (id: string) => {
    try {
      await $api(`/api/admin/products/${id}`, {
        method: 'PUT',
        body: { status: 'ACTIVE' }
      })
      $toast.success('Ürün onaylandı')
      fetchPendingProducts()
    } catch {
      $toast.error('Onaylanamadı')
    }
  }

  const rejectProduct = async (id: string, reason: string) => {
    try {
      await $api(`/api/admin/products/${id}`, {
        method: 'PUT',
        body: { status: 'REJECTED', rejectionReason: reason }
      })
      $toast.success('Ürün reddedildi')
      fetchPendingProducts()
    } catch {
      $toast.error('Reddedilemedi')
    }
  }

  return {
    products, loading, selectedProduct, showDetailModal, stats,
    fetchPendingProducts, approveProduct, rejectProduct,
  }
}
