import type { Category } from '~/types/catalog'
import type { ApiResponse } from '~/types/api'

/** Mega menu kategorileri — singleton cache */
export function useCategories() {
  const { $api } = useApi()

  return useAsyncData<Category[]>(
    'mega-menu-categories',
    async () => {
      const response = await $api<Category[]>('categories/mega-menu')
      return response.success ? response.data : []
    },
    {
      lazy: true,
      server: false,
      default: () => [] as Category[],
    },
  )
}

/** Tüm kategoriler (tree yapısında) */
export function useCategoryTree() {
  const { $api } = useApi()

  return useAsyncData<Category[]>(
    'category-tree',
    async () => {
      const response = await $api<Category[]>('categories', {
        query: { all: true, includeChildren: true },
      })
      if (response.success && response.data) {
        // Sadece üst kategorileri döndür (children zaten include edilmiş)
        return response.data.filter((c) => !c.parentId)
      }
      return []
    },
    {
      default: () => [] as Category[],
    },
  )
}
