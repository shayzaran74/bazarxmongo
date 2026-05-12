import { ref, reactive, onMounted } from 'vue'
import { useApi } from './useApi'
import { useNuxtApp } from '#app'

export const useAdminPendingProducts = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  const products = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedProduct = ref<any>(null)
  const showModal = ref(false)
  const approvedToday = ref(0)
  const rejectedToday = ref(0)

  const pagination = reactive({
    total: 0,
    page: 1,
    limit: 50,
    pages: 1
  })

  const fetchPendingProducts = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await $api<any>('/api/v1/admin/products', {
        query: { status: 'PENDING', limit: 100 }
      })
      
      const data = res.data || []
      products.value = data
      
      if (res.pagination) {
        pagination.total = res.pagination.total
        pagination.page = res.pagination.page
        pagination.limit = res.pagination.limit
        pagination.pages = Math.ceil(res.pagination.total / res.pagination.limit)
      } else {
        pagination.total = data.length
      }
    } catch (err: any) {
      error.value = 'Ürünler yüklenemedi'
      $toast.error(error.value)
    } finally {
      loading.value = false
    }
  }

  const approveProduct = async (id: string) => {
    try {
      await $api(`/api/admin/products/${id}`, {
        method: 'PUT',
        body: { 
          status: 'ACTIVE',
          isFeatured: true,
          isSpecialOffer: true
        }
      })
      $toast.success('Ürün onaylandı')
      approvedToday.value++
      fetchPendingProducts()
    } catch {
      $toast.error('Onaylanamadı')
    }
  }

  const rejectProduct = async (id: string, reason: string) => {
    try {
      await $api(`/api/admin/products/${id}`, {
        method: 'PUT',
        body: { status: 'REJECTED', rejectionReason: reason }
      })
      $toast.success('Ürün reddedildi')
      rejectedToday.value++
      fetchPendingProducts()
    } catch {
      $toast.error('Reddedilemedi')
    }
  }

  onMounted(() => {
    fetchPendingProducts()
  })

  return {
    products, loading, error, pagination, approvedToday, rejectedToday,
    showModal, selectedProduct,
    fetchPendingProducts, approveProduct, rejectProduct,
  }
}
