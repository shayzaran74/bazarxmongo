<template>
  <div class="sticky top-0 z-[500] transition-all duration-500 w-full">
    <!-- Premium Top Bar -->
    <div class="bg-dark-950 text-gray-400 py-1.5 hidden lg:block border-b border-white/5">
      <div class="max-w-8xl mx-auto px-6 flex justify-between items-center text-[10px] font-black tracking-widest uppercase italic">
        <!-- Ecosystem Switcher -->
        <div class="flex items-center space-x-1 bg-black/50 p-0.5 rounded-full border border-white/5">
          <button class="px-5 py-1.5 rounded-full bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-lg">
            🛒 BAZARX
          </button>
          <button class="px-5 py-1.5 rounded-full hover:text-white transition-colors">
            🏭 Ticari Takas
          </button>
          <button class="px-5 py-1.5 rounded-full hover:text-white transition-colors">
            💼 Barter Borsa
          </button>
        </div>

        <!-- Right Nav -->
        <div class="flex items-center space-x-6">
          <NuxtLink to="/premium" class="text-accent-500 hover:text-accent-400 transition-colors flex items-center">
            <Icon name="heroicons:sparkles" class="w-3 h-3 mr-1" />
            PREMIUM 2026
          </NuxtLink>
          <div class="w-px h-3 bg-white/10" />
          <div class="flex items-center space-x-4">
            <NuxtLink to="/help" class="hover:text-white transition-colors uppercase tracking-widest">Yardım</NuxtLink>
            <NuxtLink to="/legal/terms" class="hover:text-white transition-colors uppercase tracking-widest">Kurumsal</NuxtLink>
            <div class="flex items-center space-x-1 cursor-pointer hover:text-white transition-colors">
              <span>TR</span>
              <Icon name="heroicons:chevron-down" class="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Premium Header -->
    <header class="w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300">
      <div class="max-w-8xl mx-auto px-4 lg:px-8 py-3.5 flex items-center justify-between gap-8">
        <!-- Logo Section -->
        <NuxtLink to="/" class="flex items-center group">
          <div class="w-12 h-12 lg:w-14 lg:h-14 bg-dark-950 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 overflow-hidden relative">
            <span class="text-xl lg:text-2xl font-display font-black text-white italic">BX</span>
            <div class="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-transparent" />
          </div>
          <div class="ml-4 flex flex-col justify-center">
             <span class="font-display font-black text-2xl lg:text-3xl tracking-tighter text-dark-950 leading-none mb-1">BAZARX</span>
             <span class="text-[8px] font-black text-primary-600 uppercase tracking-[0.3em] leading-none">Pazarın Geleceği</span>
          </div>
        </NuxtLink>

        <!-- Search Bar -->
        <div class="hidden lg:flex flex-1 max-w-xl">
          <SearchBar />
        </div>

        <!-- Actions -->
        <div class="flex items-center space-x-3">
          <!-- User Profile Dropdown -->
          <div class="relative group">
            <button v-if="isLoggedIn" class="flex items-center space-x-3 p-1.5 pr-4 bg-gray-50 border border-gray-100 rounded-full hover:bg-white hover:shadow-xl transition-all duration-300">
               <div class="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center font-black text-white text-xs border-2 border-white shadow-md overflow-hidden">
                  <img v-if="avatarUrl" :src="avatarUrl" class="w-full h-full object-cover" />
                  <span v-else>{{ fullName?.charAt(0).toUpperCase() || 'U' }}</span>
               </div>
               <div class="text-left hidden xl:block leading-none">
                  <p class="text-[11px] font-black text-dark-950 mb-1 line-clamp-1 max-w-[100px]">{{ fullName }}</p>
                  <p class="text-[9px] font-bold text-primary-600 tracking-tighter uppercase">{{ isAdmin ? 'Admin' : (isVendor ? 'Satıcı' : userRole) }}</p>
               </div>
            </button>
            <NuxtLink v-else to="/auth/login" class="flex items-center space-x-2 px-6 py-4 bg-dark-950 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg active:scale-95">
               <Icon name="heroicons:user" class="w-4 h-4" />
               <span>Giriş Yap</span>
            </NuxtLink>
            
            <!-- Advanced Dropdown -->
            <div v-if="isLoggedIn" class="absolute right-0 top-full pt-3 w-64 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-500 z-[600]">
               <div class="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-2 border border-gray-100 relative before:absolute before:-top-3 before:left-0 before:w-full before:h-3 before:content-['']">
               <div class="p-4 bg-gray-50 rounded-2xl mb-2 flex items-center justify-between">
                   <div>
                     <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cüzdan</p>
                     <p class="text-sm font-black text-dark-950 leading-none">{{ walletBalance }}</p>
                   </div>
                   <NuxtLink to="/wallet" class="p-2 bg-white rounded-xl text-primary-600 hover:bg-primary-600 hover:text-white transition-all shadow-sm">
                     <Icon name="heroicons:plus" class="w-4 h-4" />
                   </NuxtLink>
               </div>
               <NuxtLink to="/profile" class="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-2xl transition-colors group/item">
                  <Icon name="heroicons:user-circle" class="w-5 h-5 text-gray-400 group-hover/item:text-primary-600" />
                  <span class="text-xs font-black text-gray-600 tracking-tight">Profilim</span>
               </NuxtLink>
               <NuxtLink to="/profile/addresses" class="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-2xl transition-colors group/item">
                  <Icon name="heroicons:map-pin" class="w-5 h-5 text-gray-400 group-hover/item:text-primary-600" />
                  <span class="text-xs font-black text-gray-600 tracking-tight">Adreslerim</span>
               </NuxtLink>
               <NuxtLink v-if="isAdmin" to="/admin" class="flex items-center space-x-3 p-3 hover:bg-red-50 text-red-600 rounded-2xl transition-colors group/item">
                  <Icon name="heroicons:cog-6-tooth" class="w-5 h-5 text-red-400 group-hover/item:text-red-600" />
                  <span class="text-xs font-black tracking-tight uppercase">Yönetici Paneli</span>
               </NuxtLink>
               <div class="h-px bg-gray-100 my-2 mx-3" />
               <button @click="logout" class="flex items-center space-x-3 p-3 w-full hover:bg-red-50 text-red-600 rounded-2xl transition-colors group/item text-left">
                  <Icon name="heroicons:arrow-left-on-rectangle" class="w-5 h-5 text-red-400 group-hover/item:text-red-600" />
                  <span class="text-xs font-black tracking-tight">Güvenli Çıkış</span>
               </button>
               </div>
            </div>
          </div>

          <!-- Shopping Cart -->
          <NuxtLink to="/cart" class="relative group h-12 w-12 lg:h-14 lg:w-14 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-xl hover:bg-primary-700 hover:-translate-y-1 transition-all duration-500 overflow-hidden">
             <Icon name="heroicons:shopping-cart" class="w-6 h-6 z-10" />
             <span v-if="itemCount > 0" class="absolute top-2 right-2 w-5 h-5 bg-white text-dark-950 text-[9px] font-black rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">{{ itemCount }}</span>
             <div class="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </NuxtLink>
        </div>
      </div>
    </header>
  </div>
</template>

<script setup lang="ts">
const { isLoggedIn, fullName, avatarUrl, user, userRole, isAdmin, isVendor, logout } = useAuth();
const cartStore = useCartStore();
const { formatPrice } = useFormat();

const itemCount = computed(() => cartStore.itemCount || 0);
const walletBalance = computed(() => formatPrice(user.value?.Wallet?.balance || 0));
</script>
