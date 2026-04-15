<template>
  <div class="flex justify-start my-2">
    <!-- Checkbox for selection (only shown in cart) -->
    <div
      v-if="showCheckbox"
      class="my-auto"
    >
      <div
        class="flex items-center justify-start p-0.5 cursor-pointer"
        @mouseenter="isHover = true"
        @mouseleave="isHover = false"
      >
        <div
          class="flex items-center justify-center h-5 w-5 rounded-full border mr-5 ml-2"
          :class="[
            isHover ? 'border-[#FD374F]' : 'border-gray-300',
            isSelected ? 'bg-[#FD374F]' : ''
          ]"
          @click="toggleSelection"
        >
          <div class="h-2 w-2 rounded-full bg-white" />
        </div>
      </div>
    </div>

    <!-- Product image -->
    <div class="relative w-24 md:w-32 aspect-square rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
      <ProductImage
        :src="product.Product.image"
        class="w-full h-full object-cover"
      />
    </div>

    <!-- Product details -->
    <div class="overflow-hidden pl-2 w-full">
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center justify-between truncate">
          <span
            class="sm:block hidden bg-[#FD374F] text-white text-[0.625rem] font-semibold px-1.5 rounded-sm min-w-20"
          >{{
            $t('cart.welcomeDeal') }}</span>
          <div class="truncate sm:pl-2 font-medium text-gray-900">
            {{ product.Product.name }}
          </div>
        </div>

        <!-- Remove button (only shown in cart) -->
        <button
          v-if="showRemoveButton"
          class="mx-3 sm:block hidden -mt-0.5 hover:text-red-500 transition-colors"
          @click="removeFromCart()"
        >
          <MinusIcon class="h-5 w-5" />
        </button>
      </div>

      <!-- Price -->
      <div class="text-xl font-bold text-gray-900">
        {{ formatPrice(product.Product.price * product.quantity) }}
      </div>

      <!-- Delivery info -->
      <p class="text-[#009A66] text-xs font-bold pt-1">
        {{ $t('cart.freeDelivery', { amount: locale === 'tr' ? '₺250' : '￡8.28' }) }}
      </p>
      <p class="text-[#009A66] text-xs font-bold pt-1">
        {{ $t('cart.freeShipping') }}
      </p>

      <!-- Quantity controls (only shown in cart) -->
      <div
        v-if="showQuantityControls"
        class="flex items-center justify-between mt-2"
      >
        <div class="flex items-center bg-gray-50 rounded-lg p-1">
          <button
            class="w-7 h-7 rounded-md bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="product.quantity <= 1"
            @click="decreaseQuantity"
          >
            <MinusIcon class="h-4 w-4" />
          </button>

          <span class="mx-3 text-sm font-bold text-gray-800 w-4 text-center">{{ product.quantity }}</span>

          <button
            class="w-7 h-7 rounded-md bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="product.quantity >= product.Product.stock"
            @click="increaseQuantity"
          >
            <PlusIcon class="h-4 w-4" />
          </button>

          <span
            v-if="product.Product.stock < 10"
            class="ml-3 text-[10px] bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full font-bold animate-pulse"
          >
            {{ $t('cart.itemsLeft', { count: product.Product.stock }) }}
          </span>
        </div>

        <button
          v-if="showRemoveButton"
          class="sm:hidden block -mt-0.5 text-gray-400 hover:text-red-500 transition-colors"
          @click="removeFromCart()"
        >
          <MinusIcon class="h-5 w-5" />
        </button>
      </div>

      <!-- Quantity display (shown in checkout) -->
      <div
        v-else
        class="text-sm text-gray-500 font-medium mt-1"
      >
        {{ $t('cart.quantity') }}: {{ product.quantity }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useI18n, useFormat } from '#imports'
import MinusIcon from '@heroicons/vue/24/outline/MinusIcon'
import PlusIcon from '@heroicons/vue/24/outline/PlusIcon'
import type { CartItem } from '@barterborsa/shared-types'

const { locale } = useI18n()
const { formatPrice } = useFormat()

const props = defineProps({
  product: {
    type: Object as () => CartItem,
    required: true
  },
  showCheckbox: {
    type: Boolean,
    default: false
  },
  showQuantityControls: {
    type: Boolean,
    default: false
  },
  showRemoveButton: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['remove-item', 'update-quantity', 'select-item'])

const isHover = ref(false)
const isSelected = ref(false)

const toggleSelection = () => {
  isSelected.value = !isSelected.value
  emit('select-item', { id: props.product.id, selected: isSelected.value })
}

const removeFromCart = () => {
  emit('remove-item', props.product.id)
}

const decreaseQuantity = () => {
  if (props.product.quantity > 1) {
    emit('update-quantity', { id: props.product.id, quantity: props.product.quantity - 1 })
  }
}

const increaseQuantity = () => {
  if (props.product.quantity < props.product.Product.stock) {
    emit('update-quantity', { id: props.product.id, quantity: props.product.quantity + 1 })
  }
}
</script>