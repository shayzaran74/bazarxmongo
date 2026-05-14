<template>
  <div
    v-if="activeAnnouncements.length > 0"
    class="bg-primary-600 text-white overflow-hidden relative z-50 shadow-sm"
  >
    <div class="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center relative min-h-[40px]">
      <div class="flex items-center gap-3 animate-fade-in transition-all duration-500">
        <MegaphoneIcon class="h-4 w-4 flex-shrink-0" />
        <p class="text-[10px] md:text-xs font-black tracking-widest uppercase">
          <span class="opacity-75 mr-2">{{ activeAnnouncements[currentAnnouncementIndex].title }}:</span>
          <span>{{ activeAnnouncements[currentAnnouncementIndex].content }}</span>
          <NuxtLink
            v-if="activeAnnouncements[currentAnnouncementIndex].linkUrl"
            :to="activeAnnouncements[currentAnnouncementIndex].linkUrl"
            class="ml-2 underline hover:text-primary-100 italic transition-colors"
          >
            {{ activeAnnouncements[currentAnnouncementIndex].linkText || $t('common.details') }} →
          </NuxtLink>
        </p>
      </div>

      <!-- Dots indicator for multiple announcements -->
      <div
        v-if="activeAnnouncements.length > 1"
        class="absolute right-4 hidden md:flex items-center gap-1.5"
      >
        <button
          v-for="(_, index) in activeAnnouncements"
          :key="index"
          class="w-1.5 h-1.5 rounded-full transition-all duration-300"
          :class="currentAnnouncementIndex === index ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/60'"
          @click="currentAnnouncementIndex = index; resetTimer()"
        />
      </div>

      <!-- Navigation Arrows for Mobile/Desktop -->
      <div
        v-if="activeAnnouncements.length > 1"
        class="hidden sm:flex absolute left-4 items-center gap-2"
      >
        <button
          class="p-1 hover:bg-primary-700/50 rounded-full transition-colors"
          @click="prevAnnouncement"
        >
          <ChevronLeftIcon class="h-3 w-3" />
        </button>
        <button
          class="p-1 hover:bg-primary-700/50 rounded-full transition-colors"
          @click="nextAnnouncement"
        >
          <ChevronRightIcon class="h-3 w-3" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, useI18n, useApi } from '#imports'
import MegaphoneIcon from '@heroicons/vue/24/outline/MegaphoneIcon'
import ChevronLeftIcon from '@heroicons/vue/24/outline/ChevronLeftIcon'
import ChevronRightIcon from '@heroicons/vue/24/outline/ChevronRightIcon'

const props = defineProps({
  page: {
    type: String,
    default: 'all'
  }
})

const { locale } = useI18n()
const activeAnnouncements = ref([])
const currentAnnouncementIndex = ref(0)
let announcementTimer = null

const fetchAnnouncements = async () => {
  try {
    const data = await useApi().$api(`/api/dynamic/announcements?page=${props.page}&locale=${locale.value}`)
    if (data?.success || Array.isArray(data)) {
      activeAnnouncements.value = Array.isArray(data) ? data : data.data || []
      if (activeAnnouncements.value.length > 1) {
        startAnnouncementRotation()
      }
    }
  } catch (e) {
    console.error('Announcements error:', e)
  }
}

watch(locale, () => {
  fetchAnnouncements()
})

const startAnnouncementRotation = () => {
  stopAnnouncementRotation()
  announcementTimer = setInterval(() => {
    nextAnnouncement()
  }, 5000)
}

const stopAnnouncementRotation = () => {
  if (announcementTimer) clearInterval(announcementTimer)
}

const resetTimer = () => {
  startAnnouncementRotation()
}

const nextAnnouncement = () => {
  currentAnnouncementIndex.value = (currentAnnouncementIndex.value + 1) % activeAnnouncements.value.length
}

const prevAnnouncement = () => {
  currentAnnouncementIndex.value = (currentAnnouncementIndex.value - 1 + activeAnnouncements.value.length) % activeAnnouncements.value.length
}

onMounted(() => {
  fetchAnnouncements()
})

onUnmounted(() => {
  stopAnnouncementRotation()
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
