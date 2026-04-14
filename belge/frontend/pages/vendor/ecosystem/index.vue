<template>
  <div>
    <div class="px-4 py-8 sm:px-0 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 class="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <ShieldCheckIcon class="h-10 w-10 text-indigo-600" />
            BazarX Private <span
              class="text-lg font-medium text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 italic"
            >Apex
              Plus Altyapısı</span>
          </h1>
          <p class="mt-2 text-gray-500 max-w-2xl">
            Kapalı devre bayi ekosisteminizi yönetin. Stok izolasyonu, akıllı kotalar ve marka koruma
            araçlarıyla kontrol sizde.
          </p>
        </div>
        <div
          v-if="ecosystem"
          class="flex gap-3"
        >
          <NuxtLink
            :to="`/ecosystem/${ecosystem.id}`"
            class="px-5 py-2.5 bg-indigo-600 text-white rounded-xl shadow-md hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all font-bold flex items-center gap-2 text-sm italic"
          >
            <ArrowTopRightOnSquareIcon class="h-4 w-4" />
            Bayi Portalına Git
          </NuxtLink>
          <div
            v-if="isOwner"
            class="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div class="flex flex-col text-right">
              <span class="text-[10px] text-gray-400 font-black uppercase tracking-wider">Ekosistem
                Durumu</span>
              <span class="text-sm font-bold text-green-600 flex items-center gap-1">
                <div class="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                AKTİF
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-20"
      >
        <div class="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full mb-4" />
        <p class="text-gray-500 font-medium">
          Ekosistem verileri yükleniyor...
        </p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="bg-red-50 border border-red-100 rounded-2xl p-8 text-center"
      >
        <ExclamationTriangleIcon class="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 class="text-lg font-bold text-red-900">
          Bir Hata Oluştu
        </h3>
        <p class="text-red-700 mt-1">
          {{ error }}
        </p>
        <button
          class="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-bold"
          @click="fetchData"
        >
          Tekrar
          Dene
        </button>
      </div>

      <!-- No Ecosystem (Owner Potential) -->
      <div
        v-else-if="!ecosystem && isApexPlus"
        class="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 text-center"
      >
        <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <div class="max-w-xl mx-auto">
          <div
            class="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3"
          >
            <BuildingStorefrontIcon class="h-10 w-10 text-indigo-600 w-10 h-10 transform -rotate-3" />
          </div>
          <h2 class="text-3xl font-black text-gray-900 mb-4">
            Kendi Özel Pazar Yerini Kur
          </h2>
          <p class="text-gray-600 text-lg mb-8">
            Apex Plus yetkinizle Sarar gibi dev markaların kullandığı "Kör Havuz" mimarisini hemen
            aktifleştirebilirsiniz. Bayilerinize özel stoklar tanımlayın ve pazar dengesini koruyun.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 text-left">
            <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <LockClosedIcon class="h-6 w-6 text-indigo-500 mb-2" />
              <h4 class="font-bold text-gray-900 text-sm">
                Tam İzolasyon
              </h4>
              <p class="text-xs text-gray-500 italic">
                Sadece seçtiğiniz bayiler stokları görür.
              </p>
            </div>
            <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <NoSymbolIcon class="h-6 w-6 text-purple-500 mb-2" />
              <h4 class="font-bold text-gray-900 text-sm">
                Damping Koruması
              </h4>
              <p class="text-xs text-gray-500 italic">
                Fiyat taban kotasıyla marka imajını koruyun.
              </p>
            </div>
            <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <ChartPieIcon class="h-6 w-6 text-pink-500 mb-2" />
              <h4 class="font-bold text-gray-900 text-sm">
                Akıllı Kotalar
              </h4>
              <p class="text-xs text-gray-500 italic">
                Stokların tek bir bayide toplanmasını engelleyin.
              </p>
            </div>
          </div>

          <button
            class="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-indigo-200 hover:-translate-y-1 transition-all"
            @click="showCreateModal = true"
          >
            Ekosistemi Şimdi Başlat
          </button>
        </div>
      </div>

      <!-- Owner Dashboard -->
      <div
        v-else-if="isOwner"
        class="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <!-- Main Panel -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Members Card -->
          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <h3 class="text-xl font-black text-gray-900 flex items-center gap-2">
                <UsersIcon class="h-6 w-6 text-indigo-500" />
                Üye Bayiler ({{ ecosystem.Members?.length || 0 }})
              </h3>
              <button
                class="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                @click="showInviteModal = true"
              >
                <UserPlusIcon class="h-4 w-4" />
                Bayi Ekle
              </button>
            </div>
            <div class="p-0">
              <table class="w-full text-left border-collapse">
                <thead
                  class="bg-gray-50/30 text-[10px] uppercase font-black tracking-widest text-gray-400 border-b border-gray-50"
                >
                  <tr>
                    <th class="px-6 py-4">
                      Bayi / Şirket
                    </th>
                    <th class="px-6 py-4">
                      Durum
                    </th>
                    <th class="px-6 py-4">
                      Güven Puanı
                    </th>
                    <th class="px-6 py-4 text-right">
                      İşlem
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr
                    v-for="member in ecosystem.Members"
                    :key="member.id"
                    class="hover:bg-gray-50/30 transition-colors group"
                  >
                    <td class="px-6 py-5">
                      <div class="flex items-center gap-3">
                        <div
                          class="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center font-black text-indigo-500 text-xs"
                        >
                          {{ member.businessName?.charAt(0) || 'B' }}
                        </div>
                        <div class="flex flex-col">
                          <span class="font-bold text-gray-900">{{ member.businessName }}</span>
                          <span class="text-[10px] text-gray-400 tabular-nums">Puan: {{
                            member.trustScore || 100 }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-5">
                      <span
                        class="px-3 py-1 rounded-full text-[10px] font-black"
                        :class="member.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'"
                      >
                        {{ member.status === 'APPROVED' ? 'ONAYLI' : member.status }}
                      </span>
                    </td>
                    <td class="px-6 py-5">
                      <div class="flex items-center gap-2">
                        <div class="flex-1 bg-gray-100 h-1.5 w-20 rounded-full overflow-hidden">
                          <div
                            class="h-full rounded-full transition-all duration-1000"
                            :style="{ width: `${member.trustScore}%` }"
                            :class="member.trustScore > 70 ? 'bg-green-500' : 'bg-orange-500'"
                          />
                        </div>
                        <span class="text-xs font-black text-gray-700">{{ member.trustScore
                        }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-5 text-right">
                      <button
                        class="text-gray-300 hover:text-red-500 transition-colors p-2"
                        title="Üyeliği Sonlandır"
                        @click="handleRemoveMember(member.id)"
                      >
                        <TrashIcon class="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                  <tr v-if="!ecosystem.Members || ecosystem.Members.length === 0">
                    <td
                      colspan="4"
                      class="px-6 py-12 text-center text-gray-400 italic font-medium"
                    >
                      Henüz ekosisteme kayıtlı bayi bulunmuyor.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Watchtower (Audit Logs) -->
          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <h3 class="text-xl font-black text-gray-900 flex items-center gap-2">
                <MagnifyingGlassCircleIcon class="h-6 w-6 text-indigo-500" />
                Watchtower: Güvenlik Günlüğü
              </h3>
              <div
                class="px-3 py-1 bg-indigo-50 rounded-lg text-indigo-600 text-[10px] font-black flex items-center gap-1 border border-indigo-100"
              >
                <div class="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                LIVE MONITORING
              </div>
            </div>
            <div class="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
              <ul class="divide-y divide-gray-50">
                <li
                  v-for="log in auditLogs"
                  :key="log.id"
                  class="p-4 hover:bg-gray-50/50 transition-colors flex gap-4 items-start"
                >
                  <div
                    class="shrink-0 h-8 w-8 rounded-lg flex items-center justify-center p-1"
                    :class="{
                      'bg-red-50 text-red-600': log.severity === 'CRITICAL' || log.severity === 'WARN',
                      'bg-blue-50 text-blue-600': log.severity === 'INFO'
                    }"
                    :title="formatSeverity(log.severity)"
                  >
                    <ExclamationCircleIcon
                      v-if="log.severity === 'CRITICAL' || log.severity === 'WARN'"
                      class="h-5 w-5"
                    />
                    <InformationCircleIcon
                      v-else
                      class="h-5 w-5"
                    />
                  </div>
                  <div class="flex-1">
                    <div class="flex justify-between items-start">
                      <span class="font-bold text-sm text-gray-900">{{ formatAction(log.action)
                      }}</span>
                      <span class="text-[10px] text-gray-400 font-medium">{{ formatDate(log.createdAt)
                      }}</span>
                    </div>
                    <div class="mt-1 flex flex-col gap-1.5">
                      <div class="text-xs text-gray-500">
                        <span class="font-black text-gray-700">{{ log.Vendor?.businessName ||
                          'Sistem' }}</span> için işlem:
                      </div>
                      <div
                        v-if="typeof log.details === 'object' && log.details !== null"
                        class="flex flex-wrap gap-1.5 mt-0.5"
                      >
                        <div
                          v-for="(val, key) in log.details"
                          :key="key"
                          class="flex items-center bg-white border border-gray-200 rounded-md px-2 py-1 text-[10px] text-gray-700 shadow-sm"
                        >
                          <span
                            class="text-gray-400 mr-1.5 uppercase font-black tracking-wider"
                          >{{
                            formatLogKey(key) }}:</span>
                          <span class="font-bold">{{ formatLogValue(val) }}</span>
                        </div>
                      </div>
                      <div
                        v-else
                        class="text-xs text-gray-600 mt-0.5"
                      >
                        {{ log.details?.message || String(log.details) || '-' }}
                      </div>
                    </div>
                  </div>
                </li>
                <li
                  v-if="auditLogs.length === 0"
                  class="p-8 text-center text-gray-400 italic text-sm"
                >
                  Ciddi
                  bir güvenlik ihlali veya sistem aktivitesi kaydedilmedi.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Sidebar Panel -->
        <div class="space-y-8">
          <!-- Stats -->
          <div
            class="bg-gradient-to-br from-gray-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden"
          >
            <div class="absolute -right-10 -bottom-10 opacity-10">
              <ShieldCheckIcon class="h-40 w-40" />
            </div>
            <p class="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-6">
              Ekosistem
              Metrikleri
            </p>

            <div class="space-y-6">
              <div class="flex justify-between items-center group">
                <span class="text-gray-400 text-sm flex items-center gap-2 italic">
                  <CircleStackIcon class="h-4 w-4" />
                  Toplam İzole Stok
                </span>
                <span
                  class="text-xl font-black tabular-nums group-hover:text-indigo-400 transition-colors italic"
                >3.450
                  <span class="text-xs font-medium">ADET</span></span>
              </div>
              <div class="flex justify-between items-center group">
                <span class="text-gray-400 text-sm flex items-center gap-2 italic">
                  <ArrowTrendingUpIcon class="h-4 w-4" />
                  Eko-Hacim (Aylık)
                </span>
                <span
                  class="text-xl font-black tabular-nums group-hover:text-green-400 transition-colors italic text-green-500"
                >₺1.2M</span>
              </div>
              <div class="flex justify-between items-center group">
                <span class="text-gray-400 text-sm flex items-center gap-2 italic">
                  <ShieldExclamationIcon class="h-4 w-4" />
                  Önlenen İhlaller
                </span>
                <span
                  class="text-xl font-black tabular-nums group-hover:text-orange-400 transition-colors italic text-orange-500"
                >12</span>
              </div>
            </div>

            <!-- Add product shortcut -->
            <div class="mt-8 pt-6 border-t border-white/10">
              <NuxtLink
                to="/vendor/product-form"
                class="flex items-center justify-center gap-2 w-full py-3 bg-white text-indigo-950 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-colors"
              >
                <PlusIcon class="h-4 w-4" />
                Eko-Sisteme Ürün Ekle
              </NuxtLink>
            </div>
          </div>

          <!-- Management Card -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h4 class="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 italic">
              Ekosistem
              Bilgileri
            </h4>
            <div class="space-y-4">
              <div>
                <label class="text-[10px] font-black text-gray-400 uppercase">Ekosistem Adı</label>
                <p class="text-sm font-bold text-gray-800">
                  {{ ecosystem.name }}
                </p>
              </div>
              <div v-if="ecosystem.description">
                <label class="text-[10px] font-black text-gray-400 uppercase">Açıklama</label>
                <p class="text-xs text-gray-600 italic">
                  {{ ecosystem.description }}
                </p>
              </div>
              <div>
                <label class="text-[10px] font-black text-gray-400 uppercase">Oluşturulma</label>
                <p class="text-xs text-gray-600">
                  {{ formatDate(ecosystem.createdAt) }}
                </p>
              </div>
              <div class="pt-4 mt-4 border-t border-gray-50 flex flex-col gap-2">
                <NuxtLink
                  :to="`/ecosystem/${ecosystem.id}`"
                  class="w-full py-3 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black border border-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors italic"
                >
                  <ArrowTopRightOnSquareIcon class="h-4 w-4" />
                  Storefront Portalını Aç
                </NuxtLink>
                <button
                  disabled
                  class="w-full py-2 bg-gray-50 text-gray-400 rounded-xl text-xs font-bold border border-gray-100 cursor-not-allowed"
                >
                  Ayarları Düzenle (Yakında)
                </button>
                <button
                  class="w-full py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors italic"
                >
                  Ekosistemi Askıya Al
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Member Info View (For non-owners) -->
      <div
        v-else-if="ecosystem"
        class="bg-white rounded-3xl p-10 shadow-xl border border-gray-100 text-center max-w-2xl mx-auto"
      >
        <div class="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckBadgeIcon class="h-10 w-10 text-green-600" />
        </div>
        <h2 class="text-2xl font-black text-gray-900 mb-2">
          {{ ecosystem.name }} Üyesisiniz
        </h2>
        <p class="text-gray-500 mb-8 italic">
          Bu markanın kapalı ekosistemine başarıyla dahil edildiniz. Private (Özel) stoklara erişebilir, size özel
          komisyon ve kotalardan yararlanabilirsiniz.
        </p>
        <div class="grid grid-cols-2 gap-4 text-left">
          <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <span class="text-[10px] font-black text-gray-400 uppercase block">Ekosistem Sahibi</span>
            <span class="font-bold text-gray-900 truncate block">{{ ecosystem.Owner?.businessName }}</span>
          </div>
          <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <span class="text-[10px] font-black text-gray-400 uppercase block">Avantaj Tier</span>
            <span class="font-bold text-indigo-600 block italic">PRIVATE PARTNER</span>
          </div>
        </div>

        <NuxtLink
          :to="`/ecosystem/${ecosystem.id}`"
          class="mt-10 block w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-xl shadow-xl shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
        >
          <ArrowTopRightOnSquareIcon class="h-6 w-6" />
          Bayi Portalına Giriş Yap
        </NuxtLink>

        <!-- Member Product Section -->
        <div class="mt-12 pt-8 border-t border-gray-100 text-left">
          <h3 class="text-lg font-black text-gray-900 mb-4">
            Ürün Yükleme (Bayi Satışı)
          </h3>
          <p class="text-sm text-gray-500 mb-6 italic">
            Ekosistem üyesi olarak siz de bu kapalı ağda ürün satabilirsiniz. Yüklediğiniz ürünler sadece bu
            ekosistemdeki diğer üyelere ve ana bayiye görünür.
          </p>
          <div class="flex flex-col sm:flex-row gap-3">
            <NuxtLink
              to="/vendor/product-form"
              class="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-gray-800 transition-colors"
            >
              <PlusIcon class="h-4 w-4" />
              Yeni Ürün Yükle
            </NuxtLink>
            <NuxtLink
              to="/vendor/products"
              class="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-colors"
            >
              <CircleStackIcon class="h-4 w-4" />
              Ürünlerimi Yönet
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- Create Ecosystem Modal -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          @click="showCreateModal = false"
        />
        <div
          class="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200"
        >
          <div class="p-1 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
          <div class="p-8">
            <h3 class="text-2xl font-black text-gray-900 mb-2">
              Yeni Ekosistem Oluştur
            </h3>
            <p class="text-sm text-gray-500 mb-6 italic">
              Markanız adına BazarX Private ağını aktifleştirin.
            </p>

            <form
              class="space-y-5"
              @submit.prevent="handleCreateEcosystem"
            >
              <div class="space-y-1">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Ekosistem
                  Adı</label>
                <input
                  v-model="createForm.name"
                  type="text"
                  required
                  placeholder="Örn: Sarar Dealer Network"
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold placeholder-gray-300"
                >
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Vizyon ve
                  Bilgilendirme</label>
                <textarea
                  v-model="createForm.description"
                  placeholder="Bayilerinize bu ekosistemin amacını kısaca anlatın..."
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm min-h-[100px] placeholder-gray-300 italic"
                />
              </div>
              <div class="pt-4 flex gap-3">
                <button
                  type="button"
                  class="flex-1 py-3 text-sm font-black text-gray-400 hover:text-gray-600 transition-colors italic"
                  @click="showCreateModal = false"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  :disabled="creating"
                  class="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <div
                    v-if="creating"
                    class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Ekosistemi Kur
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="showInviteModal"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          @click="showInviteModal = false"
        />
        <div
          class="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200"
        >
          <div class="p-8 space-y-6">
            <div class="flex justify-between items-center">
              <h3 class="text-2xl font-black text-gray-900">
                Bayi Ara & Ekle
              </h3>
              <button
                class="text-gray-400 hover:text-gray-600 transition-colors"
                @click="showInviteModal = false"
              >
                <XMarkIcon class="h-6 w-6" />
              </button>
            </div>

            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Firma ismi ile arayın..."
                class="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold placeholder-gray-300"
                @input="handleSearch"
              >
              <MagnifyingGlassIcon class="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
            </div>

            <div class="max-h-60 overflow-y-auto space-y-2 rounded-2xl bg-gray-50 p-2 border border-gray-100">
              <div
                v-for="v in searchResults"
                :key="v.id"
                class="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 transition-all group"
              >
                <div class="flex flex-col">
                  <span
                    class="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors"
                  >{{
                    v.businessName }}</span>
                  <span class="text-[10px] text-gray-400 font-medium">Satıcı ID: {{ v.id.slice(0, 8)
                  }}</span>
                </div>
                <button
                  :disabled="inviting"
                  class="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
                  @click="handleInviteMember(v.id)"
                >
                  Ekle
                </button>
              </div>
              <div
                v-if="!searchResults.length"
                class="p-12 text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest italic"
              >
                {{ searchQuery.length > 1 ? 'Bayi bulunamadı' : 'Firma ismi yazmaya başlayın' }}
              </div>
            </div>

            <div class="pt-2">
              <button
                class="w-full py-3 text-xs font-black text-gray-400 hover:text-gray-500 uppercase tracking-widest transition-colors"
                @click="showInviteModal = false"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import {
    ShieldCheckIcon,
    BuildingStorefrontIcon,
    LockClosedIcon,
    NoSymbolIcon,
    ChartPieIcon,
    UsersIcon,
    UserPlusIcon,
    TrashIcon,
    MagnifyingGlassCircleIcon,
    ExclamationCircleIcon,
    InformationCircleIcon,
    CircleStackIcon,
    ArrowTrendingUpIcon,
    ShieldExclamationIcon,
    ExclamationTriangleIcon,
    CheckBadgeIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
    ArrowTopRightOnSquareIcon,
    PlusIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
    layout: 'vendor',
    middleware: 'vendor'
})

const authStore = useAuthStore()
const { $api } = useApi()
const toast = useNuxtApp().$toast

// Identification
const isApexPlus = computed(() => authStore.isApexPlus)

// State
const loading = ref(true)
const creating = ref(false)
const inviting = ref(false)
const error = ref(null)
const ecosystem = ref(null)
const isOwner = ref(false)
const auditLogs = ref([])

// Modals
const showCreateModal = ref(false)
const showInviteModal = ref(false)
const createForm = ref({ name: '', description: '' })
const searchQuery = ref('')
const searchResults = ref([])

const fetchData = async () => {
    loading.value = true
    error.value = null
    try {
        const res = await $api('/api/ecosystem/my')
        if (res.success) {
            ecosystem.value = res.ecosystem
            isOwner.value = res.isOwner

            if (isOwner.value && ecosystem.value) {
                await fetchAuditLogs()
            }
        }
    } catch (e) {
        error.value = e.data?.error || 'Veriler alınırken bir hata oluştu.'
    } finally {
        loading.value = false
    }
}

const fetchAuditLogs = async () => {
    try {
        const res = await $api('/api/ecosystem/audit')
        if (res.success) {
            auditLogs.value = res.data
        }
    } catch (e) {
        console.error('Audit logs failed:', e)
    }
}

const handleCreateEcosystem = async () => {
    creating.value = true
    try {
        const res = await $api('/api/ecosystem/create', {
            method: 'POST',
            body: createForm.value
        })
        if (res.success) {
            toast.success('Ekosistem başarıyla oluşturuldu!')
            showCreateModal.value = false
            await fetchData()
        }
    } catch (e) {
        toast.error(e.data?.error || 'Oluşturma hatası')
    } finally {
        creating.value = false
    }
}

const handleInviteMember = async (vendorId) => {
    if (!vendorId) return
    inviting.value = true
    try {
        const res = await $api('/api/ecosystem/members', {
            method: 'POST',
            body: { memberVendorId: vendorId }
        })
        if (res.success) {
            toast.success('Bayi ekosisteme dahil edildi!')
            searchQuery.value = ''
            searchResults.value = []
            showInviteModal.value = false
            await fetchData()
        }
    } catch (e) {
        toast.error(e.data?.error || 'Davet hatası')
    } finally {
        inviting.value = false
    }
}

const handleSearch = async () => {
    if (!searchQuery.value || searchQuery.value.length < 2) {
        searchResults.value = []
        return
    }
    try {
        const res = await $api('/api/vendors', {
            params: { q: searchQuery.value, status: 'APPROVED', limit: 5 }
        })
        searchResults.value = res.data || []
    } catch (e) {
        console.error('Vendor search failed:', e)
    }
}

const handleRemoveMember = async (vendorId) => {
    if (!confirm('Bu bayiyi ekosistemden çıkarmak istediğinize emin misiniz?')) return
    try {
        const res = await $api(`/api/ecosystem/members/${vendorId}`, {
            method: 'DELETE'
        })
        if (res.success) {
            toast.success('Bayi üyelikten çıkarıldı.')
            await fetchData()
        }
    } catch (e) {
        toast.error(e.data?.error || 'Çıkarma hatası')
    }
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleString('tr-TR', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const formatLogKey = (key) => {
    const map = {
        isUpdate: 'Güncelleme',
        quantity: 'Miktar',
        listingId: 'İlan ID',
        listingName: 'Ürün Adı',
        oldScore: 'Eski Skor',
        newScore: 'Yeni Skor',
        reason: 'Sebep',
        vendorId: 'Satıcı ID',
        productId: 'Ürün ID',
        ecosystemId: 'Ekosistem',
        status: 'Durum',
        type: 'Tip',
        amount: 'Tutar'
    }
    return map[key] || key
}

const formatAction = (action) => {
    const map = {
        CART_ADD: 'SEPETE EKLEME',
        CART_UPDATE: 'SEPET GÜNCELLEME',
        VISIBILITY_VIOLATION: 'GÖRÜNÜRLÜK İHLALİ',
        COMMISSION_APPLY: 'KOMİSYON UYGULANDI',
        SMART_CAP_FAIL: 'AKILLI LİMİT İHLALİ',
        PRICE_FLOOR_FAIL: 'TABAN FİYAT İHLALİ',
        PRICE_FLOOR_DEVIATION: 'TABAN FİYAT SAPMASI',
        MEMBER_ADDED: 'BAYİ EKLENDİ',
        MEMBER_REMOVED: 'BAYİ ÇIKARILDI',
        TRUST_SCORE_OVERRIDE: 'GÜVEN SKORU DEĞİŞİMİ',
        XP_BURN: 'XP YAKIMI',
        XP_EXPIRATION_WARNING: 'XP SÜRE SONU UYARISI'
    }
    return map[action] || action
}

const formatSeverity = (sev) => {
    const map = {
        INFO: 'BİLGİ',
        WARN: 'UYARI',
        CRITICAL: 'KRİTİK'
    }
    return map[sev] || sev
}

const formatLogValue = (val) => {
    if (typeof val === 'boolean') return val ? 'Evet' : 'Hayır'
    return val
}

onMounted(() => {
    fetchData()
})
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
    width: 4px;
}

.scrollbar-thumb-gray-200::-webkit-scrollbar-thumb {
    background-color: #e5e7eb;
    border-radius: 10px;
}
</style>
