/**
 * useAdminProducts — Facade composable
 *
 * Delegates state, actions and bulk operations to focused sub-composables:
 *   - adminProduct/useAdminProductState   → reactive state + computed
 *   - adminProduct/useAdminProductActions → fetch, submit, delete, approve, edit
 *   - adminProduct/useAdminProductBulk   → bulk approve/delete/update
 *
 * All existing call sites remain unchanged since we re-export the same surface.
 */
import { watch } from 'vue'
import { useAdminProductState, defaultFormData } from './adminProduct/useAdminProductState'
import { useAdminProductActions } from './adminProduct/useAdminProductActions'
import { useAdminProductBulk } from './adminProduct/useAdminProductBulk'

export const useAdminProducts = () => {
  const state = useAdminProductState()
  const actions = useAdminProductActions(state, defaultFormData)
  const bulk = useAdminProductBulk(state, actions.fetchProducts)

  // Re-export the filter watch here (orchestration concern)
  watch(
    [
      state.searchQuery,
      state.selectedFilterCategoryId,
      state.selectedFilterVendorId,
      state.showVendorProducts,
      state.showPendingProducts
    ],
    () => actions.fetchProducts(1)
  )

  return {
    // State
    ...state,

    // Actions
    ...actions,

    // Bulk
    ...bulk
  }
}
