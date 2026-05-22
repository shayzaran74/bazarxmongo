// apps/frontend/composables/useSurplusList.ts

interface SurplusItem {
  id: string
  title: string
  category: string
  quantity: number
  unit: string
  unitPrice?: number
  status: string
  images?: string[]
  city?: string
  companyId?: string
  company?: { id: string; name: string }
  createdAt?: string
}

interface SurplusListMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface SurplusFilters {
  search: string
  category: string
  city: string
  page: number
}

export const useSurplusList = () => {
  const { $api } = useApi()

  const items = ref<SurplusItem[]>([])
  const loading = ref(false)
  const filters = reactive<SurplusFilters>({ search: '', category: '', city: '', page: 1 })
  const total = ref(0)
  const meta = ref<SurplusListMeta | null>(null)

  const fetchItems = async (): Promise<void> => {
    loading.value = true
    try {
      const res = await $api<{ success: boolean; data: SurplusItem[]; meta?: SurplusListMeta }>(
        '/api/v1/surplus',
        {
          query: {
            q:          filters.search   || undefined,
            categoryId: filters.category || undefined,
            city:       filters.city     || undefined,
            page:       filters.page,
          },
        },
      )
      const resAny = res as { data?: { items?: SurplusItem[] } | SurplusItem[]; meta?: SurplusListMeta }
      const dataField = resAny.data
      items.value = Array.isArray(dataField)
        ? dataField
        : (dataField as { items?: SurplusItem[] })?.items ?? []
      meta.value  = res.meta ?? null
      total.value = res.meta?.total ?? items.value.length
    } catch { /* hata filtresi tarafından işlenir */ } finally {
      loading.value = false
    }
  }

  onMounted(fetchItems)
  watch(filters, fetchItems)

  return { items, loading, filters, total, meta, fetchItems }
}
