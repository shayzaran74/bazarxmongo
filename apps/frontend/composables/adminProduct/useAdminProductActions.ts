import { useAdminProductService } from '~/services/api/AdminProductService'
import { useCategoryService } from '~/services/api/CategoryService'
import { useBrandService } from '~/services/api/BrandService'
import type { useAdminProductState, defaultFormData } from './useAdminProductState'
import { useNuxtApp } from '#app'
import { useApi } from '~/composables/useApi'
import type { CategoryAttribute, Product } from '@barterborsa/shared-types'

export const useAdminProductActions = (
  state: ReturnType<typeof useAdminProductState>,
  defaultFormDataRef: typeof defaultFormData
) => {
  const adminProductService = useAdminProductService()
  const categoryService = useCategoryService()
  const brandService = useBrandService()
  const toast = useNuxtApp().$toast
  const { $api } = useApi()

  const fetchInitialData = async () => {
    state.loading.value = true
    try {
      const [categoriesRes, vendorsRes, productTypesRes, brandsRes] = await Promise.all([
        categoryService.getCategories({ all: true }),
        adminProductService.getVendors(),
        adminProductService.getProductTypes(),
        brandService.getBrands()
      ])

      if (categoriesRes.success) state.categories.value = categoriesRes.data || []
      if (vendorsRes.success) state.vendors.value = vendorsRes.data || []
      if (productTypesRes.success) state.productTypes.value = productTypesRes.data || []
      if (brandsRes.success) state.brands.value = brandsRes.data || []
    } catch (error) {
      console.error('Error fetching initial data:', error)
    } finally {
      state.loading.value = false
    }
  }

  const fetchProducts = async (page = 1) => {
    state.loadingProducts.value = true
    try {
      const params = {
        page,
        limit: state.pagination.value.limit,
        search: state.searchQuery.value || undefined,
        categoryId: state.selectedFilterCategoryId.value || undefined,
        vendorId: state.selectedFilterVendorId.value || (state.showVendorProducts.value ? 'true' : undefined),
        status: state.showPendingProducts.value ? 'PENDING' : undefined
      }

      const response = await adminProductService.getProducts(params)
      if (response.success && response.data) {
        state.products.value = response.data.items || []
        if (response.pagination) {
          state.pagination.value = {
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
      state.loadingProducts.value = false
    }
  }

  const fetchCategoryAttributes = async (categoryId: string | number) => {
    if (!categoryId) {
      state.categoryAttributes.value = []
      return
    }
    try {
      const response = await $api<CategoryAttribute[]>(`/api/categories/${categoryId}/attributes`)
      if (response.success && response.data) {
        state.categoryAttributes.value = response.data || []
        state.categoryAttributes.value.forEach((attr: CategoryAttribute) => {
          const attrs = state.formData.value.attributes as Record<string, unknown>
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
    state.formData.value = { ...defaultFormDataRef, dimensions: { length: 0, width: 0, height: 0 }, attributes: {}, productImages: [], variants: [] }
    state.editingId.value = null
    state.selectedMainCategory.value = ''
    state.selectedSubCategory1.value = ''
    state.selectedSubCategory2.value = ''
    state.variationOptions.value = [{ name: '', valuesStr: '' }]
  }

  const submitForm = async () => {
    state.loading.value = true
    if (!state.formData.value.image && state.formData.value.productImages && state.formData.value.productImages.length > 0) {
      state.formData.value.image = state.formData.value.productImages[0]
    }
    
    try {
      const response = state.editingId.value 
        ? await adminProductService.updateProduct(state.editingId.value, state.formData.value)
        : await adminProductService.createProduct(state.formData.value)
        
      if (response.success) {
        state.showForm.value = false
        resetForm()
        await fetchProducts(state.pagination.value.page)
        toast.success(state.editingId.value ? 'Ürün güncellendi' : 'Ürün eklendi')
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Bir hata oluştu'
      toast.error(error)
    } finally {
      state.loading.value = false
    }
  }

  const deleteProduct = async (id: string | number) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return
    try {
      const response = await adminProductService.deleteProduct(id)
      if (response.success) {
        toast.success('Ürün silindi')
        await fetchProducts(state.pagination.value.page)
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
        await fetchProducts(state.pagination.value.page)
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Onay işlemi başarısız'
      toast.error(error)
    }
  }

  const editProduct = (product: Product & { attributes?: Record<string, unknown>, categoryId?: string | number }) => {
    state.editingId.value = product.id
    state.formData.value = { ...product, attributes: product.attributes || {} } as unknown as typeof defaultFormDataRef
    
    if (product.categoryId) {
      fetchCategoryAttributes(product.categoryId)
      const cat = state.categories.value.find(c => String(c.id) === String(product.categoryId))
      if (cat) {
        if (!cat.parentId) {
          state.selectedMainCategory.value = String(cat.id)
        } else {
          const parent = state.categories.value.find(c => String(c.id) === String(cat.parentId))
          if (parent && !parent.parentId) {
            state.selectedMainCategory.value = String(parent.id)
            state.selectedSubCategory1.value = String(cat.id)
          } else if (parent && parent.parentId) {
            const grandParent = state.categories.value.find(c => String(c.id) === String(parent.parentId))
            if (grandParent) {
              state.selectedMainCategory.value = String(grandParent.id)
              state.selectedSubCategory1.value = String(parent.id)
              state.selectedSubCategory2.value = String(cat.id)
            }
          }
        }
      }
    }

    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      state.formData.value.productImages = product.images.map((img: any): string => 
        typeof img === 'object' ? (img.url as string) : (img as string)
      )
    } else {
      const mainImage = product.image ? (typeof product.image === 'object' ? (product.image as any).url : product.image) : null
      state.formData.value.productImages = mainImage ? [mainImage as string] : []
    }

    if (!state.formData.value.dimensions) {
      state.formData.value.dimensions = { length: 0, width: 0, height: 0 }
    }

    if (product.hasVariants && product.variants && product.variants.length > 0) {
      const optionsMap: Record<string, Set<string | number>> = {}
      product.variants.forEach((v: any) => {
        if (v.attributes) {
          Object.entries(v.attributes).forEach(([key, val]: [string, any]) => {
            if (!optionsMap[key]) optionsMap[key] = new Set()
            optionsMap[key].add(val as string | number)
          })
        }
      })
      state.variationOptions.value = Object.entries(optionsMap).map(([name, valuesSet]) => ({
        name,
        valuesStr: Array.from(valuesSet).join(', ')
      }))
    } else {
      state.variationOptions.value = [{ name: '', valuesStr: '' }]
    }

    state.showForm.value = true
  }

  const toggleSelectAll = () => {
    if (state.isAllSelected.value) {
      state.selectedProductIds.value = []
    } else {
      state.selectedProductIds.value = state.products.value.map(p => p.id)
    }
  }

  return {
    fetchInitialData, fetchProducts, fetchCategoryAttributes, resetForm, submitForm,
    deleteProduct, approveProduct, editProduct, toggleSelectAll
  }
}
