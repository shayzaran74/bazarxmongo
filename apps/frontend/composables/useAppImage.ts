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

    // Tam URL ise olduğu gibi döndür
    if (finalUrl.startsWith('http://') || finalUrl.startsWith('https://')) {
      return finalUrl
    }

    // MinIO veya storage path ise prefix ekle
    if (finalUrl.startsWith('/')) {
      return `${config.public.minioBase}${finalUrl}`
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
