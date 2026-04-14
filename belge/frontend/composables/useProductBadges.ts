import type { Product, DynamicBadges } from '@barterborsa/shared-types'

export const useProductBadges = () => {
    const getProductBadges = (product?: Product | null): DynamicBadges => {
        if (!product || !product.dynamicBadges) return {}

        // Backend BadgeService already evaluates the BadgeRule table and
        // returns dynamicBadges keyed by position: { topLeft, topRight, etc. }
        // Each object contains { text, class, style: { backgroundColor, color }, iconUrl }
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
