import { ref, computed, watch } from 'vue'

export const useAdminBrands = () => {
  const { $api } = useApi()
  const { resolveImageUrl } = useAppImage()
  const toast = useNuxtApp().$toast

  const brands = ref<any[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const submitting = ref(false)
  
  // Tab/Filter State
  const currentTab = ref('pending')
  const currentStatus = ref('PENDING')
  const searchQuery = ref('')
  const selectedLetter = ref('')
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)
  const searchTimeout = ref<any>(null)

  const brandStats = ref({
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
    POPULAR: 0,
    VIOLATIONS: 0
  })

  // Modals/Selected Data
  const showModal = ref(false)
  const showReviewModal = ref(false)
  const isEditing = ref(false)
  const selectedBrand = ref<any>(null)
  const rejectionReason = ref('')
  const selectedTemplate = ref('')
  const isPopularToggle = ref(false)

  // Violations
  const violations = ref<any[]>([])
  const violationsLoading = ref(false)
  const showViolationModal = ref(false)
  const selectedViolation = ref<any>(null)
  const violationNotes = ref('')
  const violationStatus = ref('PENDING')
  const violationSeverity = ref('MEDIUM')

  const formData = ref({
    name: '',
    slug: '',
    icon: '',
    image: '',
    isPopular: false,
    order: 0,
    status: 'APPROVED'
  })

  const fetchBrands = async () => {
    loading.value = true
    try {
      const response: any = await $api('/api/admin/brands', {
        params: {
          status: currentStatus.value,
          q: searchQuery.value,
          letter: selectedLetter.value,
          page: currentPage.value,
          limit: 50
        }
      })
      if (response.success) {
        brands.value = response.data || []
        totalPages.value = response.meta?.totalPages || 1
        totalItems.value = response.meta?.total || 0
        if (response.stats) {
          brandStats.value = response.stats
        }
      }
    } catch (err) {
      console.error('Brands fetch error:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchViolations = async () => {
    violationsLoading.value = true
    try {
      const response: any = await $api('/api/admin/brands/violations')
      if (response.success) {
        violations.value = response.data || []
      }
    } catch (err) {
      console.error('Violations fetch error:', err)
    } finally {
      violationsLoading.value = false
    }
  }

  const handleSearch = () => {
    if (searchTimeout.value) clearTimeout(searchTimeout.value)
    searchTimeout.value = setTimeout(() => {
      currentPage.value = 1
      fetchBrands()
    }, 500)
  }

  const openReviewModal = (brand: any) => {
    selectedBrand.value = brand
    rejectionReason.value = ''
    selectedTemplate.value = ''
    isPopularToggle.value = brand.isPopular || false
    showReviewModal.value = true
  }

  const approveBrandApplication = async (id: string) => {
    submitting.value = true
    try {
      const response: any = await $api(`/api/admin/brands/${id}/approve`, {
        method: 'PATCH',
        body: {
          isPopular: isPopularToggle.value,
          reviewNotes: rejectionReason.value
        }
      })
      if (response.success) {
        toast.success('Marka onaylandı')
        showReviewModal.value = false
        fetchBrands()
      }
    } catch (err) {
      toast.error('İşlem sırasında hata oluştu')
    } finally {
      submitting.value = false
    }
  }

  const requestAdditionalDocs = async (id: string) => {
    submitting.value = true
    try {
      const response: any = await $api(`/api/admin/brands/${id}/request-docs`, {
        method: 'PATCH',
        body: { notes: rejectionReason.value }
      })
      if (response.success) {
        toast.success('Ek belge talebi gönderildi')
        showReviewModal.value = false
        fetchBrands()
      }
    } catch (err) {
      toast.error('İşlem sırasında hata oluştu')
    } finally {
      submitting.value = false
    }
  }

  const rejectBrandApplication = async (id: string) => {
    if (!rejectionReason.value && !selectedTemplate.value) return
    submitting.value = true
    try {
      const response: any = await $api(`/api/admin/brands/${id}/reject`, {
        method: 'PATCH',
        body: {
          rejectionReason: rejectionReason.value,
          rejectionTemplate: selectedTemplate.value
        }
      })
      if (response.success) {
        toast.success('Başvuru reddedildi')
        showReviewModal.value = false
        fetchBrands()
      }
    } catch (err) {
      toast.error('İşlem sırasında hata oluştu')
    } finally {
      submitting.value = false
    }
  }

  const saveBrand = async () => {
    saving.value = true
    try {
      const url = isEditing.value ? `/api/admin/brands/${selectedBrand.value?.id}` : '/api/admin/brands'
      const method = isEditing.value ? 'PUT' : 'POST'
      
      const response: any = await $api(url, {
        method,
        body: formData.value
      })

      if (response.success) {
        toast.success('Marka başarıyla kaydedildi')
        showModal.value = false
        fetchBrands()
      }
    } catch (err) {
      console.error('Brand save error:', err)
      toast.error('Kaydedilirken bir hata oluştu')
    } finally {
      saving.value = false
    }
  }

  const deleteBrand = async (id: string) => {
    if (!confirm('Bu markayı silmek istediğinize emin misiniz?')) return
    try {
      const response: any = await $api(`/api/admin/brands/${id}`, {
        method: 'DELETE'
      })
      if (response.success) {
        toast.success('Marka silindi')
        fetchBrands()
      }
    } catch (err) {
      console.error('Brand delete error:', err)
      toast.error('Silinirken bir hata oluştu')
    }
  }

  const updateViolation = async () => {
    if (!selectedViolation.value) return
    submitting.value = true
    try {
      const response: any = await $api(`/api/admin/brands/violations/${selectedViolation.value?.id}`, {
        method: 'PATCH',
        body: {
          status: violationStatus.value,
          adminNotes: violationNotes.value,
          severity: violationSeverity.value
        }
      })
      if (response.success) {
        toast.success('İhlal kaydı güncellendi')
        showViolationModal.value = false
        fetchViolations()
        fetchBrands() // Update stats
      }
    } catch (err) {
      toast.error('İşlem sırasında hata oluştu')
    } finally {
      submitting.value = false
    }
  }

  const resolveViolationQuickly = async (violation: any) => {
    try {
      const response: any = await $api(`/api/admin/brands/violations/${violation.id}`, {
        method: 'PATCH',
        body: {
          status: 'RESOLVED',
          adminNotes: 'Hızlı çözüm ile onaylandı.'
        }
      })
      if (response.success) {
        toast.success('İhlal çözüldü')
        fetchViolations()
        fetchBrands() // Update stats
      }
    } catch (err) {
      toast.error('İşlem sırasında hata oluştu')
    }
  }

  const openViolationModal = (violation: any) => {
    selectedViolation.value = violation
    violationNotes.value = violation.adminNotes || ''
    violationStatus.value = violation.status
    violationSeverity.value = violation.severity || 'MEDIUM'
    showViolationModal.value = true
  }

  const generateSlug = () => {
    formData.value.slug = formData.value.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // Watches
  watch(currentTab, (newTab) => {
    currentPage.value = 1
    searchQuery.value = ''
    if (newTab === 'pending') {
      currentStatus.value = 'PENDING'
    } else if (newTab === 'all') {
      currentStatus.value = ''
    } else if (newTab === 'violations') {
      fetchViolations()
    }
  })

  watch([currentStatus, currentPage, selectedLetter], () => {
    if (currentTab.value !== 'violations') {
      fetchBrands()
    }
  })

  return {
    brands, loading, saving, submitting, brandStats,
    currentTab, currentStatus, searchQuery, selectedLetter, currentPage, totalPages, totalItems,
    showModal, showReviewModal, isEditing, selectedBrand, rejectionReason, selectedTemplate, isPopularToggle,
    violations, violationsLoading, showViolationModal, selectedViolation, violationNotes, violationStatus, violationSeverity,
    formData,
    fetchBrands, fetchViolations, handleSearch, openReviewModal, approveBrandApplication,
    requestAdditionalDocs, rejectBrandApplication, saveBrand, deleteBrand,
    updateViolation, resolveViolationQuickly, openViolationModal, generateSlug,
    resolveImageUrl
  }
}
