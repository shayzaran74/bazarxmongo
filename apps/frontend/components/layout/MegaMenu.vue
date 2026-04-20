<template>
  <div class="mega-menu-container" style="z-index: 200;">
    <nav class="bg-transparent z-[10] lg:mt-2">
      <div class="flex items-center">
        <!-- All Categories Menu Component -->
        <MegaMenuAllCategories
          :categories="mainCategories"
          :is-showing="showingAllCategories"
          :current-category="currentCategory"
          :is-mobile="isMobile"
          @toggle="toggleAllCategories"
          @mouseenter="showAllCategoriesMenu"
          @mouseleave="hideSubMenuDelayed"
          @select-category="(c) => currentCategory = c"
          @click-category="handleCategoryClick"
          @hide="hideMegaMenu"
        />

        <!-- Horizontal Scrollable Categories Component -->
        <MegaMenuHorizontal
          ref="megaMenuHorizontal"
          :categories="mainCategories"
          :show-buttons="showScrollButtons"
          :is-mobile="isMobile"
          @scroll-left="scrollLeft"
          @scroll-right="scrollRight"
          @mouseenter="showSubMenu"
          @mouseleave="hideSubMenuDelayed"
          @hide="hideMegaMenu"
        />
      </div>
    </nav>

    <!-- Detailed Sub-Dropdown for Horizontal Links -->
    <MegaMenuSubDropdown
      :show="showMegaMenuFlag"
      :category="currentCategory"
      @mouseenter="cancelHideTimeout"
      @mouseleave="hideSubMenuDelayed"
      @hide="hideMegaMenu"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMegaMenu } from '~/composables/useMegaMenu'
import MegaMenuAllCategories from './MegaMenuAllCategories.vue'
import MegaMenuHorizontal from './MegaMenuHorizontal.vue'
import MegaMenuSubDropdown from './MegaMenuSubDropdown.vue'

const props = defineProps({
  categories: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:categories'])

const megaMenuHorizontal = ref(null)

const {
  mainCategories, showMegaMenuFlag, showingAllCategories, currentCategory,
  isMobile, showScrollButtons, toggleAllCategories, showAllCategoriesMenu,
  handleCategoryClick, showSubMenu, hideSubMenuDelayed, cancelHideTimeout,
  hideMegaMenu, scrollLeft, scrollRight, categoriesContainer
} = useMegaMenu(props, emit)

// Bind template ref to composable state
onMounted(() => {
  if (megaMenuHorizontal.value) {
    categoriesContainer.value = megaMenuHorizontal.value.container
  }
})
</script>

<style scoped>
.mega-menu-container { position: relative; }

/* Slide and Fade Transition */
.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-leave-active { transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1); }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-10px); opacity: 0; }

@media (max-width: 1023px) {
  .mega-menu-container { position: static; }
}
</style>