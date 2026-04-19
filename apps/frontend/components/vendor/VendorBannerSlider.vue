<template>
  <div
    v-if="loading || banners.length > 0"
    class="vendor-banner-slider relative w-full overflow-hidden rounded-xl shadow-lg mb-6"
  >
    <!-- Loading Skeleton -->
    <div
      v-if="loading"
      class="h-[200px] sm:h-[280px] md:h-[350px] w-full bg-gray-200 animate-pulse flex items-center justify-center"
    >
      <span class="sr-only">Yükleniyor...</span>
    </div>

    <!-- Banner Content -->
    <div
      v-else
      class="relative h-[200px] sm:h-[280px] md:h-[350px] w-full"
    >
      <!-- Banner Track -->
      <div
        class="banner-track flex h-full transition-transform duration-700 ease-in-out"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <div
          v-for="banner in banners"
          :key="banner.id"
          class="banner-slide flex-shrink-0 w-full h-full relative cursor-pointer"
          @click="handleBannerClick(banner)"
        >
          <NuxtImg
            :src="resolveImageUrl(banner.imageUrl)"
            :alt="'Vendor Banner'"
            class="w-full h-full object-cover"
            loading="lazy"
            format="webp"
            quality="75"
          />

          <!-- Gradient Overlay (Optional) -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>
      </div>

      <!-- Navigation Arrows -->
      <button
        v-if="banners.length > 1"
        class="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all z-10"
        @click.stop="prevSlide"
      >
        <ChevronLeftIcon class="h-5 w-5" />
      </button>
      <button
        v-if="banners.length > 1"
        class="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all z-10"
        @click.stop="nextSlide"
      >
        <ChevronRightIcon class="h-5 w-5" />
      </button>

      <!-- Dots -->
      <div
        v-if="banners.length > 1"
        class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10"
      >
        <button
          v-for="(banner, index) in banners"
          :key="'dot-' + banner.id"
          class="h-2 rounded-full transition-all duration-300 shadow-sm"
          :class="index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80 w-2'"
          @click.stop="goToSlide(index)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from '#imports'
import { useAppImage, useApi, navigateTo } from '#imports'
import ChevronLeftIcon from '@heroicons/vue/24/outline/ChevronLeftIcon'
import ChevronRightIcon from '@heroicons/vue/24/outline/ChevronRightIcon'

const props = defineProps({
    vendorId: {
        type: String,
        required: true
    }
})

const { resolveImageUrl } = useAppImage()
const { $api } = useApi()

const banners = ref([])
const currentIndex = ref(0)
const autoPlayInterval = ref(null)
const loading = ref(true)

const fetchBanners = async () => {
    if (!props.vendorId) return
    loading.value = true
    try {
        const data = await $api(`/api/vendor-banners/public/${props.vendorId}`)
        if (data.success) {
            banners.value = data.data
            if (banners.value.length > 1) {
                startAutoPlay()
            }
        }
    } catch (error) {
        console.error('Fetch vendor banners error:', error)
    } finally {
        loading.value = false
    }
}

const nextSlide = () => {
    if (banners.value.length === 0) return
    currentIndex.value = (currentIndex.value + 1) % banners.value.length
}

const prevSlide = () => {
    if (banners.value.length === 0) return
    currentIndex.value = (currentIndex.value - 1 + banners.value.length) % banners.value.length
}

const goToSlide = (index) => {
    currentIndex.value = index
}

const startAutoPlay = () => {
    stopAutoPlay()
    autoPlayInterval.value = setInterval(() => {
        nextSlide()
    }, 5000)
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

watch(() => props.vendorId, () => {
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
.banner-track {
    will-change: transform;
}

.banner-slide {
    min-width: 100%;
}
</style>
