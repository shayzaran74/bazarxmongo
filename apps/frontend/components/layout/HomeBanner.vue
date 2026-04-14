<template>
  <div v-if="banners.length > 0" class="home-banner-slider relative w-full overflow-hidden group/slider bg-dark-950 rounded-[2.5rem] shadow-2xl">
    <!-- Banner Container -->
    <div
      class="banner-track flex transition-transform duration-[1000ms] cubic-bezier(0.16, 1, 0.3, 1)"
      :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
    >
      <div
        v-for="(banner, index) in banners"
        :key="banner.id"
        class="banner-slide flex-shrink-0 w-full relative h-[400px] lg:h-[500px] cursor-pointer"
      >
        <!-- Image with slow zoom -->
        <img
          :src="resolveImageUrl(banner.imageUrl, 'banner')"
          class="w-full h-full object-cover transition-transform duration-[8000ms] ease-out"
          :style="{ transform: currentIndex === index ? 'scale(1.1)' : 'scale(1.0)' }"
        />
        
        <!-- Overlays -->
        <div class="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-dark-950/20 to-transparent" />
        <div class="absolute inset-0 bg-gradient-to-r from-dark-950/40 via-transparent to-transparent" />

        <!-- Content -->
        <div class="absolute inset-0 flex items-center px-10 lg:px-20">
          <div class="max-w-2xl transform transition-all duration-1000" :class="currentIndex === index ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'">
            <span class="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-600 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              {{ banner.subtitle || 'Öne Çıkan' }}
            </span>
            <h2 class="text-4xl lg:text-7xl font-display font-black text-white italic leading-none mb-6 tracking-tighter shadow-sm">
              {{ banner.title }}
            </h2>
            <p class="text-gray-300 text-sm lg:text-lg font-medium max-w-lg mb-8 line-clamp-2">
              {{ banner.description }}
            </p>
            <button class="px-10 py-4 bg-white text-dark-950 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary-500 hover:text-white transition-all duration-300 shadow-xl active:scale-95">
              Hemen Keşfet
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Dots -->
    <div v-if="banners.length > 1" class="absolute bottom-10 left-10 lg:left-20 flex space-x-3 z-10">
       <button
         v-for="(_, index) in banners"
         :key="index"
         @click="currentIndex = index"
         class="h-1.5 rounded-full transition-all duration-500"
         :class="index === currentIndex ? 'w-12 bg-white' : 'w-3 bg-white/20 hover:bg-white/40'"
       />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  ecosystem?: string;
}>();

const { resolveImageUrl } = useAppImage();
const banners = ref<any[]>([]);
const currentIndex = ref(0);

// Mock banners if none found
onMounted(async () => {
    // In a real app, fetch from API. 
    // Here we use mock data for "wow" effect if API is not yet seeded
    banners.value = [
      {
        id: '1',
        title: 'TICARI TAKASTA YENI NESIL',
        description: 'İşletmenizin atıl stoklarını saniyeler içinde nakde dönüştürün veya ihtiyacınız olan ürünlerle takas edin.',
        imageUrl: '/images/banner-1.jpg',
        subtitle: 'GELECEĞİN TİCARETİ'
      },
      {
        id: '2',
        title: 'PREMIUM AVANTAJLARI',
        description: 'BazarX Premium ile komisyon oranlarında %50 indirim ve VIP destek ayrıcalıklarından hemen faydalanın.',
        imageUrl: '/images/banner-2.jpg',
        subtitle: 'EXTREME FIRSAT'
      }
    ];

    setInterval(() => {
      currentIndex.value = (currentIndex.value + 1) % banners.value.length;
    }, 6000);
});
</script>

<style scoped>
.banner-track {
  will-change: transform;
}
</style>
