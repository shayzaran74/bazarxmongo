export const useVendorApplication = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any
  const authStore = useAuthStore()

  const currentStep = ref(0)
  const loading = ref(false)
  const isApexPlus = ref(true)
  const applicationStatus = ref<string | null>(null)

  const formData = reactive({
    businessName: '',
    businessType: '',
    taxId: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    zipCode: '',
    bankName: '',
    bankAccountName: '',
    bankIban: '',
    categories: [] as string[],
  })

  const checkExistingApplication = async () => {
    try {
      const res = await $api<{ success: boolean; data: any }>(
        '/api/vendors/profile/me'
      )
      if (res.success && res.data) {
        applicationStatus.value = (res.data as any).status || null
      }
    } catch { /* ignore */ }
  }

  const submitApplication = async () => {
    loading.value = true
    try {
      const res = await $api<{ success: boolean; error?: string }>(
        '/api/vendors/apply-atomic',
        { method: 'POST', body: { ...formData } }
      )
      if (res.success) {
        $toast.success('Başvurunuz alındı!')
        applicationStatus.value = 'PENDING'
        await authStore.fetchUser()
        return { success: true }
      }
      $toast.error(res.error || 'Başvuru gönderilemedi')
      return { success: false }
    } catch (e: any) {
      $toast.error(e?.data?.message || 'Başvuru gönderilemedi')
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const nextStep = () => { currentStep.value++ }
  const prevStep = () => { currentStep.value-- }

  onMounted(checkExistingApplication)

  return {
    currentStep, loading, isApexPlus, applicationStatus, formData,
    nextStep, prevStep, submitApplication,
  }
}
