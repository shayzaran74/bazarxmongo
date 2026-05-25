import { ref, computed, type CSSProperties } from 'vue'
import { useI18n, useAds, useProductBadges, useCartStore, useNuxtApp } from '#imports'
import type { Product, Review, DynamicBadges } from '@barterborsa/shared-types'

export const useProductCard = (props: { product: Product, badges?: DynamicBadges }, emit: { (e: 'click', product: Product): void; (e: 'add-to-cart', product: Product): void }) => {
  const { t, locale } = useI18n()
  const { recordClick } = useAds()
  const { getProductBadges } = useProductBadges()
  const cartStore = useCartStore()
  const nuxtApp = useNuxtApp()

  // --- Badge Management ---
  const displayBadges = computed(() => {
    const autoBadges = getProductBadges(props.product)
    if (!props.badges) return autoBadges

    return {
      topLeft: props.badges.topLeft || autoBadges.topLeft,
      topRight: props.badges.topRight || autoBadges.topRight,
      bottomLeft: props.badges.bottomLeft || autoBadges.bottomLeft,
      bottomRight: props.badges.bottomRight || autoBadges.bottomRight
    }
  })

  // --- Interactive 3D Tilt Effect ---
  const cardRef = ref<HTMLElement | null>(null)
  const mouseX = ref(0)
  const mouseY = ref(0)
  const isHovering = ref(false)

  const cardStyle = computed<CSSProperties>(() => {
    if (!isHovering.value) return { transform: 'rotateX(0deg) rotateY(0deg)' }

    const rotateX = -((mouseY.value - 0.5) * 10).toFixed(2)
    const rotateY = ((mouseX.value - 0.5) * 10).toFixed(2)

    return {
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
    }
  })

  const handleMouseMove = (e: MouseEvent) => {
    if (!cardRef.value) return
    const rect = cardRef.value.getBoundingClientRect()
    mouseX.value = (e.clientX - rect.left) / rect.width
    mouseY.value = (e.clientY - rect.top) / rect.height
    isHovering.value = true
  }

  const handleMouseLeave = () => {
    isHovering.value = false
  }

  // --- Actions ---
  const handleCardClick = () => {
    try {
      if (props.product.isSponsored && typeof recordClick === 'function' && props.product.id) {
        recordClick(props.product.id.toString())
      }
    } catch {
      /* sessiz hata */
    }
    emit('click', props.product)
  }

  const handleAddToCart = async (event: MouseEvent) => {
    event.stopPropagation()
    try {
      if (!props.product.id) return
      // product.id = Listing ID (MongoDB _id), bestListingId = primary listing for cart
      // listingId is required for backend to find the listing directly
      const listingId = (props.product as any).bestListingId || props.product.id
      await cartStore.addToCart(
        (props.product as any).catalogProductId || props.product.id,
        1,
        undefined,
        props.product,
        listingId
      )
      nuxtApp.$toast.success(t('product.addedToCart') || 'Ürün sepete eklendi')
    } catch (err: unknown) {
      const errorMsg = (err as Error).message || t('product.addToCartError') || 'Hata oluştu'
      nuxtApp.$toast.error(errorMsg)
    }
    emit('add-to-cart', props.product)
  }

  // --- Formatting & Data Helpers ---
  const brandName = computed(() => {
    if (typeof props.product.brand === 'string') return props.product.brand
    if (props.product.Brand?.name) return props.product.Brand.name
    if (typeof props.product.brand === 'object' && props.product.brand !== null) {
      return (props.product.brand as { name?: string }).name || ''
    }
    return ''
  })

  const averageRating = computed(() => {
    if (!props.product.reviews?.length) return 0
    const sum = props.product.reviews.reduce((acc: number, rev: Review) => acc + rev.rating, 0)
    return (sum / props.product.reviews.length).toFixed(1)
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale.value === 'tr' ? 'tr-TR' : 'en-US', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(price || 0)
  }

  return {
    cardRef, cardStyle, displayBadges, brandName, averageRating,
    handleMouseMove, handleMouseLeave, handleCardClick, handleAddToCart, formatPrice
  }
}
