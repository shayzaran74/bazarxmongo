<template>
  <div
    class="bg-white p-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col h-full hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 group/container relative overflow-hidden"
    :style="{ borderRadius: '12px' }"
  >
    <!-- Premium Shine Effect -->
    <div
      class="absolute inset-0 opacity-0 group-hover/container:opacity-100 transition-opacity duration-700 pointer-events-none"
    >
      <div
        class="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/20 to-transparent -rotate-45 translate-x-[-100%] group-hover/container:translate-x-[100%] transition-transform duration-1000 ease-in-out"
      />
    </div>

    <div class="flex items-center justify-between mb-2 relative z-10">
      <h2
        class="text-sm md:text-base font-black text-gray-900 tracking-tight leading-tight group-hover/container:text-primary-600 transition-colors"
      >
        {{ title }}
      </h2>
    </div>

    <div class="grid grid-cols-2 gap-1.5 flex-grow relative z-10">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="flex flex-col cursor-pointer group/item touch-manipulation"
        @click="handleItemClick(item)"
        @touchend.prevent="handleItemClick(item)"
      >
        <div
          class="aspect-square overflow-hidden bg-gray-50 rounded-xl mb-1.5 border border-transparent group-hover/item:border-primary-200 group-hover/item:shadow-lg transition-all duration-300"
        >
          <ProductImage
            :src="item.image"
            :alt="item.label"
            class="w-full h-full"
            image-class="object-cover group-hover/item:scale-110 transition-transform duration-700"
          />
        </div>
        <span
          class="text-[9px] md:text-[10px] font-bold text-gray-600 group-hover/item:text-gray-900 line-clamp-2 leading-tight transition-colors"
        >
          {{ item.label }}
        </span>
      </div>
    </div>

    <div class="mt-2.5 pt-2 border-t border-gray-50 relative z-10">
      <NuxtLink
        v-if="link"
        :to="link"
        class="text-[10px] md:text-xs font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 transition-all inline-flex items-center group/link"
      >
        {{ linkText || $t('search.inspect') }}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-3 w-3 ml-1 group-hover/link:translate-x-1 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
defineProps({
    title: {
        type: String,
        required: true
    },
    items: {
        type: Array,
        required: true,
        validator: (value) => value.length > 0
    },
    link: {
        type: String,
        default: ''
    },
    linkText: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['item-click'])

// iOS-safe item click handler
const handleItemClick = (item) => {
    emit('item-click', item)
}
</script>
