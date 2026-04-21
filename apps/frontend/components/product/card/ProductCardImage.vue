<template>
  <div class="relative aspect-[4/5] overflow-hidden bg-slate-50 dark:bg-gray-950">
    <!-- Main Product Image -->
    <ProductImage
      :src="image"
      :alt="name"
      image-class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
    />

    <!-- Glass Overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

    <!-- Badges Slot -->
    <slot name="badges" />

    <!-- Shine Effect -->
    <div class="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
      <div class="shine-sweep" />
    </div>

    <!-- Quick Add Button -->
    <div class="absolute inset-x-4 bottom-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out z-30">
      <button
        class="w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl text-gray-900 dark:text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-primary-600 hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
        @click.stop.prevent="$emit('add-to-cart', $event)"
      >
        <ShoppingCartIcon class="h-4 w-4 group-hover/btn:bounce" />
        {{ $t('product.addToCart') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import ShoppingCartIcon from '@heroicons/vue/24/outline/ShoppingCartIcon'

defineProps<{
  image: string
  name: string
}>()

defineEmits<{
  (e: 'add-to-cart', event: MouseEvent): void
}>()
</script>

<style scoped>
.shine-sweep {
  position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
  background: linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent);
  transform: skewX(-25deg);
}
.group:hover .shine-sweep { animation: shine-sweep 1s ease-in-out; }
@keyframes shine-sweep { 0% { left: -100%; } 100% { left: 200%; } }
.bounce { animation: mini-bounce 0.5s ease infinite alternate; }
@keyframes mini-bounce { from { transform: translateY(0); } to { transform: translateY(-2px); } }
</style>
