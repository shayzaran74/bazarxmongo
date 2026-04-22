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
      const res = await $api<any>('/api/admin/vendors')
      vendors.value = res.data || []
    } catch {
      $toast.error('Satıcılar yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await $api<any>('/api/listings/categories')
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
    vendorActionLoading.value = true
    try {
      await $api(`/api/admin/vendors/${target.id}/approve`, { method: 'PUT' })
      $toast.success('Satıcı onaylandı')
      closeVendorDetail()
      fetchVendors()
    } catch {
      $toast.error('Onaylama başarısız')
    } finally {
      vendorActionLoading.value = false
    }
  }

  const rejectVendor = async () => {
    if (!selectedVendor.value) return
    vendorActionLoading.value = true
    try {
      await $api(`/api/admin/vendors/${selectedVendor.value.id}/reject`, {
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

  const toggleFeatured = async (isFeatured: boolean) => {
    if (!selectedVendor.value) return
    try {
      await $api(`/api/admin/vendors/${selectedVendor.value.id}`, {
        method: 'PUT',
        body: { isFeatured }
      })
      $toast.success('Güncellendi')
      if (selectedVendor.value.profile) {
        selectedVendor.value.profile.isFeatured = isFeatured
      }
    } catch {
      $toast.error('Güncellenemedi')
    }
  }

  const saveB2BSettings = async (data: any) => {
    if (!selectedVendor.value) return
    try {
      await $api(`/api/admin/vendors/${selectedVendor.value.id}`, {
        method: 'PUT',
        body: data
      })
      $toast.success('B2B ayarları kaydedildi')
    } catch {
      $toast.error('Kaydedilemedi')
    }
  }

  const addCategory = async () => {
    if (!selectedVendor.value || !selectedCategoryId.value) return
    try {
      await $api(
        `/api/admin/vendors/${selectedVendor.value.id}/categories`,
        { method: 'POST', body: { categoryId: selectedCategoryId.value } }
      )
      $toast.success('Kategori eklendi')
      selectedCategoryId.value = ''
      fetchVendors()
    } catch {
      $toast.error('Kategori eklenemedi')
    }
  }

  const removeCategory = async (categoryId: string) => {
    if (!selectedVendor.value) return
    try {
      await $api(
        `/api/admin/vendors/${selectedVendor.value.id}/categories/${categoryId}`,
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
    saveB2BSettings, addCategory, removeCategory,
  }
}
