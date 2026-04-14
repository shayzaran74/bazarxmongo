import { ref, computed, watch } from 'vue'
import { useAdminProductService } from '~/services/api/AdminProductService'
import { useCategoryService } from '~/services/api/CategoryService'
import { useBrandService } from '~/services/api/BrandService'
import type { Product, Category, Brand, AdminVendor, ProductType, CategoryAttribute } from '@barterborsa/shared-types'
import type { ApiResponse } from '@barterborsa/shared-types'

const defaultFormData = {
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

interface BulkUpdatePayload {
  isFeatured?: boolean | string
  isSpecialOffer?: boolean | string
  isFlashSale?: boolean | string
  isActive?: boolean | string
  status?: string
  visibility?: string
}

export const useAdminProducts = () => {
  const adminProductService = useAdminProductService()
  const categoryService = useCategoryService()
  const brandService = useBrandService()
  const toast = useNuxtApp().$toast
  const { $api } = useApi()

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
  const showVendorProducts = ref(false)
  const showPendingProducts = ref(false)
  const searchQuery = ref('')
  const selectedFilterCategoryId = ref('')
  const selectedFilterVendorId = ref('')
  const pagination = ref({ page: 1, limit: 50, total: 0, pages: 1 })
  const selectedProductIds = ref<(string | number)[]>([])
  const bulkProcessing = ref(false)
  const showBulkEditModal = ref(false)
  const selectedMainCategory = ref('')
  const selectedSubCategory1 = ref('')
  const selectedSubCategory2 = ref('')
  const bulkUpdateForm = ref<BulkUpdatePayload>({
    isFeatured: undefined,
    isSpecialOffer: undefined,
    isFlashSale: undefined,
    isActive: undefined,
    status: undefined,
    visibility: undefined
  })

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

  // Methods
  const fetchInitialData = async () => {
    loading.value = true
    try {
      const [categoriesRes, vendorsRes, productTypesRes, brandsRes] = await Promise.all([
        categoryService.getCategories({ all: true }),
        adminProductService.getVendors(),
        adminProductService.getProductTypes(),
        brandService.getBrands()
      ])

      if (categoriesRes.success) categories.value = categoriesRes.data
      if (vendorsRes.success) vendors.value = vendorsRes.data
      if (productTypesRes.success) productTypes.value = productTypesRes.data
      if (brandsRes.success) brands.value = brandsRes.data
    } catch (error) {
      console.error('Error fetching initial data:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchProducts = async (page = 1) => {
    loadingProducts.value = true
    try {
      const params = {
        page,
        limit: pagination.value.limit,
        search: searchQuery.value || undefined,
        categoryId: selectedFilterCategoryId.value || undefined,
        vendorId: selectedFilterVendorId.value || (showVendorProducts.value ? 'true' : undefined),
        status: showPendingProducts.value ? 'PENDING' : undefined
      }

      const response = await adminProductService.getProducts(params)
      if (response.success) {
        products.value = response.data
        if (response.pagination) {
          pagination.value = {
            page: response.pagination.page,
            limit: response.pagination.limit,
            total: response.pagination.total,
            pages: response.pagination.totalPages
          }
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      loadingProducts.value = false
    }
  }

  const fetchCategoryAttributes = async (categoryId: string | number) => {
    if (!categoryId) {
      categoryAttributes.value = []
      return
    }
    try {
      const response = await $api<ApiResponse<CategoryAttribute[]>>(`/api/categories/${categoryId}/attributes`)
      if (response.success && response.data) {
        categoryAttributes.value = response.data
        categoryAttributes.value.forEach(attr => {
          const attrs = formData.value.attributes as Record<string, unknown>
          if (attrs[attr.name] === undefined) {
            if (attr.type === 'checkbox') attrs[attr.name] = false
            else if (attr.type === 'number') attrs[attr.name] = null
            else if (attr.type === 'multiselect') attrs[attr.name] = []
            else attrs[attr.name] = ''
          }
        })
      }
    } catch (error) {
      console.error('Error fetching category attributes:', error)
    }
  }

  const resetForm = () => {
    formData.value = { ...defaultFormData, dimensions: { length: 0, width: 0, height: 0 }, attributes: {}, productImages: [], variants: [] }
    editingId.value = null
    selectedMainCategory.value = ''
    selectedSubCategory1.value = ''
    selectedSubCategory2.value = ''
    variationOptions.value = [{ name: '', valuesStr: '' }]
  }

  const submitForm = async () => {
    loading.value = true
    // If no main image but has images array, pick the first one
    if (!formData.value.image && formData.value.productImages && formData.value.productImages.length > 0) {
      formData.value.image = formData.value.productImages[0]
    }
    
    try {
      const response = editingId.value 
        ? await adminProductService.updateProduct(editingId.value, formData.value)
        : await adminProductService.createProduct(formData.value)
        
      if (response.success) {
        showForm.value = false
        resetForm()
        await fetchProducts(pagination.value.page)
        toast.success(editingId.value ? 'Ürün güncellendi' : 'Ürün eklendi')
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Bir hata oluştu'
      toast.error(error)
    } finally {
      loading.value = false
    }
  }

  const deleteProduct = async (id: string | number) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return
    try {
      const response = await adminProductService.deleteProduct(id)
      if (response.success) {
        toast.success('Ürün silindi')
        await fetchProducts(pagination.value.page)
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Silme işlemi başarısız'
      toast.error(error)
    }
  }

  const approveProduct = async (id: string | number) => {
    try {
      const response = await adminProductService.approveProduct(id)
      if (response.success) {
        toast.success('Ürün onaylandı')
        await fetchProducts(pagination.value.page)
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Onay işlemi başarısız'
      toast.error(error)
    }
  }

  const bulkApprove = async () => {
    if (selectedProductIds.value.length === 0) return
    bulkProcessing.value = true
    try {
      // Approve individually for now as there's no bulk approve endpoint specified, 
      // or use bulkUpdate if status=ACTIVE works
      await Promise.all(selectedProductIds.value.map(id => adminProductService.approveProduct(id)))
      toast.success('Seçili ürünler onaylandı')
      selectedProductIds.value = []
      await fetchProducts(pagination.value.page)
    } catch (error) {
      toast.error('Toplu onay işlemi sırasında hata oluştu')
    } finally {
      bulkProcessing.value = false
    }
  }

  const bulkDelete = async () => {
    if (selectedProductIds.value.length === 0 || !confirm('Seçili ürünleri silmek istediğinizden emin misiniz?')) return
    bulkProcessing.value = true
    try {
      const response = await adminProductService.bulkDelete(selectedProductIds.value)
      if (response.success) {
        toast.success('Seçili ürünler silindi')
        selectedProductIds.value = []
        await fetchProducts(pagination.value.page)
      }
    } catch (error) {
      toast.error('Toplu silme işlemi sırasında hata oluştu')
    } finally {
      bulkProcessing.value = false
    }
  }

  const executeBulkUpdate = async (emittedForm?: BulkUpdatePayload) => {
    if (selectedProductIds.value.length === 0) return
    bulkProcessing.value = true
    try {
      const sourceForm = emittedForm || bulkUpdateForm.value
      const updates = Object.fromEntries(
        Object.entries(sourceForm).filter(([, v]) => v !== undefined)
      )
      
      const response = await adminProductService.bulkUpdate(selectedProductIds.value, updates)
      if (response.success) {
        toast.success('Değişiklikler uygulandı')
        showBulkEditModal.value = false
        selectedProductIds.value = []
        await fetchProducts(pagination.value.page)
      }
    } catch (err: unknown) {
      toast.error('Guncelleme sirasinda hata olustu')
    } finally {
      bulkProcessing.value = false
    }
  }

  const editProduct = (product: Product & { attributes?: Record<string, unknown>, categoryId?: string | number }) => {
    editingId.value = product.id
    formData.value = { ...product, attributes: product.attributes || {} } as unknown as typeof defaultFormData
    
    // Handle category chain
    if (product.categoryId) {
      fetchCategoryAttributes(product.categoryId)
      const cat = categories.value.find(c => String(c.id) === String(product.categoryId))
      if (cat) {
        if (!cat.parentId) {
          selectedMainCategory.value = String(cat.id)
        } else {
          const parent = categories.value.find(c => String(c.id) === String(cat.parentId))
          if (parent && !parent.parentId) {
            selectedMainCategory.value = String(parent.id)
            selectedSubCategory1.value = String(cat.id)
          } else if (parent && parent.parentId) {
            const grandParent = categories.value.find(c => String(c.id) === String(parent.parentId))
            if (grandParent) {
              selectedMainCategory.value = String(grandParent.id)
              selectedSubCategory1.value = String(parent.id)
              selectedSubCategory2.value = String(cat.id)
            }
          }
        }
      }
    }

    // Handle images array
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      formData.value.productImages = product.images.map((img: string | { url: string }) => typeof img === 'object' ? img.url : img)
    } else {
      formData.value.productImages = product.image ? [product.image] : []
    }

    if (!formData.value.dimensions) {
      formData.value.dimensions = { length: 0, width: 0, height: 0 }
    }

    // Variations
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      const optionsMap: Record<string, Set<string | number>> = {}
      product.variants.forEach((v) => {
        if (v.attributes) {
          Object.entries(v.attributes).forEach(([key, val]) => {
            if (!optionsMap[key]) optionsMap[key] = new Set()
            optionsMap[key].add(val)
          })
        }
      })
      variationOptions.value = Object.entries(optionsMap).map(([name, valuesSet]) => ({
        name,
        valuesStr: Array.from(valuesSet).join(', ')
      }))
    } else {
      variationOptions.value = [{ name: '', valuesStr: '' }]
    }

    showForm.value = true
  }

  const toggleSelectAll = () => {
    if (isAllSelected.value) {
      selectedProductIds.value = []
    } else {
      selectedProductIds.value = products.value.map(p => p.id)
    }
  }

  // Watch for filter changes
  watch([searchQuery, selectedFilterCategoryId, selectedFilterVendorId, showVendorProducts, showPendingProducts], () => {
    fetchProducts(1)
  })

  return {
    // State
    products, vendors, categories, brands, productTypes, categoryAttributes, formData,
    loading, loadingProducts, editingId, showForm, showVendorProducts, showPendingProducts,
    searchQuery, selectedFilterCategoryId, selectedFilterVendorId, pagination,
    selectedProductIds, bulkProcessing, showBulkEditModal,
    selectedMainCategory, selectedSubCategory1, selectedSubCategory2,
    bulkUpdateForm, variationOptions,

    // Computed
    mainCategories, subCategories1, subCategories2, isAllSelected, selectedProductTypeSchema,

    // Methods
    fetchInitialData, fetchProducts, fetchCategoryAttributes, resetForm, submitForm,
    deleteProduct, approveProduct, bulkApprove, bulkDelete, executeBulkUpdate,
    editProduct, toggleSelectAll
  }
}
