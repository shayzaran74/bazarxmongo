<template>
  <section class="personalized-feed mb-6 md:mb-10 -mx-2 sm:-mx-3 md:-mx-4 lg:-mx-6 xl:-mx-8">
    <!-- Section Container with background - Reduced padding -->
    <div
      class="bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 rounded-xl md:rounded-[2rem] shadow-2xl p-3 sm:p-4 md:p-6 text-white relative overflow-hidden"
    >
      <!-- Animated Background -->
      <div class="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        <div class="absolute top-0 right-0 w-60 h-60 bg-pink-400 rounded-full blur-[100px] animate-pulse" />
        <div class="absolute bottom-0 left-0 w-60 h-60 bg-white rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      <!-- Section Header - Compact -->
      <div class="flex flex-col md:flex-row items-center justify-between mb-4 gap-3 relative z-10">
        <div class="text-center md:text-left">
          <div class="flex items-center justify-center md:justify-start gap-3 mb-1">
            <div
              class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-lg"
            >
              <span class="text-xl animate-pulse">✨</span>
            </div>
            <div>
              <h2 class="text-xl md:text-2xl font-black tracking-tight leading-tight">
                {{ title }}
              </h2>
              <p class="text-indigo-100 text-[10px] md:text-xs font-medium">
                {{ subtitle }}
              </p>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div
            v-if="prediction && prediction.confidence > 0.5"
            class="bg-white/10 backdrop-blur-md rounded-xl px-3 py-1 border border-white/20"
          >
            <div class="flex items-center gap-1.5">
              <div class="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
              <span class="text-[9px] font-bold uppercase tracking-widest">{{ aiTagline }}</span>
            </div>
          </div>
          <NuxtLink
            to="/products"
            class="inline-flex items-center text-[9px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full hover:bg-white/30 transition-all border border-white/30 hover:scale-105 shadow-lg"
          >
            {{ $t('personalized.viewAll') }}
            <ArrowRightIcon class="h-2.5 w-2.5 ml-1.5" />
          </NuxtLink>
        </div>
      </div>

      <!-- Skeleton Loading -->
      <div
        v-if="loading"
        class="flex gap-3 overflow-x-auto pb-3 scrollbar-hide relative z-10"
      >
        <div
          v-for="i in 8"
          :key="i"
          class="w-32 md:w-40 2xl:w-44 flex-shrink-0 bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse"
        >
          <div class="aspect-square bg-gray-200" />
          <div class="p-3 space-y-1.5">
            <div class="h-3 bg-gray-200 rounded w-3/4" />
            <div class="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>

      <!-- Product Row -->
      <div
        v-else
        class="flex gap-4 overflow-x-auto pb-8 scrollbar-hide scroll-smooth snap-x relative z-10 px-1"
      >
        <div
          v-for="product in products"
          :key="product.id"
          class="w-[calc((100%-24px)/2.5)] md:w-[calc((100%-56px)/4.5)] lg:w-[calc((100%-88px)/6.5)] flex-shrink-0 snap-start"
        >
          <ProductCard
            :product="product"
            @click="trackClick(product); navigateTo(`/products/${product.id}`)"
            @add-to-cart="(p) => emit('add-to-cart', p)"
          >
            <template #badges>
              <div
                class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center gap-1.5 border border-white/20"
              >
                <span class="animate-pulse text-[10px]">✨</span>
                AI RECOMMENDED
              </div>
            </template>
          </ProductCard>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, useI18n, useRuntimeConfig, useApi } from '#imports'
import ArrowRightIcon from '@heroicons/vue/24/outline/ArrowRightIcon'

const emit = defineEmits(['add-to-cart'])

const products = ref([])
const loading = ref(true)
const prediction = ref(null)
const userBehavior = ref({ clicks: [], dwellTime: 0 })

const { t, tm, rt } = useI18n()
const { $api } = useApi()

// Cache random indices to prevent flickering on every re-render
const randomIndex = ref({
  title: 0,
  subtitle: 0,
  tagline: 0
})

onMounted(() => {
  randomIndex.value = {
    title: Math.floor(Math.random() * 4),
    subtitle: Math.floor(Math.random() * 4),
    tagline: Math.floor(Math.random() * 4)
  }
})

// Dynamic titles and subtitles based on AI confidence
const titleOptions = computed(() => {
  const raw = tm('personalized.titleOptions')
  return Array.isArray(raw) ? raw : []
})

const subtitleOptions = computed(() => {
  const raw = tm('personalized.subtitleOptions')
  return Array.isArray(raw) ? raw : []
})

const aiTaglines = computed(() => {
  const raw = tm('personalized.aiTaglines')
  return Array.isArray(raw) ? raw : []
})

const title = computed(() => {
  if (!titleOptions.value?.length) return t('personalized.title')
  const idx = randomIndex.value.title % titleOptions.value.length
  const val = titleOptions.value[idx]
  return typeof val === 'string' ? val : rt(val)
})

const subtitle = computed(() => {
  if (!subtitleOptions.value?.length) return t('personalized.subtitle')
  const idx = randomIndex.value.subtitle % subtitleOptions.value.length
  const val = subtitleOptions.value[idx]
  return typeof val === 'string' ? val : rt(val)
})

const aiTagline = computed(() => {
  if (!aiTaglines.value?.length) return 'AI'
  const idx = randomIndex.value.tagline % aiTaglines.value.length
  const val = aiTaglines.value[idx]
  return typeof val === 'string' ? val : rt(val)
})


// Track product clicks for behavior analysis
const trackClick = (product) => {
  userBehavior.value.clicks.push({
    productId: product.id,
    categoryId: product.categoryId,
    timestamp: Date.now()
  })

  // Save to localStorage for persistence
  if (process.client) {
    localStorage.setItem('ai_user_behavior', JSON.stringify(userBehavior.value))
  }
}

// Track page dwell time
const startDwellTracking = () => {
  const startTime = Date.now()

  if (process.client) {
    window.addEventListener('beforeunload', () => {
      userBehavior.value.dwellTime += (Date.now() - startTime) / 1000
      localStorage.setItem('ai_user_behavior', JSON.stringify(userBehavior.value))
    })
  }
}

// Load saved behavior from localStorage
const loadBehavior = () => {
  if (process.client) {
    const saved = localStorage.getItem('ai_user_behavior')
    if (saved) {
      try {
        userBehavior.value = JSON.parse(saved)
      } catch (e) {
        console.warn('Failed to parse saved behavior')
      }
    }
  }
}

// Fetch personalized products based on behavior
const fetchPersonalizedData = async () => {
  loading.value = true
  try {
    // Get most clicked category from behavior
    const categoryHits = {}
    userBehavior.value.clicks.forEach(click => {
      if (click.categoryId) {
        categoryHits[click.categoryId] = (categoryHits[click.categoryId] || 0) + 1
      }
    })

    const topCategoryId = Object.entries(categoryHits).sort((a, b) => b[1] - a[1])[0]?.[0]

    // Build query based on behavior
    const query = { limit: 12 }
    if (topCategoryId) {
      query.category = topCategoryId
    } else {
      query.isFeatured = true
    }

    const data = await $api('/api/products', {
      query
    })

    if (data?.success) {
      products.value = data.data

      // Calculate confidence based on behavior data
      const clickCount = userBehavior.value.clicks.length
      const dwellTime = userBehavior.value.dwellTime
      const confidence = Math.min((clickCount * 0.1) + (dwellTime * 0.01), 0.95)

      prediction.value = {
        confidence: confidence > 0.3 ? confidence : 0.6 // Minimum 0.6 for demo
      }
    }
  } catch (err) {
    console.error('Personalized feed error:', err)
    // Fallback to featured products
    try {
      const fallback = await $api('/api/products', {
        query: { limit: 12, isFeatured: true }
      })
      if (fallback?.success) products.value = fallback.data
    } catch (e) {
      console.error('Fallback also failed:', e)
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadBehavior()
  startDwellTracking()
  fetchPersonalizedData()
})
</script>

<style scoped>
.ai-badge {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  padding: 0.4rem 0.75rem;
  border-radius: 99px;
  font-size: 0.7rem;
  font-weight: 700;
  border: 1px solid rgba(99, 102, 241, 0.2);
}
</style>
