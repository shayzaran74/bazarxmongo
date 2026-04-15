<template>
  <div class="home-banner relative w-full h-[500px] lg:h-[650px] overflow-hidden rounded-[3rem] shadow-2xl">
    <div v-if="banners.length" class="h-full flex transition-transform duration-700 ease-out" :style="{ transform: `translateX(-${activeIndex * 100}%)` }">
      <div v-for="(banner, idx) in banners" :key="idx" class="w-full h-full flex-shrink-0 relative group">
        <!-- Image with subtle zoom on hover -->
        <img :src="banner.image" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
        
        <!-- Overlay -->
        <div class="absolute inset-0 bg-gradient-to-r from-dark-950/80 via-dark-950/40 to-transparent flex items-center">
          <div class="container mx-auto px-12 lg:px-24 space-y-6 lg:space-y-8 max-w-4xl">
            <div class="space-y-2 lg:space-y-4">
              <span class="text-xs lg:text-sm font-black text-primary-500 uppercase tracking-[0.4em] animate-fade-in-up">
                {{ banner.subtitle || 'BazarX Fırsatları' }}
              </span>
              <h2 class="text-5xl lg:text-8xl font-display font-black text-white italic tracking-tighter leading-[0.8] animate-fade-in-up delay-100">
                {{ banner.title }}
              </h2>
            </div>
            
            <div v-if="banner.link" class="animate-fade-in-up delay-200">
              <NuxtLink :to="banner.link">
                <UiButton size="lg" class="group">
                  Detayları Gör
                  <Icon name="heroicons:arrow-right" class="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
                </UiButton>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Controls -->
    <div v-if="banners.length > 1" class="absolute bottom-12 right-12 flex items-center gap-4 z-10">
      <button @click="prev" class="p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all">
        <Icon name="heroicons:chevron-left" class="w-6 h-6" />
      </button>
      <div class="flex gap-2">
        <button 
          v-for="(_, idx) in banners" 
          :key="idx" 
          @click="activeIndex = idx"
          :class="['w-2 h-2 rounded-full transition-all', activeIndex === idx ? 'bg-primary-600 w-8' : 'bg-white/30']"
        />
      </div>
      <button @click="next" class="p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all">
        <Icon name="heroicons:chevron-right" class="w-6 h-6" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Banner } from '~/types/catalog'

const props = defineProps<{
  banners: Banner[]
}>()

const activeIndex = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function next() {
  activeIndex.value = (activeIndex.value + 1) % props.banners.length
}

function prev() {
  activeIndex.value = (activeIndex.value - 1 + props.banners.length) % props.banners.length
}

onMounted(() => {
  timer = setInterval(next, 5000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
