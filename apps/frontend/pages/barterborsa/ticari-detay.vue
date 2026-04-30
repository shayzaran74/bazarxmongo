<template>
  <div class="min-h-screen bg-surface text-on-surface flex">
    <!-- Sidebar Navigation -->
    <aside class="fixed left-0 top-0 h-full flex flex-col pt-4 pb-8 bg-white border-r border-slate-200 w-64 z-50 shadow-sm">
      <div class="px-6 mb-8">
        <NuxtLink to="/barterborsa" class="font-black text-primary-container text-xl hover:opacity-80 transition-opacity">
          TicariTakas
        </NuxtLink>
        <p class="text-xs text-slate-500 font-medium mt-0.5">B2B Trade Portal</p>
      </div>
      <nav class="flex-1 px-4 space-y-1">
        <NuxtLink to="/barterborsa" class="flex items-center px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-all group">
          <span class="material-symbols-outlined mr-3">dashboard</span>
          <span class="text-sm font-medium">Dashboard</span>
        </NuxtLink>
        <a class="flex items-center px-4 py-3 rounded-lg bg-slate-50 text-primary-container border-r-4 border-primary-container transition-all">
          <span class="material-symbols-outlined mr-3">swap_horiz</span>
          <span class="text-sm font-semibold">Trade Pool</span>
        </a>
        <NuxtLink to="/barter" class="flex items-center px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-all group">
          <span class="material-symbols-outlined mr-3">assignment_turned_in</span>
          <span class="text-sm font-medium">My Proposals</span>
        </NuxtLink>
        <NuxtLink to="/profile" class="flex items-center px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-all group">
          <span class="material-symbols-outlined mr-3">verified_user</span>
          <span class="text-sm font-medium">TrustScore</span>
        </NuxtLink>
        <NuxtLink to="/wallet" class="flex items-center px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-all group">
          <span class="material-symbols-outlined mr-3">account_balance_wallet</span>
          <span class="text-sm font-medium">Barter Wallet</span>
        </NuxtLink>
      </nav>
      <div class="px-4 mt-auto pt-4 border-t border-slate-100 space-y-1">
        <NuxtLink to="/support" class="flex items-center px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-all">
          <span class="material-symbols-outlined mr-3">help_outline</span>
          <span class="text-sm font-medium">Support</span>
        </NuxtLink>
        <NuxtLink to="/auth/login" class="flex items-center px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-all">
          <span class="material-symbols-outlined mr-3">logout</span>
          <span class="text-sm font-medium">Logout</span>
        </NuxtLink>
      </div>
    </aside>

    <!-- Main Canvas -->
    <div class="ml-64 flex-1 flex flex-col">
      <!-- Top App Bar -->
      <header class="sticky top-0 z-40 flex items-center justify-between px-6 h-16 bg-white border-b border-slate-200 shadow-sm">
        <nav class="flex items-center gap-1.5 text-sm text-slate-500">
          <NuxtLink to="/barterborsa" class="hover:text-primary-container transition-colors">Corporate Tools</NuxtLink>
          <span class="material-symbols-outlined text-xs">chevron_right</span>
          <NuxtLink to="/barterborsa" class="hover:text-primary-container transition-colors">Trade Pool</NuxtLink>
          <span class="material-symbols-outlined text-xs">chevron_right</span>
          <span class="text-primary-container font-semibold">Active Trade Detail</span>
        </nav>
        <div class="flex items-center gap-3">
          <button class="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors" type="button" aria-label="Bildirimler">
            <span class="material-symbols-outlined">notifications</span>
          </button>
          <button class="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors" type="button" aria-label="Ayarlar">
            <span class="material-symbols-outlined">settings</span>
          </button>
          <div class="h-8 w-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm overflow-hidden">
            ZM
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-6 max-w-[1280px] mx-auto w-full">
        <!-- Page Header -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 20, filter: 'blur(8px)' }"
          :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 600 } }"
          class="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4"
        >
          <div>
            <h2 class="text-[32px] leading-[40px] font-semibold tracking-[-0.01em] text-primary-container mb-1">
              Industrial Kitchen Suite
            </h2>
            <div class="flex items-center gap-4 text-slate-500 flex-wrap">
              <span class="flex items-center text-sm gap-1">
                <span class="material-symbols-outlined text-sm">tag</span>TRX-9942
              </span>
              <span class="flex items-center text-sm gap-1">
                <span class="material-symbols-outlined text-sm">schedule</span>2 gün önce eklendi
              </span>
              <span class="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Active Opportunity
              </span>
            </div>
          </div>
          <div class="flex gap-2">
            <button class="flex items-center px-4 py-2 bg-white border border-outline-variant rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all gap-2" type="button">
              <span class="material-symbols-outlined text-lg">share</span> Paylaş
            </button>
            <button class="flex items-center px-4 py-2 bg-white border border-outline-variant rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all gap-2" type="button">
              <span class="material-symbols-outlined text-lg">favorite</span> Kaydet
            </button>
          </div>
        </div>

        <!-- Grid Layout -->
        <div class="grid grid-cols-12 gap-6">
          <!-- Left: Content -->
          <div class="col-span-12 lg:col-span-8 space-y-6">
            <!-- Image Gallery -->
            <section
              v-motion
              :initial="{ opacity: 0, scale: 0.96, filter: 'blur(10px)' }"
              :visible-once="{ opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 650, ease: [0.34, 1.56, 0.64, 1] } }"
              class="bg-white rounded-xl shadow-ambient overflow-hidden border border-slate-100"
            >
              <div class="aspect-video w-full relative overflow-hidden bg-slate-100">
                <div class="absolute inset-0 flex items-center justify-center text-slate-300">
                  <div class="text-center">
                    <span class="material-symbols-outlined text-7xl mb-2 block">kitchen</span>
                    <p class="text-sm font-medium">Industrial Kitchen Suite</p>
                    <p class="text-xs mt-1">Ana görsel — DB bağlantısında yüklenecek</p>
                  </div>
                </div>
                <div class="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                  <span class="material-symbols-outlined text-base">photo_library</span>
                  1/12 Fotoğraf
                </div>
              </div>
              <div class="grid grid-cols-4 p-4 gap-3 border-t border-slate-100">
                <div v-for="i in 4" :key="i"
                  class="aspect-square rounded-lg overflow-hidden bg-slate-100 border hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center text-slate-300"
                  :class="i === 1 ? 'border-primary-container border-2' : 'border-slate-200'"
                >
                  <span class="material-symbols-outlined">{{ i < 4 ? 'image' : 'add_photo_alternate' }}</span>
                </div>
              </div>
            </section>

            <!-- Product Description -->
            <section
              v-motion
              :initial="{ opacity: 0, y: 28, filter: 'blur(12px)' }"
              :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 700, ease: [0.25, 0.46, 0.45, 0.94] } }"
              class="bg-white rounded-xl shadow-ambient p-6 border border-slate-100"
            >
              <h3 class="text-[20px] leading-[28px] font-semibold text-primary-container mb-4 border-b border-slate-100 pb-3">
                Detailed Description
              </h3>
              <div class="space-y-4 text-on-surface-variant">
                <p>Complete Industrial Kitchen Suite featuring 12 modular units optimized for high-volume commercial dining operations. Premium stainless steel preparation tables, high-capacity convection ovens, and energy-efficient cooling solutions manufactured by Zenith Manufacturing.</p>
                <div class="grid grid-cols-2 gap-6 mt-4">
                  <div>
                    <h4 class="font-bold text-primary-container text-sm uppercase tracking-wider mb-3">Technical Specifications</h4>
                    <ul class="space-y-2 text-sm">
                      <li class="flex justify-between border-b border-slate-50 pb-1.5"><span>Power Supply</span> <span class="font-semibold">3-Phase 380V</span></li>
                      <li class="flex justify-between border-b border-slate-50 pb-1.5"><span>Material</span> <span class="font-semibold">AISI 304 Stainless</span></li>
                      <li class="flex justify-between border-b border-slate-50 pb-1.5"><span>Certification</span> <span class="font-semibold">CE, ISO 9001</span></li>
                      <li class="flex justify-between border-b border-slate-50 pb-1.5"><span>Capacity</span> <span class="font-semibold">500+ Meals/Hour</span></li>
                    </ul>
                  </div>
                  <div>
                    <h4 class="font-bold text-primary-container text-sm uppercase tracking-wider mb-3">Condition Report</h4>
                    <div class="bg-surface rounded-lg p-4">
                      <div class="flex items-center mb-2">
                        <span class="material-symbols-outlined text-md3-secondary mr-2">verified</span>
                        <span class="font-semibold text-md3-secondary">Manufacturer Certified</span>
                      </div>
                      <p class="text-xs">Excellent condition. Used for 14 months. Fully serviced 15 days ago.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Trade Conditions -->
            <section
              v-motion
              :initial="{ opacity: 0, y: 28, filter: 'blur(12px)' }"
              :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 700, delay: 100, ease: [0.25, 0.46, 0.45, 0.94] } }"
              class="bg-white rounded-xl shadow-ambient p-6 border border-slate-100"
            >
              <h3 class="text-[20px] leading-[28px] font-semibold text-primary-container mb-4 border-b border-slate-100 pb-3">
                Trade Conditions
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div v-for="cond in tradeConditions" :key="cond.title" class="flex gap-3">
                  <span class="material-symbols-outlined text-primary-container p-2 bg-primary-fixed rounded-lg h-fit flex-shrink-0">{{ cond.icon }}</span>
                  <div>
                    <span class="block text-xs font-bold text-slate-400 uppercase mb-0.5">{{ cond.label }}</span>
                    <span class="text-sm font-medium">{{ cond.title }}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- Right: Action Sidebar -->
          <div class="col-span-12 lg:col-span-4 space-y-5">
            <!-- Trade Action Panel -->
            <section
              v-motion
              :initial="{ opacity: 0, y: 28, filter: 'blur(12px)' }"
              :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 700, ease: [0.25, 0.46, 0.45, 0.94] } }"
              class="bg-primary-container text-on-primary rounded-xl shadow-lg p-6 relative overflow-hidden"
            >
              <div class="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
              <div class="relative z-10">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <span class="text-xs text-white/70 uppercase tracking-widest font-bold">Trade Value</span>
                    <div class="text-3xl font-black mt-1">120,000 <span class="text-lg">TL</span></div>
                  </div>
                  <div class="bg-white/10 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">Barter Credit</div>
                </div>
                <div class="space-y-3 border-y border-white/10 py-4 my-4">
                  <div class="flex justify-between text-sm">
                    <span class="text-white/70">Mevcut Havuz Limiti</span>
                    <span class="font-bold">850,000 TL</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-white/70">İşlem Ücreti</span>
                    <div class="text-right">
                      <span class="font-bold line-through text-white/50 mr-2 text-xs">%8</span>
                      <span class="font-bold text-secondary-fixed">%4</span>
                      <span class="block text-[10px] text-secondary-fixed font-medium">Elite Level XP applied</span>
                    </div>
                  </div>
                </div>
                <div class="space-y-2">
                  <button
                    class="w-full bg-md3-secondary text-on-primary py-4 rounded-xl font-bold text-sm uppercase tracking-wide hover:opacity-90 active:scale-95 transition-all shadow-md"
                    type="button"
                  >
                    Hemen Teklif Ver
                  </button>
                  <button
                    class="w-full bg-white/10 border border-white/20 py-4 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-white/20 active:scale-95 transition-all"
                    type="button"
                  >
                    Satıcıya Mesaj Gönder
                  </button>
                </div>
                <p class="text-[10px] text-white/50 mt-4 text-center">
                  Protected by TicariTakas Secure Trade Protocol © 2024
                </p>
              </div>
            </section>

            <!-- Partner Info Card -->
            <section
              v-motion
              :initial="{ opacity: 0, y: 28, filter: 'blur(12px)' }"
              :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 700, delay: 120, ease: [0.25, 0.46, 0.45, 0.94] } }"
              class="bg-white rounded-xl shadow-ambient border border-slate-100 overflow-hidden"
            >
              <div class="p-4 bg-surface-container-low border-b border-slate-100 flex items-center justify-between">
                <span class="text-xs font-bold text-primary-container uppercase tracking-wider">Trading Partner</span>
                <div class="flex items-center bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded text-[10px] font-black uppercase">
                  Gold Member
                </div>
              </div>
              <div class="p-5">
                <div class="flex items-center gap-4 mb-4">
                  <div class="h-14 w-14 rounded-xl bg-primary-container flex items-center justify-center text-on-primary font-black text-xl">Z</div>
                  <div>
                    <div class="flex items-center gap-1">
                      <h4 class="font-bold text-primary-container">Zenith Manufacturing</h4>
                      <span class="material-symbols-outlined text-md3-secondary text-sm">verified</span>
                    </div>
                    <p class="text-xs text-slate-500">Industrial Equipment Sector</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-2 mb-4">
                  <div class="bg-surface p-2 rounded-lg text-center border border-slate-50">
                    <span class="block text-[10px] text-slate-400 font-bold uppercase">TrustScore</span>
                    <span class="text-xl font-black text-md3-secondary">92<span class="text-xs">/100</span></span>
                  </div>
                  <div class="bg-surface p-2 rounded-lg text-center border border-slate-50">
                    <span class="block text-[10px] text-slate-400 font-bold uppercase">Trade Volume</span>
                    <span class="text-xl font-black text-primary-container">12.4M</span>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-500">History</span>
                    <span class="font-medium text-on-surface">142 Successful Trades</span>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-500">Join Date</span>
                    <span class="font-medium text-on-surface">March 2019</span>
                  </div>
                  <div class="w-full bg-surface-container h-1.5 rounded-full mt-2 overflow-hidden">
                    <div class="bg-md3-secondary w-[92%] h-full" />
                  </div>
                </div>
              </div>
            </section>

            <!-- Pro Tip -->
            <section
              v-motion
              :initial="{ opacity: 0, y: 28, filter: 'blur(12px)' }"
              :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 700, delay: 200, ease: [0.25, 0.46, 0.45, 0.94] } }"
              class="p-5 bg-surface-variant/30 rounded-xl border border-dashed border-outline-variant"
            >
              <h5 class="text-xs font-bold text-primary-container uppercase mb-2 flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">lightbulb</span>
                Pro Trade Tip
              </h5>
              <p class="text-xs text-on-surface-variant leading-relaxed">
                Yüksek değerli endüstriyel ürünler için teklifinizi kesinleştirmeden önce mesajlaşma üzerinden video incelemesi talep etmenizi öneririz.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

useHead({
  title: 'Industrial Kitchen Suite — TicariTakas B2B Trade',
  meta: [{ name: 'description', content: 'TicariTakas B2B ticari takas detay sayfası — endüstriyel ekipman takası' }],
})

const tradeConditions = [
  { icon: 'local_shipping', label: 'Delivery', title: 'Ex-Works Factory (Kocaeli)' },
  { icon: 'security', label: 'Warranty', title: '6 Months Limited Warranty' },
  { icon: 'currency_exchange', label: 'Eligibility', title: 'Barter-to-Barter Only' },
]
</script>
