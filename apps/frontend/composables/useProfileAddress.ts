import { ref } from 'vue'
import { useAddressStore } from '~/stores/address'
import { useNuxtApp } from '#imports'
import { useI18n } from 'vue-i18n'
import type { Address } from '@barterborsa/shared-types'

export const useProfileAddress = () => {
  const addressStore = useAddressStore()
  const { t } = useI18n()
  const { $toast: toast } = useNuxtApp()

  const showAddressModal = ref(false)
  const isEditingAddress = ref(false)
  const addressForm = ref<Address>({ 
    id: '', userId: '', name: '', city: '', district: '', address: '', isDefault: false 
  })

  const openAddressModal = (address: Address | null = null) => {
    if (address) {
      isEditingAddress.value = true
      addressForm.value = { ...address }
    } else {
      isEditingAddress.value = false
      addressForm.value = { id: '', userId: '', name: '', city: '', district: '', address: '', isDefault: false }
    }
    showAddressModal.value = true
  }

  const saveAddress = async () => {
    const res = isEditingAddress.value
      ? await addressStore.updateAddress(String(addressForm.value.id), addressForm.value as any)
      : await addressStore.addAddress(addressForm.value as any)
    
    if (res?.success) {
      toast.success(isEditingAddress.value ? t('profile.addressUpdatedSuccess') : t('profile.addressAddedSuccess'))
      showAddressModal.value = false
    } else {
      toast.error(res?.error || t('common.error'))
    }
  }

  const deleteAddress = async (id: string) => {
    if (!confirm(t('profile.deleteConfirm'))) return
    const res = await addressStore.deleteAddress(id)
    if (res?.success) toast.success(t('profile.addressDeletedSuccess'))
  }

  return { showAddressModal, isEditingAddress, addressForm, openAddressModal, saveAddress, deleteAddress }
}
