<template>
  <div
    v-if="displayedAds && displayedAds.length > 0"
    :class="[
      'hidden xl:flex flex-col gap-4 w-56 shrink-0 py-6 transition-all duration-700',
      side === 'left' ? 'pl-4 pr-2' : 'pr-4 pl-2'
    ]"
  >
    <!-- Tüm reklamlar görünür — 10s'de bir en alt en üste gelir -->
    <TransitionGroup name="conveyor" tag="div" class="flex flex-col gap-4">
      <div
        v-for="ad in displayedAds"
        :key="ad.id"
        class="relative w-full h-[560px] flex-shrink-0"
      >
        <div
          :class="[
            'group absolute top-0 h-full w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-[1.5rem] border border-gray-200/60 dark:border-white/10 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)] overflow-hidden transition-all duration-500 ease-out hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.35)] z-10 hover:z-[100] hover:w-[210%]',
            side === 'left' ? 'left-0' : 'right-0'
          ]"
        >
          <!-- Premium Badge -->
          <div class="absolute top-3 left-3 z-20">
            <span class="px-2.5 py-1 bg-gray-900/10 dark:bg-white/10 backdrop-blur-md rounded-lg text-[8px] font-black text-gray-900 dark:text-white uppercase tracking-widest border border-white/20">
              {{ ad.category || 'SPONSORLU' }}
            </span>
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
            <div class="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
          </div>

          <!-- Content -->
          <div class="absolute bottom-0 inset-x-0 p-4 text-white z-20">
            <h4 class="text-sm font-black leading-tight mb-1.5 line-clamp-2 drop-shadow-lg">
              {{ ad.title }}
            </h4>
            <p v-if="ad.subtitle" class="text-[10px] opacity-90 mb-3 line-clamp-1 italic drop-shadow-md">
              {{ ad.subtitle }}
            </p>
            <button
              class="w-full py-2.5 bg-white text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 hover:text-white transition-all shadow-xl active:scale-95"
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
import { ref, watch, onMounted, onUnmounted, useAppImage, navigateTo } from '#imports'

const props = defineProps({
  side: { type: String, default: 'right' },
  ads: { type: Array, default: () => [] }
})

const { resolveImageUrl } = useAppImage()

// Tüm reklamlar gösterilir — sınır yok, footer'a kadar uzar
const displayedAds = ref([])

watch(() => props.ads, (newAds) => {
  displayedAds.value = [...newAds]
}, { immediate: true, deep: true })

let rotationTimer = null

// 10s'de bir: en alttaki reklam en üste gelir
const rotateUp = () => {
  if (displayedAds.value.length <= 1) return
  const last = displayedAds.value[displayedAds.value.length - 1]
  displayedAds.value = [last, ...displayedAds.value.slice(0, -1)]
}

const startRotation = () => {
  stopRotation()
  if (displayedAds.value.length > 1) {
    rotationTimer = setInterval(rotateUp, 10000)
  }
}

const stopRotation = () => {
  if (rotationTimer) {
    clearInterval(rotationTimer)
    rotationTimer = null
  }
}

watch(() => props.ads, () => {
  startRotation()
}, { deep: true })

onMounted(startRotation)
onUnmounted(stopRotation)

const handleClick = (link) => {
  if (link) navigateTo(link)
}
</script>

<style scoped>
/* En alttaki kart yukarı kayarak listenin başına geçer */
.conveyor-move {
  transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.conveyor-enter-active {
  transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.conveyor-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  width: 100%;
}

/* Yeni gelen (en üste çıkan) kart aşağıdan yukarı kayar */
.conveyor-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}

/* Giden (en alttan çıkan) kart aşağıya doğru kaybolur */
.conveyor-leave-to {
  opacity: 0;
  transform: translateY(60px) scale(0.95);
}

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
</style>
