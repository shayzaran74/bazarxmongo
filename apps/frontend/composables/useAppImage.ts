// apps/frontend/composables/useAppImage.ts

export const useAppImage = () => {
  /**
   * Public bir görsel anahtarı (objectKey) için API stream URL'ini üretir.
   * Ortam farkı olmaksızın proxy (/api/v1/media) üzerinden backend'e yönlendirilir.
   */
  const getPublicImageUrl = (objectKey: string): string => {
    if (!objectKey) {
      return '/images/placeholder.webp';
    }

    // Eğer zaten tam bir URL, base64 data veya blob ise olduğu gibi döndür
    if (
      objectKey.startsWith('http://') ||
      objectKey.startsWith('https://') ||
      objectKey.startsWith('data:') ||
      objectKey.startsWith('blob:')
    ) {
      return objectKey;
    }

    // Başındaki eğik çizgiyi temizle
    const cleanKey = objectKey.startsWith('/') ? objectKey.substring(1) : objectKey;

    // Eğer zaten api/v1/media ile başlıyorsa, çift ekleme yapmamak için doğrudan döndür
    if (cleanKey.startsWith('api/v1/media/')) {
      return `/${cleanKey}`;
    }

    return `/api/v1/media/${cleanKey}`;
  };

  /**
   * Görsel anahtarını çözümler. Null/undefined durumlarında varsayılan placeholder'ı döndürür.
   */
  const getImageUrl = (objectKey: string | null | undefined): string => {
    if (!objectKey) {
      return '/images/placeholder.webp';
    }
    return getPublicImageUrl(objectKey);
  };

  /**
   * Mevcut şablonlarda (templates) ve bileşenlerde kullanılan eski resolveImageUrl çağrıları için
   * geriye dönük uyumluluk sağlar. Nesne girdisini ({ url: '...' }) ve eski /bazarx-media/ formatını destekler.
   */
  const resolveImageUrl = (
    url: string | { url?: string } | null | undefined,
    fallback = '/images/placeholder.webp'
  ): string => {
    if (!url) return fallback;

    // Nesne ise içindeki url alanını al, yoksa fallback kullan
    const finalUrl = typeof url === 'string' ? url : (url?.url || fallback);

    if (!finalUrl || typeof finalUrl !== 'string') return fallback;

    if (
      finalUrl.startsWith('blob:') ||
      finalUrl.startsWith('data:') ||
      finalUrl.startsWith('http://') ||
      finalUrl.startsWith('https://')
    ) {
      return finalUrl;
    }

    // Eski veritabanı kayıtlarındaki /bazarx-media/ içeren URL'lerden key kısmını ayıkla
    const minioIndex = finalUrl.indexOf('/bazarx-media/');
    if (minioIndex !== -1) {
      const key = finalUrl.substring(minioIndex + '/bazarx-media/'.length);
      return getPublicImageUrl(key);
    }

    return getPublicImageUrl(finalUrl);
  };

  /**
   * Ürün objesinden görsel URL'ini çıkarıp çözümler.
   */
  const getProductImage = (product: Record<string, any>): string => {
    const url =
      product?.image ||
      (product?.media as Array<{ url?: string }>)?.[0]?.url ||
      (product?.images as string[])?.[0] ||
      (product?.CatalogProduct as { media?: Array<{ url?: string }> })?.media?.[0]?.url;

    return resolveImageUrl(url, '/images/placeholder.webp');
  };

  return {
    getPublicImageUrl,
    getImageUrl,
    resolveImageUrl,
    getProductImage,
  };
};
