import { ref, computed } from 'vue'

export const useTradeOffers = () => {
    const { $api } = useApi()
    const { $toast: toast } = useNuxtApp()
    const authStore = useAuthStore()

    const loading = ref(false)
    const offers = ref<any[]>([])
    const activeTab = ref('received')
    const myCompany = ref<any>(null)
    const updatingStatus = ref<string | number | null>(null)

    const fetchMyOffers = async () => {
        loading.value = true
        try {
            if (!myCompany.value) {
                const compRes: any = await $api('/api/v1/companies/me')
                if (compRes.success) myCompany.value = compRes.company
            }

            if (myCompany.value) {
                const response: any = await $api('/api/v1/offers/my', {
                    query: {
                        companyId: myCompany.value.id,
                        type: activeTab.value
                    }
                })
                if (response.success) {
                    offers.value = response.offers
                }
            }
        } catch (error) {
            console.error('Fetch offers error:', error)
        } finally {
            loading.value = false
        }
    }

    const updateStatus = async (id: string | number, status: string) => {
        const s = status.toUpperCase()
        updatingStatus.value = id
        try {
            const endpoint = s === 'ACCEPTED' ? `/api/v1/offers/${id}/accept` : `/api/v1/offers/${id}/status`
            const body = s === 'ACCEPTED' ? {} : { status: s }

            const response: any = await $api(endpoint, {
                method: 'PATCH',
                body
            })

            if (response.success) {
                toast.success(s === 'ACCEPTED' ? 'Teklif kabul edildi!' : 'Teklif reddedildi.')
                fetchMyOffers()
                return true
            } else {
                toast.error(response.message || 'Bir hata oluştu.')
                return false
            }
        } catch (error: any) {
            toast.error(error.data?.message || 'İşlem sırasında bir hata oluştu.')
            return false
        } finally {
            updatingStatus.value = null
        }
    }

    return {
        loading,
        offers,
        activeTab,
        myCompany,
        updatingStatus,
        fetchMyOffers,
        updateStatus
    }
}
