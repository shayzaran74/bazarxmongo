<template>
  <div class="space-y-12">
    <!-- Section: Özel Fırsatlar -->
    <div
      v-if="homeSettings.showSpecialOffers === 'true'"
      class="w-full bg-gradient-to-br from-rose-50 via-white to-orange-50 py-12 relative overflow-hidden rounded-[3rem] border border-rose-100 shadow-xl"
    >
      <div class="max-w-7xl mx-auto px-8 relative z-10">
        <div class="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-rose-600 text-white rounded-xl flex items-center justify-center shadow-xl rotate-3">
              <SparklesIcon class="h-6 w-6" />
            </div>
            <div>
              <h2 class="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-none uppercase italic">Özel Fırsat <span class="text-rose-600">Spotu</span></h2>
              <p class="text-gray-500 text-sm font-medium mt-1">Sadece sınırlı bir süre için seçili ürünlerde dev fırsatlar</p>
            </div>
          </div>
          <NuxtLink to="/products?isSpecialOffer=true" class="group flex items-center gap-2 px-6 py-3 bg-white border-2 border-rose-100 rounded-xl text-rose-600 font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">
            Tümünü Keşfet <ArrowRightIcon class="h-4 w-4" />
          </NuxtLink>
        </div>

        <div v-if="showcase.specialLoading" class="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div v-for="i in 6" :key="i" class="aspect-[3/4] bg-white/50 animate-pulse rounded-2xl border border-slate-100" />
        </div>
        <div v-else class="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <ProductCard
            v-for="(product, index) in showcase.specialOffers.slice(0, 6)"
            :key="product.id"
            :product="product"
            :badges="index === 0 ? { ...getBadges(product), topLeft: { text: 'Günün Fırsatı', class: 'bg-rose-600 text-white' } } : getBadges(product)"
            @click="navigateTo(getUrl(product))"
          />
        </div>
      </div>
    </div>

    <!-- Section: Performance Showcase -->
    <section v-if="homeSettings.showPerformanceShowcase !== 'false'" class="w-full bg-slate-50 py-16 relative overflow-hidden rounded-[3rem] border border-slate-200">
      <div class="max-w-7xl mx-auto px-8 relative z-10">
        <div class="mb-12">
          <h2 class="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Performans <span class="text-indigo-400">Vitrini</span></h2>
          <p class="text-slate-500 text-base font-medium mt-1">Platformun en çok ilgi gören ve güvenilen ürünlerini keşfedin.</p>
        </div>

        <!-- Showcase Categories -->
        <div class="space-y-16">
          <div v-for="cat in showcaseUnits" :key="cat.title" class="space-y-8">
            <div v-if="cat.items.length" class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div :class="['w-10 h-10 rounded-xl flex items-center justify-center shadow-lg', cat.iconBg]">
                  <component :is="cat.icon" :class="['h-5 w-5', cat.iconColor]" />
                </div>
                <h3 class="text-xl font-black text-black uppercase italic tracking-tight">{{ cat.title }}</h3>
              </div>
              <NuxtLink :to="cat.link" class="group flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                Hepsini Gör <ArrowRightIcon class="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </NuxtLink>
            </div>
            
            <div v-if="cat.items.length" class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              <ProductCard
                v-for="product in cat.items.slice(0, 6)"
                :key="product.id"
                :product="product"
                :badges="getBadges(product)"
                @click="navigateTo(getUrl(product))"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { SparklesIcon, ArrowRightIcon, FireIcon, EyeIcon, HeartIcon, ChatBubbleBottomCenterTextIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  showcase: Object,
  homeSettings: Object,
  getBadges: Function,
  getUrl: Function
})

const showcaseUnits = computed(() => [
  {
    title: 'En Çok Satanlar',
    items: props.showcase.bestSellers,
    icon: FireIcon,
    iconBg: 'bg-amber-100 shadow-amber-100/50',
    iconColor: 'text-amber-600',
    link: '/products?sort=sales_desc'
  },
  {
    title: 'Vazgeçilemeyenler',
    items: props.showcase.mostRepurchased,
    icon: ArrowPathIcon,
    iconBg: 'bg-emerald-100 shadow-emerald-100/50',
    iconColor: 'text-emerald-600',
    link: '/products'
  },
  {
    title: 'Trend Ürünler',
    items: props.showcase.mostVisited,
    icon: EyeIcon,
    iconBg: 'bg-blue-100 shadow-blue-100/50',
    iconColor: 'text-blue-600',
    link: '/products?sort=visits_desc'
  }
])
</script>
