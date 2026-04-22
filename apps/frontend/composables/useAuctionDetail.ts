// composables/useAuctionDetail.ts
import { useAuctionStore } from '~/stores/auction'
import { useAuthStore } from '~/stores/auth'

export const useAuctionDetail = () => {
  const route = useRoute()
  const { $toast } = useNuxtApp() as any
  const authStore = useAuthStore()
  const auctionStore = useAuctionStore()

  const bidding = ref(false)
  const claiming = ref(false)
  const bidAmount = ref(0)

  // Computed
  const auction = computed(() => auctionStore.currentAuction)
  const bids = computed(() => auctionStore.bids)
  const loading = computed(() => auctionStore.loading)
  const participation = computed(() => auctionStore.participation)

  const minNextBid = computed(() => {
    if (!auction.value) return 0
    return auction.value.currentPrice + auction.value.minBidIncrement
  })

  const isHighestBidder = computed(() => {
    if (!authStore.user || !bids.value.length) return false
    return bids.value[0]?.userId === authStore.user.id
  })

  const isEligibleToClaim = computed(() => {
    if (!auction.value || !authStore.user) return false
    return (
      auction.value.status === 'ENDED' &&
      auction.value.winnerId === authStore.user.id
    )
  })

  const countdown = reactive({ D: '00', H: '00', M: '00', S: '00' })

  const updateCountdown = () => {
    if (!auction.value || auction.value.status !== 'ACTIVE') return
    const end = new Date(auction.value.endTime).getTime()
    const diff = end - Date.now()
    if (diff <= 0) {
      countdown.D = countdown.H = countdown.M = countdown.S = '00'
      return
    }
    countdown.D = String(Math.floor(diff / 86400000)).padStart(2, '0')
    countdown.H = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0')
    countdown.M = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0')
    countdown.S = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')
  }

  const handleParticipate = async () => {
    if (!authStore.isLoggedIn) {
      $toast.info('Lütfen giriş yapın')
      return navigateTo('/auth/login')
    }
    try {
      const res = await auctionStore.participate(route.params.id as string)
      if (res.success) {
        $toast.success('Artırmaya katıldınız!')
      }
    } catch (e: any) {
      $toast.error(e?.data?.message || 'Katılım başarısız')
    }
  }

  const handlePlaceBid = async (amount: number) => {
    if (!authStore.isLoggedIn) {
      $toast.info('Lütfen giriş yapın')
      return navigateTo('/auth/login')
    }
    bidding.value = true
    try {
      const res = await auctionStore.placeBid(route.params.id as string, amount)
      if (res.success) {
        $toast.success('Teklifiniz kaydedildi!')
      }
    } catch (e: any) {
      $toast.error(e?.data?.message || 'Teklif verilemedi')
    } finally {
      bidding.value = false
    }
  }

  const handleClaim = async () => {
    claiming.value = true
    try {
      const res = await auctionStore.claimWin(route.params.id as string)
      if (res.success) {
        $toast.success('Kazanımınız onaylandı!')
        await auctionStore.fetchAuction(route.params.id as string)
      }
    } catch (e: any) {
      $toast.error(e?.data?.message || 'Kazanım onaylanamadı')
    } finally {
      claiming.value = false
    }
  }

  let timer: ReturnType<typeof setInterval> | null = null

  onMounted(async () => {
    const id = route.params.id as string
    await Promise.all([
      auctionStore.fetchAuction(id),
      auctionStore.fetchBids(id),
      authStore.isLoggedIn
        ? auctionStore.fetchParticipation(id)
        : Promise.resolve(),
    ])
    timer = setInterval(updateCountdown, 1000)
    updateCountdown()
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return {
    auction, bids, loading, bidding, claiming,
    participation, countdown, minNextBid,
    isHighestBidder, isEligibleToClaim,
    handleParticipate, handlePlaceBid, handleClaim,
    bidAmount
  }
}
