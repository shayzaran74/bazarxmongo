<script setup lang="ts">
import type { Product } from '@barterborsa/shared-types'

interface Props {
  product: Product | null
  allImages: string[]
  selectedImage: string | null
}

const props = defineProps<Props>()
const emit = defineEmits(['update:selectedImage'])

const { getProductBadges } = useProductBadges()

const displayBadges = computed(() => getProductBadges(props.product))

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target) {
    target.onerror = null
    target.src = 'https://placehold.co/600x600/e2e8f0/64748b?text=Ürün+Resmi'
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Main Image Display -->
    <div class="relative aspect-square rounded-2xl bg-slate-100 overflow-hidden group border border-slate-200 shadow-sm">
      <img
        :src="selectedImage || product?.image"
        :alt="product?.name"
        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        @error="handleImageError"
      >

      <!-- Premium Dynamic Badges Overlay -->
      <div
        v-if="displayBadges?.topLeft"
        class="absolute top-4 left-4 z-10 transition-transform duration-300 hover:scale-105"
      >
        <span :class="['px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5', displayBadges.topLeft.class]">
          <span
            v-if="displayBadges.topLeft.text === 'FLAŞ SATIŞ'"
            class="w-2 h-2 rounded-full bg-white animate-ping"
          />
          {{ displayBadges.topLeft.text }}
        </span>
      </div>

      <div
        v-if="displayBadges?.topRight"
        class="absolute top-4 right-4 z-10"
      >
        <span :class="['px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg', displayBadges.topRight.class]">
          {{ displayBadges.topRight.text }}
        </span>
      </div>

      <div
        v-if="displayBadges?.bottomLeft"
        class="absolute bottom-4 left-4 z-10"
      >
        <div :class="['flex items-center gap-2 p-2 rounded-xl backdrop-blur-md shadow-lg border border-white/20', displayBadges.bottomLeft.class]">
          <div class="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span class="text-[10px] font-bold tracking-tight">{{ displayBadges.bottomLeft.text }}</span>
        </div>
      </div>
    </div>

    <!-- Thumbnail Gallery -->
    <div
      v-if="allImages.length > 1"
      class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
    >
      <button
        v-for="(img, idx) in allImages"
        :key="idx"
        class="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 transform"
        :class="[selectedImage === img ? 'border-indigo-600 scale-95 shadow-md' : 'border-slate-100 hover:border-slate-300']"
        @click="emit('update:selectedImage', img)"
      >
        <img
          :src="img"
          class="w-full h-full object-cover"
          @error="handleImageError"
        >
        <div
          v-if="selectedImage === img"
          class="absolute inset-0 bg-indigo-600/10 transition-opacity"
        />
      </button>
    </div>
  </div>
</template>
