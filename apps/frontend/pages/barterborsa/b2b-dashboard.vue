<template>
  <div class="min-h-screen bg-surface text-on-surface flex">
    <!-- Sidebar -->
    <aside class="fixed left-0 top-0 bottom-0 flex flex-col z-50 bg-white border-r border-slate-200 w-64 shadow-sm">
      <div class="p-6">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 bg-primary-container rounded-lg flex items-center justify-center">
            <span class="material-symbols-outlined text-on-primary">swap_vertical_circle</span>
          </div>
          <div>
            <NuxtLink to="/barterborsa" class="text-lg font-black text-primary-container uppercase tracking-wider hover:opacity-80 transition-opacity">
              TicariTakas
            </NuxtLink>
            <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Enterprise Portal</p>
          </div>
        </div>
      </div>
      <nav class="flex-1 px-4 space-y-1 overflow-y-auto">
        <NuxtLink to="/barterborsa" class="group flex items-center px-4 py-3 my-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">
          <span class="material-symbols-outlined mr-3">dashboard</span>
          <span class="text-sm">Dashboard</span>
        </NuxtLink>
        <a class="group flex items-center px-4 py-3 my-1 rounded-r-lg bg-slate-50 text-primary-container border-r-4 border-primary-container transition-all">
          <span class="material-symbols-outlined mr-3">swap_vertical_circle</span>
          <span class="text-sm font-semibold">Trade Pool</span>
        </a>
        <NuxtLink to="/barterborsa/islem-gecmisi" class="group flex items-center px-4 py-3 my-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">
          <span class="material-symbols-outlined mr-3">receipt_long</span>
          <span class="text-sm">Transactions</span>
        </NuxtLink>
        <NuxtLink to="/products" class="group flex items-center px-4 py-3 my-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">
          <span class="material-symbols-outlined mr-3">storefront</span>
          <span class="text-sm">Marketplace</span>
        </NuxtLink>
        <NuxtLink to="/barterborsa/analitik" class="group flex items-center px-4 py-3 my-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">
          <span class="material-symbols-outlined mr-3">insights</span>
          <span class="text-sm">Analytics</span>
        </NuxtLink>
        <NuxtLink to="/barterborsa/kurumsal" class="group flex items-center px-4 py-3 my-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">
          <span class="material-symbols-outlined mr-3">business_center</span>
          <span class="text-sm">Corporate Tools</span>
        </NuxtLink>
      </nav>
      <div class="p-4 border-t border-slate-100 space-y-1">
        <NuxtLink to="/support" class="group flex items-center px-4 py-3 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">
          <span class="material-symbols-outlined mr-3">contact_support</span>
          <span class="text-sm">Support</span>
        </NuxtLink>
        <NuxtLink to="/settings" class="group flex items-center px-4 py-3 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">
          <span class="material-symbols-outlined mr-3">settings</span>
          <span class="text-sm">Settings</span>
        </NuxtLink>
      </div>
    </aside>

    <!-- Main Area -->
    <div class="ml-64 flex-1 flex flex-col">
      <!-- Top App Bar -->
      <header class="sticky top-0 z-40 w-full h-16 flex justify-between items-center px-6 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div class="flex items-center gap-4 w-1/2">
          <div class="relative w-full max-w-md">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              class="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-full text-sm focus:ring-2 focus:ring-primary-container outline-none"
              placeholder="Search trade assets, partners, or transactions..."
              type="text"
              aria-label="Arama"
            />
          </div>
        </div>
        <div class="flex items-center gap-4">
          <button class="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors" type="button" aria-label="Bildirimler">
            <span class="material-symbols-outlined">notifications</span>
          </button>
          <button class="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors" type="button" aria-label="Yardım">
            <span class="material-symbols-outlined">help_outline</span>
          </button>
          <div class="h-8 w-px bg-slate-200 mx-2" />
          <div class="flex items-center gap-3">
            <div class="text-right">
              <p class="text-sm font-bold text-primary-container">Global Logistics Inc.</p>
              <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-tertiary-fixed text-on-tertiary-fixed-variant">ELITE MEMBER</span>
            </div>
            <div class="h-10 w-10 rounded-full border-2 border-primary-container bg-primary-container text-on-primary flex items-center justify-center font-bold">GL</div>
          </div>
        </div>
      </header>

      <!-- Main Canvas -->
      <main class="p-8 space-y-8">
        <!-- Dashboard Header & TrustScore -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 20, filter: 'blur(8px)' }"
          :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 600 } }"
          class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
        >
          <div>
            <h1 class="text-[32px] leading-[40px] font-semibold tracking-[-0.01em] text-md3-primary">
              Corporate Dashboard — ELITE Membership
            </h1>
            <p class="text-slate-500 mt-1">Welcome back. Your trade ecosystem is performing at optimal efficiency.</p>
          </div>
          <div class="flex items-center gap-6 bg-white p-4 rounded-xl shadow-ambient">
            <div class="relative h-16 w-16">
              <svg class="h-full w-full" viewBox="0 0 36 36">
                <path class="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="transparent" stroke="currentColor" stroke-width="3" />
                <path class="text-md3-secondary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="transparent" stroke="currentColor" stroke-dasharray="95, 100" stroke-linecap="round" stroke-width="3" />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center font-bold text-primary-container">95</div>
            </div>
            <div>
              <p class="text-[12px] leading-[16px] font-bold uppercase tracking-[0.05em] text-slate-400">TRUSTSCORE</p>
              <p class="text-md3-secondary font-bold">All Systems Normal</p>
            </div>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 28, filter: 'blur(12px)' }"
          :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 700, ease: [0.25, 0.46, 0.45, 0.94] } }"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div v-for="metric in metrics" :key="metric.label" class="bg-white p-6 rounded-xl shadow-ambient relative overflow-hidden hover:shadow-md transition-shadow">
            <div class="absolute top-0 right-0 p-4 opacity-10">
              <span class="material-symbols-outlined text-6xl">{{ metric.icon }}</span>
            </div>
            <p class="text-[12px] leading-[16px] font-bold uppercase tracking-[0.05em] text-slate-500 mb-2">{{ metric.label }}</p>
            <h3 class="text-2xl font-bold" :class="metric.valueClass">{{ metric.value }}</h3>
            <div v-if="metric.bar" class="mt-4 w-full bg-slate-100 h-1.5 rounded-full">
              <div class="bg-primary-container h-1.5 rounded-full" :style="`width:${metric.barPct}%`" />
            </div>
            <p v-if="metric.sub" class="text-xs text-slate-400 mt-2">{{ metric.sub }}</p>
          </div>
        </div>

        <!-- Bento Grid -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 28, filter: 'blur(12px)' }"
          :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 700, delay: 100, ease: [0.25, 0.46, 0.45, 0.94] } }"
          class="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          <!-- Active Trade Opportunities -->
          <div class="lg:col-span-8 bg-white rounded-xl shadow-ambient">
            <div class="p-6 border-b border-slate-100 flex justify-between items-center">
              <h4 class="text-[20px] leading-[28px] font-semibold text-md3-primary">Active Trade Opportunities</h4>
              <NuxtLink to="/barterborsa/ticari-detay" class="text-sm font-bold text-primary-600 hover:underline">View All</NuxtLink>
            </div>
            <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="opp in opportunities"
                :key="opp.title"
                class="p-4 border border-slate-100 rounded-xl hover:border-primary-container transition-colors cursor-pointer group"
              >
                <div class="flex gap-4">
                  <div class="h-20 w-20 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300 flex-shrink-0">
                    <span class="material-symbols-outlined text-3xl">{{ opp.icon }}</span>
                  </div>
                  <div class="flex-1">
                    <div class="flex justify-between items-start">
                      <p class="font-bold text-sm text-primary-container">{{ opp.title }}</p>
                      <span class="bg-slate-100 text-[10px] px-2 py-0.5 rounded font-black uppercase">{{ opp.category }}</span>
                    </div>
                    <p class="text-xs text-slate-500 mt-1">{{ opp.desc }}</p>
                    <div class="mt-2 flex justify-between items-center">
                      <span class="text-sm font-black text-md3-secondary">{{ opp.value }}</span>
                      <NuxtLink
                        to="/barterborsa/ticari-detay"
                        class="px-3 py-1 bg-md3-primary text-on-primary text-[10px] font-bold rounded-full hover:opacity-90 transition-all"
                      >BID NOW</NuxtLink>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Panel -->
          <div class="lg:col-span-4 space-y-6">
            <!-- XP Subsidy Manager -->
            <div class="bg-white p-6 rounded-xl shadow-ambient">
              <div class="flex items-center gap-3 mb-5">
                <div class="p-2 bg-tertiary-fixed rounded-lg text-on-tertiary-fixed-variant">
                  <span class="material-symbols-outlined">electric_bolt</span>
                </div>
                <h4 class="font-bold text-md3-primary">XP Subsidy Manager</h4>
              </div>
              <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p class="text-sm font-bold text-primary-container">Auto-apply Subsidy</p>
                  <p class="text-[10px] text-slate-500 mt-0.5">50% commission discount active</p>
                </div>
                <div class="w-11 h-6 bg-md3-secondary rounded-full relative cursor-pointer">
                  <div class="absolute top-[2px] right-[2px] w-5 h-5 bg-white rounded-full shadow" />
                </div>
              </div>
              <div class="mt-5">
                <p class="text-xs text-slate-500 mb-2">Available Multiplier Stack:</p>
                <div class="flex gap-2 flex-wrap">
                  <span class="px-2 py-1 bg-tertiary-fixed/30 text-on-tertiary-fixed-variant text-[10px] font-black rounded border border-tertiary-fixed">x1.5 GROWTH</span>
                  <span class="px-2 py-1 bg-secondary-container/30 text-on-secondary-fixed-variant text-[10px] font-black rounded border border-secondary-container">x2.0 LOYALTY</span>
                </div>
              </div>
            </div>

            <!-- Compliance Watchtower -->
            <div class="bg-primary-container p-6 rounded-xl shadow-lg relative overflow-hidden">
              <div class="absolute -right-4 -bottom-4 opacity-10">
                <span class="material-symbols-outlined text-[80px] text-on-primary">security</span>
              </div>
              <div class="relative z-10">
                <h4 class="text-on-primary font-bold mb-4 flex items-center gap-2">
                  <span class="material-symbols-outlined text-secondary-fixed-dim">verified_user</span>
                  Compliance Watchtower
                </h4>
                <div class="p-4 bg-white/10 rounded-lg border border-white/10">
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-white/70">Current Status:</span>
                    <span class="text-xs font-black text-secondary-fixed-dim uppercase tracking-widest">All Systems Normal</span>
                  </div>
                  <div class="mt-3 flex gap-1">
                    <div v-for="i in 4" :key="i" class="h-1 flex-1 bg-secondary-fixed-dim rounded-full" />
                  </div>
                </div>
                <button class="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 text-on-primary text-xs font-bold rounded-lg transition-colors border border-white/20" type="button">
                  RUN COMPLIANCE AUDIT
                </button>
              </div>
            </div>
          </div>

          <!-- Trade Performance Chart -->
          <div class="lg:col-span-12 bg-white rounded-xl shadow-ambient overflow-hidden">
            <div class="p-6 border-b border-slate-100 flex justify-between items-center">
              <h4 class="text-[20px] leading-[28px] font-semibold text-md3-primary">Trade Performance Chart</h4>
              <div class="flex gap-4">
                <div class="flex items-center gap-2">
                  <span class="h-3 w-3 bg-primary-container rounded-full" />
                  <span class="text-xs text-slate-500">Barter Volume</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="h-3 w-3 bg-md3-secondary rounded-full" />
                  <span class="text-xs text-slate-500">Cash Savings</span>
                </div>
              </div>
            </div>
            <div class="p-6 h-56 flex items-end gap-6">
              <div v-for="month in chartMonths" :key="month.label" class="flex-1 flex flex-col items-center gap-2">
                <div class="w-full flex justify-center gap-1 h-40 items-end">
                  <div class="w-8 bg-primary-container/30 rounded-t-sm transition-all duration-700" :style="`height:${month.barter}%`" />
                  <div class="w-8 bg-md3-secondary rounded-t-sm transition-all duration-700" :style="`height:${month.savings}%`" />
                </div>
                <span class="text-[10px] font-bold text-slate-400">{{ month.label }}</span>
              </div>
            </div>
          </div>

          <!-- Recent Transactions Table -->
          <div class="lg:col-span-12 bg-white rounded-xl shadow-ambient overflow-hidden">
            <div class="p-6 border-b border-slate-100 flex justify-between items-center">
              <h4 class="text-[20px] leading-[28px] font-semibold text-md3-primary">Recent Transactions</h4>
              <NuxtLink to="/barterborsa/islem-gecmisi" class="text-sm font-bold text-primary-600 hover:underline">View All</NuxtLink>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead class="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Transaction ID</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Partner Entity</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset Category</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Value (TL)</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="tx in recentTx" :key="tx.id" class="hover:bg-slate-50 transition-colors cursor-pointer">
                    <td class="px-6 py-4 text-sm font-medium text-slate-900">{{ tx.id }}</td>
                    <td class="px-6 py-4 text-sm text-slate-600">{{ tx.partner }}</td>
                    <td class="px-6 py-4 text-sm text-slate-500">{{ tx.category }}</td>
                    <td class="px-6 py-4 text-sm text-slate-500">{{ tx.date }}</td>
                    <td class="px-6 py-4 text-sm font-bold text-md3-primary">{{ tx.value }}</td>
                    <td class="px-6 py-4 text-right">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold" :class="tx.statusClass">{{ tx.status }}</span>
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
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

useHead({
  title: 'TicariTakas B2B — Corporate Dashboard',
  meta: [{ name: 'description', content: 'TicariTakas B2B kurumsal takas paneli — Elite üyelik, trade pool, XP yönetimi' }],
})

const metrics = [
  { label: 'TRADE POOL BALANCE', value: '850,000 TL', icon: 'account_balance_wallet', valueClass: 'text-primary-container', bar: true, barPct: 56, sub: 'Limit: 1,500,000 TL' },
  { label: 'TOTAL XP', value: '12,450 XP', icon: 'stars', valueClass: 'text-tertiary-container', sub: 'Subsidy available' },
  { label: 'ACTIVE BIDS', value: '14', icon: 'gavel', valueClass: 'text-primary-container', sub: '+3 from yesterday' },
  { label: 'SAVED COMMISSION', value: '4,200 TL', icon: 'savings', valueClass: 'text-md3-secondary', sub: 'Saved via XP multipliers' },
]

const opportunities = [
  { title: 'Premium Office Set', category: 'Industrial', desc: '12 Units available for barter', value: '45,000 TL Val.', icon: 'chair' },
  { title: 'Industrial Kitchen Suite', category: 'Equipment', desc: 'Full set of modular units', value: '120,000 TL Val.', icon: 'kitchen' },
  { title: 'Intercontinental Logistics', category: 'Service', desc: 'Regional distribution slots', value: '32,500 TL Val.', icon: 'local_shipping' },
  { title: 'Smart IoT Hubs', category: 'Technology', desc: 'Industrial gateway package', value: '18,200 TL Val.', icon: 'devices' },
]

const chartMonths = [
  { label: 'JAN', barter: 40, savings: 20 },
  { label: 'FEB', barter: 55, savings: 35 },
  { label: 'MAR', barter: 75, savings: 45 },
  { label: 'APR', barter: 90, savings: 60 },
  { label: 'MAY', barter: 85, savings: 50 },
  { label: 'JUN', barter: 100, savings: 70 },
]

const recentTx = [
  { id: '#TRX-88291', partner: 'Zenith Manufacturing', category: 'Industrial Parts', date: 'Oct 12, 2023', value: '125,400.00', status: 'COMPLETED', statusClass: 'bg-secondary-container text-on-secondary-fixed-variant' },
  { id: '#TRX-88285', partner: 'Metro Tech Solutions', category: 'IT Infrastructure', date: 'Oct 11, 2023', value: '48,250.00', status: 'PENDING', statusClass: 'bg-tertiary-fixed text-on-tertiary-fixed-variant' },
  { id: '#TRX-88274', partner: 'AeroFreight Cargo', category: 'Logistics Credits', date: 'Oct 10, 2023', value: '92,000.00', status: 'COMPLETED', statusClass: 'bg-secondary-container text-on-secondary-fixed-variant' },
]
</script>
