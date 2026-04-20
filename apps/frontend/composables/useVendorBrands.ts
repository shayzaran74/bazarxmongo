import { ref, computed, onMounted } from 'vue'

export const useVendorBrands = () => {
  const { $api } = useApi()
  const toast = useNuxtApp().$toast
  const { resolveImageUrl } = useAppImage()

  const brands = ref<any[]>([])
  const loading = ref(false)
  const submitting = ref(false)
  const showWizard = ref(false)
  const currentStep = ref(1)

  const brandStats = ref({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  })

  const form = ref({
    brandName: '',
    applicationType: 'OWNER',
    trademarkNumber: '',
    documentUrl: '',
    invoiceChainUrl: '',
    authorizationUrl: '',
    notes: ''
  })

  const fetchBrands = async () => {
    loading.value = true
    try {
      const response: any = await $api('/api/vendor/brands')
      if (response.success) {
        brands.value = response.data || []
        updateStats()
      }
    } catch (e) {
      console.error('Fetch brands error:', e)
    } finally {
      loading.value = false
    }
  }

  const updateStats = () => {
    brandStats.value = {
      total: brands.value.length,
      approved: brands.value.filter((b: any) => b.status === 'APPROVED').length,
      pending: brands.value.filter((b: any) => b.status === 'PENDING').length,
      rejected: brands.value.filter((b: any) => b.status === 'REJECTED').length
    }
  }

  const handleFileUpload = async (event: any, field: string) => {
    const file = event.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      toast.info('Belge yükleniyor...')
      const response: any = await $api('/api/upload?type=brand_doc', {
        method: 'POST',
        body: formData
      })
      if (response.success) {
        (form.value as any)[field] = response.url
        toast.success('Belge başarıyla yüklendi')
      }
    } catch (e) {
      toast.error('Yükleme sırasında hata oluştu')
    }
  }

  const submitApplication = async () => {
    submitting.value = true
    try {
      const response = await $api('/api/vendor/brands/apply', {
        method: 'POST',
        body: form.value
      })
      if (response.success) {
        toast.success('Başvurunuz başarıyla alındı')
        showWizard.value = false
        fetchBrands()
        resetForm()
      }
    } catch (e) {
      toast.error('Başvuru sırasında bir hata oluştu')
    } finally {
      submitting.value = false
    }
  }

  const resetForm = () => {
    form.value = {
      brandName: '',
      applicationType: 'OWNER',
      trademarkNumber: '',
      documentUrl: '',
      invoiceChainUrl: '',
      authorizationUrl: '',
      notes: ''
    }
    currentStep.value = 1
  }

  const canProceed = computed(() => {
    if (currentStep.value === 1) return form.value.brandName.length >= 2
    if (currentStep.value === 2) return !!form.value.applicationType
    if (currentStep.value === 3) {
      if (form.value.applicationType === 'OWNER') return !!form.value.documentUrl
      if (form.value.applicationType === 'AUTHORIZED_SELLER') return !!form.value.invoiceChainUrl
      if (form.value.applicationType === 'DISTRIBUTOR') return !!form.value.authorizationUrl
    }
    return true
  })

  const nextStep = () => {
    if (canProceed.value && currentStep.value < 4) {
      currentStep.value++
    }
  }

  const prevStep = () => {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }

  return {
    brands, loading, submitting, brandStats, showWizard, currentStep, form,
    fetchBrands, handleFileUpload, submitApplication, resetForm,
    canProceed, nextStep, prevStep, resolveImageUrl
  }
}
