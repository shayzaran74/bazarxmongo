<template>
  <div class="w-full bg-white border-b border-gray-100 sticky top-16 md:top-20 z-30 py-4 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="relative flex items-center group">
        <!-- Left Gradient Overlay -->
        <div
          class="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"
        />

        <!-- Right Gradient Overlay -->
        <div
          class="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"
        />

        <div
          ref="scrollContainer"
          class="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1 px-4"
        >
          <!-- Explore Label -->
          <div class="flex-shrink-0 flex items-center gap-2 mr-4 border-r border-gray-100 pr-6">
            <div class="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Squares2X2Icon class="w-4 h-4 text-indigo-600" />
            </div>
            <span class="text-[10px] font-black text-slate-800 uppercase tracking-widest">Kategoriler</span>
          </div>

          <!-- All Category -->
          <NuxtLink
            to="/products"
            class="flex-shrink-0 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2"
            :class="!activeSlug ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'"
          >
            TÜMÜ
          </NuxtLink>

          <!-- Category List -->
          <NuxtLink
            v-for="category in categories"
            :key="category.id"
            :to="`/products?categorySlug=${category.slug}`"
            class="flex-shrink-0 group/pill flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 whitespace-nowrap"
            :class="activeSlug === category.slug ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50 hover:border-slate-100'"
          >
            <div
              class="group-hover/pill:scale-110 transition-transform duration-300 flex items-center justify-center min-w-[1.25rem]"
            >
              <component
                :is="HeroIcons[category.icon] || HeroIcons.Squares2X2Icon"
                class="w-5 h-5"
              />
            </div>

            {{ category.name }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from '#imports'
import * as HeroIcons from '@heroicons/vue/24/outline'
import Squares2X2Icon from '@heroicons/vue/24/outline/Squares2X2Icon'

defineProps({
    categories: {
        type: Array,
        default: () => []
    },
    activeSlug: {
        type: String,
        default: ''
    }
})

const scrollContainer = ref(null)

// Handle horizontal scroll with mouse wheel if needed
onMounted(() => {
    if (scrollContainer.value) {
        scrollContainer.value.addEventListener('wheel', (evt) => {
            evt.preventDefault()
            scrollContainer.value.scrollLeft += evt.deltaY
        })
    }
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}

.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
