<script setup lang="ts">
import {
  HeartIcon,
  ShareIcon,
  ShieldCheckIcon,
  MapPinIcon,
  StarIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'
import type { Product } from '@barterborsa/shared-types'

interface Props {
  product: Product | null
  isFollowing: boolean
  followLoading: boolean
  isFavorite: boolean
}

defineProps<Props>()
const emit = defineEmits(['toggleFollow', 'toggleFavorite', 'share'])
</script>

<template>
  <div
    v-if="product"
    class="space-y-6"
  >
    <!-- Quick Action Buttons -->
    <div class="flex gap-4">
      <button
        class="flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold transition-all hover:bg-slate-50 hover:border-rose-200 group"
        @click="emit('toggleFavorite')"
      >
        <component
          :is="isFavorite ? HeartSolidIcon : HeartIcon"
          class="w-5 h-5 transition-transform group-hover:scale-110"
          :class="{ 'text-rose-500': isFavorite }"
        />
        {{ isFavorite ? $t('products.detail.favorited') : $t('products.detail.addToWishlist') }}
      </button>

      <button
        class="w-14 flex items-center justify-center h-14 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all hover:border-indigo-200 group"
        @click="emit('share')"
      >
        <ShareIcon class="w-5 h-5 transition-transform group-hover:rotate-12" />
      </button>
    </div>

    <!-- Seller Information Premium Card -->
    <div class="overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-sm relative group">
      <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

      <div class="p-6 space-y-6">
        <div class="flex items-start justify-between">
          <div class="space-y-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ $t('products.detail.seller') }}</span>
            <h3 class="text-lg font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
              {{ product.Vendor?.businessName || 'BarterBorsa Satıcısı' }}
            </h3>
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                <StarIcon class="w-3 h-3 text-emerald-600 fill-emerald-600" />
                <span class="text-[10px] font-bold text-emerald-700">9.8</span>
              </div>
              <span class="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <ShieldCheckIcon class="w-3 h-3" />
                ONAYLI SATICI
              </span>
            </div>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-inner">
            <SparklesIcon class="w-6 h-6" />
          </div>
        </div>

        <div class="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
          <div class="flex items-center gap-3 text-slate-600">
            <MapPinIcon class="w-4 h-4 text-indigo-500" />
            <span class="text-xs font-bold">{{ product.Vendor?.city || 'Şehir Belirtilmemiş' }}</span>
          </div>
          <div class="flex items-center gap-3 text-slate-600">
            <ShieldCheckIcon class="w-4 h-4 text-indigo-500" />
            <span class="text-xs font-bold">{{ product.Vendor?.vendorTier || 'CORE' }} Üye</span>
          </div>
        </div>

        <button
          :disabled="followLoading"
          class="w-full flex items-center justify-center gap-2 h-12 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"
          :class="[isFollowing ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 shadow-sm']"
          @click="emit('toggleFollow')"
        >
          <ArrowPathIcon
            v-if="followLoading"
            class="w-4 h-4 animate-spin"
          />
          {{ isFollowing ? $t('products.detail.following') : $t('products.detail.followSeller') }}
        </button>
      </div>
    </div>

    <!-- Campaigns & Security -->
    <div class="p-5 rounded-3xl bg-amber-50 border border-amber-100 space-y-4">
      <div class="flex items-center gap-2 text-amber-700">
        <SparklesIcon class="w-5 h-5" />
        <span class="text-xs font-black uppercase tracking-tight">{{ $t('products.detail.activeCampaigns') }}</span>
      </div>
      <div class="space-y-3">
        <div class="flex items-start gap-3 group/item">
          <div class="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 transition-transform group-hover/item:scale-150" />
          <p class="text-[11px] font-bold text-amber-800/80 leading-relaxed uppercase tracking-tight">
            Kargo Bedava (500 TL Üzeri)
          </p>
        </div>
        <div class="flex items-start gap-3 group/item">
          <div class="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5" />
          <p class="text-[11px] font-bold text-amber-800/80 leading-relaxed uppercase tracking-tight">
            Peşin Fiyatına 3 Taksit İmkanı
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
