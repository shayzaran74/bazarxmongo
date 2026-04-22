export const useAppImage = () => {
  const config = useRuntimeConfig()

  const resolveImageUrl = (
    url: any,
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

  const getProductImage = (product: any): string => {
    const url = product?.image ||
      product?.media?.[0]?.url ||
      product?.images?.[0] ||
      product?.CatalogProduct?.media?.[0]?.url

    return resolveImageUrl(url, 'https://placehold.co/400x400?text=Ürün')
  }

  return { resolveImageUrl, getProductImage }
}
