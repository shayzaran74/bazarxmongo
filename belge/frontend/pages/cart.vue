<template>
  <div class="min-h-screen bg-gray-50 pb-12">
    <AnnouncementBar page="cart" />
    
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">
          {{ $t('cart.myCart') }}
        </h1>

        <!-- Loading State -->
        <div
          v-if="loading"
          class="flex justify-center items-center h-64"
        >
          <div class="spinner h-12 w-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>

        <!-- Error State -->
        <div
          v-else-if="error"
          class="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6 flex items-start gap-3"
        >
          <ExclamationTriangleIcon class="h-6 w-6 text-red-500 flex-shrink-0" />
          <div class="flex-1">
            <h4 class="text-sm font-bold text-red-900 uppercase tracking-wider mb-1">
              Bir Hata Oluştu
            </h4>
            <p class="text-sm text-red-700 font-medium">
              {{ error }}
            </p>
          </div>
        </div>

        <!-- Content Area -->
        <div v-else>
          <!-- Empty Cart Layout -->
          <div v-if="cartItems.length === 0">
            <CartEmptyState />
            <CartBestSellers 
              :products="bestSellers" 
              :loading="bestSellersLoading" 
              :subtitle-text="subtitleText" 
            />
          </div>

          <!-- Active Cart Layout -->
          <div
            v-else
            class="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <!-- Left Side: Items -->
            <div class="lg:col-span-2">
              <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <ul class="divide-y divide-gray-100">
                  <li
                    v-for="item in cartItems"
                    :key="item.id"
                    class="p-4 sm:p-6 hover:bg-gray-50/50 transition-colors"
                  >
                    <ProductItem 
                      :product="item" 
                      :show-checkbox="true" 
                      :show-quantity-controls="true"
                      :show-remove-button="true" 
                      @remove-item="removeItem" 
                      @update-quantity="updateQuantity" 
                    />
                  </li>
                </ul>
              </div>
              
              <!-- Cart Page Best Sellers (Bottom) -->
              <div class="mt-8">
                <CartBestSellers 
                  :products="bestSellers" 
                  :loading="bestSellersLoading" 
                  :subtitle-text="subtitleText" 
                />
              </div>
            </div>

            <!-- Right Side: Summary -->
            <div class="lg:col-span-1">
              <div class="sticky top-24">
                <CartSummary 
                  :summary="cartSummary" 
                  :applicable-escrow-coupons="applicableEscrowCoupons"
                  :applied-escrow-coupon="appliedEscrowCoupon"
                  @apply-escrow="applyEscrowCoupon"
                  @remove-escrow="removeEscrowCoupon"
                  @checkout="checkout"
                  @quick-checkout="quickCheckout"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { definePageMeta, useHead, useI18n } from '#imports'
import { useCartPage } from '~/composables/useCartPage'

// Components
import AnnouncementBar from '~/components/common/AnnouncementBar.vue'
import ProductItem from '~/components/product/ProductItem.vue'
import CartEmptyState from '~/components/cart/CartEmptyState.vue'
import CartSummary from '~/components/cart/CartSummary.vue'
import CartBestSellers from '~/components/cart/CartBestSellers.vue'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

// Page Configuration
definePageMeta({ layout: 'default', middleware: 'auth' })
const { t } = useI18n()
useHead({ 
  title: `${t('cart.myCart')} - BazarX`,
  meta: [{ name: 'description', content: t('cart.emptyCartSubtitle') }]
})

// ViewModel Integration
const {
  cartItems, cartSummary, loading, error, bestSellers, bestSellersLoading,
  subtitleText, applicableEscrowCoupons, appliedEscrowCoupon,
  init, updateQuantity, removeItem, applyEscrowCoupon, removeEscrowCoupon,
  checkout, quickCheckout
} = useCartPage()

onMounted(() => init())
</script>