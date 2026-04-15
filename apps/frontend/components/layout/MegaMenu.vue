<template>
  <div
    class="mega-menu-container"
    style="z-index: 200;"
  >
    <nav class="bg-transparent z-[10] lg:mt-2">
      <div class="flex items-center">
        <!-- All Categories Trigger - Premium Pill -->
        <div
          class="flex-shrink-0 mr-4"
          @mouseenter="showAllCategoriesMenu"
          @mouseleave="hideSubMenuDelayed"
        >
          <button
            class="flex items-center space-x-2 px-5 py-2.5 text-[11px] font-black text-white bg-gray-900 hover:bg-black transition-all uppercase tracking-widest rounded-2xl focus:outline-none shadow-lg shadow-gray-900/20 active:scale-95 group border border-gray-800"
            @click="toggleAllCategories"
          >
            <div class="bg-white/20 p-1 rounded-lg group-hover:bg-white/30 transition-colors">
              <Squares2X2Icon class="w-4 h-4" />
            </div>
            <span>{{ $t('nav.allCategories') }}</span>
            <ChevronDownIcon
              class="w-3 h-3 transition-transform duration-300 ml-1 opacity-70 group-hover:opacity-100"
              :class="{ 'rotate-180': showingAllCategories }"
            />
          </button>

          <!-- All Categories Dropdown - Full Width Banner Sized -->
          <Transition name="slide-fade">
            <div
              v-if="showingAllCategories"
              class="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-full max-w-7xl px-5 overflow-hidden z-[510] flex"
              @mouseleave="!isMobile && (currentCategory = null)"
            >
              <div
                class="w-full h-[420px] bg-white/95 backdrop-blur-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-white rounded-[2.5rem] overflow-hidden flex"
              >
                <!-- Left Column: Categories List -->
                <div
                  class="w-[300px] xl:w-[350px] shrink-0 h-full overflow-y-auto border-r border-gray-100 py-6 custom-scrollbar bg-white/50"
                >
                  <div
                    v-for="category in mainCategories"
                    :key="category.id"
                    class="group/item relative px-4 py-3 mx-4 rounded-2xl cursor-pointer flex items-center justify-between transition-all duration-300"
                    :class="currentCategory?.id === category.id ? 'bg-primary-50 ring-1 ring-primary-100' : 'hover:bg-gray-100/80'"
                    @mouseenter="!isMobile && (currentCategory = category)"
                    @click="handleCategoryClick(category)"
                  >
                    <div class="flex items-center space-x-4 text-left">
                      <div
                        class="shrink-0 w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 shadow-sm transition-all duration-300"
                        :class="currentCategory?.id === category.id ? 'text-primary-600 bg-white ring-1 ring-primary-100 scale-110' : 'group-hover/item:text-primary-600 group-hover/item:bg-white'"
                      >
                        <component
                          :is="HeroIcons[category.icon] || HeroIcons.Squares2X2Icon"
                          class="w-5 h-5"
                        />
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

                <!-- Right Column: Sub Categories panel (Shared Area) -->
                <div class="flex-1 h-full overflow-y-auto p-10 relative bg-gray-50/30 custom-scrollbar">
                  <div
                    v-if="currentCategory"
                    class="animate-in fade-in slide-in-from-left-4 duration-300 max-w-5xl"
                  >
                    <div class="mb-8 border-b border-gray-100 pb-4">
                      <h3 class="text-2xl font-black text-gray-900 tracking-tighter uppercase">
                        {{ currentCategory.name
                        }}
                      </h3>
                    </div>
                    <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-12">
                      <div
                        v-for="sub in currentCategory.children"
                        :key="sub.id"
                        class="flex flex-col space-y-5"
                      >
                        <NuxtLink
                          :to="`/products?categorySlug=${sub.slug}`"
                          class="text-sm font-black text-gray-900 hover:text-primary-600 uppercase tracking-wider flex items-center group/sublink"
                          @click="hideMegaMenu"
                        >
                          {{ sub.name }}
                          <div
                            class="ml-2 h-0.5 w-0 group-hover/sublink:w-6 bg-primary-500 rounded-full transition-all duration-300"
                          />
                        </NuxtLink>
                        <ul class="flex flex-col space-y-3">
                          <li
                            v-for="detail in sub.children"
                            :key="detail.id"
                          >
                            <NuxtLink
                              :to="`/products?categorySlug=${detail.slug}`"
                              class="text-sm font-bold text-gray-500 hover:text-primary-600 hover:translate-x-1 inline-block transition-all duration-300"
                              @click="hideMegaMenu"
                            >
                              {{ detail.name }}
                            </NuxtLink>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div
                    v-else
                    class="h-full w-full flex items-center justify-center"
                  >
                    <div class="text-center opacity-40">
                      <Squares2X2Icon class="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p class="text-xs font-black uppercase tracking-widest text-gray-400">
                        {{
                          $t('nav.seeAllCategories')
                        }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Horizontal Categories (Compact Glass Pills) -->
        <div class="relative flex-1 overflow-hidden px-1">
          <!-- Left Scroll Button -->
          <button
            v-if="showScrollButtons && !isMobile"
            class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-md shadow-lg rounded-full p-2 hover:bg-white hover:scale-110 transition-all duration-300 text-gray-500 hover:text-primary-600 border border-white"
            @click="scrollLeft"
          >
            <ChevronLeftIcon class="w-4 h-4" />
          </button>

          <div
            ref="categoriesContainer"
            class="flex items-center space-x-1.5 lg:space-x-2 overflow-x-auto py-1 scrollbar-hide scroll-smooth no-scrollbar mask-edges"
          >
            <div
              v-for="category in mainCategories"
              :key="category.id"
              class="flex-shrink-0 relative"
              @mouseenter="showSubMenu(category)"
              @mouseleave="hideSubMenuDelayed"
            >
              <NuxtLink
                :to="`/products?categorySlug=${category.slug}`"
                class="px-4 py-2.5 rounded-2xl bg-gray-100/50 hover:bg-white dark:bg-gray-800/40 dark:hover:bg-gray-800/80 backdrop-blur-md border border-gray-200/50 text-[10px] lg:text-[11px] font-black text-gray-700 hover:text-primary-600 hover:shadow-sm transition-all duration-300 uppercase tracking-widest relative group whitespace-nowrap flex items-center gap-2"
                @click="hideMegaMenu"
              >
                <div
                  v-if="isMobile"
                  class="text-primary-600"
                >
                  <component
                    :is="HeroIcons[category.icon] || HeroIcons.Squares2X2Icon"
                    class="w-4 h-4"
                  />
                </div>
                <span>{{ category.name }}</span>

                <span
                  v-if="category.badgeText"
                  class="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-[4px] text-[8px] font-black text-white uppercase shadow-sm border border-white leading-none transform rotate-3 group-hover:rotate-0 transition-transform duration-300"
                  :style="{ backgroundColor: category.badgeColor || '#ef4444' }"
                >
                  {{ category.badgeText }}
                </span>
              </NuxtLink>
            </div>
          </div>

          <!-- Right Scroll Button -->
          <button
            v-if="showScrollButtons && !isMobile"
            class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-md shadow-lg rounded-full p-2 hover:bg-white hover:scale-110 transition-all duration-300 text-gray-500 hover:text-primary-600 border border-white"
            @click="scrollRight"
          >
            <ChevronRightIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>

    <!-- Mega Menu Dropdown - Alt Kategoriler (For Horizontal Links) -->
    <Transition name="slide-fade">
      <div
        v-if="showMegaMenuFlag && currentCategory && currentCategory.children?.length > 0 && !showingAllCategories"
        class="absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 w-full max-w-7xl px-5 z-[210]"
        @mouseenter="cancelHideTimeout"
        @mouseleave="hideSubMenuDelayed"
      >
        <div
          class="relative bg-white/95 backdrop-blur-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] rounded-[2.5rem] border border-white/80 overflow-hidden"
        >
          <!-- Magic Gradient Decor -->
          <div
            class="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-transparent pointer-events-none"
          />

          <div class="relative px-8 py-10">
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-8 gap-y-10">
              <div
                v-for="subCategory in currentCategory.children"
                :key="subCategory.id"
                class="flex flex-col space-y-5"
              >
                <!-- Subcategory Heading (Level 2) -->
                <NuxtLink
                  :to="`/products?categorySlug=${subCategory.slug}`"
                  class="group flex flex-col"
                  @click="hideMegaMenu"
                >
                  <h4
                    class="text-[11px] font-black text-gray-900 group-hover:text-primary-600 transition-colors uppercase tracking-widest mb-2 flex items-center"
                  >
                    {{ subCategory.name }}
                    <ChevronRightIcon
                      class="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                    />
                  </h4>
                  <div class="h-0.5 w-6 bg-primary-500 rounded-full group-hover:w-12 transition-all duration-300" />
                </NuxtLink>

                <!-- Detail Categories (Level 3) -->
                <ul
                  v-if="subCategory.children && subCategory.children.length > 0"
                  class="flex flex-col space-y-2.5"
                >
                  <li
                    v-for="detailCategory in subCategory.children"
                    :key="detailCategory.id"
                  >
                    <NuxtLink
                      :to="`/products?categorySlug=${detailCategory.slug}`"
                      class="text-xs font-bold text-gray-500 hover:text-primary-600 hover:translate-x-1.5 transition-all duration-300 inline-flex items-center group/link"
                      @click="hideMegaMenu"
                    >
                      <span
                        class="w-1 h-1 rounded-full bg-primary-500/0 group-hover/link:bg-primary-500 mr-2 transition-all duration-300"
                      />
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, navigateTo } from '#imports'
import * as HeroIcons from '@heroicons/vue/24/outline'
import Squares2X2Icon from '@heroicons/vue/24/outline/Squares2X2Icon'
import ChevronDownIcon from '@heroicons/vue/24/outline/ChevronDownIcon'
import ChevronLeftIcon from '@heroicons/vue/24/outline/ChevronLeftIcon'
import ChevronRightIcon from '@heroicons/vue/24/outline/ChevronRightIcon'

// Props
const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// State
const mainCategories = computed(() => props.categories)
const showMegaMenuFlag = ref(false)
const showingAllCategories = ref(false)
const currentCategory = ref(null)
const activeMobileSubCategory = ref(null)
const isMobile = ref(false)
const hideTimeout = ref(null)
const categoriesContainer = ref(null)
const showScrollButtons = ref(false)

// Check if mobile
const checkIfMobile = () => {
  if (process.client) {
    isMobile.value = window.innerWidth < 1024
  }
}

// Categories are now managed by parent (default layout) via props

// Methods
const toggleAllCategories = () => {
  if (isMobile.value) {
    navigateTo('/categories')
    hideMegaMenu()
    return
  }
  showingAllCategories.value = !showingAllCategories.value
  if (showingAllCategories.value) {
    showMegaMenuFlag.value = false
    activeMobileSubCategory.value = null
    cancelHideTimeout()
  }
}

const showAllCategoriesMenu = () => {
  if (isMobile.value) return // Don't use hover on mobile
  cancelHideTimeout()
  showingAllCategories.value = true
}

const handleCategoryClick = (category) => {
  if (isMobile.value) {
    if (category.children && category.children.length > 0) {
      activeMobileSubCategory.value = category
    } else {
      navigateTo(`/products?categorySlug=${category.slug}`)
      hideMegaMenu()
    }
  } else {
    navigateTo(`/products?categorySlug=${category.slug}`)
    hideMegaMenu()
  }
}

const showSubMenu = (category) => {
  if (isMobile.value) return // Don't use hover on mobile
  cancelHideTimeout()
  if (category.children && category.children.length > 0) {
    currentCategory.value = category
    showMegaMenuFlag.value = true
    showingAllCategories.value = false
  }
}

const hideSubMenuDelayed = () => {
  hideTimeout.value = setTimeout(() => {
    hideMegaMenu()
  }, 300) // 300ms delay
}

const cancelHideTimeout = () => {
  if (hideTimeout.value) {
    clearTimeout(hideTimeout.value)
    hideTimeout.value = null
  }
}

const hideMegaMenu = () => {
  showMegaMenuFlag.value = false
  showingAllCategories.value = false
  currentCategory.value = null
  activeMobileSubCategory.value = null
}

const checkScroll = () => {
  if (categoriesContainer.value) {
    showScrollButtons.value = categoriesContainer.value.scrollWidth > categoriesContainer.value.clientWidth
  }
}

// Scroll functions
const scrollLeft = () => {
  if (categoriesContainer.value) {
    categoriesContainer.value.scrollBy({
      left: -300,
      behavior: 'smooth'
    })
  }
}

const scrollRight = () => {
  if (categoriesContainer.value) {
    categoriesContainer.value.scrollBy({
      left: 300,
      behavior: 'smooth'
    })
  }
}

// Fetch on mount
onMounted(() => {
  checkIfMobile()
  window.addEventListener('resize', () => {
    checkScroll()
    checkIfMobile()
  })
})

// Cleanup
onUnmounted(() => {
  cancelHideTimeout()
  window.removeEventListener('resize', () => {
    checkScroll()
    checkIfMobile()
  })
})
</script>

<style scoped>
.mega-menu-container {
  position: relative;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Slide and Fade Transition */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* Animate categories */
.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@media (max-width: 1023px) {
  .mega-menu-container {
    position: static;
  }
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>