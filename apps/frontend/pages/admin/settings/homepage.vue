<template>
  <div class="p-8 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">
        🏠 Ana Sayfa Ayarları
      </h1>
      <p class="text-gray-600 mt-1">
        Ana sayfada hangi bölümlerin görüneceğini yönetin
      </p>
    </div>

    <!-- Settings Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <!-- Site Settings -->
      <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-purple-50">
        <h2 class="text-lg font-bold text-gray-900 flex items-center">
          <BuildingOfficeIcon class="h-5 w-5 mr-2 text-primary-600" />
          Site Ayarları
        </h2>
        <p class="text-sm text-gray-500 mt-1">
          Site adı ve logo ayarlarını buradan yönetin
        </p>
      </div>

      <div class="p-6 space-y-6 border-b border-gray-100">
        <!-- Site Name -->
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <label class="block text-sm font-bold text-gray-700 mb-2">Site Adı</label>
          <input
            v-model="settings.siteName"
            type="text"
            placeholder="TicariTakas"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-lg font-bold"
          >
          <p class="mt-2 text-xs text-gray-500">
            Bu isim header'da logo yanında gösterilir
          </p>
        </div>

        <!-- Site Logo Upload -->
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <label class="block text-sm font-bold text-gray-700 mb-2">Site Logosu</label>
          <div class="flex items-start space-x-4">
            <!-- Current Logo Preview -->
            <div
              v-if="settings.siteLogo || logoPreview"
              class="w-20 h-20 rounded-xl overflow-hidden border-2 border-white shadow-md flex-shrink-0 bg-primary-600 group relative"
            >
              <img
                :src="logoPreview || getLogoUrl(settings.siteLogo)"
                class="w-full h-full object-cover"
              >
              <div
                class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <button
                  class="text-white p-1 hover:text-red-400"
                  @click="removeLogo"
                >
                  <TrashIcon class="h-5 w-5" />
                </button>
              </div>
            </div>
            <div
              v-else
              class="w-20 h-20 rounded-xl border-2 border-dashed border-primary-200 flex flex-col items-center justify-center bg-white/50 text-primary-300"
            >
              <PhotoIcon class="h-8 w-8 mb-1" />
              <span class="text-[8px] font-bold">LOGO YOK</span>
            </div>

            <div class="flex-1 space-y-3">
              <div>
                <input
                  ref="logoInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleLogoChange"
                >
                <button
                  class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-bold"
                  @click="$refs.logoInput.click()"
                >
                  📷 Logo Seç
                </button>
              </div>
              <p class="text-xs text-gray-500">
                PNG, JPG veya WebP formatında maksimum 2MB boyutunda bir logo yükleyin
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="p-6 border-b border-gray-100 bg-gray-50/50">
        <h2 class="text-lg font-bold text-gray-900 flex items-center">
          <EyeIcon class="h-5 w-5 mr-2 text-primary-600" />
          Bölüm Görünürlüğü
        </h2>
      </div>

      <div class="p-6 space-y-8">
        <!-- Flash Sales Toggle -->
        <div
          class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-200 transition-colors"
        >
          <div class="flex items-center space-x-4">
            <div class="bg-yellow-100 p-3 rounded-lg">
              <BoltIcon class="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 class="text-md font-bold text-gray-900">
                Flaş Ürünler
              </h3>
              <p class="text-sm text-gray-500">
                Ana sayfada "Flaş Ürünler" bölümünü göster/gizle
              </p>
            </div>
          </div>
          <button
            :class="[
              'relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
              settings.showFlashSales ? 'bg-primary-600' : 'bg-gray-200'
            ]"
            @click="settings.showFlashSales = !settings.showFlashSales"
          >
            <span
              :class="[
                'pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                settings.showFlashSales ? 'translate-x-7' : 'translate-x-0'
              ]"
            />
          </button>
        </div>

        <!-- Special Offers Toggle -->
        <div
          class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-200 transition-colors"
        >
          <div class="flex items-center space-x-4">
            <div class="bg-red-100 p-3 rounded-lg">
              <FireIcon class="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 class="text-md font-bold text-gray-900">
                Özel Fırsatlar
              </h3>
              <p class="text-sm text-gray-500">
                Ana sayfada "Özel Fırsatlar" bölümünü göster/gizle
              </p>
            </div>
          </div>
          <button
            :class="[
              'relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
              settings.showSpecialOffers ? 'bg-primary-600' : 'bg-gray-200'
            ]"
            @click="settings.showSpecialOffers = !settings.showSpecialOffers"
          >
            <span
              :class="[
                'pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                settings.showSpecialOffers ? 'translate-x-7' : 'translate-x-0'
              ]"
            />
          </button>
        </div>

        <!-- Side Ads Toggle -->
        <div
          class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-200 transition-colors"
        >
          <div class="flex items-center space-x-4">
            <div class="bg-indigo-100 p-3 rounded-lg">
              <MegaphoneIcon class="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 class="text-md font-bold text-gray-900">
                Yan Reklam Alanları
              </h3>
              <p class="text-sm text-gray-500">
                Sol ve sağ taraftaki dikey reklam alanlarını göster/gizle
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <NuxtLink
              to="/admin/settings/side-ads"
              class="text-xs font-bold text-primary-600 hover:underline px-3 py-1 bg-white rounded-lg border border-gray-200"
            >
              Reklamları Yönet
            </NuxtLink>
            <button
              :class="[
                'relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                settings.showAds ? 'bg-primary-600' : 'bg-gray-200'
              ]"
              @click="settings.showAds = !settings.showAds"
            >
              <span
                :class="[
                  'pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  settings.showAds ? 'translate-x-7' : 'translate-x-0'
                ]"
              />
            </button>
          </div>
        </div>

        <!-- Home Slider Toggle -->
        <div
          class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-200 transition-colors"
        >
          <div class="flex items-center space-x-4">
            <div class="bg-pink-100 p-3 rounded-lg">
              <PhotoIcon class="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h3 class="text-md font-bold text-gray-900">
                Ana Sayfa Banner Slider
              </h3>
              <p class="text-sm text-gray-500">
                En üstteki büyük geçişli banner alanını göster/gizle
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <NuxtLink
              to="/admin/banners"
              class="text-xs font-bold text-primary-600 hover:underline px-3 py-1 bg-white rounded-lg border border-gray-200"
            >
              Bannerları Yönet
            </NuxtLink>
            <button
              :class="[
                'relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                settings.showHomeSlider ? 'bg-primary-600' : 'bg-gray-200'
              ]"
              @click="settings.showHomeSlider = !settings.showHomeSlider"
            >
              <span
                :class="[
                  'pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  settings.showHomeSlider ? 'translate-x-7' : 'translate-x-0'
                ]"
              />
            </button>
          </div>
        </div>

        <!-- Quad Cards Toggle -->
        <div
          class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-200 transition-colors"
        >
          <div class="flex items-center space-x-4">
            <div class="bg-blue-100 p-3 rounded-lg">
              <Squares2X2Icon class="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 class="text-md font-bold text-gray-900">
                Dörtlü Öne Çıkanlar (Quad Cards)
              </h3>
              <p class="text-sm text-gray-500">
                Ana sayfadaki 4'lü ürün gruplarını yönetin
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <NuxtLink
              to="/admin/settings/quad-cards"
              class="text-xs font-bold text-primary-600 hover:underline px-3 py-1 bg-white rounded-lg border border-gray-200"
            >
              Kartları Yönet
            </NuxtLink>
            <button
              :class="[
                'relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                settings.showQuadCards ? 'bg-primary-600' : 'bg-gray-200'
              ]"
              @click="settings.showQuadCards = !settings.showQuadCards"
            >
              <span
                :class="[
                  'pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  settings.showQuadCards ? 'translate-x-7' : 'translate-x-0'
                ]"
              />
            </button>
          </div>
        </div>

        <!-- Module Management Section -->
        <div class="pt-8 border-t border-gray-100">
          <h2 class="text-lg font-bold text-gray-900 flex items-center mb-6">
            <PuzzlePieceIcon class="h-5 w-5 mr-2 text-primary-600" />
            Modül Yönetimi
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Auctions Toggle -->
            <div class="p-4 bg-gray-50 rounded-xl border border-gray-100 h-full flex flex-col justify-between">
              <div class="flex items-center justify-between mb-2">
                <div class="bg-blue-100 p-2 rounded-lg">
                  <TicketIcon class="h-5 w-5 text-blue-600" />
                </div>
                <button
                  :class="[
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                    settings.showAuctions ? 'bg-primary-600' : 'bg-gray-300'
                  ]"
                  @click="settings.showAuctions = !settings.showAuctions"
                >
                  <span
                    :class="[
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      settings.showAuctions ? 'translate-x-5' : 'translate-x-0'
                    ]"
                  />
                </button>
              </div>
              <div>
                <h3 class="text-sm font-bold text-gray-900">
                  Açık Artırmalar
                </h3>
                <p class="text-[10px] text-gray-500 mt-1">
                  Ana sayfada açık artırma bölümünü etkinleştirir.
                </p>
              </div>
            </div>

            <!-- Lotteries Toggle -->
            <div class="p-4 bg-gray-50 rounded-xl border border-gray-100 h-full flex flex-col justify-between">
              <div class="flex items-center justify-between mb-2">
                <div class="bg-purple-100 p-2 rounded-lg">
                  <StarIcon class="h-5 w-5 text-purple-600" />
                </div>
                <button
                  :class="[
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                    settings.showLotteries ? 'bg-primary-600' : 'bg-gray-300'
                  ]"
                  @click="settings.showLotteries = !settings.showLotteries"
                >
                  <span
                    :class="[
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      settings.showLotteries ? 'translate-x-5' : 'translate-x-0'
                    ]"
                  />
                </button>
              </div>
              <div>
                <h3 class="text-sm font-bold text-gray-900">
                  Çekilişler
                </h3>
                <p class="text-[10px] text-gray-500 mt-1">
                  Ana sayfada çekiliş bölümünü etkinleştirir.
                </p>
              </div>
            </div>

            <!-- Group Buy Toggle -->
            <div class="p-4 bg-gray-50 rounded-xl border border-gray-100 h-full flex flex-col justify-between">
              <div class="flex items-center justify-between mb-2">
                <div class="bg-indigo-100 p-2 rounded-lg">
                  <UserGroupIcon class="h-5 w-5 text-indigo-600" />
                </div>
                <button
                  :class="[
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                    settings.showGroupBuy ? 'bg-primary-600' : 'bg-gray-300'
                  ]"
                  @click="settings.showGroupBuy = !settings.showGroupBuy"
                >
                  <span
                    :class="[
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      settings.showGroupBuy ? 'translate-x-5' : 'translate-x-0'
                    ]"
                  />
                </button>
              </div>
              <div>
                <h3 class="text-sm font-bold text-gray-900">
                  Birlikte Al
                </h3>
                <p class="text-[10px] text-gray-500 mt-1">
                  Grup satın alma kampanyalarını etkinleştirir.
                </p>
              </div>
            </div>

            <!-- Personalized Products Toggle -->
            <div class="p-4 bg-gray-50 rounded-xl border border-gray-100 h-full flex flex-col justify-between">
              <div class="flex items-center justify-between mb-2">
                <div class="bg-orange-100 p-2 rounded-lg">
                  <StarIcon class="h-5 w-5 text-orange-600" />
                </div>
                <button
                  :class="[
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                    settings.showPersonalized ? 'bg-primary-600' : 'bg-gray-300'
                  ]"
                  @click="settings.showPersonalized = !settings.showPersonalized"
                >
                  <span
                    :class="[
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      settings.showPersonalized ? 'translate-x-5' : 'translate-x-0'
                    ]"
                  />
                </button>
              </div>
              <div>
                <h3 class="text-sm font-bold text-gray-900">
                  Sana Özel Ürünler
                </h3>
                <p class="text-[10px] text-gray-500 mt-1">
                  Ana sayfada kişiselleştirilmiş ürünler bölümünü gösterir.
                </p>
              </div>
            </div>

            <!-- Barter Pool Toggle -->
            <div class="p-4 bg-gray-50 rounded-xl border border-gray-100 h-full flex flex-col justify-between">
              <div class="flex items-center justify-between mb-2">
                <div class="bg-blue-100 p-2 rounded-lg">
                  <BanknotesIcon class="h-5 w-5 text-blue-600" />
                </div>
                <button
                  :class="[
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                    settings.showBarterPool ? 'bg-primary-600' : 'bg-gray-300'
                  ]"
                  @click="settings.showBarterPool = !settings.showBarterPool"
                >
                  <span
                    :class="[
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      settings.showBarterPool ? 'translate-x-5' : 'translate-x-0'
                    ]"
                  />
                </button>
              </div>
              <div>
                <h3 class="text-sm font-bold text-gray-900">
                  Barter Havuzu
                </h3>
                <p class="text-[10px] text-gray-500 mt-1">
                  Ana sayfada Barter Havuzu tanıtım bölümünü gösterir.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Barter Auto-Approval Settings Section -->
        <div class="pt-8 border-t border-gray-100">
          <h2 class="text-lg font-bold text-gray-900 flex items-center mb-2">
            <CheckBadgeIcon class="h-5 w-5 mr-2 text-green-600" />
            Barter Otomatik Onay Ayarları
          </h2>
          <p class="text-xs text-gray-500 mb-6 ml-7">
            İlan ve teklif onaylarını otomatikleştirerek admin iş yükünü azaltın.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Auto-Approve Listings -->
            <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <h3 class="text-sm font-bold text-gray-900 mb-3">
                📋 İlan Onayı
              </h3>
              <div class="space-y-2">
                <label
                  class="flex items-center p-2 rounded-lg cursor-pointer hover:bg-white transition-colors"
                  :class="{ 'bg-white border border-primary-200': settings.autoApproveListings === 'none' }"
                >
                  <input
                    v-model="settings.autoApproveListings"
                    type="radio"
                    value="none"
                    class="h-4 w-4 text-primary-600 border-gray-300"
                  >
                  <span class="ml-3 text-sm font-medium text-gray-700">❌ Manuel Onay</span>
                </label>
                <label
                  class="flex items-center p-2 rounded-lg cursor-pointer hover:bg-white transition-colors"
                  :class="{ 'bg-white border border-primary-200': settings.autoApproveListings === 'verified_companies' }"
                >
                  <input
                    v-model="settings.autoApproveListings"
                    type="radio"
                    value="verified_companies"
                    class="h-4 w-4 text-primary-600 border-gray-300"
                  >
                  <span class="ml-3 text-sm font-medium text-gray-700">✅ Onaylı Firmalar</span>
                </label>
                <label
                  class="flex items-center p-2 rounded-lg cursor-pointer hover:bg-white transition-colors"
                  :class="{ 'bg-white border border-primary-200': settings.autoApproveListings === 'all' }"
                >
                  <input
                    v-model="settings.autoApproveListings"
                    type="radio"
                    value="all"
                    class="h-4 w-4 text-primary-600 border-gray-300"
                  >
                  <span class="ml-3 text-sm font-medium text-gray-700">✅✅ Tümü Otomatik</span>
                </label>
              </div>
            </div>

            <!-- Auto-Approve Offers -->
            <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <h3 class="text-sm font-bold text-gray-900 mb-3">
                🔄 Teklif Onayı
              </h3>
              <div class="space-y-2">
                <label
                  class="flex items-center p-2 rounded-lg cursor-pointer hover:bg-white transition-colors"
                  :class="{ 'bg-white border border-primary-200': settings.autoApproveOffers === 'none' }"
                >
                  <input
                    v-model="settings.autoApproveOffers"
                    type="radio"
                    value="none"
                    class="h-4 w-4 text-primary-600 border-gray-300"
                  >
                  <span class="ml-3 text-sm font-medium text-gray-700">❌ Manuel Onay</span>
                </label>
                <label
                  class="flex items-center p-2 rounded-lg cursor-pointer hover:bg-white transition-colors"
                  :class="{ 'bg-white border border-primary-200': settings.autoApproveOffers === 'verified_companies' }"
                >
                  <input
                    v-model="settings.autoApproveOffers"
                    type="radio"
                    value="verified_companies"
                    class="h-4 w-4 text-primary-600 border-gray-300"
                  >
                  <span class="ml-3 text-sm font-medium text-gray-700">✅ Onaylı Firmalar</span>
                </label>
                <label
                  class="flex items-center p-2 rounded-lg cursor-pointer hover:bg-white transition-colors"
                  :class="{ 'bg-white border border-primary-200': settings.autoApproveOffers === 'all' }"
                >
                  <input
                    v-model="settings.autoApproveOffers"
                    type="radio"
                    value="all"
                    class="h-4 w-4 text-primary-600 border-gray-300"
                  >
                  <span class="ml-3 text-sm font-medium text-gray-700">✅✅ Tümü Otomatik</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Shipping Tiers Management -->
        <div class="pt-8 border-t border-gray-100">
          <h2 class="text-lg font-bold text-gray-900 flex items-center mb-2">
            <TruckIcon class="h-5 w-5 mr-2 text-primary-600" />
            Kargo Ücreti ve Baremleri
          </h2>
          <p class="text-xs text-gray-500 mb-6 ml-7">
            Tanımlanan baremler dışında kalan tüm siparişler için kargo ücreti <strong>0 TL (Ücretsiz)</strong> olarak
            hesaplanacaktır.
          </p>
          <div class="space-y-4">
            <div
              v-for="(tier, index) in shippingTiers"
              :key="index"
              class="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100"
            >
              <div class="flex-1">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">MİN. TUTAR
                  (TL)</label>
                <input
                  v-model.number="tier.min"
                  type="number"
                  class="w-full px-3 py-2 border rounded-lg"
                  placeholder="0"
                >
              </div>
              <div class="flex-1">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">MAKS. TUTAR
                  (TL)</label>
                <input
                  v-model.number="tier.max"
                  type="number"
                  class="w-full px-3 py-2 border rounded-lg"
                  placeholder="149"
                >
              </div>
              <div class="flex-1">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">KARGO ÜCRETİ
                  (TL)</label>
                <input
                  v-model.number="tier.cost"
                  type="number"
                  class="w-full px-3 py-2 border rounded-lg"
                  placeholder="67"
                >
              </div>
              <button
                class="mt-5 p-2 text-red-500 hover:text-red-700"
                @click="removeTier(index)"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
            </div>
            <button
              class="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-all flex items-center justify-center"
              @click="addTier"
            >
              <PlusIcon class="h-4 w-4 mr-2" /> Yeni Barem Ekle
            </button>
          </div>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
        <button
          class="bg-primary-600 text-white px-8 py-3 rounded-xl hover:bg-primary-700 transition-all font-bold flex items-center shadow-lg shadow-primary-200 disabled:opacity-50"
          :disabled="saving"
          @click="saveSettings"
        >
          <div
            v-if="saving"
            class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"
          />
          <CheckIcon
            v-else
            class="h-5 w-5 mr-2"
          />
          {{ saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  EyeIcon,
  BoltIcon,
  TicketIcon,
  CheckIcon,
  UserGroupIcon,
  FireIcon,
  MegaphoneIcon,
  PuzzlePieceIcon,
  StarIcon,
    PhotoIcon,
  TrashIcon,
  BuildingOfficeIcon,
    TruckIcon,
  PlusIcon,
  BanknotesIcon,
  CheckBadgeIcon,
  Squares2X2Icon
} from '@heroicons/vue/24/outline'


definePageMeta({
  layout: 'admin',
  middleware: 'super-admin'
})

const config = useRuntimeConfig()
const { $api } = useApi()
const toast = useNuxtApp().$toast

const saving = ref(false)
const logoPreview = ref(null)
const logoFile = ref(null)

const settings = ref({
  siteName: 'TicariTakas',
  siteLogo: '',
  showAuctions: true,
  showLotteries: true,
  showGroupBuy: true,
  showFlashSales: true,
  showSpecialOffers: true,
  showAds: true,
  showHomeSlider: true,
  adLeftEmoji: '🎁',
  adLeftTitle: 'Fırsat Alanı',
  adLeftSubtitle: 'En yeni kampanyalar burada!',
  adLeftLink: '',
  adLeftImage: '',
  adRightEmoji: '🚀',
  adRightTitle: 'Reklam Alanı',
  adRightSubtitle: 'Sizin reklamınız burada olabilir!',
  adRightLink: '',
  adRightImage: '',
  showPersonalized: true,
  showBarterPool: true,
  showQuadCards: true,
  autoApproveListings: 'none',
  autoApproveOffers: 'none',
  shippingTiers: '[]'
})

const shippingTiers = ref([])

const addTier = () => {
  shippingTiers.value.push({ min: 0, max: 999, cost: 0 })
}

const removeTier = (index) => {
  shippingTiers.value.splice(index, 1)
}

// Logo helpers
const getLogoUrl = (logo) => {
  if (!logo) return null
  if (logo.startsWith('http')) return logo
  return `${config.public.apiBase}${logo}`
}

const handleLogoChange = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    toast.error('Lütfen bir resim dosyası seçin')
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    toast.error('Logo boyutu 2MB\'dan küçük olmalıdır')
    return
  }

  logoFile.value = file
  logoPreview.value = URL.createObjectURL(file)
}

const removeLogo = () => {
  settings.value.siteLogo = ''
  logoPreview.value = null
  logoFile.value = null
}

const uploadLogo = async () => {
  if (!logoFile.value) return null

  try {
    const formData = new FormData()
    formData.append('logo', logoFile.value)

    const response = await $api('/api/admin/settings/upload-logo', {
      method: 'POST',
      body: formData
    })

    if (response.success) {
      return response.logoUrl
    }
    return null
  } catch (error) {
    console.error('Logo upload error:', error)
    toast.error('Logo yüklenirken bir hata oluştu')
    return null
  }
}



const fetchSettings = async () => {
  try {
    const response = await $api('/api/admin/settings')

    if (response.success) {
      // Boolean fields to map from text strings ('true'/'false') back to booleans
      const booleanKeys = [
        'showAuctions', 'showLotteries', 'showGroupBuy', 'showFlashSales',
        'showSpecialOffers', 'showAds', 'showHomeSlider', 'showBarterPool',
        'showPersonalized', 'showQuadCards'
      ];

      booleanKeys.forEach(key => {
        if (response.data[key] !== undefined) {
          // If expecting defaults to true on some fields where 'false' isn't explicitly set
          settings.value[key] = response.data[key] !== 'false';
        }
      });

      // String fields to map directly
      const stringKeys = [
        'siteName', 'siteLogo', 'autoApproveListings', 'autoApproveOffers',
        'adLeftEmoji', 'adLeftTitle', 'adLeftSubtitle', 'adLeftLink', 'adLeftImage',
        'adRightEmoji', 'adRightTitle', 'adRightSubtitle', 'adRightLink', 'adRightImage'
      ];

      stringKeys.forEach(key => {
        if (response.data[key] !== undefined) {
          settings.value[key] = response.data[key];
        }
      });

      if (response.data.shippingTiers) {
        settings.value.shippingTiers = response.data.shippingTiers
        try {
          shippingTiers.value = JSON.parse(response.data.shippingTiers)
        } catch (e) {
          shippingTiers.value = []
        }
      }
    }
  } catch (error) {
    console.error('Fetch settings error:', error)
  }
}

const saveSettings = async () => {
  saving.value = true
  try {
    // Upload logo first if a new one was selected
    if (logoFile.value) {
      const uploadedLogoUrl = await uploadLogo()
      if (uploadedLogoUrl) {
        settings.value.siteLogo = uploadedLogoUrl
        logoFile.value = null
        logoPreview.value = null
      }
    }

    const response = await $api('/api/admin/settings', {
      method: 'POST',
      body: {
        siteName: settings.value.siteName,
        siteLogo: settings.value.siteLogo,
        showAuctions: (settings.value.showAuctions ?? true).toString(),
        showLotteries: (settings.value.showLotteries ?? true).toString(),
        showGroupBuy: (settings.value.showGroupBuy ?? true).toString(),
        showFlashSales: (settings.value.showFlashSales ?? true).toString(),
        showSpecialOffers: (settings.value.showSpecialOffers ?? true).toString(),
        showHomeSlider: (settings.value.showHomeSlider ?? true).toString(),
        showAds: (settings.value.showAds ?? true).toString(),
        showQuadCards: (settings.value.showQuadCards ?? true).toString(),
        adLeftEmoji: settings.value.adLeftEmoji,
        adLeftTitle: settings.value.adLeftTitle,
        adLeftSubtitle: settings.value.adLeftSubtitle,
        adLeftLink: settings.value.adLeftLink,
        adLeftImage: settings.value.adLeftImage,
        adRightEmoji: settings.value.adRightEmoji,
        adRightTitle: settings.value.adRightTitle,
        adRightSubtitle: settings.value.adRightSubtitle,
        adRightLink: settings.value.adRightLink,
        adRightImage: settings.value.adRightImage,
        showBarterPool: (settings.value.showBarterPool ?? true).toString(),
        showPersonalized: (settings.value.showPersonalized ?? true).toString(),
        autoApproveListings: settings.value.autoApproveListings,
        autoApproveOffers: settings.value.autoApproveOffers,
        shippingTiers: JSON.stringify(shippingTiers.value)
      }
    })

    if (response.success) {
      toast.success('Ayarlar başarıyla güncellendi!')
    }
  } catch (error) {
    console.error('Save settings error:', error)
    toast.error('Ayarlar kaydedilirken bir hata oluştu')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchSettings()
})
</script>
