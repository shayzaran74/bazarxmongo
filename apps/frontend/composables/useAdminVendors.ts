import { ref, computed } from 'vue'
import { useAdminVendorService } from '~/services/api/AdminVendorService'
import { useCategoryService } from '~/services/api/CategoryService'
import type { AdminVendor, Category } from '@barterborsa/shared-types'

export const useAdminVendors = () => {
  const adminVendorService = useAdminVendorService()
  const categoryService = useCategoryService()
  const toast = useNuxtApp().$toast

  const vendors = ref<AdminVendor[]>([])
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const vendorActionLoading = ref(false)

  const selectedVendor = ref<AdminVendor | null>(null)
  const selectedCategoryId = ref('')
  const statusFilter = ref<string | null>(null)
  const vendorSearchQuery = ref('')
  
  const showRejectForm = ref(false)
  const rejectionReason = ref('')

  const filteredVendors = computed(() => {
    let list = vendors.value
    if (statusFilter.value) {
      list = list.filter(v => v.status === statusFilter.value)
    }
    if (vendorSearchQuery.value) {
      const q = vendorSearchQuery.value.toLowerCase()
      list = list.filter(v =>
        (v.businessName || '').toLowerCase().includes(q) ||
        (v.name || '').toLowerCase().includes(q) ||
        (v.phone && v.phone.toLowerCase().includes(q)) ||
        (v.user?.email && v.user.email.toLowerCase().includes(q))
      )
    }
    return list
  })

  const availableCategories = computed(() => {
    if (!selectedVendor.value) return categories.value
    const assignedCategoryIds = selectedVendor.value.categories?.map(c => (c as any).category?.id || (c as any).id) || []
    return categories.value.filter(c => !assignedCategoryIds.includes(c.id))
  })

  const fetchVendors = async () => {
    loading.value = true
    try {
      const response = await adminVendorService.getVendors()
      if (response.success && response.data) {
        vendors.value = response.data
      }
    } catch (error) {
      console.error('Fetch vendors error:', error)
      toast.error('Satıcılar yüklenirken hata oluştu')
    } finally {
      loading.value = false
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories()
      if (response.success && response.data) {
        categories.value = response.data
      }
    } catch (error) {
      console.error('Fetch categories error:', error)
    }
  }

  const openVendorDetail = (vendor: AdminVendor) => {
    selectedVendor.value = { ...vendor } // Clone to avoid direct mutation
    selectedCategoryId.value = ''
    showRejectForm.value = false
    rejectionReason.value = ''
  }

  const closeVendorDetail = () => {
    selectedVendor.value = null
  }

  const approveVendor = async (vendorId: string | number) => {
    vendorActionLoading.value = true
    try {
      const response = await adminVendorService.approveVendor(vendorId)
      if (response.success) {
        const idx = vendors.value.findIndex(v => v.id === vendorId)
        if (idx !== -1) {
          vendors.value[idx].status = 'APPROVED'
          vendors.value[idx].verifiedAt = new Date().toISOString()
        }
        if (selectedVendor.value && selectedVendor.value.id === vendorId) {
          selectedVendor.value.status = 'APPROVED'
        }
        toast.success('Satıcı onaylandı')
      }
    } catch (error) {
      console.error('Approve vendor error:', error)
      toast.error('Bir hata oluştu')
    } finally {
      vendorActionLoading.value = false
    }
  }

  const rejectVendor = async (vendorId: string | number) => {
    vendorActionLoading.value = true
    try {
      const response = await adminVendorService.rejectVendor(vendorId, rejectionReason.value)
      if (response.success) {
        const idx = vendors.value.findIndex(v => v.id === vendorId)
        if (idx !== -1) {
          vendors.value[idx].status = 'REJECTED'
          vendors.value[idx].rejectionReason = rejectionReason.value
        }
        if (selectedVendor.value && selectedVendor.value.id === vendorId) {
          selectedVendor.value.status = 'REJECTED'
        }
        showRejectForm.value = false
        rejectionReason.value = ''
        toast.success('Satıcı reddedildi')
      }
    } catch (error) {
      console.error('Reject vendor error:', error)
      toast.error('Bir hata oluştu')
    } finally {
      vendorActionLoading.value = false
    }
  }

  const toggleFeatured = async (vendor: AdminVendor) => {
    try {
      const newValue = !vendor.isFeatured
      const response = await adminVendorService.toggleFeatured(vendor.id, newValue)
      if (response.success) {
        const idx = vendors.value.findIndex(v => v.id === vendor.id)
        if (idx !== -1) vendors.value[idx].isFeatured = newValue
        if (selectedVendor.value && selectedVendor.value.id === vendor.id) {
            selectedVendor.value.isFeatured = newValue
        }
        toast.success(newValue ? 'Satıcı öne çıkarıldı' : 'Öne çıkarılma kaldırıldı')
      }
    } catch (error) {
      console.error('Toggle featured error:', error)
      toast.error('Bir hata oluştu')
    }
  }

  const saveB2BSettings = async (vendor: AdminVendor) => {
    try {
      const payload = {
        isB2B: vendor.isB2B,
        b2bTier: vendor.b2bTier,
        corporateCode: vendor.corporateCode,
        barterLimitOverride: vendor.barterLimitOverride,
        commissionRateB2B: vendor.commissionRateB2B
      }
      const response = await adminVendorService.updateB2BSettings(vendor.id, payload)
      if (response.success) {
        const idx = vendors.value.findIndex(v => v.id === vendor.id)
        if (idx !== -1) {
           Object.assign(vendors.value[idx], payload)
        }
        toast.success('B2B ayarları güncellendi')
      }
    } catch (err: unknown) {
      console.error('B2B settings error:', err)
      const errorMsg = (err as { data?: { error?: string } })?.data?.error || (err as Error)?.message || 'B2B ayarları kaydedilemedi'
      toast.error(errorMsg)
    }
  }

  const addCategory = async (vendorId: string | number) => {
    if (!selectedCategoryId.value) return
    try {
      await adminVendorService.addCategory(vendorId, selectedCategoryId.value)
      const category = categories.value.find(c => String(c.id) === String(selectedCategoryId.value))
      
      const newCatEntry: any = {
        category: {
          id: category?.id,
          name: category?.name || '',
          slug: category?.slug || '',
          parentId: category?.parentId
        }
      }

      if (selectedVendor.value) {
        if (!selectedVendor.value.categories) selectedVendor.value.categories = []
        selectedVendor.value.categories.push(newCatEntry)
      }
      
      const idx = vendors.value.findIndex(v => v.id === vendorId)
      if (idx !== -1) {
          if (!vendors.value[idx].categories) vendors.value[idx].categories = []
          vendors.value[idx].categories.push(newCatEntry)
      }

      selectedCategoryId.value = ''
      toast.success('Kategori eklendi')
    } catch (error) {
      console.error('Add category error:', error)
      toast.error('Bir hata oluştu')
    }
  }

  const removeCategory = async (vendorId: string | number, categoryId: string | number) => {
    try {
      await adminVendorService.removeCategory(vendorId, categoryId)
      if (selectedVendor.value) {
        selectedVendor.value.categories = selectedVendor.value.categories?.filter(c => ((c as any).category?.id || (c as any).id) !== categoryId)
      }

      const idx = vendors.value.findIndex(v => v.id === vendorId)
      if (idx !== -1) {
         vendors.value[idx].categories = vendors.value[idx].categories?.filter(c => ((c as any).category?.id || (c as any).id) !== categoryId)
      }

      toast.success('Kategori kaldırıldı')
    } catch (error) {
      console.error('Remove category error:', error)
      toast.error('Bir hata oluştu')
    }
  }

  return {
    vendors, categories, loading, vendorActionLoading,
    selectedVendor, selectedCategoryId, statusFilter, vendorSearchQuery,
    showRejectForm, rejectionReason,
    filteredVendors, availableCategories,
    fetchVendors, fetchCategories, openVendorDetail, closeVendorDetail,
    approveVendor, rejectVendor, toggleFeatured, saveB2BSettings,
    addCategory, removeCategory
  }
}
