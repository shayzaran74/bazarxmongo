import { ref, onMounted, watch } from 'vue'

export const useAdminGroupBuy = () => {
  const { $api } = useApi()
  const toast = useNuxtApp().$toast
  
  const campaigns = ref<any[]>([])
  const showModal = ref(false)
  const saving = ref(false)
  const editingCampaign = ref<any>(null)

  const productSearch = ref('')
  const searchResults = ref<any[]>([])
  const selectedProductData = ref<any>(null)

  const form = ref({
    productId: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    tiers: [{ minQuantity: 5, price: 0 }, { minQuantity: 10, price: 0 }] as any[],
    isActive: true
  })

  const fetchCampaigns = async () => {
    try {
      const res: any = await $api('/api/v1/admin/group-buy')
      if (res.success) {
        campaigns.value = res.data
      }
    } catch (error) {
      console.error('Fetch Campaigns Error:', error)
    }
  }

  const searchProducts = async () => {
    if (productSearch.value.length < 2) {
      searchResults.value = []
      return
    }
    try {
      const res: any = await $api(`/api/v1/admin/products`, {
        query: { search: productSearch.value, limit: 5 }
      })
      if (res.success) {
        searchResults.value = res.data
      }
    } catch (error) {
      console.error('Search Products Error:', error)
    }
  }

  const selectProduct = (p: any) => {
    form.value.productId = p.id
    selectedProductData.value = p
    searchResults.value = []
    productSearch.value = ''

    if (form.value.tiers[0].price === 0) {
      form.value.tiers[0].price = p.price * 0.95
      form.value.tiers[1].price = p.price * 0.90
    }
  }

  const addTier = () => {
    form.value.tiers.push({ minQuantity: 0, price: 0 })
  }

  const removeTier = (index: number) => {
    form.value.tiers.splice(index, 1)
  }

  const openModal = (campaign: any = null) => {
    if (campaign) {
      editingCampaign.value = campaign
      form.value = {
        ...campaign,
        startDate: new Date(campaign.startDate).toISOString().slice(0, 16),
        endDate: new Date(campaign.endDate).toISOString().slice(0, 16),
      }
      selectedProductData.value = campaign.Product
    } else {
      editingCampaign.value = null
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(now.getDate() + 7)

      form.value = {
        productId: '',
        title: '',
        description: '',
        startDate: now.toISOString().slice(0, 16),
        endDate: tomorrow.toISOString().slice(0, 16),
        tiers: [{ minQuantity: 5, price: 0 }, { minQuantity: 10, price: 0 }],
        isActive: true
      }
      selectedProductData.value = null
    }
    showModal.value = true
  }

  const saveCampaign = async () => {
    if (!form.value.productId) {
      toast.error('Lütfen bir ürün seçin')
      return
    }

    saving.value = true
    try {
      const url = editingCampaign.value
        ? `/api/v1/admin/group-buy/${editingCampaign.value.id}`
        : '/api/v1/admin/group-buy'
      const method = editingCampaign.value ? 'PUT' : 'POST'

      const res: any = await $api(url, {
        method,
        body: form.value
      })

      if (res.success) {
        toast.success('Kampanya başarıyla kaydedildi')
        showModal.value = false
        fetchCampaigns()
      }
    } catch (error) {
      console.error('Save Campaign Error:', error)
      toast.error('Kampanya kaydedilirken hata oluştu')
    } finally {
      saving.value = false
    }
  }

  const deleteCampaign = async (id: string) => {
    if (!confirm('Bu kampanyayı silmek istediğinizden emin misiniz?')) return
    try {
      const res: any = await $api(`/api/v1/admin/group-buy/${id}`, {
        method: 'DELETE'
      })
      if (res.success) {
        toast.success('Kampanya silindi')
        fetchCampaigns()
      }
    } catch (error) {
      console.error('Delete Campaign Error:', error)
    }
  }

  onMounted(fetchCampaigns)

  return {
    campaigns, showModal, saving, editingCampaign, productSearch, searchResults, selectedProductData, form,
    fetchCampaigns, searchProducts, selectProduct, addTier, removeTier, openModal, saveCampaign, deleteCampaign
  }
}
