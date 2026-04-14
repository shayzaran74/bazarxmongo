interface Category {
    slug?: string
    parent?: Category
}

interface Product {
    slug?: string
    id?: string | number
    category?: Category
    Category?: Category
}

export const getProductUrl = (product: Product | null): string => {
    if (!product) return '/products'
    const productSlug = product.slug || product.id
    const categories: string[] = []
    let currentCat = product.category || product.Category
    while (currentCat) {
        if (currentCat.slug) categories.unshift(currentCat.slug)
        currentCat = currentCat.parent
    }
    return categories.length > 0
        ? `/products/${categories.join('/')}/${productSlug}`
        : `/products/${productSlug}`
}
