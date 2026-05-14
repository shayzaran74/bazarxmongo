<template>
  <AccessGuard :requiresAuth="true" :requiresVendor="true" :requiresApex="true">
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
        <NuxtLink to="/barterborsa/b2b-dashboard" class="group flex items-center px-4 py-3 my-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">
          <span class="material-symbols-outlined mr-3">swap_vertical_circle</span>
          <span class="text-sm">Trade Pool</span>
        </NuxtLink>
        <a class="group flex items-center px-4 py-3 my-1 rounded-r-lg bg-slate-50 text-primary-container border-r-4 border-primary-container transition-all">
          <span class="material-symbols-outlined mr-3">receipt_long</span>
          <span class="text-sm font-semibold">Transactions</span>
        </a>
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
    </aside>

    <!-- Main Content Area -->
    <div class="ml-64 flex-1 flex flex-col min-h-screen">
      <!-- Top App Bar -->
      <header class="sticky top-0 z-40 w-full h-16 flex justify-between items-center px-6 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div class="flex items-center gap-4 w-1/2">
          <div class="relative w-full max-w-md">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input class="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-full text-sm focus:ring-2 focus:ring-primary-container outline-none" placeholder="Search by ID, partner name, or invoice..." type="text"/>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <button class="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors" type="button" aria-label="Bildirimler">
            <span class="material-symbols-outlined">notifications</span>
          </button>
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
      <main class="p-8 space-y-8 flex-1">
        <!-- Header Section -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 20, filter: 'blur(8px)' }"
          :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 600 } }"
        >
          <h1 class="text-[32px] leading-[40px] font-semibold tracking-[-0.01em] text-md3-primary mb-2">Transaction History</h1>
          <p class="text-on-surface-variant">Manage and track all your ecosystem trades and financial movements</p>
        </div>

        <!-- Metric Cards -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 28, filter: 'blur(12px)' }"
          :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 700, ease: [0.25, 0.46, 0.45, 0.94] } }"
          class="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <!-- Volume -->
          <div class="bg-white p-6 rounded-xl shadow-ambient border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <span class="text-[12px] font-bold uppercase tracking-[0.05em] text-slate-500 mb-2 block">Total Trade Volume</span>
              <div class="flex items-baseline gap-2">
                <span class="text-[32px] leading-[40px] font-bold text-primary-container">₺ 2,450,000</span>
                <span class="text-md3-secondary text-sm font-bold flex items-center">
                  <span class="material-symbols-outlined text-sm">trending_up</span> 12%
                </span>
              </div>
            </div>
            <div class="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full bg-primary-container w-3/4" />
            </div>
          </div>

          <!-- XP -->
          <div class="bg-white p-6 rounded-xl shadow-ambient border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <span class="text-[12px] font-bold uppercase tracking-[0.05em] text-slate-500 mb-2 block">Total XP Earned</span>
              <div class="flex items-baseline gap-2">
                <span class="text-[32px] leading-[40px] font-bold text-tertiary-container">124,500 XP</span>
                <span class="text-md3-secondary text-sm font-bold">Gold Tier</span>
              </div>
            </div>
            <div class="mt-4 flex -space-x-2">
              <div class="h-6 w-6 rounded-full bg-tertiary-fixed border-2 border-white" />
              <div class="h-6 w-6 rounded-full bg-tertiary-fixed-dim border-2 border-white" />
              <div class="h-6 w-6 rounded-full bg-on-tertiary-container border-2 border-white" />
            </div>
          </div>

          <!-- Savings -->
          <div class="bg-white p-6 rounded-xl shadow-ambient border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <span class="text-[12px] font-bold uppercase tracking-[0.05em] text-slate-500 mb-2 block">Net Savings</span>
              <div class="flex items-baseline gap-2">
                <span class="text-[32px] leading-[40px] font-bold text-md3-secondary">₺ 342,000</span>
                <span class="text-on-secondary-container text-sm font-medium">vs Cash</span>
              </div>
            </div>
            <div class="mt-4 text-xs font-medium text-slate-500 flex items-center">
              <span class="material-symbols-outlined text-sm mr-1">verified</span>
              Efficiency score: 94.2%
            </div>
          </div>
        </div>

        <!-- Layout Grid -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 28, filter: 'blur(12px)' }"
          :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 700, delay: 100, ease: [0.25, 0.46, 0.45, 0.94] } }"
          class="flex flex-col lg:flex-row gap-6"
        >
          <!-- Main Table Section -->
          <div class="flex-1 space-y-6">
            <!-- Filter Bar -->
            <div class="bg-white p-4 rounded-xl shadow-ambient border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
              <div class="relative flex-1 w-full">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input class="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:border-primary-container outline-none text-sm transition-all" placeholder="Search by ID, partner name, or invoice..." type="text"/>
              </div>
              <div class="flex gap-2 w-full md:w-auto">
                <select class="pl-4 pr-8 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:border-primary-container cursor-pointer w-full md:w-auto">
                  <option>All Types</option>
                  <option>Barter</option>
                  <option>XP Reward</option>
                  <option>Cash</option>
                </select>
                <button class="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors" type="button">
                  <span class="material-symbols-outlined text-sm">calendar_today</span>
                  Date
                </button>
                <button class="flex items-center gap-2 px-4 py-2 bg-md3-primary text-on-primary rounded-lg text-sm font-bold hover:opacity-90 active:scale-95 transition-all" type="button">
                  <span class="material-symbols-outlined text-sm">filter_list</span>
                  More
                </button>
              </div>
            </div>

            <!-- Table -->
            <div class="bg-white rounded-xl shadow-ambient border border-slate-100 overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-slate-50 text-[12px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200">
                      <th class="px-6 py-4">Transaction ID</th>
                      <th class="px-6 py-4">Counterparty</th>
                      <th class="px-6 py-4">Type</th>
                      <th class="px-6 py-4">Date</th>
                      <th class="px-6 py-4">Amount</th>
                      <th class="px-6 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-slate-50 transition-colors group cursor-pointer">
                      <td class="px-6 py-4 font-mono text-sm text-primary-container">{{ tx.id }}</td>
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                          <div class="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-primary-container text-xs">
                            {{ tx.partnerInitials }}
                          </div>
                          <span class="font-medium text-slate-800">{{ tx.partner }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" :class="tx.typeClass">{{ tx.type }}</span>
                      </td>
                      <td class="px-6 py-4 text-slate-500 text-sm">{{ tx.date }}</td>
                      <td class="px-6 py-4">
                        <div class="flex flex-col">
                          <span class="font-bold text-slate-800">{{ tx.amount }}</span>
                          <span class="text-xs" :class="tx.xp.startsWith('+0') ? 'text-slate-400' : 'text-tertiary-container'">{{ tx.xp }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex items-center justify-end gap-1.5" :class="tx.statusColorClass">
                          <span class="w-2 h-2 rounded-full" :class="tx.statusDotClass" />
                          <span class="text-sm font-semibold">{{ tx.status }}</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <span class="text-sm text-slate-500">Showing 1-10 of 128 transactions</span>
                <div class="flex gap-2">
                  <button class="p-1 hover:bg-slate-200 rounded border border-slate-200" type="button"><span class="material-symbols-outlined text-sm">chevron_left</span></button>
                  <button class="px-3 py-1 bg-md3-primary text-on-primary text-sm font-bold rounded" type="button">1</button>
                  <button class="px-3 py-1 hover:bg-slate-200 text-sm font-medium rounded" type="button">2</button>
                  <button class="px-3 py-1 hover:bg-slate-200 text-sm font-medium rounded" type="button">3</button>
                  <button class="p-1 hover:bg-slate-200 rounded border border-slate-200" type="button"><span class="material-symbols-outlined text-sm">chevron_right</span></button>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Sidebar -->
          <div class="w-full lg:w-80 flex flex-col gap-6">
            <!-- TrustScore Impact -->
            <div class="bg-white p-6 rounded-xl shadow-ambient border border-slate-100">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-[20px] font-semibold text-md3-primary">TrustScore</h3>
                <span class="material-symbols-outlined text-tertiary-fixed-dim">verified_user</span>
              </div>
              <div class="flex flex-col items-center py-4">
                <div class="relative flex items-center justify-center">
                  <svg class="w-32 h-32 transform -rotate-90">
                    <circle class="text-slate-100" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" stroke-width="8" />
                    <circle class="text-md3-secondary" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" stroke-dasharray="364.4" stroke-dashoffset="36.4" stroke-width="8" />
                  </svg>
                  <span class="absolute text-3xl font-black text-primary-container">9.0</span>
                </div>
                <span class="mt-4 text-sm font-bold text-slate-800">Excellent Standing</span>
                <p class="text-xs text-center text-slate-500 mt-2">Your barter-to-cash ratio is optimizing your liquidity.</p>
              </div>
              <button class="w-full mt-4 py-2 bg-slate-50 text-md3-primary border border-primary-container rounded-lg text-sm font-bold hover:bg-primary-fixed-dim transition-colors" type="button">
                Improve Score
              </button>
            </div>

            <!-- Financial Summary -->
            <div class="bg-white p-6 rounded-xl shadow-ambient border border-slate-100">
              <h3 class="text-[20px] font-semibold text-md3-primary mb-4">Summary</h3>
              <div class="space-y-4">
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500">Barter Income</span>
                  <span class="font-bold text-slate-800">₺ 1.2M</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500">XP Valuation</span>
                  <span class="font-bold text-slate-800">₺ 124K</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500">Tax Saved</span>
                  <span class="font-bold text-md3-secondary">₺ 42.5K</span>
                </div>
                <div class="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span class="text-[12px] font-bold text-primary-container uppercase">Net Ecosystem Value</span>
                  <span class="text-[20px] font-bold text-primary-container">₺ 1.36M</span>
                </div>
              </div>
            </div>

            <!-- Promo Card -->
            <div class="relative bg-primary-container rounded-xl p-6 overflow-hidden">
              <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent" />
              <h4 class="text-white font-bold mb-2 relative z-10">Premium Insights</h4>
              <p class="text-slate-300 text-xs mb-4 relative z-10 leading-relaxed">Upgrade to Titanium tier to unlock advanced AI-driven trade forecasting.</p>
              <button class="bg-tertiary-fixed text-on-tertiary-fixed font-bold py-2 px-4 rounded-lg text-xs hover:bg-tertiary-fixed-dim transition-all relative z-10" type="button">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</AccessGuard>
</template>

<script setup lang="ts">
definePageMeta({ layout: false, middleware: ['auth', 'barterborsa-apex'] })

useHead({
  title: 'İşlem Geçmişi — TicariTakas B2B',
  meta: [{ name: 'description', content: 'B2B TicariTakas işlem geçmişi, bakiye hareketleri ve trustscore etkisi' }],
})

const transactions = [
  { id: '#TRX-88102', partnerInitials: 'TL', partner: 'TechLogistics Inc.', type: 'Barter', typeClass: 'bg-secondary-container text-on-secondary-container', date: 'Oct 24, 2023', amount: '₺ 45,000', xp: '+450 XP', status: 'Completed', statusColorClass: 'text-md3-secondary', statusDotClass: 'bg-md3-secondary' },
  { id: '#TRX-88103', partnerInitials: 'AS', partner: 'Apex Solutions Group', type: 'XP Reward', typeClass: 'bg-tertiary-fixed text-on-tertiary-fixed-variant', date: 'Oct 22, 2023', amount: '₺ 0', xp: '+2,500 XP', status: 'Completed', statusColorClass: 'text-md3-secondary', statusDotClass: 'bg-md3-secondary' },
  { id: '#TRX-88104', partnerInitials: 'GT', partner: 'Global Trade Partners', type: 'Cash', typeClass: 'bg-slate-200 text-slate-600', date: 'Oct 21, 2023', amount: '₺ 128,400', xp: '+0 XP', status: 'Processing', statusColorClass: 'text-amber-600', statusDotClass: 'bg-amber-600' },
  { id: '#TRX-88105', partnerInitials: 'HM', partner: 'Horizon Media Ltd.', type: 'Barter', typeClass: 'bg-secondary-container text-on-secondary-container', date: 'Oct 20, 2023', amount: '₺ 12,000', xp: '+120 XP', status: 'Pending', statusColorClass: 'text-error', statusDotClass: 'bg-error' },
]
</script>
