<template>
  <AccessGuard :requiresAuth="true" :requiresVendor="true" :requiresApex="true">
    <div class="flex flex-col lg:flex-row gap-6 w-full">
    <!-- Sidebar -->
    <aside class="hidden lg:flex flex-col z-10 bg-white border border-slate-200 rounded-2xl w-64 shadow-sm p-4 gap-2 sticky top-[100px] h-[calc(100vh-120px)]">
      <div class="mb-8 px-2 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
        </div>
        <div>
          <NuxtLink to="/barterborsa" class="text-xl font-black text-primary-container tracking-tight hover:opacity-80 transition-opacity">
            BarterBorsa
          </NuxtLink>
          <p class="text-xs text-slate-500 font-medium">Kurumsal Bayi Paneli</p>
        </div>
      </div>
      <nav class="flex-1 space-y-1">
        <NuxtLink to="/ticaritakas/b2b-dashboard" class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 transition-all rounded-lg">
          <span class="font-medium text-sm">Dashboard</span>
        </NuxtLink>
        <NuxtLink to="/barterborsa/kurumsal" class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 transition-all rounded-lg">
          <span class="font-medium text-sm">Kör Havuz</span>
        </NuxtLink>
        <NuxtLink to="/products" class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 transition-all rounded-lg">
          <span class="font-medium text-sm">Envanter</span>
        </NuxtLink>
        <NuxtLink to="/barterborsa/islem-gecmisi" class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 transition-all rounded-lg">
          <span class="font-medium text-sm">Akıllı Kota</span>
        </NuxtLink>
        <a class="flex items-center gap-3 px-4 py-3 bg-primary-container text-white shadow-md rounded-lg transition-all transform active:scale-95 cursor-pointer">
          <span class="font-medium text-sm">Bayi Yönetimi</span>
        </a>
        <NuxtLink to="/barterborsa/analitik" class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 transition-all rounded-lg">
          <span class="font-medium text-sm">Raporlama</span>
        </NuxtLink>
      </nav>
      <div class="mt-auto border-t border-slate-100 pt-4 space-y-1">
        <NuxtLink to="/settings" class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 transition-all rounded-lg">
          <span class="font-medium text-sm">Ayarlar</span>
        </NuxtLink>
        <NuxtLink to="/auth/login" class="flex items-center gap-3 px-4 py-3 text-error hover:bg-error/5 transition-all rounded-lg">
          <span class="font-medium text-sm">Çıkış Yap</span>
        </NuxtLink>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Main Canvas -->
      <main class="py-4 space-y-8 flex-1">
        <!-- Bayi Ağı Genel Bakış -->
        <section
          v-motion
          :initial="{ opacity: 0, y: 28, filter: 'blur(12px)' }"
          :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 700, ease: [0.25, 0.46, 0.45, 0.94] } }"
          class="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-ambient flex flex-col justify-between hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold tracking-widest uppercase text-slate-500">TOPLAM BAYİ</span>
              <span class="material-symbols-outlined text-primary-container bg-primary-fixed/30 p-2 rounded-lg">group</span>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-primary-container">{{ kpiTotal }}</h3>
              <p class="text-xs text-md3-secondary font-medium flex items-center gap-1 mt-1">
                <span class="material-symbols-outlined text-[14px]">trending_up</span> +12 bu ay
              </p>
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-ambient flex flex-col justify-between hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold tracking-widest uppercase text-slate-500">AKTİF / PASİF</span>
              <span class="material-symbols-outlined text-md3-secondary bg-secondary-container p-2 rounded-lg">verified</span>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-primary-container">{{ kpiActive }}</h3>
              <div class="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div class="bg-md3-secondary h-full rounded-full" :style="`width:${kpiPoolPct}%`" />
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-ambient flex flex-col justify-between hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold tracking-widest uppercase text-slate-500">TOPLAM HAVUZ LİMİTİ</span>
              <span class="material-symbols-outlined text-tertiary-container bg-tertiary-fixed p-2 rounded-lg">account_balance_wallet</span>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-primary-container">{{ kpiPool }}</h3>
              <p class="text-xs text-slate-500 font-medium mt-1">Toplam tanımlı barter hacmi</p>
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-ambient flex flex-col justify-between hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold tracking-widest uppercase text-slate-500">HAVUZ KULLANIM ORANI</span>
              <span class="material-symbols-outlined text-error bg-error-container p-2 rounded-lg">analytics</span>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-primary-container">{{ kpiPoolPct }}%</h3>
              <p class="text-xs text-slate-500 font-medium mt-1">Sistem geneli doluluk</p>
            </div>
          </div>
        </section>

        <div
          v-motion
          :initial="{ opacity: 0, y: 28, filter: 'blur(12px)' }"
          :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 700, delay: 100, ease: [0.25, 0.46, 0.45, 0.94] } }"
          class="grid grid-cols-1 lg:grid-cols-4 gap-8"
        >
          <!-- Bayi Listesi Content -->
          <div class="lg:col-span-3 space-y-6">
            <!-- Filtreleme Alanı -->
            <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-ambient">
              <div class="flex flex-wrap items-center gap-4">
                <div class="flex-1 min-w-[200px]">
                  <label class="block text-xs font-bold text-slate-500 mb-1.5 px-1">Üyelik Tipi</label>
                  <select class="w-full border-slate-200 rounded-lg text-sm focus:border-primary-container outline-none transition-all py-2 px-3 bg-slate-50">
                    <option>Tümü</option>
                    <option>Elite</option>
                    <option>Prime</option>
                    <option>Core</option>
                  </select>
                </div>
                <div class="flex-1 min-w-[200px]">
                  <label class="block text-xs font-bold text-slate-500 mb-1.5 px-1">Şehir</label>
                  <select class="w-full border-slate-200 rounded-lg text-sm focus:border-primary-container outline-none transition-all py-2 px-3 bg-slate-50">
                    <option>Tüm Şehirler</option>
                    <option>İstanbul</option>
                    <option>Ankara</option>
                    <option>İzmir</option>
                    <option>Bursa</option>
                  </select>
                </div>
                <div class="flex-1 min-w-[200px]">
                  <label class="block text-xs font-bold text-slate-500 mb-1.5 px-1">TrustScore Aralığı</label>
                  <select class="w-full border-slate-200 rounded-lg text-sm focus:border-primary-container outline-none transition-all py-2 px-3 bg-slate-50">
                    <option>Tümü</option>
                    <option>Kritik (&lt; 40)</option>
                    <option>Orta (40-75)</option>
                    <option>Yüksek (75+)</option>
                  </select>
                </div>
                <div class="pt-6">
                  <button class="bg-md3-primary text-on-primary px-6 py-2 rounded-lg text-sm font-bold shadow-md hover:opacity-90 transition-all active:scale-95" type="button">
                    Filtreleri Uygula
                  </button>
                </div>
              </div>
            </div>

            <!-- Ana Tablo -->
            <div class="bg-white rounded-xl border border-slate-100 shadow-ambient overflow-hidden">
              <div class="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 class="text-lg font-bold text-primary-container flex items-center gap-2">
                  Bayi Listesi
                </h2>
                <button class="text-sm font-bold text-primary-container flex items-center gap-2 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-all" type="button">
                  Dışa Aktar (CSV)
                </button>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-left">
                  <thead class="bg-slate-50/80 text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                    <tr>
                      <th class="px-6 py-4">BAYİ ADI / ŞEHİR</th>
                      <th class="px-6 py-4">ÜYELİK TİPİ</th>
                      <th class="px-6 py-4">TRUSTSCORE</th>
                      <th class="px-6 py-4">GÜNCEL BAKİYE</th>
                      <th class="px-6 py-4">SMART CAP</th>
                      <th class="px-6 py-4 text-right">İŞLEMLER</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-50">
                    <tr v-for="dealer in dealers" :key="dealer.id" class="hover:bg-slate-50 transition-colors group">
                      <td class="px-6 py-5">
                        <div class="flex items-center gap-3">
                          <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs" :class="dealer.avatarClass">{{ dealer.initials }}</div>
                          <div>
                            <div class="text-sm font-bold text-primary-container">{{ dealer.name }}</div>
                            <div class="text-[11px] text-slate-500">{{ dealer.location }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-5">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase" :class="dealer.membershipClass">
                          <span class="material-symbols-outlined text-xs mr-1">{{ dealer.membershipIcon }}</span>
                          {{ dealer.membership }}
                        </span>
                      </td>
                      <td class="px-6 py-5">
                        <div class="flex items-center gap-2">
                          <div class="w-10 h-10 rounded-full border-4 flex items-center justify-center text-xs font-bold" :class="dealer.trustCircleClass">{{ dealer.trustScore }}</div>
                          <span class="text-[10px] font-bold uppercase" :class="dealer.trustTextClass">{{ dealer.trustLabel }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-5">
                        <div class="text-sm font-bold text-primary-container">{{ dealer.balance }}</div>
                        <div class="text-[10px] text-slate-400">Barter TL</div>
                      </td>
                      <td class="px-6 py-5">
                        <div class="w-32">
                          <div class="flex justify-between text-[10px] mb-1">
                            <span class="font-medium text-slate-500">Dolar Oranı</span>
                            <span class="font-bold" :class="dealer.capTextClass">{{ dealer.capPct }}%</span>
                          </div>
                          <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div class="h-full rounded-full" :class="dealer.capBarClass" :style="`width:${dealer.capPct}%`" />
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-5">
                        <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button class="p-2 text-slate-400 hover:text-primary-container hover:bg-slate-100 rounded-lg transition-all" title="Detay" type="button"><span class="material-symbols-outlined text-lg">visibility</span></button>
                          <button class="p-2 text-slate-400 hover:text-primary-container hover:bg-slate-100 rounded-lg transition-all" title="Limit Düzenle" type="button"><span class="material-symbols-outlined text-lg">edit_note</span></button>
                          <button class="p-2 text-slate-400 hover:text-primary-container hover:bg-slate-100 rounded-lg transition-all" title="İşlemleri İzle" type="button"><span class="material-symbols-outlined text-lg">monitoring</span></button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <p class="text-xs text-slate-500">Toplam {{ dealers.length }} kayıt listeleniyor.</p>
                <div class="flex items-center gap-2">
                  <button class="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-400" type="button"><span class="material-symbols-outlined text-base">chevron_left</span></button>
                  <button class="w-8 h-8 rounded-lg bg-md3-primary text-on-primary text-xs font-bold" type="button">1</button>
                  <button class="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs text-slate-600" type="button">2</button>
                  <button class="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs text-slate-600" type="button">3</button>
                  <button class="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-400" type="button"><span class="material-symbols-outlined text-base">chevron_right</span></button>
                </div>
              </div>
            </div>
          </div>

          <!-- Sağ Panel: Kritik Uyarılar -->
          <aside class="space-y-6">
            <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-ambient">
              <h3 class="text-sm font-bold text-primary-container flex items-center gap-2 mb-6">
                Kritik Uyarılar (4)
              </h3>
              <div class="space-y-4">
                <div v-for="alert in alerts" :key="alert.title" class="p-4 rounded-lg border-l-4" :class="alert.bgClass">
                  <div class="flex justify-between items-start mb-2">
                    <span class="text-[10px] font-bold tracking-wider uppercase" :class="alert.textClass">{{ alert.title }}</span>
                    <span class="text-[10px] text-slate-400">{{ alert.time }}</span>
                  </div>
                  <p class="text-xs font-bold text-primary-container mb-1">{{ alert.dealer }}</p>
                  <p class="text-[11px] text-slate-600">{{ alert.desc }}</p>
                </div>
                <button class="w-full py-3 text-xs font-bold text-primary-container hover:bg-slate-50 border border-dashed border-slate-300 rounded-lg transition-all" type="button">
                  Tüm Uyarıları Gör
                </button>
              </div>
            </div>

            <div class="bg-md3-primary p-6 rounded-xl shadow-lg relative overflow-hidden">
              <div class="relative z-10">
                <h4 class="text-on-primary text-sm font-bold mb-2">Hızlı Limit Artırımı</h4>
                <p class="text-blue-100 text-[11px] leading-relaxed mb-4">
                  Sistem önerisi: Aktif 12 Elite bayinin toplam ₺2.4M ek hacim kapasitesi bulunuyor.
                </p>
                <button class="w-full bg-white text-md3-primary py-2 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all" type="button">
                  Önerileri İncele
                </button>
              </div>
              <div class="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
                <span class="material-symbols-outlined text-[120px] text-white">auto_awesome</span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <!-- Contextual FAB -->
      <button class="fixed bottom-8 right-8 w-14 h-14 bg-md3-secondary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group" type="button">
        <span class="material-symbols-outlined text-2xl">add</span>
        <span class="absolute right-full mr-4 bg-md3-primary text-on-primary text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">Yeni Bayi Ekle</span>
      </button>
    </div>
  </div>
</AccessGuard>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: ['auth', 'barterborsa-apex'], hideSideAds: true })

useHead({
  title: 'Bayi Yönetim Paneli — BarterBorsa',
  meta: [{ name: 'description', content: 'Kurumsal bayi paneli, akıllı kota yönetimi, trustscore analizi ve uyarı sistemi' }],
})

interface DealerRow {
  id: string
  initials: string
  name: string
  location: string
  avatarClass: string
  membership: string
  membershipIcon: string
  membershipClass: string
  trustScore: number
  trustLabel: string
  trustCircleClass: string
  trustTextClass: string
  balance: string
  capPct: number
  capTextClass: string
  capBarClass: string
}

interface AlertRow {
  title: string
  time: string
  dealer: string
  desc: string
  bgClass: string
  textClass: string
}

interface BarterUser {
  id: string
  name: string
  wallet?: { barterBalance?: number; barterCreditLimit?: number }
  tier?: string
  trustScore?: number
  city?: string
}

interface BarterInfoData {
  barterBalance?: string
  barterCreditLimit?: string
  tier?: string
}

const TIER_LIMITS: Record<string, number> = { CORE: 150_000, PRIME: 500_000, ELITE: 1_500_000, APEX: 10_000_000 }

const { $api } = useApi()
const authStore = useAuthStore()

const dealers = ref<DealerRow[]>([])
const alerts  = ref<AlertRow[]>([])
const kpiTotal    = ref('—')
const kpiActive   = ref('—')
const kpiPool     = ref('—')
const kpiPoolPct  = ref(0)

const trustLabel = (score: number): string => {
  if (score >= 75) return 'GÜVENLİ'
  if (score >= 40) return 'ORTA'
  return 'KRİTİK'
}
const trustCircleClass = (score: number): string => {
  if (score >= 75) return 'border-md3-secondary/30 text-md3-secondary'
  if (score >= 40) return 'border-amber-500/30 text-amber-600'
  return 'border-error/30 text-error'
}
const trustTextClass = (score: number): string => {
  if (score >= 75) return 'text-md3-secondary'
  if (score >= 40) return 'text-amber-600'
  return 'text-error'
}
const capTextClass = (pct: number): string => (pct >= 80 ? 'text-amber-600' : 'text-primary-container')
const capBarClass  = (pct: number): string => (pct >= 80 ? 'bg-amber-500' : 'bg-primary-container')

const fetchData = async (): Promise<void> => {
  const [usersRes, barterRes] = await Promise.all([
    $api<{ success: boolean; data: BarterUser[] }>('/api/v1/admin/barter/users').catch(() => null),
    $api<{ success: boolean; data: BarterInfoData }>('/api/v1/barter/info').catch(() => null),
  ])

  if (usersRes?.success && usersRes.data) {
    const users = usersRes.data
    const active = users.filter(u => (u.wallet?.barterBalance ?? 0) > 0).length
    kpiTotal.value  = new Intl.NumberFormat('tr-TR').format(users.length)
    kpiActive.value = `${active} / ${users.length - active}`

    dealers.value = users.map(u => {
      const bal    = Number(u.wallet?.barterBalance ?? 0)
      const limit  = TIER_LIMITS[u.tier ?? 'CORE'] ?? 150_000
      const capPct = limit > 0 ? Math.min(100, Math.round((bal / limit) * 100)) : 0
      const score  = u.trustScore ?? 50
      const initials = (u.name ?? '?').split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase()
      return {
        id:              u.id,
        initials,
        name:            u.name ?? '—',
        location:        u.city ?? '—',
        avatarClass:     'bg-primary-fixed/30 text-primary-container',
        membership:      u.tier ?? 'CORE',
        membershipIcon:  u.tier === 'ELITE' ? 'workspace_premium' : u.tier === 'PRIME' ? 'star' : 'trip_origin',
        membershipClass: u.tier === 'ELITE' ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant' : u.tier === 'PRIME' ? 'bg-primary-fixed text-primary-container' : 'bg-slate-100 text-slate-600 border border-slate-200',
        trustScore:      score,
        trustLabel:      trustLabel(score),
        trustCircleClass: trustCircleClass(score),
        trustTextClass:  trustTextClass(score),
        balance:         `₺${new Intl.NumberFormat('tr-TR').format(bal)}`,
        capPct,
        capTextClass:    capTextClass(capPct),
        capBarClass:     capBarClass(capPct),
      }
    })

    // %80+ kota doluluk oranına sahip bayi uyarıları
    alerts.value = dealers.value
      .filter(d => d.capPct >= 80)
      .map(d => ({
        title:   'Kota Sınırı',
        time:    'Şimdi',
        dealer:  d.name,
        desc:    `Kota doluluk oranı %${d.capPct}'e ulaştı. Havuz limiti yükseltilmesi gerekebilir.`,
        bgClass: 'bg-error/5 border-error',
        textClass: 'text-error',
      }))
  }

  if (barterRes?.success && barterRes.data) {
    const d    = barterRes.data
    const bal  = Number(d.barterBalance ?? 0)
    const lim  = Number(d.barterCreditLimit ?? TIER_LIMITS.ELITE)
    kpiPool.value    = `₺${new Intl.NumberFormat('tr-TR').format(bal)}`
    kpiPoolPct.value = lim > 0 ? Math.min(100, Math.round((bal / lim) * 100)) : 0
  }
}

onMounted(fetchData)
</script>
