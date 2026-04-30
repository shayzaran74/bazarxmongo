export const useVendorBrands = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  const brands = ref<any[]>([])
  const loading = ref(false)
  const showWizard = ref(false)
  const selectedBrand = ref<any>(null)

  const brandStats = reactive({ total: 0, approved: 0, pending: 0, rejected: 0 })
  const submitting = ref(false)
  const currentStep = ref(1)
  const form = ref<Record<string, any>>({
    brandName: '',
    applicationType: 'OWNER',
    documentUrl: '',
    invoiceChainUrl: '',
    authorizationUrl: '',
    notes: ''
  })

  const fetchBrands = async () => {
    loading.value = true
    try {
      const res = await $api<any>('/api/vendor-brands')
      brands.value = res.data || []
      brandStats.total = brands.value.length
      brandStats.approved = brands.value.filter((b: any) => b.status === 'APPROVED').length
      brandStats.pending = brands.value.filter((b: any) => b.status === 'PENDING').length
      brandStats.rejected = brands.value.filter((b: any) => b.status === 'REJECTED').length
    } catch { /* ignore */ } finally {
      loading.value = false
    }
  }

  const resetForm = () => {
    form.value = { brandName: '', applicationType: 'OWNER', documentUrl: '', invoiceChainUrl: '', authorizationUrl: '', notes: '' }
    currentStep.value = 1
  }

  const handleFileUpload = (event: any, field: string) => {
    // Basic mock for UI:
    if (event.target.files && event.target.files.length > 0) {
      form.value[field] = URL.createObjectURL(event.target.files[0])
      $toast.success('Dosya seçildi.')
    }
  }

  const canProceed = computed(() => {
    if (currentStep.value === 1) return !!form.value.brandName
    if (currentStep.value === 2) return !!form.value.applicationType
    if (currentStep.value === 3) {
      if (form.value.applicationType === 'OWNER') return !!form.value.documentUrl
      if (form.value.applicationType === 'AUTHORIZED_SELLER') return !!form.value.invoiceChainUrl
      return !!form.value.authorizationUrl
    }
    return true
  })

  const nextStep = () => { if (currentStep.value < 4) currentStep.value++ }
  const prevStep = () => { if (currentStep.value > 1) currentStep.value-- }
  const resolveImageUrl = (url: string) => url || '/images/no-brand.png'

  const submitApplication = async () => {
    submitting.value = true
    try {
      await $api('/api/v1/vendor-brands/apply', {
        method: 'POST',
        body: {
          ...form.value,
          name: form.value.brandName
        }
      })
      $toast.success('Marka başvurusu gönderildi')
      showWizard.value = false
      resetForm()
      fetchBrands()
    } catch {
      $toast.error('Başvuru gönderilemedi')
    } finally {
      submitting.value = false
    }
  }

  return {
    brands, loading, showWizard, selectedBrand, brandStats, submitting, currentStep, form,
    fetchBrands, handleFileUpload, submitApplication, resetForm, canProceed, nextStep, prevStep, resolveImageUrl
  }
}
