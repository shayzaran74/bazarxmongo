export const useAppImage = () => {
  const config = useRuntimeConfig()

  const resolveImageUrl = (
    url: string | { url?: string } | null | undefined,
    fallback = 'https://placehold.co/400x400?text=Resim'
  ): string => {
    if (!url) return fallback

    // Eğer nesne ise url alanını al ({ url: '...' })
    const finalUrl = typeof url === 'string' ? url : (url?.url || fallback)

    if (!finalUrl || typeof finalUrl !== 'string') return fallback

    if (finalUrl.startsWith('blob:') || finalUrl.startsWith('data:')) {
      return finalUrl
    }

    const minioIndex = finalUrl.indexOf('/bazarx-media/')
    if (minioIndex !== -1) {
      const path = finalUrl.substring(minioIndex)
      if (typeof window !== 'undefined') {
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        if (isDev) {
          const cleanPath = path.substring('/bazarx-media'.length)
          return `${config.public.minioBase}${cleanPath}`
        }
      }
      return path
    }

    if (finalUrl.startsWith('http://') || finalUrl.startsWith('https://')) {
      return finalUrl
    }

    if (finalUrl.startsWith('/')) {
      return `${config.public.apiBase}${finalUrl}`
    }

    return finalUrl
  }

  const getProductImage = (product: Record<string, unknown>): string => {
    const url = product?.image ||
      (product?.media as Array<{ url?: string }>)?.[0]?.url ||
      (product?.images as string[])?.[0] ||
      (product?.CatalogProduct as { media?: Array<{ url?: string }> })?.media?.[0]?.url

    return resolveImageUrl(url as string | { url?: string } | null | undefined, 'https://placehold.co/400x400?text=Ürün')
  }

  return { resolveImageUrl, getProductImage }
}
