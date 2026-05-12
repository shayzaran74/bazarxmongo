<!-- apps/frontend/pages/bazarx-go/live-tracking.vue -->
<template>
  <div class="bazarx-go min-h-screen bg-[var(--bg)] text-[var(--ink)] antialiased flex flex-col">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
      <div class="max-w-[1280px] mx-auto px-5 h-20 flex justify-between items-center">
        <div class="flex items-center gap-6">
          <NuxtLink to="/bazarx-go" class="font-black text-xl text-[var(--brand-deep)]">BazarX Go</NuxtLink>
          <nav class="hidden md:flex items-center gap-4">
            <a class="text-sm text-black/50 hover:text-[var(--brand-deep)] transition-colors" href="#">Marketplace</a>
            <a class="text-[var(--brand-deep)] border-b-2 border-[var(--brand-deep)] pb-1 font-bold" href="#">Active Orders</a>
            <a class="text-sm text-black/50 hover:text-[var(--brand-deep)] transition-colors" href="#">History</a>
            <a class="text-sm text-black/50 hover:text-[var(--brand-deep)] transition-colors" href="#">Rewards</a>
            <a class="text-sm text-black/50 hover:text-[var(--brand-deep)] transition-colors" href="#">Support</a>
          </nav>
        </div>
        <div class="flex items-center gap-3">
          <button class="relative p-2.5 hover:bg-[var(--surface)] rounded-xl transition-all active:scale-90 text-[var(--brand-deep)]">
            <BellIcon class="w-6 h-6" />
            <span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--accent)] ring-2 ring-white"></span>
          </button>
          
          <NuxtLink to="/bazarx-go/cart" class="p-2.5 hover:bg-[var(--surface)] rounded-xl transition-all active:scale-90 text-[var(--brand-deep)] relative">
            <ShoppingBagIcon class="w-6 h-6" />
            <span v-if="cartStore.itemCount > 0" class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[var(--brand)] rounded-full text-[10px] font-black text-white flex items-center justify-center ring-2 ring-white">
              {{ cartStore.itemCount }}
            </span>
          </NuxtLink>

          <!-- User Profile -->
          <div v-if="authStore.isLoggedIn" class="relative group/user ml-2">
            <button class="flex items-center gap-2 p-1 bg-[var(--surface)] hover:bg-[var(--surface-2)] rounded-full transition-all group border border-transparent hover:border-[var(--brand)]/20">
              <div class="w-8 h-8 rounded-full bg-[var(--brand)]/10 flex items-center justify-center overflow-hidden border border-[var(--brand)]/20 shadow-sm">
                <img v-if="authStore.avatarUrl" :src="authStore.avatarUrl" class="w-full h-full object-cover">
                <UserCircleIcon v-else class="w-5 h-5 text-[var(--brand-deep)]" />
              </div>
              <ChevronDownIcon class="w-3.5 h-3.5 text-black/30 group-hover:rotate-180 transition-transform mr-1" />
            </button>

            <!-- Dropdown Menu -->
            <div class="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-black/[0.06] p-2 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all z-50">
              <div class="px-3 py-2 mb-1 border-b border-black/[0.04]">
                <p class="text-[10px] font-black text-black/40 uppercase tracking-widest">Giriş Yapıldı</p>
                <p class="text-xs font-bold text-[var(--ink)] truncate">{{ authStore.user?.email }}</p>
              </div>
              <NuxtLink to="/profile" class="flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--surface)] rounded-xl text-xs font-bold text-[var(--ink)] transition-colors">
                <UserCircleIcon class="w-4 h-4 text-black/40" />
                Profilim
              </NuxtLink>
              <NuxtLink to="/orders" class="flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--surface)] rounded-xl text-xs font-bold text-[var(--ink)] transition-colors">
                <ShoppingBagIcon class="w-4 h-4 text-black/40" />
                Siparişlerim
              </NuxtLink>
              <div class="my-1 border-t border-black/[0.04]"></div>
              <button @click="logout" class="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-xl text-xs font-bold text-red-600 transition-colors text-left">
                <ArrowLeftOnRectangleIcon class="w-4 h-4 text-red-400" />
                Çıkış Yap
              </button>
            </div>
          </div>
          <NuxtLink v-else to="/auth/login" class="bg-[var(--brand-deep)] text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider active:scale-95 transition-all">
            Giriş Yap
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow relative flex flex-col overflow-hidden">
      <!-- Map Background with Blur Overlay -->
      <div class="absolute inset-0 z-0 bg-[#e5e7eb] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1521295121783-8a428d7aa7d7?w=1200&h=800&fit=crop" 
          class="w-full h-full object-cover scale-110 blur-[2px] opacity-40"
          alt="Map"
        />
        <div class="absolute inset-0 bg-gradient-to-b from-white/20 to-[var(--bg)]/80 pointer-events-none"></div>
      </div>

      <!-- Tracking Card -->
      <div class="relative z-10 w-full max-w-[1280px] mx-auto px-5 flex-grow flex items-center justify-center">
        <div 
          v-motion
          :initial="{ opacity: 0, scale: 0.95, y: 40 }"
          :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 600, ease: 'easeOut' } }"
          class="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-black/10"
        >
          <!-- Status Header -->
          <div class="p-6 bg-[var(--brand)]/10 border-b border-black/10">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 bg-[var(--brand)] rounded-full animate-pulse shadow-[0_0_12px_rgba(0,195,113,0.6)]"></div>
                <h1 class="text-xl font-black text-[var(--brand-deep)]">Siparişiniz Yolda!</h1>
              </div>
              <div class="w-10 h-10 bg-[var(--brand)]/20 rounded-full flex items-center justify-center">
                <TruckIcon class="w-6 h-6 text-[var(--brand-deep)]" />
              </div>
            </div>
            <p class="text-2xl font-black text-[var(--brand-deep)]">12-15 Dakika</p>
            <p class="text-xs font-bold text-black/40 uppercase tracking-widest mt-1">Tahmini Varış Süresi</p>
          </div>

          <!-- Progress Steps -->
          <div class="px-6 py-6 bg-white">
            <div class="flex justify-between items-center relative">
              <!-- Step Progress Bar -->
              <div class="absolute top-[11px] left-0 w-full h-[2px] bg-black/[0.06] -z-10">
                <div class="h-full bg-[var(--brand)] transition-all duration-1000" style="width: 66%"></div>
              </div>

              <!-- Step 1: Order Received -->
              <div class="flex flex-col items-center gap-2 w-1/3">
                <div class="w-6 h-6 rounded-full bg-[var(--brand)] border-4 border-white shadow-sm flex items-center justify-center">
                  <CheckIcon class="w-3 h-3 text-white" />
                </div>
                <span class="text-[10px] font-black text-[var(--brand-deep)] uppercase tracking-wider text-center">Sipariş<br/>Alındı</span>
              </div>
              
              <!-- Step 2: Preparing -->
              <div class="flex flex-col items-center gap-2 w-1/3">
                <div class="w-6 h-6 rounded-full bg-[var(--brand)] border-4 border-white shadow-sm flex items-center justify-center">
                  <CheckIcon class="w-3 h-3 text-white" />
                </div>
                <span class="text-[10px] font-black text-[var(--brand-deep)] uppercase tracking-wider text-center">Hazır<br/>lanıyor</span>
              </div>

              <!-- Step 3: On the way -->
              <div class="flex flex-col items-center gap-2 w-1/3">
                <div class="w-6 h-6 rounded-full bg-white border-4 border-black/[0.06] shadow-sm flex items-center justify-center animate-bounce">
                  <div class="w-2 h-2 rounded-full bg-[var(--brand)]"></div>
                </div>
                <span class="text-[10px] font-black text-black/40 uppercase tracking-wider text-center">Yolda</span>
              </div>
            </div>
          </div>

          <!-- Courier Info -->
          <div class="px-6 py-5 flex items-center gap-4 border-t border-black/[0.06] bg-white">
            <div class="relative">
              <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--brand)] p-0.5">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" 
                  alt="Courier Ahmet Y." 
                  class="w-full h-full object-cover rounded-full" 
                />
              </div>
              <div class="absolute -bottom-1 -right-1 bg-[var(--brand-deep)] text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 font-black shadow-lg">
                <StarIconSolid class="w-3 h-3 text-white" />
                4.8
              </div>
            </div>
            <div class="flex-grow">
              <div class="flex items-center gap-2">
                <h3 class="font-black text-lg text-[var(--ink)]">Ahmet Y.</h3>
                <div class="px-2 py-0.5 bg-black/5 rounded text-[10px] font-bold text-black/40">Kurye</div>
              </div>
              <div class="text-sm font-medium text-black/50 flex items-center gap-1.5 mt-0.5">
                <div class="w-2 h-2 rounded-full bg-[var(--brand)]"></div>
                Elektrikli Bisiklet
              </div>
            </div>
            <div class="flex gap-2">
              <button class="w-11 h-11 rounded-full bg-[var(--surface)] text-[var(--brand-deep)] flex items-center justify-center hover:bg-[var(--brand)]/10 transition-all active:scale-90">
                <PhoneIcon class="w-5 h-5" />
              </button>
              <button class="w-11 h-11 rounded-full bg-[var(--surface)] text-[var(--brand-deep)] flex items-center justify-center hover:bg-[var(--brand)]/10 transition-all active:scale-90">
                <ChatBubbleLeftEllipsisIcon class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Delivery Details Area -->
          <div class="bg-[var(--surface)] border-t border-black/[0.06]">
            <!-- Address -->
            <div class="px-6 py-4 flex items-start gap-4 border-b border-black/[0.06]">
              <div class="bg-white p-2 rounded-xl shadow-sm">
                <MapPinIcon class="w-5 h-5 text-[var(--brand-deep)]" />
              </div>
              <div>
                <span class="text-[10px] font-black text-black/30 uppercase tracking-widest">Teslimat Adresi</span>
                <p class="text-sm font-bold text-[var(--ink)] leading-tight mt-1">Ev — Levent, Büyükdere Cd. No:199, 34394 Şişli/İstanbul</p>
              </div>
            </div>

            <!-- Items Collapse -->
            <button class="w-full px-6 py-4 flex items-center justify-between hover:bg-white transition-all group">
              <div class="flex items-center gap-4">
                <div class="bg-white p-2 rounded-xl shadow-sm">
                  <ShoppingBagIcon class="w-5 h-5 text-black/30" />
                </div>
                <div class="text-left">
                  <span class="text-[10px] font-black text-black/30 uppercase tracking-widest">Sipariş Detayı</span>
                  <p class="text-sm font-bold text-[var(--ink)]">Burger House - 2 Ürün</p>
                </div>
              </div>
              <ChevronDownIcon class="w-5 h-5 text-black/20 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white py-10 px-5 border-t border-black/[0.06]">
      <div class="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
        <div class="flex flex-col gap-2">
          <span class="font-black text-2xl text-[var(--brand-deep)]">BazarX Go</span>
          <p class="text-sm text-black/40 max-w-xs leading-relaxed">© 2024 BazarX Go. Şehirli profesyoneller için yüksek hızlı teslimat. Taze, hızlı ve güvenilir.</p>
        </div>
        <div class="flex flex-wrap gap-12">
          <div class="flex flex-col gap-4">
            <h4 class="text-sm font-black text-[var(--ink)] uppercase tracking-wider">Şirket</h4>
            <nav class="flex flex-col gap-2">
              <a class="text-sm text-black/40 hover:text-[var(--brand-deep)] transition-all" href="#">Hakkımızda</a>
              <a class="text-sm text-black/40 hover:text-[var(--brand-deep)] transition-all" href="#">Kariyer</a>
              <a class="text-sm text-black/40 hover:text-[var(--brand-deep)] transition-all" href="#">İş Ortağımız Olun</a>
            </nav>
          </div>
          <div class="flex flex-col gap-4">
            <h4 class="text-sm font-black text-[var(--ink)] uppercase tracking-wider">Yasal</h4>
            <nav class="flex flex-col gap-2">
              <a class="text-sm text-black/40 hover:text-[var(--brand-deep)] transition-all" href="#">Gizlilik Politikası</a>
              <a class="text-sm text-black/40 hover:text-[var(--brand-deep)] transition-all" href="#">Kullanım Koşulları</a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import {
  BellIcon,
  ShoppingBagIcon,
  MapPinIcon,
  PhoneIcon,
  ChatBubbleLeftEllipsisIcon,
  TruckIcon,
  ChevronDownIcon,
  CheckIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/vue/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/vue/24/solid'

const authStore = useAuthStore()
const cartStore = useCartStore()

const logout = async () => {
  await authStore.logout()
  navigateTo('/auth/login')
}

definePageMeta({
  layout: false
})

useHead({
  title: 'Canlı Takip - BazarX Go',
  meta: [
    { name: 'description', content: 'BazarX Go siparişinizi canlı olarak takip edin.' }
  ]
})
</script>

<style scoped>
.bazarx-go {
  --bg: #f8f9fa;
  --surface: #f3f4f5;
  --surface-2: #e7e8e9;
  --ink: #1c1b1b;
  --brand: #00c371;
  --brand-deep: #006d3d;
  --brand-soft: #64fea5;
  --accent: #ffb59a;
  --accent-deep: #a73a00;
  --accent-container: #ff8a5b;
  --outline: #bbcbbc;
}
</style>