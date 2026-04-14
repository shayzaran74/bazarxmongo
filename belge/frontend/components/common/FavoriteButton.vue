<template>
  <button
    :disabled="loading"
    :class="[
      'inline-flex items-center justify-center p-2 rounded-full transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'hover:scale-110 transform',
      {
        'text-red-500 bg-red-50 hover:bg-red-100': isFavorite,
        'text-gray-400 bg-gray-50 hover:bg-gray-100 hover:text-red-500': !isFavorite
      }
    ]"
    :title="isFavorite ? $t('product.removeFromWishlist') : $t('product.addToWishlist')"
    @click="handleToggle"
  >
    <HeartIcon
      :class="[
        'h-5 w-5 transition-all duration-200',
        {
          'fill-current': isFavorite,
          'fill-none': !isFavorite
        }
      ]"
    />
    <span
      v-if="loading"
      class="sr-only"
    >{{ $t('common.loading') }}</span>
  </button>
</template>

<script setup>
import { ref, computed, useWishlistStore } from '#imports'
import HeartIcon from '@heroicons/vue/24/outline/HeartIcon'

const props = defineProps({
  productId: {
    type: String,
    required: true
  }
})

const wishlistStore = useWishlistStore()
const loading = ref(false)

const isFavorite = computed(() => wishlistStore.isInWishlist(props.productId))

const handleToggle = async () => {
  loading.value = true
  await wishlistStore.toggleWishlist(props.productId)
  loading.value = false
}
</script>