<template>
  <div class="min-h-screen bg-gray-50 pb-12">
    <!-- Header with Gradient -->
    <header class="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 pt-10 pb-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-3xl font-bold text-white tracking-tight">
            Reklam ve Sponsorlu Ürünler
          </h1>
          <p class="mt-2 text-indigo-100 max-w-xl">
            Ürünlerinizi öne çıkarın, satışlarınızı artırın ve marka
            bilinirliğinizi BazarX tarzı profesyonel reklam araçlarıyla yönetin.
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <button
            class="px-5 py-2.5 bg-gradient-to-r from-orange-400 to-red-500 text-white hover:from-orange-500 hover:to-red-600 rounded-xl transition-all font-bold text-sm shadow-lg flex items-center gap-2 border border-orange-300"
            @click="openAdSwapModal"
          >
            <GiftIcon class="w-5 h-5" />
            Ad-Swap (Ürünle Öde)
          </button>
          <button
            class="px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-xl transition-all font-medium text-sm flex items-center gap-2"
            @click="seedDemo"
          >
            <SparklesIcon class="w-5 h-5" />
            Demo Verisi Oluştur
          </button>
          <button
            class="px-5 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl transition-all font-bold text-sm shadow-lg flex items-center gap-2"
            @click="openCreateModal"
          >
            <PlusIcon class="w-5 h-5" />
            Yeni Kampanya Oluştur
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          v-for="stat in summaryStats"
          :key="stat.label"
          class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between mb-4">
            <div :class="`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`">
              <component
                :is="stat.icon"
                class="w-6 h-6"
              />
            </div>
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">{{ stat.label }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-2xl font-bold text-gray-900">{{ stat.value }}</span>
            <span
              class="text-sm mt-1"
              :class="stat.trend > 0 ? 'text-green-500' : 'text-gray-400'"
            >
              <ArrowTrendingUpIcon
                v-if="stat.trend > 0"
                class="w-4 h-4 inline mr-1"
              />
              <MinusIcon
                v-else
                class="w-4 h-4 inline mr-1"
              />
              Sektör ortalamasında
            </span>
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div
          class="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white"
        >
          <div class="flex items-center gap-6">
            <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ListBulletIcon class="w-5 h-5 text-indigo-600" />
              Kampanyalar
            </h2>
            <div class="flex bg-gray-100 p-1 rounded-xl">
              <button
                v-for="tab in ['HEPSİ', 'AKTİF', 'DURAKLATILDI']"
                :key="tab"
                :class="`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${currentTab === tab ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`"
                @click="currentTab = tab"
              >
                {{ tab }}
              </button>
            </div>
          </div>
          <div class="flex items-center gap-4 text-sm text-gray-400 font-medium">
            <span>Toplam {{ filteredAds.length }} kampanya listeleniyor</span>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-gray-50/50">
              <tr>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th
                  class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center"
                >
                  Reklam
                </th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Kampanya
                </th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Tür
                </th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Bütçe
                </th>
                <th
                  class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right"
                >
                  Gösterim
                </th>
                <th
                  class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right"
                >
                  Tıklama
                </th>
                <th
                  class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right"
                >
                  CTR
                </th>
                <th
                  class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right"
                >
                  Harcama
                </th>
                <th
                  class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right font-bold text-indigo-700"
                >
                  ROAS
                </th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="ad in adCampaigns"
                :key="ad.id"
                class="hover:bg-gray-50/80 transition-colors group"
              >
                <td class="px-6 py-4">
                  <template v-if="ad.status === 'PENDING'">
                    <span
                      class="px-2 py-1 text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100 rounded-lg"
                    >Onay
                      Bekliyor</span>
                  </template>
                  <template v-else-if="ad.status === 'REJECTED'">
                    <span
                      class="px-2 py-1 text-[9px] font-black uppercase tracking-widest bg-red-50 text-red-600 border border-red-100 rounded-lg"
                      :title="ad.rejectionReason"
                    >Reddedildi</span>
                  </template>
                  <template v-else>
                    <button
                      class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                      :class="ad.status === 'ENABLED' ? 'bg-indigo-600' : 'bg-gray-200'"
                      @click="toggleStatus(ad)"
                    >
                      <span
                        class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                        :class="ad.status === 'ENABLED' ? 'translate-x-5' : 'translate-x-0'"
                      />
                    </button>
                  </template>
                </td>
                <td class="px-6 py-4">
                  <div class="flex -space-x-2">
                    <img
                      v-for="p in ad.products.slice(0, 3)"
                      :key="p.id"
                      :src="p.product.image"
                      class="w-8 h-8 rounded-lg border-2 border-white object-cover"
                      :title="p.product.name"
                    >
                    <div
                      v-if="ad.products.length > 3"
                      class="w-8 h-8 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500"
                    >
                      +{{ ad.products.length - 3 }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div
                    class="font-bold text-gray-900 group-hover:text-indigo-700 truncate max-w-[200px]"
                  >
                    {{ ad.name }}
                  </div>
                  <div class="text-[10px] text-gray-400 mt-0.5 flex flex-wrap gap-x-2">
                    <span>Başlangıç: {{ formatDate(ad.startDate) }}</span>
                    <span
                      v-if="ad.endDate"
                      class="text-orange-500"
                    >Bitiş: {{ formatDate(ad.endDate)
                    }}</span>
                    <span
                      v-else
                      class="text-indigo-500"
                    >Süresiz</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="px-2 py-1 text-[10px] font-bold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100"
                  >
                    {{ mapType(ad.type) }}
                  </span>
                </td>
                <td class="px-6 py-4 font-medium text-gray-700">
                  ₺{{ ad.budget }}
                </td>
                <td class="px-6 py-4 text-right tabular-nums text-gray-600">
                  {{
                    formatNumber(getMetricTotal(ad, 'impressions')) }}
                </td>
                <td class="px-6 py-4 text-right tabular-nums text-gray-600">
                  {{
                    formatNumber(getMetricTotal(ad, 'clicks')) }}
                </td>
                <td class="px-6 py-4 text-right tabular-nums text-gray-600">
                  {{ formatCTR(ad) }}%
                </td>
                <td class="px-6 py-4 text-right tabular-nums font-medium text-gray-900">
                  ₺{{
                    formatCurrency(getMetricTotal(ad, 'spend'))
                  }}
                </td>
                <td class="px-6 py-4 text-right tabular-nums font-bold text-indigo-700">
                  {{
                    formatROAS(ad) }}x
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <button
                      v-if="ad.adPackage && adPackage !== 'NONE'"
                      class="p-2 text-primary-500 hover:text-primary-700 bg-primary-50 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold"
                      @click="openReport(ad)"
                    >
                      <GiftIcon class="w-4 h-4" /> RAPOR
                    </button>
                    <button
                      class="p-2 text-gray-300 hover:text-red-600 transition-colors"
                      @click="deleteAd(ad.id)"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredAds.length === 0">
                <td
                  colspan="10"
                  class="px-6 py-20 text-center"
                >
                  <div class="flex flex-col items-center gap-4">
                    <div
                      class="w-20 h-20 bg-gray-50 flex items-center justify-center rounded-full text-gray-200"
                    >
                      <MegaphoneIcon class="w-12 h-12" />
                    </div>
                    <div>
                      <h3 class="text-lg font-bold text-gray-900">
                        Kampanya Bulunamadı
                      </h3>
                      <p class="text-sm text-gray-500 max-w-xs mx-auto mt-1">
                        Henüz hiç reklam
                        kampanyası oluşturulmamış. Yukarıdaki butona tıklayarak
                        başlayabilirsiniz.
                      </p>
                    </div>
                    <button
                      class="mt-2 text-indigo-600 font-bold hover:underline"
                      @click="openCreateModal"
                    >
                      İlk kampanyanı
                      oluştur
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Brand Presence / Store Layout Section -->
      <div class="mt-12 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-12">
        <div class="px-10 py-8 border-b border-gray-100 bg-gray-50/50">
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">
            Marka Mağazası ve Yerleşimler
          </h2>
          <p class="text-gray-500 text-sm font-medium mt-1">
            Reklamlarınızın sitede nerede ve nasıl göründüğünü
            kontrol
            edin.
          </p>
        </div>
        <div class="p-10">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              v-for="i in 3"
              :key="i"
              class="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center text-center group hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all"
            >
              <div
                class="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm"
              >
                <RectangleStackIcon
                  v-if="i === 1"
                  class="w-10 h-10 text-indigo-600"
                />
                <ComputerDesktopIcon
                  v-else-if="i === 2"
                  class="w-10 h-10 text-indigo-600"
                />
                <BuildingStorefrontIcon
                  v-else
                  class="w-10 h-10 text-indigo-600"
                />
              </div>
              <h4 class="text-base font-black text-gray-900 mb-2">
                {{ i === 1 ? 'Kategori Sayfası' : (i === 2 ? 'Benzer Ürünler' : 'Marka Mağazası') }}
              </h4>
              <p class="text-[12px] font-bold text-gray-500 mb-8 px-4 leading-relaxed">
                {{ i === 1
                  ? 'Kategori sayfalarının en üstünde, markanızı temsil eden geniş banner alanları.'
                  : (i === 2
                    ? 'Rakip ürün sayfalarında "Benzer Sponsorlu Ürünler" sekmesinde görünün.'
                    : 'Tüm ürünlerinizi sergilediğiniz, markanıza özel özelleştirilebilir mikro-site.')
                }}
              </p>

              <button
                class="mt-auto w-full py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-gray-200 hover:shadow-indigo-500/20"
                @click="openLayoutModal(i)"
              >
                Düzeni Düzenle
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Ad-Swap Create Modal -->
    <div
      v-if="isAdSwapModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        @click="isAdSwapModalOpen = false"
      />
      <div
        class="relative bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col"
      >
        <div
          class="bg-gradient-to-r from-orange-500 to-red-600 px-8 py-6 flex justify-between items-center text-white"
        >
          <div>
            <h3 class="text-xl font-bold flex items-center gap-2">
              <GiftIcon class="w-6 h-6" /> BazarX Ad-Swap (Para Yerine Ürünle Reklam)
            </h3>
            <p class="text-orange-100 text-sm mt-1">
              Nakit yakmayın, kendi ürettiğiniz ürünü bütçe olarak
              kullanın.
              (Geo-Smart Entegreli)
            </p>
          </div>
          <button
            class="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
            @click="isAdSwapModalOpen = false"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <div class="p-8 space-y-6 overflow-y-auto flex-1">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <label class="text-sm font-bold text-gray-700">Ad-Swap Kampanya Adı</label>
              <input
                v-model="swapCampaign.name"
                type="text"
                placeholder="Örn: Geo-Smart Ürün Dağıtımı A"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              >
            </div>
            <div class="space-y-4">
              <label class="text-sm font-bold text-gray-700">Yayınlanacak Platform</label>
              <div class="flex gap-2">
                <button
                  v-for="p in ['BAZARX', 'TICARI_TAKAS', 'BARTER_BORSA']"
                  :key="p"
                  :class="`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all ${swapCampaign.platform === p ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-500 border-gray-200'}`"
                  @click="swapCampaign.platform = p"
                >
                  {{ p.replace('_', ' ') }}
                </button>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <label class="text-sm font-bold text-gray-700">Reklam Bütçesi (Paketler)</label>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label class="relative cursor-pointer">
                <input
                  v-model="swapCampaign.adPackage"
                  type="radio"
                  value="BRONZE"
                  class="peer sr-only"
                >
                <div
                  class="rounded-xl border-2 border-gray-200 p-4 hover:border-orange-300 peer-checked:border-orange-500 peer-checked:bg-orange-50 transition-all"
                >
                  <div class="text-orange-600 font-black mb-1 text-lg">BRONZ</div>
                  <div class="text-2xl font-bold text-gray-900 mb-2">6.000 ₺</div>
                  <p class="text-[10px] text-gray-500 font-medium">Satış Fiyatı Üzerinden Ürün Tahsisi
                  </p>
                </div>
              </label>
              <label class="relative cursor-pointer">
                <input
                  v-model="swapCampaign.adPackage"
                  type="radio"
                  value="SILVER"
                  class="peer sr-only"
                >
                <div
                  class="rounded-xl border-2 border-gray-200 p-4 hover:border-orange-300 peer-checked:border-orange-500 peer-checked:bg-orange-50 transition-all"
                >
                  <div class="text-gray-400 font-black mb-1 text-lg">GÜMÜŞ</div>
                  <div class="text-2xl font-bold text-gray-900 mb-2">9.000 ₺</div>
                  <p class="text-[10px] text-gray-500 font-medium">Satış Fiyatı Üzerinden Ürün Tahsisi
                  </p>
                </div>
              </label>
              <label class="relative cursor-pointer">
                <input
                  v-model="swapCampaign.adPackage"
                  type="radio"
                  value="GOLD"
                  class="peer sr-only"
                >
                <div
                  class="rounded-xl border-2 border-gray-200 p-4 hover:border-orange-300 peer-checked:border-orange-500 peer-checked:bg-orange-50 transition-all"
                >
                  <div class="text-yellow-500 font-black mb-1 text-lg">ALTIN</div>
                  <div class="text-2xl font-bold text-gray-900 mb-2">12.000 ₺</div>
                  <p class="text-[10px] text-gray-500 font-medium">+%20 Ek Gösterim Hediyesi</p>
                </div>
              </label>
            </div>
            <div class="space-y-4">
              <label class="text-sm font-bold text-gray-700 font-serif">Kampanya Kurgusu Seçin</label>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  :class="`px-3 py-2 text-[10px] font-bold rounded-lg border transition-all ${swapCampaign.campaignType === 'REWARD_DISTRIBUTION' ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-white text-gray-500 border-gray-200'}`"
                  @click="swapCampaign.campaignType = 'REWARD_DISTRIBUTION'"
                >
                  %100 Ücretsiz Ödül
                </button>
                <button
                  :class="`px-3 py-2 text-[10px] font-bold rounded-lg border transition-all ${swapCampaign.campaignType === 'BUY_ONE_GET_ONE' ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-white text-gray-500 border-gray-200'}`"
                  @click="swapCampaign.campaignType = 'BUY_ONE_GET_ONE'"
                >
                  1 Alana 1 Bedava
                </button>
                <button
                  :class="`px-3 py-2 text-[10px] font-bold rounded-lg border transition-all ${swapCampaign.campaignType === 'DISCOUNT_COUPON' ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-white text-gray-500 border-gray-200'}`"
                  @click="swapCampaign.campaignType = 'DISCOUNT_COUPON'"
                >
                  Özel İndirim Kuponu
                </button>
              </div>
              <div
                v-if="swapCampaign.campaignType === 'REWARD_DISTRIBUTION'"
                class="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3"
              >
                <InfoIcon class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p class="text-xs text-blue-800 leading-relaxed font-medium">
                  <b>%100 Escrow Kuponu:</b> Seçtiğiniz ürünler kullanıcılara "Ödül" olarak sunulur.
                  Kullanıcı
                  bu ürünü sepetine eklediğinde %100 indirim (ücretsiz ürün) kuponu uygulanır. (Kargo
                  alıcıya
                  aittir).
                </p>
              </div>
              <div
                v-else-if="swapCampaign.campaignType === 'BUY_ONE_GET_ONE'"
                class="bg-purple-50 p-4 rounded-xl border border-purple-100 flex items-start gap-3"
              >
                <SparklesIcon class="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <p class="text-xs text-purple-800 leading-relaxed font-medium">
                  <b>1 Alana 1 Bedava:</b> Seçtiğiniz ürünlerin stoğu kadar "1 Alana 1 Bedava"
                  kampanyası
                  başlatılır. Bu ürünlerin reklam bütçesi ürün maliyetinizle karşılanır.
                </p>
              </div>
              <div
                v-else
                class="bg-green-50 p-4 rounded-xl border border-green-100 flex items-start gap-3"
              >
                <CreditCardIcon class="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p class="text-xs text-green-800 leading-relaxed font-medium">
                  <b>Özel İndirim Kuponu:</b> Reklam alanlarında gösterilecek özel indirim kodları
                  (Örn:
                  HOŞGELDİN20) ile kullanıcı çekersiniz.
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <label class="text-sm font-bold text-gray-700">Dağıtılacak (Ödül) Ürünleri Seçin</label>
            <div
              class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar"
            >
              <div
                v-for="product in vendorProducts"
                :key="'swap-' + product.id"
                :class="`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${swapCampaign.productIds.includes(product.id) ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-orange-300'}`"
                @click="toggleSwapProduct(product.id)"
              >
                <img
                  :src="product.image"
                  class="w-12 h-12 object-cover rounded-lg"
                >
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-bold text-gray-900 truncate">
                    {{ product.name }}
                  </div>
                  <div class="text-[10px] text-gray-500 mt-1">
                    Fiyat: ₺{{ product.price }}
                  </div>
                </div>
                <div
                  v-if="swapCampaign.productIds.includes(product.id)"
                  class="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white"
                >
                  <CheckCircleIcon class="w-3 h-3" />
                </div>
              </div>
              <div
                v-if="vendorProducts.length === 0"
                class="col-span-full py-10 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200"
              >
                <PackageIcon class="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p class="text-sm font-bold text-gray-400">
                  Ödül olarak dağıtılabilecek ürününüz
                  bulunamadı.
                </p>
                <p class="text-[10px] text-gray-400 mt-1">
                  Lütfen önce ürün ekleyin.
                </p>
              </div>

              <p
                v-if="swapCampaign.productIds.length > 0"
                class="text-xs font-bold text-orange-600 mt-2"
              >
                {{ swapCampaign.productIds.length }} ürün bütçe olarak tahsis edilecek.
              </p>
            </div>

            <div class="space-y-4">
              <label class="text-sm font-bold text-gray-700">Hedef Reklam Alanları</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="slot in availableSlots"
                  :key="'swap-' + slot.id"
                  class="px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all"
                  :class="swapCampaign.targetSlots.includes(slot.id) ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-500 border-gray-200'"
                  @click="toggleSwapSlot(slot.id)"
                >
                  {{ slot.label }}
                </button>
              </div>
            </div>

            <!-- Target URL for Banner/Side Ads -->
            <div
              v-if="swapCampaign.targetSlots.some(s => ['HOME_BANNER', 'SIDE_ADS'].includes(s))"
              class="space-y-2"
            >
              <label class="text-sm font-bold text-gray-700 flex items-center gap-2">
                <LinkIcon class="w-4 h-4 text-orange-500" />
                Hedef URL (Opsiyonel)
              </label>
              <input
                v-model="swapCampaign.targetUrl"
                type="url"
                placeholder="https://... (Reklama tıklandığında gidilecek adres)"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
              >
              <p class="text-[10px] text-gray-400">
                Belirtilmezse reklam doğrudan mağazanıza veya seçili
                ürünlere
                yönlenir.
              </p>
            </div>

            <!-- Geo-Smart City & District Selector (Ad-Swap) -->
            <div class="space-y-4">
              <label class="text-sm font-bold text-gray-700 flex items-center gap-2">
                <MapPinIcon class="w-4 h-4 text-orange-500" />
                Geo-Smart Alan Hedeflemesi
              </label>
              <p class="text-[10px] text-gray-500 font-medium italic">
                <b>İpucu:</b> Şehir ve ilçe bazlı reklam özelleştirmesi yapabilirsiniz.
                Boş bırakırsanız sistem Geo-Smart algoritması ile pilot bölgeleri otomatik seçecektir.
              </p>

              <!-- City Select -->
              <div class="space-y-2">
                <div
                  ref="swapCityDropdownRef"
                  class="relative"
                >
                  <div
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer flex items-center justify-between hover:border-orange-300 transition-all"
                    @click="isSwapCityDropdownOpen = !isSwapCityDropdownOpen"
                  >
                    <span
                      v-if="swapSelectedCities.length === 0"
                      class="text-sm text-gray-400"
                    >Şehir
                      seçin...</span>
                    <span
                      v-else
                      class="text-sm text-gray-700 font-medium"
                    >{{
                      swapSelectedCities.length }}
                      şehir seçildi</span>
                    <ChevronDownIcon
                      class="w-4 h-4 text-gray-400 transition-transform"
                      :class="{ 'rotate-180': isSwapCityDropdownOpen }"
                    />
                  </div>
                  <div
                    v-if="isSwapCityDropdownOpen"
                    class="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-hidden"
                  >
                    <div class="p-2 border-b border-gray-100">
                      <input
                        v-model="swapCitySearch"
                        type="text"
                        placeholder="Şehir ara..."
                        class="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                      >
                    </div>
                    <div class="overflow-y-auto max-h-40 custom-scrollbar">
                      <div
                        v-for="city in filteredSwapCities"
                        :key="'swap-city-' + city"
                        class="px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between hover:bg-orange-50 transition-colors"
                        :class="swapSelectedCities.includes(city) ? 'bg-orange-50 text-orange-700 font-bold' : 'text-gray-700'"
                        @click="toggleSwapCity(city)"
                      >
                        <span>{{ city }}</span>
                        <CheckCircleIcon
                          v-if="swapSelectedCities.includes(city)"
                          class="w-4 h-4 text-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  v-if="swapSelectedCities.length > 0"
                  class="flex flex-wrap gap-1.5 mt-2"
                >
                  <span
                    v-for="city in swapSelectedCities"
                    :key="'swap-tag-' + city"
                    class="px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-lg text-[10px] font-bold flex items-center gap-1.5"
                  >
                    {{ city }}
                    <button
                      class="hover:text-red-600"
                      @click="removeSwapCity(city)"
                    >
                      <XMarkIcon class="w-3 h-3" />
                    </button>
                  </span>
                </div>
              </div>

              <!-- District Select -->
              <div
                v-if="swapSelectedCities.length > 0"
                class="space-y-2"
              >
                <div
                  ref="swapDistrictDropdownRef"
                  class="relative"
                >
                  <div
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer flex items-center justify-between hover:border-orange-300 transition-all"
                    @click="isSwapDistrictDropdownOpen = !isSwapDistrictDropdownOpen"
                  >
                    <span
                      v-if="swapSelectedDistricts.length === 0"
                      class="text-sm text-gray-400"
                    >İlçe seçin
                      (boş bırakırsanız tüm ilçeler)...</span>
                    <span
                      v-else
                      class="text-sm text-gray-700 font-medium"
                    >{{
                      swapSelectedDistricts.length
                    }} ilçe seçildi</span>
                    <ChevronDownIcon
                      class="w-4 h-4 text-gray-400 transition-transform"
                      :class="{ 'rotate-180': isSwapDistrictDropdownOpen }"
                    />
                  </div>
                  <div
                    v-if="isSwapDistrictDropdownOpen"
                    class="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-hidden"
                  >
                    <div class="p-2 border-b border-gray-100">
                      <input
                        v-model="swapDistrictSearch"
                        type="text"
                        placeholder="İlçe ara..."
                        class="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                      >
                    </div>
                    <div class="overflow-y-auto max-h-40 custom-scrollbar">
                      <template
                        v-for="city in swapSelectedCities"
                        :key="'swap-dist-group-' + city"
                      >
                        <div
                          class="px-4 py-1.5 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky top-0"
                        >
                          {{ city }}
                        </div>
                        <div
                          v-for="district in filteredSwapDistricts(city)"
                          :key="'swap-dist-' + city + '-' + district"
                          class="px-4 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-orange-50 transition-colors pl-6"
                          :class="swapSelectedDistricts.includes(district + ' (' + city + ')') ? 'bg-orange-50 text-orange-700 font-bold' : 'text-gray-700'"
                          @click="toggleSwapDistrict(district + ' (' + city + ')')"
                        >
                          <span>{{ district }}</span>
                          <CheckCircleIcon
                            v-if="swapSelectedDistricts.includes(district + ' (' + city + ')')"
                            class="w-4 h-4 text-orange-500"
                          />
                        </div>
                      </template>
                    </div>
                  </div>
                </div>
                <div
                  v-if="swapSelectedDistricts.length > 0"
                  class="flex flex-wrap gap-1.5 mt-2"
                >
                  <span
                    v-for="d in swapSelectedDistricts"
                    :key="'swap-dtag-' + d"
                    class="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-[10px] font-bold flex items-center gap-1.5"
                  >
                    {{ d }}
                    <button
                      class="hover:text-red-600"
                      @click="removeSwapDistrict(d)"
                    >
                      <XMarkIcon class="w-3 h-3" />
                    </button>
                  </span>
                </div>
              </div>
            </div>

            <!-- Ad-Swap Banner Image Upload Section -->
            <div class="space-y-3 pt-4 border-t border-gray-100">
              <div class="flex justify-between items-center">
                <label class="text-sm font-bold text-gray-700">Kampanya Görseli / Banner
                  (Opsiyonel)</label>
                <span class="text-[10px] text-gray-400 font-bold uppercase">PNG, JPG • Max 5MB</span>
              </div>
              <div
                class="relative group cursor-pointer border-2 border-dashed border-gray-200 hover:border-orange-400 rounded-2xl p-6 bg-gray-50/50 hover:bg-orange-50/30 transition-all overflow-hidden flex flex-col items-center justify-center min-h-[140px]"
                @click="$refs.swapFileInput.click()"
              >
                <input
                  ref="swapFileInput"
                  type="file"
                  class="hidden"
                  accept="image/*"
                  @change="handleSwapFileUpload"
                >

                <template v-if="swapImagePreview">
                  <img
                    :src="swapImagePreview"
                    class="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                  >
                  <div class="relative z-10 flex flex-col items-center gap-2">
                    <div class="p-2 bg-white rounded-full shadow-lg text-orange-600">
                      <ArrowPathIcon class="w-5 h-5" />
                    </div>
                    <span
                      class="text-xs font-bold text-gray-900 bg-white/80 px-3 py-1 rounded-lg backdrop-blur-sm"
                    >Görseli
                      Değiştir</span>
                  </div>
                </template>
                <template v-else>
                  <div
                    class="p-3 bg-white rounded-2xl shadow-sm text-gray-400 group-hover:text-orange-500 group-hover:scale-110 transition-all mb-2"
                  >
                    <CloudArrowUpIcon class="w-8 h-8" />
                  </div>
                  <div class="text-center">
                    <p class="text-sm font-bold text-gray-700">
                      Buraya tıklayarak dosya seçin
                    </p>
                    <p
                      class="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-semibold"
                    >
                      Tıklama oranını artırmak için özel banner kullanın
                    </p>
                  </div>
                </template>
              </div>
              <div
                v-if="swapImagePreview"
                class="flex items-center gap-2"
              >
                <button
                  class="text-[10px] text-red-500 font-bold hover:underline flex items-center gap-1"
                  @click.stop="clearSwapFile"
                >
                  <TrashIcon class="w-3 h-3" /> Görseli Kaldır
                </button>
              </div>
            </div>
          </div>

          <div class="px-8 py-6 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              class="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-all"
              @click="isAdSwapModalOpen = false"
            >
              İptal
            </button>
            <button
              :disabled="!isSwapFormValid || isSwapLoading"
              class="px-8 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-700 disabled:opacity-50 transition-all flex items-center gap-2"
              @click="createAdSwapCampaign"
            >
              <ArrowPathIcon
                v-if="isSwapLoading"
                class="w-5 h-5 animate-spin"
              />
              {{ isSwapLoading ? 'Oluşturuluyor...' : 'Ad-Swap Kampanyasını Başlat' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Campaign Modal -->
    <div
      v-if="isCreateModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <!-- Backdrop - tıklanınca kapat -->
      <div
        class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        @click="isCreateModalOpen = false"
      />
      <div
        class="relative bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col"
      >
        <div
          class="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 flex justify-between items-center text-white"
        >
          <div>
            <h3 class="text-xl font-bold">
              Yeni Reklam Kampanyası
            </h3>
            <p class="text-indigo-100 text-sm mt-1">
              Ürünlerinizi saniyeler içinde öne çıkarın.
            </p>
          </div>
          <button
            class="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
            @click="isCreateModalOpen = false"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <div class="p-8 space-y-6 overflow-y-auto flex-1">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-bold text-gray-700">Kampanya Adı</label>
              <input
                v-model="newCampaign.name"
                type="text"
                placeholder="Örn: Yaz İndirimi 2024"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
            </div>
            <div class="space-y-2">
              <label class="text-sm font-bold text-gray-700">Kampanya Türü</label>
              <select
                v-model="newCampaign.type"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                <option value="SPONSORED_PRODUCT">
                  Sponsorlu Ürünler
                </option>
                <option value="SPONSORED_BRAND">
                  Sponsorlu Markalar
                </option>
                <option value="SPONSORED_DISPLAY">
                  Görüntülü Reklamlar
                </option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-bold text-gray-700">Platform Seçimi</label>
              <div class="flex gap-2">
                <button
                  v-for="p in ['BAZARX', 'TICARI_TAKAS', 'BARTER_BORSA']"
                  :key="'platform-' + p"
                  type="button"
                  :class="`flex-1 py-3 text-[10px] font-bold rounded-xl border transition-all ${newCampaign.platform === p ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-indigo-300'}`"
                  @click="newCampaign.platform = p"
                >
                  {{ p.replace('_', ' ') }}
                </button>
              </div>
            </div>
            <!-- Geo-Smart City & District Selector (Campaign) -->
            <div class="space-y-2 md:col-span-2">
              <label class="text-sm font-bold text-gray-700 flex items-center gap-2">
                <MapPinIcon class="w-4 h-4 text-indigo-500" />
                Geo-Smart Şehir Hedefleme
              </label>
              <p class="text-[10px] text-gray-500 font-medium italic mb-2">
                Reklamınızın gösterileceği şehirleri ve isteğe bağlı olarak ilçeleri seçin.
                Boş bırakırsanız tüm pilot bölgelerde gösterilir.
              </p>

              <!-- City Select -->
              <div class="space-y-2">
                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Şehir
                  Seçin</label>
                <div
                  ref="campaignCityDropdownRef"
                  class="relative"
                >
                  <div
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer flex items-center justify-between hover:border-indigo-300 transition-all"
                    @click="isCampaignCityDropdownOpen = !isCampaignCityDropdownOpen"
                  >
                    <span
                      v-if="campaignSelectedCities.length === 0"
                      class="text-sm text-gray-400"
                    >Şehir
                      seçin...</span>
                    <span
                      v-else
                      class="text-sm text-gray-700 font-medium"
                    >{{
                      campaignSelectedCities.length }} şehir seçildi</span>
                    <ChevronDownIcon
                      class="w-4 h-4 text-gray-400 transition-transform"
                      :class="{ 'rotate-180': isCampaignCityDropdownOpen }"
                    />
                  </div>
                  <div
                    v-if="isCampaignCityDropdownOpen"
                    class="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-hidden"
                  >
                    <div class="p-2 border-b border-gray-100">
                      <input
                        v-model="campaignCitySearch"
                        type="text"
                        placeholder="Şehir ara..."
                        class="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                    </div>
                    <div class="overflow-y-auto max-h-40 custom-scrollbar">
                      <div
                        v-for="city in filteredCampaignCities"
                        :key="'camp-city-' + city"
                        class="px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between hover:bg-indigo-50 transition-colors"
                        :class="campaignSelectedCities.includes(city) ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-700'"
                        @click="toggleCampaignCity(city)"
                      >
                        <span>{{ city }}</span>
                        <CheckCircleIcon
                          v-if="campaignSelectedCities.includes(city)"
                          class="w-4 h-4 text-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  v-if="campaignSelectedCities.length > 0"
                  class="flex flex-wrap gap-1.5 mt-1"
                >
                  <span
                    v-for="city in campaignSelectedCities"
                    :key="'camp-tag-' + city"
                    class="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-[10px] font-bold flex items-center gap-1.5"
                  >
                    {{ city }}
                    <button
                      class="hover:text-red-600"
                      @click="removeCampaignCity(city)"
                    >
                      <XMarkIcon class="w-3 h-3" />
                    </button>
                  </span>
                </div>
              </div>

              <!-- District Select -->
              <div
                v-if="campaignSelectedCities.length > 0"
                class="space-y-2"
              >
                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">İlçe
                  Seçin
                  (Opsiyonel)</label>
                <div
                  ref="campaignDistrictDropdownRef"
                  class="relative"
                >
                  <div
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer flex items-center justify-between hover:border-indigo-300 transition-all"
                    @click="isCampaignDistrictDropdownOpen = !isCampaignDistrictDropdownOpen"
                  >
                    <span
                      v-if="campaignSelectedDistricts.length === 0"
                      class="text-sm text-gray-400"
                    >İlçe
                      seçin (boş bırakırsanız tüm
                      ilçeler)...</span>
                    <span
                      v-else
                      class="text-sm text-gray-700 font-medium"
                    >{{
                      campaignSelectedDistricts.length }} ilçe seçildi</span>
                    <ChevronDownIcon
                      class="w-4 h-4 text-gray-400 transition-transform"
                      :class="{ 'rotate-180': isCampaignDistrictDropdownOpen }"
                    />
                  </div>
                  <div
                    v-if="isCampaignDistrictDropdownOpen"
                    class="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-hidden"
                  >
                    <div class="p-2 border-b border-gray-100">
                      <input
                        v-model="campaignDistrictSearch"
                        type="text"
                        placeholder="İlçe ara..."
                        class="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                    </div>
                    <div class="overflow-y-auto max-h-40 custom-scrollbar">
                      <template
                        v-for="city in campaignSelectedCities"
                        :key="'camp-dist-group-' + city"
                      >
                        <div
                          class="px-4 py-1.5 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky top-0"
                        >
                          {{ city }}
                        </div>
                        <div
                          v-for="district in filteredCampaignDistricts(city)"
                          :key="'camp-dist-' + city + '-' + district"
                          class="px-4 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-indigo-50 transition-colors pl-6"
                          :class="campaignSelectedDistricts.includes(district + ' (' + city + ')') ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-700'"
                          @click="toggleCampaignDistrict(district + ' (' + city + ')')"
                        >
                          <span>{{ district }}</span>
                          <CheckCircleIcon
                            v-if="campaignSelectedDistricts.includes(district + ' (' + city + ')')"
                            class="w-4 h-4 text-indigo-500"
                          />
                        </div>
                      </template>
                    </div>
                  </div>
                </div>
                <div
                  v-if="campaignSelectedDistricts.length > 0"
                  class="flex flex-wrap gap-1.5 mt-1"
                >
                  <span
                    v-for="d in campaignSelectedDistricts"
                    :key="'camp-dtag-' + d"
                    class="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-[10px] font-bold flex items-center gap-1.5"
                  >
                    {{ d }}
                    <button
                      class="hover:text-red-600"
                      @click="removeCampaignDistrict(d)"
                    >
                      <XMarkIcon class="w-3 h-3" />
                    </button>
                  </span>
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-bold text-gray-700">Günlük Bütçe (₺)</label>
              <input
                v-model="newCampaign.budget"
                type="number"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
            </div>
            <div class="space-y-2">
              <label class="text-sm font-bold text-gray-700">Bitiş Tarihi (Opsiyonel)</label>
              <input
                v-model="newCampaign.endDate"
                type="date"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
            </div>

            <!-- Banner Image Upload Section -->
            <div class="md:col-span-2 space-y-3 pt-4 border-t border-gray-100">
              <div class="flex justify-between items-center">
                <label class="text-sm font-bold text-gray-700">Kampanya Görseli / Banner
                  (Opsiyonel)</label>
                <span class="text-[10px] text-gray-400 font-bold uppercase">PNG, JPG • Max
                  5MB</span>
              </div>
              <div
                class="relative group cursor-pointer border-2 border-dashed border-gray-200 hover:border-indigo-400 rounded-2xl p-6 bg-gray-50/50 hover:bg-indigo-50/30 transition-all overflow-hidden flex flex-col items-center justify-center min-h-[140px]"
                @click="$refs.campaignFileInput.click()"
              >
                <input
                  ref="campaignFileInput"
                  type="file"
                  class="hidden"
                  accept="image/*"
                  @change="handleCampaignFileUpload"
                >

                <template v-if="campaignImagePreview">
                  <img
                    :src="campaignImagePreview"
                    class="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                  >
                  <div class="relative z-10 flex flex-col items-center gap-2">
                    <div class="p-2 bg-white rounded-full shadow-lg text-indigo-600">
                      <ArrowPathIcon class="w-5 h-5" />
                    </div>
                    <span
                      class="text-xs font-bold text-gray-900 bg-white/80 px-3 py-1 rounded-lg backdrop-blur-sm"
                    >Görseli
                      Değiştir</span>
                  </div>
                </template>
                <template v-else>
                  <div
                    class="p-3 bg-white rounded-2xl shadow-sm text-gray-400 group-hover:text-indigo-500 group-hover:scale-110 transition-all mb-2"
                  >
                    <CloudArrowUpIcon class="w-8 h-8" />
                  </div>
                  <div class="text-center">
                    <p class="text-sm font-bold text-gray-700">
                      Buraya tıklayarak dosya seçin
                    </p>
                    <p
                      class="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-semibold"
                    >
                      Tıklama oranını artırmak için özel banner kullanın
                    </p>
                  </div>
                </template>
              </div>
              <div
                v-if="campaignImagePreview"
                class="flex items-center gap-2"
              >
                <button
                  class="text-[10px] text-red-500 font-bold hover:underline flex items-center gap-1"
                  @click.stop="clearCampaignFile"
                >
                  <TrashIcon class="w-3 h-3" /> Görseli Kaldır
                </button>
              </div>
            </div>
          </div>

          <!-- Auction & Pricing Settings -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div class="space-y-3">
              <label class="text-sm font-bold text-gray-700 block">Fiyatlandırma Modeli</label>
              <div class="flex gap-4">
                <label
                  class="flex items-center gap-2 cursor-pointer p-3 rounded-xl border transition-all"
                  :class="newCampaign.pricingModel === 'CPC' ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'"
                >
                  <input
                    v-model="newCampaign.pricingModel"
                    type="radio"
                    value="CPC"
                    class="text-indigo-600 focus:ring-indigo-500 hidden"
                  >
                  <div>
                    <div class="text-xs font-black text-gray-900">CPC (Tıklama Başı)</div>
                    <div class="text-[10px] text-gray-500">Tıklama başına ödeme yapın</div>
                  </div>
                </label>
                <label
                  class="flex items-center gap-2 cursor-pointer p-3 rounded-xl border transition-all"
                  :class="newCampaign.pricingModel === 'CPM' ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'"
                >
                  <input
                    v-model="newCampaign.pricingModel"
                    type="radio"
                    value="CPM"
                    class="text-indigo-600 focus:ring-indigo-500 hidden"
                  >
                  <div>
                    <div class="text-xs font-black text-gray-900">CPM (1000 Gösterim)</div>
                    <div class="text-[10px] text-gray-500">Görünürlük odaklı</div>
                  </div>
                </label>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-bold text-gray-700">Maksimum Teklif ({{
                newCampaign.pricingModel
                  ===
                  'CPC' ? 'Tıklama Başı' : '1000 Gösterim Başı' }})</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₺</span>
                <input
                  v-if="newCampaign.pricingModel === 'CPC'"
                  v-model="newCampaign.maxBidPerClick"
                  type="number"
                  step="0.01"
                  min="0.1"
                  class="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-gray-900"
                >
                <input
                  v-else
                  v-model="newCampaign.maxBidPerMille"
                  type="number"
                  step="0.1"
                  min="1"
                  class="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-gray-900"
                >
              </div>
              <p class="text-[10px] text-gray-500 font-medium">
                Önerilen: {{ newCampaign.pricingModel
                  ===
                  'CPC' ?
                    '₺0.80 - ₺2.50' : '₺15.00 - ₺40.00' }}
              </p>
            </div>

            <div class="space-y-2 md:col-span-2">
              <div class="flex justify-between items-center">
                <label class="text-sm font-bold text-gray-700">Bütçe Esnekliği (Overflow)</label>
                <span class="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded textxs font-bold">%{{
                  newCampaign.budgetOverflow }}</span>
              </div>
              <input
                v-model="newCampaign.budgetOverflow"
                type="range"
                min="0"
                max="50"
                step="5"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              >
              <p class="text-[10px] text-gray-500">
                Talep yüksek olduğunda günlük bütçenizi bu oranda
                aşmaya izin
                verir.
              </p>
            </div>

            <div class="space-y-3 md:col-span-2">
              <label class="text-sm font-bold text-gray-700">Hedef Reklam Alanları</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="slot in availableSlots"
                  :key="slot.id"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
                  :class="newCampaign.targetSlots.includes(slot.id) ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'"
                  @click="toggleSlot(slot.id)"
                >
                  {{ slot.label }}
                </button>
              </div>
            </div>

            <div class="space-y-3 md:col-span-2">
              <label class="text-sm font-bold text-gray-700">Negatif Anahtar Kelimeler
                (Opsiyonel)</label>
              <div class="flex gap-2">
                <input
                  v-model="newNegativeKeyword"
                  type="text"
                  placeholder="Örn: oyuncak, ücretsiz, ikinci el"
                  class="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  @keydown.enter.prevent="addNegativeKeyword"
                >
                <button
                  type="button"
                  class="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all"
                  @click="addNegativeKeyword"
                >
                  Ekle
                </button>
              </div>
              <div
                v-if="newCampaign.negativeKeywords && newCampaign.negativeKeywords.length > 0"
                class="flex flex-wrap gap-2 mt-2"
              >
                <span
                  v-for="(keyword, index) in newCampaign.negativeKeywords"
                  :key="index"
                  class="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-100 flex items-center gap-2"
                >
                  {{ keyword }}
                  <button
                    class="hover:text-red-800"
                    @click="removeNegativeKeyword(index)"
                  >
                    <XMarkIcon class="w-3 h-3" />
                  </button>
                </span>
              </div>
              <p class="text-[10px] text-gray-500">
                Bu kelimeler arandığında reklamınız GÖSTERİLMEZ.
                Bütçenizi
                korumak için kullanın.
              </p>
            </div>

            <!-- Geo-Smart City & District Selector (Campaign) -->
            <div class="space-y-4 md:col-span-2 pt-4 border-t border-gray-100">
              <label
                class="block text-[11px] font-black text-gray-400 uppercase tracking-widest px-2 flex items-center gap-2"
              >
                <MapPinIcon class="w-4 h-4 text-indigo-500" />
                Geo-Smart Şehir Hedefleme
              </label>
              <p class="text-[10px] text-gray-500 font-medium italic px-2">
                Reklamınızın gösterileceği şehirleri seçin. Boş bırakırsanız tüm Türkiye genelinde
                gösterilir.
              </p>

              <!-- City Select -->
              <div class="space-y-2">
                <div
                  ref="campaignCityDropdownRef"
                  class="relative"
                >
                  <div
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer flex items-center justify-between hover:border-indigo-300 transition-all"
                    @click="isCampaignCityDropdownOpen = !isCampaignCityDropdownOpen"
                  >
                    <span
                      v-if="campaignSelectedCities.length === 0"
                      class="text-sm text-gray-400"
                    >Şehir
                      seçin...</span>
                    <span
                      v-else
                      class="text-sm text-gray-700 font-medium"
                    >{{
                      campaignSelectedCities.length }} şehir seçildi</span>
                    <ChevronDownIcon
                      class="w-4 h-4 text-gray-400 transition-transform"
                      :class="{ 'rotate-180': isCampaignCityDropdownOpen }"
                    />
                  </div>
                  <div
                    v-if="isCampaignCityDropdownOpen"
                    class="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-hidden"
                  >
                    <div class="p-2 border-b border-gray-100">
                      <input
                        v-model="campaignCitySearch"
                        type="text"
                        placeholder="Şehir ara..."
                        class="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                    </div>
                    <div class="overflow-y-auto max-h-40 custom-scrollbar">
                      <div
                        v-for="city in filteredCampaignCities"
                        :key="'campaign-city-' + city"
                        class="px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between hover:bg-indigo-50 transition-colors"
                        :class="campaignSelectedCities.includes(city) ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-700'"
                        @click="toggleCampaignCity(city)"
                      >
                        <span>{{ city }}</span>
                        <CheckCircleIcon
                          v-if="campaignSelectedCities.includes(city)"
                          class="w-4 h-4 text-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  v-if="campaignSelectedCities.length > 0"
                  class="flex flex-wrap gap-1.5 mt-1"
                >
                  <span
                    v-for="city in campaignSelectedCities"
                    :key="'campaign-tag-' + city"
                    class="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-[10px] font-bold flex items-center gap-1.5"
                  >
                    {{ city }}
                    <button
                      class="hover:text-red-600"
                      @click="removeCampaignCity(city)"
                    >
                      <XMarkIcon class="w-3 h-3" />
                    </button>
                  </span>
                </div>
              </div>

              <!-- District Select -->
              <div
                v-if="campaignSelectedCities.length > 0"
                class="space-y-2"
              >
                <div
                  ref="campaignDistrictDropdownRef"
                  class="relative"
                >
                  <div
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer flex items-center justify-between hover:border-indigo-300 transition-all"
                    @click="isCampaignDistrictDropdownOpen = !isCampaignDistrictDropdownOpen"
                  >
                    <span
                      v-if="campaignSelectedDistricts.length === 0"
                      class="text-sm text-gray-400"
                    >İlçe
                      seçin...</span>
                    <span
                      v-else
                      class="text-sm text-gray-700 font-medium"
                    >{{
                      campaignSelectedDistricts.length }} ilçe seçildi</span>
                    <ChevronDownIcon
                      class="w-4 h-4 text-gray-400 transition-transform"
                      :class="{ 'rotate-180': isCampaignDistrictDropdownOpen }"
                    />
                  </div>
                  <div
                    v-if="isCampaignDistrictDropdownOpen"
                    class="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-hidden flex flex-col"
                  >
                    <div class="p-2 border-b border-gray-100">
                      <input
                        v-model="campaignDistrictSearch"
                        type="text"
                        placeholder="İlçe ara..."
                        class="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                    </div>
                    <div class="overflow-y-auto max-h-40 custom-scrollbar p-2">
                      <div
                        v-for="city in campaignSelectedCities"
                        :key="'campaign-d-group-' + city"
                        class="mb-3 last:mb-0"
                      >
                        <div class="text-[10px] font-black text-indigo-600 uppercase mb-1 ml-2">
                          {{
                            city }}
                        </div>
                        <div
                          v-for="district in filteredCampaignDistricts(city)"
                          :key="'campaign-dist-' + city + '-' + district"
                          class="px-3 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-indigo-50 rounded-lg transition-colors"
                          :class="campaignSelectedDistricts.includes(district) ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600'"
                          @click="toggleCampaignDistrict(district)"
                        >
                          <span>{{ district }}</span>
                          <CheckCircleIcon
                            v-if="campaignSelectedDistricts.includes(district)"
                            class="w-4 h-4 text-indigo-500"
                          />
                        </div>
                        <div
                          v-if="filteredCampaignDistricts(city).length === 0"
                          class="text-xs text-gray-400 px-2 py-1 italic"
                        >
                          Sonuç bulunamadı
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  v-if="campaignSelectedDistricts.length > 0"
                  class="flex flex-wrap gap-1.5 mt-1"
                >
                  <span
                    v-for="district in campaignSelectedDistricts"
                    :key="'campaign-tag-dist-' + district"
                    class="px-2.5 py-1 bg-white shadow-sm border border-gray-200 text-gray-700 rounded-lg text-[10px] font-medium flex items-center gap-1.5"
                  >
                    {{ district }}
                    <button
                      class="hover:text-red-500 text-gray-400"
                      @click="removeCampaignDistrict(district)"
                    >
                      <XMarkIcon class="w-3 h-3" />
                    </button>
                  </span>
                </div>
              </div>
            </div>

            <div class="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 md:col-span-2">
              <div class="flex items-start gap-3">
                <InfoIcon class="w-5 h-5 text-indigo-600 mt-0.5" />
                <div class="text-xs text-indigo-700 leading-relaxed font-medium">
                  <b class="block mb-1">Kampanya İpucu:</b>
                  Amazon tarzı optimizasyon için en az 3 ürün seçmeniz önerilir. Bütçenizi tıklama
                  başı
                  maliyete (CPC) göre ayarlıyoruz.
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <label class="text-sm font-bold text-gray-700">Reklam Verilecek Ürünler</label>
                <span class="text-xs text-indigo-600 font-bold">{{ selectedProducts.length }} / 3
                  ürün
                  seçildi</span>
              </div>

              <div
                v-if="vendorProducts.length > 0"
                class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar"
              >
                <div
                  v-for="product in vendorProducts"
                  :key="product.id"
                  :class="`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${selectedProducts.includes(product.id) ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white hover:border-indigo-300'}`"
                  @click="toggleProduct(product.id)"
                >
                  <img
                    :src="product.image"
                    class="w-12 h-12 object-cover rounded-lg"
                  >
                  <div class="flex-1 min-w-0">
                    <div class="text-xs font-bold text-gray-900 truncate">
                      {{ product.name }}
                    </div>
                    <div class="text-[10px] text-gray-500 mt-1">
                      Stok: {{ product.stock }} • ₺{{
                        product.price }}
                    </div>
                  </div>
                  <div
                    v-if="selectedProducts.includes(product.id)"
                    class="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white"
                  >
                    <CheckCircleIcon class="w-3 h-3" />
                  </div>
                </div>
              </div>
              <div
                v-else
                class="text-center py-6 bg-gray-50 rounded-xl"
              >
                <ArchiveBoxIcon class="w-8 h-8 text-gray-300 mx-auto" />
                <p class="text-xs text-gray-500 mt-2">
                  Ürün listeniz boş.
                </p>
              </div>
            </div>
          </div>

          <div class="px-8 py-6 bg-gray-50 flex items-center justify-end gap-3">
            <button
              class="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-all"
              @click="isCreateModalOpen = false"
            >
              İptal
            </button>
            <button
              :disabled="!isFormValid || isLoading"
              class="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
              @click="createCampaign"
            >
              <ArrowPathIcon
                v-if="isLoading"
                class="w-5 h-5 animate-spin"
              />
              {{ isLoading ? 'Oluşturuluyor...' : 'Kampanyayı Başlat' }}
            </button>
          </div>
        </div>
      </div>
      <!-- Layout Editor Modal -->
      <div
        v-if="isLayoutModalOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          @click="isLayoutModalOpen = false"
        />
        <div
          class="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-300"
        >
          <div class="p-10">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h3 class="text-2xl font-black text-gray-900 tracking-tight">
                  Yerleşim Düzenleyici
                </h3>
                <p class="text-gray-500 text-sm font-medium">
                  Bu yerleşimde görünecek içerikleri ve
                  görseli
                  seçin.
                </p>
              </div>
              <button
                class="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all"
                @click="isLayoutModalOpen = false"
              >
                <XMarkIcon class="w-6 h-6" />
              </button>
            </div>

            <div class="space-y-6">
              <!-- Status Display -->
              <div
                v-if="layoutForm.id"
                class="px-6 py-4 rounded-3xl border flex items-center justify-between transition-all"
                :class="{
                  'bg-amber-50 border-amber-100 text-amber-700': layoutForm.status === 'PENDING',
                  'bg-green-50 border-green-100 text-green-700': layoutForm.status === 'ENABLED',
                  'bg-red-50 border-red-100 text-red-700': layoutForm.status === 'REJECTED'
                }"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                    :class="{
                      'bg-white/60 text-amber-600': layoutForm.status === 'PENDING',
                      'bg-white/60 text-green-600': layoutForm.status === 'ENABLED',
                      'bg-white/60 text-red-600': layoutForm.status === 'REJECTED'
                    }"
                  >
                    <ClockIcon
                      v-if="layoutForm.status === 'PENDING'"
                      class="w-5 h-5"
                    />
                    <CheckCircleIcon
                      v-else-if="layoutForm.status === 'ENABLED'"
                      class="w-5 h-5"
                    />
                    <XMarkIcon
                      v-else
                      class="w-5 h-5"
                    />
                  </div>
                  <div>
                    <p class="text-[10px] font-black uppercase tracking-widest opacity-60">
                      Yayın
                      Durumu
                    </p>
                    <p class="text-xs font-black">
                      {{ layoutForm.status === 'PENDING' ? 'ONAY BEKLİYOR' : (layoutForm.status
                        ===
                        'ENABLED' ? 'YAYINDA' : 'REDDEDİLDİ') }}
                    </p>
                  </div>
                </div>
                <div
                  v-if="layoutForm.status === 'REJECTED' && layoutForm.rejectionReason"
                  class="text-right"
                >
                  <p class="text-[10px] font-black uppercase tracking-widest opacity-60">
                    Red Nedeni
                  </p>
                  <p class="text-xs font-medium">
                    {{ layoutForm.rejectionReason }}
                  </p>
                </div>
              </div>
              <input
                ref="fileInput"
                type="file"
                class="hidden"
                accept="image/*"
                @change="handleFileUpload"
              >
              <div
                class="bg-gray-50 rounded-3xl p-8 border border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-indigo-300 transition-all relative overflow-hidden"
                @click="$refs.fileInput.click()"
              >
                <img
                  v-if="layoutForm.imageUrl"
                  :src="layoutForm.imageUrl"
                  class="absolute inset-0 w-full h-full object-cover opacity-20"
                >
                <div
                  class="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform"
                >
                  <CloudArrowUpIcon
                    class="w-8 h-8 text-indigo-500 group-hover:scale-110 transition-transform"
                  />
                </div>
                <div class="text-center relative z-10">
                  <p class="text-sm font-black text-gray-900">
                    {{ layoutForm.imageUrl ?
                      'Görsel Değiştir'
                      : 'Görsel Yükleyin' }}
                  </p>
                  <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    Önerilen:
                    1920x400px • Max 2MB
                  </p>
                </div>
                <div
                  v-if="isUploading"
                  class="absolute inset-0 bg-white/80 flex items-center justify-center z-20"
                >
                  <CircleNotchIcon class="w-8 h-8 animate-spin text-indigo-600" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <button
                  :class="`p-4 rounded-2xl border transition-all text-xs font-bold ${layoutForm.template === 'A' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-4 ring-indigo-50 font-black' : 'bg-gray-50 border-gray-100 text-gray-400 italic'}`"
                  @click="layoutForm.template = 'A'"
                >
                  Şablon A: Klasik Banner
                </button>
                <button
                  :class="`p-4 rounded-2xl border transition-all text-xs font-bold ${layoutForm.template === 'B' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-4 ring-indigo-50 font-black' : 'bg-gray-50 border-gray-100 text-gray-400 italic'}`"
                  @click="layoutForm.template = 'B'"
                >
                  Şablon B: Modern Vitrin
                </button>
              </div>

              <div class="space-y-4 pt-4 border-t border-gray-100">
                <label
                  class="block text-[11px] font-black text-gray-400 uppercase tracking-widest px-2"
                >Yönlendirme
                  Linki</label>
                <div class="relative">
                  <LinkIcon class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    v-model="layoutForm.linkUrl"
                    type="text"
                    placeholder="https://sanayitakas.com/magaza/..."
                    class="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all text-sm font-medium"
                  >
                </div>
              </div>

              <!-- Geo-Smart City & District Selector (Layout) -->
              <div class="space-y-4 pt-4 border-t border-gray-100">
                <label
                  class="block text-[11px] font-black text-gray-400 uppercase tracking-widest px-2 flex items-center gap-2"
                >
                  <MapPinIcon class="w-4 h-4 text-indigo-500" />
                  Geo-Smart Şehir Hedefleme
                </label>
                <p class="text-[10px] text-gray-500 font-medium italic px-2">
                  Reklamınızın gösterileceği şehirleri seçin. Boş bırakırsanız tüm pilot
                  bölgelerde
                  gösterilir.
                </p>

                <!-- City Select -->
                <div class="space-y-2">
                  <div
                    ref="layoutCityDropdownRef"
                    class="relative"
                  >
                    <div
                      class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer flex items-center justify-between hover:border-indigo-300 transition-all"
                      @click="isLayoutCityDropdownOpen = !isLayoutCityDropdownOpen"
                    >
                      <span
                        v-if="layoutSelectedCities.length === 0"
                        class="text-sm text-gray-400"
                      >Şehir
                        seçin...</span>
                      <span
                        v-else
                        class="text-sm text-gray-700 font-medium"
                      >{{
                        layoutSelectedCities.length }} şehir seçildi</span>
                      <ChevronDownIcon
                        class="w-4 h-4 text-gray-400 transition-transform"
                        :class="{ 'rotate-180': isLayoutCityDropdownOpen }"
                      />
                    </div>
                    <div
                      v-if="isLayoutCityDropdownOpen"
                      class="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-hidden"
                    >
                      <div class="p-2 border-b border-gray-100">
                        <input
                          v-model="layoutCitySearch"
                          type="text"
                          placeholder="Şehir ara..."
                          class="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                      </div>
                      <div class="overflow-y-auto max-h-40 custom-scrollbar">
                        <div
                          v-for="city in filteredLayoutCities"
                          :key="'layout-city-' + city"
                          class="px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between hover:bg-indigo-50 transition-colors"
                          :class="layoutSelectedCities.includes(city) ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-700'"
                          @click="toggleLayoutCity(city)"
                        >
                          <span>{{ city }}</span>
                          <CheckCircleIcon
                            v-if="layoutSelectedCities.includes(city)"
                            class="w-4 h-4 text-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    v-if="layoutSelectedCities.length > 0"
                    class="flex flex-wrap gap-1.5 mt-1"
                  >
                    <span
                      v-for="city in layoutSelectedCities"
                      :key="'layout-tag-' + city"
                      class="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-[10px] font-bold flex items-center gap-1.5"
                    >
                      {{ city }}
                      <button
                        class="hover:text-red-600"
                        @click="removeLayoutCity(city)"
                      >
                        <XMarkIcon class="w-3 h-3" />
                      </button>
                    </span>
                  </div>
                </div>

                <!-- District Select -->
                <div
                  v-if="layoutSelectedCities.length > 0"
                  class="space-y-2"
                >
                  <div
                    ref="layoutDistrictDropdownRef"
                    class="relative"
                  >
                    <div
                      class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer flex items-center justify-between hover:border-indigo-300 transition-all"
                      @click="isLayoutDistrictDropdownOpen = !isLayoutDistrictDropdownOpen"
                    >
                      <span
                        v-if="layoutSelectedDistricts.length === 0"
                        class="text-sm text-gray-400"
                      >İlçe
                        seçin (boş bırakırsanız tüm
                        ilçeler)...</span>
                      <span
                        v-else
                        class="text-sm text-gray-700 font-medium"
                      >{{
                        layoutSelectedDistricts.length }} ilçe seçildi</span>
                      <ChevronDownIcon
                        class="w-4 h-4 text-gray-400 transition-transform"
                        :class="{ 'rotate-180': isLayoutDistrictDropdownOpen }"
                      />
                    </div>
                    <div
                      v-if="isLayoutDistrictDropdownOpen"
                      class="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-hidden"
                    >
                      <div class="p-2 border-b border-gray-100">
                        <input
                          v-model="layoutDistrictSearch"
                          type="text"
                          placeholder="İlçe ara..."
                          class="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                      </div>
                      <div class="overflow-y-auto max-h-40 custom-scrollbar">
                        <template
                          v-for="city in layoutSelectedCities"
                          :key="'layout-dist-group-' + city"
                        >
                          <div
                            class="px-4 py-1.5 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky top-0"
                          >
                            {{ city }}
                          </div>
                          <div
                            v-for="district in filteredLayoutDistricts(city)"
                            :key="'layout-dist-' + city + '-' + district"
                            class="px-4 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-indigo-50 transition-colors pl-6"
                            :class="layoutSelectedDistricts.includes(district + ' (' + city + ')') ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-700'"
                            @click="toggleLayoutDistrict(district + ' (' + city + ')')"
                          >
                            <span>{{ district }}</span>
                            <CheckCircleIcon
                              v-if="layoutSelectedDistricts.includes(district + ' (' + city + ')')"
                              class="w-4 h-4 text-indigo-500"
                            />
                          </div>
                        </template>
                      </div>
                    </div>
                  </div>
                  <div
                    v-if="layoutSelectedDistricts.length > 0"
                    class="flex flex-wrap gap-1.5 mt-1"
                  >
                    <span
                      v-for="d in layoutSelectedDistricts"
                      :key="'layout-dtag-' + d"
                      class="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-[10px] font-bold flex items-center gap-1.5"
                    >
                      {{ d }}
                      <button
                        class="hover:text-red-600"
                        @click="removeLayoutDistrict(d)"
                      >
                        <XMarkIcon class="w-3 h-3" />
                      </button>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-4 mt-10">
              <button
                class="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                @click="isLayoutModalOpen = false"
              >
                Vazgeç
              </button>
              <button
                :disabled="isSaving || !layoutForm.imageUrl"
                class="flex-[2] py-4 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-200/50 disabled:opacity-50"
                @click="saveLayout"
              >
                {{ isSaving ? 'Kaydediliyor...' : 'Ayarları Kaydet' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ad-Swap Report Modal -->
    <div
      v-if="isReportModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        @click="isReportModalOpen = false"
      />
      <div
        class="relative bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div
          class="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-white"
        >
          <div>
            <h3 class="text-xl font-black text-gray-900 flex items-center gap-2">
              <GiftIcon class="w-6 h-6 text-orange-500" />
              AD-SWAP DAĞITIM RAPORU
            </h3>
            <p class="text-xs text-gray-500 mt-1 font-medium">
              Bu kampanya kapsamında dağıtılan bedava
              ürünler
              (kuponlar)
            </p>
          </div>
          <button
            class="p-2 hover:bg-white rounded-xl transition-colors"
            @click="isReportModalOpen = false"
          >
            <XMarkIcon class="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <div class="p-6 overflow-y-auto flex-1 bg-gray-50">
          <div
            v-if="reportLoading"
            class="flex justify-center py-12"
          >
            <ArrowPathIcon class="w-8 h-8 animate-spin text-orange-500" />
          </div>
          <div
            v-else-if="reportCoupons.length === 0"
            class="text-center py-12 bg-white rounded-2xl border border-gray-100"
          >
            <PackageIcon class="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h4 class="text-lg font-bold text-gray-600">
              Henüz dağıtım yapılmamış
            </h4>
            <p class="text-gray-400 text-sm mt-2">
              Promosyon motoru çalıştıkça ürünleriniz hedef kitleye
              ulaştırılacaktır.
            </p>
          </div>
          <div
            v-else
            class="space-y-4"
          >
            <div
              v-for="coupon in reportCoupons"
              :key="coupon.id"
              class="bg-white p-4 rounded-xl border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between hover:shadow-md transition-shadow"
            >
              <div class="flex items-center gap-4 w-full sm:w-auto">
                <div
                  class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600"
                >
                  <GiftIcon class="w-6 h-6" />
                </div>
                <div>
                  <div class="text-sm font-bold text-gray-900 line-clamp-1">
                    {{
                      coupon.listing?.name ||
                        'Ürün Bilinmiyor' }}
                  </div>
                  <div class="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <MapPinIcon class="w-3 h-3 text-gray-400" />
                    {{ coupon.user?.city || 'Şehir Yok' }}
                    <span class="mx-1">•</span>
                    <UserIcon class="w-3 h-3 text-gray-400" />
                    {{ coupon.user?.name || 'Anonim' }}
                  </div>
                </div>
              </div>
              <div
                class="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0 mt-3 sm:mt-0"
              >
                <div class="text-right">
                  <div class="text-xs font-black text-gray-400 uppercase tracking-wider mb-0.5">
                    TUTAR
                  </div>
                  <div class="text-sm font-bold text-orange-600">
                    {{
                      formatCurrency(coupon.rewardValue)
                    }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-xs font-black text-gray-400 uppercase tracking-wider mb-0.5">
                    DURUM
                  </div>
                  <div
                    :class="['text-[10px] font-bold px-2 py-1 rounded-md', coupon.status === 'REDEEMED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700']"
                  >
                    {{ coupon.status === 'REDEEMED' ? 'KULLANILDI' : 'BEKLEYEN' }}
                  </div>
                </div>
                <div class="text-right hidden sm:block">
                  <div class="text-xs font-black text-gray-400 uppercase tracking-wider mb-0.5">
                    TARİH
                  </div>
                  <div class="text-xs font-medium text-gray-700">
                    {{ formatDate(coupon.createdAt)
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const ads = useAds()
const { $toast } = useNuxtApp()

definePageMeta({
    layout: 'vendor',
    middleware: 'vendor'
})

// State
const adCampaigns = ref([])
const vendorProducts = ref([])
const currentTab = ref('HEPSİ')
const summary = ref({
    impressions: 0,
    clicks: 0,
    spend: 0,
    sales: 0,
    orders: 0,
    ctr: 0,
    cpc: 0,
    roas: 0
})

const isCreateModalOpen = ref(false)
const isLoading = ref(false)
const selectedProducts = ref([])
const newCampaign = ref({
    name: '',
    type: 'SPONSORED_PRODUCT',
    budget: 50,
    startDate: new Date().toISOString().split('T')[0],
    endDate: null,
    pricingModel: 'CPC',
    maxBidPerClick: 0.5,
    maxBidPerMille: 5.0,
    budgetOverflow: 10,
    targetSlots: [],
    platform: 'BAZARX'
})

// Ad-Swap State - moved up for visibility and initialization
const isAdSwapModalOpen = ref(false)
const isSwapLoading = ref(false)
const swapCampaign = ref({
    name: '',
    adPackage: 'SILVER',
    campaignType: 'REWARD_DISTRIBUTION',
    platform: 'BAZARX',
    targetSlots: [],
    productIds: []
})

const availableSlots = [
    { id: 'SEARCH_TOP', label: 'Arama Sonuçları (Üst)' },
    { id: 'SEARCH_SIDEBAR', label: 'Arama Yan Panel' },
    { id: 'CATEGORY_BANNER', label: 'Kategori Banner' },
    { id: 'PRODUCT_SIMILAR', label: 'Benzer Ürünler' },
    { id: 'HOMEPAGE_FEATURED', label: 'Anasayfa Öne Çıkan' },
    { id: 'CART_UPSELL', label: 'Sepet Önerileri' },
    { id: 'PERSONALIZED_FEED', label: 'Kişiselleştirilmiş Akış' },
    { id: 'SPECIAL_OFFER_SPOT', label: 'Özel Fırsat Spotu' },
    { id: 'FLASH_PRODUCTS', label: 'Flaş Ürünler' },
    { id: 'SANA_OZEL', label: 'Sana Özel Tercihler' },
    { id: 'PERFORMANCE_VITRIN', label: 'Performans Vitrini' },
    { id: 'HOME_BANNER', label: 'Anasayfa Ana Banner' },
    { id: 'SIDE_ADS', label: 'Yan Reklamlar' }
]

const toggleSlot = (id) => {
    const idx = newCampaign.value.targetSlots.indexOf(id)
    if (idx === -1) {
        newCampaign.value.targetSlots.push(id)
    } else {
        newCampaign.value.targetSlots.splice(idx, 1)
    }
}

const toggleSwapSlot = (id) => {
    const idx = swapCampaign.value.targetSlots.indexOf(id)
    if (idx === -1) {
        swapCampaign.value.targetSlots.push(id)
    } else {
        swapCampaign.value.targetSlots.splice(idx, 1)
    }
}

// Computed Stats for Cards
const filteredAds = computed(() => {
    if (currentTab.value === 'AKTİF') return adCampaigns.value.filter(a => a.status === 'ENABLED')
    if (currentTab.value === 'DURAKLATILDI') return adCampaigns.value.filter(a => a.status === 'PAUSED')
    return adCampaigns.value
})

import {
    EyeIcon,
    CursorArrowRaysIcon as MouseIcon,
    CreditCardIcon,
    RocketLaunchIcon,
    ListBulletIcon,
    TrashIcon,
    MegaphoneIcon,
    XMarkIcon,
    InformationCircleIcon as InfoIcon,
    CheckCircleIcon,
    ArchiveBoxIcon,
    ArchiveBoxIcon as PackageIcon,
    ArrowPathIcon,
    ArrowPathIcon as CircleNotchIcon,
    CloudArrowUpIcon,
    LinkIcon,
    SparklesIcon,
    PlusIcon,
    ArrowTrendingUpIcon,
    MapPinIcon,
    UserIcon,
    MinusIcon,
    RectangleStackIcon,
    ComputerDesktopIcon,
    BuildingStorefrontIcon,
    GiftIcon,
    ChevronDownIcon
} from '@heroicons/vue/24/outline'

import { iller } from '~/assets/css/data/component/iller'

// Geo-Smart City/District State — Campaign Modal
const allCityNames = Object.keys(iller).sort((a, b) => a.localeCompare(b, 'tr'))

const campaignSelectedCities = ref([])
const campaignSelectedDistricts = ref([])
const isCampaignCityDropdownOpen = ref(false)
const isCampaignDistrictDropdownOpen = ref(false)
const campaignCitySearch = ref('')
const campaignDistrictSearch = ref('')
const campaignCityDropdownRef = ref(null)
const campaignDistrictDropdownRef = ref(null)

const filteredCampaignCities = computed(() => {
    if (!campaignCitySearch.value) return allCityNames
    const q = campaignCitySearch.value.toLowerCase()
    return allCityNames.filter(c => c.toLowerCase().includes(q))
})

const filteredCampaignDistricts = (city) => {
    const districts = iller[city] || []
    if (!campaignDistrictSearch.value) return districts
    const q = campaignDistrictSearch.value.toLowerCase()
    return districts.filter(d => d.toLowerCase().includes(q))
}

const toggleCampaignCity = (city) => {
    const idx = campaignSelectedCities.value.indexOf(city)
    if (idx === -1) {
        campaignSelectedCities.value.push(city)
    } else {
        campaignSelectedCities.value.splice(idx, 1)
        // Remove related districts
        campaignSelectedDistricts.value = campaignSelectedDistricts.value.filter(d => !d.endsWith('(' + city + ')'))
    }
}
const removeCampaignCity = (city) => toggleCampaignCity(city)

const toggleCampaignDistrict = (districtLabel) => {
    const idx = campaignSelectedDistricts.value.indexOf(districtLabel)
    if (idx === -1) campaignSelectedDistricts.value.push(districtLabel)
    else campaignSelectedDistricts.value.splice(idx, 1)
}
const removeCampaignDistrict = (d) => {
    campaignSelectedDistricts.value = campaignSelectedDistricts.value.filter(x => x !== d)
}

// Geo-Smart City/District State — Ad-Swap Modal
const swapSelectedCities = ref([])
const swapSelectedDistricts = ref([])
const isSwapCityDropdownOpen = ref(false)
const isSwapDistrictDropdownOpen = ref(false)
const swapCitySearch = ref('')
const swapDistrictSearch = ref('')
const swapCityDropdownRef = ref(null)
const swapDistrictDropdownRef = ref(null)

const filteredSwapCities = computed(() => {
    if (!swapCitySearch.value) return allCityNames
    const q = swapCitySearch.value.toLowerCase()
    return allCityNames.filter(c => c.toLowerCase().includes(q))
})

const filteredSwapDistricts = (city) => {
    const districts = iller[city] || []
    if (!swapDistrictSearch.value) return districts
    const q = swapDistrictSearch.value.toLowerCase()
    return districts.filter(d => d.toLowerCase().includes(q))
}

const toggleSwapCity = (city) => {
    const idx = swapSelectedCities.value.indexOf(city)
    if (idx === -1) {
        swapSelectedCities.value.push(city)
    } else {
        swapSelectedCities.value.splice(idx, 1)
        swapSelectedDistricts.value = swapSelectedDistricts.value.filter(d => !d.endsWith('(' + city + ')'))
    }
}
const removeSwapCity = (city) => toggleSwapCity(city)

const toggleSwapDistrict = (districtLabel) => {
    const idx = swapSelectedDistricts.value.indexOf(districtLabel)
    if (idx === -1) swapSelectedDistricts.value.push(districtLabel)
    else swapSelectedDistricts.value.splice(idx, 1)
}
const removeSwapDistrict = (d) => {
    swapSelectedDistricts.value = swapSelectedDistricts.value.filter(x => x !== d)
}


// Geo-Smart City/District State — Layout Modal
const layoutSelectedCities = ref([])
const layoutSelectedDistricts = ref([])
const isLayoutCityDropdownOpen = ref(false)
const isLayoutDistrictDropdownOpen = ref(false)
const layoutCitySearch = ref('')
const layoutDistrictSearch = ref('')
const layoutCityDropdownRef = ref(null)
const layoutDistrictDropdownRef = ref(null)

const filteredLayoutCities = computed(() => {
    if (!layoutCitySearch.value) return allCityNames
    const q = layoutCitySearch.value.toLowerCase()
    return allCityNames.filter(c => c.toLowerCase().includes(q))
})

const filteredLayoutDistricts = (city) => {
    const districts = iller[city] || []
    if (!layoutDistrictSearch.value) return districts
    const q = layoutDistrictSearch.value.toLowerCase()
    return districts.filter(d => d.toLowerCase().includes(q))
}

const toggleLayoutCity = (city) => {
    const idx = layoutSelectedCities.value.indexOf(city)
    if (idx === -1) {
        layoutSelectedCities.value.push(city)
    } else {
        layoutSelectedCities.value.splice(idx, 1)
        layoutSelectedDistricts.value = layoutSelectedDistricts.value.filter(d => !d.endsWith('(' + city + ')'))
    }
}
const removeLayoutCity = (city) => toggleLayoutCity(city)

const toggleLayoutDistrict = (districtLabel) => {
    const idx = layoutSelectedDistricts.value.indexOf(districtLabel)
    if (idx === -1) layoutSelectedDistricts.value.push(districtLabel)
    else layoutSelectedDistricts.value.splice(idx, 1)
}
const removeLayoutDistrict = (d) => {
    layoutSelectedDistricts.value = layoutSelectedDistricts.value.filter(x => x !== d)
}

// Close dropdowns on outside click
const handleClickOutside = (e) => {
    if (campaignCityDropdownRef.value && !campaignCityDropdownRef.value.contains(e.target)) isCampaignCityDropdownOpen.value = false
    if (campaignDistrictDropdownRef.value && !campaignDistrictDropdownRef.value.contains(e.target)) isCampaignDistrictDropdownOpen.value = false
    if (swapCityDropdownRef.value && !swapCityDropdownRef.value.contains(e.target)) isSwapCityDropdownOpen.value = false
    if (swapDistrictDropdownRef.value && !swapDistrictDropdownRef.value.contains(e.target)) isSwapDistrictDropdownOpen.value = false
    if (layoutCityDropdownRef.value && !layoutCityDropdownRef.value.contains(e.target)) isLayoutCityDropdownOpen.value = false
    if (layoutDistrictDropdownRef.value && !layoutDistrictDropdownRef.value.contains(e.target)) isLayoutDistrictDropdownOpen.value = false
}
onMounted(() => { document.addEventListener('click', handleClickOutside) })
onUnmounted(() => { document.removeEventListener('click', handleClickOutside) })

const summaryStats = computed(() => [
    { label: 'GÖSTERİM', value: formatNumber(summary.value.impressions), icon: EyeIcon, color: 'indigo', trend: 1 },
    { label: 'TIKLAMA', value: formatNumber(summary.value.clicks), icon: MouseIcon, color: 'purple', trend: 1 },
    { label: 'HARCAMA', value: '₺' + formatCurrency(summary.value.spend), icon: CreditCardIcon, color: 'pink', trend: 1 },
    { label: 'ROAS', value: (summary.value.roas || 0).toFixed(2) + 'x', icon: RocketLaunchIcon, color: 'green', trend: 1 }
])

const isFormValid = computed(() => {
    return newCampaign.value.name && newCampaign.value.budget > 0 && selectedProducts.value.length > 0
})

const isLayoutModalOpen = ref(false)
const selectedLayoutType = ref(1)
const isUploading = ref(false)
const isSaving = ref(false)
const layoutForm = ref({
    id: null,
    imageUrl: '',
    linkUrl: '',
    template: 'A'
})

const openLayoutModal = async (type) => {
    isCreateModalOpen.value = false
    isAdSwapModalOpen.value = false
    selectedLayoutType.value = type
    layoutForm.value = { id: null, imageUrl: '', linkUrl: '', template: 'A' }
    layoutSelectedCities.value = []
    layoutSelectedDistricts.value = []

    // Fetch existing banner if any
    try {
        const res = await ads.fetchBanners({ type })
        if (res.success && res.data.length > 0) {
            const existing = res.data[0]
            layoutForm.value = {
                id: existing.id,
                imageUrl: existing.imageUrl,
                linkUrl: existing.linkUrl || '',
                template: existing.template || 'A',
                status: existing.status,
                rejectionReason: existing.rejectionReason
            }
            // Parse targeting if exists
            try {
                if (existing.targetCities) {
                    layoutSelectedCities.value = typeof existing.targetCities === 'string'
                        ? JSON.parse(existing.targetCities)
                        : existing.targetCities
                }
                if (existing.targetDistricts) {
                    layoutSelectedDistricts.value = typeof existing.targetDistricts === 'string'
                        ? JSON.parse(existing.targetDistricts)
                        : existing.targetDistricts
                }
            } catch (pErr) {
                console.error('Error parsing banner targeting:', pErr)
            }
        }
    } catch (err) {
        console.error('Error fetching banner:', err)
    }
    isLayoutModalOpen.value = true
}

const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    isUploading.value = true
    try {
        const res = await ads.uploadBanner(file)
        if (res.success) {
            layoutForm.value.imageUrl = res.url
            $toast.success('Görsel yüklendi')
        }
    } catch (err) {
        $toast.error('Yükleme başarısız')
    } finally {
        isUploading.value = false
    }
}

const saveLayout = async () => {
    if (!layoutForm.value.imageUrl) return

    isSaving.value = true
    try {
        let res
        const payload = {
            imageUrl: layoutForm.value.imageUrl,
            linkUrl: layoutForm.value.linkUrl,
            template: layoutForm.value.template,
            type: selectedLayoutType.value,
            targetCities: layoutSelectedCities.value,
            targetDistricts: layoutSelectedDistricts.value
        }

        if (layoutForm.value.id) {
            res = await ads.updateBanner(layoutForm.value.id, payload)
        } else {
            res = await ads.createBanner(payload)
        }

        if (res.success) {
            $toast.success('Düzen ayarları başarıyla kaydedildi!')
            isLayoutModalOpen.value = false
        }
    } catch (err) {
        $toast.error('Kaydedilemedi')
    } finally {
        isSaving.value = false
    }
}

// Actions
const fetchData = async () => {
    try {
        const { $api } = useApi()
        const [adsRes, summaryRes, productsRes] = await Promise.all([
            ads.fetchAds(),
            ads.getAdSummary(30),
            $api('/api/vendors/products', {
                params: { limit: 500 }
            })
        ])

        if (adsRes.success) adCampaigns.value = adsRes.data
        if (summaryRes.success) summary.value = summaryRes.data.summary
        if (productsRes.success) {
            vendorProducts.value = productsRes.data.map(p => ({
                ...p,
                image: p.image || p.visual1 || 'https://placehold.co/100x100?text=Ürün'
            }))
        }
    } catch (err) {
        console.error('Fetch ads error:', err)
    }
}

const campaignFile = ref(null)
const campaignImagePreview = ref(null)

const swapFile = ref(null)
const swapImagePreview = ref(null)

const handleCampaignFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Check size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        $toast.error('Dosya boyutu çok büyük (Max 5MB)')
        return
    }

    campaignFile.value = file
    campaignImagePreview.value = URL.createObjectURL(file)
}

const handleSwapFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Check size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        $toast.error('Dosya boyutu çok büyük (Max 5MB)')
        return
    }

    swapFile.value = file
    swapImagePreview.value = URL.createObjectURL(file)
}

const clearCampaignFile = () => {
    campaignFile.value = null
    campaignImagePreview.value = null
}

const clearSwapFile = () => {
    swapFile.value = null
    swapImagePreview.value = null
}

const openCreateModal = () => {
    isAdSwapModalOpen.value = false
    clearCampaignFile()
    campaignSelectedCities.value = []
    campaignSelectedDistricts.value = []
    campaignCitySearch.value = ''
    campaignDistrictSearch.value = ''
    newCampaign.value = {
        name: '',
        type: 'SPONSORED_PRODUCT',
        budget: 50,
        startDate: new Date().toISOString().split('T')[0],
        endDate: null,
        pricingModel: 'CPC',
        maxBidPerClick: 0.5,
        maxBidPerMille: 5.0,
        budgetOverflow: 10,
        targetSlots: [],
        platform: 'BAZARX',
        negativeKeywords: []
    }
    selectedProducts.value = []
    isCreateModalOpen.value = true
}

const newNegativeKeyword = ref('')

const addNegativeKeyword = () => {
    if (!newNegativeKeyword.value) return
    const keyword = newNegativeKeyword.value.trim()
    if (keyword && !newCampaign.value.negativeKeywords) {
        newCampaign.value.negativeKeywords = []
    }
    if (keyword && !newCampaign.value.negativeKeywords.includes(keyword)) {
        newCampaign.value.negativeKeywords.push(keyword)
    }
    newNegativeKeyword.value = ''
}

const removeNegativeKeyword = (index) => {
    if (newCampaign.value.negativeKeywords) {
        newCampaign.value.negativeKeywords.splice(index, 1)
    }
}

const toggleProduct = (id) => {
    const index = selectedProducts.value.indexOf(id)
    if (index === -1) {
        if (selectedProducts.value.length < 10) selectedProducts.value.push(id)
        else $toast.warning('En fazla 10 ürün seçebilirsiniz.')
    } else {
        selectedProducts.value.splice(index, 1)
    }
}

const createCampaign = async () => {
    if (!isFormValid.value) return
    isLoading.value = true
    try {
        // Build city + district arrays
        const cityArray = campaignSelectedCities.value.length > 0 ? [...campaignSelectedCities.value] : []
        const districtArray = campaignSelectedDistricts.value.length > 0 ? [...campaignSelectedDistricts.value] : []

        // Use FormData for multipart/form-data upload
        const formData = new FormData()

        // Add basic fields
        formData.append('name', newCampaign.value.name)
        formData.append('type', newCampaign.value.type || 'SPONSORED_PRODUCT')
        formData.append('budget', newCampaign.value.budget)
        formData.append('startDate', newCampaign.value.startDate)
        if (newCampaign.value.endDate) formData.append('endDate', newCampaign.value.endDate)

        formData.append('pricingModel', newCampaign.value.pricingModel || 'CPC')
        formData.append('maxBidPerClick', newCampaign.value.maxBidPerClick || 0.5)
        formData.append('maxBidPerMille', newCampaign.value.maxBidPerMille || 5.0)
        formData.append('budgetOverflow', newCampaign.value.budgetOverflow || 10)
        formData.append('platform', newCampaign.value.platform || 'BAZARX')

        // Arrays need careful serialization for multipart
        formData.append('productIds', JSON.stringify(selectedProducts.value))
        formData.append('targetSlots', JSON.stringify(newCampaign.value.targetSlots))
        formData.append('targetCities', JSON.stringify(cityArray))
        formData.append('targetDistricts', JSON.stringify(districtArray))
        formData.append('negativeKeywords', JSON.stringify(newCampaign.value.negativeKeywords || []))

        // Add the file if selected
        if (campaignFile.value) {
            formData.append('file', campaignFile.value)
        }

        const res = await ads.createAdCampaign(formData)

        if (res.success) {
            $toast.success('Kampanya başarıyla oluşturuldu!')
            isCreateModalOpen.value = false
            clearCampaignFile()
            fetchData()
        }
    } catch (err) {
        $toast.error('Kampanya oluşturulurken bir hata oluştu.')
        console.error(err)
    } finally {
        isLoading.value = false
    }
}

const toggleStatus = async (ad) => {
    const newStatus = ad.status === 'ENABLED' ? 'PAUSED' : 'ENABLED'
    try {
        await ads.updateAdCampaign(ad.id, { status: newStatus })
        ad.status = newStatus
        $toast.success('Durum güncellendi')
    } catch (err) {
        $toast.error('Güncelleme başarısız')
    }
}

// ---- Ad-Swap Logic ----

const openAdSwapModal = () => {
    isCreateModalOpen.value = false
    clearSwapFile()
    swapSelectedCities.value = []
    swapSelectedDistricts.value = []
    swapCitySearch.value = ''
    swapDistrictSearch.value = ''
    swapCampaign.value = {
        name: '',
        adPackage: 'SILVER',
        campaignType: 'REWARD_DISTRIBUTION',
        platform: 'BAZARX',
        targetSlots: [],
        productIds: []
    }
    isAdSwapModalOpen.value = true
}

const toggleSwapProduct = (id) => {
    const idx = swapCampaign.value.productIds.indexOf(id)
    if (idx === -1) swapCampaign.value.productIds.push(id)
    else swapCampaign.value.productIds.splice(idx, 1)
}

const isSwapFormValid = computed(() => {
    // Both Name, Campaign Type and at least 1 Product must be selected
    const basicValid = (swapCampaign.value.name || '').trim() !== '' &&
        swapCampaign.value.productIds.length > 0 &&
        swapCampaign.value.campaignType

    // If HOME_BANNER or SIDE_ADS selected, require a file
    const needsImage = (swapCampaign.value.targetSlots || []).some(s => ['HOME_BANNER', 'SIDE_ADS'].includes(s))
    if (needsImage && !swapFile.value) return false

    return basicValid
})

const createAdSwapCampaign = async () => {
    if (!isSwapFormValid.value) return
    isSwapLoading.value = true
    try {
        const { $api } = useApi()

        // Build city + district arrays from dropdown selections
        const citiesArray = swapSelectedCities.value.length > 0 ? [...swapSelectedCities.value] : []
        const districtsArray = swapSelectedDistricts.value.length > 0 ? [...swapSelectedDistricts.value] : []

        // Use FormData for multipart/form-data upload
        const formData = new FormData()

        formData.append('name', swapCampaign.value.name)
        formData.append('adPackage', swapCampaign.value.adPackage)
        formData.append('platform', swapCampaign.value.platform)
        formData.append('campaignType', swapCampaign.value.campaignType)
        formData.append('targetSlots', JSON.stringify(swapCampaign.value.targetSlots))
        formData.append('productIdsToDistribute', JSON.stringify(swapCampaign.value.productIds))
        formData.append('targetCities', JSON.stringify(citiesArray))
        formData.append('targetDistricts', JSON.stringify(districtsArray))
        formData.append('targetUrl', swapCampaign.value.targetUrl || '')

        // Add the file if selected
        if (swapFile.value) {
            formData.append('file', swapFile.value)
        }

        const res = await $api('/api/vendor-ads/ad-swap', {
            method: 'POST',
            body: formData
        })

        if (res.success) {
            $toast.success(res.message || 'Ad-Swap Kampanyası başarıyla başlatıldı!')
            isAdSwapModalOpen.value = false
            clearSwapFile()
            // Optional: call the activate endpoint right away so it becomes active
            await $api(`/api/vendor-ads/${res.data.id}/activate`, { method: 'POST' })
            fetchData()
        } else {
            $toast.error(res.error || 'Kampanya oluşturulamadı.')
        }
    } catch (err) {
        console.error('Ad-Swap creation error:', err)
        $toast.error('Bağlantı hatası.')
    } finally {
        isSwapLoading.value = false
    }
}

const deleteAd = async (id) => {
    if (!confirm('Bu kampanyayı silmek istediğinize emin misiniz?')) return
    try {
        const res = await ads.deleteAdCampaign(id)
        if (res.success) {
            $toast.success('Kampanya silindi.')
            fetchData()
        }
    } catch (err) {
        $toast.error('Silme işlemi başarısız.')
    }
}

const seedDemo = async () => {
    try {
        const res = await ads.seedDemoAds()
        if (res.success) {
            $toast.success('Demo verileri oluşturuldu!')
            fetchData()
        }
    } catch (err) {
        $toast.error('Hata oluştu.')
    }
}

// ---- Ad-Swap Report Logic ----
const isReportModalOpen = ref(false)
const reportCoupons = ref([])
const reportLoading = ref(false)
const activeReportCampaign = ref(null)

const openReport = async (campaign) => {
    activeReportCampaign.value = campaign
    isReportModalOpen.value = true
    reportLoading.value = true
    reportCoupons.value = []

    try {
        const { $api } = useNuxtApp()
        const res = await $api(`/api/vendor-ads/${campaign.id}/report`)
        if (res.success) {
            reportCoupons.value = res.data
        } else {
            useNuxtApp().$toast.error('Rapor yüklenemedi.')
        }
    } catch (err) {
        console.error('Report fetch error:', err)
        useNuxtApp().$toast.error('Rapor yüklenemedi.')
    } finally {
        reportLoading.value = false
    }
}

// Helpers
const formatNumber = (num) => new Intl.NumberFormat('tr-TR').format(num || 0)
const formatCurrency = (amount) => {
    return ((amount || 0) / 100).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
const formatDate = (date) => new Date(date).toLocaleDateString('tr-TR')

const getMetricTotal = (ad, key) => {
    return ad.metrics?.reduce((sum, m) => sum + (m[key] || 0), 0) || 0
}

const formatCTR = (ad) => {
    const clicks = getMetricTotal(ad, 'clicks')
    const impressions = getMetricTotal(ad, 'impressions')
    if (impressions === 0) return '0.00'
    return ((clicks / impressions) * 100).toFixed(2)
}

const formatROAS = (ad) => {
    const sales = getMetricTotal(ad, 'sales')
    const spend = getMetricTotal(ad, 'spend')
    if (spend === 0) return '0.00'
    return (sales / spend).toFixed(1)
}

const mapType = (type) => {
    const types = {
        'SPONSORED_PRODUCT': 'Sponsorlu Ürün',
        'SPONSORED_BRAND': 'Sponsorlu Marka',
        'SPONSORED_DISPLAY': 'Görüntülü'
    }
    return types[type] || type
}

onMounted(() => {
    fetchData()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #ccc;
}
</style>
