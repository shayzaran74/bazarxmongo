<template>
  <div class="py-12">
    <div class="text-center mb-12">
      <svg
        class="mx-auto h-16 w-16 text-gray-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      <h3 class="mt-4 text-2xl font-bold text-gray-900">
        {{ $t('cart.emptyCartTitle') }}
      </h3>
      <p class="mt-2 text-gray-500 max-w-sm mx-auto">
        {{ $t('cart.emptyCartSubtitle') }}
      </p>
      <div class="mt-4 mb-8 inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-xs font-bold border border-primary-200">
        <span class="mr-2">🚀</span> {{ $t('cart.innovationsActive') }}
      </div>
      <div class="mt-8">
        <NuxtLink
          to="/products"
          class="inline-flex items-center px-8 py-3 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-lg hover:shadow-primary-200"
        >
          {{ $t('cart.startShopping') }}
          <ArrowRightIcon class="ml-2 h-5 w-5" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ArrowRightIcon from '@heroicons/vue/24/outline/ArrowRightIcon'
</script>
