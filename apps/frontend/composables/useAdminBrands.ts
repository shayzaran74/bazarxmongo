export const useAdminBrands = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  const brands = ref<any[]>([])
  const loading = ref(false)
  const filters = reactive({ search: '', status: '' })

  const fetchBrands = async () => {
    loading.value = true
    try {
      const res = await $api<any>('/api/admin/brands', {
        query: {
          q: filters.search || undefined,
          limit: 100,
        }
      })
      brands.value = res.data?.items || []
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

  return {
    brands, loading, filters,
    fetchBrands, approveBrand, rejectBrand, deleteBrand,
  }
}
