import { ref, computed } from 'vue'
import { useCategoryService } from '~/services/api/CategoryService'

export const useVendorInventory = () => {
    const { $api } = useApi()
    const categoryService = useCategoryService()
    const toast = useNuxtApp().$toast

    const products = ref<any[]>([])
    const categories = ref<any[]>([])
    const history = ref<any[]>([])
    const loading = ref(false)
    const exporting = ref(false)
    const filters = ref({ search: '', categoryId: '', stockStatus: '' })
    
    // Modal states
    const showStockModal = ref(false)
    const showHistoryModal = ref(false)
    const selectedProduct = ref<any>(null)
    const stockChange = ref(0)
    const adjustReason = ref('')
    const historyLoading = ref(false)

    const stats = computed(() => ({
        total: products.value.length,
        lowStock: products.value.filter((p: any) => p.stock > 0 && p.stock <= (p.lowStockThreshold || 5)).length,
        outOfStock: products.value.filter((p: any) => p.stock === 0).length
    }))

    const fetchProducts = async () => {
        loading.value = true
        try {
            const params = new URLSearchParams()
            if (filters.value.search) params.append('search', filters.value.search)
            if (filters.value.categoryId) params.append('categoryId', filters.value.categoryId)
            if (filters.value.stockStatus) params.append('stockStatus', filters.value.stockStatus)

            const res = await $api<any>(`/api/v1/vendors/products?${params.toString()}`)
            if (res.success) {
                products.value = res.data || []
            }
        } catch (err) {
            console.error('Fetch products error:', err)
        } finally {
            loading.value = false
        }
    }

    const fetchCategories = async () => {
        try {
            const res = await categoryService.getCategories()
            if (res.success) {
                categories.value = res.data || []
            }
        } catch (err) {
            console.error('Fetch categories error:', err)
        }
    }

    const fetchStats = async () => {
        try {
            const res = await $api<any>('/api/v1/vendors/inventory/stats')
            if (res.success) {
                // Backend returns { totalProducts, outOfStock, lowStock, healthyStock }
                // We can either use these directly or keep the computed 'stats'
                // For now, let's just refresh products to keep computed stats in sync
                await fetchProducts()
            }
        } catch (err) {
            console.error('Fetch stats error:', err)
        }
    }

    const exportPDF = async () => {
        exporting.value = true
        try {
            const response = await $api('/api/v1/vendors/inventory/export', {
                responseType: 'blob'
            }) as any
            const url = window.URL.createObjectURL(new Blob([response]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `envanter-${new Date().toISOString().split('T')[0]}.xlsx`) // Backend returns Excel
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            toast.success('Rapor indiriliyor...')
        } catch (err) {
            toast.error('Dışa aktarma başarısız')
        } finally {
            exporting.value = false
        }
    }

    const fetchHistory = async (product: any) => {
        selectedProduct.value = product
        showHistoryModal.value = true
        historyLoading.value = true
        try {
            const response = await $api<any>(`/api/v1/vendors/inventory/logs/${product.id}`)
            if (response.success) {
                history.value = response.data || []
            }
        } catch (err) {
            console.error('History fetch error:', err)
            toast.error('Geçmiş yüklenemedi')
        } finally {
            historyLoading.value = false
        }
    }

    const updateStock = async () => {
        if (!selectedProduct.value) return
        
        try {
            const res = await $api<any>(`/api/v1/vendors/products/${selectedProduct.value.id}/stock`, {
                method: 'PATCH',
                body: {
                    change: stockChange.value,
                    reason: adjustReason.value
                }
            })
            
            if (res.success) {
                toast.success('Stok güncellendi')
                showStockModal.value = false
                stockChange.value = 0
                adjustReason.value = ''
                await fetchProducts()
            }
        } catch (err) {
            toast.error('Güncelleme başarısız')
        }
    }

    return {
        products, categories, loading, exporting, stats, filters,
        showStockModal, showHistoryModal, selectedProduct, stockChange, adjustReason, history, historyLoading,
        fetchStats, fetchCategories, fetchProducts, exportPDF, updateStock, fetchHistory
    }
}
