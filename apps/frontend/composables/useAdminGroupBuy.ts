export const useAdminGroupBuy = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  const campaigns = ref<any[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const showModal = ref(false)
  const editingCampaign = ref<any>(null)
  const productSearch = ref('')
  const searchResults = ref<any[]>([])
  const selectedProductData = ref<any>(null)

  const form = ref<any>({
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
      const res = await $api<any>('/api/v1/admin/group-buys')
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
      const res = await $api<any>('/api/v1/admin/products', {
        query: { q: productSearch.value, limit: 10 }
      })
      // The API returns the array directly in res.data, or wrapped based on the exact endpoint structure.
      // ProductAdminController returns: { success: true, data: result.items }
      // So res.data IS the array of items.
      searchResults.value = Array.isArray(res.data) ? res.data : (res.data?.items || [])
    } catch { /* ignore */ }

  }

  const selectProduct = (p: any) => {
    selectedProductData.value = p
    form.value.productId = p.id
    searchResults.value = []
    productSearch.value = p.name || p.title
  }

  const addTier = () => {
    form.value.tiers.push({ minQuantity: 0, discountRate: 0 })
  }

  const removeTier = (index: number) => {
     form.value.tiers.splice(index, 1)
  }

  const openModal = (campaign?: any) => {
    if (campaign) {
      editingCampaign.value = campaign
      form.value = JSON.parse(JSON.stringify(campaign))
      selectedProductData.value = campaign.product
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
