<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <AnnouncementBar page="checkout" />

    <div class="w-full px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Ödeme</h1>
        <p class="mt-1 text-gray-500 text-sm">Siparişinizi güvenli şekilde tamamlayın</p>
      </div>

      <!-- Ana Layout: Sol içerik + Sağ sidebar -->
      <div class="flex gap-8 items-start">

        <!-- Sol: Ödeme Formu (flex-1) -->
        <div class="flex-1 min-w-0">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Sipariş Özeti & Kupon -->
            <div class="flex flex-col gap-6">
              <CheckoutOrderSummary
                :items="cartStore.items"
                :loading="cartStore.loading"
                :subtotal="cartStore.totalPrice"
                :shipping-cost="shippingCost"
                :applied-coupon="appliedCoupon"
                :loyalty-xp-discount="loyaltyXpDiscount"
                :use-wallet-balance="useWalletBalance"
                :xp-to-use="xpToUse"
                :applied-escrow-coupon="appliedEscrowCoupon"
                :total-to-pay="cashToPay"
              >
                <template #footer>
                  <CheckoutCouponSection
                    :applied-coupon="appliedCoupon"
                    :validating="validatingCoupon"
                    :error="couponError"
                    @apply="applyCoupon"
                    @remove="removeCoupon"
                  />
                </template>
              </CheckoutOrderSummary>
            </div>

            <!-- Adres & Ödeme Yöntemi -->
            <CheckoutPaymentMethod
              v-model:selected-method="selectedMethod"
              v-model:loyalty-xp-discount="loyaltyXpDiscount"
              v-model:accepted-agreements="acceptedAgreements"
              v-model:use-wallet-balance="useWalletBalance"
              :wallet-balance="walletBalance"
              :wallet-loading="walletLoading"
              :final-amount="totalAmountWithShipping"
              :loyalty-status="loyaltyStatus"
              :final-amount-excluding-loyalty="finalAmountExcludingLoyalty"
              :payment-form-content="paymentFormContent"
              :processing="processing"
              :is-form-valid="isFormValid"
              :cash-to-pay="cashToPay"
              @pay="onSubmitPayment"
              @back="goBack"
              @open-legal="openLegalDoc"
            >
              <template #shipping>
                <CheckoutAddressForm
                  v-model:selected-address-id="selectedAddressId"
                  v-model:show-new-address-form="showNewAddressForm"
                  v-model:new-address="newAddress"
                  v-model:save-new-address="saveNewAddress"
                  :addresses="addressStore.addresses"
                  :loading="addressStore.loading"
                />
              </template>
            </CheckoutPaymentMethod>
          </div>
        </div>

        <!-- Sağ: Önceden Eklenenler Sidebar -->
        <aside class="w-72 flex-shrink-0 sticky top-24 space-y-4">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <ClockIcon class="w-4 h-4 text-primary-600" />
              <span class="font-black text-sm text-gray-900">Önceden Eklenenler</span>
            </div>

            <div v-if="bestSellersLoading" class="p-5 space-y-3">
              <div v-for="i in 5" :key="i" class="h-14 bg-gray-100 rounded-xl animate-pulse" />
            </div>

            <ul v-else-if="bestSellers.length > 0" class="divide-y divide-gray-50">
              <li
                v-for="product in bestSellers.slice(0, 6)"
                :key="product.id"
                class="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer group"
                @click="navigateTo(getProductUrl(product))"
              >
                <div class="w-11 h-11 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                  <img
                    v-if="product.image"
                    :src="product.image"
                    :alt="product.name"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <ShoppingCartIcon v-else class="w-5 h-5 text-gray-300 m-3" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-bold text-gray-800 truncate group-hover:text-primary-600 transition-colors">
                    {{ product.name }}
                  </p>
                  <p class="text-[11px] font-black text-primary-600 mt-0.5">
                    {{ formatPrice(product.price) }}
                  </p>
                </div>
                <button
                  class="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100"
                  title="Sepete Ekle"
                  @click.stop="addToCartQuick(product)"
                >
                  <PlusIcon class="w-3.5 h-3.5" />
                </button>
              </li>
            </ul>

            <div v-else class="p-5 text-center">
              <p class="text-xs text-gray-400 font-medium">Öneri bulunamadı</p>
            </div>
          </div>

          <!-- Güvenli Ödeme Rozeti -->
          <div class="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <LockClosedIcon class="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p class="text-xs font-black text-gray-800">256-bit SSL Şifrelemesi</p>
              <p class="text-[10px] text-gray-400 font-medium mt-0.5">Ödeme bilgileriniz güvende</p>
            </div>
          </div>
        </aside>

      </div>
    </div>

    <!-- Modals -->
    <LegalDocumentModal
      :is-open="showLegalModal"
      :title="currentLegalDoc.title"
      :content="currentLegalDoc.content"
      @close="showLegalModal = false"
      @confirm="acceptedAgreements = true; showLegalModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { navigateTo, useHead, definePageMeta, useNuxtApp } from '#imports'
import { useCheckout } from '~/composables/useCheckout'
import { useCartStore } from '~/stores/cart'

import CheckoutOrderSummary from '~/components/checkout/CheckoutOrderSummary.vue'
import CheckoutCouponSection from '~/components/checkout/CheckoutCouponSection.vue'
import CheckoutAddressForm from '~/components/checkout/CheckoutAddressForm.vue'
import CheckoutPaymentMethod from '~/components/checkout/CheckoutPaymentMethod.vue'
import AnnouncementBar from '~/components/common/AnnouncementBar.vue'
import LegalDocumentModal from '~/components/modals/LegalDocumentModal.vue'
import { ClockIcon, ShoppingCartIcon, PlusIcon, LockClosedIcon } from '@heroicons/vue/24/outline'

definePageMeta({ layout: 'default', middleware: 'auth', hideSideAds: true })
useHead({ title: 'Ödeme - TicariTakas' })

const app = useNuxtApp()
interface ToastService {
  success: (msg: string) => void
  error: (msg: string) => void
  info: (msg: string) => void
  warning: (msg: string) => void
}
const $toast = (app as unknown as { $toast: ToastService }).$toast

const {
  cartStore: checkoutCartStore, addressStore, processing, selectedMethod,
  walletBalance, walletLoading, loyaltyStatus, loyaltyXpDiscount,
  showLegalModal, currentLegalDoc, acceptedAgreements, shippingCost,
  appliedCoupon, validatingCoupon, couponError, paymentFormContent,
  appliedEscrowCoupon, selectedAddressId, showNewAddressForm, saveNewAddress,
  newAddress, useWalletBalance, finalAmountExcludingLoyalty,
  xpToUse, cashToPay, isFormValid, totalAmountWithShipping,
  init, applyCoupon: applyCouponAction, removeCoupon, handlePayment, openLegalDoc
} = useCheckout()

const cartStore = useCartStore()

// Önceden Eklenenler — çok satan ürünler
const bestSellers = ref<Array<{ id: string; name: string; image?: string; price: unknown; slug?: string }>>([])
const bestSellersLoading = ref(false)

const fetchBestSellers = async () => {
  bestSellersLoading.value = true
  try {
    const { $api } = useApi()
    const res = await $api<{ data?: unknown[] }>('/api/v1/products', { query: { sort: 'bestselling', limit: 6 } })
    bestSellers.value = (res?.data ?? []) as typeof bestSellers.value
  } catch { /* yoksay */ } finally {
    bestSellersLoading.value = false
  }
}

const getProductUrl = (product: { slug?: string; id?: string }) =>
  `/products/${product.slug || product.id}`

const formatPrice = (p: unknown) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(p) || 0)

const addToCartQuick = async (product: { id?: string; [key: string]: unknown }) => {
  if (!product.id) return
  try {
    await cartStore.addToCart(product.id, 1, undefined, product)
    $toast?.success('Sepete eklendi!')
  } catch {
    $toast?.error('Eklenemedi')
  }
}

onMounted(async () => {
  const res = await init()
  if (!res.success && res.redirect) {
    navigateTo(res.redirect)
  } else if (checkoutCartStore.items.length === 0) {
    navigateTo('/cart')
  }
  fetchBestSellers()
})

const applyCoupon = async (code: string) => {
  const res = await applyCouponAction(code)
  if (res.success && $toast) $toast.success('Kupon başarıyla uygulandı.')
  else if (res.error && $toast) $toast.error(res.error)
}

const onSubmitPayment = async () => {
  const res = await handlePayment()
  if (res.success) {
    if ($toast) $toast.success('Ödeme başarıyla gerçekleşti.')
    const orderId = res.orderId || (res.data as { id?: string } | undefined)?.id ||
      (Array.isArray(res.data) ? (res.data as { id?: string }[])[0]?.id : null)
    navigateTo(`/payment-success?status=succeeded&type=wallet${orderId ? `&orderId=${orderId}` : ''}`)
  } else if (res.error && $toast) {
    $toast.error(res.error)
  }
}

const goBack = () => navigateTo('/cart')
</script>
