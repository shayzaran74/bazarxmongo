import { ref, readonly } from 'vue'
import { useWalletService, type WalletTransactionParams } from '~/services/api/WalletService'
import { useAuthStore } from '~/stores/auth'
import type { Wallet } from '@barterborsa/shared-types'

/**
 * Cüzdan işlemlerini yöneten merkezi composable.
 */
export const useWallet = () => {
  const walletService = useWalletService()
  const authStore = useAuthStore()

  const wallet = ref<Wallet>({
    balance: 0,
    blockedBalance: 0,
    cards: [],
    requests: [],
    accounts: []
  })

  const loading = ref(false)
  const error = ref<string | null>(null)

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
      if (!authStore.isLoggedIn) {
        throw new Error('Giriş yapmanız gerekiyor')
      }

      const res = await walletService.getWallet()

      if (res.success && res.data) {
        wallet.value = res.data
      } else {
        throw new Error(res.error || 'Cüzdan verileri yüklenirken bir hata oluştu')
      }
    } catch (err: unknown) {
      const errorMsg = (err as Error).message || 'Cüzdan verileri yüklenirken bir hata oluştu'
      error.value = errorMsg
      console.error('Fetch wallet error:', err)
    } finally {
      loading.value = false
    }
  }

  // Top up wallet
  const topUp = async (params: { amount: number, paymentMethod: string }) => {
    loading.value = true
    error.value = null

    try {
      const res = await walletService.topUpPrice(params.amount, params.paymentMethod)

      if (res.success) {
        await fetchWallet()
        return true
      } else {
        throw new Error(res.error || 'Talep oluşturulamadı.')
      }
    } catch (err: unknown) {
      const errorMsg = (err as Error).message || 'Bir hata oluştu.'
      error.value = errorMsg
      return false
    } finally {
      loading.value = false
    }
  }

  // Fetch transaction history
  const fetchTransactions = async (params: WalletTransactionParams = {}) => {
    try {
      return await walletService.getTransactions(params)
    } catch (err: unknown) {
      console.error('Fetch transactions error:', err)
      return { success: false, error: (err as Error).message }
    }
  }

  // Fetch transactions for a specific account
  const fetchAccountTransactions = async (accountId: number | string, params: WalletTransactionParams = {}) => {
    try {
      return await walletService.getAccountTransactions(accountId, params)
    } catch (err: unknown) {
      console.error('Fetch account transactions error:', err)
      return { success: false, error: (err as Error).message }
    }
  }

  // Withdraw money
  const withdrawWallet = async (data: { amount: number, iban: string, accountHolder: string, bankName: string }) => {
    loading.value = true
    error.value = null

    try {
      const res = await walletService.withdraw(data)
      if (res.success) {
        await fetchWallet()
        return { success: true, message: res.message || 'Çekme talebiniz oluşturuldu.' }
      } else {
        throw new Error(res.error || 'Talep oluşturulamadı.')
      }
    } catch (err: unknown) {
      const errorMsg = (err as Error).message || 'Bir hata oluştu.'
      error.value = errorMsg
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Helper for lottery winner
  const isCardWinner = (card: { isWinner?: boolean }) => {
    return card.isWinner || false
  }

  return {
    wallet: readonly(wallet),
    loading: readonly(loading),
    error: readonly(error),
    formatPrice,
    isCardWinner,
    fetchWallet,
    topUp,
    withdrawWallet,
    fetchTransactions,
    fetchAccountTransactions
  }
}
