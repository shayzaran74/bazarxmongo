import { ref, computed, onMounted, watch } from 'vue'

export const useMyAuctions = () => {
  const { $api } = useApi()
  const authStore = useAuthStore()
  const toast = useNuxtApp().$toast
  
  const activeTab = ref('created')
  const createdAuctions = ref<any[]>([])
  const myBids = ref<any[]>([])
  const loadingCreated = ref(false)
  const loadingBids = ref(false)
  const showCreateModal = ref(false)
  const editingAuction = ref<any>(null)

  const fetchCreatedAuctions = async () => {
    loadingCreated.value = true
    try {
      const res: any = await $api('/api/auctions/my/created')
      createdAuctions.value = res.data?.data || []
    } catch (error) {
      console.error('Fetch created auctions error:', error)
      toast.error('Açık artırmalar yüklenirken bir hata oluştu')
    } finally {
      loadingCreated.value = false
    }
  }

  const fetchMyBids = async () => {
    loadingBids.value = true
    try {
      const res: any = await $api('/api/auctions/my/bids')
      myBids.value = res.data?.data || []
    } catch (error) {
      console.error('Fetch my bids error:', error)
      toast.error('Teklifler yüklenirken bir hata oluştu')
    } finally {
      loadingBids.value = false
    }
  }

  const endAuction = async (auctionId: string) => {
    if (!confirm('Açık artırmayı sonlandırmak istediğinizden emin misiniz?')) return
    try {
      await $api(`/api/auctions/${auctionId}/end`, { method: 'PATCH' })
      toast.success('Açık artırma sonlandırıldı')
      await fetchCreatedAuctions()
    } catch (error) {
      console.error('End auction error:', error)
      toast.error('Açık artırma sonlandırılırken bir hata oluştu')
    }
  }

  const editAuction = (auction: any) => {
    editingAuction.value = auction
    showCreateModal.value = true
  }

  const closeModal = () => {
    showCreateModal.value = false
    editingAuction.value = null
  }

  const onAuctionCreated = () => {
    closeModal()
    fetchCreatedAuctions()
  }

  const onAuctionUpdated = () => {
    closeModal()
    fetchCreatedAuctions()
  }

  watch(activeTab, (newTab) => {
    if (newTab === 'created' && createdAuctions.value.length === 0) {
      fetchCreatedAuctions()
    } else if (newTab === 'bids' && myBids.value.length === 0) {
      fetchMyBids()
    }
  })

  onMounted(() => {
    fetchCreatedAuctions()
  })

  return {
    activeTab, createdAuctions, myBids, loadingCreated, loadingBids,
    showCreateModal, editingAuction, authStore,
    fetchCreatedAuctions, fetchMyBids, endAuction, editAuction,
    closeModal, onAuctionCreated, onAuctionUpdated
  }
}
