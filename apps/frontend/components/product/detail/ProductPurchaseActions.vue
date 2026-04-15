<script setup lang="ts">
import {
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  CheckBadgeIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'
import { SparklesIcon } from '@heroicons/vue/24/outline'
import { useFormat } from '~/composables/useFormat'
import type { Product } from '@barterborsa/shared-types'

interface Props {
  product: Product | null
  quantity: number
  currentStock: number
  processingBarter: boolean
  displayPrice: number
}

const props = defineProps<Props>()
const emit = defineEmits(['update:quantity', 'addToCart', 'buyNow', 'buyWithBarter'])
const { formatPriceNum } = useFormat()

const decreaseQuantity = () => {
  if (props.quantity > 1) {
    emit('update:quantity', props.quantity - 1)
  }
}

const increaseQuantity = () => {
  if (props.quantity < props.currentStock) {
    emit('update:quantity', props.quantity + 1)
  }
}
</script>

<template>
  <div
    v-if="product"
    class="space-y-6"
  >
    <!-- Quantity Selector -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <label class="text-sm font-bold text-slate-700 uppercase tracking-wider">{{ $t('products.detail.quantity') }}</label>
        <span class="text-[10px] font-bold text-slate-400">STOK: {{ currentStock }}</span>
      </div>
      <div class="flex items-center w-36 h-12 bg-slate-50 rounded-xl border border-slate-200 p-1">
        <button
          class="flex-1 flex items-center justify-center hover:bg-white rounded-lg transition-all text-slate-600 disabled:opacity-30"
          :disabled="quantity <= 1"
          @click="decreaseQuantity"
        >
          <MinusIcon class="w-4 h-4 stroke-[3]" />
        </button>
        <span class="w-12 text-center text-sm font-bold text-slate-900">{{ quantity }}</span>
        <button
          class="flex-1 flex items-center justify-center hover:bg-white rounded-lg transition-all text-slate-600 disabled:opacity-30"
          :disabled="quantity >= currentStock"
          @click="increaseQuantity"
        >
          <PlusIcon class="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>

    <!-- Main Actions -->
    <div class="grid grid-cols-2 gap-4">
      <button
        class="flex items-center justify-center gap-2 h-14 rounded-2xl bg-white border-2 border-indigo-600 text-indigo-600 font-bold transition-all hover:bg-indigo-50 active:scale-95 group"
        @click="emit('addToCart')"
      >
        <ShoppingBagIcon class="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
        {{ $t('products.detail.addToCart') }}
      </button>

      <button
        class="flex items-center justify-center gap-2 h-14 rounded-2xl bg-indigo-600 text-white font-bold transition-all hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95 group"
        @click="emit('buyNow')"
      >
        <CheckBadgeIcon class="w-5 h-5 transition-transform group-hover:scale-110" />
        {{ $t('products.detail.buyNow') }}
      </button>
    </div>

    <!-- Barter Action Card -->
    <div class="relative group p-6 rounded-3xl bg-slate-900 overflow-hidden shadow-xl">
      <div class="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-transparent to-transparent opacity-50" />
      <div class="absolute -right-12 -top-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-125" />

      <div class="relative space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-indigo-400">
            <SparklesIcon class="w-5 h-5 animate-pulse" />
            <span class="text-xs font-black tracking-widest uppercase">{{ $t('products.detail.barterSystem') }}</span>
          </div>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-medium border border-white/10 backdrop-blur-sm">VIP ECOSYSTEM</span>
        </div>

        <div class="space-y-1">
          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
            {{ $t('products.detail.barterPrice') }}
          </p>
          <div class="flex items-baseline gap-1.5 text-white">
            <span class="text-3xl font-black tracking-tighter">{{ formatPriceNum(displayPrice) }}</span>
            <span class="text-sm font-bold opacity-70">XP/PUAN</span>
          </div>
        </div>

        <button
          :disabled="processingBarter"
          class="w-full flex items-center justify-center gap-2 h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black transition-all hover:translate-y-[-2px] hover:shadow-2xl hover:shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:grayscale"
          @click="emit('buyWithBarter')"
        >
          <template v-if="processingBarter">
            <ArrowPathIcon class="w-5 h-5 animate-spin" />
            İŞLEM YAPILIYOR...
          </template>
          <template v-else>
            <ArrowPathIcon class="w-5 h-5" />
            {{ $t('products.detail.buyWithBarter') }}
          </template>
        </button>
      </div>
    </div>
  </div>
</template>
