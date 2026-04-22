// composables/useMyAuctions.ts
import { useAuctionStore } from '~/stores/auction'
import { useAuthStore } from '~/stores/auth'

export const useMyAuctions = () => {
  const auctionStore = useAuctionStore()
  const authStore = useAuthStore()
  const { $toast } = useNuxtApp() as any

  const activeTab = ref<'created' | 'bids' | 'won'>('created')
  const showCreateModal = ref(false)
  const editingAuction = ref<any>(null)
  const loadingCreated = ref(false)
  const loadingBids = ref(false)

  const createdAuctions = computed(() => auctionStore.createdAuctions)
  const myBids = computed(() => auctionStore.myBids)

  const loadCreated = async () => {
    loadingCreated.value = true
    await auctionStore.fetchCreatedAuctions()
    loadingCreated.value = false
  }

  const loadBids = async () => {
    loadingBids.value = true
    await auctionStore.fetchMyBids()
    loadingBids.value = false
  }

  const editAuction = (auction: any) => {
    editingAuction.value = auction
    showCreateModal.value = true
  }

  const endAuction = async (auctionId: string) => {
    try {
      await auctionStore.endAuction(auctionId)
      $toast.success('Artırma sonlandırıldı')
      await loadCreated()
    } catch (e: any) {
      $toast.error(e?.data?.message || 'Sonlandırılamadı')
    }
  }

  const closeModal = () => {
    showCreateModal.value = false
    editingAuction.value = null
  }

  const onAuctionCreated = () => {
    closeModal()
    loadCreated()
  }

  const onAuctionUpdated = () => {
    closeModal()
    loadCreated()
  }

  onMounted(() => {
    loadCreated()
    loadBids()
  })

  return {
    activeTab, createdAuctions, myBids,
    loadingCreated, loadingBids,
    showCreateModal, editingAuction, authStore,
    endAuction, editAuction, closeModal,
    onAuctionCreated, onAuctionUpdated,
  }
}
