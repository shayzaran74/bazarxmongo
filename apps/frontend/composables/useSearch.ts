import { useDebounceFn } from '@vueuse/core'
import type { Product } from '~/types/catalog'
import type { PaginatedResponse } from '~/types/api'

export function useSearch() {
  const { $api } = useApi()
  const router = useRouter()

  const query = ref('')
  const suggestions = ref<Product[]>([])
  const loading = ref(false)
  const showDropdown = ref(false)

  /** Debounced arama — 300ms */
  const fetchSuggestions = useDebounceFn(async () => {
    if (query.value.length < 2) {
      suggestions.value = []
      showDropdown.value = false
      return
    }

    loading.value = true
    try {
      const response = await $api<Product[]>('products', {
        query: { search: query.value, limit: 5 },
      })
      if (response.success && response.data) {
        suggestions.value = response.data
        showDropdown.value = true
      }
    } catch {
      suggestions.value = []
    } finally {
      loading.value = false
    }
  }, 300)

  /** Enter ile arama sayfasına git */
  function submitSearch() {
    if (query.value.length < 2) return
    showDropdown.value = false
    router.push({ path: '/search', query: { q: query.value } })
  }

  /** Dropdown kapat */
  function closeDropdown() {
    showDropdown.value = false
  }

  return {
    query,
    suggestions,
    loading,
    showDropdown,
    fetchSuggestions,
    submitSearch,
    closeDropdown,
  }
}
