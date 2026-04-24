<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <AnnouncementBar page="checkout" />
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">
          Ödeme
        </h1>
        <p class="mt-2 text-gray-600">
          Siparişinizi güvenli şekilde tamamlayın
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Order Summary & Coupon Area -->
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

        <!-- Address & Payment Content Area -->
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
          :client-secret="clientSecret"
          :stripe-error="stripeError"
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

// Components
import CheckoutOrderSummary from '~/components/checkout/CheckoutOrderSummary.vue'
import CheckoutCouponSection from '~/components/checkout/CheckoutCouponSection.vue'
import CheckoutAddressForm from '~/components/checkout/CheckoutAddressForm.vue'
import CheckoutPaymentMethod from '~/components/checkout/CheckoutPaymentMethod.vue'
import AnnouncementBar from '~/components/common/AnnouncementBar.vue'
import LegalDocumentModal from '~/components/modals/LegalDocumentModal.vue'

// Page Config
definePageMeta({ layout: 'default', middleware: 'auth' })
useHead({ title: 'Ödeme - TicariTakas' })

// MVVM Integration - ViewModel Connection
const app = useNuxtApp()
interface ToastService {
  success: (msg: string) => void
  error: (msg: string) => void
  info: (msg: string) => void
  warning: (msg: string) => void
}

const $toast = (app as unknown as { $toast: ToastService }).$toast


const {
  cartStore, addressStore, processing, clientSecret, selectedMethod,
  walletBalance, walletLoading, stripeError, loyaltyStatus, loyaltyXpDiscount,
  showLegalModal, currentLegalDoc, acceptedAgreements, shippingCost,
  appliedCoupon, validatingCoupon, couponError, paymentFormContent,
  appliedEscrowCoupon, selectedAddressId, showNewAddressForm, saveNewAddress,
  newAddress, useWalletBalance, finalAmountExcludingLoyalty, finalAmount,
  xpToUse, cashToPay, isFormValid, totalAmountWithShipping,
  init, applyCoupon: applyCouponAction, removeCoupon, handlePayment, openLegalDoc
} = useCheckout()

// Lifecycle Initialization
onMounted(async () => {
  const res = await init()
  if (!res.success && res.redirect) {
    navigateTo(res.redirect)
  } else if (cartStore.items.length === 0) {
    navigateTo('/cart')
  }
})

// UI Wrappers for Event Handling
const applyCoupon = async (code: string) => {
  const res = await applyCouponAction(code)
  if (res.success && $toast) {
    $toast.success('Kupon başarıyla uygulandı.')
  } else if (res.error && $toast) {
    $toast.error(res.error)
  }
}

const onSubmitPayment = async () => {
  const res = await handlePayment()
  if (res.success) {
    if ($toast) $toast.success('Ödeme başarıyla gerçekleşti.')
    const orderId = res.orderId || (res.data as any)?.id || (Array.isArray(res.data) ? (res.data as any[])[0]?.id : null)
    navigateTo(`/payment-success?status=succeeded&type=wallet${orderId ? `&orderId=${orderId}` : ''}`)
  } else if (res.error && $toast) {
    $toast.error(res.error)
  }
}

const goBack = () => navigateTo('/cart')
</script>