import { ref, computed } from 'vue'
import { useWalletService, type WalletTransactionParams } from '~/services/api/WalletService'
import { useAuthStore } from '~/stores/auth'
import type { Wallet } from '@barterborsa/shared-types'

// Tier config mapping
export const TIER_CONFIG = {
  CORE: { label: 'Çekirdek', icon: '🌱', color: 'bg-green-100 text-green-700 border-green-200', commission: 10, roi: 65 },
  PRIME: { label: 'Asil', icon: '⭐', color: 'bg-blue-100 text-blue-700 border-blue-200', commission: 8, roi: 75 },
  ELITE: { label: 'Elit', icon: '🏢', color: 'bg-orange-100 text-orange-700 border-orange-200', commission: 6, roi: 85 },
  APEX: { label: 'Zirve', icon: '🏆', color: 'bg-purple-100 text-purple-700 border-purple-200', commission: 4, roi: 100 }
}

export const useWallet = () => {
  const walletService = useWalletService()
  const authStore = useAuthStore()
  const { $api } = useApi()
  const toast = useNuxtApp().$toast

  const wallet = ref<any>({
    accounts: [],
    giftCards: [],
    cards: [],
    requests: [],
    withdrawalRequests: [],
    auctions: []
  })

  const loading = ref(false)
  const submitting = ref(false)
  const error = ref<string | null>(null)

  // Computed accounts
  const accounts = computed(() => wallet.value.accounts || [])
  const mainAccount = computed(() => accounts.value.find((a: any) => a.type === 'MAIN'))
  const barterAccount = computed(() => accounts.value.find((a: any) => a.type === 'BARTER'))
  const commissionAccount = computed(() => accounts.value.find((a: any) => a.type === 'XP_COMMISSION'))
  const adAccount = computed(() => accounts.value.find((a: any) => a.type === 'XP_AD'))
  const serviceAccount = computed(() => accounts.value.find((a: any) => a.type === 'XP_SERVICE'))

  // Computed tier info
  const userTier = computed(() => authStore.user?.currentTier || authStore.user?.vendor?.vendorTier || 'CORE')
  const tierConfig = computed(() => (TIER_CONFIG as any)[userTier.value] || TIER_CONFIG.CORE)
  
  // Format price helper
  const formatPrice = (price: number | string) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(Number(price || 0))
  }

  // Fetch wallet data
  const fetchWallet = async () => {
    loading.value = true
    error.value = null
    try {
      if (!authStore.isLoggedIn) throw new Error('Giriş yapmanız gerekiyor')
      const res = await walletService.getWallet()
      if (res.success && res.data) {
        wallet.value = res.data
      }
    } catch (err: any) {
      error.value = err.message || 'Cüzdan verileri yüklenirken bir hata oluştu'
    } finally {
      loading.value = false
    }
  }

  // Barter Methods
  const registerForBarter = async () => {
    try {
      const response = await $api('/api/barter/register', { method: 'POST' })
      if (response.success) {
        toast.success(response.message || 'Barter havuzuna başarıyla kayıt oldunuz!')
        await fetchWallet()
        await authStore.fetchUser()
      }
    } catch (e: any) {
      toast.error(e.data?.error || 'Kayıt sırasında bir hata oluştu.')
    }
  }

  const topUpBarter = async (amount: number) => {
    if (!amount || amount < 1) return
    submitting.value = true
    try {
      const response = await $api('/api/barter/topup', {
        method: 'POST',
        body: { amount }
      })
      if (response.success) {
        toast.success('Havuza aktarım başarılı!')
        await fetchWallet()
        await authStore.fetchUser()
        return true
      }
    } catch (e: any) {
      toast.error(e.data?.error || 'Aktarım sırasında bir hata oluştu')
    } finally {
      submitting.value = false
    }
    return false
  }

  const withdrawBarter = async (amount: number) => {
    if (!amount || amount < 1) return
    submitting.value = true
    try {
      const response = await $api('/api/barter/withdraw', {
        method: 'POST',
        body: { amount }
      })
      if (response.success) {
        toast.success('Havuzdan para çekme başarılı!')
        await fetchWallet()
        await authStore.fetchUser()
        return true
      }
    } catch (e: any) {
      toast.error(e.data?.error || 'Para çekme sırasında bir hata oluştu')
    } finally {
      submitting.value = false
    }
    return false
  }

  // Gift Card Methods
  const redeemGiftCard = async (code: string) => {
    try {
      const response = await $api('/api/wallet/redeem-gift-card', {
        method: 'POST',
        body: { code }
      })
      if (response.success) {
        toast.success('Hediye kartı yüklendi!')
        await fetchWallet()
        await authStore.fetchUser()
        return true
      }
    } catch (e: any) {
      toast.error(e.data?.error || 'Hediye kartı yüklenirken bir hata oluştu')
    }
    return false
  }

  // Lottery Helper
  const isCardWinner = (card: any) => {
    if (!card.giveaway) return null
    if (card.giveaway.status !== 'FINISHED') return null
    return card.isWinner || false
  }

  return {
    wallet, loading, submitting, error,
    accounts, mainAccount, barterAccount, commissionAccount, adAccount, serviceAccount,
    userTier, tierConfig, 
    formatPrice, fetchWallet,
    registerForBarter, topUpBarter, withdrawBarter, redeemGiftCard, isCardWinner,
    fetchTransactions: walletService.getTransactions,
    fetchAccountTransactions: walletService.getAccountTransactions
  }
}
