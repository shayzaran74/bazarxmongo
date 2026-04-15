<template>
  <div
    v-if="banners.length > 0"
    class="home-banner-slider relative w-full overflow-hidden group/slider bg-gray-950"
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
        <div class="relative h-[350px] sm:h-[400px] md:h-[500px] lg:h-[400px] w-full">
          <!-- Image with sophisticated continuous scale -->
          <img
            :src="resolveImageUrl(banner.imageUrl)"
            :alt="banner.title"
            class="w-full h-full object-cover transition-transform duration-[10000ms] ease-out will-change-transform"
            :style="{
              transform: currentIndex === index ? 'scale(1.15)' : 'scale(1.05)'
            }"
            loading="eager"
          />

          <!-- Advanced Multi-layered Overlays -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div class="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

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
                    class="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] shadow-2xl"
                  >
                    <SparklesIcon class="w-3.5 h-3.5 mr-2 text-amber-400 animate-pulse" />
                    {{ banner.subtitle || 'ÖZEL SEÇİM' }}
                  </span>
                </div>

                <!-- Title -->
                <h2
                  class="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black mb-4 text-white tracking-tighter leading-[0.95] drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-1000 delay-500"
                  :class="currentIndex === index ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'"
                >
                  {{ banner.title }}
                </h2>

                <!-- Description -->
                <p
                  v-if="banner.description"
                  class="text-sm sm:text-base md:text-xl text-gray-200 font-medium max-w-2xl mb-8 leading-relaxed drop-shadow-lg transition-all duration-1000 delay-700"
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

    <!-- High-end Navigation Arrows -->
    <button
      v-if="banners.length > 1"
      class="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-black/10 backdrop-blur-2xl rounded-full flex items-center justify-center text-white opacity-0 group-hover/slider:opacity-100 hover:bg-white/20 transition-all duration-500 z-10 border border-white/10 hover:scale-110 shadow-3xl focus:outline-none ring-1 ring-white/5"
      @click.stop="prevSlide"
    >
      <ChevronLeftIcon class="h-6 w-6 md:h-8 md:w-8" />
    </button>
    <button
      v-if="banners.length > 1"
      class="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-black/10 backdrop-blur-2xl rounded-full flex items-center justify-center text-white opacity-0 group-hover/slider:opacity-100 hover:bg-white/20 transition-all duration-500 z-10 border border-white/10 hover:scale-110 shadow-3xl focus:outline-none ring-1 ring-white/5"
      @click.stop="nextSlide"
    >
      <ChevronRightIcon class="h-6 w-6 md:h-8 md:w-8" />
    </button>

    <!-- Premium Progress Indicators -->
    <div
      v-if="banners.length > 1"
      class="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10"
    >
      <button
        v-for="(banner, index) in banners"
        :key="'dot-' + banner.id"
        class="group/dot relative h-1 md:h-1.5 rounded-full bg-white/20 overflow-hidden transition-all duration-700 hover:bg-white/40 focus:outline-none"
        :class="index === currentIndex ? 'w-24 md:w-32' : 'w-10 md:w-12'"
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
import { ref, onMounted, onUnmounted, watch, useI18n, useAppImage, useRuntimeConfig, navigateTo, useAuthStore } from '#imports'
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
const authStore = useAuthStore()
const { locale } = useI18n()

const banners = ref([])
const currentIndex = ref(0)
const autoPlayInterval = ref(null)

// Ekranda her slide ne kadar süre (ms) kalsın?
const SLIDE_DURATION = 6000

const fetchBanners = async () => {
    try {
        let city = ''
        try {
            const saved = localStorage.getItem('detected_location')
            if (saved) {
                const parsed = JSON.parse(saved)
                if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
                    city = parsed.city || ''
                }
            }
        } catch (e) { /* localStorage unavailable */ }

        const params = new URLSearchParams()
        if (props.ecosystem) params.append('ecosystem', props.ecosystem)
        if (city) params.append('city', city)
        params.append('locale', locale.value)
        params.append('position', 'home_top')
        const query = params.toString() ? `?${params.toString()}` : ''

        const data = await $fetch(`/api/banners${query}`, {
            baseURL: config.public.apiBase
        })
        if (data.success) {
            banners.value = data.data
            // Varsayılan altyazı desteği yoksa, Premium bir görünüm için rastgele subtitle ekle (Eğer API'den gelmiyorsa)
            banners.value = banners.value.map((b, i) => ({
                ...b,
                subtitle: b.subtitle || (i === 0 ? 'ÖZEL SEÇİM' : 'YENİ FIRSAT')
            }))
            if (banners.value.length > 1) {
                startAutoPlay()
            }
        }
    } catch (error) {
        console.error('Fetch banners error:', error)
    }
}

const resetAutoPlay = () => {
    stopAutoPlay()
    // DOM güncellenmesini (class değişikliğini) anlık hissetmesi için küçük bir timeout
    setTimeout(() => {
        startAutoPlay()
    }, 10)
}

const nextSlide = () => {
    currentIndex.value = (currentIndex.value + 1) % banners.value.length
    resetAutoPlay() // Animasyonu baştan başlatır
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
.home-banner-slider {
    background: #000;
}

.banner-track {
    will-change: transform;
    /* Apple tarzı ultra-pürüzsüz kaydırma geçişi */
    transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

.banner-slide {
    min-width: 100%;
}

.progress-bar-active {
    /* 6s süreye ayarlı progressBar animasyonu. SLIDE_DURATION ile eşit olmalı */
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
