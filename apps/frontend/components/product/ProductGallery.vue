<template>
  <div class="product-gallery space-y-6">
    <!-- Main Image -->
    <div class="bg-slate-50 rounded-[3rem] overflow-hidden aspect-square border border-white shadow-inner group">
      <img 
        :src="activeImage" 
        :alt="productName" 
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
      />
    </div>

    <!-- Thumbnails -->
    <div v-if="images.length > 1" class="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
      <button
        v-for="(img, idx) in images"
        :key="idx"
        @click="activeIndex = idx"
        :class="[
          'w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0',
          activeIndex === idx ? 'border-primary-600 shadow-xl' : 'border-transparent opacity-60 hover:opacity-100'
        ]"
      >
        <img :src="img" class="w-full h-full object-cover" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  images: string[]
  productName: string
}>()

const activeIndex = ref(0)
const activeImage = computed(() => props.images[activeIndex.value] || props.images[0])
</script>
