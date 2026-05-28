<template>
  <div class="min-h-screen bg-[#F8FAFC]">
    <TtAccessBarrier v-if="!isVendor" />
    <div :class="{ 'blur-md pointer-events-none': !isVendor }">
    <!-- Header / Navigation -->
    <header class="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-[100]">
      <div class="flex items-center gap-4">
        <NuxtLink to="/ticaritakas/b2b-dashboard" class="p-2 hover:bg-slate-50 rounded-xl transition-colors">
          <Icon name="heroicons:arrow-left" size="24" class="text-slate-400" />
        </NuxtLink>
        <NuxtLink to="/ticaritakas" class="hover:opacity-80 transition-opacity">
          <h1 class="text-xl font-black text-[#002444] leading-none uppercase tracking-tight">TAKAS <span class="text-blue-500">HAVUZU</span></h1>
          <p class="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Tüm Kurumsal Fırsatlar</p>
        </NuxtLink>
      </div>

      <div class="flex items-center gap-4">
        <div class="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
          <span class="text-[10px] font-black text-blue-600 uppercase tracking-widest">{{ totalItems }} Aktif İlan</span>
        </div>
        <NuxtLink to="/ticaritakas/inbox" class="px-6 py-2.5 bg-[#002444] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/20">
          İLAN VER
        </NuxtLink>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-12">
      <div class="flex gap-6 items-start">
        
        <!-- Sol Arama Barı (Sidebar) -->
        <aside v-show="isSidebarOpen" class="w-72 flex-shrink-0 bg-white rounded-[2rem] border border-slate-100 overflow-hidden sticky top-24 shadow-sm">
          <!-- Başlık -->
          <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Icon name="heroicons:funnel" size="18" class="text-blue-500" />
              <span class="font-black text-sm text-[#002444]">Detaylı Arama</span>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="searchQuery || selectedCategory || selectedCity"
                class="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-700 transition-colors"
                type="button"
                @click="resetFilters"
              >
                Temizle
              </button>
              <button @click="isSidebarOpen = false" class="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors" title="Filtreleri Gizle">
                <Bars3Icon class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div class="p-5 space-y-6">
            <!-- Anahtar Kelime -->
            <div>
              <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Anahtar Kelime</label>
              <div class="relative">
                <Icon name="heroicons:magnifying-glass" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  v-model="searchQuery"
                  type="text" 
                  placeholder="Ürün, hizmet..."
                  class="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-slate-400"
                  @input="debouncedSearch"
                />
              </div>
            </div>

            <!-- Kategori -->
            <div>
              <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Kategori</label>
              <div class="space-y-1.5 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                <label
                  class="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-colors"
                  :class="!selectedCategory ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'"
                >
                  <input type="radio" v-model="selectedCategory" value="" class="accent-blue-600 hidden" />
                  <span class="text-xs font-semibold">Tümü</span>
                </label>
                <label
                  v-for="cat in categories"
                  :key="cat.id"
                  class="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-colors"
                  :class="selectedCategory === cat.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'"
                >
                  <input type="radio" v-model="selectedCategory" :value="cat.id" class="accent-blue-600 hidden" />
                  <span class="text-xs font-semibold">{{ cat.name }}</span>
                </label>
              </div>
            </div>

            <!-- Şehir -->
            <div>
              <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Şehir</label>
              <select v-model="selectedCity" class="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold">
                <option value="">TÜM ŞEHİRLER</option>
                <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
              </select>
            </div>
          </div>

          <!-- Sonuç sayısı -->
          <div class="px-5 py-3 bg-slate-50 border-t border-slate-100">
            <p class="text-[11px] text-slate-500">
              <span class="font-black text-[#002444]">{{ totalItems }}</span>
              ilan listelendi
            </p>
          </div>
        </aside>

        <!-- Main Content -->
        <div class="flex-1 min-w-0">
          <div v-if="!isSidebarOpen" class="mb-6">
            <button @click="isSidebarOpen = true" class="p-2 bg-white text-slate-700 border border-slate-200 shadow-sm rounded-lg hover:bg-slate-50 flex items-center gap-2 font-bold transition-colors">
              <Bars3Icon class="w-5 h-5" />
              <span class="text-sm">Kategoriler / Filtreler</span>
            </button>
          </div>

          <!-- Grid -->
          <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <div v-for="i in 6" :key="i" class="bg-white rounded-[2rem] h-[420px] animate-pulse border border-slate-50" />
          </div>

          <div v-else-if="items.length > 0" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <div 
              v-for="item in items" 
              :key="item.id"
              class="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 group cursor-pointer flex flex-col"
              @click="navigateTo(`/ticaritakas/trade-pool/${item.id}`)"
            >
              <!-- Image -->
              <div class="relative aspect-square overflow-hidden bg-slate-100">
                <img 
                  :src="item.images?.[0] || '/placeholder-image.jpg'" 
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                >
                <div class="absolute top-6 left-6 flex flex-col gap-2">
                  <span class="bg-white/90 backdrop-blur-md text-[#002444] text-[9px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest shadow-sm">
                    {{ item.city || 'TÜRKİYE' }}
                  </span>
                </div>
                <div class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <div class="flex items-center gap-2 text-white/80 text-[10px] font-bold">
                    <Icon name="heroicons:building-office" size="14" />
                    {{ item.company?.name || 'Kurumsal Satıcı' }}
                  </div>
                </div>
              </div>

              <!-- Content -->
              <div class="p-8 flex-1 flex flex-col">
                <div class="flex justify-between items-start mb-4">
                  <span class="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">{{ item.categoryName || 'GENEL' }}</span>
                  <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest">#TRX-{{ item.id.substring(0,4).toUpperCase() }}</span>
                </div>
                <h3 class="text-lg font-black text-[#002444] mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">{{ item.title }}</h3>
                <p class="text-xs text-slate-400 line-clamp-2 font-medium mb-6">{{ item.description || 'İlan detayları için tıklayın.' }}</p>

                <div class="mt-auto pt-6 border-t border-slate-50 flex justify-between items-end">
                  <div>
                    <span class="text-[8px] font-black text-slate-300 uppercase tracking-widest block mb-1">Takas Değeri</span>
                    <span class="text-xl font-black text-[#002444]">{{ formatPrice(item.unitPrice) }} <span class="text-[10px] opacity-40">TL</span></span>
                  </div>
                  <div class="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                    <Icon name="heroicons:arrow-right" size="18" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="py-32 text-center space-y-6 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
              <Icon name="heroicons:magnifying-glass" size="48" />
            </div>
            <div class="space-y-2">
              <h3 class="text-2xl font-black text-[#002444]">Hiç İlan Bulunamadı</h3>
              <p class="text-slate-400 font-medium max-w-sm mx-auto">Arama kriterlerinize uygun bir takas fırsatı şu an bulunmuyor. Farklı filtreler deneyebilirsiniz.</p>
            </div>
            <button @click="resetFilters" class="text-blue-500 font-black text-xs uppercase tracking-widest hover:underline">FİLTRELERİ TEMİZLE</button>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="mt-16 flex justify-center gap-2">
            <button 
              v-for="p in totalPages" 
              :key="p"
              @click="page = p"
              :class="page === p ? 'bg-[#002444] text-white' : 'bg-white text-slate-400 hover:bg-slate-50'"
              class="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs transition-all shadow-sm border border-slate-100"
            >
              {{ p }}
            </button>
          </div>
        </div>
      </div>
    </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import TtAccessBarrier from '~/components/ticaritakas/TtAccessBarrier.vue'
import { Bars3Icon } from '@heroicons/vue/24/outline'

definePageMeta({ layout: false })

const { $api } = useApi()
const authStore = useAuthStore()

const isVendor = computed(() => {
  return authStore.isAuthenticated && (authStore.user?.role === 'VENDOR' || authStore.user?.role === 'ADMIN' || authStore.user?.role === 'SUPER_ADMIN')
})

const isSidebarOpen = ref(true)

interface SurplusListItem {
  id: string
  title: string
  description?: string
  category?: string
  categoryName?: string
  city?: string
  unitPrice?: number
  images?: string[]
  company?: { id: string; name: string }
}

interface SurplusCategory {
  id: string
  name: string
  slug?: string
}

interface SurplusMeta {
  total: number
  totalPages: number
}

// State
const loading = ref(true)
const items = ref<SurplusListItem[]>([])
const totalItems = ref(0)
const totalPages = ref(1)
const categories = ref<SurplusCategory[]>([])
const cities = ['ISTANBUL', 'ANKARA', 'IZMIR', 'BURSA', 'KOCAELI', 'HATAY']

// Filters
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedCity = ref('')
const page = ref(1)
const limit = 12

// Fetch Functions
const fetchCategories = async (): Promise<void> => {
  try {
    const res = await $api<{ success: boolean; data?: SurplusCategory[] }>('/api/v1/surplus/categories')
    if (res.success) categories.value = res.data ?? []
  } catch { /* hata filtresi tarafından işlenir */ }
}

const fetchItems = async (): Promise<void> => {
  loading.value = true
  try {
    const res = await $api<{ success: boolean; data?: SurplusListItem[]; meta?: SurplusMeta }>(
      '/api/v1/surplus',
      {
        query: {
          page:       page.value,
          limit,
          q:          searchQuery.value  || undefined,
          categoryId: selectedCategory.value || undefined,
          city:       selectedCity.value || undefined,
        },
      },
    )
    if (res.success) {
      items.value      = res.data ?? []
      totalItems.value = res.meta?.total ?? 0
      totalPages.value = res.meta?.totalPages ?? 1
    }
  } catch { /* hata filtresi tarafından işlenir */ } finally {
    loading.value = false
  }
}

// Helpers
const formatPrice = (p: number | string | undefined): string => {
  if (!p) return '0'
  return new Intl.NumberFormat('tr-TR').format(Number(p))
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedCity.value = ''
  page.value = 1
}

// Watchers
watch([selectedCategory, selectedCity, page], () => {
  fetchItems()
})

let searchTimeout: ReturnType<typeof setTimeout> | null = null
const debouncedSearch = (): void => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchItems()
  }, 500)
}

onMounted(() => {
  fetchCategories()
  fetchItems()
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
