<template>
  <div class="min-h-screen bg-gray-50 p-6 lg:p-10">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight">
          Reklam Yönetimi
        </h1>
        <p class="text-gray-500 mt-1 font-medium">
          Tüm satıcı reklam kampanyalarını onaylayın ve performansı
          izleyin.
        </p>
      </div>
      <div class="flex gap-3">
        <div class="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <CurrencyDollarIcon class="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Platform Geliri
            </div>
            <div class="text-xl font-black text-gray-900">
              ₺{{ formatCurrency(stats.totalPlatformRevenue) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div
        v-for="s in summaryCards"
        :key="s.label"
        class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-default group"
      >
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ s.label
            }}</span>
            <div
              class="text-3xl font-black text-gray-900 group-hover:scale-105 transition-transform origin-left"
            >
              {{ s.value }}
            </div>
          </div>
          <div
            :class="`w-14 h-14 rounded-2xl bg-${s.color}-50 flex items-center justify-center text-${s.color}-600 group-hover:rotate-12 transition-all shadow-sm`"
            :style="{ backgroundColor: s.bgColor, color: s.textColor }"
          >
            <component
              :is="s.icon"
              class="w-7 h-7"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Filter & Search Section -->
    <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <!-- Tabs -->
      <div class="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm w-fit mb-8">
        <button
          :class="`px-6 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === 'PRODUCT_ADS' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`"
          @click="activeTab = 'PRODUCT_ADS'"
        >
          ANA MODÜL REKLAMLARI
        </button>
        <button
          :class="`px-6 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === 'BANNER_ADS' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`"
          @click="activeTab = 'BANNER_ADS'"
        >
          SIRA VE KATEGORİ REKLAMLARI
        </button>
      </div>

      <div
        v-if="activeTab === 'PRODUCT_ADS'"
        class="px-8 py-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div class="flex items-center gap-4">
          <div class="flex bg-gray-100 p-1.5 rounded-2xl">
            <button
              v-for="f in filters"
              :key="f.label"
              :class="`px-5 py-2 text-xs font-bold rounded-xl transition-all ${activeFilter === f.value ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`"
              @click="activeFilter = f.value"
            >
              {{ f.label }}
            </button>
          </div>
        </div>
        <div class="relative max-w-sm w-full">
          <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Mağaza veya kampanya ara..."
            class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all text-sm font-medium"
          >
        </div>
      </div>

      <div
        v-if="activeTab === 'BANNER_ADS'"
        class="px-8 py-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div class="flex items-center gap-4">
          <div class="flex bg-gray-100 p-1.5 rounded-2xl">
            <button
              v-for="f in bannerFilters"
              :key="f.label"
              :class="`px-5 py-2 text-xs font-bold rounded-xl transition-all ${activeBannerFilter === f.value ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`"
              @click="activeBannerFilter = f.value"
            >
              {{ f.label }}
            </button>
          </div>
        </div>
        <!-- Search same as above -->
        <div class="relative max-w-sm w-full">
          <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Mağaza veya banner ara..."
            class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all text-sm font-medium"
          >
        </div>
      </div>

      <!-- Table Product Ads -->
      <div
        v-if="activeTab === 'PRODUCT_ADS'"
        class="overflow-x-auto"
      >
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-100">
              <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Mağaza
                / Kampanya
              </th>
              <th
                class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center"
              >
                Reklam Türü
              </th>
              <th
                class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center"
              >
                Bütçe
              </th>
              <th
                class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center"
              >
                Performans
              </th>
              <th
                class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center"
              >
                Durum
              </th>
              <th
                class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right"
              >
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="ad in filteredCampaigns"
              :key="ad.id"
              class="hover:bg-indigo-50/30 transition-colors group"
            >
              <td class="px-8 py-5">
                <div class="flex items-center gap-4">
                  <div
                    class="w-12 h-12 rounded-2xl bg-white border border-gray-100 p-1 flex items-center justify-center shrink-0"
                  >
                    <img
                      :src="ad.vendor?.logoUrl || '/images/default-store.png'"
                      class="w-full h-full object-contain rounded-xl"
                    >
                  </div>
                  <div>
                    <div
                      class="text-sm font-black text-gray-900 group-hover:text-indigo-700 transition-colors"
                    >
                      {{ ad.vendor?.businessName || 'Bilinmeyen Mağaza' }}
                    </div>
                    <div class="text-[11px] font-bold text-gray-500">
                      {{ ad.name }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-8 py-5 text-center">
                <span
                  class="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-wider"
                >
                  {{ formatType(ad.type) }}
                </span>
              </td>
              <td class="px-8 py-5 text-center">
                <div class="text-sm font-black text-gray-900">
                  ₺{{ formatCurrency(ad.budget) }}
                </div>
                <div class="text-[11px] font-bold text-gray-400">
                  {{ formatTypeLabel(ad.type) }}
                </div>
              </td>
              <td class="px-8 py-5 text-center">
                <div class="flex items-center justify-center gap-6">
                  <div class="text-center">
                    <div class="text-xs font-black text-gray-900">
                      {{ formatNumber(ad.impressions ||
                        0) }}
                    </div>
                    <div class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                      Gösterim
                    </div>
                  </div>
                  <div class="text-center border-l border-gray-100 pl-6">
                    <div class="text-xs font-black text-gray-900">
                      {{ formatNumber(ad.clicks || 0) }}
                    </div>
                    <div class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                      Tıklama
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-8 py-5 text-center">
                <span
                  :class="getStatusClass(ad.status)"
                  class="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm"
                >
                  {{ getStatusLabel(ad.status) }}
                </span>
              </td>
              <td class="px-8 py-5 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    class="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    title="Detaylar"
                    @click="openDetails(ad)"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  <button
                    v-if="ad.status === 'PENDING'"
                    class="w-8 h-8 rounded-xl bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm"
                    title="Onayla"
                    @click="updateStatus(ad.id, 'ENABLED')"
                  >
                    <CheckCircleIcon class="w-4 h-4" />
                  </button>
                  <button
                    v-if="ad.status === 'PENDING'"
                    class="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    title="Reddet"
                    @click="promptReject(ad)"
                  >
                    <XMarkIcon class="w-4 h-4" />
                  </button>
                  <button
                    v-if="ad.status === 'ENABLED'"
                    class="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                    title="Duraklat"
                    @click="updateStatus(ad.id, 'PAUSED')"
                  >
                    <PauseIcon class="w-4 h-4" />
                  </button>
                  <button
                    v-if="ad.status === 'PAUSED'"
                    class="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    title="Aktifleştir"
                    @click="updateStatus(ad.id, 'ENABLED')"
                  >
                    <PlayIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredCampaigns.length === 0">
              <td
                colspan="6"
                class="px-8 py-20 text-center"
              >
                <div class="flex flex-col items-center gap-4">
                  <div
                    class="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center border border-dashed border-gray-200"
                  >
                    <MegaphoneIcon class="w-8 h-8 text-gray-300" />
                  </div>
                  <p class="text-sm font-bold text-gray-400">
                    Aradığınız kriterlerde kampanya
                    bulunamadı.
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Table Banner Ads -->
      <div
        v-if="activeTab === 'BANNER_ADS'"
        class="overflow-x-auto text-[10px]"
      >
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-100">
              <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Mağaza
                / Görsel
              </th>
              <th
                class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center"
              >
                Reklam Alanı
              </th>
              <th
                class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center"
              >
                Hedef Şehirler
              </th>
              <th
                class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center"
              >
                Durum
              </th>
              <th
                class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right"
              >
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="banner in filteredBanners"
              :key="banner.id"
              class="hover:bg-indigo-50/30 transition-colors group"
            >
              <td class="px-8 py-5">
                <div class="flex items-center gap-4">
                  <div
                    class="w-20 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100"
                  >
                    <img
                      :src="banner.imageUrl"
                      class="w-full h-full object-cover"
                    >
                  </div>
                  <div>
                    <div class="text-sm font-black text-gray-900">
                      {{ banner.vendor?.businessName }}
                    </div>
                    <div
                      class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5"
                    >
                      Şablon: {{ banner.template || 'Standart' }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-8 py-5 text-center">
                <span
                  class="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black rounded-lg border border-amber-100"
                >
                  {{ banner.type === 1 ? 'KATEGORİ SIDEBAR' : banner.type === 2 ? 'ÜRÜN BANNERS' :
                    'ARAMA SIDEBAR' }}
                </span>
              </td>
              <td class="px-8 py-5 text-center">
                <div class="text-[10px] text-gray-600 font-bold max-w-[200px] mx-auto line-clamp-2">
                  {{ (banner.targetCities || []).join(', ') || 'Tüm Türkiye' }}
                </div>
              </td>
              <td class="px-8 py-5 text-center">
                <span
                  :class="getStatusClass(banner.status)"
                  class="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm"
                >
                  {{ getStatusLabel(banner.status) }}
                </span>
              </td>
              <td class="px-8 py-5 text-right">
                <div class="flex items-center justify-end gap-2">
                  <a
                    :href="banner.imageUrl"
                    target="_blank"
                    class="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all shadow-sm"
                  >
                    <PhotoIcon class="w-4 h-4" />
                  </a>
                  <button
                    v-if="banner.status === 'PENDING'"
                    class="w-8 h-8 rounded-xl bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm"
                    @click="updateBannerStatus(banner.id, 'ENABLED')"
                  >
                    <CheckCircleIcon class="w-4 h-4" />
                  </button>
                  <button
                    v-if="banner.status === 'PENDING'"
                    class="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    @click="selectedAd = { ...banner, isBanner: true }; rejectionReason = ''; isRejecting = false"
                  >
                    <XMarkIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredBanners.length === 0">
              <td
                colspan="5"
                class="px-8 py-20 text-center"
              >
                <div class="flex flex-col items-center gap-4">
                  <div
                    class="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center border border-dashed border-gray-200"
                  >
                    <PhotoIcon class="w-8 h-8 text-gray-300" />
                  </div>
                  <p class="text-sm font-bold text-gray-400">
                    Onay bekleyen banner reklam bulunamadı.
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- Details / Review Modal -->
    <div
      v-if="selectedAd"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
    >
      <div
        class="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
      >
        <div class="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 class="text-xl font-black text-gray-900">
              Reklam Detayları
            </h3>
            <p class="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
              {{ selectedAd.name ||
                selectedAd.vendor?.businessName }}
            </p>
          </div>
          <button
            class="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            @click="selectedAd = null"
          >
            <XMarkIcon class="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div class="p-8 space-y-6">
          <div class="grid grid-cols-2 gap-6">
            <div class="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
              <div class="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">
                Platform
              </div>
              <div class="text-sm font-black text-indigo-700">
                {{ selectedAd.platform || 'TÜM PLATFORMLAR' }}
              </div>
            </div>
            <div class="p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
              <div class="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">
                Tür
              </div>
              <div class="text-sm font-black text-purple-700 uppercase">
                {{ selectedAd.pricingModel ||
                  (selectedAd.isBanner ? 'BANNER REKLAM' : 'SABİT') }}
              </div>
            </div>
          </div>

          <div
            v-if="!selectedAd.isBanner"
            class="space-y-3"
          >
            <h4 class="text-sm font-black text-gray-900 uppercase tracking-wider">
              Hedef Reklam Alanları
            </h4>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="slot in selectedAd.targetSlots"
                :key="slot"
                class="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-wider"
              >
                {{ slot.replace('_', ' ') }}
              </span>
              <span
                v-if="!selectedAd.targetSlots?.length"
                class="text-xs font-bold text-gray-400 italic"
              >Tüm
                alanlar</span>
            </div>
          </div>

          <!-- Target URL Display -->
          <div
            v-if="selectedAd.targetUrl"
            class="space-y-3"
          >
            <h4 class="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <LinkIcon class="w-4 h-4 text-indigo-600" />
              Hedef URL
            </h4>
            <a
              :href="selectedAd.targetUrl"
              target="_blank"
              class="text-xs font-bold text-indigo-600 hover:underline break-all"
            >
              {{ selectedAd.targetUrl }}
            </a>
          </div>

          <div
            v-else
            class="space-y-3"
          >
            <h4 class="text-sm font-black text-gray-900 uppercase tracking-wider">
              Banner Alanı
            </h4>
            <div class="flex flex-wrap gap-2">
              <span
                class="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-[10px] font-black uppercase tracking-wider"
              >
                {{ selectedAd.type === 1 ? 'KATEGORİ SIDEBAR' : selectedAd.type === 2 ? 'ÜRÜN BANNERS' :
                  'ARAMA SIDEBAR' }}
              </span>
            </div>
          </div>

          <div
            v-if="selectedAd.mediaUrl || selectedAd.imageUrl"
            class="space-y-3"
          >
            <h4
              class="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2 text-indigo-600"
            >
              <PhotoIcon class="w-4 h-4" /> Reklam Görseli / Banner
            </h4>
            <div
              class="relative rounded-2xl overflow-hidden border-2 border-dashed border-gray-100 bg-gray-50 p-1"
            >
              <img
                :src="selectedAd.mediaUrl || selectedAd.imageUrl"
                class="w-full h-auto object-cover max-h-48 rounded-xl shadow-sm hover:scale-105 transition-transform duration-500"
              >
            </div>
          </div>

          <div
            v-if="selectedAd.products?.length"
            class="space-y-3"
          >
            <h4
              class="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2 text-indigo-600"
            >
              <ArchiveBoxIcon class="w-4 h-4" /> Tanıtılan Ürünler
            </h4>
            <div class="flex flex-wrap gap-3">
              <div
                v-for="p in selectedAd.products"
                :key="p.id"
                class="flex items-center gap-3 p-3 bg-gray-50/80 border border-gray-100 rounded-2xl hover:bg-white hover:border-indigo-100 hover:shadow-sm transition-all min-w-[180px]"
              >
                <img
                  :src="p.Listing?.CatalogProduct?.images?.[0] || '/images/no-image.png'"
                  class="w-10 h-10 object-cover rounded-lg shadow-sm"
                >
                <div class="flex-1 min-w-0">
                  <div class="text-[11px] font-black text-gray-900 truncate">
                    {{ p.Listing?.CatalogProduct?.name }}
                  </div>
                  <div class="text-[9px] font-bold text-gray-400">
                    #{{ p.listingId.substring(0, 8) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <h4 class="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <MapPinIcon class="w-4 h-4" /> Geo-Smart Şehir Hedefleme
            </h4>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="city in selectedAd.targetCities"
                :key="city"
                class="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[10px] font-black uppercase tracking-wider"
              >
                {{ city }}
              </span>
              <span
                v-if="!selectedAd.targetCities?.length"
                class="text-xs font-bold text-gray-400 italic"
              >Tüm
                Türkiye (Pilot Bölgeler)</span>
            </div>
          </div>

          <div
            v-if="isRejecting"
            class="space-y-4 pt-4 border-t border-gray-100"
          >
            <label class="text-sm font-bold text-red-600">Red Nedeni Belirtin</label>
            <textarea
              v-model="rejectionReason"
              rows="3"
              placeholder="Lütfen reklamın neden reddedildiğini açıklayın..."
              class="w-full px-4 py-3 bg-red-50 border border-red-100 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none transition-all text-sm font-medium"
            />
          </div>

          <div
            v-if="selectedAd.rejectionReason && selectedAd.status === 'REJECTED'"
            class="p-4 bg-red-50 rounded-2xl border border-red-100"
          >
            <div class="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">
              Red Nedeni
            </div>
            <div class="text-sm font-medium text-red-700">
              {{ selectedAd.rejectionReason }}
            </div>
          </div>
        </div>

        <div class="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            class="px-6 py-3 text-sm font-black text-gray-500 hover:text-gray-700 transition-colors"
            @click="selectedAd = null"
          >
            Vazgeç
          </button>

          <template v-if="selectedAd.status === 'PENDING'">
            <button
              v-if="!isRejecting"
              class="px-6 py-3 bg-red-100 text-red-600 text-sm font-black rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
              @click="isRejecting = true"
            >
              Reddet
            </button>
            <button
              v-else
              :disabled="!rejectionReason"
              class="px-6 py-3 bg-red-600 text-white text-sm font-black rounded-2xl hover:bg-red-700 transition-all shadow-md disabled:opacity-50"
              @click="confirmReject"
            >
              Reddi Onayla
            </button>
            <button
              class="px-8 py-3 bg-green-600 text-white text-sm font-black rounded-2xl hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
              @click="selectedAd.isBanner ? updateBannerStatus(selectedAd.id, 'ENABLED') : updateStatus(selectedAd.id, 'ENABLED')"
            >
              Reklamı Onayla
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
    layout: 'admin', middleware: 'admin'
})

const { $toast } = useNuxtApp()
const { $api } = useApi()
const campaigns = ref([])
const banners = ref([])
const activeTab = ref('PRODUCT_ADS')
const stats = ref({
    activeCount: 0,
    pendingCount: 0,
    totalPlatformRevenue: 0
})
const activeFilter = ref('ALL')
const activeBannerFilter = ref('ALL')
const searchQuery = ref('')

import {
    CurrencyDollarIcon,
    MagnifyingGlassIcon,
    CheckCircleIcon,
    XMarkIcon,
    PauseIcon,
    PlayIcon,
    MegaphoneIcon,
    ClockIcon,
    RocketLaunchIcon,
    EyeIcon,
    PhotoIcon,
    ArchiveBoxIcon,
    MapPinIcon,
    LinkIcon
} from '@heroicons/vue/24/outline'

const selectedAd = ref(null)
const isRejecting = ref(false)
const rejectionReason = ref('')

const bannerFilters = [
    { label: 'HEPSİ', value: 'ALL' },
    { label: 'BEKLEYENLER', value: 'PENDING' },
    { label: 'AKTİF', value: 'ENABLED' }
]

const openDetails = (ad) => {
    selectedAd.value = ad
    isRejecting.value = false
    rejectionReason.value = ''
}

const promptReject = (ad) => {
    selectedAd.value = ad
    isRejecting.value = true
    rejectionReason.value = ''
}

const filters = [
    { label: 'HEPSİ', value: 'ALL' },
    { label: 'BEKLEYENLER', value: 'PENDING' },
    { label: 'AKTİF', value: 'ENABLED' },
    { label: 'REDDEDİLENLER', value: 'REJECTED' }
]

const summaryCards = computed(() => [
    { label: 'Aktif Kampanyalar', value: stats.value.activeCount, icon: RocketLaunchIcon, color: 'indigo', bgColor: '#EEF2FF', textColor: '#4F46E5' },
    { label: 'Onay Bekleyenler', value: stats.value.pendingCount, icon: ClockIcon, color: 'orange', bgColor: '#FFF7ED', textColor: '#EA580C' },
    { label: 'Platform Geliri', value: `₺${stats.value.totalPlatformRevenue.toLocaleString('tr-TR')}`, icon: CurrencyDollarIcon, color: 'green', bgColor: '#F0FDF4', textColor: '#16A34A' }
])

const filteredCampaigns = computed(() => {
    let result = campaigns.value

    if (activeFilter.value !== 'ALL') {
        result = result.filter(c => c.status === activeFilter.value)
    }

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(c =>
            c.name.toLowerCase().includes(query) ||
            (c.vendor?.businessName || '').toLowerCase().includes(query)
        )
    }

    return result
})

const filteredBanners = computed(() => {
    let result = banners.value

    if (activeBannerFilter.value !== 'ALL') {
        result = result.filter(b => b.status === activeBannerFilter.value)
    }

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(b =>
            (b.vendor?.businessName || '').toLowerCase().includes(query)
        )
    }

    return result
})

const fetchCampaigns = async () => {
    try {
        const [res, statsRes] = await Promise.all([
            $api('/api/admin/ads'),
            $api('/api/admin/ads/stats')
        ])
        if (res.success) campaigns.value = res.data
        if (statsRes.success) stats.value = statsRes.stats
    } catch (err) {
        console.error('Fetch error:', err)
        $toast.error('Veriler yüklenemedi')
    }
}

const fetchBanners = async () => {
    try {
        const res = await $api('/api/admin/vendor-banners')
        if (res.success) banners.value = res.data
    } catch (err) {
        console.error('Fetch banners error:', err)
    }
}

const updateStatus = async (id, status, reason = null) => {
    try {
        const res = await $api(`/api/admin/ads/${id}/status`, {
            method: 'PATCH',
            body: {
                status,
                rejectionReason: reason
            }
        })
        if (res.success) {
            $toast.success('Durum güncellendi')
            selectedAd.value = null
            fetchCampaigns()
        }
    } catch (err) {
        console.error('Update status error:', err)
        $toast.error('Güncelleme başarısız')
    }
}

const updateBannerStatus = async (id, status, reason = null) => {
    try {
        const res = await $api(`/api/admin/vendor-banners/${id}/status`, {
            method: 'PATCH',
            body: {
                status,
                rejectionReason: reason
            }
        })
        if (res.success) {
            $toast.success('Banner durumu güncellendi')
            selectedAd.value = null
            fetchBanners()
        }
    } catch (err) {
        console.error('Update banner status error:', err)
        $toast.error('Banner güncelleme başarısız')
    }
}

const confirmReject = () => {
    if (!rejectionReason.value) return
    if (selectedAd.value.isBanner) {
        updateBannerStatus(selectedAd.value.id, 'REJECTED', rejectionReason.value)
    } else {
        updateStatus(selectedAd.value.id, 'REJECTED', rejectionReason.value)
    }
}

// Helpers
const formatCurrency = (val) => Number(val).toLocaleString('tr-TR', { minimumFractionDigits: 2 })
const formatNumber = (val) => Number(val).toLocaleString('tr-TR')
const formatType = (type) => type.split('_').pop()
const formatTypeLabel = (type) => {
    if (type === 'SPONSORED_PRODUCT') return 'Günlük Bütçe'
    return 'Kampanya Bütçesi'
}
const getStatusLabel = (s) => {
    const labels = {
        'PENDING': 'Bekliyor',
        'ENABLED': 'Aktif',
        'PAUSED': 'Durduruldu',
        'REJECTED': 'Reddedildi',
        'ARCHIVED': 'Arşivlendi'
    }
    return labels[s] || s
}
const getStatusClass = (s) => {
    const classes = {
        'PENDING': 'bg-amber-50 text-amber-700 border border-amber-100',
        'ENABLED': 'bg-green-50 text-green-700 border border-green-100',
        'PAUSED': 'bg-gray-100 text-gray-700 border border-gray-200',
        'REJECTED': 'bg-red-50 text-red-700 border border-red-100'
    }
    return classes[s] || 'bg-gray-100 text-gray-700'
}

onMounted(() => {
    fetchCampaigns()
    fetchBanners()
})
</script>
