import { ref, reactive, computed } from 'vue'
import { useApi } from './useApi'
import { useNuxtApp } from '#app'

export const useAdminProducts = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  // ─── Liste & Yükleme ────────────────────────────────────────────────────────
  const products        = ref<any[]>([])
  const categories      = ref<any[]>([])
  const vendors         = ref<any[]>([])
  const brands          = ref<any[]>([])
  const loading         = ref(false)
  const loadingProducts = ref(false)
  const bulkProcessing  = ref(false)

  // ─── Form & Düzenleme ────────────────────────────────────────────────────────
  const showForm    = ref(false)
  const editingId   = ref<string | null>(null)
  const formData    = ref<any>({
    name: '', description: '', price: '', stock: 0,
    categoryId: '', image: '', productImages: [],
    hasVariants: false,
  })
  const showBulkEditModal = ref(false)

  // ─── Filtreler ────────────────────────────────────────────────────────────────
  const searchQuery             = ref('')
  const selectedFilterCategoryId = ref('')
  const selectedFilterVendorId   = ref('')
  const showVendorProducts       = ref(false)
  const showPendingProducts      = ref(false)
  const selectedProductIds       = ref<string[]>([])

  // ─── Kategori Hiyerarşisi ───────────────────────────────────────────────────
  const selectedMainCategory  = ref('')
  const selectedSubCategory1  = ref('')
  const selectedSubCategory2  = ref('')
  const mainCategories        = ref<any[]>([])
  const subCategories1        = ref<any[]>([])
  const subCategories2        = ref<any[]>([])
  const variationOptions      = ref<{ name: string; valuesStr: string }[]>([{ name: '', valuesStr: '' }])

  // ─── Pagination & İstatistikler ──────────────────────────────────────────────
  const pagination = reactive({ page: 1, limit: 50, total: 0, pages: 1 })
  const productStats = reactive({ total: 0, active: 0, pending: 0 })

  // ─── Hesaplamalar ────────────────────────────────────────────────────────────
  const isAllSelected = computed(
    () => products.value.length > 0 && selectedProductIds.value.length === products.value.length
  )

  // ─── Fetch Ürünler ──────────────────────────────────────────────────────────
  const fetchProducts = async (page = 1) => {
    loadingProducts.value = true
    loading.value = true
    pagination.page = page
    try {
      const res = await $api<any>('/api/admin/products', {
        query: {
          page,
          limit: pagination.limit,
          q: searchQuery.value || undefined,
          categoryId: selectedFilterCategoryId.value || undefined,
          status: showPendingProducts.value ? 'PENDING' : undefined,
        }
      })
      products.value = Array.isArray(res.data) ? res.data : (res.data?.items || [])
      pagination.total = res.pagination?.total || 0
      pagination.pages = res.pagination?.totalPages || 1
    } catch {
      $toast.error('Ürünler yüklenemedi')
    } finally {
      loading.value = false
      loadingProducts.value = false
    }
  }

  // ─── Fetch İstatistikler ────────────────────────────────────────────────────
  const fetchProductStats = async () => {
    try {
      const res = await $api<any>('/api/admin/products/stats')
      if (res?.data) {
        productStats.total   = res.data.total
        productStats.active  = res.data.active
        productStats.pending = res.data.pending
      }
    } catch { /* sessizce geç */ }
  }

  // ─── Fetch Kategoriler ──────────────────────────────────────────────────────
  const fetchCategories = async () => {
    try {
      const res = await $api<any>('/api/listings/categories')
      const allCats = res.data || []
      categories.value = allCats
      mainCategories.value = allCats.filter((c: any) => !c.parentId)
    } catch { /* sessizce geç */ }
  }

  const fetchCategoryAttributes = async (categoryId: string) => {
    // Gelecekte kategori özellik şablonu yüklenebilir
  }

  // ─── Fetch Markalar ────────────────────────────────────────────────────────
  const fetchBrands = async () => {
    try {
      const res = await $api<any>('/api/admin/brands')
      brands.value = Array.isArray(res.data) ? res.data : (res.data?.items || [])
    } catch { /* sessizce geç */ }
  }

  // ─── Fetch Satıcılar ───────────────────────────────────────────────────────
  const fetchVendors = async () => {
    try {
      const res = await $api<any>('/api/admin/vendors')
      vendors.value = (res.data || []).map((v: any) => ({
        id: v.id,
        name: v.company?.name || v.profile?.storeName || 'Bilinmeyen',
      }))
    } catch { /* sessizce geç */ }
  }

  // ─── Tüm Başlangıç Verisini Çek ────────────────────────────────────────────
  const fetchInitialData = async () => {
    await Promise.all([fetchCategories(), fetchVendors(), fetchBrands()])
  }

  // ─── Kategori Seçimi Yönetimi ───────────────────────────────────────────────
  const handleMainCategoryChange = () => {
    subCategories1.value = categories.value.filter(
      (c: any) => c.parentId === selectedMainCategory.value
    )
    selectedSubCategory1.value = ''
    selectedSubCategory2.value = ''
    subCategories2.value = []
    formData.value.categoryId = selectedMainCategory.value
  }

  const handleSubCategory1Change = () => {
    subCategories2.value = categories.value.filter(
      (c: any) => c.parentId === selectedSubCategory1.value
    )
    selectedSubCategory2.value = ''
    formData.value.categoryId = selectedSubCategory1.value || selectedMainCategory.value
  }

  const handleSubCategory2Change = () => {
    formData.value.categoryId =
      selectedSubCategory2.value || selectedSubCategory1.value || selectedMainCategory.value
  }

  // ─── Form İşlemleri ────────────────────────────────────────────────────────
  const resetForm = () => {
    editingId.value = null
    formData.value = {
      name: '', description: '', price: '', stock: 0,
      categoryId: '', image: '', productImages: [],
      hasVariants: false,
    }
    selectedMainCategory.value = ''
    selectedSubCategory1.value = ''
    selectedSubCategory2.value = ''
    variationOptions.value = [{ name: '', valuesStr: '' }]
  }

  const editProduct = (product: any) => {
    editingId.value = product.id
    formData.value = {
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stock: product.stock || 0,
      categoryId: product.categoryId || '',
      image: product.image || '',
      productImages: product.images || [],
      hasVariants: false,
    }

    // Kategori hiyerarşisini çöz ve UI'da seçili göster
    selectedMainCategory.value = ''
    selectedSubCategory1.value = ''
    selectedSubCategory2.value = ''
    subCategories1.value = []
    subCategories2.value = []

    if (product.categoryId && categories.value.length > 0) {
      let currentCat = categories.value.find((c: any) => c.id === product.categoryId)
      if (currentCat) {
        const path: any[] = []
        while(currentCat) {
          path.unshift(currentCat)
          currentCat = categories.value.find((c: any) => c.id === currentCat?.parentId)
        }
        
        if (path.length > 0) {
          selectedMainCategory.value = path[0].id
          subCategories1.value = categories.value.filter((c: any) => c.parentId === path[0].id)
        }
        if (path.length > 1) {
          selectedSubCategory1.value = path[1].id
          subCategories2.value = categories.value.filter((c: any) => c.parentId === path[1].id)
        }
        if (path.length > 2) {
          selectedSubCategory2.value = path[2].id
        }
      }
    }

    showForm.value = true
  }

  const submitForm = async () => {
    loading.value = true
    try {
      if (editingId.value) {
        const res = await $api<any>(`/api/admin/products/${editingId.value}`, {
          method: 'PUT',
          body: formData.value
        })
        if (res.success) {
          $toast.success('Ürün güncellendi')
          showForm.value = false
          resetForm()
          fetchProducts(pagination.page)
        } else {
          $toast.error(res.error || 'Güncelleme sırasında bir hata oluştu')
        }
      } else {
        const res = await $api<any>('/api/admin/products', {
          method: 'POST',
          body: formData.value
        })
        if (res.success) {
          $toast.success('Ürün eklendi')
          showForm.value = false
          resetForm()
          fetchProducts(pagination.page)
        } else {
          $toast.error(res.error || 'Ekleme sırasında bir hata oluştu')
        }
      }
      fetchProductStats()
    } catch {
      $toast.error('İşlem başarısız')
    } finally {
      loading.value = false
    }
  }

  // ─── Onay & Silme ──────────────────────────────────────────────────────────
  const approveProduct = async (id: string) => {
    try {
      await $api(`/api/admin/products/${id}`, {
        method: 'PUT',
        body: { 
          status: 'ACTIVE',
          isFeatured: true,
          isSpecialOffer: true
        }
      })
      $toast.success('Ürün onaylandı')
      fetchProducts(pagination.page)
      fetchProductStats()
    } catch {
      $toast.error('Ürün onaylanamadı')
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return
    try {
      await $api(`/api/admin/products/${id}`, { method: 'DELETE' })
      $toast.success('Ürün silindi')
      fetchProducts(pagination.page)
      fetchProductStats()
    } catch {
      $toast.error('Ürün silinemedi')
    }
  }

  // ─── Toplu İşlemler ────────────────────────────────────────────────────────
  const toggleSelectAll = () => {
    if (isAllSelected.value) {
      selectedProductIds.value = []
    } else {
      selectedProductIds.value = products.value.map((p: any) => p.id)
    }
  }

  const bulkApprove = async () => {
    if (!selectedProductIds.value.length) return
    bulkProcessing.value = true
    try {
      await $api('/api/admin/products/bulk-update', {
        method: 'PUT',
        body: { 
          ids: selectedProductIds.value, 
          updates: { 
            status: 'ACTIVE',
            isFeatured: true,
            isSpecialOffer: true
          } 
        }
      })
      $toast.success('Seçili ürünler onaylandı')
      selectedProductIds.value = []
      fetchProducts(1)
      fetchProductStats()
    } catch {
      $toast.error('Toplu onaylama başarısız')
    } finally {
      bulkProcessing.value = false
    }
  }

  const bulkDelete = async () => {
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
      fetchProductStats()
    } catch {
      $toast.error('Toplu silme başarısız')
    } finally {
      bulkProcessing.value = false
    }
  }

  const executeBulkUpdate = async (updates: any) => {
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
      fetchProductStats()
    } catch {
      $toast.error('Toplu güncelleme başarısız')
    } finally {
      bulkProcessing.value = false
    }
  }

  // ─── Return ─────────────────────────────────────────────────────────────────
  return {
    // State
    products, categories, vendors, brands, loading, loadingProducts,
    bulkProcessing, showForm, editingId, formData, showBulkEditModal,
    searchQuery, selectedFilterCategoryId, selectedFilterVendorId,
    showVendorProducts, showPendingProducts, selectedProductIds,
    selectedMainCategory, selectedSubCategory1, selectedSubCategory2,
    mainCategories, subCategories1, subCategories2,
    variationOptions, pagination, productStats, isAllSelected,
    // Fetch
    fetchProducts, fetchProductStats, fetchInitialData,
    fetchCategories, fetchVendors, fetchBrands, fetchCategoryAttributes,
    // Form
    resetForm, editProduct, submitForm,
    handleMainCategoryChange, handleSubCategory1Change, handleSubCategory2Change,
    // Actions
    approveProduct, deleteProduct,
    toggleSelectAll, bulkApprove, bulkDelete, executeBulkUpdate,
  }
}
