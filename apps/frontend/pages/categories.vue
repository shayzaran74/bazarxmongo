<template>
  <div
    class="h-[calc(100vh-140px)] min-h-[500px] lg:h-auto lg:max-w-7xl lg:mx-auto lg:py-6 lg:px-8 bg-white overflow-hidden relative"
  >
    <!-- Desktop View (Grid) -->
    <div
      v-if="!isMobile"
      class="px-4 py-6 sm:px-0"
    >
      <h1 class="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tight italic">
        Tüm Kategoriler
      </h1>

      <!-- Loading state -->
      <div
        v-if="loading"
        class="flex justify-center items-center h-64"
      >
        <div class="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>

      <!-- Categories grid -->
      <div
        v-else
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"
      >
        <NuxtLink
          v-for="category in categories"
          :key="category.id"
          :to="`/products?categorySlug=${category.slug}`"
          class="block group"
        >
          <div
            class="bg-gray-50 rounded-2xl p-6 text-center hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-primary-100"
          >
            <div
              class="text-5xl mb-4 transform group-hover:scale-110 transition-transform text-indigo-600 flex justify-center"
            >
              <component
                :is="HeroIcons[category.icon] || HeroIcons.Squares2X2Icon"
                class="w-12 h-12"
              />
            </div>
            <h3 class="text-sm font-black text-gray-900 group-hover:text-primary-600 uppercase tracking-tight">
              {{
                category.name }}
            </h3>
            <div class="mt-2 h-0.5 w-8 bg-primary-500 mx-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Mobile View (Trendyol Style Side Nav) -->
    <template v-else>
      <div class="flex h-full bg-gray-50 relative z-10">
        <!-- Left Side: Category Sidebar (Shrunk) -->
        <div
          class="w-[72px] bg-white border-r border-gray-100 flex-shrink-0 overflow-y-auto no-scrollbar pb-32 shadow-sm relative z-20 pointer-events-auto"
          style="-webkit-overflow-scrolling: touch;"
        >
          <button
            v-for="category in categories"
            :key="category.id"
            class="w-full py-4 px-1 flex flex-col items-center space-y-1 transition-all relative border-b border-gray-50"
            :class="selectedCategoryId === category.id ? 'bg-primary-50/50' : 'bg-white'"
            @click.stop="selectedCategoryId = category.id"
          >
            <!-- Active Indicator (Sleeker) -->
            <div
              v-if="selectedCategoryId === category.id"
              class="absolute left-0 top-2 bottom-2 w-1 bg-primary-600 rounded-r-full"
            />

            <div
              class="transition-transform text-indigo-600"
              :class="selectedCategoryId === category.id ? 'scale-110' : 'grayscale opacity-70'"
            >
              <component
                :is="HeroIcons[category.icon] || HeroIcons.Squares2X2Icon"
                class="w-6 h-6"
              />
            </div>
            <span
              class="text-[8px] font-black text-center uppercase tracking-tighter leading-tight px-0.5 line-clamp-2"
              :class="selectedCategoryId === category.id ? 'text-primary-700' : 'text-gray-400'"
            >
              {{ category.name }}
            </span>
          </button>
        </div>

        <!-- Right Side: Content Area -->
        <div
          class="flex-1 overflow-y-auto bg-white no-scrollbar pb-32 px-4 py-4 relative z-10 pointer-events-auto"
          style="-webkit-overflow-scrolling: touch;"
        >
          <div
            v-if="selectedCategory"
            :key="selectedCategory.id"
            class="animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <!-- Header/Banner for Selected Category -->
            <div
              class="relative rounded-2xl overflow-hidden mb-6 aspect-[3/1] bg-gradient-to-r from-primary-600 to-purple-600 flex items-center p-4"
            >
              <div class="relative z-10">
                <h2 class="text-lg font-black text-white uppercase italic leading-none">
                  {{ selectedCategory.name }}
                </h2>
                <button
                  class="mt-2 text-[10px] bg-white text-primary-600 px-3 py-1 rounded-full font-black uppercase tracking-wider"
                >
                  Tümünü
                  İncele
                </button>
              </div>
              <div class="absolute right-[5%] bottom-[-10%] opacity-20 rotate-12 text-white">
                <component
                  :is="HeroIcons[selectedCategory.icon] || HeroIcons.Squares2X2Icon"
                  class="w-24 h-24"
                />
              </div>
            </div>

            <!-- Sub Categories Sections -->
            <div
              v-if="selectedCategory.children && selectedCategory.children.length > 0"
              class="space-y-8"
            >
              <div
                v-for="sub in selectedCategory.children"
                :key="sub.id"
                class="space-y-4"
              >
                <div class="flex items-center justify-between">
                  <h3
                    class="text-xs font-black text-gray-900 uppercase tracking-widest pl-2 border-l-4 border-primary-500"
                  >
                    {{ sub.name }}
                  </h3>
                  <NuxtLink
                    :to="`/products?categorySlug=${sub.slug}`"
                    class="text-[10px] font-bold text-primary-600 uppercase"
                  >
                    Tümü >
                  </NuxtLink>
                </div>

                <!-- Detail Categories (Square UI - Trendyol Style) -->
                <div class="grid grid-cols-3 gap-y-6 gap-x-3">
                  <div
                    v-for="detail in sub.children"
                    :key="detail.id"
                    class="flex flex-col items-center space-y-2 group cursor-pointer active:scale-95 transition-transform"
                    @click="handleCategoryClick(detail.slug)"
                  >
                    <div
                      class="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm relative"
                    >
                      <NuxtImg
                        :src="getCategoryImage(detail)"
                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        format="webp"
                        quality="80"
                        placeholder
                      />
                    </div>
                    <span
                      class="text-[9px] font-black text-gray-700 text-center uppercase tracking-tighter line-clamp-2 px-0.5 leading-tight"
                    >
                      {{ detail.name }}
                    </span>
                  </div>
                  <!-- If no detail categories, show a placeholder -->
                  <div
                    v-if="!sub.children || sub.children.length === 0"
                    class="col-span-3 py-4 text-center text-[10px] text-gray-300 italic"
                  >
                    Görsel bulunamadı
                  </div>
                </div>
              </div>
            </div>

            <!-- If no children -->
            <div
              v-else
              class="flex flex-col items-center justify-center py-12 text-center opacity-40"
            >
              <div class="mb-4 text-gray-200">
                <HeroIcons.FolderIcon class="w-16 h-16" />
              </div>
              <p class="text-sm font-bold uppercase tracking-widest">
                Bu kategoride henüz alt kategori bulunmuyor
              </p>
              <NuxtLink
                :to="`/products?categorySlug=${selectedCategory.slug}`"
                class="mt-4 btn-primary px-6 py-2 text-xs"
              >
                Ürünleri Gör
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import * as HeroIcons from '@heroicons/vue/24/outline'

// State
const categories = ref([])
const selectedCategoryId = ref(null)
const loading = ref(false)
const isMobile = ref(false)

// Use composable for images
const { getCategoryImage } = useAppImage()

// Handle Detailed Category Click
const handleCategoryClick = (slug) => {
  // Navigate to product listing with category filter
  navigateTo(`/products?categorySlug=${slug}`)
}

// Computed
const selectedCategory = computed(() => {
  return categories.value.find(c => c.id === selectedCategoryId.value)
})

// Check mobile
const updateMobile = () => {
  if (process.client) {
    isMobile.value = window.innerWidth < 1024
  }
}

// Fetch categories
const fetchCategories = async () => {
  loading.value = true
  try {
    const { $api } = useApi()
    const data = await $api('/api/categories', {
      params: {
        includeChildren: true,
        all: true
      }
    })

    if (data.success) {
      // Filter main categories
      categories.value = data.data.filter(c => !c.parentId)
      if (categories.value.length > 0) {
        selectedCategoryId.value = categories.value[0].id
      }
    }
  } catch (err) {
    console.error('Fetch categories error:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCategories()
  updateMobile()
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', updateMobile)
  }
})

// Layout
definePageMeta({
  layout: 'default'
})

useHead({
  title: 'Kategoriler - TicariTakas',
  meta: [
    { name: 'description', content: 'TicariTakas tüm kategoriler listesi' }
  ]
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.animate-in {
  animation: fadeIn 0.4s ease-out;
}
</style>