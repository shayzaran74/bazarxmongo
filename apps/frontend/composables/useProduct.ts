import type { Product, Review } from '~/types/catalog'
import type { ApiResponse, PaginatedResponse } from '~/types/api'

export function useProduct(slug: Ref<string> | string) {
  const { $api } = useApi()
  const slugValue = typeof slug === 'string' ? slug : slug.value

  /** SSR uyumlu ürün fetch */
  const { data: product, pending: loading, error } = useAsyncData<Product | null>(
    `product-${slugValue}`,
    async () => {
      const response = await $api<Product>(`products/${slugValue}`)
      return response.success ? response.data : null
    },
  )

  /** İlgili ürünler (lazy, client-side) */
  const relatedProducts = ref<Product[]>([])
  const loadingRelated = ref(false)

  async function fetchRelated() {
    if (!product.value?.category?.slug) return
    loadingRelated.value = true
    try {
      const response = await $api<Product[]>('products', {
        query: {
          categorySlug: product.value.category.slug,
          limit: 5,
        },
      })
      if (response.success && response.data) {
        relatedProducts.value = response.data
          .filter((p) => p.id !== product.value?.id)
          .slice(0, 4)
      }
    } catch {
      // İlgili ürünler kritik değil
    } finally {
      loadingRelated.value = false
    }
  }

  /** Yorumlar (lazy, paginated) */
  const reviews = ref<Review[]>([])
  const loadingReviews = ref(false)

  async function fetchReviews(page = 1) {
    if (!product.value?.id) return
    loadingReviews.value = true
    try {
      const response = await $api<Review[]>('reviews', {
        query: { productId: product.value.id, page, limit: 10 },
      })
      if (response.success && response.data) {
        reviews.value = response.data
      }
    } catch {
      // Yorumlar kritik değil
    } finally {
      loadingReviews.value = false
    }
  }

  return {
    product,
    loading,
    error,
    relatedProducts,
    loadingRelated,
    fetchRelated,
    reviews,
    loadingReviews,
    fetchReviews,
  }
}
