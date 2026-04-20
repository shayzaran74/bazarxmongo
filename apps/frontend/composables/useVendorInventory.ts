import { ref, computed } from 'vue'
import { useCategoryService } from '~/services/api/CategoryService'

export const useVendorInventory = () => {
    const { $api } = useApi()
    const categoryService = useCategoryService()
    const toast = useNuxtApp().$toast

    const products = ref<any[]>([])
    const categories = ref<any[]>([])
    const history = ref<any[]>([])
    const loading = ref(true)
    const filters = ref({ search: '', category: '', status: 'all' })

    const stats = computed(() => ({
        total: products.value.length,
        lowStock: products.value.filter((p: any) => p.stock > 0 && p.stock <= (p.lowStockThreshold || 5)).length,
        outOfStock: products.value.filter((p: any) => p.stock === 0).length
    }))

    const fetchData = async () => {
        loading.value = true
        try {
            const [prodRes, catRes]: [any, any] = await Promise.all([
                $api('/api/v1/vendor/inventory'),
                categoryService.getCategories()
            ])
            
            if (prodRes.success) products.value = (prodRes.data || []) as any[]
            if (catRes.success) categories.value = (catRes.data || []) as any[]
        } catch (err) {
            console.error('Inventory fetch error:', err)
        } finally {
            loading.value = false
        }
    }

    const applyFilters = () => {
        fetchData()
    }

    const exportToPdf = async () => {
        try {
            const response = await $api('/api/v1/vendor/inventory/export', {
                query: { format: 'pdf' },
                responseType: 'blob'
            }) as any
            const url = window.URL.createObjectURL(new Blob([response]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'envanter.pdf')
            document.body.appendChild(link)
            link.click()
        } catch (err) {
            toast.error('Dışa aktarma başarısız')
        }
    }

    const fetchHistory = async (productId: string) => {
        try {
            const response = await $api<any>(`/api/v1/vendor/inventory/${productId}/history`) as any
            if (response.success) history.value = (response.data || []) as any[]
        } catch (err) {
            console.error('History fetch error:', err)
        }
    }

    return {
        products, categories, history, loading, filters, stats,
        fetchData, applyFilters, exportToPdf, fetchHistory
    }
}
