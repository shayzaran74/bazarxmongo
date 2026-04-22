export const useSurplusList = () => {
  const { $api } = useApi()

  const items = ref<any[]>([])
  const loading = ref(false)
  const filters = reactive({ search: '', category: '', city: '', page: 1 })
  const total = ref(0)

  const fetchItems = async () => {
    loading.value = true
    try {
      const res = await $api<{ success: boolean; data: any }>('/api/surplus', {
        query: {
          q: filters.search || undefined,
          categoryId: filters.category || undefined,
          city: filters.city || undefined,
          page: filters.page,
        }
      })
      const resAny = res as any
      items.value = resAny.data?.items || resAny.data || []
      total.value = resAny.data?.total || items.value.length
    } catch { /* ignore */ } finally {
      loading.value = false
    }
  }

  onMounted(fetchItems)
  watch(filters, fetchItems)

  return { items, loading, filters, total, fetchItems }
}
