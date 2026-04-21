import { ref, onMounted } from 'vue'
import { useAuthStore, useApi, useNuxtApp, useRuntimeConfig, navigateTo } from '#imports'

export const useVendorApplication = () => {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()
  const { $api } = useApi()
  const { $toast: toast } = useNuxtApp()

  const loading = ref(false)
  const currentStep = ref(1)
  const totalSteps = 3
  const categories = ref<any[]>([])
  const announcements = ref<any[]>([])

  const formData = ref({
    businessName: '',
    businessRegistration: '',
    taxId: '',
    tckn: '',
    vergiNo: '',
    mersisNo: '',
    businessType: '',
    phone: '',
    whatsapp: '',
    email: authStore.user?.email || '',
    website: '',
    address: '',
    city: '',
    district: '',
    country: 'Türkiye',
    zipCode: '',
    bankName: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankIban: '',
    categories: [] as string[]
  })

  const fetchAnnouncements = async () => {
    try {
      const response = await $api<any>('/api/dynamic/announcements?page=vendor_app')
      if (response.success) announcements.value = response.data
    } catch (error) {
      console.error('Announcements fetch error:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await $api<any>('/api/categories')
      if (response.success) categories.value = response.data
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error)
    }
  }

  const nextStep = () => {
    if (currentStep.value < totalSteps) currentStep.value++
  }

  const prevStep = () => {
    if (currentStep.value > 1) currentStep.value--
  }

  const submitApplication = async () => {
    loading.value = true
    try {
      const response = await $api<any>('/api/vendors/register', {
        method: 'POST',
        body: formData.value
      })

      if (response.success) {
        toast.success('Başvurunuz alındı! Admin onayı bekleniyor.')
        await navigateTo('/')
      }
    } catch (error: any) {
      console.error('Başvuru hatası:', error)
      toast.error(error.data?.error || 'Başvuru gönderilirken bir hata oluştu')
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchCategories()
    fetchAnnouncements()
  })

  return {
    loading, currentStep, totalSteps, categories, announcements, formData, config,
    nextStep, prevStep, submitApplication
  }
}
