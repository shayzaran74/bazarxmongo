<template>
  <div class="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
    <!-- Header Section -->
    <div class="relative mb-10 overflow-hidden rounded-[2.5rem] bg-indigo-900 p-8 text-white shadow-2xl">
      <!-- Background Decorative Elements -->
      <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500 opacity-20 blur-3xl" />
      <div class="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-pink-500 opacity-20 blur-3xl" />
      
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span class="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-3 border border-white/10">
            {{ authStore.user?.vendor?.vendorTier || 'Standard' }} Member
          </span>
          <h1 class="text-3xl md:text-4xl font-black tracking-tighter italic">
            Hoş geldin, <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-pink-200">{{ authStore.user?.vendor?.businessName || 'Mağaza Sahibi' }}</span>
          </h1>
          <p class="mt-2 text-indigo-100/70 font-medium max-w-md">
            Satış verilerini takip et, envanterini yönet ve ekosistemini büyüt.
          </p>
        </div>
        
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/"
            class="flex items-center px-5 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 transition-all font-bold text-sm"
          >
            <HomeIcon class="h-5 w-5 mr-2" />
            Platforma Dön
          </NuxtLink>
          <button
            class="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 transition-all group"
            @click="refreshStats"
          >
            <ArrowPathIcon class="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <!-- Products Card -->
      <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
        <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
          <ShoppingBagIcon class="h-20 w-20 text-indigo-600" />
        </div>
        <div class="relative z-10">
          <div class="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
            <ShoppingBagIcon class="h-6 w-6" />
          </div>
          <p class="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">
            Aktif Ürünler
          </p>
          <p class="text-3xl font-black text-gray-900 italic tracking-tighter">
            {{ stats.products || 0 }}
          </p>
        </div>
      </div>

      <!-- Orders Card -->
      <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
        <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
          <ShoppingCartIcon class="h-20 w-20 text-orange-600" />
        </div>
        <div class="relative z-10">
          <div class="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-4">
            <ShoppingCartIcon class="h-6 w-6" />
          </div>
          <p class="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">
            Bekleyen Siparişler
          </p>
          <p class="text-3xl font-black text-gray-900 italic tracking-tighter">
            {{ stats.orders || 0 }}
          </p>
        </div>
      </div>

      <!-- Sales Card -->
      <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
        <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
          <CurrencyDollarIcon class="h-20 w-20 text-green-600" />
        </div>
        <div class="relative z-10">
          <div class="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-4">
            <CurrencyDollarIcon class="h-6 w-6" />
          </div>
          <p class="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">
            Toplam Satış
          </p>
          <p class="text-3xl font-black text-gray-900 italic tracking-tighter">
            {{ stats.sales || 0 }} TL
          </p>
        </div>
      </div>

      <!-- Performance Card -->
      <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
        <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
          <StarIcon class="h-20 w-20 text-yellow-500" />
        </div>
        <div class="relative z-10">
          <div class="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600 mb-4">
            <StarIcon class="h-6 w-6" />
          </div>
          <p class="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">
            Mağaza Puanı
          </p>
          <div class="flex items-baseline gap-2">
            <p class="text-3xl font-black text-gray-900 italic tracking-tighter">
              {{ stats.rating || '0.0' }}
            </p>
            <span class="text-xs font-bold text-gray-400 tracking-tighter">/ 5.0</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <!-- Quick Actions (Left 2/3) -->
      <div class="lg:col-span-2">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-black text-gray-900 uppercase tracking-tighter italic">
            Hızlı İşlemler
          </h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NuxtLink
            to="/vendor/products"
            class="group bg-white p-6 rounded-[2rem] border border-gray-100 hover:border-indigo-500 transition-all duration-300 flex items-center gap-5"
          >
            <div class="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <ShoppingBagIcon class="h-8 w-8" />
            </div>
            <div>
              <p class="font-black uppercase tracking-widest text-[10px] text-gray-400 mb-1">
                Ekle & Düzenle
              </p>
              <p class="font-black text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">
                Ürün Yönetimi
              </p>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/vendor/inventory"
            class="group bg-white p-6 rounded-[2rem] border border-gray-100 hover:border-emerald-500 transition-all duration-300 flex items-center gap-5"
          >
            <div class="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <FolderIcon class="h-8 w-8" />
            </div>
            <div>
              <p class="font-black uppercase tracking-widest text-[10px] text-gray-400 mb-1">
                Stok Takibi
              </p>
              <p class="font-black text-sm text-gray-900 group-hover:text-emerald-600 transition-colors">
                Envanter
              </p>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/vendor/orders"
            class="group bg-white p-6 rounded-[2rem] border border-gray-100 hover:border-orange-500 transition-all duration-300 flex items-center gap-5"
          >
            <div class="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
              <ShoppingCartIcon class="h-8 w-8" />
            </div>
            <div>
              <p class="font-black uppercase tracking-widest text-[10px] text-gray-400 mb-1">
                Satış Yönetimi
              </p>
              <p class="font-black text-sm text-gray-900 group-hover:text-orange-600 transition-colors">
                Siparişler
              </p>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/vendor/banners"
            class="group bg-white p-6 rounded-[2rem] border border-gray-100 hover:border-purple-500 transition-all duration-300 flex items-center gap-5"
          >
            <div class="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
              <PhotoIcon class="h-8 w-8" />
            </div>
            <div>
              <p class="font-black uppercase tracking-widest text-[10px] text-gray-400 mb-1">
                Reklam Alanları
              </p>
              <p class="font-black text-sm text-gray-900 group-hover:text-purple-600 transition-colors">
                Bannerlarım
              </p>
            </div>
          </NuxtLink>

          <!-- Ecosystem Portal -->
          <button
            v-if="authStore.user?.vendor?.vendorTier === 'APEX' || authStore.user?.vendor?.vendorTier === 'ELITE' || myEcosystem"
            class="lg:col-span-2 group bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2.5rem] shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all duration-300 text-left relative overflow-hidden"
            @click="myEcosystem ? navigateTo(`/ecosystem/${myEcosystem.id}`) : createDefaultEcosystem()"
          >
            <div class="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-125 transition-transform duration-700">
              <ShieldCheckIcon class="h-40 w-40 text-white" />
            </div>
            <div class="relative z-10 flex items-center justify-between">
              <div class="flex items-center gap-6">
                <div class="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                  <ShieldCheckIcon class="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 class="text-white font-black text-xl italic tracking-tighter">
                    BazarX Private Portal
                  </h3>
                  <p class="text-indigo-100/70 font-medium text-sm">
                    Özel iş ortaklığı ve ekosistem yönetimi.
                  </p>
                </div>
              </div>
              <div class="hidden sm:flex w-10 h-10 rounded-full bg-white/10 items-center justify-center text-white border border-white/20 group-hover:bg-white group-hover:text-indigo-600 transition-all">
                <ArrowRightIcon class="h-5 w-5" />
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Recent Activity (Right 1/3) -->
      <div>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-black text-gray-900 uppercase tracking-tighter italic">
            Son Aktiviteler
          </h2>
        </div>
        <div class="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
          <div
            v-if="loading"
            class="flex flex-col items-center justify-center py-10 gap-4"
          >
            <div class="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            <p class="text-xs font-black uppercase tracking-widest text-gray-400">
              Yükleniyor...
            </p>
          </div>
          <div
            v-else-if="recentActivities.length > 0"
            class="space-y-6"
          >
            <div
              v-for="(activity, index) in recentActivities"
              :key="activity.id"
              class="flex gap-4 group"
            >
              <div class="relative">
                <div class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 group-hover:border-indigo-200 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                  <span class="text-xs font-black">{{ index + 1 }}</span>
                </div>
                <div
                  v-if="index !== recentActivities.length - 1"
                  class="absolute top-10 left-1/2 w-px h-6 bg-gray-100 -translate-x-1/2"
                />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <p class="text-sm font-black text-gray-900 truncate tracking-tight">
                    {{ activity.title }}
                  </p>
                  <span class="text-[10px] text-gray-400 font-medium">{{ formatDate(activity.createdAt) }}</span>
                </div>
                <p class="text-xs text-gray-500 truncate mb-2">
                  {{ activity.description }}
                </p>
                <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                  {{ activity.status }}
                </span>
              </div>
            </div>
          </div>
          <div
            v-else
            class="text-center py-10"
          >
            <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <CalendarIcon class="h-8 w-8 text-gray-300" />
            </div>
            <p class="text-sm font-black text-gray-400 uppercase tracking-widest italic">
              Aktivite Bulunmuyor
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ShoppingBagIcon,
  FolderIcon,
      CalendarIcon,
  PhotoIcon,
  CurrencyDollarIcon,
    ShoppingCartIcon,
  ArrowPathIcon,
  HomeIcon,
  ShieldCheckIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/vue/24/outline'

// Layout
definePageMeta({
  layout: 'vendor',
  middleware: 'vendor'
})

// Page meta
useHead({
  title: 'Vendor Dashboard - E-Commerce Platform',
  meta: [
    {
      name: 'description',
      content: 'Vendor dashboard'
    }
  ]
})

const authStore = useAuthStore()
const {
  stats, recentActivities, loading, myEcosystem,
  fetchStats, fetchEcosystemStatus, createDefaultEcosystem, refreshStats
} = useVendorDashboard()

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchStats()
  fetchEcosystemStatus()
})
</script>