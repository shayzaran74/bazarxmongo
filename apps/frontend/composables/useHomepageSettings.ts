export const useHomepageSettings = () => {
  const { $api } = useApi()

  const settings = ref<any>({})
  const loading = ref(false)

  const fetchSettings = async () => {
    loading.value = true
    try {
      const res = await $api<{ success: boolean; data: any }>(
        '/api/v1/admin/settings/homepage'
      )
      settings.value = res.data || {}
    } catch { /* ignore */ } finally {
      loading.value = false
    }
  }

  const saveSettings = async (data: any) => {
    const { $toast } = useNuxtApp() as any
    try {
      await $api('/api/v1/admin/settings/homepage', {
        method: 'PUT',
        body: data
      })
      $toast.success('Ayarlar kaydedildi')
      fetchSettings()
    } catch {
      $toast.error('Kaydedilemedi')
    }
  }

  return { settings, loading, fetchSettings, saveSettings }
}
