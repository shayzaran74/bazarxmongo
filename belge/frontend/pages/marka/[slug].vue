<template>
  <div class="min-h-screen bg-[#F8FAFC]">
    <!-- Brand Header Section -->
    <div class="relative pt-24 pb-16 overflow-hidden">
      <!-- Background Abstract Elements -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
        <div
          class="absolute top-[10%] left-[10%] w-72 h-72 bg-primary-200 rounded-full blur-[120px] animate-pulse"
        />
        <div
          class="absolute bottom-[20%] right-[10%] w-96 h-96 bg-blue-200 rounded-full blur-[140px] animate-pulse"
          style="animation-delay: 1s;"
        />
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          v-if="loading"
          class="animate-pulse"
        >
          <div class="h-12 w-48 bg-gray-200 rounded mb-4" />
          <div class="h-6 w-96 bg-gray-200 rounded" />
        </div>

        <div
          v-else-if="brand"
          class="flex flex-col md:flex-row items-center gap-8 md:gap-12 animate-fade-in"
        >
          <!-- Brand Logo/Icon -->
          <div class="relative group">
            <div
              class="w-32 h-32 md:w-48 md:h-48 rounded-3xl bg-white shadow-2xl shadow-primary-500/10 flex items-center justify-center p-6 border border-white/50 backdrop-blur-sm transform transition-transform duration-500 group-hover:scale-105"
            >
              <img
                v-if="brand.icon"
                :src="brand.icon"
                :alt="brand.name"
                class="w-full h-full object-contain"
              >
              <span
                v-else
                class="text-4xl md:text-6xl font-black text-primary-600"
              >{{
                brand.name.charAt(0) }}</span>
            </div>
            <!-- Official Badge -->
            <div
              v-if="brand.isOfficial"
              class="absolute -top-3 -right-3 bg-white p-1.5 rounded-full shadow-lg border border-primary-50 flex items-center justify-center"
              title="Resmi Distribütör"
            >
              <div class="bg-primary-600 rounded-full p-1">
                <CheckBadgeIcon class="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          <!-- Brand Info -->
          <div class="flex-1 text-center md:text-left">
            <div
              class="inline-flex items-center px-3 py-1 rounded-full bg-primary-50 border border-primary-100 mb-4"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-primary-600 mr-2 animate-ping" />
              <span class="text-xs font-bold text-primary-700 tracking-wider uppercase">Onaylı
                Marka</span>
            </div>

            <h1 class="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-4">
              {{ brand.name }}
            </h1>

            <p class="text-lg text-slate-600 max-w-2xl leading-relaxed mb-6">
              {{ brand.description || `${brand.name} markasına ait en yeni ve en kaliteli ürünleri
                            keşfedin. TicariTakas güvencesiyle ticari ihtiyaçlarınız için en iyi çözümler.` }}
            </p>

            <div class="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <div class="flex flex-col items-center md:items-start">
                <span class="text-2xl font-black text-slate-900">{{ brand.productCount || 0 }}</span>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Ürün</span>
              </div>
              <div class="w-px h-8 bg-slate-200 mx-2" />
              <div class="flex flex-col items-center md:items-start">
                <span class="text-2xl font-black text-slate-900">{{ brand.popularityScore || 0 }}</span>
                <span
                  class="text-xs font-bold text-slate-400 uppercase tracking-widest"
                >Görüntülenme</span>
              </div>
              <div class="w-px h-8 bg-slate-200 mx-2" />
              <div class="flex flex-col items-center md:items-start">
                <div class="flex items-center text-primary-600 font-black text-2xl">
                  <span>{{ formatRating(4.8) }}</span>
                  <StarIcon class="h-5 w-5 ml-1" />
                </div>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Marka
                  Puanı</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Products Grid -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      <div class="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 class="text-3xl font-black text-slate-900 tracking-tight">
            Öne Çıkan Ürünler
          </h2>
          <p class="text-slate-500 mt-1">
            En çok tercih edilen {{ brand?.name }} ürünleri
          </p>
        </div>
        <div class="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <button
            v-for="cat in mockCategories"
            :key="cat"
            class="whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all"
            :class="activeCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <div
        v-if="loading"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        <div
          v-for="i in 4"
          :key="i"
          class="bg-gray-200 h-96 rounded-2xl animate-pulse"
        />
      </div>

      <div
        v-else-if="brand && brand.topProducts?.length"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8"
      >
        <ProductCard
          v-for="product in brand.topProducts"
          :key="product.id"
          :product="product"
        />
      </div>

      <div
        v-else
        class="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200"
      >
        <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBagIcon class="h-8 w-8 text-slate-400" />
        </div>
        <h3 class="text-lg font-bold text-slate-900">
          Henüz Ürün Bulunmuyor
        </h3>
        <p class="text-slate-500 max-w-sm mx-auto mt-1">
          Bu markaya ait ürünler henüz eklenmemiş veya onay
          bekliyor.
        </p>
        <NuxtLink
          to="/products"
          class="inline-flex items-center mt-6 text-primary-600 font-bold hover:underline"
        >
          Tüm Ürünlere Göz At
          <ArrowRightIcon class="h-4 w-4 ml-2" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBrandService } from '~/services/api/BrandService'
import type { Brand } from '@barterborsa/shared-types'
import {
    CheckBadgeIcon,
    StarIcon,
    ShoppingBagIcon,
    ArrowRightIcon,
    
} from '@heroicons/vue/24/solid'

const route = useRoute()
const brandService = useBrandService()
const brand = ref<Brand | null>(null)
const loading = ref(true)
const activeCategory = ref('Hepsi')
const mockCategories = ['Hepsi', 'Endüstriyel', 'Yedek Parça', 'Sarf Malzeme']

const fetchBrandData = async () => {
    loading.value = true
    try {
        const response = await brandService.getBrandBySlug(route.params.slug as string)
        if (response.success && response.data) {
            brand.value = response.data

            // Update SEO
            useHead({
                title: `${brand.value.name} Ürünleri ve Modelleri - SanayiTakas`,
                meta: [
                    { name: 'description', content: brand.value.description || `${brand.value.name} markasına ait ürünleri, fiyatları ve teknik özellikleri keşfedin.` },
                    { property: 'og:title', content: brand.value.name },
                    { property: 'og:image', content: brand.value.icon || brand.value.image }
                ]
            })
        }
    } catch (error) {
        console.error('Failed to fetch brand:', error)
    } finally {
        loading.value = false
    }
}

const formatRating = (val: number) => val.toFixed(1)

onMounted(fetchBrandData)
</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes pulse-slow {

    0%,
    100% {
        opacity: 0.2;
    }

    50% {
        opacity: 0.4;
    }
}

.animate-pulse {
    animation: pulse-slow 4s infinite ease-in-out;
}
</style>
