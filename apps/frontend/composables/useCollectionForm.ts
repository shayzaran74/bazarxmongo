import { ref, computed, watch, onMounted } from 'vue'

export const useCollectionForm = () => {
  const route = useRoute()
  const { $api } = useApi()
  const toast = useNuxtApp().$toast
  
  const isEditing = computed(() => !!route.query.id)
  const saving = ref(false)
  const productSearch = ref('')
  const searchResults = ref<any[]>([])
  const selectedProducts = ref<any[]>([])
  const conditions = ref([{ field: 'tag', operator: 'equals', value: '' }])

  const form = ref({
    title: '',
    description: '',
    type: 'Manual',
    image: '',
    conditionType: 'all',
    conditions: null as any,
    metaTitle: '',
    metaDescription: '',
    handle: '',
    isPublished: true
  })

  const fetchCollection = async () => {
    if (!route.query.id) return
    try {
      const response: any = await $api(`/api/v1/admin/collections/${route.query.id}`)
      const collection = response.data
      Object.keys(form.value).forEach(key => {
        if (collection[key] !== undefined) {
          (form.value as any)[key] = collection[key]
        }
      })
      if (collection.products) {
        selectedProducts.value = collection.products.map((cp: any) => cp.product)
      }
      if (collection.type === 'Automatic' && collection.conditions) {
        conditions.value = collection.conditions
      }
    } catch (error) {
      console.error('Fetch Collection Error:', error)
      toast.error('Koleksiyon yüklenirken hata oluştu')
    }
  }

  let searchTimeout: any
  const searchProducts = () => {
    clearTimeout(searchTimeout)
    if (!productSearch.value) {
      searchResults.value = []
      return
    }
    searchTimeout = setTimeout(async () => {
      try {
        const response: any = await $api('/api/v1/products', {
          query: { search: productSearch.value, limit: 10 }
        })
        searchResults.value = response.data.filter(
          (p: any) => !selectedProducts.value.find(sp => sp.id === p.id)
        )
      } catch (error) {
        console.error('Search Products Error:', error)
      }
    }, 300)
  }

  const addProduct = (product: any) => {
    if (!selectedProducts.value.find(p => p.id === product.id)) {
      selectedProducts.value.push(product)
      searchResults.value = []
      productSearch.value = ''
    }
  }

  const removeProduct = (index: number) => {
    selectedProducts.value.splice(index, 1)
  }

  const addCondition = () => {
    conditions.value.push({ field: 'tag', operator: 'equals', value: '' })
  }

  const removeCondition = (index: number) => {
    if (conditions.value.length > 1) {
      conditions.value.splice(index, 1)
    }
  }

  const saveCollection = async () => {
    saving.value = true
    try {
      const url = isEditing.value
        ? `/api/v1/admin/collections/${route.query.id}`
        : '/api/v1/admin/collections'
      const method = isEditing.value ? 'PUT' : 'POST'
      const data = {
        ...form.value,
        productIds: form.value.type === 'Manual' ? selectedProducts.value.map(p => p.id) : [],
        conditions: form.value.type === 'Automatic' ? conditions.value : null
      }
      const response: any = await $api(url, { method, body: data })
      if (response.success) {
        toast.success(isEditing.value ? 'Koleksiyon güncellendi!' : 'Koleksiyon oluşturuldu!')
        await navigateTo('/admin/collections')
      }
    } catch (error: any) {
      console.error('Save Collection Error:', error)
      toast.error(error.data?.error || 'Koleksiyon kaydedilirken hata oluştu')
    } finally {
      saving.value = false
    }
  }

  watch(() => form.value.title, (newTitle) => {
    if (!isEditing.value && (!form.value.handle || form.value.handle === '')) {
      form.value.handle = newTitle
        .toLowerCase()
        .replace(/ş/g, 's')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    }
  })

  onMounted(fetchCollection)

  return {
    form, isEditing, saving, productSearch, searchResults, selectedProducts, conditions,
    searchProducts, addProduct, removeProduct, addCondition, removeCondition, saveCollection
  }
}
