import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export const useSurplus = () => {
    const { $api } = useApi()
    const { $toast: toast } = useNuxtApp()
    const authStore = useAuthStore()
    const router = useRouter()

    const items = ref<any[]>([])
    const offers = ref<any[]>([])
    const myChains = ref<any[]>([])
    const myCompany = ref<any>(null)
    const activeTab = ref('listings')
    const loading = ref(true)
    const showCreateModal = ref(false)
    const showCompanyModal = ref(false)
    const isTradeModalOpen = ref(false)
    const selectedItem = ref<any>(null)
    const selectedChain = ref<any>(null)

    const fetchMyCompany = async () => {
        try {
            const response: any = await $api('/api/companies/me')
            if (response.success) {
                myCompany.value = response.company
                if (myCompany.value) fetchItems()
            }
        } catch (error) {
            console.error('Fetch company error:', error)
        } finally {
            loading.value = false
        }
    }

    const fetchItems = async () => {
        if (!myCompany.value) return
        try {
            const [itemsRes, chainsRes]: [any, any] = await Promise.all([
                $api('/api/surplus', {
                    query: { companyId: myCompany.value.id, status: 'all' }
                }),
                $api('/api/barter/my-chains')
            ])

            if (itemsRes.success) items.value = itemsRes.items
            if (chainsRes.data) myChains.value = chainsRes.data
        } catch (error) {
            console.error('Fetch my items/chains error:', error)
        }
    }

    const fetchOffers = async () => {
        if (!myCompany.value) return
        loading.value = true
        try {
            const response: any = await $api('/api/offers/my', {
                query: {
                    companyId: myCompany.value.id,
                    type: activeTab.value
                }
            })
            if (response.success) offers.value = response.offers
        } catch (error) {
            console.error('Fetch offers error:', error)
        } finally {
            loading.value = false
        }
    }

    const deleteItem = async (id: string) => {
        if (!confirm('Bu ilanı silmek istediğinize emin misiniz?')) return
        try {
            const response: any = await $api(`/api/surplus/${id}`, { method: 'DELETE' })
            if (response.success) {
                toast.success('İlan silindi.')
                items.value = items.value.filter(i => i.id !== id)
            }
        } catch (error) {
            toast.error('İlan silinirken bir hata oluştu.')
        }
    }

    const reactivateItem = async (item: any) => {
        const qty = prompt(`${item.title} için yeni miktar giriniz (${item.unit}):`, item.quantity)
        if (qty === null) return
        const quantity = parseFloat(qty)
        if (isNaN(quantity) || quantity <= 0) {
            toast.error('Lütfen geçerli bir miktar giriniz.')
            return
        }
        try {
            const response: any = await $api(`/api/surplus/${item.id}/reactivate`, {
                method: 'PATCH',
                body: { quantity }
            })
            if (response.success) {
                toast.success('İlan başarıyla yeniden aktif edildi.')
                fetchItems()
            }
        } catch (error: any) {
            toast.error(error.data?.error || 'İşlem başarısız.')
        }
    }

    const acceptOffer = async (id: string) => {
        const isConfirmed = confirm("Bu teklifi kabul ettiğinizde takas süreci başlayacaktır. Devam etmek istiyor musunuz?")
        if (!isConfirmed) return
        try {
            const response: any = await $api(`/api/offers/${id}/accept`, { method: 'PATCH' })
            if (response.success) {
                toast.success('Teklif kabul edildi.')
                await Promise.all([fetchOffers(), fetchItems()])
            }
        } catch (error: any) {
            toast.error(error.data?.message || 'İşlem başarısız.')
        }
    }

    const rejectOffer = async (id: string) => {
        if (!confirm('Bu teklifi reddetmek istediğinize emin misiniz?')) return
        try {
            const response: any = await $api(`/api/offers/${id}/status`, {
                method: 'PATCH',
                body: { status: 'rejected' }
            })
            if (response.success) {
                toast.success('Teklif reddedildi.')
                await fetchOffers()
            }
        } catch (error: any) {
            toast.error(error.data?.message || 'İşlem başarısız.')
        }
    }

    watch(activeTab, (newTab) => {
        if (newTab === 'listings') fetchItems()
        else fetchOffers()
    })

    return {
        items, offers, myChains, myCompany, activeTab, loading,
        showCreateModal, showCompanyModal, isTradeModalOpen, selectedItem, selectedChain,
        fetchMyCompany, fetchItems, fetchOffers, deleteItem, reactivateItem, acceptOffer, rejectOffer,
        handleRefresh: async () => {
            if (activeTab.value === 'listings') await fetchItems()
            else await fetchOffers()
        },
        openCreateModal: () => {
            selectedItem.value = null
            showCreateModal.value = true
        },
        openEditModal: (item: any) => {
            selectedItem.value = item
            showCreateModal.value = true
        },
        showChainDetails: (chain: any) => {
            selectedChain.value = chain
            isTradeModalOpen.value = true
        },
        getItemChain: (itemId: string) => {
            return myChains.value.find(chain => chain.offers.some((offer: any) => offer.offeredItemId === itemId))
        }
    }
}
