<template>
  <div class="w-64 shrink-0 py-6 hidden 2xl:flex flex-col gap-4">
    <!-- 1. Cart Items Section (Shown if items exist) -->
    <div
      v-if="cartStore.itemCount > 0"
      class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/10 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.1)] p-5"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
          <ShoppingCartIcon class="h-4 w-4" />
          <span>{{ $t('cart.myCart') }}</span>
        </h3>
        <span
          class="bg-primary-600 text-white px-2 py-0.5 rounded-full text-[10px] font-black shadow-sm shadow-primary-200"
        >
          {{ cartStore.itemCount }}
        </span>
      </div>

      <div class="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        <div
          v-for="item in displayItems"
          :key="item.id || item.productId"
          class="flex gap-3 group items-center"
        >
          <div
            class="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 overflow-hidden shrink-0 border border-gray-100 dark:border-white/5 relative"
          >
            <img
              :src="resolveImageUrl(item.Product?.image || item.Product?.images?.[0])"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            >
          </div>
          <div class="flex flex-col justify-center min-w-0 flex-1">
            <p
              class="text-[11px] font-bold text-gray-700 dark:text-gray-200 truncate group-hover:text-primary-600 transition-colors leading-tight"
            >
              {{ item.Product?.name }}
            </p>
            <div class="flex items-center justify-between mt-1">
              <p class="text-xs font-black text-primary-600 tracking-tight">
                {{
                  formatPrice(item.Product?.price || 0)
                }}
              </p>
              <p class="text-[9px] font-bold text-gray-400">
                x{{ item.quantity }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        class="mt-5 w-full py-3.5 bg-gray-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-center hover:bg-primary-600 transition-all shadow-lg active:scale-95"
        @click="navigateTo('/cart')"
      >
        {{ $t('cart.goToCart') }}
      </button>
    </div>

    <!-- 2. Campaigns & Vendor Section (Always shown on Product Page) -->
    <template v-if="isProductPage && currentProduct">
      <!-- Campaigns -->
      <div
        class="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-[2rem] border border-amber-100 dark:border-amber-900/30 p-5 shadow-sm"
      >
        <h3
          class="text-[11px] font-black uppercase tracking-widest text-amber-900 dark:text-amber-200 mb-4 flex items-center gap-2"
        >
          <TicketIcon class="h-4 w-4" />
          {{ $t('products.detail.productCampaigns') }}
        </h3>

        <div
          class="bg-white/90 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl p-4 border border-white dark:border-white/5 relative overflow-hidden group shadow-sm transition-all hover:shadow-md"
        >
          <div
            class="absolute top-0 right-0 py-1.5 px-2.5 bg-orange-600 text-white text-[8px] font-black rounded-bl-xl shadow-lg"
          >
            {{ $t('products.detail.applyAtCart').toUpperCase() }}
          </div>

          <p class="text-xs font-black text-gray-900 dark:text-white mb-2 pr-12">
            Sepette %25 İndirim
          </p>

          <div
            class="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 bg-gray-50 dark:bg-white/5 py-1 px-2 rounded-lg w-fit"
          >
            <ClockIcon class="h-4 w-4 text-orange-600 animate-pulse" />
            <span class="text-[10px]">1 GÜN 23 SAAT</span>
          </div>

          <div
            v-if="currentProduct.Vendor"
            class="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-white/5"
          >
            <div
              class="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-center p-2 group-hover:scale-110 transition-transform overflow-hidden"
            >
              <img
                v-if="currentProduct.Vendor.logo"
                :src="resolveImageUrl(currentProduct.Vendor.logo)"
                class="w-full h-full object-contain"
              >
              <div
                v-else
                class="text-[10px] font-black text-gray-400"
              >
                {{
                  currentProduct.Vendor.businessName?.substring(0, 2).toUpperCase() }}
              </div>
            </div>
            <div class="flex flex-col">
              <p class="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                {{
                  $t('products.detail.applyAtCart') }}
              </p>
              <p class="text-[10px] font-black text-primary-600">
                Kampanya Aktif
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Vendor Info Area -->
      <div
        v-if="currentProduct.Vendor"
        class="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] overflow-hidden"
      >
        <div class="p-5">
          <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-3">
              <div
                class="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-white/5 flex items-center justify-center font-black text-gray-400 text-sm shadow-inner relative overflow-hidden"
              >
                <img
                  v-if="currentProduct.Vendor.logo"
                  :src="resolveImageUrl(currentProduct.Vendor.logo)"
                  class="w-full h-full object-cover"
                >
                <span v-else>{{ currentProduct.Vendor.businessName?.substring(0, 2).toUpperCase()
                }}</span>
                <div
                  class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center"
                >
                  <CheckIcon class="h-3 w-3 text-white" />
                </div>
              </div>
              <div class="flex flex-col">
                <h4 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  {{ currentProduct.Vendor.businessName }}
                </h4>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <div class="flex gap-0.5">
                    <StarIcon
                      v-for="i in 5"
                      :key="i"
                      class="h-2 w-2 text-amber-400"
                    />
                  </div>
                  <span
                    class="text-[11px] font-black text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded-lg"
                  >{{
                    currentProduct.Vendor.rating || '9.1' }}</span>
                </div>
              </div>
            </div>
            <button
              class="bg-gray-50 dark:bg-white/5 p-2.5 rounded-2xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group scale-100 active:scale-90"
            >
              <HeartIcon
                class="h-5 w-5 text-gray-400 group-hover:text-primary-500 group-hover:fill-primary-500 transition-all"
              />
            </button>
          </div>

          <!-- Follower Info & Follow Button -->
          <div class="flex flex-col gap-3 py-4 border-y border-gray-50 dark:border-white/5 mb-5">
            <div class="flex items-center justify-between px-2">
              <div class="flex flex-col">
                <p class="text-[13px] font-black text-gray-900 dark:text-white leading-none">
                  {{
                    (currentProduct.Vendor.followerCount || '6.4M') }}
                </p>
                <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  Takipçi
                </p>
              </div>
              <button
                class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                {{ $t('products.detail.followToWin') }}
              </button>
            </div>
          </div>

          <div class="space-y-2.5">
            <!-- Seller Questions -->
            <button
              class="w-full py-3.5 px-5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl flex items-center justify-between group transition-all hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <div class="flex items-center gap-3">
                <ChatBubbleLeftRightIcon class="h-4 w-4 text-gray-400 group-hover:text-primary-600" />
                <span class="text-[10px] font-bold text-gray-600 dark:text-gray-300">{{
                  $t('products.detail.sellerQuestions', { count: 65 }) }}</span>
              </div>
              <ChevronRightIcon
                class="h-4 w-4 text-gray-300 group-hover:translate-x-1 transition-transform"
              />
            </button>

            <button
              class="w-full py-4 bg-primary-600 text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.15em] hover:bg-primary-700 transition-all shadow-xl shadow-primary-200/50 dark:shadow-none"
              @click="navigateTo(`/vendors/${currentProduct.Vendor.id}`)"
            >
              {{ $t('products.detail.goStore') }}
            </button>

            <button
              class="w-full py-3.5 border-2 border-gray-950 dark:border-white/10 text-gray-950 dark:text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.15em] hover:bg-gray-950 hover:text-white dark:hover:bg-white dark:hover:text-gray-950 transition-all"
            >
              {{ $t('products.detail.addToCollection') }}
            </button>
          </div>
        </div>

        <!-- Other Sellers List -->
        <div
          v-if="currentProduct.otherSellers?.length"
          class="p-5"
        >
          <h3 class="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">
            {{
              $t('products.detail.otherSellers') }}
          </h3>
          <div class="space-y-3">
            <div
              v-for="seller in currentProduct.otherSellers"
              :key="seller.id"
              class="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              @click="navigateTo(`/vendors/${seller.id}`)"
            >
              <div class="flex items-center gap-2">
                <div
                  class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[10px] font-black text-gray-400 overflow-hidden"
                >
                  <img
                    v-if="seller.logo"
                    :src="resolveImageUrl(seller.logo)"
                    class="w-full h-full object-cover"
                  >
                  <span v-else>{{ seller.businessName?.substring(0, 2).toUpperCase() }}</span>
                </div>
                <div class="flex flex-col">
                  <p
                    class="text-[10px] font-bold text-gray-700 dark:text-gray-200 truncate max-w-[80px]"
                  >
                    {{ seller.businessName }}
                  </p>
                  <p class="text-[9px] font-black text-primary-600">
                    {{ formatPrice(seller.price ||
                      currentProduct.price) }}
                  </p>
                </div>
              </div>
              <div
                class="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded text-[9px] font-black text-green-600"
              >
                {{ seller.rating || '9.0' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 3. Fallback/Empty State (Shown only if both cart is empty AND not on product page) -->
    <div
      v-else-if="cartStore.itemCount === 0 && !isProductPage"
      class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/10 p-8 text-center"
    >
      <div
        class="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <ShoppingCartIcon class="h-8 w-8 text-gray-300" />
      </div>
      <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">
        {{ $t('cart.empty') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, useCartStore, useAuthStore, useAppImage, useCurrentProduct, useRoute, navigateTo } from '#imports'
import ShoppingCartIcon from '@heroicons/vue/24/solid/ShoppingCartIcon'
import ClockIcon from '@heroicons/vue/24/solid/ClockIcon'
import CheckIcon from '@heroicons/vue/24/solid/CheckIcon'
import HeartIcon from '@heroicons/vue/24/solid/HeartIcon'
import ChevronRightIcon from '@heroicons/vue/24/solid/ChevronRightIcon'
import TicketIcon from '@heroicons/vue/24/solid/TicketIcon'
import StarIcon from '@heroicons/vue/24/solid/StarIcon'
import ChatBubbleLeftRightIcon from '@heroicons/vue/24/solid/ChatBubbleLeftRightIcon'

const cartStore = useCartStore()
const authStore = useAuthStore()
const { resolveImageUrl } = useAppImage()
const route = useRoute()

// Current Product State for Sidebar
const currentProduct = useCurrentProduct()

const isProductPage = computed(() => route.name?.includes('products-slug') || route.path.includes('/products/'))

const displayItems = computed(() => {
    return authStore.isLoggedIn ? cartStore.items : cartStore.guestItems
})

const formatPrice = (p) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p || 0)
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 10px;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.05);
}
</style>
