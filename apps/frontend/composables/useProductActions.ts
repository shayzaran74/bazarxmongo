import { ref, computed } from 'vue'
import { useNuxtApp, navigateTo } from '#imports'
import { useCartStore } from '~/stores/cart'
import { useWishlistStore } from '~/stores/wishlist'
import { useAuthStore } from '~/stores/auth'
import { useBarterService } from '~/services/api/BarterService'
import { useI18n } from 'vue-i18n'
import type { Product, ProductVariant } from '@barterborsa/shared-types'

export const useProductActions = (
  product: Ref<Product | null | undefined>,
  quantity: Ref<number>,
  selectedVariant: Ref<ProductVariant | null | undefined>,
  displayPrice: Ref<number>
) => {
  const { t } = useI18n()
  const { $toast: toast } = useNuxtApp()
  const cartStore = useCartStore()
  const wishlistStore = useWishlistStore()
  const authStore = useAuthStore()
  const barterService = useBarterService()

  const processingBarter = ref(false)

  const isFavorite = computed(() => {
    return product.value?.id ? wishlistStore.isInWishlist(product.value.id.toString()) : false
  })

  const addToCart = async () => {
    if (!product.value) return
    try {
      const result = await cartStore.addToCart(
        product.value.id.toString(),
        quantity.value,
        selectedVariant.value?.id?.toString()
      )
      if (result?.success) toast.success(t('product.addedToCart') || 'Ürün sepete eklendi')
      else toast.error(result?.message || t('product.errorAdding'))
    } catch (err: unknown) {
      toast.error((err as Error).message || t('product.errorAdding'))
    }
  }

  const buyNow = async () => {
    if (!product.value) return
    try {
      const result = await cartStore.addToCart(
        product.value.id.toString(),
        quantity.value,
        selectedVariant.value?.id?.toString()
      )
      if (result?.success) await navigateTo('/cart')
      else toast.error(result?.message || t('product.buyNowError'))
    } catch (err: unknown) {
      toast.error((err as Error).message || t('product.buyNowError'))
    }
  }

  const toggleFavorite = async () => {
    if (product.value?.id) await wishlistStore.toggle(product.value.id.toString())
  }

  const shareProduct = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.value?.name,
          text: product.value?.description,
          url: window.location.href
        })
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') toast.error(t('products.detail.shareError'))
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast.success(t('products.detail.copySuccess'))
      } catch (err) {
        toast.error(t('products.detail.copyError'))
      }
    }
  }

  const buyWithBarter = async () => {
    if (!authStore.isLoggedIn) {
      toast.info(t('products.detail.barterLoginRequired'))
      return navigateTo('/auth/login')
    }
    if (!product.value?.id) return
    const totalCost = displayPrice.value * quantity.value
    if (Number(authStore.barterBalance) < totalCost) {
      toast.error(t('products.detail.insufficientBarterBalance'))
      return
    }
    if (!confirm(t('products.detail.barterConfirm', { price: totalCost }))) return
    try {
      processingBarter.value = true
      const response = await barterService.transfer({
        toUserId: product.value?.Vendor?.id?.toString() || '',
        amount: totalCost,
        description: t('products.detail.barterPurchaseDescription', { name: product.value?.name, count: quantity.value })
      })
      if (response.success) {
        toast.success(t('products.detail.barterSuccess'))
        authStore.fetchUser()
        navigateTo('/barter')
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || t('products.detail.errorGeneral'))
    } finally {
      processingBarter.value = false
    }
  }

  return {
    processingBarter, isFavorite, addToCart, buyNow, toggleFavorite, shareProduct, buyWithBarter
  }
}
