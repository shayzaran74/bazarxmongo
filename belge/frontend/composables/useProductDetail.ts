import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, navigateTo, useNuxtApp } from '#app';
import { useProductService } from '~/services/api/ProductService';
import { useVendorService } from '~/services/api/VendorService';
import { useCategoryService } from '~/services/api/CategoryService';
import { useBarterService } from '~/services/api/BarterService';
import { useCartStore } from '~/stores/cart';
import { useAuthStore } from '~/stores/auth';
import { useWishlistStore } from '~/stores/wishlist';
import { useI18n } from 'vue-i18n';
import { useAppImage } from '~/composables/useAppImage';
import type { Product, Category, ProductVariant, Review } from '@barterborsa/shared-types';


export const useProductDetail = () => {
  const route = useRoute();
  const { t } = useI18n();
  const { $toast: toast } = useNuxtApp();
  const { resolveImageUrl } = useAppImage();

  // Services
  const productService = useProductService();
  const vendorService = useVendorService();
  const categoryService = useCategoryService();
  const barterService = useBarterService();

  // Stores
  const authStore = useAuthStore();
  const cartStore = useCartStore();
  const wishlistStore = useWishlistStore();

  // State
  const product = ref<Product | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const selectedImage = ref<string | null>(null);
  const quantity = ref(1);
  const activeTab = ref('description');
  const relatedProducts = ref<Product[]>([]);
  const loadingRelated = ref(false);
  const categories = ref<Category[]>([]);
  const submittingReview = ref(false);
  const reviewDraft = ref({
    rating: 5,
    comment: ''
  });
  const selectedOptions = ref<Record<string, string | number>>({});
  const canReview = ref(false);
  const canReviewReason = ref('');
  const loadingReviewEligibility = ref(false);
  const processingBarter = ref(false);
  const showAddressModal = ref(false);
  const estimatedDelivery = ref<string | null>(null);
  const selectedCity = ref('');
  const selectedDistrict = ref('');
  const isFollowing = ref(false);
  const followLoading = ref(false);

  // Constants
  const tabs = [
    { id: 'description', name: t('products.detail.description') || 'Açıklama' },
    { id: 'specifications', name: t('products.detail.specifications') || 'Özellikler' },
    { id: 'reviews', name: t('products.detail.reviews') || 'Değerlendirmeler' }
  ];

  // Computed
  const slugParam = computed(() => {
    const s = route.params.slug;
    return Array.isArray(s) ? s[s.length - 1] : (s as string);
  });

  const displayPrice = computed(() => {
    if (!product.value) return 0;
    let basePrice = product.value.price;
    if (selectedVariant.value) {
      basePrice = selectedVariant.value.price;
    }
    return basePrice;
  });

  const selectedVariant = computed<ProductVariant | null>(() => {
    const p = product.value;
    if (!p || !p.hasVariants || !p.variants?.length) return null;
    return p.variants.find((v: ProductVariant) =>
      Object.entries(selectedOptions.value).every(([key, val]) => v.attributes?.[key] === val)
    ) || null;
  });

  const currentStock = computed(() => {
    if (selectedVariant.value) return selectedVariant.value.stock;
    let stock = product.value?.stock || 0;
    if (product.value?.maxPurchasePerMember) {
      const remaining = Math.max(0, product.value.maxPurchasePerMember - (product.value.purchasedCount || 0));
      stock = Math.min(stock, remaining);
    }
    return stock;
  });

  const allImages = computed(() => {
    if (!product.value) return [];
    if (product.value.images && product.value.images.length > 0) {
      return product.value.images.map(img => resolveImageUrl(img));
    }
    const images: string[] = [];
    if (product.value.image) images.push(resolveImageUrl(product.value.image));
    return images;
  });

  const averageRating = computed(() => {
    if (!product.value?.Review || product.value.Review.length === 0) return 5;
    const sum = product.value.Review.reduce((acc, review) => acc + review.rating, 0);
    return sum / product.value.Review.length;
  });

  const isFavorite = computed(() => {
    const productId = product.value?.id;
    return productId ? wishlistStore.isInWishlist(productId.toString()) : false;
  });

  // Actions
  const fetchProduct = async () => {
    try {
      loading.value = true;
      const response = await productService.getProductBySlug(slugParam.value);
      if (response.success && response.data) {
        product.value = response.data;
        selectedImage.value = resolveImageUrl(product.value?.image || '');
        if (authStore.isLoggedIn) {
          wishlistStore.fetchWishlist();
          checkReviewEligibility();
          checkFollowStatus();
        }
        fetchRelatedProducts();
      } else {
        error.value = t('products.detail.notFound') || 'Ürün bulunamadı';
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      error.value = t('products.detail.errorLoading') || 'Ürün yüklenirken bir hata oluştu';
    } finally {
      loading.value = false;
    }
  };

  const fetchRelatedProducts = async () => {
    if (!product.value?.Category?.slug) return;
    try {
      loadingRelated.value = true;
      const response = await productService.getProducts({
        limit: 5,
        categorySlug: product.value.Category.slug
      });
      if (response.success && response.data) {
        relatedProducts.value = response.data.filter((p: Product) => p.id !== product.value?.id).slice(0, 4);
      }
    } catch (err) {
      console.error('Error fetching related products:', err);
    } finally {
      loadingRelated.value = false;
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories({ all: true });
      if (response.success && response.data) {
        categories.value = response.data;
      }
    } catch (err) {
      console.error('Fetch categories error:', err);
    }
  };

  const checkReviewEligibility = async () => {
    if (!authStore.isLoggedIn || !product.value?.id) return;
    try {
      loadingReviewEligibility.value = true;
      const response = await productService.checkReviewEligibility(product.value.id.toString());
      if (response.success) {
        canReview.value = response.canReview;
        canReviewReason.value = response.reason || '';
      }
    } catch (err) {
      console.error('Error checking review eligibility:', err);
    } finally {
      loadingReviewEligibility.value = false;
    }
  };

  const submitReview = async () => {
    if (!authStore.isLoggedIn) {
      toast.info(t('products.detail.review.loginToReview'));
      return navigateTo('/login');
    }
    if (!product.value?.id) return;
    try {
      submittingReview.value = true;
      const response = await productService.createProductReview(product.value.id.toString(), {
        rating: reviewDraft.value.rating,
        comment: reviewDraft.value.comment
      });
      if (response.success) {
        toast.success(t('products.detail.review.success'));
        reviewDraft.value = { rating: 5, comment: '' };
        checkReviewEligibility();
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : (t('products.detail.review.error') || 'İşlem başarısız');
      toast.error(errorMsg);
    } finally {
      submittingReview.value = false
    }
  };

  const toggleFollow = async () => {
    const vendorId = product.value?.vendorId;
    if (!authStore.isLoggedIn) {
      toast.info(t('products.detail.followLoginRequired'));
      return navigateTo('/login');
    }
    if (!vendorId) return;
    try {
      followLoading.value = true;
      if (isFollowing.value) {
        await vendorService.unfollowVendor(vendorId.toString());
        isFollowing.value = false;
        toast.success(t('products.detail.unfollowed'));
      } else {
        await vendorService.followVendor(vendorId.toString());
        isFollowing.value = true;
        toast.success(t('products.detail.followed'));
      }
    } catch (err) {
      toast.error(t('products.detail.errorGeneral'));
    } finally {
      followLoading.value = false;
    }
  };

  const checkFollowStatus = async () => {
    const vendorId = product.value?.vendorId;
    if (!authStore.isLoggedIn || !vendorId) return;
    try {
      const response = await vendorService.checkFollowStatus(vendorId.toString());
      if (response.success && response.data) {
        isFollowing.value = response.data.isFollowing || false;
      }
    } catch (err) {
      console.error('Check follow status error:', err);
    }
  };

  const addToCart = async () => {
    if (!product.value) return;
    try {
      const result = await cartStore.addToCart(
        product.value.id.toString(),
        quantity.value,
        selectedVariant.value?.id?.toString(),
        product.value
      );
      if (result?.success) {
        toast.success(t('product.addedToCart') || 'Ürün sepete eklendi');
      } else {
        toast.error(result?.message || t('product.errorAdding'));
      }
    } catch (err: unknown) {
      const errorMsg = (err as Error)?.message || t('product.errorAdding')
      toast.error(errorMsg)
    }
  };

  const buyNow = async () => {
    if (!product.value) return;
    try {
      // Add to cart first
      const result = await cartStore.addToCart(
        product.value.id.toString(),
        quantity.value,
        selectedVariant.value?.id?.toString(),
        product.value
      );
      
      if (result?.success) {
        // Redirect to checkout/cart
        await navigateTo('/cart');
      } else {
        toast.error(result?.message || t('product.buyNowError'));
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : t('product.buyNowError')
      toast.error(errorMsg)
    }
  };

  const toggleFavorite = async () => {
    if (product.value?.id) {
      await wishlistStore.toggleWishlist(product.value.id.toString());
    }
  };

  const buyWithBarter = async () => {
    if (!authStore.isLoggedIn) {
      toast.info(t('products.detail.barterLoginRequired'));
      return navigateTo('/login');
    }
    if (!product.value?.id) return;
    const totalCost = displayPrice.value * quantity.value;
    if (Number(authStore.barterBalance) < totalCost) {
      toast.error(t('products.detail.insufficientBarterBalance'));
      return;
    }
    if (!confirm(t('products.detail.barterConfirm', { price: totalCost }))) return;
    try {
      processingBarter.value = true;
      const response = await barterService.transfer({
        toUserId: product.value?.Vendor?.id?.toString() || '',
        amount: totalCost,
        description: t('products.detail.barterPurchaseDescription', { name: product.value?.name, count: quantity.value })
      });
      if (response.success) {
        toast.success(t('products.detail.barterSuccess'));
        authStore.fetchUser();
        navigateTo('/barter');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : t('products.detail.errorGeneral')
      toast.error(errorMsg)
    } finally {
      processingBarter.value = false
    }
  };

  const estimateDelivery = async (address: { city: string, district: string }) => {
    if (!product.value?.id) return;
    try {
      const response = await productService.getDeliveryEstimate(product.value.id.toString(), address);
      if (response.success) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + (response.minDays || 2));
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + (response.maxDays || 5));
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
        estimatedDelivery.value = `${startDate.toLocaleDateString('tr-TR', options)} - ${endDate.toLocaleDateString('tr-TR', options)}`;
        showAddressModal.value = false;
        toast.success(t('products.detail.deliveryEstimated'));
      }
    } catch (err) {
      estimatedDelivery.value = "2-5 iş günü";
    }
  };

  const getStarPercentage = (star: number) => {
    if (!product.value?.Review || product.value.Review.length === 0) return 0;
    const count = product.value.Review.filter((r: Review) => r.rating === star).length;
    return (count / product.value.Review.length) * 100;
  };

  const shareProduct = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.value?.name,
          text: product.value?.description,
          url: window.location.href
        });
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') {
          toast.error(t('products.detail.shareError'));
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(t('products.detail.copySuccess'));
      } catch (err: unknown) {
        toast.error(t('products.detail.copyError'));
      }
    }
  };

  onMounted(() => {
    fetchCategories();
    fetchProduct();
  });

  watch(() => route.params.slug, () => {
    fetchProduct();
  });

  return {
    product,
    loading,
    error,
    selectedImage,
    quantity,
    activeTab,
    relatedProducts,
    loadingRelated,
    categories,
    submittingReview,
    reviewDraft,
    selectedOptions,
    canReview,
    canReviewReason,
    loadingReviewEligibility,
    processingBarter,
    showAddressModal,
    estimatedDelivery,
    selectedCity,
    selectedDistrict,
    isFollowing,
    followLoading,
    tabs,
    displayPrice,
    averageRating,
    isFavorite,
    currentStock,
    allImages,
    fetchProduct,
    submitReview,
    toggleFollow,
    addToCart,
    buyNow,
    toggleFavorite,
    buyWithBarter,
    estimateDelivery,
    getStarPercentage,
    resolveImageUrl,
    shareProduct
  };
};
