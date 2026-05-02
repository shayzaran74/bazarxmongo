<template>
  <aside class="w-64 bg-gray-900 text-white flex flex-col shrink-0">
    <!-- Logo -->
    <div class="p-4 border-b border-gray-800">
      <NuxtLink to="/vendor/dashboard" class="flex items-center space-x-2">
        <span class="text-2xl">🏪</span>
        <span class="text-lg font-semibold">Satıcı Paneli</span>
      </NuxtLink>
    </div>

    <!-- Search -->
    <div class="p-4">
      <input
        type="text"
        placeholder="Ara (⌘K)"
        class="w-full bg-gray-800 text-white px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto px-2 space-y-1 pb-4">

      <!-- Ana Sayfa -->
      <NuxtLink
        to="/vendor/dashboard"
        class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
        :class="{ 'bg-gray-800': route.path === '/vendor/dashboard' }"
      >
        <HomeIcon class="h-5 w-5 mr-3" /> Ana Sayfa
      </NuxtLink>

      <!-- ── Ürünler ── -->
      <div class="pt-4 pb-1">
        <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ürünler</p>
      </div>

      <NuxtLink
        to="/vendor/products"
        class="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
        :class="{ 'bg-gray-800': route.path.startsWith('/vendor/products') }"
      >
        <div class="flex items-center"><ShoppingBagIcon class="h-5 w-5 mr-3" />Ürünler</div>
      </NuxtLink>

      <NuxtLink
        to="/vendor/brands"
        class="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
        :class="{ 'bg-gray-800': route.path.startsWith('/vendor/brands') }"
      >
        <div class="flex items-center"><TagIcon class="h-5 w-5 mr-3" />Marka Yönetimi</div>
      </NuxtLink>

      <NuxtLink
        to="/vendor/inventory"
        class="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
        :class="{ 'bg-gray-800': route.path.startsWith('/vendor/inventory') }"
      >
        <div class="flex items-center"><CubeIcon class="h-5 w-5 mr-3" />Envanter</div>
      </NuxtLink>

      <NuxtLink
        to="/vendor/transfers"
        class="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
        :class="{ 'bg-gray-800': route.path.startsWith('/vendor/transfers') }"
      >
        <div class="flex items-center"><ArrowsRightLeftIcon class="h-5 w-5 mr-3" />Aktarımlar</div>
      </NuxtLink>

      <!-- ── Siparişler ── -->
      <div class="pt-4 pb-1">
        <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Siparişler</p>
      </div>

      <NuxtLink
        to="/vendor/orders"
        class="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
        :class="{ 'bg-gray-800': route.path.startsWith('/vendor/order') }"
      >
        <div class="flex items-center"><DocumentTextIcon class="h-5 w-5 mr-3" />Siparişler</div>
        <span v-if="pendingOrderCount > 0" class="pending-badge">
          {{ pendingOrderCount > 99 ? '99+' : pendingOrderCount }}
        </span>
      </NuxtLink>

      <!-- ── Analiz ── -->
      <div class="pt-4 pb-1">
        <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Analiz</p>
      </div>

      <NuxtLink
        to="/vendor/analytics"
        class="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
        :class="{ 'bg-gray-800': route.path.startsWith('/vendor/analytic') }"
      >
        <div class="flex items-center"><ChartBarIcon class="h-5 w-5 mr-3" />Satış Analizi</div>
      </NuxtLink>

      <NuxtLink
        to="/vendor/advertising"
        class="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
        :class="{ 'bg-gray-800': route.path.startsWith('/vendor/advertising') }"
      >
        <div class="flex items-center"><MegaphoneIcon class="h-5 w-5 mr-3" />Reklam Yönetimi</div>
      </NuxtLink>

      <!-- ── Finansal ── -->
      <div class="pt-4 pb-1">
        <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Finansal</p>
      </div>

      <NuxtLink
        to="/vendor/financial/invoices"
        class="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
        :class="{ 'bg-gray-800': route.path.startsWith('/vendor/financial') }"
      >
        <div class="flex items-center"><DocumentDuplicateIcon class="h-5 w-5 mr-3" />Komisyon Faturaları</div>
      </NuxtLink>

      <!-- ── Ticari Takas ── -->
      <div class="pt-4 pb-1">
        <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ticari Takas</p>
      </div>

      <NuxtLink
        to="/ticaritakas/inbox"
        class="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
        :class="{ 'bg-gray-800': route.path.startsWith('/ticaritakas/inbox') || route.path.startsWith('/ticaritakas/swap') }"
      >
        <div class="flex items-center"><SparklesIcon class="h-5 w-5 mr-3" />Takas İlanlarım</div>
      </NuxtLink>

      <!-- ── Ayarlar ── -->
      <div class="pt-4 pb-1">
        <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ayarlar</p>
      </div>

      <NuxtLink
        to="/vendor/settings"
        class="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
        :class="{ 'bg-gray-800': route.path.startsWith('/vendor/setting') }"
      >
        <div class="flex items-center"><CogIcon class="h-5 w-5 mr-3" />Ayarlar</div>
      </NuxtLink>

      <NuxtLink
        to="/vendor/banners"
        class="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
        :class="{ 'bg-gray-800': route.path.startsWith('/vendor/banners') }"
      >
        <div class="flex items-center"><PhotoIcon class="h-5 w-5 mr-3" />Banner Yönetimi</div>
      </NuxtLink>

      <!-- ── Ekosistem ── -->
      <div class="pt-4 pb-1">
        <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ekosistem (BazarX Private)</p>
      </div>

      <NuxtLink
        to="/vendor/ecosystem"
        class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-900 transition-colors border border-transparent hover:border-indigo-500"
        :class="{ 'bg-indigo-900 border-indigo-500': route.path.startsWith('/vendor/ecosystem') }"
      >
        <ShieldCheckIcon class="h-5 w-5 mr-3 text-indigo-400" /> Ekosistem Yönetimi
      </NuxtLink>
    </nav>

    <!-- User Menu -->
    <div class="p-4 border-t border-gray-800">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-medium overflow-hidden">
            <img v-if="avatarUrl" :src="avatarUrl" class="w-full h-full object-cover">
            <span v-else>{{ fullName?.charAt(0) || 'S' }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ fullName || 'Satıcı' }}</p>
            <p class="text-xs text-gray-400 truncate">{{ userEmail }}</p>
          </div>
        </div>
        <button class="text-gray-400 hover:text-white transition-colors" title="Çıkış Yap" @click="$emit('logout')">
          <ArrowRightOnRectangleIcon class="h-5 w-5" />
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import {
  HomeIcon, ShoppingBagIcon, CubeIcon, DocumentTextIcon, ChartBarIcon, CogIcon,
  ArrowRightOnRectangleIcon, ArrowsRightLeftIcon, SparklesIcon, PhotoIcon,
  MegaphoneIcon, TagIcon, ShieldCheckIcon, DocumentDuplicateIcon
} from '@heroicons/vue/24/outline'

defineProps<{
  pendingOrderCount: number
  fullName: string
  userEmail?: string
  avatarUrl?: string
}>()

defineEmits<{ (e: 'logout'): void }>()

const route = useRoute()
</script>

<style scoped>
.pending-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 20px; height: 20px; padding: 0 6px;
  font-size: 11px; font-weight: 700; color: white;
  background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
  border-radius: 10px;
  animation: pulse-badge 2s infinite;
  box-shadow: 0 0 10px rgba(59,130,246,0.5);
}
@keyframes pulse-badge {
  0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 10px rgba(59,130,246,0.5); }
  50% { opacity: 0.8; transform: scale(1.1); box-shadow: 0 0 20px rgba(59,130,246,0.8); }
}
</style>
