<template>
  <div class="min-h-screen bg-mesh pb-20 lg:pb-0 relative font-sans selection:bg-primary-500 selection:text-white" style="overflow-x: clip;">
    <!-- ===== STICKY HEADER BLOCK ===== -->
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

           <!-- Search Bar (Pill Design) -->
           <div class="hidden lg:flex flex-1 max-w-xl group">
              <div class="relative w-full">
                <input 
                  type="text" 
                  class="w-full bg-gray-50/50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold focus:bg-white focus:border-primary-500/30 transition-all outline-none shadow-sm group-hover:shadow-md"
                  :placeholder="$t('nav.searchPlaceholder')"
                />
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icon name="heroicons:magnifying-glass" class="w-5 h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                </div>
                <div class="absolute right-4 inset-y-0 flex items-center space-x-1">
                   <kbd class="px-2 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-black text-gray-400">⌘</kbd>
                   <kbd class="px-2 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-black text-gray-400">K</kbd>
                </div>
              </div>
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
                      <p class="text-[11px] font-black text-dark-950 mb-1">{{ fullName }}</p>
                      <p class="text-[9px] font-bold text-primary-600 tracking-tighter uppercase">{{ isAdmin ? 'Admin' : (isVendor ? 'Satıcı' : userRole) }}</p>
                   </div>
                </button>
                <NuxtLink v-else to="/auth/login" class="flex items-center space-x-2 px-6 py-4 bg-dark-950 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg active:scale-95">
                   <Icon name="heroicons:user" class="w-4 h-4" />
                   <span>{{ $t('common.login') }}</span>
                </NuxtLink>
                
                <!-- Advanced Dropdown -->
                <div v-if="isLoggedIn" class="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-2 border border-gray-100 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-500 z-[600]">
                   <div class="p-3 bg-gray-50 rounded-2xl mb-2">
                       <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cüzdan Bakiyesi</p>
                       <p class="text-sm font-black text-dark-950 leading-none">{{ formatPrice(user?.Wallet?.balance || 0) }}</p>
                   </div>
                   <NuxtLink to="/profile" class="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-2xl transition-colors group/item">
                      <Icon name="heroicons:user-circle" class="w-5 h-5 text-gray-400 group-hover/item:text-primary-600" />
                      <span class="text-xs font-black text-gray-600 tracking-tight">Profilim</span>
                   </NuxtLink>
                   <NuxtLink v-if="isAdmin" to="/admin" class="flex items-center space-x-3 p-3 hover:bg-red-50 text-red-600 rounded-2xl transition-colors group/item">
                      <Icon name="heroicons:cog-6-tooth" class="w-5 h-5 text-red-400 group-hover/item:text-red-600" />
                      <span class="text-xs font-black tracking-tight uppercase">Yönetici Paneli</span>
                   </NuxtLink>
                   <button @click="logout" class="flex items-center space-x-3 p-3 w-full hover:bg-red-50 text-red-600 rounded-2xl transition-colors group/item">
                      <Icon name="heroicons:arrow-left-on-rectangle" class="w-5 h-5 text-red-400 group-hover/item:text-red-600" />
                      <span class="text-xs font-black tracking-tight">Güvenli Çıkış</span>
                   </button>
                </div>
             </div>

             <!-- Shopping Cart Pill -->
             <NuxtLink to="/cart" class="relative group h-12 w-12 lg:h-14 lg:w-14 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-xl hover:bg-primary-700 hover:-translate-y-1 transition-all duration-500 overflow-hidden">
                <Icon name="heroicons:shopping-cart" class="w-6 h-6 z-10" />
                <span class="absolute top-2 right-2 w-5 h-5 bg-white text-dark-950 text-[9px] font-black rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">{{ itemCount }}</span>
                <div class="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             </NuxtLink>
           </div>
        </div>
      </header>
    </div>

    <!-- Main Content Housing -->
    <main class="max-w-8xl mx-auto px-4 lg:px-8 py-8 relative z-10 min-h-[70vh]">
       <slot />
    </main>

    <!-- Premium Footer Section -->
    <footer class="bg-white border-t border-gray-100 pt-20 pb-10">
      <div class="max-w-8xl mx-auto px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div class="col-span-1 lg:col-span-1">
             <div class="flex items-center mb-6">
                <div class="w-10 h-10 bg-dark-950 rounded-xl flex items-center justify-center shadow-xl mr-3">
                   <span class="text-lg font-display font-black text-white italic">BX</span>
                </div>
                <span class="font-display font-black text-2xl tracking-tighter text-dark-950 leading-none">BAZARX</span>
             </div>
             <p class="text-gray-400 text-sm font-medium leading-relaxed mb-8">
               Türkiye'nin en gelişmiş ticari takas ve barter platformu. İşletmeniz için yeni nesil ticaret deneyimi.
             </p>
             <div class="flex space-x-4">
                <a href="#" class="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-primary-500 hover:text-white transition-all"><Icon name="uil:facebook-f" /></a>
                <a href="#" class="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-primary-500 hover:text-white transition-all"><Icon name="uil:instagram" /></a>
                <a href="#" class="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-primary-500 hover:text-white transition-all"><Icon name="uil:linkedin-alt" /></a>
             </div>
          </div>
          
          <div>
            <h4 class="text-[10px] font-black text-dark-950 uppercase tracking-[0.2em] mb-8">Platform</h4>
            <ul class="space-y-4">
              <li><NuxtLink to="/products" class="text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors">Ürünler</NuxtLink></li>
              <li><NuxtLink to="/barter" class="text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors">Takas Havuzu</NuxtLink></li>
              <li><NuxtLink to="/premium" class="text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors">Premium</NuxtLink></li>
            </ul>
          </div>

          <div>
            <h4 class="text-[10px] font-black text-dark-950 uppercase tracking-[0.2em] mb-8">Destek</h4>
            <ul class="space-y-4">
              <li><NuxtLink to="/help" class="text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors">Yardım Merkezi</NuxtLink></li>
              <li><NuxtLink to="/contact" class="text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors">İletişim</NuxtLink></li>
              <li><NuxtLink to="/faq" class="text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors">Sıkça Sorulanlar</NuxtLink></li>
            </ul>
          </div>

          <div>
            <h4 class="text-[10px] font-black text-dark-950 uppercase tracking-[0.2em] mb-8">Hukuki</h4>
            <ul class="space-y-4">
              <li><NuxtLink to="/legal/privacy" class="text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors">Gizlilik Politikası</NuxtLink></li>
              <li><NuxtLink to="/legal/terms" class="text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors">Kullanım Şartları</NuxtLink></li>
              <li><NuxtLink to="/legal/kvkk" class="text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors">KVKK Aydınlatma</NuxtLink></li>
            </ul>
          </div>
        </div>

        <div class="pt-10 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
           <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">© 2026 BAZARX. TÜM HAKLARI SAKLIDIR.</p>
           <div class="flex items-center space-x-1 grayscale opacity-50">
              <div class="px-2 py-1 bg-gray-100 rounded text-[9px] font-bold">VISA</div>
              <div class="px-2 py-1 bg-gray-100 rounded text-[9px] font-bold">MASTERCARD</div>
              <div class="px-2 py-1 bg-gray-100 rounded text-[9px] font-bold">IYZICO</div>
           </div>
        </div>
      </div>
    </footer>

    <!-- Mobile Navigation (5-item balanced) -->
    <nav class="lg:hidden fixed bottom-4 left-4 right-4 h-16 bg-dark-950/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/10 flex items-center justify-around px-2 z-[600]">
       <NuxtLink to="/" class="flex flex-col items-center justify-center space-y-1 group" active-class="text-primary-400">
          <Icon name="heroicons:home" class="w-6 h-6" />
          <span class="text-[8px] font-black uppercase tracking-widest">Ana Sayfa</span>
       </NuxtLink>
       <NuxtLink to="/products" class="flex flex-col items-center justify-center space-y-1 group" active-class="text-primary-400">
          <Icon name="heroicons:rectangle-group" class="w-6 h-6" />
          <span class="text-[8px] font-black uppercase tracking-widest">Ürünler</span>
       </NuxtLink>
       <NuxtLink to="/cart" class="relative flex items-center justify-center -translate-y-8">
          <div class="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/40 border-4 border-white">
             <Icon name="heroicons:shopping-cart" class="w-7 h-7 text-white" />
          </div>
          <span v-if="itemCount > 0" class="absolute -top-1 -right-1 w-6 h-6 bg-accent-500 text-dark-950 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">{{ itemCount }}</span>
       </NuxtLink>
       <NuxtLink to="/barter" class="flex flex-col items-center justify-center space-y-1 group" active-class="text-primary-400">
          <Icon name="heroicons:arrows-right-left" class="w-6 h-6" />
          <span class="text-[8px] font-black uppercase tracking-widest">Takas</span>
       </NuxtLink>
       <NuxtLink to="/profile" class="flex flex-col items-center justify-center space-y-1 group" active-class="text-primary-400">
          <Icon name="heroicons:user" class="w-6 h-6" />
          <span class="text-[8px] font-black uppercase tracking-widest">Profil</span>
       </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
const { isLoggedIn, fullName, avatarUrl, user, userRole, isAdmin, isVendor, logout } = useAuth();
const cartStore = useCartStore();

const itemCount = computed(() => cartStore.itemCount || 0);

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
};
</script>

<style>
.bg-mesh {
  background-image: 
    radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.05) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(244, 63, 94, 0.05) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(20, 184, 166, 0.05) 0px, transparent 50%),
    radial-gradient(at 0% 100%, rgba(245, 158, 11, 0.05) 0px, transparent 50%);
  background-size: 100% 100%;
  background-attachment: fixed;
}

/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(10px);
  filter: blur(10px);
}
</style>
