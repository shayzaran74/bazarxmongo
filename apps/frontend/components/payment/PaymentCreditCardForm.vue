<template>
  <div class="space-y-6">
    <!-- Card Number -->
    <div>
      <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">KART NUMARASI</label>
      <div class="relative group">
        <input
          :value="modelValue.number"
          type="text"
          maxlength="19"
          placeholder="0000 0000 0000 0000"
          class="block w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 transition-all text-xl font-mono tracking-[0.1em] outline-none"
          required
          @input="$emit('update:number', ($event.target as HTMLInputElement).value)"
        >
        <div class="absolute inset-y-0 right-5 flex items-center">
          <img v-if="cardBrand" :src="getCardBrandImage(cardBrand)" :alt="cardBrand" class="h-8 grayscale group-focus-within:grayscale-0 transition-all">
          <CreditCardIcon v-else class="h-6 w-6 text-gray-300" />
        </div>
      </div>
    </div>

    <!-- Card Holder -->
    <div>
      <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">KART SAHİBİ ADI</label>
      <input
        :value="modelValue.name"
        type="text"
        placeholder="AD SOYAD"
        class="block w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 transition-all text-lg font-bold uppercase tracking-wider outline-none"
        required
        @input="$emit('update:name', ($event.target as HTMLInputElement).value)"
      >
    </div>

    <!-- Expiry & CVV -->
    <div class="grid grid-cols-2 gap-6">
      <div>
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">SKT</label>
        <input
          :value="modelValue.expiry"
          type="text"
          maxlength="5"
          placeholder="MM/YY"
          class="block w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 transition-all text-lg font-mono text-center outline-none"
          required
          @input="$emit('update:expiry', ($event.target as HTMLInputElement).value)"
        >
      </div>
      <div>
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">CVV</label>
        <input
          :value="modelValue.cvv"
          type="text"
          maxlength="4"
          placeholder="***"
          class="block w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 transition-all text-lg font-mono text-center outline-none"
          required
          @input="$emit('update:cvv', ($event.target as HTMLInputElement).value)"
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CreditCardIcon } from '@heroicons/vue/24/outline'

defineProps<{
  modelValue: {
    number: string
    name: string
    expiry: string
    cvv: string
  }
  cardBrand: string
}>()

defineEmits(['update:number', 'update:name', 'update:expiry', 'update:cvv'])

const getCardBrandImage = (brand: string) => {
  const images: Record<string, string> = {
    visa: '/images/cards/visa.png',
    mastercard: '/images/cards/mastercard.png',
    amex: '/images/cards/amex.png'
  }
  return images[brand] || '/images/cards/generic.png'
}
</script>
