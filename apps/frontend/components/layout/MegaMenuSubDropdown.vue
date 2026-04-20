<template>
  <Transition name="slide-fade">
    <div
      v-if="show && category && category.children?.length > 0"
      class="absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 w-full max-w-7xl px-5 z-[210]"
      @mouseenter="$emit('mouseenter')"
      @mouseleave="$emit('mouseleave')"
    >
      <div class="relative bg-white/95 backdrop-blur-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] rounded-[2.5rem] border border-white/80 overflow-hidden">
        <!-- Magic Gradient Decor -->
        <div class="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-transparent pointer-events-none" />

        <div class="relative px-8 py-10">
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-8 gap-y-10">
            <div
              v-for="subCategory in category.children"
              :key="subCategory.id"
              class="flex flex-col space-y-5"
            >
              <!-- Subcategory Heading (Level 2) -->
              <NuxtLink
                :to="`/products?categorySlug=${subCategory.slug}`"
                class="group flex flex-col"
                @click="$emit('hide')"
              >
                <h4 class="text-[11px] font-black text-gray-900 group-hover:text-primary-600 transition-colors uppercase tracking-widest mb-2 flex items-center">
                  {{ subCategory.name }}
                  <ChevronRightIcon class="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h4>
                <div class="h-0.5 w-6 bg-primary-500 rounded-full group-hover:w-12 transition-all duration-300" />
              </NuxtLink>

              <!-- Detail Categories (Level 3) -->
              <ul v-if="subCategory.children && subCategory.children.length > 0" class="flex flex-col space-y-2.5">
                <li v-for="detailCategory in subCategory.children" :key="detailCategory.id">
                  <NuxtLink
                    :to="`/products?categorySlug=${detailCategory.slug}`"
                    class="text-xs font-bold text-gray-500 hover:text-primary-600 hover:translate-x-1.5 transition-all duration-300 inline-flex items-center group/link"
                    @click="$emit('hide')"
                  >
                    <span class="w-1 h-1 rounded-full bg-primary-500/0 group-hover/link:bg-primary-500 mr-2 transition-all duration-300" />
                    {{ detailCategory.name }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ChevronRightIcon } from '@heroicons/vue/24/outline'

defineProps({
  show: Boolean,
  category: Object
})

defineEmits(['mouseenter', 'mouseleave', 'hide'])
</script>
