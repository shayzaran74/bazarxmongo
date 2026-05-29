import { ref, computed, onMounted } from 'vue'

export const useVendorRegistration = () => {
    const { $api } = useApi()
    const { $toast: toast } = useNuxtApp()
    const authStore = useAuthStore()
    const nuxtApp = useNuxtApp()

    const currentStep = ref(1)
    const loading = ref(false)
    const activeDoc = ref<string | null>(null)
    const categories = ref<any[]>([])
    const legalDocs = ref<any[]>([])
    const announcements = ref<any[]>([])

    const form = ref<any>({
        businessName: '',
        businessType: '',
        businessRegistration: '',
        taxId: '',
        phone: '',
        email: authStore.user?.email || '',
        address: '',
        city: '',
        district: '',
        zipCode: '',
        bankName: '',
        bankAccountName: '',
        bankIban: '',
        categories: [],
        agreeTerms: false,
        agreeMarketing: false
    })

    const vendorStatus = computed(() => authStore.user?.vendor?.status)

    const fetchAnnouncements = async () => {
        try {
            const response: any = await $api('/api/v1/dynamic/announcements?page=vendor_app')
            if (response.success) announcements.value = response.data
        } catch (error) {
            console.error('Announcements error:', error)
        }
    }

    const fetchCategories = async () => {
        try {
            const response: any = await $api('/api/v1/categories')
            if (response.success) categories.value = response.data
        } catch (error) {
            console.error('Categories error:', error)
        }
    }

    const fetchLegalDocs = async () => {
        try {
            const response: any = await $api('/api/v1/legal')
            if (response.success) legalDocs.value = response.data || []
        } catch (error) {
            console.error('Legal docs error:', error)
        }
    }

    const nextStep = () => {
        if (currentStep.value === 2 && (!form.value.businessName || !form.value.businessType)) {
            toast.warning('Lütfen zorunlu alanları doldurun')
            return
        }
        if (currentStep.value === 3 && (!form.value.phone || !form.value.email || !form.value.address)) {
            toast.warning('İletişim ve adres bilgileri zorunludur')
            return
        }
        if (currentStep.value === 4 && (!form.value.bankIban || form.value.categories.length === 0)) {
            toast.warning('IBAN ve en az bir kategori seçmelisiniz')
            return
        }
        if (currentStep.value === 5 && !form.value.agreeTerms) {
            toast.warning('Devam etmek için şartları kabul etmelisiniz')
            return
        }
        currentStep.value++
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const submitForm = async () => {
        loading.value = true
        try {
            const response: any = await $api('/api/v1/vendors/apply-atomic', {
                method: 'POST',
                body: form.value
            })

            if (response.success) {
                toast.success('✅ Başvurunuz başarıyla alındı! Onay bekleniyor.')
                await authStore.fetchUser(true)
                currentStep.value = 6
            } else {
                toast.error(response.error || 'Başvuru sırasında hata oluştu')
            }
        } catch (error: any) {
            toast.error(error.data?.error || error.data?.message || 'Bir hata oluştu')
        } finally {
            loading.value = false
        }
    }

    return {
        currentStep, loading, activeDoc, categories, legalDocs, announcements, form, vendorStatus,
        fetchAnnouncements, fetchCategories, fetchLegalDocs, nextStep, submitForm
    }
}
