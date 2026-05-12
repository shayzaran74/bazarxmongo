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
  const searchQuery              = ref('')
  const selectedFilterCategoryId = ref('')
  const selectedFilterVendorId   = ref('')
  const showVendorProducts       = ref(false)
  const showPendingProducts      = ref(false)
  const selectedProductIds       = ref<string[]>([])

  // ─── Kategori Hiyerarşisi ───────────────────────────────────────────────────
  const selectedMainCategory = ref('')
  const selectedSubCategory1 = ref('')
  const selectedSubCategory2 = ref('')
  const mainCategories       = ref<any[]>([])
  const subCategories1       = ref<any[]>([])
  const subCategories2       = ref<any[]>([])
  const variationOptions     = ref<{ name: string; valuesStr: string }[]>([{ name: '', valuesStr: '' }])

  // ─── Pagination & İstatistikler ──────────────────────────────────────────────
  const pagination   = reactive({ page: 1, limit: 50, total: 0, pages: 1 })
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
      const res = await $api<any>('/api/v1/admin/products', {
        query: {
          page,
          limit: pagination.limit,
          q: searchQuery.value || undefined,
          categoryId: selectedFilterCategoryId.value || undefined,
          status: showPendingProducts.value ? 'PENDING' : undefined,
        }
      })
      products.value      = Array.isArray(res.data) ? res.data : (res.data?.items || [])
      pagination.total    = res.pagination?.total || 0
      pagination.pages    = res.pagination?.totalPages || 1
    } catch {
      $toast.error('Ürünler yüklenemedi')
    } finally {
      loading.value        = false
      loadingProducts.value = false
    }
  }

  // ─── Fetch İstatistikler ────────────────────────────────────────────────────
  const fetchProductStats = async () => {
    try {
      const res = await $api<any>('/api/v1/admin/products/stats')
      if (res?.data) {
        productStats.total   = res.data.total
        productStats.active  = res.data.active
        productStats.pending = res.data.pending
      }
    } catch { /* sessizce geç */ }
  }

  // ─── Fetch Kategoriler ──────────────────────────────────────────────────────
  // DÜZELTİLDİ: Admin endpoint'i kullanılıyor (tüm kategoriler, sadece aktifler değil)
  const fetchCategories = async () => {
    try {
      const res = await $api<any>('/api/v1/admin/categories')
      const tree = res.data || []
      console.log('[DEBUG] Admin Kategori Ağacı Yüklendi:', tree.length, 'ana kategori bulundu.')

      // Tüm ağacı düzleştir (flat liste — editProduct'ta parent takibi için)
      const flat: any[] = []
      const flatten = (items: any[]) => {
        items.forEach(item => {
          flat.push(item)
          if (item.children?.length > 0) flatten(item.children)
        })
      }
      flatten(tree)

      categories.value = flat

      // DÜZELTİLDİ: mainCategories sadece kök düzey kategoriler (parentId === null)
      // Tree yapısı zaten kök düzeyi temsil ediyorsa direkt kullan,
      // aksi hâlde flat listeden parentId olmayanları filtrele
      const hasParentField = flat.length > 0 && 'parentId' in flat[0]
      if (hasParentField) {
        mainCategories.value = flat.filter((c: any) => !c.parentId)
      } else {
        // Tree'nin kendisi zaten kök düzeydir
        mainCategories.value = tree
      }
    } catch (e) {
      console.error('[fetchCategories] Hata:', e)
    }
  }

  const fetchCategoryAttributes = async (_categoryId: string) => {
    // Gelecekte kategori özellik şablonu yüklenebilir
  }

  // ─── Fetch Markalar ────────────────────────────────────────────────────────
  const fetchBrands = async () => {
    try {
      const res = await $api<any>('/api/v1/admin/brands')
      brands.value = Array.isArray(res.data) ? res.data : (res.data?.items || [])
    } catch { /* sessizce geç */ }
  }

  // ─── Fetch Satıcılar ───────────────────────────────────────────────────────
  const fetchVendors = async () => {
    try {
      const res = await $api<any>('/api/v1/admin/vendors')
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
    // mainCategories içinde children'a bak — tree yapısından geliyor
    const mainCat = mainCategories.value.find((c: any) => c.id === selectedMainCategory.value)

    // Eğer mainCategories flat liste ise, flat'ten children bul
    const children = mainCat?.children?.length
      ? mainCat.children
      : categories.value.filter((c: any) => c.parentId === selectedMainCategory.value)

    subCategories1.value       = children
    selectedSubCategory1.value = ''
    selectedSubCategory2.value = ''
    subCategories2.value       = []

    // En derin seçili kategori: alt yoksa ana kategoriyi kullan
    formData.value.categoryId = selectedMainCategory.value || ''
  }

  const handleSubCategory1Change = () => {
    const subCat1 = subCategories1.value.find((c: any) => c.id === selectedSubCategory1.value)

    const children = subCat1?.children?.length
      ? subCat1.children
      : categories.value.filter((c: any) => c.parentId === selectedSubCategory1.value)

    subCategories2.value       = children
    selectedSubCategory2.value = ''

    formData.value.categoryId = selectedSubCategory1.value || selectedMainCategory.value || ''
  }

  const handleSubCategory2Change = () => {
    formData.value.categoryId =
      selectedSubCategory2.value || selectedSubCategory1.value || selectedMainCategory.value || ''
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
    subCategories1.value       = []
    subCategories2.value       = []
    variationOptions.value     = [{ name: '', valuesStr: '' }]
  }
  
  // ─── Görsel Yükleme ───────────────────────────────────────────────────────
  const handleFileUpload = async (event: any) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    
    $toast.info('Görsel yükleniyor...')
    const uploadLimit = Math.min(files.length, 5 - (formData.value.productImages?.length || 0))
    
    const config = useRuntimeConfig()
    const backendUrl = config.public.apiBase || 'http://localhost:3001'
    const authStore = useAuthStore()
    const token = authStore.token || useCookie('access_token').value

    for (let i = 0; i < uploadLimit; i++) {
      const file = files[i]
      if (file.size > 5 * 1024 * 1024) {
        $toast.error(`${file.name} 5MB'dan büyük olduğu için atlandı.`)
        continue
      }

      const body = new FormData()
      body.append('file', file)

      try {
        const uploadUrl = '/api/v1/upload?subPath=products'
        
        const res = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body
        })

        if (!res.ok) throw new Error('Upload failed')
        
        const json = await res.json()
        if (json.success && json.data) {
          const url = json.data.url || json.data
          if (!formData.value.productImages) formData.value.productImages = []
          formData.value.productImages.push(url)
          
          if (!formData.value.image) formData.value.image = url
          $toast.success(`${file.name} yüklendi`)
        }
      } catch (error) {
        $toast.error(`${file.name} yüklenirken hata oluştu`)
      }
    }
    // Input'u sıfırla ki aynı dosya tekrar seçilebilsin
    if (event.target) event.target.value = ''
  }

  const editProduct = (product: any) => {
    editingId.value = product.id
    formData.value = {
      name:          product.name || '',
      description:   product.description || '',
      price:         product.price || '',
      stock:         product.stock || 0,
      categoryId:    product.categoryId || '',
      image:         product.image || '',
      productImages: product.images || [],
      hasVariants:   false,
    }

    // Kategori hiyerarşisini sıfırla
    selectedMainCategory.value = ''
    selectedSubCategory1.value = ''
    selectedSubCategory2.value = ''
    subCategories1.value       = []
    subCategories2.value       = []

    if (product.categoryId && categories.value.length > 0) {
      // Seçili kategoriden köke doğru yolu çıkar
      const path: any[] = []
      let current = categories.value.find((c: any) => c.id === product.categoryId)
      while (current) {
        path.unshift(current)
        current = current.parentId
          ? categories.value.find((c: any) => c.id === current!.parentId)
          : null
      }

      if (path.length >= 1) {
        selectedMainCategory.value = path[0].id
        // Alt kategorileri doldur — tree children'ı varsa onları kullan, yoksa flat filtrele
        const mainCat = mainCategories.value.find((c: any) => c.id === path[0].id)
        subCategories1.value = mainCat?.children?.length
          ? mainCat.children
          : categories.value.filter((c: any) => c.parentId === path[0].id)
      }
      if (path.length >= 2) {
        selectedSubCategory1.value = path[1].id
        const subCat1 = subCategories1.value.find((c: any) => c.id === path[1].id)
        subCategories2.value = subCat1?.children?.length
          ? subCat1.children
          : categories.value.filter((c: any) => c.parentId === path[1].id)
      }
      if (path.length >= 3) {
        selectedSubCategory2.value = path[2].id
      }
    }

    showForm.value = true
  }

  const submitForm = async () => {
    // GÜVENLİK AĞI: Seçili dropdown değerlerini forma senkronize et
    const finalCategoryId = selectedSubCategory2.value || 
                          selectedSubCategory1.value || 
                          selectedMainCategory.value;
    
    if (finalCategoryId) {
      formData.value.categoryId = finalCategoryId;
    }

    if (!formData.value.categoryId) {
      $toast.error('Lütfen bir kategori seçin')
      return
    }
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
        const res = await $api<any>('/api/v1/admin/products', {
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
        body: { status: 'ACTIVE', isFeatured: true, isSpecialOffer: true }
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
      await $api('/api/v1/admin/products/bulk-update', {
        method: 'PUT',
        body: { ids: selectedProductIds.value, updates: { status: 'ACTIVE', isFeatured: true, isSpecialOffer: true } }
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
      await $api('/api/v1/admin/products/bulk-delete', {
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
      await $api('/api/v1/admin/products/bulk-update', {
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
    products, categories, vendors, brands, loading, loadingProducts,
    bulkProcessing, showForm, editingId, formData, showBulkEditModal,
    searchQuery, selectedFilterCategoryId, selectedFilterVendorId,
    showVendorProducts, showPendingProducts, selectedProductIds,
    selectedMainCategory, selectedSubCategory1, selectedSubCategory2,
    mainCategories, subCategories1, subCategories2,
    variationOptions, pagination, productStats, isAllSelected,
    fetchProducts, fetchProductStats, fetchInitialData,
    fetchCategories, fetchVendors, fetchBrands, fetchCategoryAttributes,
    resetForm, editProduct, submitForm,
    handleMainCategoryChange, handleSubCategory1Change, handleSubCategory2Change,
    approveProduct, deleteProduct,
    toggleSelectAll, bulkApprove, bulkDelete, executeBulkUpdate,
    handleFileUpload,
  }
}
