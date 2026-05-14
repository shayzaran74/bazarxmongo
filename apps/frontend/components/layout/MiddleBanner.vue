<template>
  <div
    v-if="banners.length > 0"
    class="middle-banner-slider relative w-full overflow-hidden group/slider bg-gray-950 rounded-[2.5rem] shadow-2xl"
  >
    <!-- Banner Container -->
    <div
      class="banner-track flex transition-transform duration-[1400ms]"
      :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
    >
      <div
        v-for="(banner, index) in banners"
        :key="banner.id"
        class="banner-slide flex-shrink-0 w-full relative cursor-pointer overflow-hidden group/slide"
        @click="handleBannerClick(banner)"
      >
        <div class="relative h-[300px] sm:h-[350px] md:h-[400px] lg:h-[400px] w-full">
          <!-- Image with sophisticated continuous scale -->
          <img
            :src="resolveImageUrl(banner.imageUrl)"
            :alt="banner.title"
            class="w-full h-full object-cover transition-transform duration-[10000ms] ease-out will-change-transform"
            :style="{
              transform: currentIndex === index ? 'scale(1.15)' : 'scale(1.05)'
            }"
            loading="lazy"
          />

          <!-- Advanced Multi-layered Overlays -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div class="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

          <!-- Content Overlay -->
          <div class="absolute inset-0 flex items-center">
            <div class="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">
              <!-- Parallax Content -->
              <div
                class="max-w-3xl transform transition-all duration-[1400ms] cubic-bezier(0.16, 1, 0.3, 1)"
                :class="currentIndex === index ? 'translate-x-0 opacity-100' : '-translate-x-24 opacity-0 scale-95'"
              >
                <!-- Badge -->
                <div
                  class="flex items-center space-x-3 mb-4 transition-all duration-1000 delay-300"
                  :class="currentIndex === index ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'"
                >
                  <span
                    class="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-600/20 backdrop-blur-2xl border border-primary-500/30 text-primary-400 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] shadow-2xl"
                  >
                    <SparklesIcon class="w-3.5 h-3.5 mr-2 text-primary-400 animate-pulse" />
                    {{ banner.subtitle || 'SPONSORLU FIRSAT' }}
                  </span>
                </div>

                <!-- Title -->
                <h2
                  class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 text-white tracking-tighter leading-[0.95] drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-1000 delay-500"
                  :class="currentIndex === index ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'"
                >
                  {{ banner.title }}
                </h2>

                <!-- Description -->
                <p
                  v-if="banner.description"
                  class="text-xs sm:text-sm md:text-lg text-gray-200 font-medium max-w-2xl mb-8 leading-relaxed drop-shadow-lg transition-all duration-1000 delay-700"
                  :class="currentIndex === index ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'"
                >
                  {{ banner.description }}
                </p>

                <!-- Button -->
                <div
                  class="transition-all duration-1000 delay-1000"
                  :class="currentIndex === index ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'"
                >
                  <button
                    v-if="banner.linkUrl"
                    class="group/btn relative inline-flex items-center justify-center px-8 py-4 bg-white text-gray-950 text-sm sm:text-base font-black rounded-full overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)]"
                  >
                    <span class="relative z-10">{{ $t('common.exploreNow') }}</span>
                    <ArrowRightIcon
                      class="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:translate-x-2 transition-transform duration-500 relative z-10"
                    />
                    <div
                      class="absolute inset-0 bg-primary-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Arrows -->
    <button
      v-if="banners.length > 1"
      class="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/20 backdrop-blur-2xl rounded-full flex items-center justify-center text-white opacity-0 group-hover/slider:opacity-100 hover:bg-white/20 transition-all duration-500 z-10 border border-white/10 shadow-3xl"
      @click.stop="prevSlide"
    >
      <ChevronLeftIcon class="h-6 w-6" />
    </button>
    <button
      v-if="banners.length > 1"
      class="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/20 backdrop-blur-2xl rounded-full flex items-center justify-center text-white opacity-0 group-hover/slider:opacity-100 hover:bg-white/20 transition-all duration-500 z-10 border border-white/10 shadow-3xl"
      @click.stop="nextSlide"
    >
      <ChevronRightIcon class="h-6 w-6" />
    </button>

    <!-- Progress Indicators -->
    <div
      v-if="banners.length > 1"
      class="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10"
    >
      <button
        v-for="(banner, index) in banners"
        :key="'dot-' + banner.id"
        class="group/dot relative h-1 rounded-full bg-white/20 overflow-hidden transition-all duration-700 hover:bg-white/40"
        :class="index === currentIndex ? 'w-16' : 'w-6'"
        @click.stop="goToSlide(index)"
      >
        <div
          v-if="index === currentIndex"
          class="absolute top-0 left-0 h-full bg-white progress-bar-active"
        />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from '#imports'
import { useI18n, useAppImage, useRuntimeConfig, useAuthStore } from '#imports'
import ChevronLeftIcon from '@heroicons/vue/24/outline/ChevronLeftIcon'
import ChevronRightIcon from '@heroicons/vue/24/outline/ChevronRightIcon'
import ArrowRightIcon from '@heroicons/vue/24/outline/ArrowRightIcon'
import SparklesIcon from '@heroicons/vue/24/outline/SparklesIcon'

const props = defineProps({
    ecosystem: {
        type: String,
        default: ''
    }
})

const { resolveImageUrl } = useAppImage()
const config = useRuntimeConfig()
const { locale } = useI18n()
const authStore = useAuthStore()
const { $api } = useApi()

const banners = ref([])
const currentIndex = ref(0)
const autoPlayInterval = ref(null)
const SLIDE_DURATION = 6000

const fetchBanners = async () => {
    try {
        let city = authStore.user?.city || ''
        if (!city) {
            try {
                const saved = localStorage.getItem('detected_location')
                if (saved) {
                    const parsed = JSON.parse(saved)
                    if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
                        city = parsed.city || ''
                    }
                }
            } catch (e) { /* localStorage unavailable */ }
        }
        const params = new URLSearchParams()
        if (props.ecosystem) params.append('ecosystem', props.ecosystem)
        if (city) params.append('city', city)
        params.append('platform', props.ecosystem || 'BAZARX')
        params.append('tag', 'home_middle')
        params.append('locale', locale.value)
        const query = params.toString() ? `?${params.toString()}` : ''

        const data = await $api(`/api/v1/banners${query}`)

        // Backend raw array döndürüyor (wrapper yok)
        const rawBanners = Array.isArray(data) ? data : (data?.data || [])
        if (rawBanners.length > 0) {
            banners.value = rawBanners.map((b) => ({
                ...b,
                imageUrl: b.image || b.imageUrl,
                linkUrl: b.link || b.linkUrl,
                subtitle: b.subtitle || 'MID-BANNER REKLAM'
            }))
            if (banners.value.length > 1) {
                startAutoPlay()
            }
        } else {
            console.warn('No banners found from API, using mock data')
            loadMockBanners()
        }
    } catch (error) {
        console.error('Fetch middle banners error:', error)
        loadMockBanners()
    }
}

const loadMockBanners = () => {
    banners.value = [
        {
            id: 'mock-1',
            title: 'Kurumsal Lojistik Çözümleri',
            description: 'Tüm kurumsal sevkiyatlarınızda geçerli özel barter anlaşmaları ve lojistik desteği.',
            imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=1200',
            linkUrl: '/products?category=lojistik',
            subtitle: 'STRATEJİK ORTAKLIK'
        },
        {
            id: 'mock-2',
            title: 'Ofis Mobilyalarında Barter Fırsatı',
            description: 'Eski ofis mobilyalarınızı takas edin, en yeni tasarımlara barter kredisiyle sahip olun.',
            imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1200',
            linkUrl: '/products?category=mobilya',
            subtitle: 'KURUMSAL TAKAS'
        }
    ]
    if (banners.value.length > 1) startAutoPlay()
}

const resetAutoPlay = () => {
    stopAutoPlay()
    setTimeout(() => {
        startAutoPlay()
    }, 10)
}

const nextSlide = () => {
    currentIndex.value = (currentIndex.value + 1) % banners.value.length
    resetAutoPlay()
}

const prevSlide = () => {
    currentIndex.value = (currentIndex.value - 1 + banners.value.length) % banners.value.length
    resetAutoPlay()
}

const goToSlide = (index) => {
    currentIndex.value = index
    resetAutoPlay()
}

const startAutoPlay = () => {
    autoPlayInterval.value = setInterval(() => {
        currentIndex.value = (currentIndex.value + 1) % banners.value.length
    }, SLIDE_DURATION)
}

const stopAutoPlay = () => {
    if (autoPlayInterval.value) {
        clearInterval(autoPlayInterval.value)
        autoPlayInterval.value = null
    }
}

const handleBannerClick = (banner) => {
    if (banner.linkUrl) {
        if (banner.linkUrl.startsWith('http')) {
            window.open(banner.linkUrl, '_blank')
        } else {
            navigateTo(banner.linkUrl)
        }
    }
}

watch([() => authStore.user?.city, locale], () => {
    fetchBanners()
})

onMounted(() => {
    fetchBanners()
})

onUnmounted(() => {
    stopAutoPlay()
})
</script>

<style scoped>
.middle-banner-slider {
    background: #000;
}

.banner-track {
    will-change: transform;
    transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

.banner-slide {
    min-width: 100%;
}

.progress-bar-active {
    animation: fillProgress 6s linear forwards;
}

@keyframes fillProgress {
    0% {
        width: 0%;
        opacity: 0.8;
    }

    100% {
        width: 100%;
        opacity: 1;
    }
}
</style>
