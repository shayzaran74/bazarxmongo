export const useAdminBrands = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any
  const config = useRuntimeConfig()

  const brands = ref<any[]>([])
  const loading = ref(false)
  const filters = reactive({ search: '', status: '' })
  const currentTab = ref('pending')
  const searchQuery = ref('')
  const selectedLetter = ref('')
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)

  const saving = ref(false);
  const uploading = ref(false);
  const showModal = ref(false);
  const showReviewModal = ref(false);
  const isEditing = ref(false);
  const selectedBrand = ref<any>(null);
  const rejectionReason = ref('');
  const isPopularToggle = ref(false);
  const formData = ref({ name: '', slug: '', icon: '', image: '', isPopular: false, order: 0, status: 'APPROVED' });
  const brandStats = reactive({ PENDING: 0, ALL: 0, VIOLATIONS: 0 });
  const violations = ref([]);
  const violationsLoading = ref(false);

  const fetchBrands = async () => {
    loading.value = true
    try {
      const res = await $api<any>('/api/v1/admin/brands', {
        query: {
          q: searchQuery.value || filters.search || undefined,
          status: currentTab.value === 'pending' ? 'PENDING' : undefined,
          letter: selectedLetter.value || undefined,
          limit: 100,
          page: currentPage.value
        }
      })
      const data = res?.data
      brands.value = Array.isArray(data) ? data : (data?.items || [])
      totalItems.value = data?.total || brands.value.length
      totalPages.value = Math.ceil(totalItems.value / 100) || 1
      brandStats.PENDING = Array.isArray(data) ? brands.value.filter((b: any) => b.status === 'PENDING').length : (data?.pending || 0);
      brandStats.ALL = totalItems.value;
    } catch {
      $toast.error('Markalar yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  // Watch pagination and filters
  watch([currentPage], () => {
    fetchBrands();
  });

  watch([searchQuery, selectedLetter, currentTab], () => {
    currentPage.value = 1;
    fetchBrands();
  });

  const approveBrand = async (id: string) => {
    try {
      await $api(`/api/v1/admin/brands/${id}/approve`, { method: 'PUT' })
      $toast.success('Marka onaylandı')
      fetchBrands()
    } catch {
      $toast.error('Onaylanamadı')
    }
  }

  const rejectBrand = async (id: string, reason: string) => {
    try {
      await $api(`/api/v1/admin/brands/${id}/reject`, {
        method: 'PUT',
        body: { rejectionReason: reason }
      })
      $toast.success('Marka reddedildi')
      fetchBrands()
    } catch {
      $toast.error('Reddedilemedi')
    }
  }

  const deleteBrand = async (id: string) => {
    if (!confirm('Bu markayı silmek istediğinizden emin misiniz?')) return
    try {
      await $api(`/api/v1/admin/brands/${id}`, { method: 'DELETE' })
      $toast.success('Marka silindi')
      fetchBrands()
    } catch {
      $toast.error('Silinemedi')
    }
  }

  // Placeholder functions for modal controls
  const openReviewModal = (brand: any) => {
    selectedBrand.value = brand;
    showReviewModal.value = true;
  };

  const openEditBrand = (brand: any) => {
    isEditing.value = true;
    selectedBrand.value = brand;
    formData.value = { ...brand };
    showModal.value = true;
  };

  const generateSlug = () => {
    formData.value.slug = formData.value.name.toLowerCase().replace(/\s+/g, '-');
  };

  const handleSearch = () => {
    currentPage.value = 1;
    fetchBrands();
  };

  const resolveImageUrl = (url: string) => {
    if (!url) return '/images/no-brand.png'
    if (url.startsWith('http') || url.startsWith('data:')) return url
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url
    return `/api/v1/media/${cleanUrl}`
  }

  const approveBrandApplication = async (id: string) => {
    try {
      await $api(`/api/v1/admin/brands/${id}/approve`, { method: 'PUT' })
      $toast.success('Marka onaylandı')
      fetchBrands()
    } catch {
      $toast.error('Onaylanamadı')
    }
  }

  const rejectBrandApplication = async (id: string, reason?: string) => {
    try {
      await $api(`/api/v1/admin/brands/${id}/reject`, {
        method: 'PUT',
        body: { rejectionReason: reason }
      })
      $toast.success('Marka reddedildi')
      fetchBrands()
    } catch {
      $toast.error('Reddedilemedi')
    }
  }

  const requestAdditionalDocs = async (id: string) => {
    try {
      await $api(`/api/admin/brands/${id}/request-docs`, { method: 'PUT' })
      $toast.success('Belge talebi gönderildi')
      fetchBrands()
    } catch {
      $toast.error('Belge talebi gönderilemedi')
    }
  }

  const handleUpload = async (file: File) => {
    if (!file) return
    uploading.value = true

    try {
      const authStore = useAuthStore()
      const token = authStore.token || useCookie('access_token').value

      const body = new FormData()
      body.append('file', file)

      const uploadUrl = '/api/v1/upload?subPath=brands'
      
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message || `Upload başarısız: ${res.status}`)
      }

      const json = await res.json()
      const url = json?.data?.url
      if (url) {
        formData.value.icon = url
        $toast.success('Logo başarıyla yüklendi')
      } else {
        throw new Error('Sunucu URL döndürmedi')
      }
    } catch (e: any) {
      $toast.error(e?.message || 'Görsel yüklenemedi')
    } finally {
      uploading.value = false
    }
  }

  const saveBrand = async () => {
    saving.value = true
    try {
      const payload = { ...formData.value }
      if (isEditing.value) {
        const brandId = selectedBrand.value?.id || selectedBrand.value?._id
        await $api(`/api/v1/admin/brands/${brandId}`, {
          method: 'PUT',
          body: payload
        })
        $toast.success('Marka güncellendi')
      } else {
        await $api('/api/v1/admin/brands', {
          method: 'POST',
          body: payload
        })
        $toast.success('Marka oluşturuldu')
      }
      showModal.value = false
      fetchBrands()
    } catch (e: any) {
      $toast.error(e?.message || 'Kayıt hatası')
    } finally {
      saving.value = false
    }
  }

  const resolveViolationQuickly = async (v: any) => {
    try {
      await $api(`/api/v1/admin/brand-violations/${v.id}/resolve`, { method: 'PUT' })
      $toast.success('İhlal çözüldü olarak işaretlendi')
      fetchBrands()
    } catch {
      $toast.error('İhlal çözülemedi')
    }
  }

  const openViolationModal = (v: any) => {
    // brand violations tab uses same BrandReviewModal, pass the violation's brand
    selectedBrand.value = v.brand || { id: v.id, name: v.brandName, status: v.status }
    showReviewModal.value = true
  }

  return {
    brands, loading, filters, saving, uploading, brandStats,
    currentTab, searchQuery, selectedLetter, currentPage, totalPages, totalItems,
    showModal, showReviewModal, isEditing, selectedBrand, rejectionReason, isPopularToggle,
    violations, violationsLoading, formData,
    fetchBrands,
    handleSearch,
    openReviewModal,
    openEditBrand,
    generateSlug,
    resolveImageUrl,
    approveBrand,
    approveBrandApplication,
    rejectBrand,
    rejectBrandApplication,
    requestAdditionalDocs,
    resolveViolationQuickly,
    openViolationModal,
    deleteBrand,
    saveBrand,
    handleUpload
  }
}
