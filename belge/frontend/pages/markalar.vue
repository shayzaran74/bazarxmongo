<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <AnnouncementBar page="brands" />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Header Section -->
      <div class="mb-12">
        <div class="flex items-center gap-4 mb-4">
          <div
            class="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-100 rotate-3 transition-transform"
          >
            <span class="text-3xl">🏆</span>
          </div>
          <div>
            <h1 class="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
              Tüm <span class="text-primary-600">Markalar</span>
            </h1>
            <p class="text-slate-500 font-medium italic opacity-80">
              Dünyanın en seçkin markaları tek bir
              noktada.
            </p>
          </div>
        </div>

        <!-- Alpha Filter -->
        <div class="flex flex-wrap gap-2 mt-8 overflow-x-auto pb-4 no-scrollbar">
          <button
            class="px-5 py-2.5 rounded-xl font-black text-xs transition-all active:scale-95 whitespace-nowrap"
            :class="!selectedLetter ? 'bg-primary-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-500'"
            @click="selectedLetter = null"
          >
            HEPSİ
          </button>
          <button
            v-for="letter in alphabet"
            :key="letter"
            class="px-4 py-2.5 rounded-xl font-black text-xs transition-all active:scale-95"
            :class="selectedLetter === letter ? 'bg-primary-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-500'"
            @click="selectedLetter = letter"
          >
            {{ letter }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6"
      >
        <div
          v-for="i in 12"
          :key="i"
          class="h-48 bg-white/50 rounded-[2.5rem] animate-pulse border border-slate-100"
        />
      </div>

      <!-- Content Grid -->
      <div
        v-else-if="filteredBrands.length > 0"
        class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6"
      >
        <div
          v-for="brand in filteredBrands"
          :key="brand.id"
          class="group bg-white rounded-[2rem] p-6 text-center shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary-200/50 transition-all duration-500 cursor-pointer border-2 border-white hover:border-primary-500 relative overflow-hidden flex flex-col items-center justify-center h-52 active:scale-95"
          @click="navigateToBrand(brand.name)"
        >
          <!-- Decoration -->
          <div
            class="absolute -top-12 -right-12 w-40 h-40 bg-primary-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          />

          <div
            class="w-24 h-24 mb-4 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 group-hover:border-primary-100 transition-all z-10 p-2 bg-gradient-to-br from-white to-gray-50"
          >
            <NuxtImg
              v-if="brand.image"
              :src="resolveImageUrl(brand.image, 'category')"
              class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
              placeholder
            />
            <span
              v-else
              class="text-4xl transform group-hover:scale-125 transition-transform duration-500 select-none"
            >
              {{ brand.icon || '🏷️' }}
            </span>
          </div>

          <h4
            class="text-xs font-black text-slate-900 uppercase tracking-widest z-10 group-hover:text-primary-600 transition-colors line-clamp-1"
          >
            {{ brand.name }}
          </h4>

          <div
            class="mt-3 flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-[9px] font-black text-slate-500 group-hover:bg-primary-600 group-hover:text-white transition-all"
          >
            <span>{{ brand._count?.Product || 0 }}</span>
            <span class="opacity-70 text-[8px]">ÜRÜN</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="text-center py-20"
      >
        <div class="text-6xl mb-6 grayscale opacity-30">
          🔍
        </div>
        <h3 class="text-xl font-black text-slate-900 uppercase italic">
          Sonuç Bulunamadı
        </h3>
        <p class="text-slate-500 mt-2 font-medium">
          Bu kriterlere uygun marka bulunmuyor.
        </p>
        <button
          class="mt-6 font-black text-primary-600 uppercase tracking-widest text-xs underline"
          @click="selectedLetter = null"
        >
          TÜMÜNE GERİ DÖN
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const { resolveImageUrl } = useAppImage()
const brands = ref([])
const loading = ref(true)
const selectedLetter = ref(null)

const alphabet = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'.split('')

const fetchAllBrands = async () => {
    loading.value = true
    try {
        const { $api } = useApi()
        const data = await $api('/api/brands', {
            query: { limit: 1000 } // Fetch all approved brands
        })
        if (data.success) {
            brands.value = data.data
        }
    } catch (error) {
        console.error('Brands fetch error:', error)
    } finally {
        loading.value = false
    }
}

const filteredBrands = computed(() => {
    if (!selectedLetter.value) return brands.value
    return brands.value.filter(b => b.name.startsWith(selectedLetter.value))
})

const navigateToBrand = (name) => {
    navigateTo(`/products?brand=${encodeURIComponent(name)}`)
}

onMounted(() => {
    fetchAllBrands()
})

useHead({
    title: 'Tüm Markalar - TicariTakas',
    meta: [{ name: 'description', content: 'TicariTakas platformundaki tüm markaları keşfedin.' }]
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
