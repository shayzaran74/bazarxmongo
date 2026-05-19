export const useAdminBrands = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

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
          q: filters.search || undefined,
          limit: 100,
        }
      })
      // Backend returns { success: true, data: result }
      // result can be array or { items: [], total: n }
      const data = res?.data
      brands.value = Array.isArray(data) ? data : (data?.items || [])
      totalItems.value = data?.total || brands.value.length
      totalPages.value = Math.ceil(totalItems.value / 50) || 1
      // Update stats based on fetched brands
      brandStats.PENDING = brands.value.filter(b => b.status === 'PENDING').length;
      brandStats.ALL = brands.value.length;
    } catch {
      $toast.error('Markalar yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  const approveBrand = async (id: string) => {
    try {
      await $api(`/api/admin/brands/${id}/approve`, { method: 'PUT' })
      $toast.success('Marka onaylandı')
      fetchBrands()
    } catch {
      $toast.error('Onaylanamadı')
    }
  }

  const rejectBrand = async (id: string, reason: string) => {
    try {
      await $api(`/api/admin/brands/${id}/reject`, {
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
      await $api(`/api/admin/brands/${id}`, { method: 'DELETE' })
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
    fetchBrands();
  };

  const resolveImageUrl = (url: string) => url || '/images/no-brand.png';

  const approveBrandApplication = async (id: string) => {
    try {
      await $api(`/api/admin/brands/${id}/approve`, { method: 'PUT' })
      $toast.success('Marka onaylandı')
      fetchBrands()
    } catch {
      $toast.error('Onaylanamadı')
    }
  }

  const rejectBrandApplication = async (id: string, reason?: string) => {
    try {
      await $api(`/api/admin/brands/${id}/reject`, {
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

  const saveBrand = async () => {
    saving.value = true
    try {
      const payload = { ...formData.value }
      if (isEditing.value) {
        await $api(`/api/admin/brands/${selectedBrand.value.id}`, {
          method: 'PUT',
          body: payload
        })
        $toast.success('Marka güncellendi')
      } else {
        await $api('/api/admin/brands', {
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
      await $api(`/api/admin/brand-violations/${v.id}/resolve`, { method: 'PUT' })
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
    brands, loading, filters, saving, brandStats,
    currentTab, searchQuery, selectedLetter, currentPage, totalPages, totalItems,
    showModal, showReviewModal, isEditing, selectedBrand, rejectionReason, isPopularToggle,
    violations, violationsLoading, formData,
    fetchBrands,
    handleSearch,
    openReviewModal,
    openEditBrand,
    openNewBrand,
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
  }
}
