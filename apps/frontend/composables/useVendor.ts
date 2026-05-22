// apps/frontend/composables/useVendor.ts
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

export type VendorType = 'COMMERCE' | 'RESTAURANT' | 'MARKET' | 'SERVICE' | ''

export const useVendor = () => {
  const authStore = useAuthStore()

  const vendor = computed(() => authStore.user?.vendor || null)
  const vendorType = computed<VendorType>(() => (vendor.value as { vendorType?: VendorType })?.vendorType || '')
  const isRestaurant = computed(() => vendorType.value === 'RESTAURANT')
  const isMarket = computed(() => vendorType.value === 'MARKET')
  const isCommerce = computed(() => vendorType.value === 'COMMERCE')
  const isService = computed(() => vendorType.value === 'SERVICE')

  return {
    vendor,
    vendorType,
    isRestaurant,
    isMarket,
    isCommerce,
    isService,
  }
}

export const useVendorType = () => {
  const { vendorType } = useVendor()
  return vendorType
}