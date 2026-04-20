import { ref, computed, onMounted } from 'vue'
import { useBarterService } from '~/services/api/BarterService'
import { useCompanyService } from '~/services/api/CompanyService'

export const useTradeChains = () => {
    const barterService = useBarterService()
    const companyService = useCompanyService()
    const authStore = useAuthStore()
    const toast = useNuxtApp().$toast

    const chains = ref<any[]>([])
    const myCompany = ref<any>(null)
    const loading = ref(true)
    const actionLoading = ref(false)
    const isModalOpen = ref(false)
    const selectedChain = ref<any>(null)
    const activeChatId = ref<string | null>(null)
    const showReviewModal = ref(false)
    const selectedOfferForReview = ref<any>(null)

    const fetchMyCompany = async () => {
        try {
            const response = await companyService.getMyCompany() as any
            if (response.success) {
                myCompany.value = response.company
                if (myCompany.value) fetchChains()
            }
        } catch (error) {
            console.error('Fetch company error:', error)
        } finally {
            if (!myCompany.value) loading.value = false
        }
    }

    const fetchChains = async () => {
        loading.value = true
        try {
            const response = await barterService.getMyChains() as any
            if (response.success && response.data) {
                chains.value = response.data
            }
        } catch (error) {
            console.error('Fetch my chains error:', error)
        } finally {
            loading.value = false
        }
    }

    const acceptOffer = async (offerId: string) => {
        if (!confirm('Bu takas teklifini onaylıyor musunuz?')) return
        actionLoading.value = true
        try {
            const response = await barterService.acceptOffer(offerId) as any
            if (response.success) {
                toast.success(response.message)
                await fetchChains()
            }
        } catch (error: any) {
            toast.error('İşlem başarısız: ' + (error.data?.error || error.message))
        } finally {
            actionLoading.value = false
        }
    }

    const rejectOffer = async (offerId: string) => {
        const reason = prompt('Reddetme nedeniniz nedir? (Opsiyonel)')
        if (reason === null) return
        actionLoading.value = true
        try {
            const response = await barterService.rejectOffer(offerId) as any
            if (response.success) {
                toast.info('Teklif reddedildi. Zincir iptal edildi.')
                await fetchChains()
            }
        } catch (error: any) {
            toast.error('İşlem başarısız: ' + (error.data?.error || error.message))
        } finally {
            actionLoading.value = false
        }
    }

    const isMyOffer = (offer: any) => offer.toCompanyId === myCompany.value?.id
    const isMine = (offer: any) => offer.fromCompanyId === myCompany.value?.id

    onMounted(async () => {
        await authStore.init()
        if (authStore.isAuthenticated) {
            fetchMyCompany()
        } else {
            loading.value = false
            navigateTo('/login')
        }
    })

    return {
        chains, myCompany, loading, actionLoading, isModalOpen, selectedChain, activeChatId,
        showReviewModal, selectedOfferForReview,
        fetchChains, acceptOffer, rejectOffer, isMyOffer, isMine
    }
}
