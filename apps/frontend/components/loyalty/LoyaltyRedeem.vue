<template>
  <div
    class="loyalty-redeem-container relative w-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden transition-all duration-500 hover:shadow-primary-500/10"
  >
    <!-- Top accent glow -->
    <div
      class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-50"
    />

    <!-- Header -->
    <div
      class="px-6 py-5 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-800 flex items-center justify-between relative overflow-hidden"
    >
      <!-- subtle background particle effect -->
      <div
        class="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]"
      />

      <div class="flex items-center gap-3 relative z-10">
        <div
          class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/30 to-primary-600/10 flex items-center justify-center border border-primary-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
        >
          <SparklesIcon class="h-6 w-6 text-primary-400 animate-pulse" />
        </div>
        <div>
          <h3 class="text-base font-black text-white tracking-wide uppercase italic drop-shadow-md">
            Sadakat Puanları
          </h3>
          <p class="text-[10px] text-gray-400 font-medium tracking-widest mt-0.5 uppercase">
            Ödemenizde XP Kullanın
          </p>
        </div>
      </div>

      <div
        class="relative z-10 px-3 py-1.5 bg-black/40 rounded-xl backdrop-blur-md border border-white/10 shadow-inner flex items-center gap-2"
      >
        <CurrencyDollarIcon class="w-3.5 h-3.5 text-emerald-400" />
        <span class="text-[10px] font-black text-white/90 uppercase tracking-widest">100 XP = 1 TL</span>
      </div>
    </div>

    <div class="p-6 relative">
      <!-- Background logo blur -->
      <div
        class="absolute -right-10 -bottom-10 w-48 h-48 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-[60px] pointer-events-none"
      />

      <!-- Balance Info -->
      <div
        class="flex items-end justify-between mb-8 relative z-10 bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700"
      >
        <div>
          <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 pl-1">
            Kullanılabilir Bakiye
          </p>
          <div class="flex items-baseline gap-1.5">
            <span
              class="text-4xl font-black text-gray-900 dark:text-white tracking-tighter tabular-nums drop-shadow-sm"
            >{{
              formatNumber(currentXp) }}</span>
            <span
              class="text-sm font-black text-primary-500 uppercase tracking-widest bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-md"
            >XP</span>
          </div>
        </div>
        <div class="text-right">
          <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 pr-1">
            İndirim Karşılığı
          </p>
          <div
            class="bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800/30"
          >
            <span class="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">{{
              formatPrice(maxDiscountInTl) }}</span>
          </div>
        </div>
      </div>

      <!-- Action Area -->
      <div
        v-if="currentXp > 0"
        class="space-y-7 relative z-10"
      >
        <!-- Amount Selection -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <label
              class="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest flex items-center gap-2"
            >
              Kullanılacak Miktar
              <span
                class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md text-[9px]"
              >{{
                formatNumber(redeemAmountXp) }} XP</span>
            </label>
            <div
              class="px-4 py-1.5 bg-gradient-to-r from-primary-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl border border-primary-100 dark:border-gray-600 shadow-sm"
            >
              <span class="text-base font-black text-primary-600 dark:text-primary-400 tabular-nums tracking-tighter">
                -{{ formatPrice(redeemAmountTl) }}
              </span>
            </div>
          </div>

          <!-- Slider -->
          <div class="relative pt-4 pb-6 px-1">
            <input
              v-model.number="redeemAmountXp"
              type="range"
              min="0"
              :max="maxRedeemableXp"
              step="100"
              class="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary-600 focus:outline-none transition-all shadow-inner"
              :style="{
                background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${(redeemAmountXp / maxRedeemableXp) * 100}%,
                            rgb(var(--color-gray-200)) ${(redeemAmountXp / maxRedeemableXp) * 100}%, rgb(var(--color-gray-200)) 100%)`
              }"
            >
            <div class="flex justify-between mt-4">
              <button
                class="px-3 py-1 rounded-lg text-[9px] font-black text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 uppercase transition-all tracking-widest border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                @click="redeemAmountXp = 0"
              >
                SIFIRLA
              </button>
              <button
                class="px-3 py-1 rounded-lg text-[9px] font-black text-primary-600 hover:text-primary-700 dark:hover:text-primary-400 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/30 dark:hover:bg-primary-900/50 uppercase transition-all tracking-widest border border-primary-100 dark:border-primary-800"
                @click="redeemAmountXp = maxRedeemableXp"
              >
                TÜMÜNÜ
                KULLAN
              </button>
            </div>
          </div>
        </div>

        <!-- Feedback & Toggle -->
        <div
          class="p-4 sm:p-5 rounded-2xl border transition-all duration-500 relative overflow-hidden group"
          :class="redeemAmountXp > 0
            ? 'bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/20 border-primary-200 dark:border-primary-800 shadow-md'
            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'"
        >
          <!-- Active state background decoration -->
          <div
            v-if="redeemAmountXp > 0"
            class="absolute inset-0 bg-primary-100/30 dark:bg-primary-800/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 ease-out skew-x-12"
          />

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-500 shadow-sm"
                :class="redeemAmountXp > 0
                  ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white scale-110 shadow-primary-500/40 rotate-[5deg]'
                  : 'bg-white dark:bg-gray-700 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-600'"
              >
                <CheckBadgeIcon
                  v-if="redeemAmountXp > 0"
                  class="h-7 w-7 animate-[pulse_2s_ease-in-out_infinite]"
                />
                <GiftIcon
                  v-else
                  class="h-6 w-6"
                />
              </div>
              <div>
                <p
                  class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-2"
                >
                  {{ redeemAmountXp > 0 ? 'İndirim Uygulandı' : 'Sepette İndirim' }}
                  <span
                    v-if="redeemAmountXp > 0"
                    class="flex h-2 w-2 relative"
                  >
                    <span
                      class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"
                    />
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
                  </span>
                </p>
                <p class="text-[11px] font-bold text-gray-500 dark:text-gray-400 mt-0.5">
                  <span
                    v-if="redeemAmountXp > 0"
                    class="text-primary-600 dark:text-primary-400"
                  >
                    {{ formatNumber(redeemAmountXp) }} XP harcanarak <br class="sm:hidden">
                    <b class="text-emerald-600 dark:text-emerald-400 ml-1">{{ formatPrice(redeemAmountTl) }}</b>
                    eklenecek.
                  </span>
                  <span v-else>Aktif etmek için butonu kaydırın veya slider'ı kullanın.</span>
                </p>
              </div>
            </div>

            <div class="flex justify-end sm:block">
              <label class="relative inline-flex items-center cursor-pointer hover:scale-105 transition-transform">
                <input
                  type="checkbox"
                  :checked="redeemAmountXp > 0"
                  class="sr-only peer"
                  @change="handleToggle"
                >
                <div
                  class="w-14 h-8 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[1.5rem] peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-sm peer-checked:bg-primary-600 dark:peer-checked:bg-primary-500 shadow-inner"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="py-12 text-center bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 my-4 relative z-10"
      >
        <div
          class="w-16 h-16 mx-auto bg-white dark:bg-gray-800 shadow-sm rounded-full flex items-center justify-center mb-3"
        >
          <FaceFrownIcon class="w-8 h-8 text-gray-300 dark:text-gray-600" />
        </div>
        <p class="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest italic">
          Henüz
          harcanabilir<br>XP'niz bulunmuyor.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from '#imports'
import SparklesIcon from '@heroicons/vue/24/outline/SparklesIcon'
import GiftIcon from '@heroicons/vue/24/outline/GiftIcon'
import FaceFrownIcon from '@heroicons/vue/24/outline/FaceFrownIcon'
import CurrencyDollarIcon from '@heroicons/vue/24/outline/CurrencyDollarIcon'
import CheckBadgeIcon from '@heroicons/vue/24/solid/CheckBadgeIcon'

const props = defineProps({
  currentXp: {
    type: Number,
    default: 0
  },
  modelValue: {
    type: Number,
    default: 0
  },
  maxAmountTl: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const redeemAmountXp = ref(0)

// 100 XP = 1 TL
const maxDiscountInTl = computed(() => props.currentXp / 100)
const redeemAmountTl = computed(() => redeemAmountXp.value / 100)

// Can't use more than the total order amount
const maxRedeemableXp = computed(() => {
  const xpNeededForTotal = props.maxAmountTl * 100
  return Math.min(props.currentXp, xpNeededForTotal)
})

watch(redeemAmountXp, () => {
  emit('update:modelValue', redeemAmountTl.value)
})

// Initialize from prop if exists
onMounted(() => {
  if (props.modelValue > 0) {
    redeemAmountXp.value = props.modelValue * 100
  }
})

const handleToggle = (e) => {
  if (e.target.checked) {
    redeemAmountXp.value = maxRedeemableXp.value
  } else {
    redeemAmountXp.value = 0
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price || 0)
}

const formatNumber = (num) => {
  return new Intl.NumberFormat('tr-TR').format(Math.floor(num || 0))
}
</script>

<style scoped>
/* Slider Track custom CSS for older browsers if needed, though handled by style tag */
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 1.75rem;
  width: 1.75rem;
  border-radius: 9999px;
  background: white;
  border: 4px solid #6366f1;
  /* primary-600 */
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  cursor: grab;
  margin-top: -6px;
  /* center thumb on chrome */
  transition: transform 0.1s;
}

input[type=range]::-webkit-slider-thumb:active {
  cursor: grabbing;
  transform: scale(1.1);
}

input[type=range]::-moz-range-thumb {
  height: 1.75rem;
  width: 1.75rem;
  border-radius: 9999px;
  background: white;
  border: 4px solid #6366f1;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  cursor: grab;
  transition: transform 0.1s;
}

input[type=range]::-moz-range-thumb:active {
  cursor: grabbing;
  transform: scale(1.1);
}

input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 0.5rem;
  cursor: pointer;
  background: transparent;
  border-radius: 9999px;
}
</style>
