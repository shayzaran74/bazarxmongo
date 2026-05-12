export const useAdminSideAds = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  const sideAds = ref<any[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const currentEcosystem = ref<any>(null)
  const filters = reactive({ search: '', status: '' })

  const localLeftAds = computed(() => sideAds.value.filter(a => a.side === 'LEFT'))
  const localRightAds = computed(() => sideAds.value.filter(a => a.side === 'RIGHT'))

  const fetchSideAds = async () => {
    loading.value = true
    try {
      const res = await $api<any>('/api/v1/admin/side-ads')
      sideAds.value = res.data || []
    } catch { /* ignore */ } finally {
      loading.value = false
    }
  }

  const saveSideAd = async (data: any) => {
    saving.value = true
    try {
      if (data.id) {
        await $api(`/api/admin/side-ads/${data.id}`, {
          method: 'PUT', body: data
        })
      } else {
        await $api('/api/v1/admin/side-ads', {
          method: 'POST', body: data
        })
      }
      $toast.success('Reklam kaydedildi')
      fetchSideAds()
    } catch {
      $toast.error('Kaydedilemedi')
    } finally {
      saving.value = false
    }
  }

  const deleteAd = async (id: string) => {
    if (!confirm('Reklam silinsin mi?')) return
    try {
      await $api(`/api/admin/side-ads/${id}`, { method: 'DELETE' })
      $toast.success('Silindi')
      fetchSideAds()
    } catch {
      $toast.error('Silinemedi')
    }
  }

  const handleDragEnd = async (event: any) => {
    try {
      await $api('/api/v1/admin/side-ads/reorder', {
        method: 'POST',
        body: { ids: sideAds.value.map(a => a.id) }
      })
      $toast.success('Sıralama güncellendi')
    } catch {
      $toast.error('Sıralama kaydedilemedi')
    }
  }

  const parseLocationsToTags = (locations: any[]) => {
    if (!locations || !locations.length) return { city: '', district: '' }
    const loc = locations[0]
    return { city: loc.city || '', district: loc.district || '' }
  }

  return {
    sideAds, loading, saving, filters, localLeftAds, localRightAds, currentEcosystem,
    fetchSideAds, fetchAds: fetchSideAds, saveSideAd, deleteAd, handleDragEnd, parseLocationsToTags
  }
}
