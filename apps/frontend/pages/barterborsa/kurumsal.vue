<template>
  <AccessGuard :requiresAuth="true" :requiresVendor="true" :requiresApex="true">
    <div class="min-h-screen bg-surface text-on-surface flex">
    <!-- Sidebar Navigation -->
    <aside class="fixed left-0 top-16 h-[calc(100vh-64px)] flex flex-col pt-4 bg-white w-64 border-r border-slate-200 z-40">
      <div class="px-6 mb-6">
        <h2 class="text-lg font-black text-primary-container uppercase tracking-wider">Kurumsal Portal</h2>
        <p class="text-xs text-slate-500 mt-0.5">Kurumsal Yönetim</p>
      </div>
      <nav class="flex-1 space-y-1 px-2">
        <a class="flex items-center gap-3 px-4 py-3 bg-slate-100 text-primary-container border-r-4 border-primary-container rounded-l-lg font-semibold transition-all">
          <span class="material-symbols-outlined">dashboard</span>
          <span class="text-sm">Panel</span>
        </a>
        <NuxtLink to="/barterborsa/analitik" class="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-primary-container rounded-lg transition-all">
          <span class="material-symbols-outlined">receipt_long</span>
          <span class="text-sm">Denetim Kayıtları</span>
        </NuxtLink>
        <NuxtLink to="/vendors" class="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-primary-container rounded-lg transition-all">
          <span class="material-symbols-outlined">lan</span>
          <span class="text-sm">Ağ Yönetimi</span>
        </NuxtLink>
        <NuxtLink to="/settings" class="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-primary-container rounded-lg transition-all">
          <span class="material-symbols-outlined">api</span>
          <span class="text-sm">API Ayarları</span>
        </NuxtLink>
        <NuxtLink to="/admin" class="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-primary-container rounded-lg transition-all">
          <span class="material-symbols-outlined">admin_panel_settings</span>
          <span class="text-sm">Kullanıcı Rolleri</span>
        </NuxtLink>
      </nav>
      <div class="border-t border-slate-100 px-2 py-2">
        <NuxtLink to="/auth/login" class="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-primary-container rounded-lg transition-all">
          <span class="material-symbols-outlined">logout</span>
          <span class="text-sm">Çıkış Yap</span>
        </NuxtLink>
      </div>
    </aside>

    <!-- Right Panel -->
    <div class="ml-64 flex-1 flex flex-col">
      <!-- Top App Bar -->
      <header class="sticky top-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-50 shadow-sm">
        <div class="flex items-center gap-4">
          <NuxtLink to="/" class="text-xl font-bold tracking-tight text-primary-container hover:opacity-80 transition-opacity">
            TicariTakas Enterprise
          </NuxtLink>
        </div>
        <div class="flex items-center gap-4">
          <div class="hidden md:flex items-center bg-surface-container px-4 py-2 rounded-full border border-outline-variant">
            <span class="material-symbols-outlined text-outline mr-2 text-lg">search</span>
            <input class="bg-transparent border-none focus:ring-0 text-sm w-52 outline-none" placeholder="Sistem kaynaklarında ara..." type="text" aria-label="Arama" />
          </div>
          <button class="text-slate-500 hover:bg-slate-50 transition-colors p-2 rounded-full" type="button" aria-label="Bildirimler">
            <span class="material-symbols-outlined">notifications</span>
          </button>
          <button class="text-slate-500 hover:bg-slate-50 transition-colors p-2 rounded-full" type="button" aria-label="Ayarlar">
            <span class="material-symbols-outlined">settings</span>
          </button>
          <button class="text-slate-500 hover:bg-slate-50 transition-colors p-2 rounded-full" type="button" aria-label="Yardım">
            <span class="material-symbols-outlined">help_outline</span>
          </button>
          <div class="h-8 w-8 rounded-full overflow-hidden border-2 border-primary-container bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm ml-2">
            AK
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 p-8 bg-surface">
        <div class="max-w-7xl mx-auto space-y-8">
          <!-- Page Header -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 20, filter: 'blur(8px)' }"
            :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 600 } }"
            class="flex justify-between items-end"
          >
            <div>
              <h1 class="text-[32px] leading-[40px] font-semibold tracking-[-0.01em] text-md3-primary">Kurumsal Araçlar Paneli</h1>
              <p class="text-on-surface-variant mt-2">Kurumsal altyapıyı, distribütör ağlarını ve marka uyumluluğunu yönetin.</p>
            </div>
            <div class="flex gap-3">
              <button class="px-4 py-2 border border-md3-primary text-md3-primary rounded-lg font-medium hover:bg-md3-primary/5 transition-all" type="button">
                Raporu Dışa Aktar
              </button>
              <button class="px-4 py-2 bg-md3-primary text-on-primary rounded-lg font-medium shadow-lg shadow-primary-container/20 hover:opacity-90 transition-all" type="button">
                Sistem Sağlık Kontrolü
              </button>
            </div>
          </div>

          <!-- Bento Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- Network Module -->
            <div
              v-motion
              :initial="{ opacity: 0, y: 28, filter: 'blur(12px)' }"
              :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 700, ease: [0.25, 0.46, 0.45, 0.94] } }"
              class="lg:col-span-8 bg-white rounded-xl shadow-ambient border border-slate-100 overflow-hidden flex flex-col"
            >
              <div class="p-6 border-b border-slate-100 flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-md3-secondary">hub</span>
                  <h3 class="text-[20px] leading-[28px] font-semibold text-md3-primary">Bayii Ağ Yönetimi</h3>
                </div>
                <div class="flex gap-2">
                  <button class="px-3 py-1 text-xs font-semibold bg-surface-container rounded-full text-md3-primary hover:bg-surface-container-high transition-all" type="button">
                    Harita Görünümü
                  </button>
                  <button class="px-3 py-1 text-xs font-semibold text-on-surface-variant hover:text-md3-primary transition-all" type="button">
                    Izgara Görünümü
                  </button>
                </div>
              </div>
              <div class="relative h-96 bg-slate-100 overflow-hidden">
                <!-- Mock map placeholder -->
                <div class="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 flex items-center justify-center">
                  <div class="text-center text-slate-400">
                    <span class="material-symbols-outlined text-6xl mb-2 block">map</span>
                    <p class="text-sm font-medium">Distribütör Haritası</p>
                    <p class="text-xs mt-1">Veritabanı bağlantısı kurulduğunda yüklenecek</p>
                  </div>
                </div>
                <!-- Overlay stats -->
                <div class="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end">
                  <div class="grid grid-cols-3 gap-4">
                    <div class="bg-white/95 backdrop-blur shadow-xl rounded-lg p-4 border border-slate-200">
                      <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aktif Düğümler</p>
                      <p class="text-2xl font-bold text-md3-secondary">1,284</p>
                      <p class="text-[10px] text-md3-secondary font-semibold">↑ Geçen aydan %12</p>
                    </div>
                    <div class="bg-white/95 backdrop-blur shadow-xl rounded-lg p-4 border border-slate-200">
                      <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Operasyonel Kapasite</p>
                      <p class="text-2xl font-bold text-md3-primary">94.2%</p>
                      <p class="text-[10px] text-md3-primary font-semibold">En yüksek verimliliğe ulaşıldı</p>
                    </div>
                    <div class="bg-white/95 backdrop-blur shadow-xl rounded-lg p-4 border border-slate-200">
                      <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bekleyen Senkronizasyonlar</p>
                      <p class="text-2xl font-bold text-tertiary">14</p>
                      <p class="text-[10px] text-tertiary font-semibold">Manuel inceleme gerekiyor</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Smart Cap Configuration -->
            <div
              v-motion
              :initial="{ opacity: 0, y: 28, filter: 'blur(12px)' }"
              :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 700, delay: 100, ease: [0.25, 0.46, 0.45, 0.94] } }"
              class="lg:col-span-4 bg-white rounded-xl shadow-ambient border border-slate-100 flex flex-col"
            >
              <div class="p-6 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-md3-primary">toll</span>
                  <h3 class="text-[20px] leading-[28px] font-semibold text-md3-primary">Smart Cap (Akıllı Kota)</h3>
                </div>
              </div>
              <div class="p-6 space-y-5 flex-1 overflow-y-auto">
                <div>
                  <div class="flex justify-between text-xs font-bold uppercase text-slate-500 mb-2">
                    <span>Havuz Stok Yönetimi</span>
                    <span class="text-md3-secondary">%82 Kullanıldı</span>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-2">
                    <div class="bg-md3-secondary h-2 rounded-full" style="width:82%" />
                  </div>
                </div>

                <div class="space-y-3">
                  <div class="p-4 bg-surface-container-low rounded-xl border border-slate-200 group hover:border-md3-primary transition-all cursor-pointer">
                    <div class="flex justify-between items-start mb-2">
                      <h4 class="font-semibold text-md3-primary">Ana Envanter Kotası</h4>
                      <span class="material-symbols-outlined text-slate-400 group-hover:text-md3-primary transition-colors">edit</span>
                    </div>
                    <p class="text-2xl font-black text-md3-primary">450.00 <span class="text-sm font-normal text-slate-500">UNIT</span></p>
                    <div class="mt-3 flex items-center gap-2">
                      <span class="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">AUTO-REFILL</span>
                      <span class="text-[10px] text-slate-400">Threshold: 50 UNIT</span>
                    </div>
                  </div>

                  <div class="p-4 bg-surface-container-low rounded-xl border border-slate-200 group hover:border-md3-primary transition-all cursor-pointer">
                    <div class="flex justify-between items-start mb-2">
                      <h4 class="font-semibold text-md3-primary">Bölgesel Güvenlik Marjı</h4>
                      <span class="material-symbols-outlined text-slate-400 group-hover:text-md3-primary transition-colors">edit</span>
                    </div>
                    <p class="text-2xl font-black text-md3-primary">12% <span class="text-sm font-normal text-slate-500">BUFFER</span></p>
                    <div class="mt-3 flex items-center gap-2">
                      <span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">ACTIVE</span>
                      <span class="text-[10px] text-slate-400">Şu tarihten beri: 12 Oca</span>
                    </div>
                  </div>
                </div>

                <button
                  class="w-full py-3 bg-slate-50 border-2 border-dashed border-slate-300 text-slate-500 font-semibold text-sm rounded-xl hover:bg-white hover:border-md3-primary hover:text-md3-primary transition-all flex items-center justify-center gap-2"
                  type="button"
                >
                  <span class="material-symbols-outlined">add</span>
                  Yeni Yapılandırma Oluştur
                </button>
              </div>
            </div>

            <!-- Watchtower Audit Log -->
            <div
              v-motion
              :initial="{ opacity: 0, y: 28, filter: 'blur(12px)' }"
              :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 700, delay: 150, ease: [0.25, 0.46, 0.45, 0.94] } }"
              class="lg:col-span-12 bg-white rounded-xl shadow-ambient border border-slate-100 overflow-hidden"
            >
              <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-md3-primary">monitor_heart</span>
                  <h3 class="text-[20px] leading-[28px] font-semibold text-md3-primary">Watchtower Denetim Günlüğü</h3>
                </div>
                <div class="flex items-center gap-4">
                  <span class="flex items-center text-xs font-semibold text-md3-secondary">
                    <span class="w-2 h-2 bg-md3-secondary rounded-full mr-2 animate-pulse" />
                    Canlı Akış Aktif
                  </span>
                  <button class="p-2 text-slate-400 hover:text-md3-primary transition-colors" type="button" aria-label="Filtrele">
                    <span class="material-symbols-outlined">filter_list</span>
                  </button>
                  <button class="p-2 text-slate-400 hover:text-md3-primary transition-colors" type="button" aria-label="İndir">
                    <span class="material-symbols-outlined">download</span>
                  </button>
                </div>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead class="bg-surface-container-low border-b border-slate-200">
                    <tr>
                      <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Zaman Damgası</th>
                      <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Yetkili Kullanıcı</th>
                      <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Sistem Eylemi</th>
                      <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Kaynak IP</th>
                      <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Durum</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr v-for="log in auditLogs" :key="log.id" class="hover:bg-slate-50 transition-colors">
                      <td class="px-6 py-4 text-sm font-medium text-slate-600">{{ log.time }}</td>
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-2">
                          <div class="w-6 h-6 rounded-full text-[10px] flex items-center justify-center font-bold" :class="log.avatarClass">{{ log.initials }}</div>
                          <span class="text-sm font-semibold text-md3-primary">{{ log.user }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4 text-sm text-slate-600">{{ log.action }}</td>
                      <td class="px-6 py-4 text-sm text-slate-400 font-mono">{{ log.ip }}</td>
                      <td class="px-6 py-4 text-right">
                        <span class="px-3 py-1 text-xs font-bold rounded-full" :class="log.statusClass">{{ log.status }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="p-4 bg-slate-50 flex justify-center border-t border-slate-100">
                <NuxtLink to="/admin" class="text-xs font-bold text-md3-primary hover:underline uppercase tracking-widest">
                  Tüm Kayıtları Görüntüle
                </NuxtLink>
              </div>
            </div>

            <!-- Corporate Branding Tools -->
            <div
              v-motion
              :initial="{ opacity: 0, y: 28, filter: 'blur(12px)' }"
              :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 700, delay: 200, ease: [0.25, 0.46, 0.45, 0.94] } }"
              class="lg:col-span-12 bg-white rounded-xl shadow-ambient border border-slate-100 p-6"
            >
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center">
                    <span class="material-symbols-outlined text-on-primary text-2xl">palette</span>
                  </div>
                  <div>
                    <h3 class="text-[20px] leading-[28px] font-semibold text-md3-primary">Kurumsal Marka Ayarları</h3>
                    <p class="text-sm text-slate-500">Tüm alt portallarda görsel kimliği yapılandırın.</p>
                  </div>
                </div>
                <div class="flex items-center gap-8">
                  <div class="flex flex-col items-center">
                    <span class="text-[10px] font-bold text-slate-500 uppercase mb-2">Ana Palet</span>
                    <div class="flex gap-1">
                      <div class="w-6 h-6 rounded-full bg-primary-container ring-2 ring-offset-2 ring-primary-container" />
                      <div class="w-6 h-6 rounded-full bg-md3-secondary" />
                      <div class="w-6 h-6 rounded-full bg-tertiary-fixed-dim" />
                    </div>
                  </div>
                  <div class="flex flex-col items-center">
                    <span class="text-[10px] font-bold text-slate-500 uppercase mb-2">Arayüz Yazı Tipi</span>
                    <span class="text-sm font-bold text-md3-primary px-3 py-1 bg-slate-100 rounded">Inter v4.0</span>
                  </div>
                  <div class="flex flex-col items-center">
                    <span class="text-[10px] font-bold text-slate-500 uppercase mb-2">Logo Durumu</span>
                    <span class="text-sm font-bold text-md3-secondary flex items-center gap-1">
                      <span class="material-symbols-outlined text-sm">verified</span> Doğrulandı
                    </span>
                  </div>
                  <button class="px-6 py-2 bg-md3-primary text-on-primary rounded-lg font-semibold text-sm hover:opacity-90 transition-all" type="button">
                    Varlıkları Yapılandır
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <footer class="pt-6 pb-10 flex justify-between items-center text-slate-400 border-t border-slate-100">
            <p class="text-xs">© 2024 TicariTakas Enterprise. Tüm hakları saklıdır.</p>
            <div class="flex items-center gap-2">
              <div class="h-px w-8 bg-slate-300" />
              <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Master Plan v4.3</span>
            </div>
          </footer>
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
  title: 'Kurumsal Araçlar Paneli — TicariTakas Enterprise',
  meta: [{ name: 'description', content: 'TicariTakas kurumsal araçlar paneli — bayii ağı, smart cap ve audit log yönetimi' }],
})

const auditLogs = [
  { id: 1, time: '2023-10-27 14:45:12', initials: 'AK', user: 'A. Karahan', action: 'Akıllı Kota Eşiği Değiştirildi', ip: '192.168.1.104', status: 'SUCCESS', avatarClass: 'bg-primary-container text-on-primary', statusClass: 'bg-green-100 text-green-700' },
  { id: 2, time: '2023-10-27 14:42:05', initials: 'SYS', user: 'System Automation', action: 'API Anahtarı Döndürme (Periyodik)', ip: 'INTERNAL', status: 'INFO', avatarClass: 'bg-slate-300 text-slate-700', statusClass: 'bg-blue-100 text-blue-700' },
  { id: 3, time: '2023-10-27 13:12:59', initials: 'MS', user: 'M. Soydan', action: 'Yeni Kullanıcı Rolü: "Şube Müdürü"', ip: '45.22.19.04', status: 'SUCCESS', avatarClass: 'bg-primary-container text-on-primary', statusClass: 'bg-green-100 text-green-700' },
  { id: 4, time: '2023-10-27 12:44:21', initials: 'EXT', user: 'Unknown (External)', action: 'Başarısız Giriş Denemesi', ip: '201.34.11.82', status: 'FAILED', avatarClass: 'bg-red-100 text-red-600', statusClass: 'bg-red-100 text-red-700' },
]
</script>
