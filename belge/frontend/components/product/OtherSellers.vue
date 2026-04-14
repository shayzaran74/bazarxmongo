<template>
  <div
    v-if="sellers && sellers.length > 0"
    class="mt-16 space-y-8"
  >
    <!-- Header Section -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div
          class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100 rotate-2"
        >
          <BuildingStorefrontIcon class="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 class="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Diğer Satıcılar
            <span class="text-xs font-bold text-slate-400">({{ sellers.length }} Mağaza)</span>
          </h3>
          <p class="text-xs font-medium text-slate-500">
            Bu ürünü satan diğer mağazaları keşfedin
          </p>
        </div>
      </div>
    </div>

    <!-- Sellers Grid (4 Cards Row) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="seller in sortedSellers"
        :key="seller.id"
        class="group relative bg-white rounded-3xl p-5 border border-gray-100 hover:border-indigo-100 hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] transition-all duration-500 flex flex-col h-full cursor-pointer"
        @click="router.push(`/products/${seller.id}`)"
      >
        <!-- Vendor Info -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div
              class="w-11 h-11 rounded-1.5xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm"
            >
              <img
                v-if="seller.vendor?.logoUrl"
                :src="resolveImageUrl(seller.vendor.logoUrl)"
                :alt="seller.vendor.businessName"
                class="w-full h-full object-cover"
              >
              <span
                v-else
                class="text-lg font-black text-slate-300"
              >
                {{ seller.vendor?.businessName?.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div class="flex flex-col min-w-0">
              <NuxtLink
                :to="`/vendors/${seller.vendor?.id}`"
                class="text-sm font-black text-slate-900 hover:text-indigo-600 transition-colors truncate"
                @click.stop
              >
                {{ seller.vendor?.businessName }}
              </NuxtLink>
              <div class="flex items-center gap-1.5">
                <div class="flex items-center text-yellow-500">
                  <StarIcon class="h-3 w-3 fill-current" />
                  <span class="text-[10px] font-black ml-0.5">{{ seller.rating?.toFixed(1) || '4.9'
                  }}</span>
                </div>
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">({{
                  seller.reviewCount || 0 }})</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Price & Badges -->
        <div class="flex-grow">
          <div class="mb-4">
            <div class="flex items-center gap-2 mb-1">
              <span
                v-if="seller.compareAtPrice > seller.price"
                class="text-[10px] text-slate-400 line-through font-bold"
              >
                {{ formatPrice(seller.compareAtPrice) }}
              </span>
              <span
                v-if="seller.compareAtPrice > seller.price"
                class="text-[10px] font-black text-red-500"
              >
                %{{ Math.round((1 - seller.price / seller.compareAtPrice) * 100) }} İndirim
              </span>
            </div>
            <div class="flex items-baseline gap-1">
              <span class="text-2xl font-black text-slate-900 tracking-tighter">{{
                formatPrice(seller.price) }}</span>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 mb-6">
            <div
              class="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg border border-green-100/50 text-[9px] font-black uppercase tracking-wider"
            >
              <TruckIcon class="h-3 w-3" />
              Hızlı Kargo
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="grid grid-cols-5 gap-2 mt-auto">
          <button
            class="col-span-4 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
            @click.stop="handleAddToCart(seller)"
          >
            <ShoppingBagIcon class="h-4 w-4" />
            Sepete Ekle
          </button>
          <div
            class="col-span-1 py-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:border-indigo-200 hover:text-indigo-600 transition-all flex items-center justify-center"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
    BuildingStorefrontIcon,
    StarIcon,
    TruckIcon,
    ShoppingBagIcon,
    
} from '@heroicons/vue/24/outline'

const props = defineProps({
    sellers: {
        type: Array,
        required: true
    }
})

const emit = defineEmits(['add-to-cart'])
const { resolveImageUrl } = useAppImage()
const router = useRouter()

const sortedSellers = computed(() => {
    return [...props.sellers].sort((a, b) => a.price - b.price)
})

const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
    }).format(price || 0)
}

const handleAddToCart = (seller) => {
    emit('add-to-cart', seller)
}
</script>

<style scoped>
/* Custom animations or transitions */
</style>
