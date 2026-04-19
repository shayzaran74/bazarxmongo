<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-900 text-white flex flex-col">
      <!-- Logo -->
      <div class="p-4 border-b border-gray-800">
        <NuxtLink
          to="/admin"
          class="flex items-center space-x-2"
        >
          <span class="text-2xl">🏭</span>
          <span class="text-lg font-semibold">TicariTakas</span>
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
      <nav class="flex-1 overflow-y-auto px-2 space-y-6 pb-20 custom-scrollbar">
        <div
          v-for="section in navigation"
          :key="section.title || 'main'"
          class="space-y-1"
        >
          <p
            v-if="section.title"
            class="px-3 py-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]"
          >
            {{ section.title }}
          </p>

          <div
            v-for="item in section.items"
            :key="item.to"
          >
            <!-- Normal Link -->
            <NuxtLink
              v-if="!item.children"
              :to="item.to"
              class="group flex items-center px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200"
              :class="[
                $route.path === item.to || (item.activePath && $route.path.startsWith(item.activePath))
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              ]"
            >
              <component
                :is="item.icon"
                class="h-5 w-5 mr-3 transition-transform group-hover:scale-110"
              />
              <span class="truncate">{{ item.label }}</span>
            </NuxtLink>

            <!-- Collapsible Menu -->
            <div
              v-else
              class="space-y-1"
            >
              <button
                class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
                @click="item.isOpen = !item.isOpen"
              >
                <div class="flex items-center">
                  <component
                    :is="item.icon"
                    class="h-5 w-5 mr-3"
                  />
                  <span>{{ item.label }}</span>
                </div>
                <ChevronDownIcon
                  class="h-4 w-4 transition-transform duration-200"
                  :class="{ 'rotate-180': item.isOpen }"
                />
              </button>
              <div
                v-show="item.isOpen"
                class="pl-4 space-y-1"
              >
                <NuxtLink
                  v-for="child in item.children"
                  :key="child.to"
                  :to="child.to"
                  class="flex items-center px-3 py-2 rounded-lg text-xs font-bold transition-colors"
                  :class="[
                    $route.path === child.to ? 'text-primary-400 bg-primary-400/10' : 'text-gray-500 hover:text-white hover:bg-gray-800'
                  ]"
                >
                  <component
                    :is="child.icon"
                    v-if="child.icon"
                    class="h-4 w-4 mr-3"
                  />
                  {{ child.label }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- User Menu -->
      <div class="p-4 border-t border-gray-800 bg-gray-950/50 backdrop-blur-md">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3 overflow-hidden">
            <div
              class="w-10 h-10 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg"
            >
              {{ authStore.fullName.charAt(0) || 'A' }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-black text-white truncate">
                {{ authStore.fullName || 'Admin' }}
              </p>
              <p class="text-[10px] font-bold text-gray-500 truncate capitalize">
                {{ authStore.user?.role || 'Yönetici'
                }}
              </p>
            </div>
          </div>
          <button
            class="p-2 text-gray-400 hover:text-rose-400 transition-colors"
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
      <header
        class="bg-white/80 backdrop-blur-xl border-b border-gray-100 px-8 py-5 flex items-center justify-between z-10"
      >
        <div class="flex items-center gap-6">
          <h1 class="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div class="w-2 h-8 bg-primary-600 rounded-full" />
            {{ pageTitle }}
          </h1>
        </div>

        <div class="flex items-center gap-4">
          <button class="relative p-2.5 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-2xl transition-all">
            <BellIcon class="h-6 w-6" />
            <span class="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full" />
          </button>

          <div class="h-8 w-px bg-gray-100 mx-2" />

          <NuxtLink
            to="/"
            class="group inline-flex items-center px-6 py-2.5 bg-gray-900 text-white rounded-2xl text-sm font-black hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
          >
            <EyeIcon class="h-4 w-4 mr-2 transition-transform group-hover:scale-125" />
            SİTEYİ GÖR
          </NuxtLink>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto bg-[#FBFBFE] custom-scrollbar">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import {
  HomeIcon, ShoppingBagIcon, BanknotesIcon, TagIcon, CubeIcon,
  ArrowsRightLeftIcon, GiftIcon, UsersIcon, StarIcon,
  CurrencyDollarIcon, TicketIcon, ArrowRightOnRectangleIcon, BellIcon,
  EyeIcon, WalletIcon, Cog6ToothIcon, InboxIcon, UserGroupIcon,
  MegaphoneIcon, SparklesIcon, BuildingOfficeIcon,
  ChevronDownIcon, PhotoIcon, ChartBarIcon, ClipboardDocumentListIcon,
  CloudIcon, ChatBubbleLeftRightIcon, QuestionMarkCircleIcon,
  ClipboardDocumentCheckIcon, ShieldCheckIcon, ArrowTopRightOnSquareIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// Menu State
const isSanayiMenuOpen = ref(true)
const isSettingsMenuOpen = ref(true)

// Navigation Definition
const navigation = computed(() => [
  {
    title: null,
    items: [
      { label: 'Ana Sayfa', to: '/admin', icon: HomeIcon }
    ]
  },
  {
    title: 'Satış Kanalları',
    items: [
      { label: 'Siparişler', to: '/admin/orders', activePath: '/admin/order', icon: InboxIcon },
      { label: 'Ürünler', to: '/admin/products', activePath: '/admin/product', icon: ShoppingBagIcon },
      { label: 'Kategoriler', to: '/admin/categories', activePath: '/admin/categor', icon: TagIcon }
    ]
  },
  {
    title: 'Ticari Takas (Sanayi)',
    items: [
      {
        label: 'Takas Merkezi',
        icon: BuildingOfficeIcon,
        isOpen: isSanayiMenuOpen.value,
        children: [
          { label: 'Firma Onayları', to: '/admin/company-approvals', icon: BuildingOfficeIcon },
          { label: 'İlan Onayları', to: '/admin/surplus-approvals', icon: SparklesIcon },
          { label: 'İstek Onayları', to: '/admin/wanted-items', icon: ClipboardDocumentListIcon },
          { label: 'Teklif Onayları', to: '/admin/offers', icon: ArrowsRightLeftIcon },
          { label: 'Takas Geçmişi', to: '/admin/trade-history', icon: ArrowsRightLeftIcon },
          { label: 'Barter Kategorileri', to: '/admin/barter-categories', icon: TagIcon },
          { label: 'Barter Yönetimi', to: '/admin/barter', icon: BanknotesIcon },
          { label: 'Akıllı Eşleştirme', to: '/admin/barter/matching', icon: SparklesIcon },
          { label: 'Talep Eşleştirme', to: '/admin/demand-matching', icon: UserGroupIcon },
          { label: '🔭 Watchtower', to: '/admin/chat-monitor', icon: ChatBubbleLeftRightIcon },
          { label: '🏢 Ekosistem', to: '/admin/ecosystems', icon: SparklesIcon }
        ]
      }
    ]
  },
  {
    title: 'Katalog & Operasyon',
    items: [
      { label: 'Marka Yönetimi', to: '/admin/brands', activePath: '/admin/brand', icon: TagIcon },
      { label: 'Envanter', to: '/admin/inventory', icon: CubeIcon },
      { label: 'Aktarımlar', to: '/admin/transfers', activePath: '/admin/transfer', icon: ArrowsRightLeftIcon },
      { label: 'Hediye Kartları', to: '/admin/gift-cards', activePath: '/admin/gift-card', icon: GiftIcon },
      { label: 'Kupon Yönetimi', to: '/admin/coupons', icon: TicketIcon },
      { label: 'Rozet (Badge)', to: '/admin/badge-rules', icon: SparklesIcon }
    ]
  },
  {
    title: 'Finans & CRM',
    items: [
      { label: 'Standart Analitik', to: '/admin/analytics', icon: ChartBarIcon },
      { label: 'Gelişmiş Analitik (OLAP)', to: '/admin/analytics/olap', icon: SparklesIcon },
      { label: 'Kullanıcılar', to: '/admin/users', activePath: '/admin/user', icon: UsersIcon },
      { label: 'Sadakat & Ödüller', to: '/admin/loyalty', icon: GiftIcon },
      { label: 'Cüzdan Onayları', to: '/admin/wallet', icon: WalletIcon },
      { label: 'Para Çekme Talepleri', to: '/admin/wallet?tab=withdrawal', icon: CurrencyDollarIcon },
      { label: 'Genel Mizan (Ledger)', to: '/admin/ledger-dashboard', icon: ChartBarIcon },
      { label: 'Satıcılar', to: '/admin/vendors', icon: ShoppingBagIcon },
      { label: 'Hak Edişler', to: '/admin/payouts', icon: CurrencyDollarIcon },
      { label: 'Yorumlar', to: '/admin/reviews', activePath: '/admin/review', icon: StarIcon },
      { label: 'Reklam Yönetimi', to: '/admin/advertising', icon: MegaphoneIcon }
    ]
  },
  {
    title: 'Sistem & İçerik',
    items: [
      {
        label: 'Ana Sayfa Ayarları',
        icon: Cog6ToothIcon,
        isOpen: isSettingsMenuOpen.value,
        children: [
          { label: 'Ticari Takas', to: '/admin/settings/anasayfaticaritakas' },
          { label: 'BazarX', to: '/admin/settings/anasayfabazarx' },
          { label: 'Barter Borsa', to: '/admin/settings/anasayfabarterborsa' },
          { label: 'Yan Reklamlar', to: '/admin/settings/side-ads' }
        ]
      },
      { label: 'Banner Yönetimi', to: '/admin/banners', icon: PhotoIcon },
      { label: 'İçerik Yönetimi', to: '/admin/content', icon: MegaphoneIcon },
      { label: 'Yardım Merkezi', to: '/admin/help', icon: QuestionMarkCircleIcon }
    ]
  },
  ...(authStore.isSuperAdmin ? [
    {
      title: 'Super Admin',
      items: [
        { label: 'Tier (Seviye) Yönetimi', to: '/admin/tier-management', icon: ChartBarIcon },
        { label: 'MinIO Arşivi', to: '/admin/minio-archive', icon: CloudIcon },
        { label: 'Denetim (Audit)', to: '/admin/audit-logs', icon: ClipboardDocumentCheckIcon },
        { label: 'Yetki Matrisi (RBAC)', to: '/admin/permissions', icon: ShieldCheckIcon },
        { label: 'MinIO Console ↗', to: 'http://localhost:9001', icon: ArrowTopRightOnSquareIcon }
      ]
    }
  ] : [])
])

// Dynamic page title mapping (same as before but cleaner)
const routeTitles = {
  '/admin': 'Dashboard',
  '/admin/payouts': 'Hak Ediş Yönetimi',
  '/admin/tier-management': 'Satıcı Seviye (Tier) Yönetimi',
  '/admin/ledger-dashboard': '📒 Genel Mizan — Ledger Dashboard',
  '/admin/marketing': 'Pazarlama Analitiği',
  '/admin/advertising': 'Reklam Yönetimi'
}

const pageTitle = computed(() => {
  const path = route.path
  if (routeTitles[path]) return routeTitles[path]

  // Generic mapping logic
  const segments = path.split('/').filter(Boolean)
  if (segments.length > 1) {
    const last = segments[segments.length - 1]
    return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, ' ')
  }
  return 'Admin Paneli'
})

onMounted(async () => {
  await authStore.init()
  if (!authStore.isAuthenticated) {
    router.push('/auth/login')
  } else if (!authStore.isAdmin) {
    console.warn('🚫 Admin Layout: Access denied, redirecting to home...', { role: authStore.user?.role })
    router.push('/')
  }
})

const handleLogout = async () => {
  try {
    await authStore.logout()
    useNuxtApp().$toast.success('Çıkış yapıldı!')
    router.push('/login')
  } catch (error) {
    useNuxtApp().$toast.error('Hata oluştu!')
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
