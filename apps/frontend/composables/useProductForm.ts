import { ref, computed, watch, onMounted } from 'vue'

export const useProductForm = (config: { productId?: string | null, initialData?: any } = {}) => {
  const { $api } = useApi()
  const toast = useNuxtApp().$toast
  const { productId, initialData } = config

  // -- State --
  const saving = ref(false)
  const isEditing = ref(!!productId)
  const activeSection = ref('identity')
  const isBarcodeChecking = ref(false)
  const foundCatalogProduct = ref<any>(null)
  const newImageUrl = ref('')
  const categoryAttributes = ref<any[]>([])
  const allCategories = ref<any[]>([])
  
  const selectedMainCategory = ref('')
  const selectedSubCategory1 = ref('')
  const selectedSubCategory2 = ref('')

  const form = ref<any>({
    name: '', barcode: '', modelCode: '', brand: '', productType: '',
    description: '', technicalSpecifications: {}, technicalSpecificationsRaw: '',
    productImages: [], price: 0, compareAtPrice: 0, costPerItem: 0, stock: 0,
    sku: '', trackInventory: true, continueSellingOutOfStock: false,
    requiresShipping: true, weight: 0, volume: 0, visibility: 'PUBLIC',
    badgeText: '', badgeColor: '#ef4444',
    isActive: true, isNew: false, isFeatured: false,
    metaTitle: '', metaDescription: '', handle: '', ...initialData
  })

  const sections = [
    { id: 'identity', name: 'ÜRÜN KİMLİĞİ', icon: 'FingerPrintIcon', required: true },
    { id: 'basics', name: 'TEMEL BİLGİLER', icon: 'InformationCircleIcon', required: true },
    { id: 'attributes', name: 'TEKNİK ÖZELLİKLER', icon: 'QueueListIcon', required: false },
    { id: 'content', name: 'İÇERİK VE DETAY', icon: 'DocumentTextIcon', required: false },
    { id: 'media', name: 'MEDYA YÖNETİMİ', icon: 'PhotoIcon', required: true },
    { id: 'inventory', name: 'ENVANTER VE FİYAT', icon: 'CircleStackIcon', required: true },
    { id: 'logistics', name: 'LOJİSTİK', icon: 'TruckIcon', required: false },
    { id: 'ecosystem', name: 'BAZARX PRIVATE', icon: 'ShieldCheckIcon', required: false },
    { id: 'marketing', name: 'PAZARLAMA VE SEO', icon: 'MegaphoneIcon', required: false }
  ]

  // -- Cascading Logic --
  const mainCategories = computed(() => allCategories.value.filter(c => !c.parentId))
  const subCategories1 = computed(() => selectedMainCategory.value ? allCategories.value.filter(c => c.parentId === selectedMainCategory.value) : [])
  const subCategories2 = computed(() => selectedSubCategory1.value ? allCategories.value.filter(c => c.parentId === selectedSubCategory1.value) : [])

  // -- Flags --
  const flags = [
    { key: 'isNew' as const, label: 'Yeni Ürün', activeClass: 'bg-blue-50 border-blue-200 text-blue-700', checkClass: 'text-blue-600' },
    { key: 'isFeatured' as const, label: 'Öne Çıkar', activeClass: 'bg-orange-50 border-orange-200 text-orange-700', checkClass: 'text-orange-600' }
  ]

  // -- Methods --
  const fetchCategories = async () => {
    try {
      const res: any = await $api('/api/categories', { query: { all: true } })
      allCategories.value = res.data
    } catch { toast.error('Kategoriler alınamadı') }
  }

  const handleMainCategoryChange = () => { selectedSubCategory1.value = ''; selectedSubCategory2.value = '' }
  const handleSubCategory1Change = () => { selectedSubCategory2.value = '' }
  const handleSubCategory2Change = (val: string) => { form.value.categoryId = val }

  const scrollToSection = (id: string) => {
    activeSection.value = id
    const el = document.getElementById(`section-${id}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const isSectionComplete = (id: string) => {
    if (id === 'identity') return !!form.value.barcode || !!form.value.modelCode
    if (id === 'basics') return !!form.value.name && !!form.value.brand && !!selectedMainCategory.value
    if (id === 'media') return form.value.productImages.length > 0
    return true
  }

  const handleFileUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res: any = await $api('/api/upload', { method: 'POST', query: { type: 'product' }, body: formData })
      if (res.success) addImageUrl(res.url)
    } catch { toast.error('Yükleme başarısız') }
  }

  const addImageUrl = (url: string) => {
    if (!url || form.value.productImages.length >= 10) return
    form.value.productImages.push(url)
    newImageUrl.value = ''
  }

  const removeImage = (index: number) => { form.value.productImages.splice(index, 1) }
  const setAsMain = (index: number) => {
    const img = form.value.productImages.splice(index, 1)[0]
    form.value.productImages.unshift(img)
  }

  const validateForm = () => {
    if (!form.value.name) { toast.error('Ürün ismi gerekli'); return false }
    if (form.value.productImages.length < 1) { toast.error('En az 1 görsel gerekli'); return false }
    return true
  }

  const saveProduct = async () => {
    if (!validateForm()) return
    saving.value = true
    try {
      const method = isEditing.value ? 'PUT' : 'POST'
      const url = isEditing.value ? `/api/admin/products/${productId}` : '/api/admin/products'
      const res: any = await $api(url, { method, body: form.value })
      if (res.success) {
        toast.success('Başarıyla kaydedildi')
        navigateTo('/admin/products')
      }
    } finally { saving.value = false }
  }

  onMounted(() => {
    fetchCategories()
    if (productId) { /* Load product logic */ }
  })

  return {
    form, saving, sections, flags, activeSection, isEditing, foundCatalogProduct,
    isBarcodeChecking, newImageUrl, categoryAttributes, mainCategories, subCategories1, subCategories2,
    selectedMainCategory, selectedSubCategory1, selectedSubCategory2,
    scrollToSection, isSectionComplete, handleFileUpload, addImageUrl, removeImage, setAsMain,
    handleMainCategoryChange, handleSubCategory1Change, handleSubCategory2Change, validateForm, saveProduct
  }
}
