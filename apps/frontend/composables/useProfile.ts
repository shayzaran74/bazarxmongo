export const useProfile = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any
  const authStore = useAuthStore()

  const profile = ref<any>(null)
  const loading = ref(false)
  const activeTab = ref('info')

  const fetchProfile = async () => {
    loading.value = true
    try {
      const res = await $api<{ success: boolean; data: any }>(
        '/api/identity/profile'
      )
      if (res.success) profile.value = res.data
    } catch { /* ignore */ } finally {
      loading.value = false
    }
  }

  const updateProfile = async (data: any) => {
    try {
      await $api('/api/identity/profile', {
        method: 'POST',
        body: data
      })
      $toast.success('Profil güncellendi')
      await fetchProfile()
      await authStore.fetchUser()
    } catch {
      $toast.error('Güncellenemedi')
    }
  }

  const changePassword = async (data: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }) => {
    try {
      await $api('/api/identity/profile/change-password', {
        method: 'POST',
        body: data
      })
      $toast.success('Şifre değiştirildi')
    } catch (e: any) {
      $toast.error(e?.data?.message || 'Şifre değiştirilemedi')
    }
  }

  onMounted(fetchProfile)

  return {
    profile, loading, activeTab,
    fetchProfile, updateProfile, changePassword,
  }
}
