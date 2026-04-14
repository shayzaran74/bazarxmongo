<template>
  <div class="min-h-screen bg-gray-50 relative overflow-x-hidden">
    <!-- Announcement Bar -->
    <AnnouncementBar page="homepage" />

    <!-- Premium Hero Section -->
    <BazarXHero />

    <div class="py-2 md:py-3" />
    <!-- Home Banner Slider - Full Width -->
    <HomeBanner
      v-if="homeSettings.showHomeSlider === 'true'"
      ecosystem="TICARITAKAS"
    />

    <div class="max-w-[1400px] mx-auto px-4 py-6">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 class="text-3xl font-black text-gray-900 tracking-tight italic flex items-center">
              <SparklesIcon class="h-8 w-8 mr-3 text-primary-600 animate-pulse" />
              TİCARİ TAKAS
            </h1>
            <p class="text-gray-500 text-sm font-medium mt-1">
              {{ pagination.total || 0 }} İlan
            </p>
          </div>
        </div>
      </div>

      <div class="flex gap-6">
        <!-- Left Sidebar - Filters -->
        <aside class="w-64 flex-shrink-0 bg-white rounded-lg shadow-sm p-4 h-fit sticky top-4">
          <SurplusFilters
            :categories="categories"
            :cities="cities"
            :specs="availableSpecs"
            :current-filters="currentFilters"
            @update:filters="handleFilterUpdate"
            @clear:filters="clearFilters"
          />
        </aside>

        <!-- Main Content -->
        <main class="flex-1">
          <!-- Quick Badges -->
          <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="badge in quickBadges"
                :key="badge.id"
                :class="[
                  'px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                  currentFilters[badge.key]
                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                ]"
                @click="toggleQuickBadge(badge.id)"
              >
                <component
                  :is="badge.icon"
                  class="w-4 h-4"
                />
                {{ badge.label }}
              </button>
            </div>
          </div>

          <!-- Sort Options -->
          <div class="bg-white rounded-lg shadow-sm p-4 mb-4 flex items-center justify-between">
            <span class="text-sm text-gray-600">Sıralama</span>
            <select
              v-model="currentFilters.sort"
              class="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              @change="handleSortChange"
            >
              <option value="">
                Önerilen
              </option>
              <option value="newest">
                En Yeni
              </option>
              <option value="quantityDesc">
                En Yüksek Miktar
              </option>
              <option value="quantityAsc">
                En Düşük Miktar
              </option>
            </select>
          </div>

          <!-- Loading State -->
          <div
            v-if="loading"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <div
              v-for="i in 8"
              :key="i"
              class="h-[400px] bg-gray-100 rounded-2xl animate-pulse"
            />
          </div>

          <!-- Items Grid -->
          <div
            v-else-if="items.length > 0"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <div
              v-for="item in items"
              :key="item.id"
              class="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
              @click="navigateTo('/surplus/' + item.id)"
            >
              <div class="relative h-48 overflow-hidden">
                <img
                  :src="getMainImage(item)"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  :alt="item.title"
                >
                <div class="absolute top-3 left-3">
                  <span
                    class="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary-600 shadow-lg"
                  >
                    {{ item.category }}
                  </span>
                </div>
                <div
                  v-if="item.status === 'active'"
                  class="absolute top-3 right-3"
                >
                  <div
                    class="flex items-center gap-1 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                  >
                    <div class="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    <span>Aktif</span>
                  </div>
                </div>
              </div>

              <div class="p-4">
                <div class="flex items-center gap-2 mb-2">
                  <div
                    class="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200"
                  >
                    <img
                      v-if="item.company?.logoUrl"
                      :src="item.company.logoUrl"
                      class="w-full h-full object-cover"
                    >
                    <span
                      v-else
                      class="text-xs font-bold"
                    >{{ item.company?.name?.charAt(0) || 'B' }}</span>
                  </div>
                  <span class="text-xs font-medium text-gray-500 truncate">{{ item.company?.name || 'Firma' }}</span>
                </div>

                <h3
                  class="text-base font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors"
                >
                  {{ item.title }}
                </h3>

                <div class="grid grid-cols-2 gap-2 mb-3">
                  <div class="bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <p class="text-xs font-bold text-gray-400 uppercase mb-0.5">
                      Miktar
                    </p>
                    <p class="text-sm font-bold text-gray-900">
                      {{ item.quantity }} {{ item.unit }}
                    </p>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <p class="text-xs font-bold text-gray-400 uppercase mb-0.5">
                      Birim Fiyat
                    </p>
                    <p class="text-sm font-bold text-primary-600 truncate">
                      {{ item.unitPrice ? formatCurrency(item.unitPrice) : 'Teklif' }}
                    </p>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-2 border border-gray-100 col-span-2">
                    <p class="text-xs font-bold text-gray-400 uppercase mb-0.5">
                      Konum
                    </p>
                    <p class="text-sm font-bold text-gray-900 truncate">
                      {{ item.location || '—' }}
                    </p>
                  </div>
                </div>

                <div
                  class="flex items-center justify-center w-full bg-gray-50 hover:bg-primary-600 hover:text-white rounded-lg py-3 transition-all group/btn border border-gray-200 hover:border-primary-500"
                >
                  <span class="text-xs font-bold uppercase tracking-wide">Detayları İncele</span>
                  <ArrowRightIcon class="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-else
            class="text-center py-16 bg-white rounded-lg shadow-sm"
          >
            <ArchiveBoxXMarkIcon class="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 class="text-lg font-bold text-gray-900 mb-2">
              Henüz ilan bulunamadı
            </h3>
            <p class="text-sm text-gray-500 mb-4">
              Arama kriterlerinizi değiştirerek tekrar deneyebilirsiniz.
            </p>
            <button
              class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              @click="clearFilters"
            >
              Filtreleri Temizle
            </button>
          </div>

          <!-- Pagination -->
          <div
            v-if="pagination.pages > 1"
            class="mt-8 flex justify-center"
          >
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                :disabled="pagination.page === 1"
                class="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                @click="goToPage(pagination.page - 1)"
              >
                ‹
              </button>

              <template
                v-for="page in pagination.pages"
                :key="page"
              >
                <button
                  v-if="shouldShowPage(page)"
                  :class="[
                    page === pagination.page
                      ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                  ]"
                  @click="goToPage(page)"
                >
                  {{ page }}
                </button>
                <span
                  v-else-if="Math.abs(page - pagination.page) === 3"
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                >
                  ...
                </span>
              </template>

              <button
                :disabled="pagination.page === pagination.pages"
                class="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                @click="goToPage(pagination.page + 1)"
              >
                ›
              </button>
            </nav>
          </div>
        </main>
      </div>
    </div>

    <!-- Section: Özel Fırsatlar - Spotlight Bento Grid Immersive -->
    <div
      v-if="homeSettings.showSpecialOffers === 'true'"
      class="w-full bg-gradient-to-br from-rose-50 via-white to-orange-50 py-8 md:py-12 relative overflow-hidden mb-6 md:mb-10"
    >
      <!-- Subtle Background Decorations -->
      <div class="absolute inset-0 opacity-40 pointer-events-none">
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-rose-200/50 rounded-full blur-[100px]" />
        <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-200/50 rounded-full blur-[100px]" />
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="flex flex-col md:flex-row items-center justify-between mb-6 gap-6">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-rose-600 text-white rounded-xl flex items-center justify-center shadow-xl shadow-rose-200 rotate-3 group-hover:rotate-0 transition-transform"
            >
              <SparklesIcon class="h-6 w-6" />
            </div>
            <div class="text-center md:text-left">
              <h2 class="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-none uppercase italic">
                Özel Fırsat <span class="text-rose-600">Spotu</span>
              </h2>
              <p class="text-gray-500 text-sm md:text-base font-medium mt-1">
                Sadece sınırlı bir süre için seçili
                ürünlerde dev fırsatlar
              </p>
            </div>
          </div>
          <NuxtLink
            to="/products?isSpecialOffer=true"
            class="group/all flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-rose-100 rounded-xl text-rose-600 font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-lg hover:shadow-rose-200"
          >
            Tümünü Keşfet
            <ArrowRightIcon class="h-4 w-4 group-hover/all:translate-x-2 transition-transform" />
          </NuxtLink>
        </div>

        <div
          v-if="specialOfferLoading"
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          <div
            v-for="i in 6"
            :key="'special-loading-' + i"
            class="aspect-[3/4] bg-white/50 backdrop-blur-sm animate-pulse rounded-2xl border border-slate-100"
          />
        </div>
        <div
          v-else
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-fade-in"
        >
          <div
            v-for="(product, index) in specialOfferProducts.slice(0, 6)"
            :key="product.id"
          >
            <ProductCard
              :product="product"
              :badges="index === 0 ? { ...getProductBadges(product), topLeft: { text: 'Günün Fırsatı', class: 'bg-rose-600 text-white' } } : getProductBadges(product)"
              @click="navigateTo(getProductUrl(product))"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Mid-Page Extra Ad Area (Middle Banner) -->
    <div class="w-full mb-12 animate-fade-in">
      <MiddleBanner ecosystem="TICARITAKAS" />
    </div>

    <!-- Performance Showcase: Best Sellers, Most Visited etc. -->
    <section
      v-if="homeSettings.showPerformanceShowcase !== 'false'"
      class="w-full bg-slate-50 py-10 md:py-16 relative overflow-hidden mb-8 md:mb-12"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div>
          <div>
            <div class="mb-8">
              <div class="flex items-center gap-3 mb-1" />
              <h2 class="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
                Performans
                <span class="text-indigo-400">Vitrini</span>
              </h2>
              <p class="text-slate-500 text-base font-medium mt-1">
                Platformun en çok ilgi gören ve güvenilen ürünlerini
                keşfedin.
              </p>
            </div>

            <!-- 1. En Çok Satanlar -->
            <div
              v-if="bestSellersProducts.length > 0"
              class="mb-8"
            >
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shadow-lg shadow-amber-100/50"
                  >
                    <FireIcon class="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 class="text-xl font-black text-black uppercase italic tracking-tight">
                    En Çok Satanlar
                  </h3>
                </div>
                <NuxtLink
                  to="/products?sort=sales_desc"
                  class="group flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                >
                  Hepsini Gör
                  <ArrowRightIcon class="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </NuxtLink>
              </div>
              <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6 animate-fade-in">
                <div
                  v-for="product in bestSellersProducts.slice(0, 6)"
                  :key="'bs-' + product.id"
                >
                  <ProductCard
                    :product="product"
                    :badges="getProductBadges(product)"
                    @click="navigateTo(getProductUrl(product))"
                    @add-to-cart="(p) => cartStore.addToCart(p.bestListingId || p.id, 1, undefined, p)"
                  />
                </div>
              </div>
            </div>

            <!-- 2. En Çok Tekrar Satın Alınanlar -->
            <div
              v-if="mostRepurchasedProducts.length > 0"
              class="mb-12"
            >
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100/50"
                  >
                    <ArrowPathIcon class="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3 class="text-xl font-black text-black uppercase italic tracking-tight">
                    Kullanıcıların
                    Vazgeçemedikleri
                  </h3>
                </div>
                <span
                  class="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg uppercase tracking-widest"
                >En
                  Çok Tekrar Alınanlar</span>
              </div>
              <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6 animate-fade-in">
                <div
                  v-for="product in mostRepurchasedProducts.slice(0, 6)"
                  :key="'rep-' + product.id"
                >
                  <ProductCard
                    :product="product"
                    :badges="getProductBadges(product)"
                    @click="navigateTo(getProductUrl(product))"
                  />
                </div>
              </div>
            </div>

            <!-- 3. En Çok Ziyaret Edilenler -->
            <div
              v-if="mostVisitedProducts.length > 0"
              class="mb-12"
            >
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100/50"
                  >
                    <EyeIcon class="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 class="text-xl font-black text-black uppercase italic tracking-tight">
                    Trend Ürünler
                  </h3>
                </div>
                <span
                  class="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg uppercase tracking-widest"
                >En
                  Çok Ziyaret Edilenler</span>
              </div>
              <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6 animate-fade-in">
                <div
                  v-for="product in mostVisitedProducts.slice(0, 6)"
                  :key="'visit-' + product.id"
                >
                  <ProductCard
                    :product="product"
                    :badges="getProductBadges(product)"
                    @click="navigateTo(getProductUrl(product))"
                    @add-to-cart="(p) => cartStore.addToCart(p.bestListingId || p.id, 1, undefined, p)"
                  />
                </div>
              </div>
            </div>

            <!-- 4. Genel Favorileri -->
            <div
              v-if="mostFavoritedProducts.length > 0"
              class="mb-12"
            >
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center shadow-lg shadow-rose-100/50"
                  >
                    <HeartIcon class="h-5 w-5 text-rose-600" />
                  </div>
                  <h3 class="text-xl font-black text-black uppercase italic tracking-tight">
                    Genel Favorileri
                  </h3>
                </div>
              </div>
              <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6 animate-fade-in">
                <div
                  v-for="product in mostFavoritedProducts.slice(0, 6)"
                  :key="'fav-' + product.id"
                >
                  <ProductCard
                    :product="product"
                    :badges="getProductBadges(product)"
                    @click="navigateTo(getProductUrl(product))"
                    @add-to-cart="(p) => cartStore.addToCart(p.bestListingId || p.id, 1, undefined, p)"
                  />
                </div>
              </div>
            </div>

            <!-- 5. En Çok Konuşulanlar -->
            <div
              v-if="mostRatedProducts.length > 0"
              class="mb-12"
            >
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100/50"
                  >
                    <ChatBubbleBottomCenterTextIcon class="h-5 w-5 text-indigo-600" />
                  </div>
                  <h3 class="text-xl font-black text-black uppercase italic tracking-tight">
                    En Çok Konuşulanlar
                  </h3>
                </div>
              </div>
              <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6 animate-fade-in">
                <div
                  v-for="product in mostRatedProducts.slice(0, 6)"
                  :key="'rated-' + product.id"
                >
                  <ProductCard
                    :product="product"
                    :badges="getProductBadges(product)"
                    @click="navigateTo(getProductUrl(product))"
                    @add-to-cart="(p) => cartStore.addToCart(p.bestListingId || p.id, 1, undefined, p)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Birlikte Al (Group Buy) - Immersive Full Width -->
    <div
      v-if="homeSettings.showGroupBuy === 'true' && activeGroupBuy"
      class="w-full bg-indigo-950 py-8 md:py-16 relative overflow-hidden group mb-8 md:mb-12"
    >
      <!-- Animated background patterns -->
      <div class="absolute inset-0 opacity-10 pointer-events-none">
        <div class="absolute -top-24 -left-24 w-96 h-96 bg-primary-500 rounded-full blur-[120px] animate-pulse" />
        <div
          class="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500 rounded-full blur-[120px] animate-pulse delay-700"
        />
      </div>

      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-10">
        <!-- Left side: Product Visuals -->
        <div class="w-full lg:w-1/2 flex justify-center">
          <div class="relative group-hover:scale-105 transition-transform duration-700">
            <div class="absolute inset-0 bg-primary-500/20 rounded-[3rem] blur-3xl -rotate-6" />
            <ProductImage
              :src="activeGroupBuy.Product?.image"
              :alt="activeGroupBuy.Product?.name"
              class="relative w-48 h-48 md:w-[300px] md:h-[300px]"
              image-class="object-cover rounded-2xl md:rounded-[2.5rem] shadow-2xl border-4 border-white/10"
            />
            <div
              class="absolute -top-6 -right-6 bg-red-600 text-white font-black text-2xl w-24 h-24 rounded-full flex flex-col items-center justify-center rotate-12 shadow-2xl border-4 border-indigo-900 animate-bounce"
            >
              <span class="text-xs md:text-sm">-%{{ calculateMaxDiscount() }}</span>
              <span class="text-base">VARAN</span>
            </div>
          </div>
        </div>

        <!-- Right side: Content -->
        <div class="w-full lg:w-1/2 text-white text-center lg:text-left">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20"
          >
            <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span class="text-xs font-black uppercase tracking-widest">Sınırlı Süreli Teklif</span>
          </div>

          <h2 class="text-3xl md:text-5xl font-black mb-4 leading-tight">
            Birlikte Al, <span class="text-primary-400">Daha Çok Kazanın!</span>
          </h2>

          <p class="text-gray-300 text-lg md:text-xl mb-8 max-w-lg mx-auto lg:mx-0">
            Bu üründe <span class="text-white font-black">%{{ calculateMaxDiscount() }}'e varan indirim</span> fırsatını
            kaçırmayın.
            Kalan kontenjan: <span class="text-primary-400 font-black">{{ activeGroupBuy.remainingQuantity }}
              adet</span>
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
            <button
              :disabled="!canJoinGroupBuy"
              class="px-8 py-4 bg-primary-500 hover:bg-primary-400 text-white font-black rounded-xl shadow-2xl hover:shadow-primary-500/50 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="joinGroupBuy"
            >
              Hemen Katıl
            </button>
            <button
              class="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-black rounded-xl border border-white/20 backdrop-blur-sm transition-all duration-300"
              @click="navigateTo(getProductUrl(activeGroupBuy.Product))"
            >
              Detayları İncele
            </button>
          </div>

          <div class="flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-400">
            <div class="flex items-center gap-2">
              <span class="text-primary-400">👥</span>
              <span class="font-black text-white">{{ activeGroupBuy.participantsCount }} katılımcı</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-primary-400">⏳</span>
              <span class="font-black text-white">{{ activeGroupBuy.remainingTime }} kaldı</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Barter Pool Section -->
    <div
      v-if="homeSettings.showBarterPool === 'true'"
      class="max-w-[1400px] mx-auto px-4 py-8"
    >
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 text-center">
        <div class="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span class="text-3xl">💰</span>
        </div>
        <h2 class="text-2xl font-black text-gray-900 mb-2">
          Barter Havuzu
        </h2>
        <p class="text-gray-600 max-w-lg mx-auto mb-4">
          Ürünlerinizi nakit harcamadan takas edin. Barter havuzuna
          katılarak
          binlerce firma ile ticaret yapın.
        </p>
        <NuxtLink
          to="/barter"
          class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
        >
          Barter Havuzuna Katıl
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  SparklesIcon,
    ArrowRightIcon,
  ArchiveBoxXMarkIcon,
  BoltIcon,
  MapPinIcon,
  ClockIcon,
  CubeIcon,
    FireIcon,
  EyeIcon,
      HeartIcon
} from '@heroicons/vue/24/outline'
import { getProductUrl } from '~/utils/product-url'
import { iller } from '~/assets/css/data/component/iller'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default'
})

useHead({
  title: 'TicariTakas - Sanayi Takas Platformu',
  meta: [
    {
      name: 'description',
      content: 'TicariTakas - B2B endüstriyel barter ve fazla mal platformu'
    }
  ]
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { resolveImageUrl } = useAppImage()

// State
const items = ref([])
const categories = ref([])
const availableSpecs = ref({
  materials: [],
  units: [],
  locations: [],
  wantedCategories: [],
  tradeModes: []
})
const loading = ref(false)
const currentFilters = ref({})
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  pages: 0
})

// Ticari Takas ecosystem settings
const homeSettings = ref({
  showFlashSales: 'true',
  showSpecialOffers: 'true',
  showAds: 'true',
  showHomeSlider: 'true',
  showBarterPool: 'true',
  showPersonalized: 'true',
  showQuadCards: 'true',
  showAuctions: 'true',
  showLotteries: 'true',
  showGroupBuy: 'true',
  showPerformanceShowcase: 'true'
})

const { getProductBadges } = useProductBadges()

// Showcase Data
const bestSellersProducts = ref([])
const mostVisitedProducts = ref([])
const mostRepurchasedProducts = ref([])
const mostFavoritedProducts = ref([])
const mostRatedProducts = ref([])
const activeGroupBuy = ref(null)
const specialOfferProducts = ref([])
const specialOfferLoading = ref(false)
const statsLoading = ref(false)

const cities = computed(() => Object.keys(iller).sort())

// Quick Badges
const quickBadges = [
  { id: 'urgent', label: 'Acil', key: 'urgent', icon: BoltIcon },
  { id: 'nearMe', label: 'Yakınımda', key: 'nearMe', icon: MapPinIcon },
  { id: 'new', label: 'Yeni İlanlar', key: 'new', icon: ClockIcon },
  { id: 'bulkAvailable', label: 'Toplu Alım', key: 'bulkAvailable', icon: CubeIcon }
]

// Fetch performance stats and special offers
const fetchShowcaseData = async () => {
  const { $api } = useApi()

  // Special Offers
  specialOfferLoading.value = true
  try {
    const data = await $api('/api/products', {
      query: { limit: 6, isSpecialOffer: true }
    })
    if (data.success) specialOfferProducts.value = data.data
  } catch (err) { console.error('Special offers fetch error:', err) }
  finally { specialOfferLoading.value = false }

  // Stats (Bestsellers & Most Visited)
  statsLoading.value = true
  try {
    const [bestResponse, visitResponse, repResponse, favResponse, ratedResponse] = await Promise.all([
      $api('/api/products/stats/bestsellers', { query: { limit: 6 } }),
      $api('/api/products/stats/most-visited', { query: { limit: 6 } }),
      $api('/api/products/stats/most-repurchased', { query: { limit: 6 } }).catch(() => ({ data: [] })),
      $api('/api/products/stats/most-favorited', { query: { limit: 6 } }).catch(() => ({ data: [] })),
      $api('/api/products/stats/most-rated', { query: { limit: 6 } }).catch(() => ({ data: [] }))
    ])
    bestSellersProducts.value = bestResponse.data || []
    mostVisitedProducts.value = visitResponse.data || []
    mostRepurchasedProducts.value = repResponse.data || []
    mostFavoritedProducts.value = favResponse.data || []
    mostRatedProducts.value = ratedResponse.data || []
  } catch (err) { console.error('Stats fetch error:', err) }
  finally { statsLoading.value = false }

  // Group Buy
  try {
    const groupBuyData = await $api('/api/group-buys/active')
    if (groupBuyData.success) activeGroupBuy.value = groupBuyData.data
  } catch (err) { console.error('Group buy fetch error:', err) }
}

// Fetch Ticari Takas ecosystem settings
const fetchHomeSettings = async () => {
  try {
    const { $api } = useApi()
    const data = await $api('/api/settings?ecosystem=ticaritakas')
    if (data.success) {
      homeSettings.value = { ...homeSettings.value, ...data.data }
    }
  } catch (err) {
    console.error('Fetch ticaritakas settings error:', err)
  }
}

// Methods
const fetchCategories = async () => {
  try {
    const { $api } = useApi()
    const response = await $api('/api/surplus/categories')
    if (response.success) {
      categories.value = response.data.filter(c => c.isActive)
    }
  } catch (error) {
    console.error('Fetch surplus categories error:', error)
    categories.value = ['METAL', 'PLASTİK', 'ELEKTRONİK']
  }
}

const fetchAvailableSpecs = async () => {
  try {
    const { $api } = useApi()
    const response = await $api('/api/surplus/specs')
    if (response.success) {
      availableSpecs.value = response.data
    }
  } catch (error) {
    console.error('Fetch surplus specs error:', error)
  }
}

const fetchItems = async (page = 1, filters = {}) => {
  loading.value = true

  try {
    const cleanFilters = {}
    Object.keys(filters).forEach(key => {
      const value = filters[key]
      if (value !== undefined && value !== null && value !== '' && value !== false) {
        cleanFilters[key] = value
      }
    })

    const queryFilters = { ...cleanFilters }

    // Handle Near Me: use user's city if current location is not explicitly set
    if (queryFilters.nearMe && authStore.user?.city && !queryFilters.location) {
      queryFilters.location = authStore.user.city
    }

    const { $api } = useApi()
    const response = await $api('/api/surplus', {
      query: {
        page,
        limit: pagination.value.limit,
        ...queryFilters
      }
    })

    if (response.success) {
      items.value = response.items || []
      pagination.value = {
        ...pagination.value,
        page: response.pagination?.page || page,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 0
      }
    }
  } catch (error) {
    console.error('Fetch surplus items error:', error)
  } finally {
    loading.value = false
  }
}

const handleFilterUpdate = (filters) => {
  currentFilters.value = filters
  updateQueryParams(filters)
  fetchItems(1, filters)
}

const handleSortChange = () => {
  updateQueryParams(currentFilters.value)
  fetchItems(1, currentFilters.value)
}

const toggleQuickBadge = (badgeId) => {
  const badge = quickBadges.find(b => b.id === badgeId)
  if (badge) {
    currentFilters.value[badge.key] = !currentFilters.value[badge.key]
    handleFilterUpdate(currentFilters.value)
  }
}

const clearFilters = () => {
  currentFilters.value = {}
  router.push({ query: {} })
  fetchItems(1, {})
}

const updateQueryParams = (filters) => {
  const query = {}
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      query[key] = filters[key]
    }
  })
  router.push({ query })
}

const syncFiltersFromQuery = () => {
  const newFilters = {}
  Object.keys(route.query).forEach(key => {
    newFilters[key] = route.query[key]
  })
  currentFilters.value = newFilters
  return fetchItems(1, newFilters)
}

const goToPage = (page) => {
  if (page >= 1 && page <= pagination.value.pages) {
    fetchItems(page, currentFilters.value)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const shouldShowPage = (page) => {
  return Math.abs(page - pagination.value.page) <= 2 || page === 1 || page === pagination.value.pages
}

const getMainImage = (item) => {
  if (item.images && item.images.length > 0) {
    const img = item.images[0]
    const url = typeof img === 'string' ? img : img.url
    return resolveImageUrl(url)
  }
  return resolveImageUrl(null, 'product')
}

const formatCurrency = (val) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(val)
}

const calculateMaxDiscount = () => {
  if (!activeGroupBuy.value?.Tiers) return 0
  const basePrice = activeGroupBuy.value.Product?.price || 0
  if (basePrice === 0) return 0
  const minPrice = Math.min(...activeGroupBuy.value.Tiers.map(t => t.price))
  return Math.round(((basePrice - minPrice) / basePrice) * 100)
}

const canJoinGroupBuy = computed(() => {
  return activeGroupBuy.value?.status === 'Active' && activeGroupBuy.value.remainingQuantity > 0
})

const joinGroupBuy = () => {
  if (activeGroupBuy.value) {
    navigateTo(getProductUrl(activeGroupBuy.value.Product))
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchCategories(),
    fetchAvailableSpecs(),
    fetchHomeSettings(),
    fetchShowcaseData()
  ])
  await syncFiltersFromQuery()
})

watch(
  () => route.query,
  () => {
    syncFiltersFromQuery()
  },
  { deep: true }
)
</script>

<style scoped>
@keyframes ping {

  75%,
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>
