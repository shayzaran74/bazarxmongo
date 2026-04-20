<template>
  <aside class="w-64 bg-gray-900 text-white flex flex-col">
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
    <nav class="flex-1 overflow-y-auto px-2 space-y-1">
      <NuxtLink
        to="/vendor/dashboard"
        class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
        :class="{ 'bg-gray-800': route.path === '/vendor/dashboard' }"
      >
        <HomeIcon class="h-5 w-5 mr-3" /> Ana Sayfa
      </NuxtLink>

      <SidebarSection label="Ürünler">
        <SidebarLink to="/vendor/products" :icon="ShoppingBagIcon" :active="route.path.startsWith('/vendor/products')">Ürünler</SidebarLink>
        <SidebarLink to="/vendor/brands" :icon="TagIcon" :active="route.path.startsWith('/vendor/brands')">Marka Yönetimi</SidebarLink>
        <SidebarLink to="/vendor/inventory" :icon="CubeIcon" :active="route.path.startsWith('/vendor/inventory')">Envanter</SidebarLink>
        <SidebarLink to="/vendor/transfers" :icon="ArrowsRightLeftIcon" :active="route.path.startsWith('/vendor/transfers')">Aktarımlar</SidebarLink>
      </SidebarSection>

      <SidebarSection label="Siparişler">
        <SidebarLink to="/vendor/orders" :icon="DocumentTextIcon" :active="route.path.startsWith('/vendor/order')">
          <template #default>Siparişler</template>
          <template #badge>
            <span v-if="pendingOrderCount > 0" class="pending-badge">
              {{ pendingOrderCount > 99 ? '99+' : pendingOrderCount }}
            </span>
          </template>
        </SidebarLink>
      </SidebarSection>

      <SidebarSection label="Analiz">
        <SidebarLink to="/vendor/analytics" :icon="ChartBarIcon" :active="route.path.startsWith('/vendor/analytic')">Satış Analizi</SidebarLink>
        <SidebarLink to="/vendor/advertising" :icon="MegaphoneIcon" :active="route.path.startsWith('/vendor/advertising')">Reklam Yönetimi</SidebarLink>
      </SidebarSection>

      <SidebarSection label="Finansal">
        <SidebarLink to="/vendor/financial/invoices" :icon="DocumentDuplicateIcon" :active="route.path.startsWith('/vendor/financial')">Komisyon Faturaları</SidebarLink>
      </SidebarSection>

      <SidebarSection label="Ticari Takas">
        <SidebarLink to="/my/surplus" :icon="SparklesIcon" :active="route.path === '/my/surplus'">Takas İlanlarım</SidebarLink>
      </SidebarSection>

      <SidebarSection label="Ayarlar">
        <SidebarLink to="/vendor/settings" :icon="CogIcon" :active="route.path.startsWith('/vendor/setting')">Ayarlar</SidebarLink>
        <SidebarLink to="/vendor/banners" :icon="PhotoIcon" :active="route.path.startsWith('/vendor/banners')">Banner Yönetimi</SidebarLink>
      </SidebarSection>

      <SidebarSection label="Ekosistem (BazarX Private)">
        <NuxtLink
          to="/vendor/ecosystem"
          class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-900 transition-colors border border-transparent hover:border-indigo-500"
          :class="{ 'bg-indigo-900 border-indigo-500': route.path.startsWith('/vendor/ecosystem') }"
        >
          <ShieldCheckIcon class="h-5 w-5 mr-3 text-indigo-400" /> Ekosistem Yönetimi
        </NuxtLink>
      </SidebarSection>
    </nav>

    <!-- User Menu -->
    <div class="p-4 border-t border-gray-800">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-medium overflow-hidden">
            <img v-if="avatarUrl" :src="avatarUrl" class="w-full h-full object-cover">
            <span v-else>{{ fullName.charAt(0) || 'S' }}</span>
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

// Inline mini-components for DRY nav items
const SidebarSection = defineComponent({
  props: { label: String },
  template: `<div class="pt-4 pb-2"><p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{{ label }}</p></div><slot />`
})

const SidebarLink = defineComponent({
  props: { to: String, icon: Object, active: Boolean },
  template: `
    <NuxtLink :to="to" class="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors" :class="{ 'bg-gray-800': active }">
      <div class="flex items-center"><component :is="icon" class="h-5 w-5 mr-3" /><slot /></div>
      <slot name="badge" />
    </NuxtLink>`
})

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
