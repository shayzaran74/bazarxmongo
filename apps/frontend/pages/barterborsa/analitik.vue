<template>
  <AccessGuard :requiresAuth="true" :requiresVendor="true" :requiresApex="true">
    <div class="min-h-screen bg-surface flex">
    <!-- Sidebar Navigation -->
    <aside class="fixed left-0 top-0 h-full w-64 border-r border-slate-200 bg-white flex flex-col py-6 px-4 z-50 shadow-sm">
      <div class="mb-8 px-2">
        <NuxtLink to="/" class="text-xl font-black text-primary-container uppercase tracking-wider hover:opacity-80 transition-opacity">
          BazarX Core
        </NuxtLink>
        <p class="text-xs text-slate-500 mt-1">Enterprise Analytics</p>
      </div>

      <nav class="flex-1 space-y-1">
        <a class="flex items-center gap-3 px-4 py-3 bg-slate-50 text-primary-container font-semibold border-r-4 border-primary-container rounded-l-lg transition-all">
          <span class="material-symbols-outlined text-xl">dashboard</span>
          <span class="text-sm">Executive Overview</span>
        </a>
        <NuxtLink to="/barterborsa" class="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-primary-container rounded-lg transition-all">
          <span class="material-symbols-outlined text-xl">query_stats</span>
          <span class="text-sm">Trade Volume</span>
        </NuxtLink>
        <NuxtLink to="/barter" class="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-primary-container rounded-lg transition-all">
          <span class="material-symbols-outlined text-xl">loop</span>
          <span class="text-sm">Pool Churn</span>
        </NuxtLink>
        <NuxtLink to="/vendors" class="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-primary-container rounded-lg transition-all">
          <span class="material-symbols-outlined text-xl">verified_user</span>
          <span class="text-sm">TrustScore Analysis</span>
        </NuxtLink>
        <NuxtLink to="/categories" class="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-primary-container rounded-lg transition-all">
          <span class="material-symbols-outlined text-xl">map</span>
          <span class="text-sm">Regional Metrics</span>
        </NuxtLink>
      </nav>

      <div class="mt-auto pt-6 border-t border-slate-200 space-y-2">
        <button
          class="w-full mb-2 py-2.5 px-4 bg-primary-container text-on-primary text-sm font-bold rounded-lg hover:opacity-90 transition-all"
          type="button"
        >
          Generate Report
        </button>
        <NuxtLink to="/settings" class="flex items-center gap-3 px-4 py-2 text-slate-600 hover:text-primary-container transition-all">
          <span class="material-symbols-outlined text-lg">settings</span>
          <span class="text-sm">Settings</span>
        </NuxtLink>
        <NuxtLink to="/support" class="flex items-center gap-3 px-4 py-2 text-slate-600 hover:text-primary-container transition-all">
          <span class="material-symbols-outlined text-lg">contact_support</span>
          <span class="text-sm">Support</span>
        </NuxtLink>
      </div>
    </aside>

    <!-- Main Canvas -->
    <div class="ml-64 flex-1 flex flex-col min-h-screen">
      <!-- Top App Bar -->
      <header class="sticky top-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-40 shadow-sm">
        <div class="flex items-center gap-4">
          <h2 class="font-semibold text-primary-container text-[20px]">Executive Overview</h2>
          <div class="h-5 w-px bg-slate-200" />
          <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
            <span class="material-symbols-outlined text-sm text-slate-500">calendar_today</span>
            <span class="text-xs font-medium text-slate-600">Oca 1 – Haz 30, 2024</span>
            <span class="material-symbols-outlined text-sm text-slate-500">expand_more</span>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <button class="text-slate-500 hover:text-primary-container transition-colors p-1.5 rounded-full hover:bg-slate-50" type="button" aria-label="Bildirimler">
            <span class="material-symbols-outlined">notifications</span>
          </button>
          <button class="text-slate-500 hover:text-primary-container transition-colors p-1.5 rounded-full hover:bg-slate-50" type="button" aria-label="Yardım">
            <span class="material-symbols-outlined">help_outline</span>
          </button>
          <div class="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div class="text-right">
              <p class="text-sm font-bold text-slate-900">Admin Panel</p>
              <p class="text-[10px] text-slate-500 uppercase tracking-widest">Corporate Administrator</p>
            </div>
            <div class="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm">
              A
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-8 flex-1">
        <!-- KPI Cards -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 28, filter: 'blur(12px)' }"
          :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 700, ease: [0.25, 0.46, 0.45, 0.94] } }"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <!-- KPI 1 -->
          <div class="bg-white p-6 rounded-xl shadow-ambient border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div class="flex justify-between items-start mb-4">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Toplam Barter Hacmi</span>
                <div class="p-2 bg-blue-50 rounded-lg">
                  <span class="material-symbols-outlined text-blue-600">payments</span>
                </div>
              </div>
              <p class="text-2xl font-extrabold text-primary-container">₺124.5M</p>
            </div>
            <div class="mt-4 flex items-center gap-2">
              <span class="text-md3-secondary text-xs font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-xs">trending_up</span> %12.5
              </span>
              <span class="text-slate-400 text-xs">geçen aya kıyasla</span>
            </div>
          </div>

          <!-- KPI 2 -->
          <div class="bg-white p-6 rounded-xl shadow-ambient border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div class="flex justify-between items-start mb-4">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aktif Havuz Kullanımı</span>
                <div class="p-2 bg-green-50 rounded-lg">
                  <span class="material-symbols-outlined text-green-600">account_balance_wallet</span>
                </div>
              </div>
              <p class="text-2xl font-extrabold text-primary-container">%68</p>
            </div>
            <div class="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div class="bg-md3-secondary h-full rounded-full" style="width:68%" />
            </div>
          </div>

          <!-- KPI 3 -->
          <div class="bg-white p-6 rounded-xl shadow-ambient border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div class="flex justify-between items-start mb-4">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ort. TrustScore</span>
                <div class="p-2 bg-amber-50 rounded-lg">
                  <span class="material-symbols-outlined text-amber-600">verified_user</span>
                </div>
              </div>
              <p class="text-2xl font-extrabold text-primary-container">82</p>
            </div>
            <div class="mt-4">
              <span class="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] font-bold rounded uppercase">
                Gold Status
              </span>
            </div>
          </div>

          <!-- KPI 4 -->
          <div class="bg-white p-6 rounded-xl shadow-ambient border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div class="flex justify-between items-start mb-4">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Komisyon Tasarrufu</span>
                <div class="p-2 bg-purple-50 rounded-lg">
                  <span class="material-symbols-outlined text-purple-600">savings</span>
                </div>
              </div>
              <p class="text-2xl font-extrabold text-primary-container">₺1.2M</p>
            </div>
            <div class="mt-4 flex items-center gap-2">
              <span class="text-md3-secondary text-xs font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-xs">keyboard_double_arrow_up</span> ₺240k
              </span>
              <span class="text-slate-400 text-xs">bu çeyrekte</span>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 28, filter: 'blur(12px)' }"
          :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 700, delay: 100, ease: [0.25, 0.46, 0.45, 0.94] } }"
          class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
        >
          <!-- Trade Volume Trend Chart -->
          <div class="lg:col-span-2 bg-white rounded-xl shadow-ambient border border-slate-100 overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 class="text-sm font-bold text-primary-container">Barter Hacim Trendi (6 Ay)</h3>
              <div class="flex gap-4">
                <div class="flex items-center gap-1.5">
                  <div class="w-2.5 h-2.5 rounded-full bg-primary-container" />
                  <span class="text-[10px] font-medium text-slate-500 uppercase">Mevcut</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <div class="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span class="text-[10px] font-medium text-slate-500 uppercase">Hedef</span>
                </div>
              </div>
            </div>
            <div class="p-8 h-72 flex flex-col justify-between relative">
              <div class="absolute inset-0 m-8 flex items-end">
                <svg class="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style="stop-color:#1a3a5c;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#1a3a5c;stop-opacity:0" />
                    </linearGradient>
                  </defs>
                  <path d="M0 35 Q 10 32, 20 28 T 40 22 T 60 18 T 80 12 T 100 5 V 40 H 0 Z" fill="url(#grad1)" opacity="0.1" />
                  <path d="M0 35 Q 10 32, 20 28 T 40 22 T 60 18 T 80 12 T 100 5" fill="none" stroke="#1a3a5c" stroke-width="2" vector-effect="non-scaling-stroke" />
                </svg>
              </div>
              <div class="w-full flex justify-between text-[10px] text-slate-400 font-bold uppercase mt-auto z-10">
                <span>Ocak</span><span>Şubat</span><span>Mart</span><span>Nisan</span><span>Mayıs</span><span>Haziran</span>
              </div>
            </div>
          </div>

          <!-- TrustScore Distribution -->
          <div class="bg-white rounded-xl shadow-ambient border border-slate-100">
            <div class="px-6 py-4 border-b border-slate-100">
              <h3 class="text-sm font-bold text-primary-container">TrustScore Dağılımı</h3>
            </div>
            <div class="p-8 flex flex-col items-center justify-center h-72">
              <div class="relative w-40 h-40 rounded-full border-[16px] border-slate-100 flex items-center justify-center">
                <div class="absolute inset-0 rounded-full border-[16px] border-tertiary-fixed-dim" style="clip-path: polygon(50% 50%, 50% 0, 100% 0, 100% 70%)" />
                <div class="absolute inset-0 rounded-full border-[16px] border-primary-container" style="clip-path: polygon(50% 50%, 50% 0, 0 0, 0 50%)" />
                <div class="text-center">
                  <p class="text-3xl font-black text-primary-container">2.4k</p>
                  <p class="text-[10px] text-slate-400 uppercase tracking-widest">Bayi Sayısı</p>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-3 gap-3 w-full">
                <div class="text-center">
                  <p class="text-xs font-bold text-primary-container">Elite</p>
                  <div class="w-full h-1 bg-primary-container rounded-full mt-1" />
                  <p class="text-[10px] text-slate-400 mt-1">42%</p>
                </div>
                <div class="text-center">
                  <p class="text-xs font-bold text-slate-400">Prime</p>
                  <div class="w-full h-1 bg-tertiary-fixed-dim rounded-full mt-1" />
                  <p class="text-[10px] text-slate-400 mt-1">38%</p>
                </div>
                <div class="text-center">
                  <p class="text-xs font-bold text-slate-300">Core</p>
                  <div class="w-full h-1 bg-slate-100 rounded-full mt-1" />
                  <p class="text-[10px] text-slate-400 mt-1">20%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Regional & Table Section -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 28, filter: 'blur(12px)' }"
          :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 700, delay: 200, ease: [0.25, 0.46, 0.45, 0.94] } }"
          class="grid grid-cols-1 xl:grid-cols-3 gap-8"
        >
          <!-- Regional Bar Chart -->
          <div class="bg-white rounded-xl shadow-ambient border border-slate-100">
            <div class="px-6 py-4 border-b border-slate-100">
              <h3 class="text-sm font-bold text-primary-container">Bölgesel Ticaret Dağılımı</h3>
            </div>
            <div class="p-8 space-y-5">
              <div v-for="region in regions" :key="region.name">
                <div class="flex justify-between text-xs font-bold mb-2">
                  <span class="text-slate-600">{{ region.name }}</span>
                  <span class="text-primary-container">{{ region.value }}</span>
                </div>
                <div class="w-full bg-slate-50 h-2.5 rounded-full overflow-hidden">
                  <div class="bg-primary-container h-full rounded-full transition-all duration-1000" :style="`width:${region.pct}%;opacity:${region.opacity}`" />
                </div>
              </div>
            </div>
          </div>

          <!-- En Aktif Bayiler Table -->
          <div class="xl:col-span-2 bg-white rounded-xl shadow-ambient border border-slate-100 overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 class="text-sm font-bold text-primary-container">En Aktif Bayiler</h3>
              <NuxtLink to="/vendors" class="text-xs font-bold text-primary-600 hover:underline">Tümünü Gör</NuxtLink>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-100">
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bayi Adı</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">İşlem Hacmi</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">TrustScore</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Büyüme</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-for="dealer in dealers" :key="dealer.name" class="hover:bg-slate-50 transition-colors cursor-pointer">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded flex items-center justify-center font-bold text-xs" :class="dealer.avatarClass">
                          {{ dealer.initials }}
                        </div>
                        <span class="text-xs font-bold text-slate-700">{{ dealer.name }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-xs font-medium text-slate-600">{{ dealer.volume }}</td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-primary-container">{{ dealer.trust }}</span>
                        <div class="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div class="bg-md3-secondary h-full" :style="`width:${dealer.trust}%`" />
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="text-xs font-bold" :class="dealer.growth.startsWith('+') ? 'text-md3-secondary' : 'text-error'">
                        {{ dealer.growth }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</AccessGuard>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: ['auth', 'barterborsa-apex'],
})

useHead({
  title: 'BarterBorsa Analitik — BazarX',
  meta: [{ name: 'description', content: 'BarterBorsa kurumsal analitik ve executive overview paneli' }],
})

const regions = [
  { name: 'Marmara', value: '₺52.4M', pct: 85, opacity: 1 },
  { name: 'İç Anadolu', value: '₺31.2M', pct: 60, opacity: 0.7 },
  { name: 'Ege', value: '₺24.8M', pct: 45, opacity: 0.5 },
  { name: 'Akdeniz', value: '₺16.1M', pct: 30, opacity: 0.3 },
]

const dealers = [
  { name: 'Global Lojistik A.Ş.', initials: 'GL', volume: '₺4,250,000', trust: 94, growth: '+18.2%', avatarClass: 'bg-blue-100 text-blue-800' },
  { name: 'Yıldız Mobilya Ltd.', initials: 'YM', volume: '₺3,840,000', trust: 89, growth: '+12.4%', avatarClass: 'bg-amber-100 text-amber-800' },
  { name: 'Özdemir Tekstil', initials: 'OT', volume: '₺2,910,000', trust: 72, growth: '+5.8%', avatarClass: 'bg-slate-100 text-slate-600' },
  { name: 'Birlik Plastik', initials: 'BP', volume: '₺1,150,000', trust: 81, growth: '-2.1%', avatarClass: 'bg-red-50 text-red-800' },
]
</script>
