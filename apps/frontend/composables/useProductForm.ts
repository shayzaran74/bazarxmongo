import { ref, computed, watch } from 'vue'

export const useProductForm = (productId?: string) => {
  const { $api } = useApi()
  const route = useRoute()
  const toast = useNuxtApp().$toast

  const saving = ref(false)
  const allCategories = ref<any[]>([])
  const selectedMainCategory = ref('')
  const selectedSubCategory1 = ref('')
  const selectedSubCategory2 = ref('')

  const form = ref<any>({
    name: '',
    description: '',
    image: '',
    productImages: [],
    price: 0,
    compareAtPrice: 0,
    costPerItem: 0,
    stock: 0,
    sku: '',
    barcode: '',
    trackInventory: true,
    continueSellingOutOfStock: false,
    weight: 0,
    requiresShipping: true,
    isActive: true,
    isTaxable: true,
    categoryId: '',
    productType: '',
    vendor: '',
    tags: '',
    metaTitle: '',
    metaDescription: '',
    slug: ''
  })

  // Cascading Category Logic
  const mainCategories = computed(() => allCategories.value.filter(c => !c.parentId))
  const subCategories1 = computed(() => selectedMainCategory.value ? allCategories.value.filter(c => c.parentId === selectedMainCategory.value) : [])
  const subCategories2 = computed(() => selectedSubCategory1.value ? allCategories.value.filter(c => c.parentId === selectedSubCategory1.value) : [])

  const setCascadingFromCategoryId = (catId: string) => {
    const cat = allCategories.value.find(c => c.id === catId)
    if (!cat) return
    if (!cat.parentId) {
      selectedMainCategory.value = cat.id
    } else {
      const parent = allCategories.value.find(c => c.id === cat.parentId)
      if (parent && !parent.parentId) {
        selectedMainCategory.value = parent.id
        selectedSubCategory1.value = cat.id
      } else if (parent && parent.parentId) {
        const grandParent = allCategories.value.find(c => c.id === parent.parentId)
        if (grandParent) {
          selectedMainCategory.value = grandParent.id
          selectedSubCategory1.value = parent.id
          selectedSubCategory2.value = cat.id
        }
      }
    }
  }

  // API Methods
  const fetchCategories = async () => {
    try {
      const res: any = await $api('/api/categories', { query: { all: true } })
      allCategories.value = res.data
    } catch (e) { toast.error('Kategoriler yüklenemedi') }
  }

  const fetchProduct = async () => {
    if (!productId) return
    try {
      const res: any = await $api(`/api/admin/products/${productId}`)
      const product = res.data
      Object.keys(form.value).forEach(k => { if (product[k] !== undefined) form.value[k] = product[k] })
      if (product.ProductImage) {
        form.value.productImages = product.ProductImage.sort((a: any, b: any) => a.order - b.order).map((img: any) => img.url)
      }
      if (form.value.categoryId) setCascadingFromCategoryId(form.value.categoryId)
    } catch (e) { toast.error('Ürün yüklenemedi') }
  }

  const handleFileUpload = async (event: any) => {
    const files = Array.from(event.target.files) as File[]
    const remaining = 5 - form.value.productImages.length
    if (remaining <= 0) return toast.error('En fazla 5 görsel yükleyebilirsiniz')
    
    for (const file of files.slice(0, remaining)) {
      const formData = new FormData()
      formData.append('file', file)
      try {
        const res: any = await $api('/api/upload', { 
          method: 'POST', 
          query: { type: 'product' },
          body: formData 
        })
        if (res.success) {
          form.value.productImages.push(res.url)
          if (!form.value.image) form.value.image = res.url
        }
      } catch (e) { toast.error('Görsel yüklenemedi') }
    }
  }

  const saveProduct = async () => {
    if (form.value.productImages.length < 3) return toast.error('En az 3 görsel yükleyin')
    saving.value = true
    try {
      const url = productId ? `/api/admin/products/${productId}` : '/api/admin/products'
      const method = productId ? 'PATCH' : 'POST'
      const res: any = await $api(url, { method, body: form.value })
      if (res.success) {
        toast.success(productId ? 'Ürün güncellendi' : 'Ürün oluşturuldu')
        navigateTo('/admin/products')
      }
    } finally { saving.value = false }
  }

  return {
    form, saving, allCategories, mainCategories, subCategories1, subCategories2,
    selectedMainCategory, selectedSubCategory1, selectedSubCategory2,
    fetchCategories, fetchProduct, handleFileUpload, saveProduct
  }
}
