<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-100 mt-12">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-3xl font-bold text-gray-900">
          📈 {{ $t('cart.bestSellers') }}
        </h2>
        <p class="text-gray-600 mt-1">
          {{ subtitleText }}
        </p>
      </div>
      <NuxtLink
        to="/products?sortBy=popular"
        class="text-primary-600 hover:text-primary-800 font-semibold flex items-center group"
      >
        {{ $t('profile.viewAll') }}
        <ArrowRightIcon class="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </NuxtLink>
    </div>

    <div
      v-if="loading"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      <div
        v-for="i in 4"
        :key="'bs-skeleton-' + i"
        class="animate-pulse bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
      >
        <div class="w-full h-48 bg-gray-200 rounded-xl mb-4" />
        <div class="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div class="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>

    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      <div
        v-for="(product, index) in products"
        :key="'cart-bestseller-' + product.id"
        class="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-4 border border-gray-100 hover:border-primary-100 relative overflow-hidden flex flex-col cursor-pointer"
        @click="navigateTo(`/products/${product.id}`)"
      >
        <div class="absolute top-2 left-2 bg-gradient-to-br from-red-500 to-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg transform -rotate-3 z-10 shadow-lg">
          TOP #{{ index + 1 }}
        </div>

        <div class="relative aspect-square mb-4 rounded-xl overflow-hidden bg-gray-50">
          <ProductImage
            :src="product.images?.[0] || product.image"
            :alt="product.name"
            image-class="group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        <div class="flex-1">
          <h4 class="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors min-h-[2.5rem] flex items-center">
            {{ product.name }}
          </h4>

          <div class="flex items-center mb-3">
            <div class="flex items-center text-yellow-400">
              <StarIcon
                v-for="s in 5"
                :key="s"
                class="h-3.5 w-3.5 fill-current"
                :class="s <= 4 ? 'text-yellow-400' : 'text-gray-200'"
              />
            </div>
            <span class="text-xs text-gray-400 ml-1.5 font-medium">({{ product.reviewCount || 0 }})</span>
          </div>

          <div class="flex items-end justify-between mt-auto">
            <div>
              <span class="text-xl font-black text-primary-600">{{ formatPrice(product.price) }}</span>
            </div>
            <div class="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              {{ $t('cart.soldCount', { count: product.soldCount || 0 }) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ArrowRightIcon from '@heroicons/vue/24/outline/ArrowRightIcon'
import StarIcon from '@heroicons/vue/24/outline/StarIcon'
import { navigateTo, useFormat } from '#imports'
import type { Product } from '@barterborsa/shared-types'

const { formatPrice } = useFormat()

defineProps({
  products: { type: Array as () => Product[], default: () => [] },
  loading: { type: Boolean, default: false },
  subtitleText: { type: String, default: '' }
})
</script>
