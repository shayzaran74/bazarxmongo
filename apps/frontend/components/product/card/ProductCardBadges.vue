<template>
  <div class="absolute inset-0 pointer-events-none z-20">
    <!-- Top Left -->
    <div class="absolute top-4 left-4 flex flex-col gap-2">
      <TransitionGroup name="badge-fade">
        <div
          v-if="displayBadges?.topLeft"
          key="pos-top-left"
          :class="[displayBadges.topLeft.class || 'bg-primary-600 text-white', 'px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-lg flex items-center gap-1.5 border border-white/20 pointer-events-auto']"
          :style="displayBadges.topLeft.style as any"
        >
          <img v-if="displayBadges.topLeft.iconUrl" :src="displayBadges.topLeft.iconUrl" class="w-3 h-3 object-contain">
          <SparklesIcon v-else-if="shouldShowSparkle(displayBadges.topLeft.text)" class="w-3 h-3" />
          {{ displayBadges.topLeft.text }}
        </div>

        <SharedGhostBadge
          v-if="isSponsored"
          key="sponsored"
          variant="ghost"
          glow
          custom-class="!bg-indigo-600 !text-white px-3 py-1 text-[9px] gap-1.5 shadow-lg flex items-center pointer-events-auto"
        >
          <template #icon>
            <SparklesIcon class="w-3 h-3 animate-pulse" />
          </template>
          {{ $t('product.sponsored') }}
        </SharedGhostBadge>

        <SharedGhostBadge
          v-if="distance !== undefined && distance !== null"
          key="distance"
          variant="ghost"
          glow
          custom-class="!bg-white/90 dark:!bg-gray-900/90 !text-gray-900 dark:!text-white backdrop-blur-xl px-3 py-1 text-[9px] gap-1.5 shadow-lg flex items-center border-white/20 pointer-events-auto"
        >
          <template #icon>
            <MapPinIcon class="w-3 h-3 text-primary-500" />
          </template>
          {{ formattedDistance }}
        </SharedGhostBadge>
      </TransitionGroup>
    </div>

    <!-- Top Right -->
    <div class="absolute top-4 right-4 flex flex-col items-end gap-2">
      <div
        v-if="displayBadges?.topRight"
        :class="[displayBadges.topRight.class || 'bg-amber-500 text-white', 'px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-lg flex items-center gap-1.5 border border-white/20 pointer-events-auto']"
        :style="displayBadges.topRight.style as any"
      >
        {{ displayBadges.topRight.text }}
      </div>
      <slot name="favorite" />
    </div>

    <!-- Bottom Badges -->
    <div class="absolute inset-x-4 bottom-4 flex justify-between items-end pointer-events-none badges-bottom transition-opacity duration-300">
      <div v-if="displayBadges?.bottomLeft" :class="[displayBadges.bottomLeft.class || 'bg-sky-500 text-white', 'px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-lg border border-white/20']" :style="displayBadges.bottomLeft.style as any">
        {{ displayBadges.bottomLeft.text }}
      </div>
      <div v-if="displayBadges?.bottomRight" :class="[displayBadges.bottomRight.class || 'bg-rose-600 text-white', 'px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-lg border border-white/20']" :style="displayBadges.bottomRight.style as any">
        {{ displayBadges.bottomRight.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SparklesIcon from '@heroicons/vue/24/outline/SparklesIcon'
import MapPinIcon from '@heroicons/vue/24/outline/MapPinIcon'
import type { DynamicBadges } from '@barterborsa/shared-types'

const props = defineProps<{
  displayBadges: DynamicBadges
  isSponsored?: boolean
  distance?: number | null
}>()

const formattedDistance = computed(() => {
  if (props.distance === undefined || props.distance === null) return ''
  return props.distance < 1 
    ? (props.distance * 1000).toFixed(0) + 'm' 
    : props.distance.toFixed(1) + 'km'
})

const shouldShowSparkle = (text: string) => text.includes('Premium') || text.includes('Öne')
</script>

<style scoped>
.badge-fade-enter-active, .badge-fade-leave-active { transition: all 0.3s ease; }
.badge-fade-enter-from, .badge-fade-leave-to { opacity: 0; transform: translateX(-10px); }
</style>
