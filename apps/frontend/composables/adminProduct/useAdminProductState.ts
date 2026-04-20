import { ref, computed } from 'vue'
import type { Product, Category, Brand, AdminVendor, ProductType, CategoryAttribute } from '@barterborsa/shared-types'

export const defaultFormData = {
  barcode: '',
  modelCode: '',
  name: '',
  description: '',
  categoryId: '',
  brandId: '',
  productImages: [] as string[],
  currency: 'TRY',
  price: null,
  marketPrice: null,
  compareAtPrice: null,
  costPerItem: null,
  vatRate: 18,
  stock: 0,
  sku: '',
  stockCode: '',
  trackInventory: true,
  continueSellingOutOfStock: false,
  badgeText: '',
  badgeColor: '#ef4444',
  weight: null,
  desi: null,
  attributes: {},
  productTypeId: '',
  shippingTime: '',
  shippingType: '',
  requiresShipping: true,
  origin: '',
  material: '',
  color: '',
  webColor: '',
  size: '',
  weight_display: '',
  filling: '',
  features: '',
  washingInstructions: '',
  material_composition: '',
  lotInfo: '',
  manufacturerName: '',
  manufacturerAddress: '',
  manufacturerEmail: '',
  importerName: '',
  importerAddress: '',
  importerEmail: '',
  secondaryImporterName: '',
  secondaryImporterAddress: '',
  secondaryImporterEmail: '',
  tertiaryImporterName: '',
  tertiaryImporterAddress: '',
  tertiaryImporterEmail: '',
  image: '',
  visual1: '',
  visual2: '',
  visual3: '',
  visual4: '',
  visual5: '',
  visual6: '',
  visual7: '',
  visual8: '',
  packageVisualFront: '',
  packageVisualBack: '',
  energyLabel: '',
  productInfoForm: '',
  ceCompliance: false,
  eceCompliance: false,
  isActive: true,
  isTaxable: true,
  isFeatured: false,
  isSpecialOffer: false,
  isFlashSale: false,
  productType: '',
  vendor: '',
  tags: '',
  metaTitle: '',
  metaDescription: '',
  handle: '',
  publishedAt: null,
  hasVariants: false,
  variants: [],
  lowStockThreshold: 5,
  trendyolProductId: '',
  dimensions: { length: 0, width: 0, height: 0 }
}

export interface BulkUpdatePayload {
  isFeatured?: boolean | string
  isSpecialOffer?: boolean | string
  isFlashSale?: boolean | string
  isActive?: boolean | string
  status?: string
  visibility?: string
}

export const useAdminProductState = () => {
  // State
  const products = ref<Product[]>([])
  const vendors = ref<AdminVendor[]>([])
  const categories = ref<Category[]>([])
  const brands = ref<Brand[]>([])
  const productTypes = ref<ProductType[]>([])
  const categoryAttributes = ref<CategoryAttribute[]>([])
  const formData = ref({ ...defaultFormData })
  
  const loading = ref(false)
  const loadingProducts = ref(false)
  const editingId = ref<string | number | null>(null)
  const showForm = ref(false)
  
  // Filters & List State
  const showVendorProducts = ref(false)
  const showPendingProducts = ref(false)
  const searchQuery = ref('')
  const selectedFilterCategoryId = ref('')
  const selectedFilterVendorId = ref('')
  const pagination = ref({ page: 1, limit: 50, total: 0, pages: 1 })
  const selectedProductIds = ref<(string | number)[]>([])
  
  // Bulk Edit State
  const bulkProcessing = ref(false)
  const showBulkEditModal = ref(false)
  const bulkUpdateForm = ref<BulkUpdatePayload>({
    isFeatured: undefined,
    isSpecialOffer: undefined,
    isFlashSale: undefined,
    isActive: undefined,
    status: undefined,
    visibility: undefined
  })

  // Category Selection State for Form
  const selectedMainCategory = ref('')
  const selectedSubCategory1 = ref('')
  const selectedSubCategory2 = ref('')
  
  const variationOptions = ref([{ name: '', valuesStr: '' }])

  // Computed
  const mainCategories = computed(() => categories.value.filter(c => !c.parentId))
  const subCategories1 = computed(() => {
    if (!selectedMainCategory.value) return []
    return categories.value.filter(c => String(c.parentId) === String(selectedMainCategory.value))
  })
  const subCategories2 = computed(() => {
    if (!selectedSubCategory1.value) return []
    return categories.value.filter(c => String(c.parentId) === String(selectedSubCategory1.value))
  })
  const isAllSelected = computed(() => {
    return products.value.length > 0 && selectedProductIds.value.length === products.value.length
  })
  const selectedProductTypeSchema = computed(() => {
    if (!formData.value.productTypeId) return null
    return productTypes.value.find(t => t.id === formData.value.productTypeId)?.schema || null
  })

  return {
    products, vendors, categories, brands, productTypes, categoryAttributes, formData,
    loading, loadingProducts, editingId, showForm, showVendorProducts, showPendingProducts,
    searchQuery, selectedFilterCategoryId, selectedFilterVendorId, pagination,
    selectedProductIds, bulkProcessing, showBulkEditModal,
    selectedMainCategory, selectedSubCategory1, selectedSubCategory2,
    bulkUpdateForm, variationOptions,
    mainCategories, subCategories1, subCategories2, isAllSelected, selectedProductTypeSchema
  }
}
