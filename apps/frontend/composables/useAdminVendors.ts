export const useAdminVendors = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  const loading = ref(false)
  const vendorActionLoading = ref(false)
  const vendors = ref<any[]>([])
  const selectedVendor = ref<any>(null)
  const selectedCategoryId = ref('')
  const statusFilter = ref('')
  const vendorSearchQuery = ref('')
  const showRejectForm = ref(false)
  const rejectionReason = ref('')
  const availableCategories = ref<any[]>([])

  const filteredVendors = computed(() => {
    let list = vendors.value
    if (statusFilter.value) {
      list = list.filter((v: any) => v.status === statusFilter.value)
    }
    if (vendorSearchQuery.value) {
      const q = vendorSearchQuery.value.toLowerCase()
      list = list.filter((v: any) =>
        v.company?.name?.toLowerCase().includes(q) ||
        v.profile?.storeName?.toLowerCase().includes(q)
      )
    }
    return list
  })

  const fetchVendors = async () => {
    loading.value = true
    try {
      const res = await $api<any>('/api/v1/admin/vendors')
      vendors.value = res.data || []
    } catch {
      $toast.error('Satıcılar yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await $api<any>('/api/v1/listings/categories')
      availableCategories.value = res.data || []
    } catch { /* ignore */ }
  }

  const openVendorDetail = (vendor: any) => {
    selectedVendor.value = { ...vendor }
    showRejectForm.value = false
    rejectionReason.value = ''
  }

  const closeVendorDetail = () => {
    selectedVendor.value = null
    showRejectForm.value = false
  }

  const approveVendor = async (vendor?: any) => {
    const target = vendor || selectedVendor.value
    if (!target) return

    const vendorId = typeof target === 'string' ? target : target.id
    if (!vendorId) {
      console.error('Vendor ID not found', target)
      return
    }

    vendorActionLoading.value = true
    try {
      await $api(`/api/admin/vendors/${vendorId}/approve`, { method: 'PUT' })
      $toast.success('Satıcı onaylandı')
      closeVendorDetail()
      fetchVendors()
    } catch {
      $toast.error('Onaylama başarısız')
    } finally {
      vendorActionLoading.value = false
    }
  }

  const rejectVendor = async (vendor?: any) => {
    const target = vendor || selectedVendor.value
    if (!target) return

    const vendorId = typeof target === 'string' ? target : target.id
    if (!vendorId) return

    vendorActionLoading.value = true
    try {
      await $api(`/api/admin/vendors/${vendorId}/reject`, {
        method: 'PUT',
        body: { rejectionReason: rejectionReason.value }
      })
      $toast.success('Satıcı reddedildi')
      closeVendorDetail()
      fetchVendors()
    } catch {
      $toast.error('Reddetme başarısız')
    } finally {
      vendorActionLoading.value = false
    }
  }

  const toggleFeatured = async (vendorOrFeatured: any) => {
    const target = typeof vendorOrFeatured === 'object' ? vendorOrFeatured : selectedVendor.value
    if (!target) return

    const isFeatured = typeof vendorOrFeatured === 'boolean' 
      ? vendorOrFeatured 
      : !target.profile?.isFeatured

    try {
      await $api(`/api/admin/vendors/${target.id}`, {
        method: 'PUT',
        body: { isFeatured }
      })
      $toast.success('Güncellendi')
      if (target.profile) {
        target.profile.isFeatured = isFeatured
      }
    } catch {
      $toast.error('Güncellenemedi')
    }
  }

  const saveB2BSettings = async (vendorOrData: any) => {
    const target = (vendorOrData && vendorOrData.id) ? vendorOrData : selectedVendor.value
    if (!target) return

    const b2bData = (vendorOrData && vendorOrData.b2bData) ? vendorOrData.b2bData : vendorOrData

    try {
      await $api(`/api/admin/vendors/${target.id}`, {
        method: 'PUT',
        body: { b2bData }
      })
      $toast.success('B2B ayarları kaydedildi')
    } catch {
      $toast.error('Kaydedilemedi')
    }
  }

  const updateVendorType = async (vendor: any) => {
    if (!vendor || !vendor.id) return
    
    vendorActionLoading.value = true
    try {
      await $api(`/api/v1/admin/vendors/${vendor.id}`, {
        method: 'PUT',
        body: { vendorType: vendor.vendorType }
      })
      $toast.success('Satıcı tipi güncellendi')
      fetchVendors()
    } catch {
      $toast.error('Güncelleme başarısız')
    } finally {
      vendorActionLoading.value = false
    }
  }

  const addCategory = async (vendor?: any) => {
    const target = vendor || selectedVendor.value
    if (!target || !selectedCategoryId.value) return
    
    const vendorId = typeof target === 'string' ? target : target.id

    try {
      await $api(
        `/api/admin/vendors/${vendorId}/categories`,
        { method: 'POST', body: { categoryId: selectedCategoryId.value } }
      )
      $toast.success('Kategori eklendi')
      selectedCategoryId.value = ''
      fetchVendors()
    } catch {
      $toast.error('Kategori eklenemedi')
    }
  }

  const removeCategory = async (vendorIdOrCategoryId: string, categoryId?: string) => {
    let vId: string | undefined
    let cId: string | undefined

    if (categoryId) {
      vId = vendorIdOrCategoryId
      cId = categoryId
    } else {
      vId = selectedVendor.value?.id
      cId = vendorIdOrCategoryId
    }

    if (!vId || !cId) return

    try {
      await $api(
        `/api/admin/vendors/${vId}/categories/${cId}`,
        { method: 'DELETE' }
      )
      $toast.success('Kategori kaldırıldı')
      fetchVendors()
    } catch {
      $toast.error('Kategori kaldırılamadı')
    }
  }

  return {
    loading, vendorActionLoading,
    vendors, selectedVendor, selectedCategoryId,
    statusFilter, vendorSearchQuery,
    showRejectForm, rejectionReason,
    filteredVendors, availableCategories,
    fetchVendors, fetchCategories,
    openVendorDetail, closeVendorDetail,
    approveVendor, rejectVendor, toggleFeatured,
    saveB2BSettings, addCategory, removeCategory, updateVendorType,
  }
}
