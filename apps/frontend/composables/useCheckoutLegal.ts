import { ref } from 'vue'
import { useCheckoutService } from '~/services/checkoutService'
import type { CheckoutLegalDoc } from '@barterborsa/shared-types'

export const useCheckoutLegal = (finalAmount: any, addressStore: any, authStore: any, selectedAddressId: any, showNewAddressForm: any, newAddress: any) => {
  const checkoutService = useCheckoutService()
  
  const legalDocs = ref<Record<string, CheckoutLegalDoc>>({})
  const showLegalModal = ref(false)
  const currentLegalDoc = ref({ title: '', content: '' })
  const acceptedAgreements = ref(false)

  const formatDocumentContent = (content: string): string => {
    const selectedAddress = addressStore.addresses.find((a: any) => a.id === selectedAddressId.value)
    const buyerName = (showNewAddressForm.value ? (newAddress.value as any).fullName : selectedAddress?.name) || `${authStore.user?.firstName || ''} ${authStore.user?.lastName || ''}`.trim() || 'ALICI'
    const buyerPhone = (showNewAddressForm.value ? (newAddress.value as any).phone : selectedAddress?.phone) || authStore.user?.phoneNumber || ''
    
    let buyerAddress = ''
    if (showNewAddressForm.value) {
      buyerAddress = [newAddress.value.addressLine, newAddress.value.district, newAddress.value.city].filter(Boolean).join(', ')
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

  const fetchLegalDocs = async () => {
    try {
      const res = await checkoutService.fetchLegalDocuments()
      if (res.success && res.data) {
        res.data.forEach((d: CheckoutLegalDoc) => { legalDocs.value[d.slug] = d })
      }
    } catch (err) { /* Silent */ }
  }

  const openLegalDoc = (slug: string) => {
    const doc = legalDocs.value[slug]
    if (!doc) return
    currentLegalDoc.value = { title: doc.title, content: formatDocumentContent(doc.content) }
    showLegalModal.value = true
  }

  return { legalDocs, showLegalModal, currentLegalDoc, acceptedAgreements, fetchLegalDocs, openLegalDoc }
}
