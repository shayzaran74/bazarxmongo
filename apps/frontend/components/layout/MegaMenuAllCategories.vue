<template>
  <div
    class="flex-shrink-0 mr-4"
    @mouseenter="$emit('mouseenter')"
    @mouseleave="$emit('mouseleave')"
  >
    <button
      class="flex items-center space-x-2 px-5 py-2.5 text-[11px] font-black text-white bg-gray-900 hover:bg-black transition-all uppercase tracking-widest rounded-2xl focus:outline-none shadow-lg shadow-gray-900/20 active:scale-95 group border border-gray-800"
      @click="$emit('toggle')"
    >
      <div class="bg-white/20 p-1 rounded-lg group-hover:bg-white/30 transition-colors">
        <Squares2X2Icon class="w-4 h-4" />
      </div>
      <span>{{ $t('nav.allCategories') }}</span>
      <ChevronDownIcon
        class="w-3 h-3 transition-transform duration-300 ml-1 opacity-70 group-hover:opacity-100"
        :class="{ 'rotate-180': isShowing }"
      />
    </button>

    <Transition name="slide-fade">
      <div
        v-if="isShowing"
        class="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-full max-w-7xl px-5 overflow-hidden z-[510] flex"
        @mouseleave="$emit('select-category', null)"
      >
        <div class="w-full h-[420px] bg-white/95 backdrop-blur-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-white rounded-[2.5rem] overflow-hidden flex">
          <!-- Categories List -->
          <div class="w-[300px] xl:w-[350px] shrink-0 h-full overflow-y-auto border-r border-gray-100 py-6 custom-scrollbar bg-white/50">
            <div
              v-for="category in categories"
              :key="category.id"
              class="group/item relative px-4 py-3 mx-4 rounded-2xl cursor-pointer flex items-center justify-between transition-all duration-300"
              :class="currentCategory?.id === category.id ? 'bg-primary-50 ring-1 ring-primary-100' : 'hover:bg-gray-100/80'"
              @mouseenter="!isMobile && $emit('select-category', category)"
              @click="$emit('click-category', category)"
            >
              <div class="flex items-center space-x-4 text-left">
                <div
                  class="shrink-0 w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 shadow-sm transition-all duration-300"
                  :class="currentCategory?.id === category.id ? 'text-primary-600 bg-white ring-1 ring-primary-100 scale-110' : 'group-hover/item:text-primary-600 group-hover/item:bg-white'"
                >
                  <component :is="HeroIcons[category.icon] || HeroIcons.Squares2X2Icon" class="w-5 h-5" />
                </div>
                <span
                  class="text-xs font-black uppercase tracking-widest line-clamp-1 transition-colors duration-300"
                  :class="currentCategory?.id === category.id ? 'text-primary-700' : 'text-gray-700 group-hover/item:text-primary-600'"
                >
                  {{ category.name }}
                </span>
              </div>
              <ChevronRightIcon
                class="w-4 h-4 transition-all duration-300"
                :class="currentCategory?.id === category.id ? 'text-primary-500 translate-x-1' : 'text-gray-300 group-hover/item:text-primary-500 group-hover/item:translate-x-1'"
              />
            </div>
          </div>

          <!-- Sub Categories Panel -->
          <div class="flex-1 h-full overflow-y-auto p-10 relative bg-gray-50/30 custom-scrollbar">
            <div v-if="currentCategory" class="animate-in fade-in slide-in-from-left-4 duration-300 max-w-5xl">
              <div class="mb-8 border-b border-gray-100 pb-4">
                <h3 class="text-2xl font-black text-gray-900 tracking-tighter uppercase">{{ currentCategory.name }}</h3>
              </div>
              <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-12">
                <div v-for="sub in currentCategory.children" :key="sub.id" class="flex flex-col space-y-5">
                  <NuxtLink
                    :to="`/products?categorySlug=${sub.slug}`"
                    class="text-sm font-black text-gray-900 hover:text-primary-600 uppercase tracking-wider flex items-center group/sublink"
                    @click="$emit('hide')"
                  >
                    {{ sub.name }}
                    <div class="ml-2 h-0.5 w-0 group-hover/sublink:w-6 bg-primary-500 rounded-full transition-all duration-300" />
                  </NuxtLink>
                  <ul class="flex flex-col space-y-3">
                    <li v-for="detail in sub.children" :key="detail.id">
                      <NuxtLink
                        :to="`/products?categorySlug=${detail.slug}`"
                        class="text-sm font-bold text-gray-500 hover:text-primary-600 hover:translate-x-1 inline-block transition-all duration-300"
                        @click="$emit('hide')"
                      >
                        {{ detail.name }}
                      </NuxtLink>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div v-else class="h-full w-full flex items-center justify-center">
              <div class="text-center opacity-40">
                <Squares2X2Icon class="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p class="text-xs font-black uppercase tracking-widest text-gray-400">{{ $t('nav.seeAllCategories') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import * as HeroIcons from '@heroicons/vue/24/outline'
import { Squares2X2Icon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

defineProps({
  categories: Array,
  isShowing: Boolean,
  currentCategory: Object,
  isMobile: Boolean
})

defineEmits(['toggle', 'mouseenter', 'mouseleave', 'select-category', 'click-category', 'hide'])
</script>
