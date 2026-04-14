<template>
  <div class="product-detail-page bg-white min-h-screen">
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center min-h-[60vh] gap-4"
    >
      <div class="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">
        {{ $t('common.loading') }}
      </p>
    </div>

    <div
      v-else-if="error"
      class="max-w-7xl mx-auto px-4 py-20 text-center"
    >
      <div class="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-rose-50 text-rose-500 mb-8 border border-rose-100 shadow-xl shadow-rose-100/50">
        <ExclamationTriangleIcon class="w-10 h-10" />
      </div>
      <h1 class="text-4xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">
        {{ error }}
      </h1>
      <NuxtLink
        to="/products"
        class="inline-flex h-16 items-center px-10 rounded-2xl bg-indigo-600 text-white font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
      >
        {{ $t('products.detail.backToProducts') }}
      </NuxtLink>
    </div>

    <div
      v-else-if="product"
      class="relative"
    >
      <!-- Decorative Background Elements -->
      <div class="absolute top-0 right-0 w-[40%] h-[1000px] bg-gradient-to-l from-indigo-50/30 to-transparent -z-10 blur-3xl pointer-events-none" />

      <!-- Main Layout -->
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <!-- Left Column: Gallery (Sticky) -->
          <div class="lg:col-span-12 xl:col-span-7">
            <div class="lg:sticky lg:top-32 space-y-8">
              <ProductGallery 
                :product="product"
                :all-images="allImages"
                :selected-image="selectedImage"
                @update:selected-image="v => selectedImage = v"
              />
              
              <!-- Features Grid (Desktop Only) -->
              <div class="hidden xl:grid grid-cols-3 gap-4 h-32">
                <div class="bg-slate-50 rounded-[2rem] p-6 flex flex-col justify-center border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                  <span class="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{{ $t('products.detail.fastShipping') }}</span>
                  <p class="text-xs font-bold text-slate-500 leading-tight">
                    24 saat içinde kargoda
                  </p>
                </div>
                <div class="bg-slate-50 rounded-[2rem] p-6 flex flex-col justify-center border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                  <span class="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Orijinal Ürün</span>
                  <p class="text-xs font-bold text-slate-500 leading-tight">
                    %100 Güvenli Alışveriş
                  </p>
                </div>
                <div class="bg-slate-50 rounded-[2rem] p-6 flex flex-col justify-center border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                  <span class="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Kolay İade</span>
                  <p class="text-xs font-bold text-slate-500 leading-tight">
                    14 Gün İçinde Koşulsuz
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Info & Actions -->
          <div class="lg:col-span-12 xl:col-span-5 space-y-12">
            <ProductMainInfo 
              :product="product" 
              :average-rating="averageRating"
              :display-price="displayPrice"
            />
            
            <ProductPurchaseActions 
              :product="product"
              :quantity="quantity"
              :display-price="displayPrice"
              :current-stock="currentStock"
              :processing-barter="processingBarter"
              @update:quantity="v => quantity = v"
              @add-to-cart="addToCart"
              @buy-now="buyNow"
              @buy-with-barter="buyWithBarter"
            />

            <ProductDeliveryEstimation 
              :estimated-delivery="estimatedDelivery"
              :show-address-modal="showAddressModal"
              :selected-city="selectedCity"
              :selected-district="selectedDistrict"
              @update:show-address-modal="v => showAddressModal = v"
              @update:selected-city="v => selectedCity = v"
              @update:selected-district="v => selectedDistrict = v"
              @estimate="() => estimateDelivery({ city: selectedCity, district: selectedDistrict })"
            />

            <ProductSidebar 
              :product="product"
              :is-following="isFollowing"
              :is-favorite="isFavorite"
              :follow-loading="followLoading"
              @toggle-follow="toggleFollow"
              @toggle-favorite="toggleFavorite"
              @share="shareProduct"
            />
          </div>
        </div>

        <!-- Full Width Tabs Section -->
        <div class="mt-20 lg:mt-32">
          <ProductTabs 
            :product="product" 
            :active-tab="activeTab"
            :tabs="tabs"
            :average-rating="averageRating"
            :can-review="canReview"
            :can-review-reason="canReviewReason"
            :review-draft="reviewDraft"
            :submitting-review="submittingReview"
            :loading-review-eligibility="loadingReviewEligibility"
            @update:active-tab="v => activeTab = v"
            @update:review-draft-rating="v => reviewDraft.rating = v"
            @update:review-draft-comment="v => reviewDraft.comment = v"
            @submit-review="submitReview"
          />
        </div>

        <!-- Related Products -->
        <div
          v-if="relatedProducts.length > 0"
          class="mt-32 space-y-12"
        >
          <div class="flex items-end justify-between border-b-2 border-slate-50 pb-8">
            <div class="space-y-2">
              <h2 class="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
                {{ $t('products.detail.relatedProducts') }}
              </h2>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {{ $t('products.detail.suggestedForYou') }}
              </p>
            </div>
            <NuxtLink
              :to="`/category/${product.Category?.slug}`"
              class="h-12 px-8 flex items-center bg-slate-50 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
            >
              {{ $t('common.viewAll') }}
            </NuxtLink>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <ProductCard 
              v-for="related in relatedProducts" 
              :key="related.id" 
              :product="related"
              @click="navigateTo(`/products/${related.Category?.slug}/${related.slug}`)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { useProductDetail } from '~/composables/useProductDetail'
import ProductGallery from '~/components/product/detail/ProductGallery.vue'
import ProductMainInfo from '~/components/product/detail/ProductMainInfo.vue'
import ProductPurchaseActions from '~/components/product/detail/ProductPurchaseActions.vue'
import ProductDeliveryEstimation from '~/components/product/detail/ProductDeliveryEstimation.vue'
import ProductSidebar from '~/components/product/detail/ProductSidebar.vue'
import ProductTabs from '~/components/product/detail/ProductTabs.vue'
import ProductCard from '~/components/product/ProductCard.vue'

const {
  product,
  loading,
  error,
  selectedImage,
  quantity,
  activeTab,
  relatedProducts,
  submittingReview,
  reviewDraft,
  canReview = ref(false),
  canReviewReason = ref(''),
  loadingReviewEligibility = ref(false),
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
  addToCart,
  buyNow,
  toggleFollow,
  toggleFavorite,
  buyWithBarter,
  estimateDelivery,
  submitReview,
  shareProduct
} = useProductDetail()

// SEO & Meta
const config = useRuntimeConfig()

watch(product, (newProduct) => {
  if (newProduct) {
    const title = `${newProduct.name} | BarterBorsa`
    const description = newProduct.description?.substring(0, 160) || newProduct.name
    const image = newProduct.image ? `${config.public.apiBase}/uploads/${newProduct.image}` : ''

    useSeoMeta({
      title,
      ogTitle: title,
      description,
      ogDescription: description,
      ogImage: image,
      twitterCard: 'summary_large_image',
    })

    // Structured Data
    useHead({
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org/',
            '@type': 'Product',
            name: newProduct.name,
            image: [image],
            description: newProduct.description,
            brand: {
              '@type': 'Brand',
              name: newProduct.brand || 'BarterBorsa'
            },
            offers: {
              '@type': 'Offer',
              priceCurrency: 'TRY',
              price: newProduct.price,
              availability: newProduct.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
            }
          })
        }
      ]
    })
  }
}, { immediate: true })
</script>

<style scoped>
.product-detail-page {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.animate-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
