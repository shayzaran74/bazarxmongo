import { ref, computed, watch, nextTick } from 'vue'
import { useAddressStore } from '~/stores/address'
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { useRoute, useNuxtApp } from '#app'
import { useCheckoutService } from '~/services/checkoutService'
import { useWalletService } from '~/services/api/WalletService'

import type { 
  CheckoutNewAddress, 
  CheckoutLoyaltyStatus, 
  CheckoutCoupon, 
  CheckoutEscrowCoupon, 
  CheckoutLegalDoc,
  CheckoutPaymentPayload,
  Address
} from '@barterborsa/shared-types'
import type { Stripe, StripeElements } from '@stripe/stripe-js'

export const useCheckout = () => {
  const cartStore = useCartStore()
  const authStore = useAuthStore()
  const addressStore = useAddressStore()
  const route = useRoute()
  
  const checkoutService = useCheckoutService()
  const walletService = useWalletService()

  // State
  const processing = ref(false)
  const stripe = ref<Stripe | null>(null)
  const elements = ref<StripeElements | null>(null)
  const clientSecret = ref<string | null>(null)
  const selectedMethod = ref('card')
  const walletBalance = ref(0)
  const walletLoading = ref(false)
  const stripeError = ref<string | null>(null)
  const currentOrderId = ref<string | null>(null)
  const useWalletBalance = ref(false)
  
  const loyaltyStatus = ref<CheckoutLoyaltyStatus | null>(null)
  const loyaltyXpDiscount = ref(0)

  const legalDocs = ref<Record<string, CheckoutLegalDoc>>({})
  const showLegalModal = ref(false)
  const currentLegalDoc = ref({ title: '', content: '' })
  const acceptedAgreements = ref(false)

  const shippingCost = ref(50)
  const couponCodeInput = ref('')
  const appliedCoupon = ref<CheckoutCoupon | null>(null)
  const validatingCoupon = ref(false)
  const couponError = ref('')
  const paymentFormContent = ref('')

  const escrowCouponId = ref(route.query.escrowCouponId as string || null)
  const appliedEscrowCoupon = ref<CheckoutEscrowCoupon | null>(null)

  const selectedAddressId = ref<string | number | null>(null)
  const showNewAddressForm = ref(false)
  const saveNewAddress = ref(true)
  const newAddress = ref<CheckoutNewAddress>({
    title: '', fullName: '', phone: '', addressLine: '', city: '', district: ''
  })

  // Computed
  const finalAmountExcludingLoyalty = computed(() => {
    const discount = appliedCoupon.value ? Number(appliedCoupon.value.discountAmount) : 0
    const escrowDiscount = appliedEscrowCoupon.value ? Number(appliedEscrowCoupon.value.rewardValue) : 0
    return Math.max(0, Number(cartStore.total) + Number(shippingCost.value) - discount - escrowDiscount)
  })

  const finalAmount = computed(() => Math.max(0, finalAmountExcludingLoyalty.value - Number(loyaltyXpDiscount.value)))

  const xpToUse = computed(() => {
    if (!useWalletBalance.value) return 0
    return Math.min(Number(walletBalance.value), Number(finalAmount.value))
  })

  const cashToPay = computed(() => Math.max(0, Number(finalAmount.value) - Number(xpToUse.value)))

  const isAddressReady = computed(() => {
    if (!acceptedAgreements.value) return false
    
    if (selectedAddressId.value && !showNewAddressForm.value) {
      return true
    } else {
      return !!(newAddress.value.fullName && newAddress.value.phone && newAddress.value.addressLine && newAddress.value.city && newAddress.value.district)
    }
  })

  const isFormValid = computed(() => {
    if (!isAddressReady.value) return false
    
    // For Stripe payment, we MUST have the clientSecret to proceed
    if (selectedMethod.value === 'card') return !!clientSecret.value
    
    return true
  })

  // Data Formatting Helpers
  const formatDocumentContent = (content: string): string => {
    const selectedAddress = addressStore.addresses.find(a => a.id === selectedAddressId.value)
    const buyerName = (showNewAddressForm.value ? newAddress.value.name : selectedAddress?.name) || `${authStore.user?.firstName || ''} ${authStore.user?.lastName || ''}`.trim() || 'ALICI'
    const buyerPhone = (showNewAddressForm.value ? (newAddress.value as any).phone : selectedAddress?.phone) || authStore.user?.phoneNumber || ''
    
    let buyerAddress = ''
    if (showNewAddressForm.value) {
      buyerAddress = [newAddress.value.address, newAddress.value.district, newAddress.value.city].filter(Boolean).join(', ')
    } else if (selectedAddress) {
      buyerAddress = [selectedAddress.address, selectedAddress.district, selectedAddress.city].filter(Boolean).join(', ')
    }
    
    const totalAmount = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(finalAmount.value)
    
    return content.replace(/{{alici_adi}}/g, buyerName)
      .replace(/{{alici_telefon}}/g, buyerPhone)
      .replace(/{{alici_adres}}/g, buyerAddress)
      .replace(/{{toplam_tutar}}/g, totalAmount)
      .replace(/sepetteki kişi bilgileri girilecek/g, `\nAd Soyad: ${buyerName}\nTelefon: ${buyerPhone}\nAdres: ${buyerAddress}`)
  }

  // Action Methods
  const buildPaymentPayload = (): CheckoutPaymentPayload => {
    const addrId = selectedAddressId.value && !showNewAddressForm.value ? (selectedAddressId.value as string) : null
    const customAddr = showNewAddressForm.value || addressStore.addresses.length === 0 ? newAddress.value : null
    
    return {
      cartItems: cartStore.items.map(item => ({ productId: item.productId, quantity: item.quantity })),
      selectedAddressId: addrId,
      customAddress: customAddr,
      saveAddress: saveNewAddress.value,
      couponCode: appliedCoupon.value?.code || undefined,
      escrowCouponId: appliedEscrowCoupon.value?.id,
      paidWithXP: Number(loyaltyXpDiscount.value),
      pendingOrderId: currentOrderId.value
    }
  }

  const applyCoupon = async (code?: string) => {
    const codeToUse = code || couponCodeInput.value
    
    // Guard Clause
    if (!codeToUse) return { success: false, error: 'Kupon kodu giriniz.' }
    if (validatingCoupon.value) return { success: false, error: 'İşlem devam ediyor.' }
    
    validatingCoupon.value = true
    couponError.value = ''

    try {
      const res = await checkoutService.validateCoupon(codeToUse, cartStore.total)
      if (res.success && res.data) {
        appliedCoupon.value = res.data
        if (selectedMethod.value === 'card' && isFormValid.value) {
          await initializeStripe()
        }
      }
      return { success: true }
    } catch (error: unknown) {
      const err = error as Error
      couponError.value = err.message
      return { success: false, error: err.message }
    } finally {
      validatingCoupon.value = false
    }
  }

  const removeCoupon = () => {
    appliedCoupon.value = null
    couponCodeInput.value = ''
    if (selectedMethod.value === 'card' && isFormValid.value) {
      initializeStripe()
    }
    return { success: true }
  }

  const initializeStripe = async () => {
    if (selectedMethod.value !== 'card' || !isFormValid.value) return { success: false, error: 'Form geçersiz.' }
    
    try {
      const payload = buildPaymentPayload()
      const res = await checkoutService.createPaymentIntent(payload)
      
      if (res.success && res.data) {
        const data = res.data
        if (data.clientSecret) {
          clientSecret.value = data.clientSecret
          currentOrderId.value = data.orderId
          
          const { $stripe } = useNuxtApp();
          stripe.value = $stripe as unknown as Stripe;
          if (!stripe.value) throw new Error('Stripe yüklenemedi.')

          elements.value = stripe.value.elements({
            clientSecret: clientSecret.value || undefined,
            appearance: { theme: 'stripe', variables: { colorPrimary: '#6366f1', borderRadius: '12px' } }
          })

          const paymentElement = elements.value.create('payment', { layout: 'tabs' })
          await nextTick()
          paymentElement.mount('#payment-element')
          
          return { success: true }
        }
        
        if (data.htmlContent) {
          paymentFormContent.value = data.htmlContent
          currentOrderId.value = data.orderId
          setTimeout(() => injectIyzicoForm(), 500);
          return { success: true }
        }
      }

      throw new Error('İstemci kodu oluşturulamadı.')
    } catch (error: unknown) {
      const err = error as Error
      stripeError.value = err.message
      return { success: false, error: err.message }
    }
  }

  const injectIyzicoForm = () => {
    const container = document.getElementById('iyzico-form-container')
    if (!container) return
    const scripts = container.querySelectorAll('script')
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script')
      Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value))
      newScript.textContent = oldScript.textContent
      oldScript.parentNode?.replaceChild(newScript, oldScript)
    })
  }

  const handlePayment = async () => {
    // Guard Clauses
    if (processing.value) return { success: false, error: 'İşlem devam ediyor.' }
    if (selectedMethod.value === 'wallet' && Number(walletBalance.value) < Number(finalAmount.value) && cashToPay.value > 0) {
      return { success: false, error: 'Cüzdan bakiyeniz yetersiz.' }
    }

    processing.value = true

    try {
      if (selectedMethod.value === 'card') {
        if (!stripe.value || !elements.value) throw new Error('Stripe hazır değil.')
        
        const { error } = await stripe.value.confirmPayment({
          elements: elements.value,
          confirmParams: { return_url: `${window.location.origin}/payment-success` }
        })
        if (error) throw new Error(error.message)
        
        return { success: true }
      } 
      else {
        // Wallet Payment
        const payload = buildPaymentPayload()
        const res = await checkoutService.processWalletPayment(payload)
        
        if (res.success && res.data) {
          await cartStore.fetchCart()
          return { success: true, orderId: res.data.orderId, type: 'wallet' }
        }
        throw new Error(res.error || 'Ödeme başarısız.')
      }
    } catch (error: unknown) {
      const err = error as Error
      return { success: false, error: err.message }
    } finally {
      processing.value = false
    }
  }

  const fetchWallet = async () => {
    walletLoading.value = true
    try {
      const response = await walletService.getWallet()
      if (response && response.success && response.data) {
        const addr = response.data
        const totalBal = Number(addr.balance ?? 0)
        const blockedBal = Number(addr.blockedBalance ?? 0)
        walletBalance.value = totalBal - blockedBal

        // Some logical handling for MAIN accounts if exists
        // (This might need adjustment based on real data structure)
      }
    } catch (err) {
      console.warn('Cüzdan bilgisi çekilemedi:', err)
    } finally {
      walletLoading.value = false
    }
  }

  const fetchShippingCost = async () => {
    try {
      // Logic for premium items or settings
      const settingsRes = await checkoutService.fetchSettings()
      if (settingsRes.success && settingsRes.data) {
        const settings = settingsRes.data
        if (settings.shippingCost) {
          shippingCost.value = parseFloat(settings.shippingCost as string)
        }
        // ... (more logic can be added here)
      }
      
      shippingCost.value = cartStore.total >= 500 ? 0 : 50
    } catch (err) {
      shippingCost.value = 50
    }
  }

  const init = async () => {
    if (cartStore.items.length === 0) await cartStore.fetchCart()
    if (cartStore.items.length === 0) return { success: false, redirect: '/cart' }

    // Start independent fetches directly
    Promise.allSettled([
      checkoutService.fetchLegalDocuments().then(res => {
        if (res.success && res.data) {
          res.data.forEach((d: CheckoutLegalDoc) => { legalDocs.value[d.slug] = d })
        }
      }),
      checkoutService.fetchLoyaltyStatus().then(res => {
        if (res.success && res.data) {
          loyaltyStatus.value = res.data
        }
      }),
      addressStore.fetchAddresses().then(() => {
         if (addressStore.addresses.length > 0) {
            selectedAddressId.value = (addressStore.addresses.find(a => a.isDefault) || addressStore.addresses[0]).id
         } else {
            showNewAddressForm.value = true
         }
      }),
      fetchWallet(),
      fetchShippingCost()
    ])

    if (escrowCouponId.value) {
      try {
        const escRes = await checkoutService.fetchEscrowCoupons()
        if (escRes.success && escRes.data) {
          const found = escRes.data.find(c => c.id === escrowCouponId.value)
          if (found) appliedEscrowCoupon.value = found
        }
      } catch (err) {
        // Silent catch
      }
    }

    return { success: true }
  }

  const openLegalDoc = (slug: string) => {
    const doc = legalDocs.value[slug]
    if (!doc) return
    currentLegalDoc.value = { title: doc.title, content: formatDocumentContent(doc.content) }
    showLegalModal.value = true
  }

  // Watchers and automated triggers
  watch([selectedAddressId, showNewAddressForm, isAddressReady, useWalletBalance, selectedMethod], () => {
    if (isAddressReady.value && selectedMethod.value === 'card') {
      initializeStripe()
    }
  }, { deep: true })

  watch(() => cartStore.total, () => fetchShippingCost())

  return {
    cartStore, addressStore, processing, clientSecret, selectedMethod,
    walletBalance, walletLoading, stripeError, loyaltyStatus, loyaltyXpDiscount,
    showLegalModal, currentLegalDoc, acceptedAgreements, shippingCost,
    couponCodeInput, appliedCoupon, validatingCoupon, couponError,
    paymentFormContent, appliedEscrowCoupon, selectedAddressId,
    showNewAddressForm, saveNewAddress, newAddress, useWalletBalance,
    finalAmountExcludingLoyalty, finalAmount, xpToUse, cashToPay, isFormValid,
    init, applyCoupon, removeCoupon, handlePayment, openLegalDoc
  }
}
