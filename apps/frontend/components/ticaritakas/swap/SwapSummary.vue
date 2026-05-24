<template>
  <div class="space-y-6">
    <!-- Teminat durumu bilgi bandı -->
    <div v-if="collateralLabel" class="px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center"
      :class="collateralBannerClass">
      {{ collateralLabel }}
    </div>

    <!-- User A (From / Gönderen) -->
    <div class="bg-white rounded-3xl p-6 border border-gray-100 flex items-center gap-5 relative group overflow-hidden">
      <div class="absolute inset-y-0 left-0 w-1.5 bg-gray-100 group-hover:bg-indigo-500 transition-colors" />
      <div class="absolute -top-3 right-4 px-2 py-0.5 bg-gray-50 rounded-lg text-[8px] font-black text-gray-400 uppercase border border-gray-100 italic">GÖNDEREN TARAF</div>
      <img :src="resolveImage(offeredItemImages)" class="w-24 h-24 rounded-2xl object-cover border border-gray-100 shadow-sm shrink-0">
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-black text-gray-900 leading-none mb-1 truncate">{{ session.tradeOffer?.fromCompany?.name ?? '—' }}</h4>
        <p class="text-[10px] text-gray-400 font-bold uppercase truncate italic opacity-80">{{ offeredItemTitle }}</p>
        <div class="mt-3 flex items-center gap-2">
          <div :class="fromCollateralDot" class="w-1.5 h-1.5 rounded-full" />
          <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Teminat: {{ fromCollateralText }}</span>
        </div>
      </div>
    </div>

    <!-- Swap Icon -->
    <div class="flex justify-center -my-3 relative z-10">
      <div class="bg-white p-2.5 rounded-full shadow-lg border border-gray-100 transform group-hover:rotate-180 transition-transform duration-700">
        <ArrowsRightLeftIcon class="h-4 w-4 text-indigo-600" />
      </div>
    </div>

    <!-- User B (To / Alıcı) -->
    <div class="bg-white rounded-3xl p-6 border border-gray-100 flex items-center gap-5 relative group overflow-hidden">
      <div class="absolute inset-y-0 left-0 w-1.5 bg-gray-100 group-hover:bg-indigo-500 transition-colors" />
      <div class="absolute -top-3 right-4 px-2 py-0.5 bg-gray-50 rounded-lg text-[8px] font-black text-gray-400 uppercase border border-gray-100 italic">ALICI TARAF</div>
      <img :src="resolveImage(requestedItemImages)" class="w-24 h-24 rounded-2xl object-cover border border-gray-100 shadow-sm shrink-0">
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-black text-gray-900 leading-none mb-1 truncate">{{ session.tradeOffer?.toCompany?.name ?? '—' }}</h4>
        <p class="text-[10px] text-gray-400 font-bold uppercase truncate italic opacity-80">{{ requestedItemTitle }}</p>
        <div class="mt-3 flex items-center gap-2">
          <div :class="toCollateralDot" class="w-1.5 h-1.5 rounded-full" />
          <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Teminat: {{ toCollateralText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowsRightLeftIcon } from '@heroicons/vue/24/outline'

const props = defineProps({ session: Object })

const offeredItems = computed(() => props.session?.tradeOffer?.offeredItems ?? [])
const requestedItems = computed(() => props.session?.tradeOffer?.requestedItems ?? [])

const offeredItemTitle = computed(() => {
  if (offeredItems.value.length > 0) return offeredItems.value[0]?.title ?? 'Teklif edilen ürün'
  return props.session?.tradeOffer?.offeredItem?.title ?? 'Teklif edilen ürün'
})

const requestedItemTitle = computed(() => {
  if (requestedItems.value.length > 0) return requestedItems.value[0]?.title ?? 'İstenen ürün'
  return props.session?.tradeOffer?.requestedItem?.title ?? 'İstenen ürün'
})

const offeredItemImages = computed(() => {
  if (offeredItems.value.length > 0) return offeredItems.value[0]?.images
  return props.session?.tradeOffer?.offeredItem?.images
})

const requestedItemImages = computed(() => {
  if (requestedItems.value.length > 0) return requestedItems.value[0]?.images
  return props.session?.tradeOffer?.requestedItem?.images
})

const isReleased = computed(() => props.session?.collateralStatus === 'RELEASED')
const isPendingRelease = computed(() => props.session?.collateralStatus === 'PENDING_RELEASE')
const isHeld = computed(() => props.session?.collateralStatus === 'HELD')

const collateralLabel = computed(() => {
  if (isReleased.value) return 'Teminatlar komisyon kesilerek serbest bırakıldı.'
  if (isPendingRelease.value) return 'Teminatlar admin onayı bekleniyor. Komisyon kesilerek 3 gün içerisinde serbest bırakılacaktır.'
  if (isHeld.value && ['COMPLETED', 'PARTIALLY_COMPLETED'].includes(props.session?.status)) {
    return 'Teminatlar onay sonrası komisyon kesilerek iade edilecektir.'
  }
  return null
})

const collateralBannerClass = computed(() => {
  if (isReleased.value) return 'bg-green-50 text-green-700 border border-green-100'
  if (isPendingRelease.value) return 'bg-blue-50 text-blue-700 border border-blue-100'
  return 'bg-amber-50 text-amber-700 border border-amber-100'
})

const collateralText = (holdId) => {
  if (isReleased.value) return 'SERBEST BIRAKILDI'
  if (isPendingRelease.value) return 'ONAY BEKLENİYOR'
  if (holdId) return 'KİLİTLENDİ'
  return 'BEKLENİYOR'
}
const collateralDot = (holdId) => {
  if (isReleased.value) return 'bg-green-500'
  if (isPendingRelease.value) return 'bg-blue-500'
  if (holdId) return 'bg-amber-500'
  return 'bg-gray-200'
}

const fromCollateralText = computed(() => collateralText(props.session?.fromCollateralHoldId))
const toCollateralText = computed(() => collateralText(props.session?.toCollateralHoldId))
const fromCollateralDot = computed(() => collateralDot(props.session?.fromCollateralHoldId))
const toCollateralDot = computed(() => collateralDot(props.session?.toCollateralHoldId))

const resolveImage = (images) => {
  if (!images) return '/images/no-product.png'
  if (Array.isArray(images) && images.length > 0) {
    const img = images[0]
    if (typeof img === 'string') {
      if (img.startsWith('http') || img.startsWith('data:')) return img
      const clean = img.startsWith('/') ? img : `/${img}`
      return clean.startsWith('/uploads') ? clean : `/uploads${clean}`
    }
    if (img?.url) {
      return img.url.startsWith('http') ? img.url : `${useRuntimeConfig().public.apiBase}${img.url}`
    }
  }
  return '/images/no-product.png'
}
</script>
