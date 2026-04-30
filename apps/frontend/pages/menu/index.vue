<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
    <!-- Hero -->
    <div class="relative overflow-hidden px-4 pt-16 pb-12 text-center">
      <Motion
        :initial="{ opacity: 0, filter: 'blur(12px)', y: 28 }"
        :animate="{ opacity: 1, filter: 'blur(0px)', y: 0 }"
        :transition="{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }"
      >
        <h1 class="text-4xl md:text-5xl font-black text-white tracking-tight">
          BazarX <span class="text-purple-400">Menü</span>
        </h1>
        <p class="mt-3 text-slate-400 text-lg max-w-xl mx-auto">
          Aylık aidatının 2 katı menü hakkı · %50 indirim · 1+1 bedava
        </p>
      </Motion>

      <!-- Kredi widget -->
      <Motion
        v-if="credit.total > 0"
        :initial="{ opacity: 0, y: 16 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.2 }"
        class="inline-flex items-center gap-3 mt-6 bg-white/5 border border-white/10 rounded-2xl px-6 py-3"
      >
        <span class="text-2xl font-black text-purple-400">
          {{ remainingCredit.toLocaleString('tr-TR') }}₺
        </span>
        <span class="text-slate-400 text-sm">menü krediniz kaldı</span>
        <div class="w-24 bg-white/10 rounded-full h-1.5">
          <div
            class="bg-purple-500 h-1.5 rounded-full transition-all"
            :style="{ width: creditPct + '%' }"
          />
        </div>
      </Motion>
    </div>

    <!-- Filtreler -->
    <div class="max-w-6xl mx-auto px-4 mb-8">
      <div class="flex flex-wrap gap-3">
        <input
          v-model="search"
          type="text"
          placeholder="Restoran ara..."
          class="flex-1 min-w-48 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          @input="debouncedFetch"
        />
        <input
          v-model="city"
          type="text"
          placeholder="Şehir"
          class="w-32 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          @input="debouncedFetch"
        />
        <select
          v-model="category"
          class="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
          @change="fetchRestaurants"
        >
          <option value="">Tüm kategoriler</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
    </div>

    <!-- Restoran grid -->
    <div class="max-w-6xl mx-auto px-4 pb-20">
      <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="h-64 bg-white/5 rounded-2xl animate-pulse" />
      </div>

      <div v-else-if="restaurants.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Motion
          v-for="(r, i) in restaurants"
          :key="r.id"
          :initial="{ opacity: 0, filter: 'blur(8px)', y: 20 }"
          :animate="{ opacity: 1, filter: 'blur(0px)', y: 0 }"
          :transition="{ duration: 0.5, delay: i * 0.09, ease: [0.25, 0.46, 0.45, 0.94] }"
          :while-hover="{ y: -7, scale: 1.02 }"
          class="cursor-pointer"
          @click="$router.push(`/menu/${r.id}`)"
        >
          <div class="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/40 transition-colors">
            <div class="relative h-44 bg-gradient-to-br from-purple-900/30 to-slate-800">
              <img
                v-if="r.imageUrl"
                :src="r.imageUrl"
                :alt="r.name"
                class="w-full h-full object-cover"
              />
              <div v-if="r.isLaunchPartner" class="absolute top-3 left-3 bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                Lansman Ortağı
              </div>
            </div>
            <div class="p-4">
              <h3 class="text-white font-bold text-lg truncate">{{ r.name }}</h3>
              <p class="text-slate-400 text-sm mt-0.5">{{ r.city }}{{ r.district ? ` · ${r.district}` : '' }}</p>
              <div v-if="r.featuredMenu" class="mt-3 flex items-center justify-between">
                <span class="text-slate-500 text-sm line-through">{{ Number(r.featuredMenu.originalPrice).toLocaleString('tr-TR') }}₺</span>
                <span class="text-purple-400 font-bold">{{ Number(r.featuredMenu.discountedPrice).toLocaleString('tr-TR') }}₺'den</span>
              </div>
            </div>
          </div>
        </Motion>
      </div>

      <div v-else class="text-center py-20 text-slate-500">
        Bu kriterlere uygun restoran bulunamadı.
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-10">
        <button
          v-for="p in totalPages"
          :key="p"
          class="w-9 h-9 rounded-lg text-sm font-bold transition-colors"
          :class="p === page ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'"
          @click="page = p; fetchRestaurants()"
        >{{ p }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

import { ref, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'
const { $api } = useApi()

interface Restaurant {
  id: string; name: string; slug: string; city: string; district?: string
  category?: string; imageUrl?: string; isLaunchPartner: boolean
  featuredMenu?: { originalPrice: number; discountedPrice: number } | null
}

const restaurants = ref<Restaurant[]>([])
const total       = ref(0)
const page        = ref(1)
const pending     = ref(false)
const search      = ref('')
const city        = ref('')
const category    = ref('')
const categories  = ['Restoran', 'Kafe', 'Fast Food', 'Tatlı', 'Burger', 'Pizza']

const credit        = ref({ total: 0, used: 0, remaining: 0 })
const remainingCredit = computed(() => credit.value.remaining)
const creditPct     = computed(() =>
  credit.value.total ? Math.round((credit.value.used / credit.value.total) * 100) : 0,
)
const totalPages    = computed(() => Math.ceil(total.value / 20))

async function fetchRestaurants() {
  pending.value = true
  try {
    const params = new URLSearchParams()
    if (search.value)   params.set('search',   search.value)
    if (city.value)     params.set('city',     city.value)
    if (category.value) params.set('category', category.value)
    params.set('page', String(page.value))

    const res = await $api<typeof restaurants.value>(`/api/menu/restaurants?${params}`)
    if (res.data) {
      restaurants.value = (res as Record<string, typeof restaurants.value>).data ?? []
      total.value       = (res as Record<string, number>).total ?? 0
    }
  } finally {
    pending.value = false
  }
}

const debouncedFetch = useDebounceFn(() => { page.value = 1; fetchRestaurants() }, 400)

onMounted(async () => {
  await fetchRestaurants()
  try {
    const r = await $api<typeof credit.value>('/api/menu/my-credit')
    if (r.data) credit.value = r.data
  } catch {}
})
</script>
