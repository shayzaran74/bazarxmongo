<template>
  <div class="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-10 border border-gray-100 flex flex-col">
    <div class="mb-10 text-center md:text-left">
      <h2 class="text-3xl font-black text-gray-900 mb-2 tracking-tight">
        Ödeme Bilgileri
      </h2>
      <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
        Güvenli Ödeme Sistemi
      </p>
    </div>

    <!-- Slot for Shipping Address (passed from parent or just render here) -->
    <slot name="shipping" />

    <!-- Payment Method -->
    <div class="mb-10">
      <h3 class="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">
        Ödeme Yöntemi
      </h3>

      <!-- Loyalty XP Redemption -->
      <div class="mb-8 mt-2">
        <LoyaltyRedeem 
          :current-xp="loyaltyStatus?.currentXp || 0" 
          :model-value="loyaltyXpDiscount"
          :max-amount-tl="finalAmountExcludingLoyalty"
          @update:model-value="$emit('update:loyaltyXpDiscount', $event)" 
        />
      </div>

      <div class="grid grid-cols-1 gap-3">
        <!-- Credit Card Option -->
        <label
          class="flex items-center space-x-4 p-4 border rounded-xl cursor-pointer transition-all"
          :class="selectedMethod === 'card' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'"
        >
          <input
            type="radio"
            value="card"
            :checked="selectedMethod === 'card'"
            class="text-primary-600 focus:ring-primary-500"
            @change="$emit('update:selectedMethod', 'card')"
          >
          <CreditCardIcon
            class="h-6 w-6 text-gray-400"
            :class="{ 'text-primary-600': selectedMethod === 'card' }"
          />
          <div class="flex-1">
            <p class="text-sm font-bold text-gray-900">Kredi/Banka Kartı</p>
            <p class="text-xs text-gray-500">Stripe ile güvenli ödeme</p>
          </div>
          <div class="flex space-x-1">
            <img
              src="https://js.stripe.com/v3/fingerprinted/img/visa-729c05c240c4bdb47b03ac81d9945bfe.svg"
              alt="Visa"
              class="h-4"
            >
            <img
              src="https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg"
              alt="Mastercard"
              class="h-4"
            >
          </div>
        </label>

        <!-- Wallet Option -->
        <label
          class="flex items-center space-x-4 p-4 border rounded-xl cursor-pointer transition-all"
          :class="selectedMethod === 'wallet' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'"
        >
          <input
            type="radio"
            value="wallet"
            :checked="selectedMethod === 'wallet'"
            class="text-primary-600 focus:ring-primary-500"
            @change="$emit('update:selectedMethod', 'wallet')"
          >
          <WalletIcon
            class="h-6 w-6 text-gray-400"
            :class="{ 'text-primary-600': selectedMethod === 'wallet' }"
          />
          <div class="flex-1">
            <p class="text-sm font-bold text-gray-900">Dijital Cüzdan</p>
            <p
              v-if="walletLoading"
              class="text-xs text-gray-400 italic"
            >Yükleniyor...</p>
            <p
              v-else
              class="text-xs text-gray-500"
            >Kullanılabilir: {{ formatPrice(walletBalance) }}</p>
          </div>
          <span
            v-if="!walletLoading && Number(walletBalance) < Number(finalAmount)"
            class="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold"
          >
            Yetersiz Bakiye
          </span>
        </label>
      </div>
    </div>

    <!-- Stripe Payment Element -->
    <div
      v-show="selectedMethod === 'card' && clientSecret"
      class="mb-10"
    >
      <h3 class="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">
        Kart Bilgileri
      </h3>
      <div
        id="payment-element"
        class="p-4 border border-gray-200 rounded-xl"
      >
        <!-- Stripe Elements will be mounted here -->
      </div>
      <div
        v-if="stripeError"
        class="mt-2 text-sm text-red-600 italic"
      >
        {{ stripeError }}
      </div>
    </div>

    <!-- Iyzico / Generic Payment Form Container -->
    <div
      v-if="selectedMethod === 'card' && paymentFormContent"
      class="mb-10"
    >
      <h3 class="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">
        Ödeme Ekranı
      </h3>
      <!-- eslint-disable vue/no-v-html -->
      <div
        id="iyzico-form-container"
        class="p-4 bg-gray-50 rounded-xl border border-gray-200 min-h-[400px]"
        v-html="paymentFormContent"
      />
      <!-- eslint-enable vue/no-v-html -->
    </div>

    <!-- Wallet Balance Toggle (Mixed Payment) -->
    <div
      v-if="selectedMethod === 'card' && walletBalance > 0"
      class="mb-6 p-4 bg-primary-50 rounded-xl border border-primary-100"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="bg-primary-100 p-2 rounded-lg">
            <WalletIcon class="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <p class="text-sm font-bold text-gray-900">
              Cüzdan Bakiyesini Kullan
            </p>
            <p class="text-xs text-gray-500">
              Mevcut Bakiye: {{ formatPrice(walletBalance) }}
            </p>
          </div>
        </div>
        <button 
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
          :class="useWalletBalance ? 'bg-primary-600' : 'bg-gray-200'"
          @click="$emit('update:useWalletBalance', !useWalletBalance)"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            :class="useWalletBalance ? 'translate-x-6' : 'translate-x-1'"
          />
        </button>
      </div>
    </div>

    <!-- Legal Agreements -->
    <div class="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
      <div class="flex items-start gap-3">
        <input 
          id="accept-terms" 
          :checked="acceptedAgreements" 
          type="checkbox" 
          class="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
          @change="$emit('update:acceptedAgreements', ($event.target as HTMLInputElement).checked)" 
        >
        <label
          for="accept-terms"
          class="text-xs text-gray-600 leading-relaxed cursor-pointer select-none"
        >
          <span
            class="text-primary-600 font-bold hover:underline cursor-pointer"
            @click.prevent="$emit('openLegal', 'on-bilgilendirme-formu')"
          >Ön Bilgilendirme Koşulları</span>'nı ve
          <span
            class="text-primary-600 font-bold hover:underline cursor-pointer"
            @click.prevent="$emit('openLegal', 'mesafeli-satis-sozlesmesi')"
          >Mesafeli Satış Sözleşmesi</span>'ni
          okudum, onaylıyorum.
          Ayrıca <span
            class="text-primary-600 font-bold hover:underline cursor-pointer"
            @click.prevent="$emit('openLegal', 'kvkk-aydinlatma-metni')"
          >KVKK Aydınlatma Metni</span> ve
          <span
            class="text-primary-600 font-bold hover:underline cursor-pointer"
            @click.prevent="$emit('openLegal', 'cayma-hakki')"
          >Cayma Hakkı</span> hakkında bilgilendirildim.
        </label>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="space-y-4">
      <button 
        :disabled="processing || !isFormValid || (selectedMethod === 'wallet' && (walletLoading || Number(walletBalance) < Number(finalAmount))) || !acceptedAgreements"
        class="w-full btn-primary btn-lg rounded-xl h-12 flex items-center justify-center font-bold"
        :class="{ 'opacity-50 cursor-not-allowed': processing || !isFormValid || !acceptedAgreements }"
        @click="$emit('pay')"
      >
        <div
          v-if="processing"
          class="flex items-center"
        >
          <div class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-3" />
          İşlem Yapılıyor...
        </div>
        <span v-else>{{ formatPrice(selectedMethod === 'wallet' ? finalAmount : cashToPay) }} Öde</span>
      </button>

      <button
        type="button"
        class="w-full py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
        @click="$emit('back')"
      >
        Sepete Dön
      </button>
    </div>

    <!-- Security Info -->
    <div class="mt-6 flex items-center justify-center text-xs text-gray-400">
      <LockClosedIcon class="h-4 w-4 mr-1.5" />
      <span>256-bit SSL şifreleme ile güvenli ödeme</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CreditCardIcon, LockClosedIcon, WalletIcon } from '@heroicons/vue/24/outline'
import LoyaltyRedeem from '~/components/loyalty/LoyaltyRedeem.vue'
import { useFormat } from '~/composables/useFormat'
import type { CheckoutLoyaltyStatus } from '@barterborsa/shared-types'

const { formatPrice } = useFormat()

defineProps({
  selectedMethod: { type: String, default: 'card' },
  walletBalance: { type: Number, default: 0 },
  walletLoading: { type: Boolean, default: false },
  finalAmount: { type: Number, required: true },
  loyaltyStatus: { type: Object as () => CheckoutLoyaltyStatus | null, default: null },
  loyaltyXpDiscount: { type: Number, default: 0 },
  finalAmountExcludingLoyalty: { type: Number, required: true },
  clientSecret: { type: String as () => string | null, default: '' },
  stripeError: { type: String as () => string | null, default: null },
  paymentFormContent: { type: String, default: '' },
  acceptedAgreements: { type: Boolean, default: false },
  processing: { type: Boolean, default: false },
  isFormValid: { type: Boolean, default: false },
  cashToPay: { type: Number, required: true },
  useWalletBalance: { type: Boolean, default: false }
})

defineEmits([
  'update:selectedMethod',
  'update:loyaltyXpDiscount',
  'update:acceptedAgreements',
  'update:useWalletBalance',
  'pay',
  'back',
  'openLegal'
])
</script>
