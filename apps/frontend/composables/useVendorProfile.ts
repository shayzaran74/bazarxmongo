import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVendorService } from '~/services/api/VendorService'
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import type { Vendor, Product, VendorAdProduct } from '@barterborsa/shared-types'

export const useVendorProfile = () => {
    const route = useRoute()
    const router = useRouter()
    const vendorService = useVendorService()
    const cartStore = useCartStore()
    const authStore = useAuthStore()
    const toast = useNuxtApp().$toast

    const vendor = ref<Vendor | null>(null)
    const loading = ref(true)
    const isFollowing = ref(false)
    const followLoading = ref(false)
    const activeMainTab = ref('products')

    // Products filtering & Pagination
    const products = ref<Product[]>([])
    const productsLoading = ref(false)
    const currentFilters = ref<Record<string, unknown>>({})
    const page = ref(1)
    const limit = ref(12)
    const totalProducts = ref(0)

    const hasMore = computed(() => products.value.length < totalProducts.value)

    const fetchVendor = async () => {
        loading.value = true
        try {
            console.log('Calling fetchVendor for:', route.params.id);
            const response = await vendorService.getVendorPublic(route.params.id as string)
            console.log('fetchVendor response:', response);
            if (response.success && response.data) {
                vendor.value = response.data
                if (response.data.products && products.value.length === 0) {
                    products.value = response.data.products
                    totalProducts.value = response.data._count?.listings || response.data.products.length
                }
            }
        } catch (error) {
            console.error('Fetch vendor error:', error)
            toast.error('Satıcı profili yüklenemedi')
        } finally {
            loading.value = false
        }
    }

    const fetchProducts = async (params: Record<string, unknown> = {}, append = false) => {
        productsLoading.value = true
        try {
            const queryParams: Record<string, unknown> = { vendorId: route.params.id, ...params }
            if (queryParams.category) {
                queryParams.categorySlug = queryParams.category
                delete queryParams.category
            }
            if (!append) page.value = 1
            const cleanParams: Record<string, unknown> = {}
            Object.keys(queryParams).forEach(key => {
                const val = queryParams[key]
                if (val !== undefined && val !== null && val !== '') cleanParams[key] = val
            })
            cleanParams.page = page.value
            cleanParams.limit = limit.value

            const response = await vendorService.getVendorProducts(route.params.id as string, cleanParams)
            if (response.success && response.data) {
                const fetchedItems = (response.data as any).items || (response.data as any).data || response.data || []
                if (append) products.value = [...products.value, ...fetchedItems]
                else products.value = fetchedItems
                totalProducts.value = response.pagination?.total || 0
            }
        } catch (error) {
            console.error('Fetch products error:', error)
        } finally {
            productsLoading.value = false
        }
    }

    const followVendor = async () => {
        if (!authStore.isLoggedIn) {
            toast.info('Takip etmek için giriş yapmalısınız')
            return router.push('/login')
        }
        if (followLoading.value) return
        followLoading.value = true
        try {
            const res = isFollowing.value
                ? await vendorService.unfollowVendor(route.params.id as string)
                : await vendorService.followVendor(route.params.id as string)
            if (res.success) {
                isFollowing.value = !isFollowing.value
                toast.success(res.message || 'İşlem başarılı')
            }
        } catch (err) {
            toast.error('İşlem başarısız oldu')
        } finally {
            followLoading.value = false
        }
    }

    const checkFollowStatus = async () => {
        if (!authStore.isLoggedIn) return
        try {
            const res = await vendorService.checkFollowStatus(route.params.id as string)
            if (res.success && res.data) {
                isFollowing.value = (res.data as { isFollowing: boolean }).isFollowing
            }
        } catch (err) {
            console.error('Check follow error:', err)
        }
    }

    return {
        vendor, loading, isFollowing, followLoading, activeMainTab,
        products, productsLoading, totalProducts, hasMore, page, limit,
        fetchVendor, fetchProducts, followVendor, checkFollowStatus,
        loadMore: () => {
            page.value++
            fetchProducts(currentFilters.value, true)
        },
        handleFilter: (filters: Record<string, unknown>) => {
            currentFilters.value = filters
            fetchProducts(filters, false)
            if (process.client) {
                const el = document.getElementById('products-list')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
            }
        }
    }
}
