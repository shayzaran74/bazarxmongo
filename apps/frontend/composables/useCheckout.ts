export const useCheckout = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any
  const authStore = useAuthStore()
  const cartStore = useCartStore()
  const addressStore = useAddressStore()

  const loading = ref(false)
  const processing = ref(false)
  const clientSecret = ref('')
  const selectedMethod = ref('IYZICO')
  const walletBalance = ref(0)
  const walletLoading = ref(false)
  const stripeError = ref('')
  const loyaltyStatus = ref<any>(null)
  const loyaltyXpDiscount = ref(0)
  const showLegalModal = ref(false)
  const currentLegalDoc = reactive({ title: '', content: '' })
  const acceptedAgreements = ref(false)
  const shippingCost = ref(0)
  const appliedCoupon = ref<any>(null)
  const validatingCoupon = ref(false)
  const couponError = ref('')
  const paymentFormContent = ref('')
  const appliedEscrowCoupon = ref<any>(null)
  const selectedAddressId = ref('')
  const showNewAddressForm = ref(false)
  const saveNewAddress = ref(true)
  const newAddress = reactive({ 
    title: '', 
    fullName: '', 
    phone: '', 
    city: '', 
    district: '', 
    addressLine: '' 
  })
  const useWalletBalance = ref(false)
  const finalAmountExcludingLoyalty = ref(0)
  const finalAmount = ref(0)
  const xpToUse = ref(0)
  const cashToPay = ref(0)
  const isFormValid = ref(true)

  const init = async () => {
    if (!authStore.isLoggedIn) {
      return { success: false, redirect: '/auth/login' }
    }
    loading.value = true
    try {
      await Promise.all([
        cartStore.fetchCart(),
        addressStore.fetchAddresses(),
        fetchWallet()
      ])
      return { success: true }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const fetchWallet = async () => {
    walletLoading.value = true
    try {
      const res: any = await $api('/api/wallet')
      walletBalance.value = res.data?.availableBalance || 0
    } catch { /* ignore */ } finally {
      walletLoading.value = false
    }
  }

  const applyCoupon = async (code: string) => {
    validatingCoupon.value = true
    couponError.value = ''
    try {
      const res: any = await $api('/api/coupons/validate', {
        method: 'POST',
        body: { code }
      })
      if (res.success) {
        appliedCoupon.value = res.data
        return { success: true }
      }
      return { success: false, error: 'Geçersiz kupon' }
    } catch (e: any) {
      couponError.value = e.data?.message || 'Hata'
      return { success: false, error: couponError.value }
    } finally {
      validatingCoupon.value = false
    }
  }

  const removeCoupon = () => {
    appliedCoupon.value = null
  }

  const handlePayment = async () => {
    processing.value = true
    try {
      const res: any = await $api('/api/checkout', {
        method: 'POST',
        body: {
          addressId: selectedAddressId.value,
          paymentMethod: selectedMethod.value,
          couponCode: appliedCoupon.value?.code,
          useWallet: useWalletBalance.value
        }
      })
      if (res.success) {
        return { success: true, type: 'wallet', orderId: res.data?.id }
      }
      return { success: false, error: 'Ödeme hatası' }
    } catch (e: any) {
      return { success: false, error: e.data?.message || 'Hata' }
    } finally {
      processing.value = false
    }
  }

  const openLegalDoc = (type: string) => {
    currentLegalDoc.title = type === 'kvkk' ? 'KVKK Aydınlatma Metni' : 'Mesafeli Satış Sözleşmesi'
    currentLegalDoc.content = 'Bu bir örnek metindir...'
    showLegalModal.value = true
  }

  return {
    cartStore, addressStore, processing, clientSecret, selectedMethod,
    walletBalance, walletLoading, stripeError, loyaltyStatus, loyaltyXpDiscount,
    showLegalModal, currentLegalDoc, acceptedAgreements, shippingCost,
    appliedCoupon, validatingCoupon, couponError, paymentFormContent,
    appliedEscrowCoupon, selectedAddressId, showNewAddressForm, saveNewAddress,
    newAddress, useWalletBalance, finalAmountExcludingLoyalty, finalAmount,
    xpToUse, cashToPay, isFormValid,
    init, applyCoupon, removeCoupon, handlePayment, openLegalDoc
  }
}
