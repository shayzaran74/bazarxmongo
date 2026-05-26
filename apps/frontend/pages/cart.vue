<template>
  <div class="min-h-screen bg-gray-50 pb-12">
    <AnnouncementBar page="cart" />

    <div class="w-full py-6 px-4 sm:px-6 lg:px-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">{{ $t('cart.myCart') }}</h1>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="h-12 w-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6 flex items-start gap-3">
        <ExclamationTriangleIcon class="h-6 w-6 text-red-500 flex-shrink-0" />
        <div>
          <h4 class="text-sm font-bold text-red-900 uppercase tracking-wider mb-1">Bir Hata Oluştu</h4>
          <p class="text-sm text-red-700 font-medium">{{ error }}</p>
        </div>
      </div>

      <div v-else>
        <!-- Empty Cart -->
        <div v-if="cartItems.length === 0">
          <CartEmptyState />
          <CartBestSellers :products="bestSellers" :loading="bestSellersLoading" :subtitle-text="subtitleText" />
        </div>

        <!-- Active Cart: Sol içerik + Sağ önceki eklenenler -->
        <div v-else class="flex gap-8 items-start">

          <!-- Sol: Sepet + Özet -->
          <div class="flex-1 min-w-0 space-y-6">
            <!-- Sepet Kalemleri -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <ul class="divide-y divide-gray-100">
                <li
                  v-for="item in cartItems"
                  :key="item.id"
                  class="p-4 sm:p-6 hover:bg-gray-50/50 transition-colors"
                  data-testid="cart-item"
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

            <!-- Özet -->
            <CartSummary
              :summary="cartSummary || { subtotal: 0, shipping: 0, tax: 0, total: 0, totalPrice: 0, totalItems: 0 }"
              :applicable-escrow-coupons="applicableEscrowCoupons"
              :applied-escrow-coupon="appliedEscrowCoupon"
              @apply-escrow="applyEscrowCoupon"
              @remove-escrow="removeEscrowCoupon"
              @checkout="checkout"
              @quick-checkout="quickCheckout"
            />
          </div>

          <!-- Sağ: Önceden Eklenenler / Önerilen -->
          <aside class="w-72 flex-shrink-0 sticky top-24 space-y-4">
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div class="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <ClockIcon class="w-4 h-4 text-primary-600" />
                <span class="font-black text-sm text-gray-900">Önceden Eklenenler</span>
              </div>

              <div v-if="bestSellersLoading" class="p-5 space-y-3">
                <div v-for="i in 4" :key="i" class="h-16 bg-gray-100 rounded-xl animate-pulse" />
              </div>

              <ul v-else-if="bestSellers.length > 0" class="divide-y divide-gray-50">
                <li
                  v-for="product in bestSellers.slice(0, 6)"
                  :key="product.id"
                  class="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer group"
                  @click="navigateTo(getProductUrl(product))"
                >
                  <div class="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                    <img
                      v-if="product.image"
                      :src="product.image"
                      :alt="product.name"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <ShoppingCartIcon v-else class="w-6 h-6 text-gray-300 m-3" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold text-gray-800 truncate group-hover:text-primary-600 transition-colors">{{ product.name }}</p>
                    <p class="text-[11px] font-black text-primary-600 mt-0.5">
                      {{ formatPrice(product.price) }}
                    </p>
                  </div>
                  <button
                    class="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100"
                    @click.stop="addRecentToCart(product)"
                  >
                    <PlusIcon class="w-3.5 h-3.5" />
                  </button>
                </li>
              </ul>

              <div v-else class="p-5 text-center">
                <p class="text-xs text-gray-400 font-medium">Öneri bulunamadı</p>
              </div>
            </div>

            <!-- Devam Et Butonu (sticky kısayol) -->
            <button
              class="w-full py-4 bg-gray-900 hover:bg-primary-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg"
              @click="checkout"
            >
              Ödemeye Geç
            </button>
          </aside>

        </div>
        
        <!-- En çok alınan ürünler (Aktif sepetin altında da görünsün) -->
        <div v-if="cartItems.length > 0" class="mt-8">
          <CartBestSellers :products="bestSellers" :loading="bestSellersLoading" subtitle-text="Sepetinize eklediğiniz ürünlerin yanına bunları da değerlendirebilirsiniz." />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { definePageMeta, useHead, useI18n } from '#imports'
import { useCartPage } from '~/composables/useCartPage'
import AnnouncementBar from '~/components/common/AnnouncementBar.vue'
import ProductItem from '~/components/product/ProductItem.vue'
import CartEmptyState from '~/components/cart/CartEmptyState.vue'
import CartSummary from '~/components/cart/CartSummary.vue'
import CartBestSellers from '~/components/cart/CartBestSellers.vue'
import { ExclamationTriangleIcon, ClockIcon, ShoppingCartIcon, PlusIcon } from '@heroicons/vue/24/outline'
import { useCartStore } from '~/stores/cart'

definePageMeta({ layout: 'default', middleware: 'auth', hideSideAds: true })
const { t } = useI18n()
useHead({
  title: `${t('cart.myCart')} - BazarX`,
  meta: [{ name: 'description', content: t('cart.emptyCartSubtitle') }]
})

const {
  cartItems, cartSummary, loading, error, bestSellers, bestSellersLoading,
  subtitleText, applicableEscrowCoupons, appliedEscrowCoupon,
  init, updateQuantity, removeItem, applyEscrowCoupon, removeEscrowCoupon,
  checkout, quickCheckout
} = useCartPage()

const cartStore = useCartStore()
const { $toast } = useNuxtApp()

const getProductUrl = (product: { slug?: string; id?: string }) =>
  `/products/${product.slug || product.id}`

const formatPrice = (p: unknown) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(p) || 0)

const addRecentToCart = async (product: { id?: string; [key: string]: unknown }) => {
  if (!product.id) return
  try {
    await cartStore.addToCart(product.id as string, 1, undefined, product)
    $toast?.success('Sepete eklendi!')
  } catch {
    $toast?.error('Eklenemedi')
  }
}

onMounted(() => init())
</script>
