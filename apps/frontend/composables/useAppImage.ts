import type { Category } from '~/types/catalog'

export const useAppImage = () => {
    const config = useRuntimeConfig()

    /**
     * Resolves an image URL and ensures it's optimized/correctly formatted
     * @param {string|Object} url - The image URL string or product image object
     * @param {string} fallbackType - 'product', 'avatar', 'category', 'ad'
     * @returns {string}
     */
    const resolveImageUrl = (url: string | { url: string } | null | undefined, fallbackType: 'product' | 'avatar' | 'category' | 'ad' = 'product'): string => {
        const fallbacks: Record<string, string> = {
            product: 'https://placehold.co/600x600/f8fafc/64748b?text=Ürün+Görseli',
            avatar: 'https://placehold.co/200x200/f1f5f9/94a3b8?text=Profil',
            category: 'https://placehold.co/400x400/f1f5f9/94a3b8?text=Kategori',
            ad: 'https://placehold.co/400x600/f1f5f9/64748b?text=Kampanya'
        }

        // Eğer bir image nesnesi geçilmişse kontrol et
        let sourceUrl = url
        if (url && typeof url === 'object' && url.url) {
            sourceUrl = url.url
        }

        if (!sourceUrl) return fallbacks[fallbackType] || fallbacks.product

        // DB'de saklanan eski IP'leri yakala ve güncelle
        if (typeof sourceUrl === 'string') {
            sourceUrl = sourceUrl
                .replace(/192\.168\.1\.19(\.nip\.io)?/g, '172.20.10.8.nip.io')
                .replace(/169\.254\.170\.52(\.nip\.io)?/g, '172.20.10.8.nip.io')
                .replace(/172\.20\.10\.2(\.nip\.io)?/g, '172.20.10.8.nip.io')
                .replace(/172\.20\.10\.7(\.nip\.io)?/g, '172.20.10.8.nip.io')
                .replace(/192\.168\.1\.108(\.nip\.io)?/g, '172.20.10.8.nip.io')
                .replace(/192\.168\.1\.103(\.nip\.io)?/g, '172.20.10.8.nip.io')
                .replace(/192\.168\.1\.104(\.nip\.io)?/g, '172.20.10.8.nip.io')
                .replace(/192\.168\.1\.101(\.nip\.io)?/g, '172.20.10.8.nip.io')
        }

        // Eğer zaten tam bir URL veya data URI ise olduğu gibi döndür
        if (typeof sourceUrl === 'string' && (sourceUrl.startsWith('http://') || sourceUrl.startsWith('https://') || sourceUrl.startsWith('data:'))) {
            return sourceUrl
        }

        // Çift slash oluşmaması için path birleştirmeyi dikkatli yap
        const apiBase = config.public.apiBase;
        const cleanBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase
        const cleanPath = String(sourceUrl).startsWith('/') ? sourceUrl : `/${sourceUrl}`

        return `${cleanBase}${cleanPath}`
    }

    /**
     * Gets a relevant category image based on name or provided URL
     * @param {Object} category - The category object
     * @returns {string}
     */
    const getCategoryImage = (category: Category | null | undefined): string => {
        if (!category) return 'https://placehold.co/400x400/f1f5f9/94a3b8?text=Kategori'

        if (category.image) {
            return resolveImageUrl(category.image, 'category')
        }

        // Keyword tabanlı servise geri dön (fallback)
        const keyword = encodeURIComponent(category.name?.toLowerCase() || 'shopping')
        return `https://loremflickr.com/400/400/${keyword},shopping/all`
    }

    return {
        resolveImageUrl,
        getCategoryImage
    }
}
