import { ref, onMounted } from 'vue'
import { debounce } from 'lodash-es'

export const useMatching = () => {
    const { $api } = useApi()
    const { $toast: toast } = useNuxtApp()

    const chains = ref<any[]>([])
    const loading = ref(true)
    const detecting = ref(false)
    const isModalOpen = ref(false)
    const selectedChain = ref<any>(null)

    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    const searchQuery = ref('')
    const pagination = ref({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
    })

    const fetchChains = async () => {
        loading.value = true
        try {
            const res: any = await $api('/api/v1/admin/barter/chains', {
                params: {
                    page: currentPage.value,
                    limit: itemsPerPage.value,
                    search: searchQuery.value
                }
            })

            if (res.data) {
                chains.value = res.data
                if (res.pagination) {
                    const limit = Number(res.pagination.limit) || 10
                    pagination.value = {
                        ...res.pagination,
                        limit: limit,
                        totalPages: Math.ceil((res.pagination.total || 0) / limit) || 1
                    }
                }
            }
        } catch (error) {
            console.error('Fetch chains error:', error)
        } finally {
            loading.value = false
        }
    }

    const debouncedSearch = debounce(() => {
        currentPage.value = 1
        fetchChains()
    }, 500)

    const changePage = (page: number) => {
        if (page >= 1 && page <= pagination.value.totalPages) {
            currentPage.value = page
            fetchChains()
        }
    }

    const detectCycles = async () => {
        detecting.value = true
        try {
            const response: any = await $api('/api/v1/admin/barter/detect-cycles', {
                method: 'POST'
            })

            if (response.success) {
                toast.success(response.message)
                currentPage.value = 1
                await fetchChains()
            }
        } catch (error: any) {
            toast.error('Hata: ' + (error.data?.error || error.message))
        } finally {
            detecting.value = false
        }
    }

    const approveChain = async (id: string) => {
        if (!confirm('Bu zinciri onaylayıp tüm katılımcılara bildirim göndermek istediğinize emin misiniz?')) return

        try {
            loading.value = true
            const response: any = await $api(`/api/v1/admin/barter/approve-chain/${id}`, {
                method: 'POST'
            })

            if (response.success) {
                toast.success(response.message)
                await fetchChains()
            }
        } catch (error: any) {
            toast.error('Onaylama hatası: ' + (error.data?.error || error.message))
        } finally {
            loading.value = false
        }
    }

    const deleteDraft = async (id: string) => {
        if (!confirm('Bu takas taslağını silmek istediğinize emin misiniz?')) return

        try {
            loading.value = true
            const response: any = await $api(`/api/v1/admin/barter/chains/${id}`, {
                method: 'DELETE'
            })

            if (response.success) {
                toast.success('Taslak silindi')
                await fetchChains()
            }
        } catch (error: any) {
            toast.error('Silme hatası: ' + (error.data?.error || error.message))
        } finally {
            loading.value = false
        }
    }

    return {
        chains, loading, detecting, isModalOpen, selectedChain,
        currentPage, itemsPerPage, searchQuery, pagination,
        fetchChains, debouncedSearch, changePage, detectCycles, approveChain, deleteDraft,
        showChainDetails: (chain: any) => {
            selectedChain.value = chain
            isModalOpen.value = true
        }
    }
}
