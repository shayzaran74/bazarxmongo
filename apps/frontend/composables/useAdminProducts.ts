export const useAdminProducts = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  const products = ref<any[]>([])
  const categories = ref<any[]>([])
  const vendors = ref<any[]>([])
  const loading = ref(false)
  const bulkProcessing = ref(false)
  const showForm = ref(false)

  const searchQuery = ref('')
  const selectedFilterCategoryId = ref('')
  const selectedFilterVendorId = ref('')
  const showVendorProducts = ref(false)
  const showPendingProducts = ref(false)
  const selectedProductIds = ref<string[]>([])

  const pagination = reactive({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1,
  })

  const fetchProducts = async (page = 1) => {
    loading.value = true
    pagination.page = page
    try {
      const res = await $api<any>('/api/admin/products', {
        query: {
          page,
          limit: pagination.limit,
          q: searchQuery.value || undefined,
          categoryId: selectedFilterCategoryId.value || undefined,
        }
      })
      products.value = res.data?.items || []
      pagination.total = res.pagination?.total || 0
      pagination.totalPages = res.pagination?.totalPages || 1
    } catch {
      $toast.error('Ürünler yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await $api<any>('/api/listings/categories')
      categories.value = res.data || []
    } catch { /* ignore */ }
  }

  const fetchVendors = async () => {
    try {
      const res = await $api<any>('/api/admin/vendors')
      vendors.value = (res.data || []).map((v: any) => ({
        id: v.id,
        name: v.company?.name || v.profile?.storeName || 'Bilinmeyen',
      }))
    } catch { /* ignore */ }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return
    try {
      await $api(`/api/admin/products/${id}`, { method: 'DELETE' })
      $toast.success('Ürün silindi')
      fetchProducts(pagination.page)
    } catch {
      $toast.error('Ürün silinemedi')
    }
  }

  const bulkDeleteProducts = async () => {
    if (!selectedProductIds.value.length) return
    if (!confirm(`${selectedProductIds.value.length} ürün silinsin mi?`)) return
    bulkProcessing.value = true
    try {
      await $api('/api/admin/products/bulk-delete', {
        method: 'POST',
        body: { ids: selectedProductIds.value }
      })
      $toast.success('Ürünler silindi')
      selectedProductIds.value = []
      fetchProducts(1)
    } catch {
      $toast.error('Toplu silme başarısız')
    } finally {
      bulkProcessing.value = false
    }
  }

  const bulkUpdateProducts = async (updates: any) => {
    if (!selectedProductIds.value.length) return
    bulkProcessing.value = true
    try {
      await $api('/api/admin/products/bulk-update', {
        method: 'PUT',
        body: { ids: selectedProductIds.value, updates }
      })
      $toast.success('Ürünler güncellendi')
      selectedProductIds.value = []
      fetchProducts(pagination.page)
    } catch {
      $toast.error('Toplu güncelleme başarısız')
    } finally {
      bulkProcessing.value = false
    }
  }

  const resetForm = () => { /* form state reset */ }

  return {
    products, categories, vendors, loading, bulkProcessing, showForm,
    searchQuery, selectedFilterCategoryId, selectedFilterVendorId,
    showVendorProducts, showPendingProducts, selectedProductIds, pagination,
    fetchProducts, fetchCategories, fetchVendors,
    deleteProduct, bulkDeleteProducts, bulkUpdateProducts, resetForm,
  }
}
