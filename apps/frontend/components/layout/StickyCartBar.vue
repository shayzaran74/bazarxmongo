<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div
        v-if="show && product"
        class="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-bottom md:hidden"
      >
        <div class="flex items-center justify-between px-3 py-2.5 gap-3">
          <!-- Product Info (compact) -->
          <div class="flex items-center gap-2 flex-shrink-0 max-w-[35%]">
            <div class="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                v-if="product.image"
                :src="resolveImageUrl(product.image)"
                :alt="product.name"
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <span class="text-xs font-bold text-gray-900 line-clamp-1">{{ formatPrice(product.price)
            }}</span>
          </div>

          <!-- Quantity Selector -->
          <div class="flex items-center gap-1 bg-gray-100 rounded-full px-1 py-0.5 flex-shrink-0">
            <button
              :disabled="quantity <= 1"
              class="w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-40 touch-manipulation"
              @click="decreaseQuantity"
            >
              <MinusIcon class="w-3.5 h-3.5" />
            </button>
            <span class="w-6 text-center text-xs font-black text-gray-800 tabular-nums">{{ quantity
            }}</span>
            <button
              :disabled="quantity >= maxQuantity"
              class="w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-40 touch-manipulation"
              @click="increaseQuantity"
            >
              <PlusIcon class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Add to Cart Button with Feedback -->
          <button
            :disabled="isAdding"
            :class="[
              'flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider',
              'flex items-center justify-center gap-1.5 transition-all active:scale-95 touch-manipulation min-h-[44px]',
              added ? 'bg-green-500 text-white' : 'bg-primary-600 text-white hover:bg-primary-700'
            ]"
            @click="handleAddToCart"
          >
            <CheckIcon
              v-if="added"
              class="h-4 w-4"
            />
            <ShoppingCartIcon
              v-else
              class="h-4 w-4"
            />
            <span>{{ added ? $t('product.added') : $t('product.addToCart') }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, useI18n, useAppImage, useNuxtApp } from '#imports'
import { useCartStore } from '~/stores/cart'
import ShoppingCartIcon from '@heroicons/vue/24/outline/ShoppingCartIcon'
import MinusIcon from '@heroicons/vue/24/outline/MinusIcon'
import PlusIcon from '@heroicons/vue/24/outline/PlusIcon'
import CheckIcon from '@heroicons/vue/24/outline/CheckIcon'

const { t, locale } = useI18n()

const props = defineProps({
    product: {
        type: Object,
        default: null
    },
    show: {
        type: Boolean,
        default: true
    },
    maxQuantity: {
        type: Number,
        default: 99
    }
})

const cartStore = useCartStore()
const { resolveImageUrl } = useAppImage()

const quantity = ref(1)
const isAdding = ref(false)
const added = ref(false)

const decreaseQuantity = () => {
    if (quantity.value > 1) quantity.value--
}

const increaseQuantity = () => {
    if (quantity.value < props.maxQuantity) quantity.value++
}

const handleAddToCart = async () => {
    if (!props.product || isAdding.value) return

    try {
        isAdding.value = true
        await cartStore.addToCart(props.product.id, quantity.value)

        // Visual feedback
        added.value = true
        setTimeout(() => {
            added.value = false
        }, 1500)

        // Toast notification
        const toast = useNuxtApp().$toast
        toast.success(t('product.addedToCart', { name: props.product.name }))
    } catch (err) {
        const toast = useNuxtApp().$toast
        toast.error(t('product.errorAdding'))
    } finally {
        isAdding.value = false
    }
}

const formatPrice = (price) => {
    return new Intl.NumberFormat(locale.value === 'tr' ? 'tr-TR' : 'en-US', {
        style: 'currency',
        currency: 'TRY',
        maximumFractionDigits: 0
    }).format(price || 0)
}

// Reset quantity when product changes
watch(() => props.product?.id, () => {
    quantity.value = 1
    added.value = false
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(100%);
    opacity: 0;
}

.safe-bottom {
    padding-bottom: max(env(safe-area-inset-bottom), 8px);
}
</style>
