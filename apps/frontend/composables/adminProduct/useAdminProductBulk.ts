import { useAdminProductService } from '~/services/api/AdminProductService'
import { useNuxtApp } from '#app'
import type { useAdminProductState } from './useAdminProductState'
import type { BulkUpdatePayload } from './useAdminProductState'

export const useAdminProductBulk = (
  state: ReturnType<typeof useAdminProductState>,
  fetchProducts: (page?: number) => Promise<void>
) => {
  const adminProductService = useAdminProductService()
  const toast = useNuxtApp().$toast

  const bulkApprove = async () => {
    if (state.selectedProductIds.value.length === 0) return
    state.bulkProcessing.value = true
    try {
      await Promise.all(state.selectedProductIds.value.map(id => adminProductService.approveProduct(id)))
      toast.success('Seçili ürünler onaylandı')
      state.selectedProductIds.value = []
      await fetchProducts(state.pagination.value.page)
    } catch {
      toast.error('Toplu onay işlemi sırasında hata oluştu')
    } finally {
      state.bulkProcessing.value = false
    }
  }

  const bulkDelete = async () => {
    if (state.selectedProductIds.value.length === 0 || !confirm('Seçili ürünleri silmek istediğinizden emin misiniz?')) return
    state.bulkProcessing.value = true
    try {
      const response = await adminProductService.bulkDelete(state.selectedProductIds.value)
      if (response.success) {
        toast.success('Seçili ürünler silindi')
        state.selectedProductIds.value = []
        await fetchProducts(state.pagination.value.page)
      }
    } catch {
      toast.error('Toplu silme işlemi sırasında hata oluştu')
    } finally {
      state.bulkProcessing.value = false
    }
  }

  const executeBulkUpdate = async (emittedForm?: BulkUpdatePayload) => {
    if (state.selectedProductIds.value.length === 0) return
    state.bulkProcessing.value = true
    try {
      const sourceForm = emittedForm || state.bulkUpdateForm.value
      const updates = Object.fromEntries(
        Object.entries(sourceForm).filter(([, v]) => v !== undefined)
      )
      const response = await adminProductService.bulkUpdate(state.selectedProductIds.value, updates)
      if (response.success) {
        toast.success('Değişiklikler uygulandı')
        state.showBulkEditModal.value = false
        state.selectedProductIds.value = []
        await fetchProducts(state.pagination.value.page)
      }
    } catch {
      toast.error('Güncelleme sırasında hata oluştu')
    } finally {
      state.bulkProcessing.value = false
    }
  }

  return { bulkApprove, bulkDelete, executeBulkUpdate }
}
