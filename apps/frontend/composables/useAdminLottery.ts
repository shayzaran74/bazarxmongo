import { ref, onMounted } from 'vue'

export const useAdminLottery = () => {
    const { $api } = useApi()
    const toast = useNuxtApp().$toast

    const lotteries = ref<any[]>([])
    const stats = ref({ total: 0, active: 0, completed: 0, prizepool: 0 })
    const loading = ref(true)
    
    // Filters & Pagination
    const filters = ref({ search: '', status: '', dateRange: null, sortBy: 'created_desc' })
    const pagination = ref({ page: 1, limit: 10, total: 0 })

    const fetchLotteries = async () => {
        loading.value = true
        try {
            const response = await $api<any>('/api/v1/lotteries') as any
            if (response.success) {
                lotteries.value = (response.data || []) as any[]
                stats.value = {
                    total: lotteries.value.length,
                    active: lotteries.value.filter((l: any) => l.status === 'Active').length,
                    completed: lotteries.value.filter((l: any) => l.status === 'Completed').length,
                    prizepool: lotteries.value.reduce((s: number, l: any) => s + (l.prizeValue || 0), 0)
                }
            }
        } catch (err) {
            console.error('Fetch lottery error:', err)
        } finally {
            loading.value = false
        }
    }

    const deleteLottery = async (id: string) => {
        if (confirm('Bu çekilişi silmek istediğinizden emin misiniz?')) {
            try {
                await $api(`/api/v1/lotteries/${id}`, { method: 'DELETE' })
                toast.success('Çekiliş silindi')
                fetchLotteries()
            } catch (err: any) {
                toast.error('Hata: ' + (err.data?.error || err.message))
            }
        }
    }

    const endLottery = async (lottery: any) => {
        if (confirm(`${lottery.title} çekilişini sonlandırmak ve KAZANANI BELİRLEMEK istediğinizden emin misiniz?`)) {
            try {
                const response = await $api<any>(`/api/v1/lotteries/${lottery.id}/draw`, { method: 'POST' }) as any
                if (response.success) {
                    toast.success(`ÇEKİLİŞ TAMAMLANDI! Kazanan Numara: ${response.winningNumber || 'N/A'}`)
                    fetchLotteries()
                }
            } catch (err: any) {
                toast.error('Hata: ' + (err.data?.error || err.message))
            }
        }
    }

    onMounted(fetchLotteries)

    return {
        lotteries, stats, loading, filters, pagination,
        fetchData: fetchLotteries, deleteLottery, endLottery
    }
}
