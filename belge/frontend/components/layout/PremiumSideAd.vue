<template>
  <div
    v-if="ads && ads.length > 0"
    :class="[
      'hidden xl:flex flex-col gap-5 w-56 shrink-0 py-6 transition-all duration-700',
      side === 'left' ? 'pl-4 pr-2' : 'pr-4 pl-2'
    ]"
  >
    <!-- Ad Cards - rotates every 30 seconds -->
    <TransitionGroup
      :name="side === 'left' ? 'slide-left' : 'slide-right'"
      tag="div"
      class="relative"
    >
      <div
        v-for="(ad, index) in visibleAds"
        :key="ad.id || `ad-${rotationKey}-${index}`"
        class="relative w-full h-[560px] mb-4 last:mb-0"
      >
        <div
          :class="[
            'group absolute top-0 h-full w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-[1.5rem] border border-gray-200/60 dark:border-white/10 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)] overflow-hidden transition-all duration-500 ease-out hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.35)] z-10 hover:z-[100] hover:w-[210%]',
            side === 'left' ? 'left-0' : 'right-0'
          ]"
        >
          <!-- Premium Badge -->
          <div class="absolute top-3 left-3 z-20">
            <span
              class="px-2.5 py-1 bg-gray-900/10 dark:bg-white/10 backdrop-blur-md rounded-lg text-[8px] font-black text-gray-900 dark:text-white uppercase tracking-widest border border-white/20"
            >
              {{ ad.category || 'SPONSORLU' }}
            </span>
          </div>

          <!-- Rotation Indicator -->
          <div
            v-if="ads.length > maxVisible"
            class="absolute top-3 right-3 z-20"
          >
            <div class="flex items-center gap-1">
              <div
                v-for="dot in totalPages"
                :key="'dot-' + dot"
                :class="[
                  'w-1.5 h-1.5 rounded-full transition-all duration-500',
                  dot === currentPage
                    ? 'bg-white/90 scale-125 shadow-sm'
                    : 'bg-white/30'
                ]"
              />
            </div>
          </div>

          <!-- Image Area -->
          <div class="h-full w-full absolute inset-0">
            <img
              v-if="ad.image"
              :src="resolveImageUrl(ad.image)"
              :alt="ad.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
            >
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-gray-50 to-gray-200"
            >
              {{ ad.emoji || '🎁' }}
            </div>
            <div
              class="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"
            />
          </div>

          <!-- Content -->
          <div class="absolute bottom-0 inset-x-0 p-5 text-white z-20">
            <h4 class="text-base font-black leading-tight mb-2 line-clamp-2 drop-shadow-lg">
              {{ ad.title }}
            </h4>
            <p
              v-if="ad.subtitle"
              class="text-[11px] opacity-90 mb-4 line-clamp-1 italic drop-shadow-md"
            >
              {{
                ad.subtitle }}
            </p>
            <button
              class="w-full py-3 bg-white text-gray-900 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-primary-600 hover:text-white transition-all shadow-xl active:scale-95"
              @click="handleClick(ad.link)"
            >
              İncele
            </button>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, useAppImage, navigateTo } from '#imports'

const props = defineProps({
    side: {
        type: String,
        default: 'right'
    },
    ads: {
        type: Array,
        default: () => []
    }
})

const { resolveImageUrl } = useAppImage()

// Rotation logic
const maxVisible = 2 // Show max 2 ads at a time per side
const rotationOffset = ref(0)
const rotationKey = ref(0)
let rotationTimer = null

const totalPages = computed(() => {
    if (!props.ads || props.ads.length <= maxVisible) return 1
    return Math.ceil(props.ads.length / maxVisible)
})

const currentPage = computed(() => {
    if (totalPages.value <= 1) return 1
    return (rotationOffset.value % totalPages.value) + 1
})

const visibleAds = computed(() => {
    if (!props.ads || props.ads.length === 0) return []
    if (props.ads.length <= maxVisible) return props.ads

    const startIdx = (rotationOffset.value * maxVisible) % props.ads.length
    const result = []
    for (let i = 0; i < maxVisible; i++) {
        const idx = (startIdx + i) % props.ads.length
        result.push(props.ads[idx])
    }
    return result
})

const startRotation = () => {
    if (rotationTimer) clearInterval(rotationTimer)

    rotationTimer = setInterval(() => {
        if (props.ads && props.ads.length > maxVisible) {
            rotationOffset.value++
            rotationKey.value++
        }
    }, 30000) // 30 seconds
}

onMounted(() => {
    startRotation()
})

onUnmounted(() => {
    if (rotationTimer) {
        clearInterval(rotationTimer)
        rotationTimer = null
    }
})

// Restart rotation when ads change
watch(() => props.ads, () => {
    rotationOffset.value = 0
    rotationKey.value++
    startRotation()
}, { deep: true })

const handleClick = (link) => {
    if (link) {
        navigateTo(link)
    }
}
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Slide transitions for left side */
.slide-left-enter-active,
.slide-left-leave-active {
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
}

.slide-left-leave-to {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
}

/* Slide transitions for right side */
.slide-right-enter-active,
.slide-right-leave-active {
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-right-enter-from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
}

.slide-right-leave-to {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
}
</style>
