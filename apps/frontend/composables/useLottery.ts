// composables/useLottery.ts
import { useLotteryStore } from '~/stores/lottery'
import { useAuthStore } from '~/stores/auth'

export const useLottery = () => {
  const lotteryStore = useLotteryStore()
  const authStore = useAuthStore()
  const { $toast } = useNuxtApp() as any

  const searchQuery = ref('')
  const statusFilter = ref('')

  const lotteries = computed(() => lotteryStore.lotteries)
  const loading = computed(() => lotteryStore.loading)
  const error = computed(() => lotteryStore.error)

  const filteredLotteries = computed(() => {
    if (!searchQuery.value) return lotteries.value
    const q = searchQuery.value.toLowerCase()
    return lotteries.value.filter(l =>
      l.title.toLowerCase().includes(q) ||
      l.prizeDescription?.toLowerCase().includes(q)
    )
  })

  const fetchLotteries = () =>
    lotteryStore.fetchLotteries({ status: statusFilter.value || undefined })

  watch(statusFilter, fetchLotteries)

  onMounted(fetchLotteries)

  const formatPrice = (p: number | string) =>
    new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(Number(p))

  const resolveImageUrl = (url: string | null | undefined) =>
    url || 'https://placehold.co/400x400?text=Çekiliş'

  return {
    lotteries, filteredLotteries, loading, error,
    searchQuery, statusFilter, authStore,
    formatPrice, resolveImageUrl, fetchLotteries,
  }
}
