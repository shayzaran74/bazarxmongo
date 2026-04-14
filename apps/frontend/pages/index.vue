<template>
  <div class="h-full space-y-12 pb-20">
    <!-- Premium Home Banner -->
    <LayoutHomeBanner ecosystem="BAZARX" />

    <!-- Feature Categories (Quick Access) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
       <div v-for="(feat, index) in features" :key="index" 
            class="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden relative">
          <div class="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div class="relative z-10">
             <div class="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-600 transition-colors duration-500">
                <Icon :name="feat.icon" class="w-7 h-7 text-primary-600 group-hover:text-white transition-colors duration-500" />
             </div>
             <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{{ feat.label }}</h3>
             <p class="text-lg font-display font-black text-dark-950 italic leading-none">{{ feat.title }}</p>
          </div>
       </div>
    </div>

    <!-- Stats Grid (from previous design but improved) -->
    <div class="bg-dark-950 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden shadow-2xl">
       <div class="absolute inset-0 bg-mesh opacity-10" />
       <div class="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-12">
          <div v-for="(stat, index) in stats" :key="index" class="text-center lg:text-left">
             <div class="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] mb-4">{{ stat.label }}</div>
             <div class="text-5xl lg:text-6xl font-display font-black text-white italic tracking-tighter">{{ stat.value }}</div>
          </div>
       </div>
    </div>

    <!-- Product Sections (Placeholders for now) -->
    <div class="space-y-8">
       <div class="flex items-center justify-between px-2">
          <h2 class="text-3xl font-display font-black text-dark-950 italic tracking-tighter">Yeni Fırsatlar</h2>
          <NuxtLink to="/products" class="text-xs font-black text-primary-600 uppercase tracking-widest hover:underline">Tümünü Gör</NuxtLink>
       </div>
       <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <div v-for="i in 5" :key="i" class="bg-gray-50 rounded-[2rem] h-[350px] animate-pulse" />
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();

const stats = [
  { label: 'Aktif Üye', value: '1.2K+' },
  { label: 'Takas Havuzu', value: '450+' },
  { label: 'Güvenli Takas', value: '%100' },
  { label: 'Yapay Zeka', value: 'Pro' },
];

const features = [
  { label: 'Hızlı İşlem', title: 'Acil Takas', icon: 'heroicons:bolt' },
  { label: 'Kurumsal', title: 'Ticari Partner', icon: 'heroicons:building-office-2' },
  { label: 'Güvenlik', title: 'Escrow Ödeme', icon: 'heroicons:shield-check' },
  { label: 'Analiz', title: 'Akıllı Eşleşme', icon: 'heroicons:presentation-chart-line' },
];
</script>
