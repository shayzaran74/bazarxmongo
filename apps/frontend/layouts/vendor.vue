<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-900 text-white flex flex-col">
      <!-- Logo -->
      <div class="p-4 border-b border-gray-800">
        <NuxtLink
          to="/vendor/dashboard"
          class="flex items-center space-x-2"
        >
          <span class="text-2xl">🏪</span>
          <span class="text-lg font-semibold">Satıcı Paneli</span>
        </NuxtLink>
      </div>

      <!-- Search -->
      <div class="p-4">
        <div class="relative">
          <input
            type="text"
            placeholder="Ara (⌘K)"
            class="w-full bg-gray-800 text-white px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto px-2 space-y-1">
        <NuxtLink
          to="/vendor/dashboard"
          class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
          :class="{ 'bg-gray-800': $route.path === '/vendor/dashboard' }"
        >
          <HomeIcon class="h-5 w-5 mr-3" />
          Ana Sayfa
        </NuxtLink>

        <!-- Ürünler -->
        <div class="pt-4 pb-2">
          <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Ürünler
          </p>
        </div>
        <NuxtLink
          to="/vendor/products"
          class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
          :class="{ 'bg-gray-800': $route.path.startsWith('/vendor/products') }"
        >
          <ShoppingBagIcon class="h-5 w-5 mr-3" />
          Ürünler
        </NuxtLink>
        <NuxtLink
          to="/vendor/brands"
          class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
          :class="{ 'bg-gray-800': $route.path.startsWith('/vendor/brands') }"
        >
          <TagIcon class="h-5 w-5 mr-3" />
          Marka Yönetimi
        </NuxtLink>
        <NuxtLink
          to="/vendor/inventory"
          class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
          :class="{ 'bg-gray-800': $route.path.startsWith('/vendor/inventory') }"
        >
          <CubeIcon class="h-5 w-5 mr-3" />
          Envanter
        </NuxtLink>
        <NuxtLink
          to="/vendor/transfers"
          class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
          :class="{ 'bg-gray-800': $route.path.startsWith('/vendor/transfers') }"
        >
          <ArrowsRightLeftIcon class="h-5 w-5 mr-3" />
          Aktarımlar
        </NuxtLink>

        <!-- Siparişler -->
        <div class="pt-4 pb-2">
          <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Siparişler
          </p>
        </div>
        <NuxtLink
          to="/vendor/orders"
          class="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
          :class="{ 'bg-gray-800': $route.path.startsWith('/vendor/order') }"
        >
          <div class="flex items-center">
            <DocumentTextIcon class="h-5 w-5 mr-3" />
            Siparişler
          </div>
          <!-- Pending Orders Badge -->
          <span
            v-if="pendingOrderCount > 0"
            class="pending-badge"
          >
            {{ pendingOrderCount > 99 ? '99+' : pendingOrderCount }}
          </span>
        </NuxtLink>

        <!-- Analiz -->
        <div class="pt-4 pb-2">
          <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Analiz
          </p>
        </div>
        <NuxtLink
          to="/vendor/analytics"
          class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
          :class="{ 'bg-gray-800': $route.path.startsWith('/vendor/analytic') }"
        >
          <ChartBarIcon class="h-5 w-5 mr-3" />
          Satış Analizi
        </NuxtLink>

        <NuxtLink
          to="/vendor/advertising"
          class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
          :class="{ 'bg-gray-800': $route.path.startsWith('/vendor/advertising') }"
        >
          <MegaphoneIcon class="h-5 w-5 mr-3" />
          Reklam Yönetimi
        </NuxtLink>

        <!-- Finansal -->
        <div class="pt-4 pb-2">
          <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Finansal
          </p>
        </div>
        <NuxtLink
          to="/vendor/financial/invoices"
          class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
          :class="{ 'bg-gray-800': $route.path.startsWith('/vendor/financial') }"
        >
          <DocumentDuplicateIcon class="h-5 w-5 mr-3" />
          Komisyon Faturaları
        </NuxtLink>

        <!-- Ticari Takas -->
        <div class="pt-4 pb-2">
          <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Ticari Takas
          </p>
        </div>
        <NuxtLink
          to="/my/surplus"
          class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
          :class="{ 'bg-gray-800': $route.path === '/my/surplus' }"
        >
          <SparklesIcon class="h-5 w-5 mr-3" />
          Takas İlanlarım
        </NuxtLink>

        <!-- Ayarlar -->
        <div class="pt-4 pb-2">
          <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Ayarlar
          </p>
        </div>
        <NuxtLink
          to="/vendor/settings"
          class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
          :class="{ 'bg-gray-800': $route.path.startsWith('/vendor/setting') }"
        >
          <CogIcon class="h-5 w-5 mr-3" />
          Ayarlar
        </NuxtLink>

        <!-- Banner Yönetimi -->
        <NuxtLink
          to="/vendor/banners"
          class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
          :class="{ 'bg-gray-800': $route.path.startsWith('/vendor/banners') }"
        >
          <PhotoIcon class="h-5 w-5 mr-3" />
          Banner Yönetimi
        </NuxtLink>

        <!-- Ekosistem Yönetimi -->
        <div class="pt-4 pb-2">
          <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Ekosistem (BazarX Private)
          </p>
        </div>
        <NuxtLink
          to="/vendor/ecosystem"
          class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-900 transition-colors border border-transparent hover:border-indigo-500"
          :class="{ 'bg-indigo-900 border-indigo-500': $route.path.startsWith('/vendor/ecosystem') }"
        >
          <ShieldCheckIcon class="h-5 w-5 mr-3 text-indigo-400" />
          Ekosistem Yönetimi
        </NuxtLink>
      </nav>

      <!-- User Menu -->
      <div class="p-4 border-t border-gray-800">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-medium overflow-hidden">
              <img
                v-if="authStore.avatarUrl"
                :src="authStore.avatarUrl"
                class="w-full h-full object-cover"
              >
              <span v-else>{{ authStore.fullName.charAt(0) || 'S' }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">
                {{ authStore.fullName || 'Satıcı' }}
              </p>
              <p class="text-xs text-gray-400 truncate">
                {{ authStore.user?.email }}
              </p>
            </div>
          </div>
          <button
            class="text-gray-400 hover:text-white transition-colors"
            title="Çıkış Yap"
            @click="handleLogout"
          >
            <ArrowRightOnRectangleIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <header class="bg-white border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-semibold text-gray-900">
            {{ pageTitle }}
          </h1>
          <div class="flex items-center space-x-4">
            <button class="p-2 text-gray-400 hover:text-gray-600 rounded-md">
              <BellIcon class="h-6 w-6" />
            </button>
            <NuxtLink
              to="/"
              class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <EyeIcon class="h-4 w-4 mr-2" />
              Siteyi Görüntüle
            </NuxtLink>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto bg-gray-50 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  HomeIcon,
  ShoppingBagIcon,
  CubeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  EyeIcon,
  ArrowsRightLeftIcon,
  SparklesIcon,
      PhotoIcon,
    MegaphoneIcon,
   TagIcon,
  ShieldCheckIcon,
  DocumentDuplicateIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const { $api } = useApi()

// Dynamic page title
const routeTitles: Record<string, string> = {
  '/vendor/dashboard': 'Dashboard',
  '/vendor/products': 'Ürünler',
  '/vendor/inventory': 'Envanter',
  '/vendor/order': 'Siparişler',
  '/vendor/analytic': 'Satış Analizi',
  '/vendor/setting': 'Ayarlar',
  '/vendor/transfers': 'Aktarımlar',
  '/vendor/advertising': 'Reklam Yönetimi',
  '/vendor/brands': 'Marka Yönetimi',
  '/vendor/banners': 'Banner Yönetimi',
  '/vendor/financial': 'Finansal Raporlar'
};

const pageTitle = computed(() => {
  const path = route.path;
  if (routeTitles[path]) return routeTitles[path];

  const matchedKey = Object.keys(routeTitles)
    .sort((a, b) => b.length - a.length)
    .find(key => path.startsWith(key) && key !== '/vendor/dashboard');

  return matchedKey ? routeTitles[matchedKey] : 'Satıcı Paneli';
});

// Auth check - handled by middleware
onMounted(async () => {
  await authStore.init()

  // Fetch pending orders count if vendor is approved
  if (authStore.isVendor && authStore.vendorStatus === 'APPROVED') {
    fetchPendingOrderCount()
    // Set up polling every 5 minutes (300000ms)
    pendingOrderInterval = setInterval(fetchPendingOrderCount, 300000)
  }
})

onUnmounted(() => {
  if (pendingOrderInterval) {
    clearInterval(pendingOrderInterval)
  }
})

// Pending orders count
const pendingOrderCount = ref(0)
let pendingOrderInterval: ReturnType<typeof setInterval> | null = null
const config = useRuntimeConfig()

const fetchPendingOrderCount = async () => {
  try {
    const response = await $api('/api/vendors/orders/pending-count')
    if (response.success) {
      const data = response.data as any
      pendingOrderCount.value = data.pendingCount || data
    }
  } catch (error) {
    console.error('Failed to fetch pending order count:', error)
  }
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    const toast = useNuxtApp().$toast
    toast.success('Çıkış yapıldı!')
    await router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    const toast = useNuxtApp().$toast
    toast.error('Çıkış yapılırken bir hata oluştu!')
  }
}
</script>

<style scoped>
.pending-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: 11px;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
  border-radius: 10px;
  animation: pulse-badge 2s infinite;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}

@keyframes pulse-badge {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
  }

  50% {
    opacity: 0.8;
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
  }
}
</style>