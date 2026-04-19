<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <h2 class="text-xl font-semibold text-gray-900 mb-4">
      Sipariş Özeti
    </h2>

    <!-- Loading state -->
    <div
      v-if="loading"
      class="flex justify-center items-center h-32"
    >
      <div class="spinner h-8 w-8" />
    </div>

    <!-- Cart items -->
    <div
      v-else
      class="space-y-4"
    >
      <ProductItem
        v-for="item in items"
        :key="item.id"
        :product="item"
      />

      <!-- Summary -->
      <div class="pt-4 space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Ara Toplam</span>
          <span class="text-gray-900">{{ formatPrice(subtotal) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Kargo</span>
          <span class="text-gray-900">{{ shippingCost === 0 ? 'Ücretsiz' : formatPrice(shippingCost) }}</span>
        </div>
        <div
          v-if="appliedCoupon"
          class="flex justify-between text-sm text-green-600 font-bold"
        >
          <span>İndirim ({{ appliedCoupon.code }})</span>
          <span>-{{ formatPrice(appliedCoupon.discountAmount) }}</span>
        </div>
        <div
          v-if="loyaltyXpDiscount > 0"
          class="flex justify-between text-sm text-primary-600 font-bold"
        >
          <span>Sadakat İndirimi (XP)</span>
          <span>-{{ formatPrice(loyaltyXpDiscount) }}</span>
        </div>
        <div
          v-if="useWalletBalance && xpToUse > 0"
          class="flex justify-between text-sm text-primary-600 font-bold"
        >
          <span>Cüzdan Bakiyesi</span>
          <span>-{{ formatPrice(xpToUse) }}</span>
        </div>
        <div
          v-if="appliedEscrowCoupon"
          class="flex justify-between text-sm text-green-600 font-bold"
        >
          <span>Ad-Swap Hediyesi ({{ appliedEscrowCoupon.Listing?.CatalogProduct?.name || 'Ürün' }})</span>
          <span>-{{ formatPrice(appliedEscrowCoupon.rewardValue) }}</span>
        </div>
        <div class="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
          <span>Ödenecek Tutar</span>
          <span>{{ formatPrice(totalToPay) }}</span>
        </div>
      </div>

      <!-- Slot for Footer (like Coupon Section) -->
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ProductItem from '~/components/product/ProductItem.vue'
import { useFormat } from '~/composables/useFormat'
import type { CheckoutCoupon, CheckoutEscrowCoupon, CartItem } from '@barterborsa/shared-types'

const { formatPrice } = useFormat()

defineProps({
  items: { type: Array as () => CartItem[], required: true },
  loading: { type: Boolean, default: false },
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, default: 0 },
  appliedCoupon: { type: Object as () => CheckoutCoupon | null, default: null },
  loyaltyXpDiscount: { type: Number, default: 0 },
  useWalletBalance: { type: Boolean, default: false },
  xpToUse: { type: Number, default: 0 },
  appliedEscrowCoupon: { type: Object as () => CheckoutEscrowCoupon | null, default: null },
  totalToPay: { type: Number, required: true }
})
</script>
