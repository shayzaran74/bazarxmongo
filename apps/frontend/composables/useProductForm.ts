export const useProductForm = (params: { productId?: string | null; initialData?: any } = {}) => {
  const { productId, initialData } = params
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  const loading = ref(false)
  const isEditing = computed(() => !!productId)
  const activeSection = ref('basics')
  const newImageUrl = ref('')
  const isBarcodeChecking = ref(false)
  const foundCatalogProduct = ref<any>(null)
  
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

  const flags = ref<any[]>([
    { id: 'draft', label: 'Taslak Modu', value: initialData?.isDraft || false },
    { id: 'published', label: 'Yayında', value: initialData?.status === 'ACTIVE' }
  ])

  const categoryAttributes = ref<any[]>([])
  const mainCategories = ref<any[]>([])
  const subCategories1 = ref<any[]>([])
  const subCategories2 = ref<any[]>([])
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

  const handleFileUpload = async (files: FileList) => {
    $toast.info('Görsel yükleniyor...')
  }

  const addImageUrl = () => {
    if (newImageUrl.value) {
      form.productImages.push({ url: newImageUrl.value, isMain: form.productImages.length === 0 })
      newImageUrl.value = ''
    }
  }

  const removeImage = (index: number) => {
    form.productImages.splice(index, 1)
  }

  const setAsMain = (index: number) => {
    form.productImages.forEach((img: any, i: number) => img.isMain = i === index)
  }

  const handleMainCategoryChange = async () => { /* Load subs */ }
  const handleSubCategory1Change = async () => { /* Load subs */ }
  const handleSubCategory2Change = async () => { /* Load subs */ }

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
