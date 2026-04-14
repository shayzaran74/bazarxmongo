<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Hero Banner (Large Highlight) -->
    <div class="relative bg-indigo-900 overflow-hidden h-64 md:h-[400px]">
      <div class="absolute inset-0 opacity-40">
        <!-- Abstract gradient background -->
        <div class="absolute inset-0 bg-gradient-to-br from-primary-600 via-indigo-900 to-purple-800 animate-pulse" />
      </div>

      <div class="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-center items-start z-10">
        <span
          class="bg-amber-400 text-amber-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4 animate-bounce"
        >
          Öne Çıkan Kampanya 🚀
        </span>
        <h1 class="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter italic uppercase leading-none">
          ELEKTRONİKTE <br>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">BÜYÜK FIRSAT</span>
        </h1>
        <p class="text-indigo-100 text-lg md:text-xl font-medium max-w-xl mb-8 leading-tight">
          Yüzlerce teknolojik üründe sepette %30'a varan indirimleri kaçırmayın!
        </p>
        <NuxtLink
          to="/products?filter=elektronik"
          class="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all transform hover:scale-105 active:scale-95 shadow-xl"
        >
          FIRSATI YAKALA ✨
        </NuxtLink>
      </div>

      <!-- Decorative icon for hero -->
      <div
        class="absolute right-0 bottom-0 top-0 w-1/3 hidden lg:flex items-center justify-center opacity-20 transform rotate-12 translate-x-10"
      >
        <RocketLaunchIcon class="w-full h-full text-white" />
      </div>
    </div>

    <!-- Campaign Categories / Filters -->
    <div class="sticky top-16 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center space-x-2 py-4 overflow-x-auto no-scrollbar">
          <button
            v-for="cat in categories"
            :key="cat.id"
            :class="[
              'px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-tighter whitespace-nowrap transition-all border',
              activeCategory === cat.id
                ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-200'
                : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200 hover:bg-gray-50'
            ]"
            @click="activeCategory = cat.id"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>
    </div>

    <!-- Campaign Grid -->
    <div class="max-w-7xl mx-auto px-4 mt-8 lg:mt-12">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-2xl lg:text-3xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">
            {{ activeCategoryName }} KAMPANYALARI
          </h2>
          <p class="text-gray-500 text-sm font-medium mt-1 uppercase tracking-widest">
            {{ filteredCampaigns.length }}
            Aktif Fırsat
          </p>
        </div>

        <div class="flex items-center space-x-2 text-xs font-black text-gray-400 uppercase tracking-widest">
          <ClockIcon class="h-4 w-4" />
          <span>FIRSATLAR SINIRLI SÜRELİDİR</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        <div
          v-for="campaign in filteredCampaigns"
          :key="campaign.id"
          class="group relative bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500 flex flex-col"
        >
          <!-- Campaign Image/Gradient Area -->
          <div :class="['h-48 relative overflow-hidden', campaign.bgClass]">
            <div class="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
            <!-- Badge -->
            <div class="absolute top-6 left-6 z-10">
              <span
                class="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg"
              >
                {{ campaign.badge }}
              </span>
            </div>

            <component
              :is="campaign.icon"
              class="absolute -right-4 -bottom-4 h-32 w-32 text-white/20 transform -rotate-12 transition-transform duration-700 group-hover:scale-125 group-hover:rotate-0"
            />

            <!-- Countdown placeholder -->
            <div
              class="absolute bottom-4 left-6 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20"
            >
              <div class="flex items-center space-x-2 text-white text-[10px] font-black uppercase tracking-tighter">
                <div class="flex flex-col items-center">
                  <span>{{ campaign.daysLeft }}</span>
                  <span class="opacity-60 text-[8px]">GÜN</span>
                </div>
                <span class="opacity-40">:</span>
                <div class="flex flex-col items-center">
                  <span>14</span>
                  <span class="opacity-60 text-[8px]">SAAT</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="p-8 flex flex-col flex-1">
            <h3
              class="text-xl font-black text-gray-900 mb-3 tracking-tighter uppercase italic leading-none group-hover:text-primary-600 transition-colors"
            >
              {{ campaign.title }}
            </h3>
            <p class="text-gray-500 font-medium text-sm leading-relaxed mb-8 flex-1">
              {{ campaign.description }}
            </p>

            <div class="flex items-center justify-between mt-auto">
              <div class="flex flex-col">
                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kampanya</span>
                <span class="text-xs font-bold text-gray-900 uppercase tracking-tighter italic">{{ campaign.startDate
                }}</span>
              </div>

              <div
                v-if="campaign.price"
                class="text-right"
              >
                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Ürün Fiyatı</span>
                <span class="text-lg font-black text-primary-600 tracking-tighter">{{ campaign.price }}</span>
              </div>

              <NuxtLink
                :to="campaign.link"
                class="bg-gray-50 text-gray-900 group-hover:bg-primary-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary-100 px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all flex items-center"
              >
                KEŞFET
                <ArrowRightIcon class="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Premium Special Section -->
    <div class="max-w-7xl mx-auto px-4 mt-20">
      <div
        class="relative bg-gradient-to-br from-amber-400 to-orange-500 rounded-[3rem] p-8 lg:p-12 overflow-hidden shadow-2xl shadow-orange-100"
      >
        <div class="absolute top-0 right-0 p-8 opacity-10 transform scale-150">
          <StarIcon class="h-64 w-64 text-white fill-current" />
        </div>

        <div class="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div class="text-center lg:text-left">
            <span
              class="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block"
            >
              Premium Ayrıcalığı 💎
            </span>
            <h2 class="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase italic leading-none mb-4">
              PREMİUM ÜYELERİNE <br>
              <span class="text-amber-900">EKSTRA %10 İNDİRİM</span>
            </h2>
            <p class="text-amber-950 font-bold text-lg max-w-xl opacity-80">
              TicariTakas Premium ile kargo bedava ayrıcalığının yanı sıra, tüm kampanyalı ürünlerde ekstra
              indirimlerden yararlanın.
            </p>
          </div>

          <NuxtLink
            to="/premium"
            class="bg-white text-orange-600 px-10 py-5 rounded-[2rem] font-black text-xs tracking-widest uppercase hover:bg-amber-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95"
          >
            PREMİUM'LU OL ✨
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  RocketLaunchIcon,
  ClockIcon,
  ArrowRightIcon,
  StarIcon,
  DevicePhoneMobileIcon,
  SparklesIcon,
  ShoppingBagIcon,
  FireIcon,
  TagIcon,
  GiftIcon
} from '@heroicons/vue/24/outline'

useHead({
  title: 'Kampanyalar & Fırsatlar - TicariTakas',
  meta: [
    { name: 'description', content: 'TicariTakas Kampanyalar sayfasında en güncel indirimleri, kuponları ve özel fırsatları keşfedin.' }
  ]
})

const activeCategory = ref('all')

const categories = [
  { id: 'all', name: 'Tüm Kampanyalar' },
  { id: 'women_ent', name: 'Girişimci Kadınlar' },
  { id: 'tech', name: 'Elektronik' },
  { id: 'fashion', name: 'Moda' },
  { id: 'cosmetic', name: 'Kozmetik & Bakım' },
  { id: 'home', name: 'Ev & Yaşam' }
]

const activeCategoryName = computed(() => {
  return categories.find(c => c.id === activeCategory.value)?.name || 'Tüm'
})

const allCampaigns = [
  {
    id: 1,
    category: 'women_ent',
    title: 'Girişimci Kadınlar Projesi',
    description: 'Kadın girişimcilerin el emeği ve yerli üretim ürünlerinde özel fırsatlar sizi bekliyor.',
    badge: 'KADIN GÜCÜ 💜',
    startDate: 'Devam Ediyor',
    daysLeft: 30,
    icon: SparklesIcon,
    bgClass: 'bg-gradient-to-br from-purple-600 to-indigo-700',
    link: '/products'
  },
  {
    id: 2,
    category: 'tech',
    title: 'Asus Vivobook 15 X1504VA',
    description: 'Intel Core 5 120U, 8GB RAM, 512GB SSD. Peşin fiyatına 9 x 2.555 TL taksit fırsatıyla!',
    price: '22.999 TL',
    badge: '9 TAKSİT',
    startDate: 'OCAK FIRSATI',
    daysLeft: 5,
    icon: DevicePhoneMobileIcon,
    bgClass: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    link: '/products'
  },
  {
    id: 3,
    category: 'cosmetic',
    title: 'D&P Marka Parfümlerde',
    description: 'Tüm D&P parfümlerinde geçerli 2. Ürüne %50 İndirim! Fırsatı kaçırmayın.',
    badge: '%50 İNDİRİM',
    startDate: 'SINIRLI SÜRE',
    daysLeft: 3,
    icon: ShoppingBagIcon,
    bgClass: 'bg-gradient-to-br from-pink-500 to-rose-600',
    link: '/products'
  },
  {
    id: 4,
    category: 'tech',
    title: 'Huawei Freeclip 2',
    description: 'Lansmana Özel Kupon Fırsatı! Yeni nesil kulaklık deneyimini indirimle yaşayın.',
    badge: 'KUPON FIRSATI',
    startDate: 'LANSMAN',
    daysLeft: 7,
    icon: FireIcon,
    bgClass: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    link: '/products'
  },
  {
    id: 5,
    category: 'home',
    title: 'Monopoly Kutu Oyunlarında',
    description: 'Sepette %15 net İndirim! Ailecek eğlencenin tadını indirimli çıkarın.',
    badge: 'NET %15',
    startDate: 'OCAK',
    daysLeft: 10,
    icon: GiftIcon,
    bgClass: 'bg-gradient-to-br from-amber-500 to-orange-600',
    link: '/products'
  },
  {
    id: 6,
    category: 'tech',
    title: 'Lenovo LOQ AMD Ryzen 7',
    description: 'RTX4050 Ekran Kartı, 16GB RAM. Peşin fiyatına 9 x 4.444 TL özel fiyat!',
    price: '39.999 TL',
    badge: 'OYUNCU ÖZEL',
    startDate: 'STOKLARLA SINIRLI',
    daysLeft: 2,
    icon: FireIcon,
    bgClass: 'bg-gradient-to-br from-gray-700 to-gray-900',
    link: '/products'
  },
  {
    id: 7,
    category: 'tech',
    title: 'HONOR Magic 8 Lite 5G',
    description: 'Ek 4000 TL Kupon Fırsatı! Kartsız 3 x 10.058 TL ödeme seçeneğiyle.',
    price: '25.999 TL',
    badge: '4000 TL KUPON',
    startDate: 'YENİ ÜRÜN',
    daysLeft: 4,
    icon: DevicePhoneMobileIcon,
    bgClass: 'bg-gradient-to-br from-green-600 to-teal-700',
    link: '/products'
  },
  {
    id: 8,
    category: 'cosmetic',
    title: 'Bargello Parfümlerde',
    description: 'Bargello seçimlerinizde 2. Ürüne anında 200 TL İndirim sizi bekliyor.',
    badge: '200 TL İNDİRİM',
    startDate: 'OCAK',
    daysLeft: 6,
    icon: TagIcon,
    bgClass: 'bg-gradient-to-br from-purple-500 to-fuchsia-600',
    link: '/products'
  },
  {
    id: 9,
    category: 'home',
    title: 'Cybex Bebek Gereçleri',
    description: 'Dünyaca ünlü Cybex markalı araç gereçlerde sepette %40\'a varan indirim.',
    badge: '%40 İNDİRİM',
    startDate: 'MODA & BEBEK',
    daysLeft: 8,
    icon: ShoppingBagIcon,
    bgClass: 'bg-gradient-to-br from-sky-500 to-indigo-600',
    link: '/products'
  },
  {
    id: 10,
    category: 'fashion',
    title: 'İryum Altın Takılarda',
    description: 'Seçili İryum özel tasarım altın takılarda sepette net %40 indirim fırsatı.',
    badge: '%40 İNDİRİM',
    startDate: 'ÖZEL GÜN',
    daysLeft: 15,
    icon: StarIcon,
    bgClass: 'bg-gradient-to-br from-amber-600 to-yellow-700',
    link: '/products'
  },
  {
    id: 11,
    category: 'cosmetic',
    title: 'Siveno Kişisel Bakım',
    description: 'Doğal içerikli Siveno ürünlerinde sepette net %50 indirim. Kaçırmayın!',
    badge: '%50 İNDİRİM',
    startDate: 'DOĞAL YAŞAM',
    daysLeft: 12,
    icon: SparklesIcon,
    bgClass: 'bg-gradient-to-br from-emerald-400 to-green-600',
    link: '/products'
  }
]

const filteredCampaigns = computed(() => {
  if (activeCategory.value === 'all') return allCampaigns
  return allCampaigns.filter(c => c.category === activeCategory.value)
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
