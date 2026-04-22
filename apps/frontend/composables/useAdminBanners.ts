export const useAdminBanners = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  const banners = ref<any[]>([])
  const loading = ref(false)
  const selectedBanner = ref<any>(null)
  const showFormModal = ref(false)

  const fetchBanners = async () => {
    loading.value = true
    try {
      const res = await $api<any>('/api/admin/banners')
      banners.value = res.data || []
    } catch {
      $toast.error('Banner\'lar yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  const saveBanner = async (data: any) => {
    try {
      if (data.id) {
        await $api(`/api/admin/banners/${data.id}`, {
          method: 'PUT', body: data
        })
      } else {
        await $api('/api/admin/banners', {
          method: 'POST', body: data
        })
      }
      $toast.success('Banner kaydedildi')
      showFormModal.value = false
      fetchBanners()
    } catch {
      $toast.error('Kaydedilemedi')
    }
  }

  const deleteBanner = async (id: string) => {
    if (!confirm('Banner silinsin mi?')) return
    try {
      await $api(`/api/admin/banners/${id}`, { method: 'DELETE' })
      $toast.success('Banner silindi')
      fetchBanners()
    } catch {
      $toast.error('Silinemedi')
    }
  }

  const editBanner = (banner: any) => {
    selectedBanner.value = { ...banner }
    showFormModal.value = true
  }

  return {
    banners, loading, selectedBanner, showFormModal,
    fetchBanners, saveBanner, deleteBanner, editBanner
  }
}
