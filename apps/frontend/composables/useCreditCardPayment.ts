import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter, useNuxtApp } from '#imports'
import { usePaymentConfirmService } from '~/services/api/PaymentService'

export const useCreditCardPayment = () => {
  const route = useRoute()
  const router = useRouter()
  const paymentConfirmService = usePaymentConfirmService()
  const { $toast: toast } = useNuxtApp()

  // State
  const loading = ref(false)
  const amount = ref(parseFloat(route.query.amount as string) || 0)
  const orderNumber = ref((route.query.orderNumber as string) || '')
  const acceptTerms = ref(false)
  const cardBrand = ref('')

  const cardForm = ref({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  })

  const selectedInstallment = ref({
    count: 1,
    amount: 0,
    total: 0
  })

  // Computed
  const cardFee = computed(() => Math.ceil(amount.value * 0.03) + 1)
  const totalAmount = computed(() => amount.value + cardFee.value)

  const installmentOptions = computed(() => {
    const options = [{ count: 1, amount: totalAmount.value, total: totalAmount.value }]
    if (totalAmount.value >= 100) {
      [3, 6, 12].forEach(count => {
        options.push({ count, amount: totalAmount.value / count, total: totalAmount.value })
      })
    }
    return options
  })

  const isFormValid = computed(() => {
    return cardForm.value.number.replace(/\s/g, '').length >= 16 &&
      cardForm.value.name.length >= 3 &&
      cardForm.value.expiry.length === 5 &&
      cardForm.value.cvv.length >= 3 &&
      acceptTerms.value
  })

  // Methods
  const formatCardNumber = () => {
    let value = cardForm.value.number.replace(/\s/g, '').replace(/[^0-9]/g, '').substring(0, 16)
    value = value.replace(/(.{4})/g, '$1 ').trim()
    cardForm.value.number = value

    const firstDigit = value.charAt(0)
    if (firstDigit === '4') cardBrand.value = 'visa'
    else if (firstDigit === '5') cardBrand.value = 'mastercard'
    else if (firstDigit === '3') cardBrand.value = 'amex'
    else cardBrand.value = ''
  }

  const formatExpiry = () => {
    let value = cardForm.value.expiry.replace(/[^0-9]/g, '')
    if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2, 4)
    cardForm.value.expiry = value
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price || 0)
  }

  const processPayment = async () => {
    loading.value = true
    try {
      const paymentData = {
        amount: amount.value,
        cardFee: cardFee.value,
        totalAmount: selectedInstallment.value.total,
        orderNumber: orderNumber.value,
        installments: selectedInstallment.value.count,
        card: {
          number: cardForm.value.number.replace(/\s/g, ''),
          name: cardForm.value.name,
          expiry: cardForm.value.expiry,
          cvv: cardForm.value.cvv,
          brand: cardBrand.value
        }
      }

      const response = await paymentConfirmService.processCreditCard(paymentData)
      if (response.success && response.data) {
        const data = response.data as any
        if (data.requires3DS) {
          window.location.href = data.redirectUrl
        } else {
          toast.success('Ödeme başarıyla tamamlandı!')
          router.push(orderNumber.value ? `/orders/${orderNumber.value}?success=true` : '/wallet?success=true')
        }
      } else {
        throw new Error(response.error || 'Ödeme işlemi başarısız')
      }
    } catch (err: any) {
      toast.error(err.message || 'Ödeme işlemi sırasında bir hata oluştu')
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    if (!amount.value || amount.value <= 0) {
      toast.error('Geçersiz ödeme tutarı')
      router.back()
      return
    }
    selectedInstallment.value = installmentOptions.value[0]
  })

  watch(totalAmount, () => {
    selectedInstallment.value = installmentOptions.value[0]
  })

  return {
    loading, amount, cardFee, totalAmount, orderNumber, cardForm, cardBrand,
    selectedInstallment, installmentOptions, isFormValid, acceptTerms,
    formatCardNumber, formatExpiry, formatPrice, processPayment
  }
}
