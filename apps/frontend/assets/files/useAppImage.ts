// composables/useAppImage.ts
// placehold.co bağımlılığı kaldırıldı — yerel SVG placeholder kullanılıyor

export const useAppImage = () => {
  const config = useRuntimeConfig()

  // Yerel placeholder — public/ altında olmalı
  const PRODUCT_PLACEHOLDER = '/placeholder-product.svg'
  const AVATAR_PLACEHOLDER = '/placeholder-avatar.svg'

  const resolveImageUrl = (
    url: string | null | undefined,
    fallback?: string
  ): string => {
    if (!url) return fallback ?? PRODUCT_PLACEHOLDER

    // Tam URL ise olduğu gibi döndür
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }

    // MinIO / storage path ise prefix ekle
    if (url.startsWith('/')) {
      const minioBase = config.public.minioBase as string
      return `${minioBase}${url}`
    }

    return url
  }

  const getProductImage = (product: any): string => {
    return resolveImageUrl(
      product?.image ||
      product?.media?.[0]?.url ||
      product?.images?.[0],
      PRODUCT_PLACEHOLDER
    )
  }

  const getAvatarImage = (user: any): string => {
    return resolveImageUrl(
      user?.avatar || user?.avatarUrl,
      AVATAR_PLACEHOLDER
    )
  }

  const getVendorImage = (vendor: any): string => {
    return resolveImageUrl(
      vendor?.profile?.logo || vendor?.logo,
      PRODUCT_PLACEHOLDER
    )
  }

  return {
    resolveImageUrl,
    getProductImage,
    getAvatarImage,
    getVendorImage,
    PRODUCT_PLACEHOLDER,
    AVATAR_PLACEHOLDER,
  }
}
