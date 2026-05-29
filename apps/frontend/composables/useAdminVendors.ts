export const useAdminVendors = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp()

  const loading = ref(false)
  const vendorActionLoading = ref(false)
  const vendors = ref<Record<string, unknown>[]>([])
  const selectedVendor = ref<Record<string, unknown> | null>(null)
  const selectedCategoryId = ref('')
  const statusFilter = ref('')
  const vendorSearchQuery = ref('')
  const showRejectForm = ref(false)
  const rejectionReason = ref('')
  const availableCategories = ref<Record<string, unknown>[]>([])

  const filteredVendors = computed(() => {
    let list = vendors.value
    if (statusFilter.value) {
      list = list.filter((v) => v.status === statusFilter.value)
    }
    if (vendorSearchQuery.value) {
      const q = vendorSearchQuery.value.toLowerCase()
      list = list.filter((v) =>
        (v.company as { name?: string })?.name?.toLowerCase().includes(q) ||
        (v.profile as { storeName?: string })?.storeName?.toLowerCase().includes(q)
      )
    }
    return list
  })

  const fetchVendors = async () => {
    loading.value = true
    try {
      const res = await $api<{ data: Record<string, unknown>[] }>('/api/v1/admin/vendors')
      vendors.value = res.data || []
    } catch {
      $toast.error('Satıcılar yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await $api<{ data: Record<string, unknown>[] }>('/api/v1/listings/categories')
      availableCategories.value = res.data || []
    } catch { /* ignore */ }
  }

  const openVendorDetail = (vendor: Record<string, unknown>) => {
    selectedVendor.value = { ...vendor }
    showRejectForm.value = false
    rejectionReason.value = ''
  }

  const closeVendorDetail = () => {
    selectedVendor.value = null
    showRejectForm.value = false
  }

  const approveVendor = async (vendor?: Record<string, unknown> | string) => {
    const target = vendor || selectedVendor.value
    if (!target) return

    const vendorId = typeof target === 'string' ? target : target.id as string | undefined
    if (!vendorId) {
      return
    }

    vendorActionLoading.value = true
    try {
      await $api(`/api/v1/admin/vendors/${vendorId}/approve`, { method: 'PUT' })
      $toast.success('Satıcı onaylandı')
      closeVendorDetail()
      fetchVendors()
    } catch {
      $toast.error('Onaylama başarısız')
    } finally {
      vendorActionLoading.value = false
    }
  }

  const rejectVendor = async (vendor?: Record<string, unknown> | string) => {
    const target = vendor || selectedVendor.value
    if (!target) return

    const vendorId = typeof target === 'string' ? target : target.id as string | undefined
    if (!vendorId) return

    vendorActionLoading.value = true
    try {
      await $api(`/api/v1/admin/vendors/${vendorId}/reject`, {
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

  const toggleFeatured = async (vendorOrFeatured: Record<string, unknown> | boolean) => {
    const target = typeof vendorOrFeatured === 'object' ? vendorOrFeatured : selectedVendor.value
    if (!target) return

    const isFeatured = typeof vendorOrFeatured === 'boolean'
      ? vendorOrFeatured
      : !(target.profile as { isFeatured?: boolean })?.isFeatured

    try {
      await $api(`/api/v1/admin/vendors/${target.id}`, {
        method: 'PUT',
        body: { isFeatured }
      })
      $toast.success('Güncellendi')
      if (target.profile) {
        (target.profile as { isFeatured?: boolean }).isFeatured = isFeatured
      }
    } catch {
      $toast.error('Güncellenemedi')
    }
  }

  const toggleBarterEnabled = async (vendor: Record<string, unknown>) => {
    const target = vendor || selectedVendor.value
    if (!target) return

    const isEnabled = !(target as { barterEnabled?: boolean }).barterEnabled

    try {
      await $api(`/api/v1/admin/vendors/${target.id}`, {
        method: 'PUT',
        body: { barterEnabled: isEnabled }
      })
      $toast.success('Takas (Barter) izni güncellendi')
      ;(target as { barterEnabled?: boolean }).barterEnabled = isEnabled
    } catch {
      $toast.error('Takas (Barter) izni güncellenemedi')
    }
  }

  const saveB2BSettings = async (vendorOrData: Record<string, unknown>) => {
    const target = (vendorOrData && vendorOrData.id) ? vendorOrData : selectedVendor.value
    if (!target) return

    const b2bData = (vendorOrData && vendorOrData.b2bData) ? vendorOrData.b2bData : vendorOrData

    try {
      await $api(`/api/v1/admin/vendors/${target.id}`, {
        method: 'PUT',
        body: { b2bData }
      })
      $toast.success('B2B ayarları kaydedildi')
    } catch {
      $toast.error('Kaydedilemedi')
    }
  }

  const updateVendorType = async (vendor: Record<string, unknown>) => {
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

  const addCategory = async (vendor?: Record<string, unknown> | string) => {
    const target = vendor || selectedVendor.value
    if (!target || !selectedCategoryId.value) return

    const vendorId = typeof target === 'string' ? target : target.id as string | undefined

    try {
      await $api(
        `/api/v1/admin/vendors/${vendorId}/categories`,
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
      vId = selectedVendor.value?.id as string | undefined
      cId = vendorIdOrCategoryId
    }

    if (!vId || !cId) return

    try {
      await $api(
        `/api/v1/admin/vendors/${vId}/categories/${cId}`,
        { method: 'DELETE' }
      )
      $toast.success('Kategori kaldırıldı')
      fetchVendors()
    } catch {
      $toast.error('Kategori kaldırılamadı')
    }
  }

  const deleteVendor = async (vendor?: Record<string, unknown> | string) => {
    const target = vendor || selectedVendor.value
    if (!target) return

    const vendorId = typeof target === 'string' ? target : target.id as string | undefined
    if (!vendorId) return

    if (!confirm('Bu satıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) return

    vendorActionLoading.value = true
    try {
      await $api(`/api/v1/admin/vendors/${vendorId}`, {
        method: 'DELETE'
      })
      $toast.success('Satıcı başarıyla silindi')
      closeVendorDetail()
      fetchVendors()
    } catch {
      $toast.error('Satıcı silinirken bir hata oluştu')
    } finally {
      vendorActionLoading.value = false
    }
  }

  const suspendVendor = async (vendorId: string, reason: string) => {
    vendorActionLoading.value = true
    try {
      await $api(`/api/v1/admin/vendors/${vendorId}/suspend`, {
        method: 'PUT',
        body: { reason }
      })
      $toast.success('Satıcı askıya alındı')
      fetchVendors()
      if (selectedVendor.value && selectedVendor.value.id === vendorId) {
        selectedVendor.value.status = 'SUSPENDED'
      }
    } catch {
      $toast.error('Askıya alma işlemi başarısız')
    } finally {
      vendorActionLoading.value = false
    }
  }

  const reinstateVendor = async (vendorId: string) => {
    vendorActionLoading.value = true
    try {
      await $api(`/api/v1/admin/vendors/${vendorId}/reinstate`, {
        method: 'PUT'
      })
      $toast.success('Satıcı tekrar aktifleştirildi')
      fetchVendors()
      if (selectedVendor.value && selectedVendor.value.id === vendorId) {
        selectedVendor.value.status = 'APPROVED'
      }
    } catch {
      $toast.error('Aktifleştirme işlemi başarısız')
    } finally {
      vendorActionLoading.value = false
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
    approveVendor, rejectVendor, toggleFeatured, toggleBarterEnabled,
    saveB2BSettings, addCategory, removeCategory, updateVendorType,
    deleteVendor, suspendVendor, reinstateVendor,
  }
}
