export const useAdminContent = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  const announcements = ref<any[]>([])
  const policies = ref<any[]>([])
  const dynamicContents = ref<any[]>([])
  const loading = ref(false)

  const fetchAnnouncements = async () => {
    try {
      const res = await $api<any>('/api/admin/announcements')
      announcements.value = res.data || []
    } catch { /* ignore */ }
  }

  const fetchPolicies = async () => {
    try {
      const res = await $api<any>('/api/admin/policies')
      policies.value = res.data || []
    } catch { /* ignore */ }
  }

  const saveAnnouncement = async (data: any) => {
    try {
      if (data.id) {
        await $api(`/api/admin/announcements/${data.id}`, {
          method: 'PUT', body: data
        })
      } else {
        await $api('/api/admin/announcements', {
          method: 'POST', body: data
        })
      }
      $toast.success('Duyuru kaydedildi')
      fetchAnnouncements()
    } catch {
      $toast.error('Kaydedilemedi')
    }
  }

  const savePolicy = async (data: any) => {
    try {
      if (data.id) {
        await $api(`/api/admin/policies/${data.id}`, {
          method: 'PUT', body: data
        })
      } else {
        await $api('/api/admin/policies', {
          method: 'POST', body: data
        })
      }
      $toast.success('Politika kaydedildi')
      fetchPolicies()
    } catch {
      $toast.error('Kaydedilemedi')
    }
  }

  const init = async () => {
    loading.value = true
    await Promise.all([fetchAnnouncements(), fetchPolicies()])
    loading.value = false
  }

  return {
    announcements, policies, dynamicContents, loading,
    fetchAnnouncements, fetchPolicies,
    saveAnnouncement, savePolicy, init,
  }
}
