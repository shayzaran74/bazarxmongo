import { ref, onMounted } from 'vue'

export const useAdminPendingProducts = () => {
    const { $api } = useApi()
    const toast = useNuxtApp().$toast
    
    const products = ref<any[]>([])
    const approvedToday = ref(0)
    const activeRulesCount = ref(0)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const pagination = ref({ page: 1, limit: 10, total: 0 })

    const fetchPendingProducts = async (page = 1) => {
        try {
            loading.value = true
            error.value = null
            const response = await $api<any>('/api/v1/admin/products/pending', {
                query: { page, limit: pagination.value.limit }
            }) as any
            if (response.success) {
                products.value = (response.data || []) as any[]
                pagination.value = { ...pagination.value, ...response.pagination }
            } else {
                error.value = response.error || 'Ürünler yüklenirken bir hata oluştu'
            }
        } catch (err: any) {
            error.value = err.data?.error || 'Sunucu bağlantısı kurulamadı'
        } finally {
            loading.value = false
        }
    }

    const approveProduct = async (productId: string) => {
        try {
            const response = await $api<any>(`/api/v1/admin/products/${productId}/approve`, { method: 'PUT' }) as any
            if (response.success) {
                toast.success('Ürün onaylandı!')
                approvedToday.value++
                fetchPendingProducts(pagination.value.page)
            }
        } catch (err: any) {
            toast.error('Onaylama sırasında hata oluştu')
        }
    }

    const rejectProduct = async (productId: string) => {
        try {
            const response = await $api<any>(`/api/v1/admin/products/${productId}/reject`, {
                method: 'PUT',
                body: { rejectionReason: 'Admin tarafından reddedildi' }
            }) as any
            if (response.success) {
                toast.info('Ürün reddedildi')
                fetchPendingProducts(pagination.value.page)
            }
        } catch (err: any) {
            toast.error('İşlem başarısız')
        }
    }

    onMounted(() => fetchPendingProducts())

    return {
        products, approvedToday, activeRulesCount, loading, error, pagination,
        fetchPendingProducts, approveProduct, rejectProduct
    }
}
