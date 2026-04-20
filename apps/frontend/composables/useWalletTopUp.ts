import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useTierService } from '~/services/api/TierService'

export const useWalletTopUp = (props: any, emit: any) => {
  const { $api } = useApi()
  const authStore = useAuthStore()
  const toast = useNuxtApp().$toast
  const { getUserTier } = useTierService()

  const amount = ref(1000)
  const loading = ref(false)
  const success = ref(false)
  const error = ref<string | null>(null)
  const selectedPaymentMethod = ref('BANK_TRANSFER')
  const tierInfo = ref<any>(null)

  const paymentMethods = [
    {
      id: 'BANK_TRANSFER',
      name: 'BANKA HAVALESİ',
      description: 'GÜVENLİ TRANSFER',
      icon: '🏦',
      fee: 'KOMİSYONSUZ'
    },
    {
      id: 'EFT',
      name: 'EFT',
      description: 'HIZLI İŞLEM',
      icon: '🏢',
      fee: 'KOMİSYONSUZ'
    },
    {
      id: 'CREDIT_CARD',
      name: 'KREDİ / BANKA KARTI',
      description: 'ANLIK ONAY',
      icon: '💳',
      fee: '%2.69 İŞLEM ÜCRETİ'
    }
  ]

  const quickAmounts = [250, 500, 1000, 2500]

  const currentLimits = computed(() => {
    return tierInfo.value?.currentTier?.walletLimits || null
  })

  const isOverLimit = computed(() => {
    if (!currentLimits.value || !amount.value) return false
    return amount.value > currentLimits.value.singleTransaction
  })

  const fetchTierInfo = async () => {
    try {
      const res: any = await getUserTier()
      if (res.success) {
        tierInfo.value = res.data
      }
    } catch (err) {
      console.error('Failed to fetch tier info:', err)
    }
  }

  const clearMessages = () => {
    setTimeout(() => {
      success.value = false
      error.value = null
    }, 5000)
  }

  const handleSubmit = async () => {
    if (amount.value < 1) {
      error.value = 'Geçerli bir tutar giriniz.'
      return
    }

    if (isOverLimit.value) {
      error.value = `Tek işlem limitinizi aştınız.`
      return
    }

    loading.value = true
    error.value = null
    success.value = false

    try {
      const userId = props.userId || authStore.user?.id
      if (!userId) throw new Error('Kullanıcı oturumu bulunamadı')

      if (selectedPaymentMethod.value === 'CREDIT_CARD') {
        const reference = `WLTRX-${Date.now()}`
        const redirectUrl = `/payment/credit-card?amount=${amount.value}&reference=${reference}`
        await navigateTo(redirectUrl)
        loading.value = false
        return
      }

      const response: any = await $api('/api/wallet/topup', {
        method: 'POST',
        body: {
          amount: amount.value,
          paymentMethod: selectedPaymentMethod.value === 'EFT' ? 'BANK_TRANSFER' : selectedPaymentMethod.value
        }
      })

      if (response.success) {
        success.value = true
        toast.success('Talebiniz alınmıştır.')
        emit('success')
        clearMessages()
      }
    } catch (err: any) {
      error.value = err.message || 'Sistem hatası.'
      toast.error(error.value || 'Hata')
      clearMessages()
    } finally {
      loading.value = false
    }
  }

  const submitButtonText = computed(() => {
    switch (selectedPaymentMethod.value) {
      case 'BANK_TRANSFER': return 'HAVALE TALEBİNİ TAMAMLA'
      case 'EFT': return 'EFT TALEBİNİ TAMAMLA'
      case 'CREDIT_CARD': return 'ÖDEME EKRANINA GİT'
      default: return 'İŞLEME DEVAM ET'
    }
  })

  onMounted(fetchTierInfo)

  watch(amount, () => {
    if (error.value && amount.value >= 1) error.value = null
  })

  return {
    amount, loading, success, error, selectedPaymentMethod, tierInfo,
    paymentMethods, quickAmounts, currentLimits, isOverLimit, submitButtonText,
    handleSubmit, clearMessages
  }
}
