<template>
  <div
    ref="cardRef"
    class="product-card group relative bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-gray-800 shadow-sm hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col h-full cursor-pointer touch-manipulation"
    :style="cardStyle"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
    @click="handleCardClick"
  >
    <!-- Premium Image Area -->
    <div class="relative aspect-[4/5] overflow-hidden bg-slate-50 dark:bg-gray-950">
      <!-- Main Product Image with Parallax-like scale -->
      <ProductImage
        :src="product.images?.[0] || product.image || undefined"
        :alt="product.name"
        image-class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
      />

      <!-- Glass Overlay for Hover -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />

      <!-- Sophisticated Badge System -->
      <div class="absolute top-4 left-4 flex flex-col gap-2 z-20">
        <slot name="badges" />
        <TransitionGroup name="badge-fade">
          <!-- Top Left Positional Badge -->
          <div
            v-if="displayBadges?.topLeft"
            key="pos-top-left"
            :class="[displayBadges.topLeft.class || 'bg-primary-600 text-white', 'px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-lg flex items-center gap-1.5 border border-white/20']"
            :style="displayBadges.topLeft.style"
          >
            <img
              v-if="displayBadges.topLeft.iconUrl"
              :src="displayBadges.topLeft.iconUrl"
              class="w-3 h-3 object-contain"
            >
            <SparklesIcon
              v-else-if="displayBadges.topLeft.text.includes('Premium') || displayBadges.topLeft.text.includes('Öne')"
              class="w-3 h-3"
            />
            {{ displayBadges.topLeft.text }}
          </div>

          <div
            v-if="product.isSponsored"
            key="sponsored"
            class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-lg bg-indigo-600 text-white flex items-center gap-1.5"
          >
            <SparklesIcon class="w-3 h-3 animate-pulse" />
            {{ $t('product.sponsored') }}
          </div>

          <div
            v-if="product.distance !== undefined && product.distance !== null"
            key="distance"
            class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-lg bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white backdrop-blur-xl flex items-center gap-1.5 border border-white/20"
          >
            <MapPinIcon class="w-3 h-3 text-primary-500" />
            {{ product.distance < 1 ? (product.distance * 1000).toFixed(0) + 'm' :
              product.distance.toFixed(1) + 'km' }}
          </div>
        </TransitionGroup>
      </div>

      <div class="absolute top-4 right-4 flex flex-col items-end gap-2 z-20">
        <div
          v-if="displayBadges?.topRight"
          key="pos-top-right"
          :class="[displayBadges.topRight.class || 'bg-amber-500 text-white', 'px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-lg flex items-center gap-1.5 border border-white/20']"
          :style="displayBadges.topRight.style"
        >
          {{ displayBadges.topRight.text }}
        </div>
        <FavoriteButton
          :product-id="product.catalogProductId || product.id"
          class="!bg-white/90 dark:!bg-gray-900/90 !backdrop-blur-xl !shadow-lg hover:!scale-110 transition-transform"
          @click.stop
        />
      </div>

      <!-- Shine Effect Overlay -->
      <div
        class="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
      >
        <div class="shine-sweep" />
      </div>

      <!-- Bottom Left Positional Badge -->
      <div
        class="absolute bottom-4 left-4 flex flex-col gap-2 z-20 pointer-events-none group-hover:opacity-0 transition-opacity duration-300"
      >
        <div
          v-if="displayBadges?.bottomLeft"
          key="pos-bottom-left"
          :class="[displayBadges.bottomLeft.class || 'bg-sky-500 text-white', 'px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-lg flex items-center gap-1.5 border border-white/20']"
          :style="displayBadges.bottomLeft.style"
        >
          {{ displayBadges.bottomLeft.text }}
        </div>
      </div>

      <!-- Bottom Right Positional Badge -->
      <div
        class="absolute bottom-4 right-4 flex flex-col items-end gap-2 z-20 pointer-events-none group-hover:opacity-0 transition-opacity duration-300"
      >
        <div
          v-if="displayBadges?.bottomRight"
          key="pos-bottom-right"
          :class="[displayBadges.bottomRight.class || 'bg-rose-600 text-white', 'px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-lg flex items-center gap-1.5 border border-white/20']"
          :style="displayBadges.bottomRight.style"
        >
          {{ displayBadges.bottomRight.text }}
        </div>
      </div>

      <!-- Bottom Quick Add (Glassmorphism Slide UP) -->
      <div
        class="absolute inset-x-4 bottom-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out z-30"
      >
        <button
          class="w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl text-gray-900 dark:text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-primary-600 hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
          @click.stop.prevent="handleAddToCart"
        >
          <ShoppingCartIcon class="w-4 h-4 group-hover/btn:bounce" />
          {{ $t('product.addToCart') }}
        </button>
      </div>
    </div>

    <!-- Content Area (Clean & Modern Typography) -->
    <div class="p-5 flex flex-col flex-grow relative bg-white dark:bg-gray-900 overflow-hidden">
      <!-- Background Glow (Hover) -->
      <div
        class="absolute -bottom-10 -right-10 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
      />

      <!-- Meta Info -->
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-black text-primary-600/80 uppercase tracking-widest">
            {{ product.category?.name || $t('product.general') }}
          </span>
          <div
            v-if="product.brand || product.Brand"
            class="flex items-center gap-1"
          >
            <div class="w-1 h-1 rounded-full bg-slate-300" />
            <span
              class="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[80px]"
            >
              {{ brandName }}
            </span>
          </div>
        </div>
        <div
          v-if="product.reviews?.length"
          class="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full"
        >
          <StarIcon class="h-2.5 w-2.5 text-amber-500 fill-current" />
          <span class="text-[10px] font-black text-amber-700 dark:text-amber-400">{{ averageRating }}</span>
        </div>
      </div>

      <!-- Title -->
      <h3
        class="text-sm font-black text-slate-800 dark:text-slate-100 line-clamp-2 mb-3 group-hover:text-primary-600 transition-colors uppercase italic tracking-tight leading-tight h-[2.5rem]"
      >
        {{ product.name }}
      </h3>

      <!-- Pricing Section (Sophisticated Layout) -->
      <div class="mt-auto pt-4 border-t border-slate-50 dark:border-gray-800">
        <div class="flex items-end justify-between">
          <div class="flex flex-col">
            <span
              v-if="product.compareAtPrice && product.compareAtPrice > product.price"
              class="text-[10px] text-slate-400 line-through font-bold mb-0.5 opacity-60"
            >
              {{ formatPrice(product.compareAtPrice) }}
            </span>
            <div class="flex items-baseline gap-1.5">
              <span
                class="text-lg font-black text-gray-950 dark:text-white tracking-tighter leading-none"
              >
                {{ formatPrice(product.price).split(',')[0] }}<span class="text-xs opacity-50">{{
                  formatPrice(product.price).includes(',') ? ',' +
                    formatPrice(product.price).split(',')[1] : '' }}</span>
              </span>
              <span
                v-if="product.sellerCount && product.sellerCount > 1"
                class="text-[8px] font-black text-primary-500 uppercase tracking-widest pb-1"
              >
                {{ $t('product.startingFromShort') }}
              </span>
            </div>
          </div>

          <!-- Indicators -->
          <div class="flex gap-1">
            <div
              v-if="product.sellerCount && product.sellerCount > 1"
              class="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(var(--primary-600),0.4)]"
              :title="$t('product.multiVendor')"
            />
            <div
              v-if="product.variants?.length"
              class="text-[8px] font-black text-slate-400 uppercase tracking-widest"
            >
              +{{
                product.variants.length }} VAR
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from '#imports'
import { useI18n, useAds, useProductBadges, useCartStore, useNuxtApp } from '#imports'
import ShoppingCartIcon from '@heroicons/vue/24/outline/ShoppingCartIcon'
import SparklesIcon from '@heroicons/vue/24/outline/SparklesIcon'
import StarIcon from '@heroicons/vue/24/outline/StarIcon'
import MapPinIcon from '@heroicons/vue/24/outline/MapPinIcon'

import type { Product, Review, DynamicBadges } from '~/types/catalog'

const props = defineProps<{
    product: Product
    badges?: DynamicBadges
}>()

const emit = defineEmits<{
    (e: 'click', product: Product): void
    (e: 'add-to-cart', product: Product): void
}>()
const { t, locale } = useI18n()
const { recordClick } = useAds()

const { getProductBadges } = useProductBadges()

// Compute badges: merge prop badges with automatic badges
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

const cardStyle = computed(() => {
    if (!isHovering.value) return { transform: 'rotateX(0deg) rotateY(0deg)' }

    // Calculate rotation (Max 10 degrees)
    const rotateX = -((mouseY.value - 0.5) * 10).toFixed(2)
    const rotateY = ((mouseX.value - 0.5) * 10).toFixed(2)

    return {
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
    }
})

const handleMouseMove = (e: MouseEvent) => {
    if (!cardRef.value) return
    const rect = (cardRef.value as HTMLElement).getBoundingClientRect()
    mouseX.value = (e.clientX - rect.left) / rect.width
    mouseY.value = (e.clientY - rect.top) / rect.height
    isHovering.value = true
}

const handleMouseLeave = () => {
    isHovering.value = false
}

const cartStore = useCartStore()
const nuxtApp = useNuxtApp()

// --- Logic ---
const handleCardClick = () => {
    try {
        if (props.product.isSponsored && typeof recordClick === 'function' && props.product.id) {
            recordClick(props.product.id.toString())
        }
    } catch (e) {
        console.error('Ad tracking error:', e)
    }
    emit('click', props.product)
}

const handleAddToCart = async (event: MouseEvent) => {
    event.stopPropagation()
    try {
        if (!props.product.id) return
        await cartStore.addToCart(props.product.id.toString(), 1, undefined, props.product)
        nuxtApp.$toast.success(t('product.addedToCart') || 'Ürün sepete eklendi')
    } catch (err: unknown) {
        console.error('Cart error:', err)
        const errorMsg = err instanceof Error ? err.message : (t('product.addToCartError') || 'Hata oluştu')
        nuxtApp.$toast.error(errorMsg)
    }
    emit('add-to-cart', props.product)
}

const brandName = computed(() => {
    if (typeof props.product.brand === 'string') return props.product.brand
    if (props.product.Brand?.name) return props.product.Brand.name
    // Fallback if brand is an object like Brand
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
    }).format(price)
}
</script>

<style scoped>
.product-card {
    transition: transform 0.15s ease-out, shadow 0.5s ease;
    transform-style: preserve-3d;
    will-change: transform;
}

/* Shine Sweep Keyframes */
.shine-sweep {
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(to right,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent);
    transform: skewX(-25deg);
    transition: none;
}

.product-card:hover .shine-sweep {
    animation: shine-sweep 1s ease-in-out;
}

@keyframes shine-sweep {
    0% {
        left: -100%;
    }

    100% {
        left: 200%;
    }
}

/* Badge Animations */
.badge-fade-enter-active,
.badge-fade-leave-active {
    transition: all 0.3s ease;
}

.badge-fade-enter-from,
.badge-fade-leave-to {
    opacity: 0;
    transform: translateX(-10px);
}

.bounce {
    animation: mini-bounce 0.5s ease infinite alternate;
}

@keyframes mini-bounce {
    from {
        transform: translateY(0);
    }

    to {
        transform: translateY(-2px);
    }
}

/* Custom Scrollbar or smooth behaviors if needed */
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    overflow: hidden;
}
</style>
