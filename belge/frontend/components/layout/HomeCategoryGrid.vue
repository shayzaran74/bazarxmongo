<template>
  <div
    v-if="(categories && categories.length > 0) || loading"
    class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6"
  >
    <!-- Category Grid / Scroll -->
    <div class="relative group/categories">
      <!-- Left Button -->
      <button
        class="absolute -left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-md shadow-lg border border-gray-100 p-2 rounded-full opacity-0 group-hover/categories:opacity-100 transition-all hover:bg-white hidden md:block active:scale-90"
        @click="scroll('left')"
      >
        <ChevronLeftIcon class="h-4 w-4 text-gray-700" />
      </button>

      <!-- Right Button -->
      <button
        class="absolute -right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-md shadow-lg border border-gray-100 p-2 rounded-full opacity-0 group-hover/categories:opacity-100 transition-all hover:bg-white hidden md:block active:scale-90"
        @click="scroll('right')"
      >
        <ChevronRightIcon class="h-4 w-4 text-gray-700" />
      </button>

      <div
        ref="scrollContainer"
        class="flex gap-4 md:gap-10 overflow-x-auto py-2 scrollbar-hide scroll-smooth snap-x items-start"
      >
        <!-- Loading State -->
        <template v-if="loading">
          <div
            v-for="i in 10"
            :key="i"
            class="flex-shrink-0 w-16 md:w-24 animate-pulse"
          >
            <div class="aspect-square rounded-full bg-gray-100 border border-gray-50 mb-2" />
            <div class="h-2.5 bg-gray-100 rounded-full w-3/4 mx-auto" />
          </div>
        </template>

        <!-- Actual Categories -->
        <template v-else>
          <NuxtLink
            v-for="category in categories"
            :key="category.id"
            :to="`/products?categorySlug=${category.slug}`"
            class="flex-shrink-0 w-16 md:w-20 group cursor-pointer snap-start flex flex-col items-center"
          >
            <div class="relative mb-2">
              <!-- Circular Icon with Gradient & Size Preserved -->
              <div
                :class="[
                  'w-14 h-14 md:w-16 md:h-16 rounded-full border border-gray-100 flex items-center justify-center transition-all duration-500 group-hover:shadow-xl group-hover:border-indigo-100 group-hover:-translate-y-1 group-hover:scale-105 relative overflow-hidden',
                  (category.colorFrom || category.colorTo) ? `bg-gradient-to-br ${category.colorFrom || 'from-blue-400'} ${category.colorTo || 'to-amber-500'} shadow-lg ${category.shadowColor || 'shadow-gray-200'}` : 'bg-white shadow-[0_4px_15px_-3px_rgba(0,0,0,0.05)] group-hover:shadow-indigo-200/50'
                ]"
              >
                <!-- Subtle inner glow -->
                <div
                  class="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                />

                <div
                  :class="[
                    'group-hover:scale-110 transition-transform duration-500 relative z-10',
                    (category.colorFrom || category.colorTo) ? 'text-white drop-shadow-md' : 'text-indigo-600'
                  ]"
                >
                  <component
                    :is="HeroIcons[category.icon] || HeroIcons.Squares2X2Icon"
                    class="w-7 h-7 md:w-8 md:h-8"
                  />
                </div>
              </div>

              <!-- Badge if exists -->
              <div
                v-if="category.badgeText"
                class="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[7px] font-black text-white uppercase shadow-lg border-2 border-white z-20 whitespace-nowrap"
                :style="{ backgroundColor: category.badgeColor || '#ef4444' }"
              >
                {{ category.badgeText }}
              </div>
            </div>

            <div class="text-center w-full">
              <h3
                :class="[
                  'text-[9px] md:text-[10px] font-black uppercase tracking-tighter line-clamp-2 leading-[1.1] transition-colors',
                  category.hoverColor ? `text-gray-800 ${category.hoverColor}` : 'text-gray-800 group-hover:text-indigo-600'
                ]"
              >
                {{ category.name }}
              </h3>
            </div>
          </NuxtLink>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from '#imports'
import * as HeroIcons from '@heroicons/vue/24/outline'
import ChevronLeftIcon from '@heroicons/vue/24/outline/ChevronLeftIcon'
import ChevronRightIcon from '@heroicons/vue/24/outline/ChevronRightIcon'

defineProps({
    categories: {
        type: Array,
        required: true
    },
    loading: {
        type: Boolean,
        default: false
    },
    error: {
        type: String,
        default: null
    }
})

const scrollContainer = ref(null)

const scroll = (direction) => {
    if (!scrollContainer.value) return
    const amount = direction === 'left' ? -400 : 400
    scrollContainer.value.scrollBy({ left: amount, behavior: 'smooth' })
}
</script>

<style scoped>
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
</style>
