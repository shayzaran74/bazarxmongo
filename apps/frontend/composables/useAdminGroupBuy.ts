export const useAdminGroupBuy = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp()

  const campaigns = ref<Record<string, unknown>[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const showModal = ref(false)
  const editingCampaign = ref<Record<string, unknown> | null>(null)
  const productSearch = ref('')
  const searchResults = ref<Record<string, unknown>[]>([])
  const selectedProductData = ref<Record<string, unknown> | null>(null)

  const form = ref<Record<string, unknown>>({
    id: '',
    productId: '',
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    status: 'PENDING',
    tiers: []
  })

  const fetchGroupBuys = async () => {
    loading.value = true
    try {
      const res = await $api<{ data: Record<string, unknown>[] }>('/api/v1/admin/group-buys')
      campaigns.value = res.data || []
    } catch { /* ignore */ } finally {
      loading.value = false
    }
  }

  const searchProducts = async () => {
    if (!productSearch.value) {
      searchResults.value = []
      return
    }
    try {
      const res = await $api<{ data?: { items?: Record<string, unknown>[] }; items?: Record<string, unknown>[] }>('/api/v1/admin/products', {
        query: { q: productSearch.value, limit: 10 }
      })
      // The API returns the array directly in res.data, or wrapped based on the exact endpoint structure.
      // ProductAdminController returns: { success: true, data: result.items }
      // So res.data IS the array of items.
      searchResults.value = Array.isArray(res.data) ? res.data : (res.data?.items || [])
    } catch { /* ignore */ }

  }

  const selectProduct = (p: Record<string, unknown>) => {
    selectedProductData.value = p
    form.value.productId = p.id as string
    searchResults.value = []
    productSearch.value = p.name as string || p.title as string
  }

  const addTier = () => {
    form.value.tiers.push({ minQuantity: 0, discountRate: 0 })
  }

  const removeTier = (index: number) => {
     form.value.tiers.splice(index, 1)
  }

  const openModal = (campaign?: Record<string, unknown>) => {
    if (campaign) {
      editingCampaign.value = campaign
      form.value = JSON.parse(JSON.stringify(campaign))
      selectedProductData.value = campaign.product as Record<string, unknown> | undefined
    } else {
      editingCampaign.value = null
      form.value = {
        id: '',
        productId: '',
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        status: 'PENDING',
        tiers: []
      }
      selectedProductData.value = null
    }
    showModal.value = true
  }

  const saveCampaign = async () => {
    saving.value = true
    try {
      if (form.value.id) {
        await $api(`/api/admin/group-buys/${form.value.id}`, {
          method: 'PUT', body: form.value
        })
      } else {
        await $api('/api/v1/admin/group-buys', {
          method: 'POST', body: form.value
        })
      }
      $toast.success('Kampanya kaydedildi')
      showModal.value = false
      fetchGroupBuys()
    } catch {
      $toast.error('Kaydedilemedi')
    } finally {
      saving.value = false
    }
  }

  const deleteCampaign = async (id: string) => {
    if (!confirm('Kampanyayı silmek istediğinize emin misiniz?')) return
    try {
      await $api(`/api/admin/group-buys/${id}`, { method: 'DELETE' })
      $toast.success('Kampanya silindi')
      fetchGroupBuys()
    } catch {
      $toast.error('Silinemedi')
    }
  }

  return {
    campaigns, showModal, saving, editingCampaign, productSearch, searchResults, selectedProductData, form, loading,
    searchProducts, selectProduct, addTier, removeTier, openModal, saveCampaign, deleteCampaign, fetchGroupBuys
  }
}
