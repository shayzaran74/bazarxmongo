import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAddressService } from '~/services/api/AddressService'
import type { Address } from '@barterborsa/shared-types'

export const useAddressStore = defineStore('address', () => {
    const addresses = ref<Address[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const addressService = useAddressService()

    const fetchAddresses = async () => {
        loading.value = true
        try {
            const response = await addressService.getAddresses()
            if (response.success && response.data) {
                // Backend returns list of addresses in .data
                addresses.value = response.data || []
            }
        } catch (err: unknown) {
            console.error('Fetch addresses error:', err)
            error.value = 'Adresler yüklenirken bir hata oluştu'
        } finally {
            loading.value = false
        }
    }

    const addAddress = async (data: Address) => {
        loading.value = true
        try {
            const response = await addressService.createAddress(data)
            if (response.success) {
                await fetchAddresses()
                return { success: true }
            }
            return { success: false, error: response.error || 'Adres eklenirken bir hata oluştu' }
        } catch (err: unknown) {
            console.error('Add address error:', err)
            return { success: false, error: 'Adres eklenirken bir hata oluştu' }
        } finally {
            loading.value = false
        }
    }

    const updateAddress = async (id: string, data: Address) => {
        loading.value = true
        try {
            const response = await addressService.updateAddress(id, data)
            if (response.success) {
                await fetchAddresses()
                return { success: true }
            }
            return { success: false, error: response.error || 'Adres güncellenirken bir hata oluştu' }
        } catch (err: unknown) {
            console.error('Update address error:', err)
            return { success: false, error: 'Adres güncellenirken bir hata oluştu' }
        } finally {
            loading.value = false
        }
    }

    const deleteAddress = async (id: string) => {
        loading.value = true
        try {
            const response = await addressService.deleteAddress(id)
            if (response.success) {
                await fetchAddresses()
                return { success: true }
            }
            return { success: false, error: response.error || 'Adres silinirken bir hata oluştu' }
        } catch (err: unknown) {
            console.error('Delete address error:', err)
            return { success: false, error: 'Adres silinirken bir hata oluştu' }
        } finally {
            loading.value = false
        }
    }

    return {
        addresses,
        loading,
        error,
        fetchAddresses,
        addAddress,
        updateAddress,
        deleteAddress
    }
})
