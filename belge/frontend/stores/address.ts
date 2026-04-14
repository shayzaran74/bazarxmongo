import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAddressService } from '~/services/api/AddressService'
import type { Address } from '~/services/api/AddressService'

export const useAddressStore = defineStore('address', () => {
    const addresses = ref<Address[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const addressService = useAddressService()

    const fetchAddresses = async () => {
        loading.value = true
        try {
            const response = await addressService.getAddresses()
            if (response.success) {
                addresses.value = response.addresses || []
            }
        } catch (err: unknown) {
            console.error('Fetch addresses error:', err)
            const errorData = err as { data?: { error?: string } }
            error.value = errorData.data?.error || 'Adresler yüklenirken bir hata oluştu'
        } finally {
            loading.value = false
        }
    }

    const addAddress = async (data: Partial<Address>) => {
        loading.value = true
        try {
            const response = await addressService.createAddress(data as Record<string, unknown>)
            if (response.success) {
                await fetchAddresses()
                return { success: true, address: response.address }
            }
            return { success: false, error: response.error || 'Adres eklenirken bir hata oluştu' }
        } catch (err: unknown) {
            console.error('Add address error:', err)
            const errorData = err as { data?: { error?: string } }
            return { success: false, error: errorData.data?.error || 'Adres eklenirken bir hata oluştu' }
        } finally {
            loading.value = false
        }
    }

    const updateAddress = async (id: string, data: Partial<Address>) => {
        loading.value = true
        try {
            const response = await addressService.updateAddress(id, data as Record<string, unknown>)
            if (response.success) {
                await fetchAddresses()
                return { success: true, address: response.address }
            }
            return { success: false, error: response.error || 'Adres güncellenirken bir hata oluştu' }
        } catch (err: unknown) {
            console.error('Update address error:', err)
            const errorData = err as { data?: { error?: string } }
            return { success: false, error: errorData.data?.error || 'Adres güncellenirken bir hata oluştu' }
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
            const errorData = err as { data?: { error?: string } }
            return { success: false, error: errorData.data?.error || 'Adres silinirken bir hata oluştu' }
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
