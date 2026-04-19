<template>
  <footer class="bg-gray-950 text-gray-400 pt-20 pb-10 mt-20 relative overflow-hidden">
    <!-- Background Decoration -->
    <div class="absolute top-0 right-0 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl -mr-48 -mt-48" />
    <div class="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl -ml-48 -mb-48" />

    <div class="max-w-8xl mx-auto px-6 relative z-10">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <!-- Brand Section -->
        <div class="space-y-6">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/20">
              <ShoppingCartIcon class="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 class="text-xl font-black text-white tracking-tighter uppercase leading-none">BazarX</h2>
              <p class="text-[8px] font-bold text-primary-500 uppercase tracking-widest mt-1 italic">E-Ticaret & Takas</p>
            </div>
          </div>
          <p class="text-sm leading-relaxed max-w-xs font-medium">
            Türkiye'nin ilk ve tek hibrit e-ticaret ve barter platformu. Kurumsal takas ve profesyonel ticaretin adresi.
          </p>
          <div class="flex items-center gap-4">
            <a href="#" class="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all"><i class="fab fa-facebook-f text-sm" /></a>
            <a href="#" class="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all"><i class="fab fa-twitter text-sm" /></a>
            <a href="#" class="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all"><i class="fab fa-instagram text-sm" /></a>
          </div>
        </div>

        <!-- Links Section 1 -->
        <div>
          <h3 class="text-white font-black uppercase tracking-widest text-xs mb-8">Kurumsal</h3>
          <ul class="space-y-4">
            <li><NuxtLink to="/legal/hakkimizda" class="text-sm font-medium hover:text-primary-500 transition-colors">Hakkımızda</NuxtLink></li>
            <li><NuxtLink to="/legal/iletisim" class="text-sm font-medium hover:text-primary-500 transition-colors">İletişim</NuxtLink></li>
            <li><NuxtLink to="/become-vendor" class="text-sm font-medium hover:text-primary-500 transition-colors text-amber-500 font-bold">Mağaza Aç</NuxtLink></li>
            <li><NuxtLink to="/premium" class="text-sm font-medium hover:text-primary-500 transition-colors">Premium Üyelik</NuxtLink></li>
          </ul>
        </div>

        <!-- Links Section 2 -->
        <div>
          <h3 class="text-white font-black uppercase tracking-widest text-xs mb-8">Yardım & Destek</h3>
          <ul class="space-y-4">
            <li><NuxtLink to="/help" class="text-sm font-medium hover:text-primary-500 transition-colors">Yardım Merkezi</NuxtLink></li>
            <li><NuxtLink to="/legal/gizlilik-politikasi" class="text-sm font-medium hover:text-primary-500 transition-colors">Gizlilik Politikası</NuxtLink></li>
            <li><NuxtLink to="/legal/kullanim-kosullari" class="text-sm font-medium hover:text-primary-500 transition-colors">Kullanım Koşulları</NuxtLink></li>
            <li><NuxtLink to="/legal/kvkk" class="text-sm font-medium hover:text-primary-500 transition-colors">KVKK Aydınlatma Metni</NuxtLink></li>
          </ul>
        </div>

        <!-- Newsletter Section -->
        <div>
          <h3 class="text-white font-black uppercase tracking-widest text-xs mb-8">Bültenimize Katılın</h3>
          <p class="text-sm mb-6 font-medium">Fırsatlardan haberdar olmak için e-bültenimize abone olun.</p>
          <div class="relative">
            <input type="email" placeholder="E-posta adresiniz" class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-white">
            <button class="absolute right-2 top-2 bottom-2 bg-primary-600 text-white rounded-xl px-4 text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all">Abone Ol</button>
          </div>
        </div>
      </div>

      <div class="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p class="text-[10px] font-bold uppercase tracking-widest opacity-40">
          © 2026 TicariTakas | BazarX. Tüm hakları saklıdır.
        </p>
        <div class="flex items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" class="h-4" alt="Visa">
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" class="h-6" alt="Mastercard">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/Iyzico_logo.svg" class="h-4" alt="Iyzico">
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ShoppingCartIcon } from '@heroicons/vue/24/outline'
</script>
