export const useVendorBrands = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  const brands = ref<any[]>([])
  const loading = ref(false)
  const showWizard = ref(false)
  const selectedBrand = ref<any>(null)

  const stats = reactive({ total: 0, approved: 0, pending: 0 })

  const fetchBrands = async () => {
    loading.value = true
    try {
      const res = await $api<any>(
        '/api/vendor-brands'
      )
      brands.value = res.data || []
      stats.total = brands.value.length
      stats.approved = brands.value.filter((b: any) => b.status === 'APPROVED').length
      stats.pending = brands.value.filter((b: any) => b.status === 'PENDING').length
    } catch { /* ignore */ } finally {
      loading.value = false
    }
  }

  const applyBrand = async (data: any) => {
    try {
      await $api('/api/vendor-brands/apply', {
        method: 'POST',
        body: data
      })
      $toast.success('Marka başvurusu gönderildi')
      showWizard.value = false
      fetchBrands()
    } catch {
      $toast.error('Başvuru gönderilemedi')
    }
  }

  return {
    brands, loading, showWizard, selectedBrand, stats,
    fetchBrands, applyBrand,
  }
}
