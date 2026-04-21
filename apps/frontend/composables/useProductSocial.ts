import { ref, computed } from 'vue'
import { useNuxtApp, navigateTo } from '#imports'
import { useProductService } from '~/services/api/ProductService'
import { useVendorService } from '~/services/api/VendorService'
import { useAuthStore } from '~/stores/auth'
import { useI18n } from 'vue-i18n'

export const useProductSocial = (product: any) => {
  const { t } = useI18n()
  const { $toast: toast } = useNuxtApp()
  const authStore = useAuthStore()
  const productService = useProductService()
  const vendorService = useVendorService()

  const submittingReview = ref(false)
  const reviewDraft = ref({ rating: 5, comment: '' })
  const canReview = ref(false)
  const canReviewReason = ref('')
  const loadingReviewEligibility = ref(false)
  const isFollowing = ref(false)
  const followLoading = ref(false)

  const averageRating = computed(() => {
    if (!product.value?.Review || product.value.Review.length === 0) return 5
    const sum = product.value.Review.reduce((acc: number, review: any) => acc + review.rating, 0)
    return sum / product.value.Review.length
  })

  const checkReviewEligibility = async () => {
    if (!authStore.isLoggedIn || !product.value?.id) return
    try {
      loadingReviewEligibility.value = true
      const response = await productService.checkReviewEligibility(product.value.id.toString())
      if (response.success && response.data) {
        canReview.value = (response.data as any).canReview
        canReviewReason.value = (response.data as any).reason || ''
      }
    } catch (err) {
      console.error('Check review eligibility error:', err)
    } finally {
      loadingReviewEligibility.value = false
    }
  }

  const submitReview = async () => {
    if (!authStore.isLoggedIn) {
      toast.info(t('products.detail.review.loginToReview'))
      return navigateTo('/auth/login')
    }
    if (!product.value?.id) return
    try {
      submittingReview.value = true
      const response = await productService.createProductReview(product.value.id.toString(), {
        rating: reviewDraft.value.rating,
        comment: reviewDraft.value.comment
      })
      if (response.success) {
        toast.success(t('products.detail.review.success'))
        reviewDraft.value = { rating: 5, comment: '' }
        checkReviewEligibility()
      }
    } catch (err: any) {
      toast.error(err.message || t('products.detail.review.error'))
    } finally {
      submittingReview.value = false
    }
  }

  const checkFollowStatus = async () => {
    const vendorId = product.value?.vendorId
    if (!authStore.isLoggedIn || !vendorId) return
    try {
      const response = await vendorService.checkFollowStatus(vendorId.toString())
      if (response.success && response.data) {
        isFollowing.value = (response.data as any).isFollowing || false
      }
    } catch (err) {
      console.error('Check follow status error:', err)
    }
  }

  const toggleFollow = async () => {
    const vendorId = product.value?.vendorId
    if (!authStore.isLoggedIn) {
      toast.info(t('products.detail.followLoginRequired'))
      return navigateTo('/auth/login')
    }
    if (!vendorId) return
    try {
      followLoading.value = true
      if (isFollowing.value) {
        await vendorService.unfollowVendor(vendorId.toString())
        isFollowing.value = false
        toast.success(t('products.detail.unfollowed'))
      } else {
        await vendorService.followVendor(vendorId.toString())
        isFollowing.value = true
        toast.success(t('products.detail.followed'))
      }
    } catch (err) {
      toast.error(t('products.detail.errorGeneral'))
    } finally {
      followLoading.value = false
    }
  }

  const getStarPercentage = (star: number) => {
    if (!product.value?.Review || product.value.Review.length === 0) return 0
    const count = product.value.Review.filter((r: any) => r.rating === star).length
    return (count / product.value.Review.length) * 100
  }

  return {
    submittingReview, reviewDraft, canReview, canReviewReason, loadingReviewEligibility,
    isFollowing, followLoading, averageRating, checkReviewEligibility, submitReview,
    checkFollowStatus, toggleFollow, getStarPercentage
  }
}
