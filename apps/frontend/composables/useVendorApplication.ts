export const useVendorApplication = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp()
  const authStore = useAuthStore()

  const currentStep = ref(0)
  const totalSteps = ref(4) // 0: Vendor Type, 1: Business Info, 2: Contact, 3: Bank & Categories
  const loading = ref(false)
  const isApexPlus = ref(true)
  const applicationStatus = ref<string | null>(null)

  const formData = reactive({
    vendorType: '' as '' | 'COMMERCE' | 'RESTAURANT' | 'MARKET' | 'SERVICE',
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
    // Restaurant-specific fields
    cuisineType: '',
    deliveryRadius: null as number | null,
    minOrderAmount: null as number | null,
    openingHours: null as Record<string, unknown> | null,
  })

  const categories = ref<Record<string, unknown>[]>([])
  const announcements = ref<Record<string, unknown>[]>([])

  const checkExistingApplication = async () => {
    try {
      const res = await $api<{ success: boolean; data: Record<string, unknown> }>(
        '/api/v1/vendors/profile/me'
      )
      if (res.success && res.data) {
        applicationStatus.value = res.data.status as string || null
      }
    } catch { /* ignore */ }
  }

  const fetchCategories = async () => {
    try {
      const res = await $api<{ success: boolean; data: Record<string, unknown>[] }>(
        '/api/v1/categories?type=PRODUCT'
      )
      if (res.success) {
        categories.value = res.data || []
      }
    } catch { /* ignore */ }
  }

  const submitApplication = async () => {
    loading.value = true
    try {
      const res = await $api<{ success: boolean; error?: string }>(
        '/api/v1/vendors/apply-atomic',
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
    } catch (e: unknown) {
      $toast.error((e as { data?: { message?: string } }).data?.message || 'Başvuru gönderilemedi')
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const nextStep = () => { currentStep.value++ }
  const prevStep = () => { currentStep.value-- }

  onMounted(async () => {
    await checkExistingApplication()
    await fetchCategories()
  })

  return {
    currentStep,
    totalSteps,
    loading,
    isApexPlus,
    applicationStatus,
    formData,
    categories,
    announcements,
    nextStep,
    prevStep,
    submitApplication,
  }
}
