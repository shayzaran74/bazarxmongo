import { ref, computed, onMounted } from 'vue'
import { useBarterService } from '~/services/api/BarterService'
import { useCompanyService } from '~/services/api/CompanyService'

export const useTradeChains = () => {
    const barterService = useBarterService()
    const companyService = useCompanyService()
    const authStore = useAuthStore()
    const toast = useNuxtApp().$toast

    const chains = ref<Record<string, unknown>[]>([])
    const myCompany = ref<Record<string, unknown> | null>(null)
    const loading = ref(true)
    const actionLoading = ref(false)
    const isModalOpen = ref(false)
    const selectedChain = ref<Record<string, unknown> | null>(null)
    const activeChatId = ref<string | null>(null)
    const showReviewModal = ref(false)
    const selectedOfferForReview = ref<Record<string, unknown> | null>(null)

    const fetchMyCompany = async () => {
        try {
            const response = await companyService.getMyCompany() as { success: boolean; company?: Record<string, unknown> }
            if (response.success) {
                myCompany.value = response.company || null
                if (myCompany.value) fetchChains()
            }
        } catch {
            /* sessiz hata */
        } finally {
            if (!myCompany.value) loading.value = false
        }
    }

    const fetchChains = async () => {
        loading.value = true
        try {
            const response = await barterService.getMyChains() as { success: boolean; data?: Record<string, unknown>[] }
            if (response.success && response.data) {
                chains.value = response.data
            }
        } catch {
            /* sessiz hata */
        } finally {
            loading.value = false
        }
    }

    const acceptOffer = async (offerId: string) => {
        actionLoading.value = true
        try {
            const response = await barterService.acceptOffer(offerId) as { success: boolean; message?: string }
            if (response.success) {
                toast.success(response.message || 'Teklif onaylandı')
                await fetchChains()
            }
        } catch (error: unknown) {
            toast.error('İşlem başarısız: ' + (error as { data?: { error?: string }; message?: string }).data?.error || (error as Error).message)
        } finally {
            actionLoading.value = false
        }
    }

    const rejectOffer = async (offerId: string) => {
        const reason = prompt('Reddetme nedeniniz nedir? (Opsiyonel)')
        if (reason === null) return
        actionLoading.value = true
        try {
            const response = await barterService.rejectOffer(offerId) as { success: boolean }
            if (response.success) {
                toast.info('Teklif reddedildi. Zincir iptal edildi.')
                await fetchChains()
            }
        } catch (error: unknown) {
            toast.error('İşlem başarısız: ' + (error as { data?: { error?: string }; message?: string }).data?.error || (error as Error).message)
        } finally {
            actionLoading.value = false
        }
    }

    const isMyOffer = (offer: Record<string, unknown>) => offer.toCompanyId === myCompany.value?.id
    const isMine = (offer: Record<string, unknown>) => offer.fromCompanyId === myCompany.value?.id

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
