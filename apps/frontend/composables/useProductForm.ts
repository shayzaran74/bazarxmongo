import type { Component } from 'vue'
import {
  PhotoIcon, IdentificationIcon, ShoppingBagIcon, ClipboardDocumentListIcon,
  DocumentTextIcon, CurrencyDollarIcon, TruckIcon, RocketLaunchIcon
} from '@heroicons/vue/24/outline'
import type { ProductFormState, CategoryAttribute, FormSection, MarketingFlag } from '~/types/product-form'
import type { Category, Product } from '@barterborsa/shared-types'

import type { ApiResponse } from '@barterborsa/shared-types'

export const useProductForm = (props: { productId?: string | null, initialData?: Partial<ProductFormState> }) => {
  const { $api } = useApi()
  const { $toast: toast } = useNuxtApp()
  
  // Sections for Sidebar Nav
  const sections: FormSection[] = [
    { id: 'identity', name: 'Kimlik', icon: IdentificationIcon as Component, required: true },
    { id: 'basics', name: 'Temel Bilgiler', icon: ShoppingBagIcon as Component, required: true },
    { id: 'attributes', name: 'Özellikler', icon: ClipboardDocumentListIcon as Component, required: false },
    { id: 'content', name: 'İçerik', icon: DocumentTextIcon as Component, required: true },
    { id: 'media', name: 'Medya Galerisi', icon: PhotoIcon as Component, required: true },
    { id: 'listing', name: 'Listeleme', icon: CurrencyDollarIcon as Component, required: true },
    { id: 'logistics', name: 'Lojistik', icon: TruckIcon as Component, required: false },
    { id: 'marketing', name: 'Pazarlama', icon: RocketLaunchIcon as Component, required: false }
  ]

  const flags: MarketingFlag[] = [
    { key: 'isActive', label: 'Satışta Aktif', activeClass: 'bg-green-50 border-green-200 text-green-700', checkClass: 'text-green-600' },
    { key: 'isFeatured', label: '✨ Sana Özel', activeClass: 'bg-blue-50 border-blue-200 text-blue-700', checkClass: 'text-blue-600' },
    { key: 'isFlashSale', label: '⚡ Flaş Ürün', activeClass: 'bg-orange-50 border-orange-200 text-orange-700', checkClass: 'text-orange-600' },
    { key: 'isSpecialOffer', label: '🔥 Özel Fırsat', activeClass: 'bg-rose-50 border-rose-200 text-rose-700', checkClass: 'text-rose-600' }
  ]

  // Form State
  const form = ref<ProductFormState>({
    name: '', description: '', image: '', productImages: [],
    price: 0, compareAtPrice: 0, costPerItem: 0, stock: 0,
    sku: '', barcode: '', modelCode: '', brand: '',
    trackInventory: true, continueSellingOutOfStock: false,
    weight: 0, volume: 0, requiresShipping: true, isTaxable: true,
    categoryId: '', productType: '', tags: '',
    metaTitle: '', metaDescription: '', handle: '',
    badgeText: '', badgeColor: '#2563eb',
    isActive: true, isFeatured: false, isFlashSale: false, isSpecialOffer: false,
    technicalSpecifications: {},
    technicalSpecificationsRaw: '',
    brandId: '',
    visibility: 'PUBLIC',
    ecosystemId: null,
    minMarketPrice: null,
    maxPurchasePerMember: null
  })

  // UI State
  const activeSection = ref('identity')
  const isEditing = computed(() => !!props.productId)
  const foundCatalogProduct = ref<Product | null>(null)
  const isBarcodeChecking = ref(false)
  const allCategories = ref<Category[]>([])
  const newImageUrl = ref('')
  const categoryAttributes = ref<CategoryAttribute[]>([])

  // Category Cascading State
  const selectedMainCategory = ref('')
  const selectedSubCategory1 = ref('')
  const selectedSubCategory2 = ref('')

  const mainCategories = computed(() => allCategories.value.filter(c => !c.parentId))
  const subCategories1 = computed(() => selectedMainCategory.value ? allCategories.value.filter(c => String(c.parentId) === String(selectedMainCategory.value)) : [])
  const subCategories2 = computed(() => selectedSubCategory1.value ? allCategories.value.filter(c => String(c.parentId) === String(selectedSubCategory1.value)) : [])

  // Methods
  const scrollToSection = (id: string) => {
    activeSection.value = id
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const isSectionComplete = (id: string) => {
    if (id === 'identity') return !!(form.value.barcode && form.value.modelCode)
    if (id === 'basics') return !!(form.value.name && form.value.categoryId)
    if (id === 'content') return !!form.value.description
    if (id === 'media') return form.value.productImages.length >= 1
    if (id === 'listing') return form.value.price > 0 && form.value.stock >= 0
    return true
  }

  const handleFileUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const files = Array.from(target.files || [])
    if (files.length === 0) return
    const limit = Math.min(files.length, 10 - form.value.productImages.length)
    if (limit <= 0) return toast.error('En fazla 10 görsel yükleyebilirsiniz')

    const categoryName = allCategories.value.find(c => String(c.id) === String(form.value.categoryId))?.name || 'unknown'

    for (let i = 0; i < limit; i++) {
      const formData = new FormData()
      formData.append('image', files[i])
      try {
        const response = await $api<{ url?: string }> (`/api/upload?type=product&category=${encodeURIComponent(categoryName)}`, {
          method: 'POST',
          body: formData
        })
        if (response.success) {
          const url = (response as any).data?.url || (response as any).url
          if (url) {
            form.value.productImages.push(url)
            if (!form.value.image) form.value.image = url
          }
        }
      } catch (e) { toast.error(`${files[i].name} yüklenemedi`) }
    }
  }

  const addImageUrl = () => {
    if (!newImageUrl.value) return
    if (form.value.productImages.length >= 10) return toast.error('En fazla 10 görsel')
    form.value.productImages.push(newImageUrl.value)
    if (!form.value.image) form.value.image = newImageUrl.value
    newImageUrl.value = ''
  }

  const removeImage = (idx: number) => {
    const removed = form.value.productImages.splice(idx, 1)[0]
    if (form.value.image === removed) form.value.image = form.value.productImages[0] || ''
  }

  const setAsMain = (idx: number) => {
    const url = form.value.productImages.splice(idx, 1)[0]
    form.value.productImages.unshift(url)
    form.value.image = url
  }

  const fetchCategories = async () => {
    try {
      const res = await $api<Category[]>('/api/categories?all=true')
      if (res.success && res.data) allCategories.value = res.data
    } catch (e) { console.error(e) }
  }

  const fetchCategoryAttributes = async (catId: string) => {
    if (!catId) {
      categoryAttributes.value = []
      return
    }
    try {
      const res = await $api<CategoryAttribute[]>(`/api/categories/${catId}/attributes`)
      if (res.success && res.data) categoryAttributes.value = res.data
    } catch (e) { console.error(e) }
  }

  const setCascadingFromCategoryId = (catId: string | number) => {
    const cat = allCategories.value.find(c => String(c.id) === String(catId))
    if (!cat) return
    
    if (!cat.parentId) {
      selectedMainCategory.value = String(cat.id)
      selectedSubCategory1.value = ''
      selectedSubCategory2.value = ''
    } else {
      const parent = allCategories.value.find(c => String(c.id) === String(cat.parentId))
      if (parent && !parent.parentId) {
        selectedMainCategory.value = String(parent.id)
        selectedSubCategory1.value = String(cat.id)
        selectedSubCategory2.value = ''
      } else if (parent && parent.parentId) {
        const gparent = allCategories.value.find(c => String(c.id) === String(parent.parentId))
        if (gparent) {
          selectedMainCategory.value = String(gparent.id)
          selectedSubCategory1.value = String(parent.id)
          selectedSubCategory2.value = String(cat.id)
        }
      }
    }
  }

  const checkBarcode = async () => {
    if (!form.value.barcode || isEditing.value || form.value.barcode.length < 5) return
    isBarcodeChecking.value = true
    try {
      const res = await $api<Product>(`/api/products/barcode/${form.value.barcode}`)
      if (res.success && res.data) {
        const prod = res.data
        foundCatalogProduct.value = prod
        toast.success('Katalog eşleşmesi sağlandı.')
        form.value.name = prod.name
        form.value.description = prod.description || ''
        form.value.brand = (prod as any).Brand?.name || (prod.brand as string) || ''
        
        if ((prod as any).Category?.id) {
          form.value.categoryId = String((prod as any).Category.id)
        }
        
        form.value.modelCode = prod.sku || ''
        form.value.technicalSpecifications = (prod as any).technicalSpecifications || {}
        
        if (prod.images && prod.images.length > 0) {
          form.value.productImages = prod.images.map((img: string | { url: string }) => 
            typeof img === 'string' ? img : img.url
          )
          form.value.image = form.value.productImages[0]
        }
        
        if (form.value.categoryId) setCascadingFromCategoryId(form.value.categoryId)
      } else {
        foundCatalogProduct.value = null
      }
    } catch (e) { 
      foundCatalogProduct.value = null 
    } finally { 
      isBarcodeChecking.value = false 
    }
  }

  const validateForm = () => {
    if (!form.value.name || !form.value.categoryId || !form.value.description || form.value.productImages.length < 1) {
      toast.error('Lütfen zorunlu alanları doldurun ve en az 1 görsel ekleyin.')
      return false
    }
    if (form.value.price <= 0 || form.value.stock < 0) {
      toast.error('Fiyat ve stok alanlarını kontrol edin.')
      return false
    }
    return true
  }

  // Watchers
  let barcodeTimeout: ReturnType<typeof setTimeout> | null = null
  watch(() => form.value.barcode, () => {
    if (!isEditing.value) {
      if (barcodeTimeout) clearTimeout(barcodeTimeout)
      barcodeTimeout = setTimeout(checkBarcode, 800)
    }
  })

  watch(() => form.value.categoryId, (newVal) => {
    if (newVal) fetchCategoryAttributes(newVal)
  })

  watch(() => form.value.name, (newName) => {
    if (!isEditing.value && (!form.value.handle || form.value.handle === '')) {
      form.value.handle = newName.toLowerCase()
        .replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u')
        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    }
  })

  watch(() => props.initialData, (newData) => {
    if (newData && Object.keys(newData).length > 0) {
      for (const key in newData) {
        if (Object.prototype.hasOwnProperty.call(newData, key)) {
          const k = key as keyof ProductFormState
          const val = newData[k]
          if (val !== undefined && val !== null) {
            // @ts-ignore - dynamic assignment
            form.value[k] = val
          }
        }
      }
      if (newData.categoryId) setCascadingFromCategoryId(newData.categoryId)
    }
  }, { immediate: true })

  // Initialize
  onMounted(async () => {
    await fetchCategories()
    window.addEventListener('scroll', () => {
      sections.forEach(s => {
        const el = document.getElementById(s.id)
        if (el && window.scrollY >= el.offsetTop - 150) {
          activeSection.value = s.id
        }
      })
    })
  })

  // Category Handlers
  const handleMainCategoryChange = () => { 
    selectedSubCategory1.value = ''
    selectedSubCategory2.value = ''
    form.value.categoryId = selectedMainCategory.value 
  }
  const handleSubCategory1Change = () => { 
    selectedSubCategory2.value = ''
    form.value.categoryId = selectedSubCategory1.value || selectedMainCategory.value 
  }
  const handleSubCategory2Change = () => { 
    form.value.categoryId = selectedSubCategory2.value || selectedSubCategory1.value || selectedMainCategory.value 
  }

  return {
    form,
    sections,
    flags,
    activeSection,
    isEditing,
    foundCatalogProduct,
    isBarcodeChecking,
    allCategories,
    newImageUrl,
    categoryAttributes,
    mainCategories,
    subCategories1,
    subCategories2,
    selectedMainCategory,
    selectedSubCategory1,
    selectedSubCategory2,
    scrollToSection,
    isSectionComplete,
    checkBarcode,
    handleFileUpload,
    addImageUrl,
    removeImage,
    setAsMain,
    handleMainCategoryChange,
    handleSubCategory1Change,
    handleSubCategory2Change,
    validateForm
  }
}
