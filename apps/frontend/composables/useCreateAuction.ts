import { ref, computed, onMounted } from 'vue'
import { useAuthStore, useRuntimeConfig, useNuxtApp } from '#imports'

export interface AuctionForm {
  productId: string
  title: string
  description: string
  startPrice: number | string
  minBidIncrement: number
  participationDeposit: number
  startTime: string
  endTime: string
  status: string
}

export const useCreateAuction = (props: { auction?: any, isEdit?: boolean }, emit: any) => {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()
  const { $toast: toast } = useNuxtApp()

  const form = ref<AuctionForm>({
    productId: '',
    title: '',
    description: '',
    startPrice: '',
    minBidIncrement: 1.0,
    participationDeposit: 0,
    startTime: '',
    endTime: '',
    status: 'Active'
  })

  const products = ref<any[]>([])
  const loading = ref(false)
  const error = ref('')

  const isEditing = computed(() => props.isEdit && props.auction)
  
  const selectedProduct = computed(() => {
    if (!form.value.productId) return null
    return products.value.find(p => p.id === form.value.productId)
  })

  const minDateTime = computed(() => {
    if (isEditing.value) return undefined
    const now = new Date()
    now.setMinutes(now.getMinutes() + 60)
    return now.toISOString().slice(0, 16)
  })

  const fetchProducts = async () => {
    try {
      const response = await $fetch<any>('/api/products', {
        baseURL: config.public.apiBase,
        headers: { 'Authorization': `Bearer ${authStore.token}` },
        query: { limit: 100 }
      })
      products.value = response.data || []
    } catch (err: any) {
      console.error('Fetch products error:', err)
      error.value = 'Ürünler yüklenirken bir hata oluştu: ' + (err.message || err)
    }
  }

  const setDurationPreset = (hours: number) => {
    const now = new Date()
    now.setHours(now.getHours() + hours)
    form.value.endTime = now.toISOString().slice(0, 16)
  }

  const handleSubmit = async () => {
    loading.value = true
    error.value = ''

    try {
      if (!form.value.title.trim()) throw new Error('Lütfen bir başlık girin')
      if (!form.value.startPrice || Number(form.value.startPrice) <= 0) throw new Error('Lütfen geçerli bir başlangıç fiyatı girin')
      if (!form.value.minBidIncrement || form.value.minBidIncrement <= 0) throw new Error('Lütfen geçerli bir minimum artış miktarı girin')
      if (!form.value.endTime) throw new Error('Lütfen bitiş zamanını seçin')

      const payload = {
        title: form.value.title.trim(),
        description: form.value.description.trim(),
        startPrice: parseFloat(form.value.startPrice.toString()),
        minBidIncrement: parseFloat(form.value.minBidIncrement.toString()),
        participationDeposit: parseFloat(form.value.participationDeposit.toString() || '0'),
        endTime: new Date(form.value.endTime).toISOString(),
        ...(form.value.startTime ? { startTime: new Date(form.value.startTime).toISOString() } : {}),
        ...(isEditing.value ? { status: form.value.status } : { productId: form.value.productId })
      }

      if (!isEditing.value && !form.value.productId) {
        throw new Error('Lütfen bir ürün seçin')
      }

      if (isEditing.value) {
        const response = await $fetch<any>(`/api/auctions/${props.auction.id}`, {
          method: 'PUT',
          baseURL: config.public.apiBase,
          headers: { 'Authorization': `Bearer ${authStore.token}` },
          body: payload
        })
        toast.success('Açık artırma güncellendi!')
        emit('updated', response.data)
      } else {
        const response = await $fetch<any>('/api/auctions', {
          method: 'POST',
          baseURL: config.public.apiBase,
          headers: { 'Authorization': `Bearer ${authStore.token}` },
          body: payload
        })
        toast.success('Açık artırma oluşturuldu!')
        emit('created', response.data)
      }
      emit('close')
    } catch (err: any) {
      console.error('Save auction error:', err)
      error.value = err.data?.error || err.message || 'İşlem sırasında bir hata oluştu'
    } finally {
      loading.value = false
    }
  }

  onMounted(async () => {
    await fetchProducts()
    if (isEditing.value) {
      form.value = {
        productId: props.auction.productId,
        title: props.auction.title,
        description: props.auction.description || '',
        startPrice: props.auction.startingPrice,
        minBidIncrement: props.auction.minBidIncrement || 1.0,
        participationDeposit: props.auction.participationDeposit || 0,
        startTime: props.auction.startTime ? new Date(props.auction.startTime).toISOString().slice(0, 16) : '',
        endTime: props.auction.endTime ? new Date(props.auction.endTime).toISOString().slice(0, 16) : '',
        status: props.auction.status || 'Active'
      }
    } else {
      const defaultEndTime = new Date()
      defaultEndTime.setHours(defaultEndTime.getHours() + 24)
      form.value.endTime = defaultEndTime.toISOString().slice(0, 16)
    }
  })

  return {
    form, products, loading, error, isEditing, selectedProduct, minDateTime,
    setDurationPreset, handleSubmit
  }
}
