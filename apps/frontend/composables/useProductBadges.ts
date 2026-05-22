import type { Product, DynamicBadges } from '@barterborsa/shared-types'

export const useProductBadges = () => {
    const getProductBadges = (product?: Product | null): DynamicBadges => {
        if (!product) return {}
        const badges = (product as { dynamicBadges?: DynamicBadges }).dynamicBadges || {}

        return {
            topLeft: badges.topLeft || null,
            topRight: badges.topRight || null,
            bottomLeft: badges.bottomLeft || null,
            bottomRight: badges.bottomRight || null,
        }
    }

    return {
        getProductBadges
    }
}
