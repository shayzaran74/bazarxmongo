import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export const useMegaMenu = (props: any, emit: any) => {
  const router = useRouter()
  
  // State
  const mainCategories = computed(() => props.categories)
  const showMegaMenuFlag = ref(false)
  const showingAllCategories = ref(false)
  const currentCategory = ref<any>(null)
  const activeMobileSubCategory = ref<any>(null)
  const isMobile = ref(false)
  const hideTimeout = ref<any>(null)
  const categoriesContainer = ref<HTMLElement | null>(null)
  const showScrollButtons = ref(false)

  // Methods
  const checkIfMobile = () => {
    if (process.client) {
      isMobile.value = window.innerWidth < 1024
    }
  }

  const navigateTo = (path: string) => {
    router.push(path)
  }

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
    if (isMobile.value) return
    cancelHideTimeout()
    showingAllCategories.value = true
  }

  const handleCategoryClick = (category: any) => {
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

  const showSubMenu = (category: any) => {
    if (isMobile.value) return
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
    }, 300)
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

  onMounted(() => {
    checkIfMobile()
    window.addEventListener('resize', () => {
      checkScroll()
      checkIfMobile()
    })
    // Initial check scroll
    setTimeout(checkScroll, 100)
  })

  onUnmounted(() => {
    cancelHideTimeout()
    window.removeEventListener('resize', () => {
      checkScroll()
      checkIfMobile()
    })
  })

  return {
    mainCategories,
    showMegaMenuFlag,
    showingAllCategories,
    currentCategory,
    activeMobileSubCategory,
    isMobile,
    categoriesContainer,
    showScrollButtons,
    toggleAllCategories,
    showAllCategoriesMenu,
    handleCategoryClick,
    showSubMenu,
    hideSubMenuDelayed,
    cancelHideTimeout,
    hideMegaMenu,
    scrollLeft,
    scrollRight
  }
}
