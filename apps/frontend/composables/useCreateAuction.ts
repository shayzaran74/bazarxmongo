// composables/useCreateAuction.ts
import { ref, computed, onMounted } from 'vue'

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

interface ProductOption {
  id: string
  name: string
  price?: number
  stock?: number
  image?: string
}

interface AuctionInput {
  id: string
  productId?: string
  title?: string
  description?: string
  startingPrice?: number | string
  minBidIncrement?: number
  participationDeposit?: number | string
  startTime?: string
  endTime?: string
  status?: string
}

type Emit = (event: 'close' | 'created' | 'updated', payload?: unknown) => void

export const useCreateAuction = (
  props: { auction?: AuctionInput | null; isEdit?: boolean },
  emit: Emit,
) => {
  const { $toast } = useNuxtApp()
  const { $api } = useApi()

  const form = ref<AuctionForm>({
    productId: '',
    title: '',
    description: '',
    startPrice: '',
    minBidIncrement: 1.0,
    participationDeposit: 0,
    startTime: '',
    endTime: '',
    status: 'ACTIVE',
  })

  const products = ref<ProductOption[]>([])
  const loading = ref(false)
  const error = ref('')

  const isEditing = computed(() => Boolean(props.isEdit && props.auction))

  const selectedProduct = computed<ProductOption | null>(() => {
    if (!form.value.productId) return null
    return products.value.find(p => p.id === form.value.productId) || null
  })

  const minDateTime = computed(() => {
    if (isEditing.value) return undefined
    const now = new Date()
    now.setMinutes(now.getMinutes() + 60)
    return now.toISOString().slice(0, 16)
  })

  const fetchProducts = async () => {
    try {
      const response = await $api<{ data: ProductOption[] }>('/api/v1/admin/products', {
        query: { limit: 100 },
      })
      products.value = (response as any).data || []
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      error.value = `Ürünler yüklenemedi: ${msg}`
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
      if (!isEditing.value && !form.value.productId) throw new Error('Lütfen bir ürün seçin')

      const payload: Record<string, unknown> = {
        title: form.value.title.trim(),
        description: form.value.description.trim(),
        startPrice: parseFloat(form.value.startPrice.toString()),
        minBidIncrement: parseFloat(form.value.minBidIncrement.toString()),
        participationDeposit: parseFloat(form.value.participationDeposit.toString() || '0'),
        endTime: new Date(form.value.endTime).toISOString(),
        ...(form.value.startTime ? { startTime: new Date(form.value.startTime).toISOString() } : {}),
        ...(isEditing.value
          ? { status: form.value.status }
          : { productId: form.value.productId }),
      }

      if (isEditing.value) {
        const response = await $api<{ data: unknown }>(`/api/v1/admin/auctions/${props.auction!.id}`, {
          method: 'PUT',
          body: payload,
        })
        $toast.success('Açık artırma güncellendi!')
        emit('updated', (response as any).data)
      } else {
        const response = await $api<{ data: unknown }>('/api/v1/admin/auctions', {
          method: 'POST',
          body: payload,
        })
        $toast.success('Açık artırma oluşturuldu!')
        emit('created', (response as any).data)
      }
      emit('close')
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string }; message?: string }
      error.value = apiErr?.data?.message || apiErr?.message || 'İşlem sırasında bir hata oluştu'
    } finally {
      loading.value = false
    }
  }

  onMounted(async () => {
    await fetchProducts()
    if (isEditing.value && props.auction) {
      const a = props.auction
      form.value = {
        productId: a.productId ?? '',
        title: a.title ?? '',
        description: a.description ?? '',
        startPrice: a.startingPrice ?? '',
        minBidIncrement: a.minBidIncrement ?? 1.0,
        participationDeposit: Number(a.participationDeposit ?? 0),
        startTime: a.startTime ? new Date(a.startTime).toISOString().slice(0, 16) : '',
        endTime: a.endTime ? new Date(a.endTime).toISOString().slice(0, 16) : '',
        status: a.status ?? 'ACTIVE',
      }
    } else {
      const defaultEndTime = new Date()
      defaultEndTime.setHours(defaultEndTime.getHours() + 24)
      form.value.endTime = defaultEndTime.toISOString().slice(0, 16)
    }
  })

  return {
    form, products, loading, error, isEditing, selectedProduct, minDateTime,
    setDurationPreset, handleSubmit,
  }
}
