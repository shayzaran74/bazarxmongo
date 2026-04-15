<template>
  <div class="min-h-screen bg-mesh pb-20 lg:pb-0 relative font-sans selection:bg-primary-500 selection:text-white" style="overflow-x: clip;">
    <!-- ===== MODULAR HEADER ===== -->
    <AppHeader />

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
const cartStore = useCartStore();
const itemCount = computed(() => cartStore.itemCount || 0);
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
