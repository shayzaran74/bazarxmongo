<template>
  <div class="sticky top-0 z-[500] transition-all duration-500 w-full pointer-events-none">
    <!-- Premium Top Bar -->
    <div
      class="bg-gray-950 text-gray-400 py-1.5 hidden lg:block relative text-[10px] font-bold tracking-widest uppercase border-b border-white/5 pointer-events-auto"
    >
      <div class="max-w-8xl mx-auto px-6 flex justify-between items-center">
        <!-- Ecosystem Switcher -->
        <div class="flex items-center space-x-1 bg-black/50 p-0.5 rounded-full shadow-inner border border-white/5">
          <button
            v-for="eco in ecosystems"
            :key="eco.id"
            :class="[
              'px-5 py-1.5 rounded-full transition-all duration-300 flex items-center gap-2 relative overflow-hidden group',
              currentEcosystem === eco.id ? eco.activeClass : 'hover:text-white hover:bg-white/10'
            ]"
            @click="$emit('navigate', eco.path)"
          >
            <span class="text-xs group-hover:scale-110 transition-transform">{{ eco.icon }}</span>
            <span>{{ $t(eco.label) }}</span>
          </button>
        </div>

        <!-- Right Side Nav -->
        <div class="flex items-center space-x-6">
          <NuxtLink to="/premium" class="flex items-center text-amber-500 hover:text-amber-400 transition-colors group">
            <SparklesIcon class="h-4 w-4 mr-1.5 group-hover:animate-spin" /> Ticari Takas Premium
          </NuxtLink>

          <!-- Legal & Help Dropdowns (Simplified for component) -->
          <div class="flex items-center space-x-4">
            <NuxtLink to="/help" class="hover:text-white transition-colors flex items-center">
              <QuestionMarkCircleIcon class="h-4 w-4 mr-1" /> {{ $t('nav.help') }}
            </NuxtLink>
            <NuxtLink to="/become-vendor" v-if="!authStore.isVendor" class="text-primary-400 hover:text-primary-300">
              {{ $t('nav.becomeVendor') }}
            </NuxtLink>
          </div>

          <CommonLanguageSwitcher />
        </div>
      </div>
    </div>

    <!-- Main Header -->
    <header class="w-full relative pointer-events-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div class="w-full px-4 lg:px-8 py-2.5 lg:py-3 flex items-center justify-between gap-4 lg:gap-8 max-w-8xl mx-auto">
        <!-- Logo -->
        <div class="flex items-center group cursor-pointer" @click="$emit('logo-click')">
          <div :class="['relative w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg overflow-hidden ring-2 ring-white dark:ring-gray-800 group-hover:scale-110', logoBgClass]">
            <img v-if="logoUrl" :src="logoUrl" class="w-full h-full object-contain p-2" alt="Logo">
            <ShoppingCartIcon v-else class="h-8 w-8 text-white" />
          </div>
          <div class="ml-3.5 hidden sm:flex flex-col justify-center">
            <span :class="['font-black uppercase tracking-tighter leading-none mb-1 text-xl lg:text-2xl', brandTextClass]">
              {{ brandName }}
            </span>
            <span class="text-[8px] font-black uppercase tracking-[0.2em] italic leading-none opacity-60">
              {{ brandSubtitle }}
            </span>
          </div>
        </div>

        <!-- Search -->
        <div class="hidden lg:flex flex-1 max-w-xl">
          <button @click="$emit('open-search')" class="relative overflow-hidden w-full bg-gray-50/50 hover:bg-white border border-gray-200/50 rounded-full px-5 py-3 text-left transition-all group flex items-center">
            <div class="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center mr-3 group-hover:scale-110 transition-all">
              <MagnifyingGlassIcon class="h-4 w-4 text-gray-500 group-hover:text-primary-600" />
            </div>
            <span class="text-xs font-bold text-gray-400 group-hover:text-gray-600">{{ $t('nav.searchPlaceholder') }}</span>
            <div class="absolute right-3 px-2 py-1.5 rounded-lg bg-gray-100/50 text-[10px] font-black text-gray-400 border border-gray-200/50">⌘ K</div>
          </button>
        </div>

        <!-- Actions -->
        <div class="flex items-center space-x-2 lg:space-x-3">
          <template v-if="authStore.isLoggedIn">
            <NuxtLink v-if="authStore.isAdmin" to="/admin" class="hidden lg:flex items-center space-x-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl border border-red-100 text-[10px] font-black uppercase tracking-widest">
              <Cog6ToothIcon class="h-4 w-4" /> <span>ADMIN</span>
            </NuxtLink>
            <NuxtLink v-else-if="authStore.isVendor" to="/vendor/dashboard" class="hidden lg:flex items-center space-x-1.5 px-3 py-2 bg-green-50 text-green-600 rounded-xl border border-green-100 text-[10px] font-black uppercase tracking-widest">
              <BuildingOffice2Icon class="h-4 w-4" /> <span>MAĞAZAM</span>
            </NuxtLink>
          </template>

          <!-- Profile Dropdown -->
          <div class="hidden lg:flex items-center p-1 bg-gray-50 rounded-full border border-gray-100 relative group/profile">
            <button @click="$emit('open-location')" class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white text-gray-500 hover:text-primary-600 transition-all">
              <MapPinIcon class="h-5 w-5" />
            </button>
            <div class="w-px h-6 bg-gray-200 mx-1" />
            <button @click="showUserDropdown = !showUserDropdown" class="flex items-center gap-2 pr-3 pl-1 py-1 rounded-full hover:bg-white transition-all">
              <div class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center border border-white overflow-hidden">
                <img v-if="authStore.avatarUrl" :src="authStore.avatarUrl" class="w-full h-full object-cover">
                <UserIcon v-else class="h-4 w-4 text-primary-600" />
              </div>
              <div class="text-left hidden xl:block leading-none">
                <p class="text-[9px] font-black text-gray-400 uppercase mb-0.5">{{ authStore.balance ? formatPrice(authStore.balance) : 'HESABIM' }}</p>
                <p class="text-[11px] font-bold text-gray-700 truncate max-w-[80px]">{{ authStore.isLoggedIn ? authStore.fullName.split(' ')[0] : 'Giriş Yap' }}</p>
              </div>
            </button>

            <!-- User Menu Dropdown -->
            <Transition name="slide-fade">
              <div v-if="showUserDropdown" class="absolute right-0 top-full mt-3 w-72 bg-white rounded-3xl shadow-2xl p-2 border border-gray-100 z-[600]">
                <template v-if="authStore.isLoggedIn">
                  <div class="p-3 bg-gray-50 rounded-2xl mb-2 flex items-center gap-3">
                    <div class="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-gray-100 overflow-hidden">
                      <img v-if="authStore.avatarUrl" :src="authStore.avatarUrl" class="w-full h-full object-cover">
                      <UserIcon v-else class="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p class="text-xs font-black text-gray-900">{{ authStore.fullName }}</p>
                      <p class="text-[10px] font-bold text-primary-600 uppercase">{{ authStore.user?.role }}</p>
                    </div>
                  </div>
                  <div class="space-y-0.5">
                    <NuxtLink to="/profile" class="flex items-center space-x-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600">
                      <UserIcon class="h-4 w-4 text-gray-400" /><span>Profilim</span>
                    </NuxtLink>
                    <NuxtLink to="/orders" class="flex items-center space-x-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600">
                      <ShoppingBagIcon class="h-4 w-4 text-gray-400" /><span>Siparişlerim</span>
                    </NuxtLink>
                    <button @click="logout" class="flex items-center space-x-3 w-full px-3 py-2.5 hover:bg-red-50 text-red-600 rounded-xl text-left text-xs font-bold">
                      <ArrowLeftOnRectangleIcon class="h-4 w-4 text-red-400" /> <span>Çıkış Yap</span>
                    </button>
                  </div>
                </template>
                <template v-else>
                  <NuxtLink to="/auth/login" class="flex items-center justify-center w-full py-3 bg-gray-900 text-white rounded-xl text-xs font-black uppercase hover:bg-primary-600 transition-all mb-2">GİRİŞ YAP</NuxtLink>
                  <NuxtLink to="/auth/register" class="flex items-center justify-center w-full py-2.5 text-gray-500 hover:text-gray-900 text-xs font-bold text-center">Kayıt Ol</NuxtLink>
                </template>
              </div>
            </Transition>
          </div>

          <!-- Notification Bell -->
          <CommonNotificationBell v-if="authStore.isLoggedIn" class="hidden lg:block" />

          <!-- Cart Button -->
          <NuxtLink to="/cart" class="group relative flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gray-900 hover:bg-primary-600 text-white shadow-xl transition-all duration-500">
            <ShoppingCartIcon class="h-5 w-5 lg:h-6 lg:w-6 group-hover:rotate-12" />
            <div v-if="cartStore.itemCount > 0" class="absolute -top-1 -right-1 flex h-5 w-5 lg:h-6 lg:w-6">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40" />
              <span class="relative inline-flex rounded-full h-full w-full bg-white text-gray-900 items-center justify-center text-[10px] lg:text-xs font-black shadow-sm ring-2 ring-gray-900">
                {{ cartStore.itemCount }}
              </span>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Mobile Search -->
      <div class="lg:hidden mt-3 mb-1 px-4">
        <button @click="$emit('open-search')" class="w-full bg-white border border-gray-200 shadow-sm rounded-2xl px-5 py-3.5 text-left flex items-center gap-3">
          <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
          <span class="text-sm font-medium text-gray-400">{{ $t('nav.mobileSearchPlaceholder') }}</span>
        </button>
      </div>

      <!-- MegaMenu -->
      <div class="hidden lg:block w-full border-t border-gray-100 bg-white shadow-sm overflow-x-auto">
        <div class="max-w-7xl mx-auto px-6 py-1">
          <LayoutMegaMenu :categories="categories" :loading="loading" />
        </div>
      </div>
    </header>
  </div>
</template>

<script setup lang="ts">
import { 
  ShoppingCartIcon, BriefcaseIcon, BuildingOffice2Icon, HeartIcon, UserIcon, 
  Cog6ToothIcon, ShoppingBagIcon, MapPinIcon, MagnifyingGlassIcon, SparklesIcon,
  QuestionMarkCircleIcon, PhoneIcon, ArrowLeftOnRectangleIcon
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  currentEcosystem: string
  brandName: string
  brandSubtitle: string
  logoUrl?: string
  categories: any[]
  loading?: boolean
}>()

const authStore = useAuthStore()
const cartStore = useCartStore()
const showUserDropdown = ref(false)

const ecosystems = [
  { id: 'bazarx', label: 'nav.ecoBazarX', icon: '🛒', path: '/', activeClass: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' },
  { id: 'ticaritakas', label: 'nav.ecoTicariTakas', icon: '🏭', path: '/surplus', activeClass: 'bg-gradient-to-r from-primary-600 to-blue-600 text-white' },
  { id: 'barterborsa', label: 'nav.ecoBarterBorsa', icon: '💼', path: '/barterborsa', activeClass: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white' }
]

const logoBgClass = computed(() => {
  if (props.currentEcosystem === 'bazarx') return 'bg-gradient-to-br from-purple-600 to-indigo-600'
  if (props.currentEcosystem === 'barterborsa') return 'bg-gradient-to-br from-amber-500 to-orange-600'
  return 'bg-gradient-to-br from-primary-600 to-primary-800'
})

const brandTextClass = computed(() => {
  if (props.currentEcosystem === 'bazarx') return 'text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-700'
  if (props.currentEcosystem === 'barterborsa') return 'text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600'
  return 'text-transparent bg-clip-text bg-gradient-to-r from-primary-700 to-primary-900'
})

const formatPrice = (p: number) => {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p || 0)
}

const logout = async () => {
  await authStore.logout()
  // navigateTo logic is already handled in authStore.logout if needed, 
  // but let's ensure it points to the correct place
  navigateTo('/auth/login')
}
</script>
