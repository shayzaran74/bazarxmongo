export const useProductForm = (params: { productId?: string | null; initialData?: Record<string, unknown> } = {}) => {
  const { productId, initialData } = params
  const { $api } = useApi()
  const { $toast } = useNuxtApp()

  const loading = ref(false)
  const isEditing = computed(() => !!productId)
  const activeSection = ref('basics')
  const newImageUrl = ref('')
  const isBarcodeChecking = ref(false)
  const foundCatalogProduct = ref<Record<string, unknown> | null>(null)
  
  const form = reactive({
    name: initialData?.name || initialData?.title || '',
    barcode: initialData?.barcode || '',
    modelCode: initialData?.modelCode || '',
    brand: initialData?.brand || '',
    productType: initialData?.productType || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    compareAtPrice: initialData?.compareAtPrice || initialData?.originalPrice || 0,
    costPerItem: initialData?.costPerItem || 0,
    stock: initialData?.stock || 0,
    sku: initialData?.sku || '',
    trackInventory: initialData?.trackInventory ?? true,
    continueSellingOutOfStock: initialData?.continueSellingOutOfStock ?? false,
    requiresShipping: initialData?.requiresShipping ?? true,
    weight: initialData?.weight || 0,
    volume: initialData?.volume || 0,
    visibility: initialData?.visibility || 'PUBLIC',
    minMarketPrice: initialData?.minMarketPrice || 0,
    maxPurchasePerMember: initialData?.maxPurchasePerMember || 0,
    // Master Plan v4.3 §4.2 — Fabrika ekosistemi ürün gamı
    ecosystemId: initialData?.ecosystemId || null,
    visibleTo: initialData?.visibleTo || 'NONE',
    selectedDealerIds: initialData?.selectedDealerIds || [],
    availableFrom: initialData?.availableFrom || null,
    availableTo: initialData?.availableTo || null,
    allowOnlineResale: initialData?.allowOnlineResale ?? false,
    maxOrderQtyPerDealer: initialData?.maxOrderQtyPerDealer || null,
    badgeText: initialData?.badgeText || '',
    badgeColor: initialData?.badgeColor || '#000000',
    metaTitle: initialData?.metaTitle || '',
    metaDescription: initialData?.metaDescription || '',
    handle: initialData?.handle || '',
    technicalSpecifications: initialData?.technicalSpecifications || [],
    technicalSpecificationsRaw: initialData?.technicalSpecificationsRaw || '',
    productImages: initialData?.productImages || [],
    image: initialData?.image || '',
    // ProductFormState compliance
    isTaxable: initialData?.isTaxable ?? true,
    categoryId: initialData?.categoryId || '',
    tags: initialData?.tags || [],
    isActive: initialData?.isActive ?? true,
    isNew: initialData?.isNew ?? false,
    isFeatured: initialData?.isFeatured ?? false,
    isFlashSale: initialData?.isFlashSale ?? false,
    isSpecialOffer: initialData?.isSpecialOffer ?? false,
    isDraft: initialData?.isDraft ?? false,
    status: initialData?.status || 'PENDING',
    deleted: initialData?.deleted ?? false,
    vendorId: initialData?.vendorId || '',
    media: initialData?.media || [],
    variants: initialData?.variants || [],
    inventory: initialData?.inventory || [],
    shipping: initialData?.shipping || [],
    // RESTAURANT specific fields
    ingredients: initialData?.ingredients || [],
    preparationTime: initialData?.preparationTime || 0,
    calories: initialData?.calories || 0,
    dailyLimit: initialData?.dailyLimit || 0,
  })

  const sections = [
    { id: 'identity', title: 'Kimlik', name: 'Kimlik', icon: 'IdentificationIcon', required: true },
    { id: 'basics', title: 'Temel Bilgiler', name: 'Temel Bilgiler', icon: 'DocumentTextIcon', required: true },
    { id: 'attributes', title: 'Özellikler', name: 'Özellikler', icon: 'AdjustmentsHorizontalIcon', required: false },
    { id: 'content', title: 'İçerik', name: 'İçerik', icon: 'Bars3BottomLeftIcon', required: false },
    { id: 'media', title: 'Medya', name: 'Medya', icon: 'PhotoIcon', required: true },
    { id: 'inventory', title: 'Envanter', name: 'Envanter', icon: 'InboxStackIcon', required: true },
    { id: 'logistics', title: 'Lojistik', name: 'Lojistik', icon: 'TruckIcon', required: false },
    { id: 'ecosystem', title: 'Ekosistem', name: 'Ekosistem', icon: 'GlobeAltIcon', required: false },
    { id: 'marketing', title: 'Pazarlama', name: 'Pazarlama', icon: 'RocketLaunchIcon', required: false },
  ]

  const flags = ref<Record<string, unknown>[]>([
    { id: 'draft', label: 'Taslak Modu', value: initialData?.isDraft || false },
    { id: 'published', label: 'Yayında', value: initialData?.status === 'ACTIVE' }
  ])

  const categoryAttributes = ref<Record<string, unknown>[]>([])
  const mainCategories = ref<Record<string, unknown>[]>([])
  const subCategories1 = ref<Record<string, unknown>[]>([])
  const subCategories2 = ref<Record<string, unknown>[]>([])
  const selectedMainCategory = ref('')
  const selectedSubCategory1 = ref('')
  const selectedSubCategory2 = ref('')

  const scrollToSection = (id: string) => {
    activeSection.value = id
    if (process.client) {
      const el = document.getElementById(`section-${id}`)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const isSectionComplete = (id: string) => {
    if (id === 'basics') return !!form.name
    return true
  }

  const handleFileUpload = async (event: Event | { target?: { files?: FileList }; dataTransfer?: { files?: FileList } }) => {
    const files = event.target?.files || event.dataTransfer?.files
    if (!files || files.length === 0) return
    
    $toast.info('Görsel yükleniyor...')
    const uploadLimit = Math.min(files.length, 5 - (form.productImages?.length || 0))
    
    for (let i = 0; i < uploadLimit; i++) {
      const file = files[i]
      if (file.size > 5 * 1024 * 1024) {
        $toast.error(`${file.name} 5MB'dan büyük olduğu için atlandı.`)
        continue
      }

      const body = new FormData()
      body.append('file', file)

      try {
        const res = await $api<{ url?: string; data?: { url?: string } | string }>(
          '/api/v1/upload?subPath=products',
          { method: 'POST', body },
        )
        const url = res.url ?? (typeof res.data === 'string' ? res.data : res.data?.url)
        if (res.success && url) {
          if (!form.productImages) form.productImages = []
          form.productImages.push(url)
          if (!form.image) form.image = url
          $toast.success(`${file.name} yüklendi`)
        }
      } catch {
        $toast.error(`${file.name} yüklenirken hata oluştu`)
      }
    }
    // Reset input
    if (event.target) event.target.value = ''
  }

  const addImageUrl = () => {
    if (newImageUrl.value) {
      if (!form.productImages) form.productImages = []
      form.productImages.push(newImageUrl.value)
      if (!form.image) form.image = newImageUrl.value
      newImageUrl.value = ''
    }
  }

  const removeImage = (index: number) => {
    form.productImages.splice(index, 1)
  }

  const setAsMain = (index: number) => {
    form.productImages.forEach((img: Record<string, unknown>, i: number) => img.isMain = i === index)
  }

  const allCategories = ref<Record<string, unknown>[]>([])

  const fetchCategories = async () => {
    try {
      const res = await $api<{ data: Record<string, unknown>[] }>('/api/v1/listings/categories')
      const cats = res.data || []
      allCategories.value = cats
      mainCategories.value = cats.filter((c) => !c.parentId)

      // Resolve initial hierarchy
      if (form.categoryId) {
        let currentCat = cats.find((c) => c.id === form.categoryId)
        if (currentCat) {
          const path: Record<string, unknown>[] = []
          while(currentCat) {
            path.unshift(currentCat)
            currentCat = cats.find((c) => c.id === currentCat?.parentId)
          }
          if (path.length > 0) {
            selectedMainCategory.value = path[0].id as string
            subCategories1.value = cats.filter((c) => c.parentId === path[0].id)
          }
          if (path.length > 1) {
            selectedSubCategory1.value = path[1].id as string
            subCategories2.value = cats.filter((c) => c.parentId === path[1].id)
          }
          if (path.length > 2) {
            selectedSubCategory2.value = path[2].id as string
          }
        }
      }
    } catch {
      /* sessiz hata */
    }
  }

  onMounted(() => {
    fetchCategories()
  })

  const handleMainCategoryChange = async () => {
    subCategories1.value = allCategories.value.filter((c) => c.parentId === selectedMainCategory.value)
    selectedSubCategory1.value = ''
    selectedSubCategory2.value = ''
    subCategories2.value = []
    form.categoryId = selectedMainCategory.value
  }

  const handleSubCategory1Change = async () => {
    subCategories2.value = allCategories.value.filter((c) => c.parentId === selectedSubCategory1.value)
    selectedSubCategory2.value = ''
    form.categoryId = selectedSubCategory1.value || selectedMainCategory.value
  }

  const handleSubCategory2Change = async () => {
    form.categoryId = selectedSubCategory2.value || selectedSubCategory1.value || selectedMainCategory.value
  }

  const validateForm = () => {
    if (!form.name) {
      $toast.error('Lütfen ürün adını girin')
      return false
    }
    return true
  }

  return {
    form, sections, flags, activeSection, isEditing,
    foundCatalogProduct, isBarcodeChecking, newImageUrl,
    categoryAttributes, mainCategories, subCategories1, subCategories2,
    selectedMainCategory, selectedSubCategory1, selectedSubCategory2,
    scrollToSection, isSectionComplete, handleFileUpload,
    addImageUrl, removeImage, setAsMain,
    handleMainCategoryChange, handleSubCategory1Change, handleSubCategory2Change,
    validateForm
  }
}
