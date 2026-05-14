<template>
  <AccessGuard :requiresAuth="true" :requiresVendor="true" :requiresApex="true">
    <div class="min-h-screen bg-surface text-on-surface flex">
    <!-- Sidebar -->
    <aside class="fixed left-0 top-0 bottom-0 flex flex-col z-50 bg-white border-r border-slate-200 w-64 shadow-sm p-4 gap-2">
      <div class="mb-8 px-2 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
          <span class="material-symbols-outlined text-white">currency_exchange</span>
        </div>
        <div>
          <NuxtLink to="/barterborsa" class="text-xl font-black text-primary-container tracking-tight hover:opacity-80 transition-opacity">
            BarterBorsa
          </NuxtLink>
          <p class="text-xs text-slate-500 font-medium">Kurumsal Bayi Paneli</p>
        </div>
      </div>
      <nav class="flex-1 space-y-1">
        <NuxtLink to="/barterborsa/b2b-dashboard" class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 transition-all rounded-lg">
          <span class="material-symbols-outlined">dashboard</span>
          <span class="font-medium text-sm">Dashboard</span>
        </NuxtLink>
        <NuxtLink to="/barterborsa/kurumsal" class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 transition-all rounded-lg">
          <span class="material-symbols-outlined">waves</span>
          <span class="font-medium text-sm">Kör Havuz</span>
        </NuxtLink>
        <NuxtLink to="/products" class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 transition-all rounded-lg">
          <span class="material-symbols-outlined">inventory_2</span>
          <span class="font-medium text-sm">Envanter</span>
        </NuxtLink>
        <NuxtLink to="/barterborsa/islem-gecmisi" class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 transition-all rounded-lg">
          <span class="material-symbols-outlined">speed</span>
          <span class="font-medium text-sm">Akıllı Kota</span>
        </NuxtLink>
        <a class="flex items-center gap-3 px-4 py-3 bg-primary-container text-white shadow-md rounded-lg transition-all transform active:scale-95 cursor-pointer">
          <span class="material-symbols-outlined">group</span>
          <span class="font-medium text-sm">Bayi Yönetimi</span>
        </a>
        <NuxtLink to="/barterborsa/analitik" class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 transition-all rounded-lg">
          <span class="material-symbols-outlined">assessment</span>
          <span class="font-medium text-sm">Raporlama</span>
        </NuxtLink>
      </nav>
      <div class="mt-auto border-t border-slate-100 pt-4 space-y-1">
        <NuxtLink to="/settings" class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 transition-all rounded-lg">
          <span class="material-symbols-outlined">settings</span>
          <span class="font-medium text-sm">Ayarlar</span>
        </NuxtLink>
        <NuxtLink to="/auth/login" class="flex items-center gap-3 px-4 py-3 text-error hover:bg-error/5 transition-all rounded-lg">
          <span class="material-symbols-outlined">logout</span>
          <span class="font-medium text-sm">Çıkış Yap</span>
        </NuxtLink>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="ml-64 flex-1 flex flex-col min-h-screen">
      <!-- Top App Bar -->
      <header class="sticky top-0 z-40 w-full h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
        <div class="flex items-center gap-4 flex-1 max-w-md">
          <div class="relative w-full">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input class="w-full bg-slate-100 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-container/20 transition-all outline-none" placeholder="Bayi veya bölge ara..." type="text"/>
          </div>
        </div>
        <div class="flex items-center gap-6">
          <button class="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all" type="button" aria-label="Bildirimler">
            <span class="material-symbols-outlined">notifications</span>
            <span class="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white" />
          </button>
          <button class="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all" type="button" aria-label="Yardım">
            <span class="material-symbols-outlined">help_outline</span>
          </button>
          <div class="h-8 w-px bg-slate-200 mx-2" />
          <div class="flex items-center gap-3 cursor-pointer group">
            <div class="text-right">
              <p class="text-xs font-bold text-primary-container">Ahmet Yılmaz</p>
              <p class="text-[10px] text-slate-500">Global Admin</p>
            </div>
            <div class="w-10 h-10 rounded-full border-2 border-primary-fixed bg-primary-container text-white flex items-center justify-center text-sm font-bold shadow-sm group-hover:scale-105 transition-transform">AY</div>
          </div>
        </div>
      </header>

      <!-- Main Canvas -->
      <main class="p-8 space-y-8 flex-1">
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
              <h3 class="text-2xl font-bold text-primary-container">1,248</h3>
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
              <h3 class="text-2xl font-bold text-primary-container">1,192 / 56</h3>
              <div class="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div class="bg-md3-secondary h-full rounded-full" style="width: 95.5%;" />
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-ambient flex flex-col justify-between hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold tracking-widest uppercase text-slate-500">TOPLAM HAVUZ LİMİTİ</span>
              <span class="material-symbols-outlined text-tertiary-container bg-tertiary-fixed p-2 rounded-lg">account_balance_wallet</span>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-primary-container">₺45.2M</h3>
              <p class="text-xs text-slate-500 font-medium mt-1">Toplam tanımlı barter hacmi</p>
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-ambient flex flex-col justify-between hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold tracking-widest uppercase text-slate-500">HAVUZ KULLANIM ORANI</span>
              <span class="material-symbols-outlined text-error bg-error-container p-2 rounded-lg">analytics</span>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-primary-container">64.2%</h3>
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
                  <span class="material-symbols-outlined text-primary-container">hub</span>
                  Bayi Listesi
                </h2>
                <button class="text-sm font-bold text-primary-container flex items-center gap-2 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-all" type="button">
                  <span class="material-symbols-outlined text-base">download</span>
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
                <p class="text-xs text-slate-500">Toplam 1,248 kayıt arasından 1-30 arası gösteriliyor.</p>
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
                <span class="material-symbols-outlined text-error">warning</span>
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
  </AccessGuard>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

useHead({
  title: 'Bayi Yönetim Paneli — BarterBorsa',
  meta: [{ name: 'description', content: 'Kurumsal bayi paneli, akıllı kota yönetimi, trustscore analizi ve uyarı sistemi' }],
})

const dealers = [
  { id: 1, initials: 'AY', name: 'Anadolu Yapı A.Ş.', location: 'İstanbul, Kadıköy', avatarClass: 'bg-primary-fixed/30 text-primary-container', membership: 'ELITE', membershipIcon: 'workspace_premium', membershipClass: 'bg-tertiary-fixed text-on-tertiary-fixed-variant', trustScore: 92, trustLabel: 'GÜVENLİ', trustCircleClass: 'border-md3-secondary/30 text-md3-secondary', trustTextClass: 'text-md3-secondary', balance: '₺452.000', capPct: 42, capTextClass: 'text-primary-container', capBarClass: 'bg-primary-container' },
  { id: 2, initials: 'ML', name: 'Mavi Lojistik', location: 'Ankara, Ostim', avatarClass: 'bg-secondary-fixed/30 text-md3-secondary', membership: 'PRIME', membershipIcon: 'star', membershipClass: 'bg-primary-fixed text-primary-container', trustScore: 68, trustLabel: 'ORTA', trustCircleClass: 'border-amber-500/30 text-amber-600', trustTextClass: 'text-amber-600', balance: '₺125.400', capPct: 88, capTextClass: 'text-amber-600', capBarClass: 'bg-amber-500' },
  { id: 3, initials: 'ÖT', name: 'Özcan Tekstil', location: 'Bursa, Yıldırım', avatarClass: 'bg-slate-100 text-slate-500', membership: 'CORE', membershipIcon: 'trip_origin', membershipClass: 'bg-slate-100 text-slate-600 border border-slate-200', trustScore: 34, trustLabel: 'KRİTİK', trustCircleClass: 'border-error/30 text-error', trustTextClass: 'text-error', balance: '₺8.200', capPct: 12, capTextClass: 'text-slate-600', capBarClass: 'bg-slate-400' },
]

const alerts = [
  { title: 'Kota Sınırı', time: '14:20', dealer: 'Mavi Lojistik A.Ş.', desc: 'Kota doluluk oranı %94\'e ulaştı. Havuz limiti yükseltilmesi gerekebilir.', bgClass: 'bg-error/5 border-error', textClass: 'text-error' },
  { title: 'TrustScore Düşüşü', time: '11:05', dealer: 'Özcan Tekstil', desc: 'Son 3 ayda 12 puanlık sert düşüş tespit edildi. İnceleme başlatın.', bgClass: 'bg-amber-50 border-amber-500', textClass: 'text-amber-600' },
  { title: 'Vadesi Geçmiş', time: 'Dün', dealer: 'Korkmaz Mobilya', desc: 'Takas bekleyen ₺45.000 tutarında işlem vadesi 7 gün aşıldı.', bgClass: 'bg-error/5 border-error', textClass: 'text-error' },
]
</script>
