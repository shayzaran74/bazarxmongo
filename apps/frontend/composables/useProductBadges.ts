import type { Product, DynamicBadges } from '~/types/catalog'

export const useProductBadges = () => {
    const getProductBadges = (product?: Product | null): DynamicBadges => {
        if (!product || !product.dynamicBadges) return {}

        // Backend BadgeService zaten BadgeRule tablosunu değerlendirir ve
        // pozisyona göre anahtarlanmış dynamicBadges döndürür: { topLeft, topRight, vb. }
        // Her nesne { text, class, style: { backgroundColor, color }, iconUrl } içerir.
        return {
            topLeft: product.dynamicBadges.topLeft || null,
            topRight: product.dynamicBadges.topRight || null,
            bottomLeft: product.dynamicBadges.bottomLeft || null,
            bottomRight: product.dynamicBadges.bottomRight || null,
        }
    }

    return {
        getProductBadges
    }
}
