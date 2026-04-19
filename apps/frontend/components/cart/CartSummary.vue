<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h2 class="text-lg font-medium text-gray-900 mb-4">
      {{ $t('cart.summary') }}
    </h2>

    <div class="space-y-4">
      <div class="flex justify-between text-base font-medium text-gray-900">
        <p>{{ $t('cart.totalItems') }}</p>
        <p>{{ summary.totalItems }}</p>
      </div>

      <div class="flex justify-between">
        <p class="text-sm text-gray-600">
          {{ $t('cart.subtotal') }}
        </p>
        <p class="text-sm text-gray-900">
          {{ formatPrice(summary.totalPrice || 0) }}
        </p>
      </div>

      <div class="flex justify-between">
        <p class="text-sm text-gray-600">
          {{ $t('cart.shipping') }}
        </p>
        <p class="text-sm text-gray-900">
          {{ $t('cart.free') }}
        </p>
      </div>

      <div class="border-t border-gray-200 pt-4 flex justify-between text-base font-medium text-gray-900">
        <p>{{ $t('cart.total') }}</p>
        <div>
          <p :class="{ 'line-through text-gray-400 text-sm': appliedEscrowCoupon }">
            {{ formatPrice(summary.totalPrice || 0) }}
          </p>
          <p
            v-if="appliedEscrowCoupon"
            class="text-orange-600 font-extrabold mt-1"
          >
            {{ formatPrice(Math.max(0, (summary.totalPrice || 0) - (appliedEscrowCoupon.rewardValue || 0))) }}
          </p>
        </div>
      </div>
    </div>

    <!-- BNPL Component -->
    <div class="mt-6">
      <PaymentOptionBNPL
        v-if="(summary.totalPrice || 0) > 0"
        :total-price="summary.totalPrice || 0"
      />
    </div>

    <!-- Escrow Coupon Section -->
    <div
      v-if="applicableEscrowCoupons.length > 0"
      class="mt-4 border-t border-gray-200 pt-4"
    >
      <div class="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200 shadow-inner">
        <div class="flex items-start gap-3">
          <GiftIcon class="h-6 w-6 text-orange-500 mt-0.5 animate-bounce" />
          <div class="flex-1">
            <h3 class="text-sm font-black text-orange-900 uppercase">
              {{ $t('cart.surpriseGiftDetected') }}
            </h3>
            <p class="text-[10px] sm:text-xs text-orange-700 font-bold mb-3">
              {{ $t('cart.adSwapDiscountFound') }}
            </p>

            <div
              v-for="coupon in applicableEscrowCoupons"
              :key="coupon.id"
              class="mb-2"
            >
              <div
                v-if="!appliedEscrowCoupon"
                class="flex flex-col gap-2"
              >
                <div class="bg-white px-3 py-2 rounded-lg border border-orange-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p class="text-xs font-bold text-gray-900">
                      {{ coupon.listing?.catalogProduct?.name || $t('cart.specialProduct') }}
                    </p>
                    <p class="text-[10px] text-orange-600 font-bold">
                      {{ $t('cart.fullDiscountShippingOnly') }}
                    </p>
                  </div>
                </div>
                <button
                  class="w-full py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-[11px] font-black shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all uppercase hover:scale-[1.02] active:scale-95 flex justify-center items-center gap-2"
                  @click="$emit('applyEscrow', coupon)"
                >
                  {{ $t('cart.applyAdSwap') }}
                </button>
              </div>
              <div
                v-else-if="appliedEscrowCoupon.id === coupon.id"
                class="bg-green-50 px-3 py-3 rounded-xl border border-green-200 flex flex-col items-center text-center"
              >
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <CheckIcon class="h-5 w-5 text-green-600" />
                </div>
                <span class="text-xs font-black text-green-800 uppercase block">{{ $t('cart.discountApplied') }}</span>
                <span class="text-[10px] font-bold text-green-600 mt-1">-{{ formatPrice(coupon.rewardValue || 0) }} {{ $t('cart.shippingYours') }}</span>
                <button
                  class="mt-2 text-[10px] font-bold text-red-500 underline uppercase tracking-wider hover:text-red-700"
                  @click="$emit('removeEscrow')"
                >
                  {{ $t('cart.cancel') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-6 space-y-3">
      <button
        class="w-full btn-primary btn-lg"
        @click="$emit('checkout')"
      >
        {{ $t('cart.completeOrder') }}
      </button>

      <button
        class="w-full flex items-center justify-center gap-2 py-3 px-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all border border-gray-700 shadow-lg"
        @click="$emit('quickCheckout')"
      >
        <span class="text-lg">⚡</span> {{ $t('cart.quickCheckout') }}
      </button>

      <div class="mt-4 flex justify-center">
        <NuxtLink
          to="/products"
          class="text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          {{ $t('cart.continueShopping') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import GiftIcon from '@heroicons/vue/24/outline/GiftIcon'
import CheckIcon from '@heroicons/vue/24/outline/CheckIcon'
import { useFormat } from '#imports'
import type { CartSummary, EscrowCoupon } from '@barterborsa/shared-types'

const { formatPrice } = useFormat()

defineProps({
  summary: { type: Object as () => CartSummary, required: true },
  applicableEscrowCoupons: { type: Array as () => EscrowCoupon[], default: () => [] },
  appliedEscrowCoupon: { type: Object as () => EscrowCoupon | null, default: null }
})

defineEmits(['applyEscrow', 'removeEscrow', 'checkout', 'quickCheckout'])
</script>
