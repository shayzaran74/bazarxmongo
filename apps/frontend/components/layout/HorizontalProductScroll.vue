<template>
  <div class="relative my-10 group/section">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8 px-2">
      <div class="flex items-center gap-4">
        <div class="w-1.5 h-8 bg-primary-600 rounded-full" />
        <h2
          class="text-2xl md:text-3xl font-black text-gray-950 dark:text-white tracking-tighter uppercase italic leading-none"
        >
          {{ title }}
        </h2>
      </div>
      <NuxtLink
        v-if="link"
        :to="link"
        class="flex items-center gap-2 group/link text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-primary-600 transition-colors"
      >
        {{ linkText || $t('common.viewAll') || 'Tümünü Gör' }}
        <div
          class="w-8 h-8 rounded-full border border-gray-100 dark:border-gray-800 flex items-center justify-center group-hover/link:bg-primary-600 group-hover/link:text-white transition-all"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </div>
      </NuxtLink>
    </div>

    <!-- Scroll Area -->
    <div class="relative group/scroll px-1">
      <!-- Scroll Buttons (Desktop Only) -->
      <button
        v-if="canScrollLeft"
        class="absolute -left-6 top-1/2 -translate-y-1/2 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl border border-gray-100 dark:border-gray-800 p-4 rounded-full opacity-0 group-hover/scroll:opacity-100 transition-all duration-300 hover:scale-110 hidden md:flex items-center justify-center"
        @click="scroll('left')"
      >
        <ChevronLeftIcon class="h-6 w-6 text-gray-950 dark:text-white" />
      </button>

      <button
        v-if="canScrollRight"
        class="absolute -right-6 top-1/2 -translate-y-1/2 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl border border-gray-100 dark:border-gray-800 p-4 rounded-full opacity-0 group-hover/scroll:opacity-100 transition-all duration-300 hover:scale-110 hidden md:flex items-center justify-center"
        @click="scroll('right')"
      >
        <ChevronRightIcon class="h-6 w-6 text-gray-950 dark:text-white" />
      </button>

      <!-- Scrollable Container -->
      <div
        ref="scrollContainer"
        class="flex gap-4 md:gap-6 overflow-x-auto pb-10 px-2 scrollbar-hide scroll-smooth snap-x"
        @scroll="updateScrollState"
      >
        <div
          v-for="product in products"
          :key="product.id"
          class="w-[230px] md:w-[299px] flex-shrink-0 snap-start"
        >
          <ProductCard
            :product="product"
            @click="navigateToProduct(product)"
            @add-to-cart="(p) => emit('add-to-cart', p)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted, watch, navigateTo } from '#imports'
import ChevronLeftIcon from '@heroicons/vue/24/outline/ChevronLeftIcon'
import ChevronRightIcon from '@heroicons/vue/24/outline/ChevronRightIcon'

const props = defineProps({
    title: {
        type: String,
        required: true
    },
    products: {
        type: Array,
        required: true
    },
    link: {
        type: String,
        default: ''
    },
    linkText: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['add-to-cart'])
const scrollContainer = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const updateScrollState = () => {
    if (!scrollContainer.value) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value
    canScrollLeft.value = scrollLeft > 10
    canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 10
}

const scroll = (direction) => {
    if (!scrollContainer.value) return
    const scrollAmount = direction === 'left' ? -scrollContainer.value.clientWidth * 0.8 : scrollContainer.value.clientWidth * 0.8
    scrollContainer.value.scrollBy({ left: scrollAmount, behavior: 'smooth' })
}

const navigateToProduct = (product) => {
    navigateTo(`/products/${product.id}`)
}

onMounted(() => {
    updateScrollState()
    window.addEventListener('resize', updateScrollState)
})

onUnmounted(() => {
    window.removeEventListener('resize', updateScrollState)
})

watch(() => props.products, () => {
    nextTick(updateScrollState)
}, { deep: true })
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
