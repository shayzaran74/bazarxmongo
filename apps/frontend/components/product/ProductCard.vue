<template>
  <div
    ref="cardRef"
    class="product-card group relative bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-gray-800 shadow-sm hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col h-full cursor-pointer touch-manipulation"
    :style="cardStyle"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
    @click="handleCardClick"
  >
    <!-- Image & Quick Access Area -->
    <ProductCardImage
      :image="String(product.images?.[0] || product.image || '')"
      :name="product.name"
      @add-to-cart="handleAddToCart"
    >
      <template #badges>
        <ProductCardBadges
          :display-badges="displayBadges"
          :is-sponsored="product.isSponsored"
          :distance="product.distance"
        >
          <template #favorite>
            <CommonFavoriteButton
              :product-id="product.catalogProductId || product.id"
              class="!bg-white/90 dark:!bg-gray-900/90 !backdrop-blur-xl !shadow-lg hover:!scale-110 transition-transform pointer-events-auto"
              @click.stop
            />
          </template>
        </ProductCardBadges>
      </template>
    </ProductCardImage>

    <!-- Typography & Pricing Area -->
    <ProductCardInfo
      :name="product.name"
      :category-name="product.category?.name"
      :brand-name="brandName"
      :rating="averageRating"
      :price="product.price"
      :compare-at-price="product.compareAtPrice"
      :formatted-price="formatPrice(product.price)"
      :seller-count="product.sellerCount"
      :has-variants="!!product.variants?.length"
    />
  </div>
</template>

<script setup lang="ts">
import type { Product, DynamicBadges } from '@barterborsa/shared-types'
import { useProductCard } from '~/composables/useProductCard'

// Components
import ProductCardImage from './card/ProductCardImage.vue'
import ProductCardBadges from './card/ProductCardBadges.vue'
import ProductCardInfo from './card/ProductCardInfo.vue'

const props = defineProps<{
  product: Product
  badges?: DynamicBadges
}>()

const emit = defineEmits<{
  (e: 'click', product: Product): void
  (e: 'add-to-cart', product: Product): void
}>()

const {
  cardRef, cardStyle, displayBadges, brandName, averageRating,
  handleMouseMove, handleMouseLeave, handleCardClick, handleAddToCart, formatPrice
} = useProductCard(props, emit)
</script>

<style scoped>
.product-card {
  transition: transform 0.15s ease-out, shadow 0.5s ease;
  transform-style: preserve-3d;
  will-change: transform;
}
</style>
