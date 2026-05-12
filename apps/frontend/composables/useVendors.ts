import { ref } from 'vue'

export const useVendors = () => {
  const { $api } = useApi()
  const vendors = ref<any[]>([])
  const loading = ref(false)

  const fetchVendors = async (params: Record<string, any> = {}) => {
    loading.value = true
    try {
      const res = await $api<any>('/api/v1/vendors', { params })
      vendors.value = res.data?.items || []
      return res.data
    } catch (err) {
      console.error('Vendors fetch error:', err)
      return { items: [], total: 0 }
    } finally {
      loading.value = false
    }
  }

  return {
    vendors,
    loading,
    fetchVendors
  }
}
