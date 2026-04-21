import { ref, computed } from 'vue'
import { useAddressStore } from '~/stores/address'
import type { CheckoutNewAddress } from '@barterborsa/shared-types'

export const useCheckoutAddress = () => {
  const addressStore = useAddressStore()
  
  const selectedAddressId = ref<string | number | null>(null)
  const showNewAddressForm = ref(false)
  const saveNewAddress = ref(true)
  const newAddress = ref<CheckoutNewAddress>({
    title: '', fullName: '', phone: '', addressLine: '', city: '', district: ''
  })

  const isAddressReady = computed(() => {
    if (selectedAddressId.value && !showNewAddressForm.value) return true
    return !!(newAddress.value.fullName && newAddress.value.phone && newAddress.value.addressLine && newAddress.value.city && newAddress.value.district)
  })

  const getDefaultAddress = () => {
    if (addressStore.addresses.length > 0) {
      selectedAddressId.value = (addressStore.addresses.find(a => a.isDefault) || addressStore.addresses[0]).id
      showNewAddressForm.value = false
    } else {
      showNewAddressForm.value = true
    }
  }

  return {
    selectedAddressId, showNewAddressForm, saveNewAddress, newAddress, isAddressReady, getDefaultAddress
  }
}
