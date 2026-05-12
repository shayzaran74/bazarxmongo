<!-- apps/frontend/pages/bazarx-go/order-confirmation.vue -->
<template>
  <div class="bazarx-go min-h-screen bg-[var(--bg)] text-[var(--ink)] antialiased">
    <!-- TopNavBar -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-xl shadow-sm">
      <nav class="max-w-[1280px] mx-auto px-5 h-20 flex justify-between items-center">
        <div class="flex items-center gap-6">
          <NuxtLink to="/bazarx-go" class="font-black text-xl text-[var(--brand-deep)]">BazarX Go</NuxtLink>
          <div class="hidden md:flex gap-6 items-center">
            <a class="text-black/50 font-medium hover:text-[var(--brand-deep)] transition-colors" href="#">Browse</a>
            <a class="text-black/50 font-medium hover:text-[var(--brand-deep)] transition-colors" href="#">Deals</a>
            <a class="text-[var(--brand-deep)] border-b-2 border-[var(--brand-deep)] pb-1 font-bold" href="#">My Orders</a>
            <a class="text-black/50 font-medium hover:text-[var(--brand-deep)] transition-colors" href="#">Help</a>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <button class="p-2 text-[var(--brand-deep)] transition-transform active:scale-95">
            <BellIcon class="w-6 h-6" />
          </button>
          <NuxtLink to="/bazarx-go/cart" class="p-2 text-[var(--brand-deep)] transition-transform active:scale-95">
            <ShoppingBagIcon class="w-6 h-6" />
          </NuxtLink>
          <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--brand)]">
            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" alt="User" class="w-full h-full object-cover" />
          </div>
        </div>
      </nav>
    </header>

    <main class="min-h-screen py-10 px-5 relative overflow-hidden">
      <!-- Confetti Background -->
      <div class="absolute inset-0 pointer-events-none" style="background-image: radial-gradient(#00c371 1px, transparent 1px), radial-gradient(#00c371 1px, transparent 1px); background-size: 40px 40px; background-position: 0 0, 20px 20px; opacity: 0.1;"></div>

      <div class="max-w-[640px] mx-auto relative z-10">
        <!-- Order Success Card -->
        <div class="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden border border-black/10">
          <!-- Hero Section -->
          <div class="p-8 text-center bg-[var(--brand)]/5">
            <div class="mb-4 inline-flex items-center justify-center w-24 h-24 rounded-full bg-[var(--brand-deep)] text-white shadow-lg">
              <CheckCircleIcon class="w-12 h-12" />
            </div>
            <h1 class="text-3xl font-black text-[var(--brand-deep)] mb-2">Siparişiniz Alındı!</h1>
            <p class="text-black/60">Harika bir seçim! Restoran siparişinizi hazırlamaya başladı.</p>
          </div>

          <!-- Order Details Summary -->
          <div class="px-8 py-6 flex flex-col gap-6 border-t border-[var(--surface)]">
            <!-- ID and Time Bento -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-4 bg-[var(--surface)] rounded-lg flex flex-col gap-1">
                <span class="text-xs text-black/50 uppercase tracking-wider font-semibold">Sipariş Numarası</span>
                <span class="text-lg font-bold text-[var(--ink)]">#BXG-892341</span>
              </div>
              <div class="p-4 bg-[var(--surface)] rounded-lg flex flex-col gap-1">
                <span class="text-xs text-black/50 uppercase tracking-wider font-semibold">Tahmini Teslimat</span>
                <div class="flex items-center gap-2">
                  <ClockIcon class="w-5 h-5 text-[var(--brand)]" />
                  <span class="text-lg font-bold text-[var(--ink)]">25-35 dakika</span>
                </div>
              </div>
            </div>

            <!-- Information Sections -->
            <div class="space-y-4">
              <!-- Delivery Address -->
              <div class="flex items-start gap-4 p-3 rounded-lg hover:bg-[var(--surface)] transition-colors">
                <div class="w-12 h-12 rounded-full bg-[var(--surface-2)] flex items-center justify-center shrink-0">
                  <HomeIcon class="w-6 h-6 text-[var(--brand-deep)]" />
                </div>
                <div>
                  <h3 class="font-semibold text-[var(--ink)]">Teslimat Adresi</h3>
                  <p class="text-black/60 mt-1">Ev — Levent, Büyükdere Cd. No:199, 34394 Şişli/İstanbul</p>
                </div>
              </div>

              <!-- Payment Method -->
              <div class="flex items-start gap-4 p-3 rounded-lg hover:bg-[var(--surface)] transition-colors">
                <div class="w-12 h-12 rounded-full bg-[var(--surface-2)] flex items-center justify-center shrink-0">
                  <CreditCardIcon class="w-6 h-6 text-[var(--brand-deep)]" />
                </div>
                <div>
                  <h3 class="font-semibold text-[var(--ink)]">Ödeme Yöntemi</h3>
                  <p class="text-black/60 mt-1">Mastercard **** 1234 — Başarıyla Tahsil Edildi</p>
                </div>
              </div>

              <!-- Order Items -->
              <div class="p-4 bg-[var(--surface)] rounded-lg">
                <h3 class="font-semibold text-[var(--ink)] mb-3">Sipariş Özeti</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-black/60">Classic Chicken Burger × 1</span>
                    <span class="font-medium">₺189</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-black/60">Crispy Chicken Deluxe × 2</span>
                    <span class="font-medium">₺378</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-black/60">Jalapeño Bacon Burger × 1</span>
                    <span class="font-medium">₺229</span>
                  </div>
                  <div class="flex justify-between pt-2 border-t border-black/10">
                    <span class="font-semibold text-[var(--ink)]">Toplam</span>
                    <span class="font-bold text-[var(--brand-deep)]">₺796</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col gap-3 pt-4">
              <NuxtLink
                to="/bazarx-go/live-tracking"
                class="w-full bg-[var(--brand-deep)] hover:bg-[var(--brand)] text-white font-bold py-4 px-8 rounded-full transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 text-center"
              >
                <TruckIcon class="w-5 h-5" />
                Siparişi Takip Et
              </NuxtLink>
              <NuxtLink to="/bazarx-go">
                <button class="w-full bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--ink)] font-bold py-4 px-8 rounded-full transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2">
                  Ana Sayfaya Dön
                </button>
              </NuxtLink>
            </div>
          </div>

          <!-- Friendly Footer Message -->
          <div class="p-4 bg-[var(--surface-2)] text-center border-t border-[var(--surface)]">
            <p class="text-xs text-black/50">Bir sorun mu var? <a class="text-[var(--brand-deep)] underline" href="#">Destek ekibimizle</a> iletişime geçin.</p>
          </div>
        </div>

        <!-- Suggestion Grid -->
        <div class="mt-10">
          <h4 class="text-xl font-bold text-[var(--ink)] mb-4">Siparişinize şunları da eklemek ister miydiniz?</h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-white p-3 rounded-xl flex items-center gap-3 shadow-sm border border-black/10">
              <img src="https://images.unsplash.com/photo-1523362628745-0c100150b504?w=100&h=100&fit=crop" alt="Maden Suyu" class="w-16 h-16 rounded-lg object-cover" />
              <div class="flex-1">
                <p class="font-semibold text-[var(--ink)]">Maden Suyu</p>
                <p class="text-[var(--brand-deep)] font-bold">₺12.00</p>
              </div>
              <button class="w-8 h-8 rounded-full bg-[var(--brand-deep)] text-white flex items-center justify-center">
                <PlusIcon class="w-5 h-5" />
              </button>
            </div>
            <div class="bg-white p-3 rounded-xl flex items-center gap-3 shadow-sm border border-black/10">
              <img src="https://images.unsplash.com/photo-1624301760593-45c8f8bef266?w=100&h=100&fit=crop" alt="Sufle" class="w-16 h-16 rounded-lg object-cover" />
              <div class="flex-1">
                <p class="font-semibold text-[var(--ink)]">Sufle</p>
                <p class="text-[var(--brand-deep)] font-bold">₺45.00</p>
              </div>
              <button class="w-8 h-8 rounded-full bg-[var(--brand-deep)] text-white flex items-center justify-center">
                <PlusIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-[var(--surface-2)] py-10 px-5">
      <div class="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex flex-col gap-1 items-center md:items-start">
          <span class="font-black text-xl text-[var(--brand-deep)]">BazarX Go</span>
          <p class="text-black/50 text-center md:text-left">© 2024 BazarX Go. Fast delivery for urban professionals.</p>
        </div>
        <div class="flex flex-wrap justify-center gap-4">
          <a class="text-black/50 font-medium hover:text-[var(--brand-deep)] underline underline-offset-4 transition-colors" href="#">About Us</a>
          <a class="text-black/50 font-medium hover:text-[var(--brand-deep)] underline underline-offset-4 transition-colors" href="#">Partner with Us</a>
          <a class="text-black/50 font-medium hover:text-[var(--brand-deep)] underline underline-offset-4 transition-colors" href="#">Terms of Service</a>
          <a class="text-black/50 font-medium hover:text-[var(--brand-deep)] underline underline-offset-4 transition-colors" href="#">Privacy Policy</a>
          <a class="text-black/50 font-medium hover:text-[var(--brand-deep)] underline underline-offset-4 transition-colors" href="#">Contact Support</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import {
  CheckCircleIcon,
  ClockIcon,
  HomeIcon,
  CreditCardIcon,
  TruckIcon,
  PlusIcon,
  BellIcon,
  ShoppingBagIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: false
})

useHead({
  title: 'Sipariş Onaylandı - BazarX Go',
  meta: [
    { name: 'description', content: 'BazarX Go siparişiniz onaylandı.' }
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