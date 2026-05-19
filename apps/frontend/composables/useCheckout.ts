export const useCheckout = (): any => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any
  const authStore = useAuthStore()
  const cartStore = useCartStore()
  const addressStore = useAddressStore()

  const loading = ref(false)
  const processing = ref(false)
  const selectedMethod = ref('card')
  const walletBalance = ref(0)
  const walletLoading = ref(false)
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
  const finalAmountExcludingLoyalty = computed(() => {
    let total = cartStore.totalPrice || 0
    if (appliedCoupon.value) {
      if (typeof appliedCoupon.value.discountAmount === 'number') {
        total -= appliedCoupon.value.discountAmount
      } else if (appliedCoupon.value.type === 'PERCENTAGE') {
        total -= (total * (appliedCoupon.value.value / 100))
      } else {
        total -= (appliedCoupon.value.value || 0)
      }
    }
    return Math.max(0, total)
  })

  const finalAmount = computed(() => {
    return Math.max(0, finalAmountExcludingLoyalty.value - loyaltyXpDiscount.value)
  })

  const totalAmountWithShipping = computed(() => {
    return finalAmount.value + shippingCost.value
  })

  const xpToUse = computed(() => {
    if (!useWalletBalance.value) return 0
    return Math.min(walletBalance.value, totalAmountWithShipping.value)
  })

  const cashToPay = computed(() => {
    let amount = totalAmountWithShipping.value
    if (useWalletBalance.value) {
      amount -= xpToUse.value
    }
    return Math.max(0, amount)
  })

  const isNewAddressValid = computed(() => {
    return !!(
      newAddress.fullName && 
      newAddress.phone && 
      newAddress.city && 
      newAddress.district && 
      newAddress.addressLine
    )
  })

  const isFormValid = computed(() => {
    const hasAddress = !!selectedAddressId.value || (showNewAddressForm.value && isNewAddressValid.value)
    const hasAccepted = acceptedAgreements.value
    
    // Wallet check is only critical when wallet is the primary payment method
    const isWalletReady = selectedMethod.value === 'wallet' 
      ? (Number(walletBalance.value) >= Number(totalAmountWithShipping.value))
      : true
    
    return hasAddress && hasAccepted && isWalletReady
  })

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
      
      // Auto-select default address
      if (!selectedAddressId.value && addressStore.addresses.length > 0) {
        const defaultAddr = addressStore.addresses.find(a => a.isDefault) || addressStore.addresses[0]
        selectedAddressId.value = defaultAddr.id
      } else if (addressStore.addresses.length === 0) {
        showNewAddressForm.value = true
      }

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
      if (res.success && res.data?.accounts) {
        // Yeni birleşik yapıda MAIN hesabı bul
        const mainAccount = res.data.accounts.find((a: any) => a.type === 'MAIN')
        walletBalance.value = Number(mainAccount?.availableBalance || 0)
      } else {
        // Fallback veya eski yapı
        walletBalance.value = Number(res.data?.availableBalance || 0)
      }
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
        body: { code, totalAmount: cartStore.totalPrice }
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
      let addressId = selectedAddressId.value

      // If new address form is being used, save it first
      if (showNewAddressForm.value && isNewAddressValid.value) {
        // Split fullName into firstName and lastName for DTO
        const nameParts = newAddress.fullName.trim().split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || '-' // Fallback for last name if not provided

        const res: any = await $api('/api/addresses', {
          method: 'POST',
          body: {
            title: newAddress.title || 'Adres',
            firstName,
            lastName,
            phone: newAddress.phone,
            city: newAddress.city,
            district: newAddress.district,
            addressLine1: newAddress.addressLine,
            isDefault: addressStore.addresses.length === 0
          }
        })
        if (res.success && res.data?.id) {
          addressId = res.data.id
        } else {
          return { success: false, error: res.error || 'Yeni adres kaydedilemedi' }
        }
      }

      if (!addressId) {
         return { success: false, error: 'Lütfen bir teslimat adresi seçin' }
      }

      const res: any = await $api('/api/checkout', {
        method: 'POST',
        body: {
          addressId: addressId,
          paymentMethod: selectedMethod.value,
          couponCode: appliedCoupon.value?.code,
          useWallet: useWalletBalance.value
        }
      })
      
      // Backend artık { success, data: [...], orderId } döndürüyor
      if (res?.success && res?.orderId) {
        return { success: true, type: 'wallet', orderId: res.orderId, data: res.data }
      }
      // Fallback: eski format
      const orders = Array.isArray(res) ? res : (res?.data || [])
      const orderId = res?.orderId || orders[0]?.id || res?.id
      if (orderId || res?.success) {
        return { success: true, type: 'wallet', orderId, data: { id: orderId } }
      }
      return { success: false, error: 'Ödeme işlemi tamamlanamadı' }
    } catch (e: any) {
      return { success: false, error: e.data?.message || 'Ödeme sırasında bir hata oluştu' }
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
    cartStore, addressStore, processing, selectedMethod,
    walletBalance, walletLoading, loyaltyStatus, loyaltyXpDiscount,
    showLegalModal, currentLegalDoc, acceptedAgreements, shippingCost,
    appliedCoupon, validatingCoupon, couponError, paymentFormContent,
    appliedEscrowCoupon, selectedAddressId, showNewAddressForm, saveNewAddress,
    newAddress, useWalletBalance, finalAmountExcludingLoyalty, finalAmount,
    xpToUse, cashToPay, isFormValid, loading, totalAmountWithShipping,
    init, applyCoupon, removeCoupon, handlePayment, openLegalDoc
  }
}
