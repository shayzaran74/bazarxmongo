import { ref } from 'vue'

export const useImportTemplate = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Belirtilen şablon tipine göre dosyayı backend'den indirir ve tarayıcıda otomatik kaydeder.
   */
  const downloadTemplate = async (type: 'vendor-excel' | 'admin-excel' | 'trendyol-json') => {
    loading.value = true
    error.value = null

    try {
      const authStore = useAuthStore()
      const token = authStore.token || useCookie('access_token').value

      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      // responseType: 'blob' sayesinde binary/json çıktıyı güvenle alırız
      const response = await $fetch<Blob>(`/api/v1/vendors/products/templates/${type}`, {
        method: 'GET',
        headers,
        responseType: 'blob',
      })

      // Dosya adını belirle
      let filename = 'urun_sablonu'
      if (type === 'vendor-excel') filename = 'vendor_urun_sablonu.xlsx'
      else if (type === 'admin-excel') filename = 'admin_urun_sablonu.xlsx'
      else if (type === 'trendyol-json') filename = 'trendyol_import_sablonu.json'

      // Tarayıcı indirme tetikleme (Anchor click trick)
      const blobUrl = window.URL.createObjectURL(response)
      const link = document.createElement('a')
      link.href = blobUrl
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Şablon dosyası indirilemedi.'
      const { $toast } = useNuxtApp() as any
      if ($toast) {
        $toast.error(error.value)
      }
    } finally {
      loading.value = false
    }
  }

  return {
    downloadTemplate,
    loading,
    error,
  }
}
