import { useApi } from '~/services/api'
export const useTierService = () => {
  const { $api } = useApi()
  return {
    async getUserTier() {
      return await $api('/api/tiers/me')
    },
    async getUserProgress() {
      return await $api('/api/tiers/progress')
    },
    async getVendorTier() {
      return await $api('/api/tiers/vendor')
    },
    async getVendorProgress() {
      return await $api('/api/tiers/vendor/progress')
    }
  }
}
