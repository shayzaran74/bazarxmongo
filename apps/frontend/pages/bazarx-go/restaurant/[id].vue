<!-- apps/frontend/pages/bazarx-go/restaurant/[id].vue -->
<template>
  <div class="bazarx-go min-h-screen bg-[var(--bg)] text-[var(--ink)] antialiased">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
      <div class="max-w-7xl mx-auto flex justify-between items-center px-5 py-3">
        <div class="flex items-center gap-6">
          <NuxtLink to="/bazarx-go" class="flex items-center gap-2">
            <span class="font-bold text-xl text-[var(--brand-deep)]">BazarX Go</span>
          </NuxtLink>
          <div class="hidden md:flex items-center bg-[var(--surface)] rounded-full px-4 py-2 w-96 border border-black/10 focus-within:border-[var(--brand)] transition-all">
            <MagnifyingGlassIcon class="w-5 h-5 text-black/40 mr-2" />
            <input
              class="bg-transparent border-none outline-none text-sm w-full placeholder:text-black/40"
              placeholder="Restoran, mutfak veya yemek ara"
              type="text"
            />
          </div>
        </div>
        <nav class="flex items-center gap-4">
          <div class="hidden md:flex items-center gap-4">
            <a class="text-sm text-black/60 hover:text-[var(--brand-deep)] transition-colors" href="#">Kampanyalar</a>
            <a class="text-sm text-black/60 hover:text-[var(--brand-deep)] transition-colors" href="#">Yardım</a>
            <NuxtLink to="/bazarx-go/cart" class="text-sm text-black/60 hover:text-[var(--brand-deep)] transition-colors flex items-center gap-1">
              <ShoppingBagIcon class="w-5 h-5" />
              Sepetim
            </NuxtLink>
          </div>
          <div class="flex items-center gap-3">
            <button class="flex items-center gap-1 text-sm text-[var(--ink)] hover:text-[var(--brand-deep)] transition-colors">
              <MapPinIcon class="w-5 h-5" />
              <span class="hidden sm:inline font-medium">Ankara</span>
            </button>
            
            <!-- Giriş Yap / Profil -->
            <template v-if="!authStore.isLoggedIn">
              <NuxtLink to="/auth/login" class="bg-[var(--brand-deep)] text-white px-5 py-2.5 rounded-full text-sm font-bold active:scale-95 transition-all shadow-lg shadow-[var(--brand-deep)]/20">
                Giriş Yap
              </NuxtLink>
            </template>
            <template v-else>
              <div class="relative group/user">
                <button class="flex items-center gap-2 px-3 py-1.5 bg-[var(--surface)] hover:bg-[var(--surface-2)] rounded-full transition-all group border border-transparent hover:border-[var(--brand)]/20">
                  <div class="w-7 h-7 rounded-full bg-[var(--brand)]/10 flex items-center justify-center overflow-hidden border border-[var(--brand)]/20">
                    <img v-if="authStore.avatarUrl" :src="authStore.avatarUrl" class="w-full h-full object-cover">
                    <UserCircleIcon v-else class="w-5 h-5 text-[var(--brand-deep)]" />
                  </div>
                  <span class="text-xs font-black text-[var(--ink)] max-w-[80px] truncate">{{ authStore.user?.firstName || 'Hesabım' }}</span>
                  <ChevronDownIcon class="w-3 h-3 text-black/30 group-hover:rotate-180 transition-transform" />
                </button>

                <!-- Dropdown Menu -->
                <div class="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-black/[0.06] p-2 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all z-50">
                  <NuxtLink to="/profile" class="flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--surface)] rounded-xl text-xs font-bold text-[var(--ink)] transition-colors">
                    <UserCircleIcon class="w-4 h-4 text-black/40" />
                    Profilim
                  </NuxtLink>
                  <NuxtLink to="/orders" class="flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--surface)] rounded-xl text-xs font-bold text-[var(--ink)] transition-colors">
                    <ShoppingBagIcon class="w-4 h-4 text-black/40" />
                    Siparişlerim
                  </NuxtLink>
                  <div class="my-1 border-t border-black/[0.04]"></div>
                  <button @click="logout" class="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-xl text-xs font-bold text-red-600 transition-colors text-left">
                    <ArrowLeftOnRectangleIcon class="w-4 h-4 text-red-400" />
                    Çıkış Yap
                  </button>
                </div>
              </div>
            </template>
          </div>
        </nav>
      </div>
    </header>

    <div v-if="vendorLoading" class="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)] gap-4">
      <div class="relative w-16 h-16">
        <div class="absolute inset-0 border-4 border-[var(--brand)]/20 rounded-full"></div>
        <div class="absolute inset-0 border-4 border-[var(--brand)] border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p class="text-sm font-bold text-black/40 animate-pulse">Lezzetler Hazırlanıyor...</p>
    </div>

    <main v-else class="max-w-7xl mx-auto px-5 py-6">
      <!-- Restaurant Header -->
      <section
        v-motion
        :initial="{ opacity: 0, y: 28, filter: 'blur(12px)' }"
        :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 700, ease: [0.25, 0.46, 0.45, 0.94] } }"
        class="bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col md:flex-row mb-6"
      >
        <div class="w-full md:w-1/3 aspect-square md:aspect-auto h-64 md:h-auto overflow-hidden">
          <img
            class="w-full h-full object-cover"
            :src="restaurant.image"
            :alt="restaurant.name"
          />
        </div>
        <div class="p-6 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-start justify-between">
              <h1 class="font-heading text-2xl md:text-3xl font-black text-[var(--ink)]">{{ restaurant.name }}</h1>
              <div class="flex gap-2">
                <div v-if="restaurant.verified" class="px-2 py-1 bg-[var(--brand)]/10 text-[var(--brand-deep)] rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheckIcon class="w-3 h-3" />
                  Semtin Yıldızı
                </div>
                <div v-if="restaurant.sponsored" class="px-2 py-1 bg-black/5 rounded text-[10px] font-bold uppercase tracking-wider text-black/40">Sponsorlu</div>
              </div>
            </div>
            <div class="mt-2 flex items-center gap-4 text-sm text-black/50">
              <span class="flex items-center gap-1.5">
                <FireIcon class="w-4 h-4 text-[var(--accent-deep)]" />
                {{ restaurant.cuisine }}
              </span>
              <span class="flex items-center gap-1.5">
                <MapPinIcon class="w-4 h-4 text-[var(--brand-deep)]" />
                {{ restaurant.distance }}
              </span>
            </div>
          </div>
          <div class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-black/10 pt-6">
            <div>
              <div class="flex items-center gap-1.5 text-black/40 mb-1">
                <StarFilled class="w-4 h-4 text-[var(--accent-deep)]" />
                <p class="text-[10px] font-black uppercase tracking-widest">Puan</p>
              </div>
              <p class="font-bold text-[var(--ink)]">{{ restaurant.rating }}+</p>
            </div>
            <div>
              <div class="flex items-center gap-1.5 text-black/40 mb-1">
                <ClockIcon class="w-4 h-4 text-[var(--brand-deep)]" />
                <p class="text-[10px] font-black uppercase tracking-widest">Teslimat</p>
              </div>
              <p class="font-bold text-[var(--brand-deep)]">{{ restaurant.eta }}</p>
            </div>
            <div>
              <div class="flex items-center gap-1.5 text-black/40 mb-1">
                <ShoppingBagIcon class="w-4 h-4" />
                <p class="text-[10px] font-black uppercase tracking-widest">Min. Tutar</p>
              </div>
              <p class="font-bold text-[var(--ink)]">{{ restaurant.minOrder }}</p>
            </div>
            <div>
              <div class="flex items-center gap-1.5 text-black/40 mb-1">
                <ShieldCheckIcon class="w-4 h-4 text-[var(--brand-deep)]" />
                <p class="text-[10px] font-black uppercase tracking-widest">Durum</p>
              </div>
              <p class="font-bold text-[var(--brand-deep)] text-xs">Açık</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Promotions & Coupons -->
      <section class="mb-6 space-y-4">
        <h2 class="font-heading text-xl font-bold text-[var(--ink)]">Kampanyalar & Kuponlar ({{ coupons.length }})</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            v-for="(coupon, i) in coupons"
            :key="coupon.title"
            class="bg-[var(--brand)]/10 border-2 border-dashed border-[var(--brand)]/40 rounded-xl p-4 flex items-center gap-4 relative overflow-hidden group hover:bg-[var(--brand)]/20 hover:border-[var(--brand)] transition-all cursor-pointer"
            :style="{ transitionDelay: `${i * 50}ms` }"
          >
            <div class="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <TicketIcon class="w-24 h-24" />
            </div>
            <div class="bg-[var(--brand)] text-white w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm">
              <TicketIcon class="w-6 h-6" />
            </div>
            <div class="flex-1 relative z-10">
              <p class="font-bold text-[var(--ink)]">{{ coupon.title }}</p>
              <p class="text-xs text-black/50">{{ coupon.subtitle }}</p>
            </div>
            <button class="text-[var(--brand-deep)] hover:text-[var(--brand)] transition-colors relative z-10" title="Kopyala">
              <DocumentDuplicateIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <!-- Main Content: Sidebar + Products -->
      <div class="flex flex-col lg:flex-row gap-6 items-start">
        <!-- Category Sidebar — tamamen gerçek veri, IntersectionObserver scroll-spy -->
        <aside class="hidden lg:block w-64 shrink-0 sticky top-28 self-start space-y-3">

          <!-- Özet kart -->
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-black/[0.05]">
            <p class="text-[10px] font-black text-black/30 uppercase tracking-widest mb-1">Menü Özeti</p>
            <div class="flex items-baseline gap-1.5">
              <span class="text-3xl font-black text-[var(--ink)]">{{ filteredProducts.length }}</span>
              <span class="text-sm text-black/40 font-bold">ürün</span>
            </div>
            <div class="flex items-center gap-3 mt-2 text-[11px] font-bold text-black/40">
              <span>{{ menuCategories.length }} kategori</span>
              <span>·</span>
              <span v-if="realPriceRange.min > 0">
                {{ formatPrice(realPriceRange.min) }} – {{ formatPrice(realPriceRange.max) }}
              </span>
            </div>
          </div>

          <!-- Kategori listesi -->
          <div class="bg-white rounded-2xl shadow-sm border border-black/[0.05] overflow-hidden">
            <div class="px-4 pt-4 pb-2">
              <p class="text-[10px] font-black text-black/30 uppercase tracking-widest">Kategoriler</p>
            </div>
            <nav class="pb-3 space-y-0.5 px-2">
              <!-- Tümü -->
              <button
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                :class="activeCategory === '__all__'
                  ? 'bg-[var(--brand-deep)] text-white shadow-sm'
                  : 'hover:bg-[var(--surface)] text-black/60'"
                @click="selectCategory('__all__')"
              >
                <span class="text-lg leading-none">🍽️</span>
                <span class="flex-1 font-bold text-sm">Tümü</span>
                <span class="text-[11px] font-black px-2 py-0.5 rounded-lg"
                  :class="activeCategory === '__all__' ? 'bg-white/20' : 'bg-black/5 text-black/40'">
                  {{ filteredProducts.length }}
                </span>
              </button>

              <!-- Dinamik kategoriler -->
              <button
                v-for="cat in menuCategories"
                :key="cat.id"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                :class="activeCategory === cat.id
                  ? 'bg-[var(--brand-deep)] text-white shadow-sm'
                  : 'hover:bg-[var(--surface)] text-black/60'"
                @click="selectCategory(cat.id)"
              >
                <span class="text-lg leading-none">{{ cat.emoji }}</span>
                <span class="flex-1 font-bold text-sm leading-tight">{{ cat.name }}</span>
                <span class="text-[11px] font-black px-2 py-0.5 rounded-lg shrink-0"
                  :class="activeCategory === cat.id ? 'bg-white/20' : 'bg-black/5 text-black/40'">
                  {{ cat.count }}
                </span>
              </button>
            </nav>
          </div>

          <!-- Fiyat filtresi (gerçek min-max'tan) -->
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-black/[0.05] space-y-4">
            <p class="text-[10px] font-black text-black/30 uppercase tracking-widest">Fiyat Filtresi</p>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="text-[9px] font-black text-black/30 uppercase tracking-widest block">Min (₺)</label>
                <input v-model.number="priceMin" type="number" min="0"
                  :placeholder="String(realPriceRange.min)"
                  class="w-full bg-[var(--surface)] rounded-xl px-3 py-2 text-sm font-black focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-all" />
              </div>
              <div class="space-y-1">
                <label class="text-[9px] font-black text-black/30 uppercase tracking-widest block">Max (₺)</label>
                <input v-model.number="priceMax" type="number" min="0"
                  :placeholder="String(realPriceRange.max)"
                  class="w-full bg-[var(--surface)] rounded-xl px-3 py-2 text-sm font-black focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-all" />
              </div>
            </div>
            <div class="space-y-1">
              <label class="text-[9px] font-black text-black/30 uppercase tracking-widest block">Sırala</label>
              <select v-model="sortBy"
                class="w-full bg-[var(--surface)] rounded-xl px-3 py-2 text-sm font-black focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-all appearance-none">
                <option value="default">Varsayılan</option>
                <option value="price_asc">En Ucuz Önce</option>
                <option value="price_desc">En Pahalı Önce</option>
                <option value="name_asc">A → Z</option>
              </select>
            </div>
            <button v-if="priceMin || priceMax || sortBy !== 'default'"
              class="w-full text-[10px] font-black text-[var(--brand-deep)] hover:underline"
              @click="priceMin = null; priceMax = null; sortBy = 'default'">
              Filtreleri Temizle
            </button>
          </div>

        </aside>

        <!-- Product Display Area -->
        <div class="flex-1 space-y-8">
          <!-- Arama + Filtre Çubuğu -->
          <div class="space-y-3">
            <!-- Arama kutusu -->
            <div class="bg-white p-4 rounded-xl shadow-sm border border-black/5 flex items-center gap-3">
              <MagnifyingGlassIcon class="w-5 h-5 text-black/30 shrink-0" />
              <input
                v-model="menuSearchQuery"
                type="text"
                placeholder="Menü içinde ara..."
                class="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:text-black/30"
              />
              <div class="flex items-center gap-2">
                <span v-if="menuSearchQuery" class="text-[10px] font-bold text-black/30 uppercase tracking-widest">
                  {{ filteredProducts.length }} Sonuç
                </span>
                <button
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  :class="showFilters ? 'bg-[var(--brand-deep)] text-white' : 'bg-[var(--surface)] text-black/60 hover:bg-[var(--surface-2)]'"
                  @click="showFilters = !showFilters"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                  </svg>
                  Filtrele
                </button>
                <button v-if="menuSearchQuery" @click="menuSearchQuery = ''" class="text-black/40 hover:text-red-500 transition-colors">
                  <XMarkIcon class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Genişleyen filtre paneli -->
            <div v-show="showFilters" class="bg-white rounded-xl border border-black/5 shadow-sm p-5 space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <!-- Fiyat aralığı -->
                <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-black/40 uppercase tracking-widest block">Min. Fiyat (₺)</label>
                  <input v-model.number="priceMin" type="number" min="0" placeholder="0"
                    class="w-full bg-[var(--surface)] rounded-lg px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-all" />
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-black/40 uppercase tracking-widest block">Maks. Fiyat (₺)</label>
                  <input v-model.number="priceMax" type="number" min="0" placeholder="Sınırsız"
                    class="w-full bg-[var(--surface)] rounded-lg px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-all" />
                </div>
                <!-- Sıralama -->
                <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-black/40 uppercase tracking-widest block">Sırala</label>
                  <select v-model="sortBy"
                    class="w-full bg-[var(--surface)] rounded-lg px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-all appearance-none">
                    <option value="default">Varsayılan</option>
                    <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
                    <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
                    <option value="name_asc">İsim: A → Z</option>
                  </select>
                </div>
              </div>
              <div class="flex items-center justify-between pt-2 border-t border-black/5">
                <span class="text-xs font-bold text-black/40">{{ filteredProducts.length }} ürün listeleniyor</span>
                <button class="text-xs font-black text-[var(--brand-deep)] hover:underline" @click="resetFilters">
                  Filtreleri Temizle
                </button>
              </div>
            </div>
          </div>

          <!-- Sonuç yok -->
          <div v-if="filteredProducts.length === 0" class="py-20 flex flex-col items-center justify-center gap-4 bg-white rounded-2xl border-2 border-dashed border-black/5">
            <div class="w-16 h-16 bg-[var(--surface)] rounded-full flex items-center justify-center">
              <MagnifyingGlassIcon class="w-8 h-8 text-black/20" />
            </div>
            <p class="font-bold text-black/40">Aradığınız kriterlere uygun ürün bulunamadı.</p>
            <button @click="resetFilters" class="text-[var(--brand-deep)] font-bold text-sm hover:underline">Filtreleri Temizle</button>
          </div>

          <!-- "Tümü" seçiliyken düz ürün grid -->
          <div v-if="activeCategory === '__all__'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <article
              v-for="(product, i) in filteredProducts"
              :key="product.id"
              @click="openProductModal(product)"
              class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300 group cursor-pointer border border-black/5"
              :style="{ transitionDelay: `${Math.min(i, 8) * 30}ms` }"
            >
              <div class="aspect-[16/9] w-full overflow-hidden">
                <img :src="product.image" :alt="product.name"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div class="p-4 space-y-1">
                <p class="text-[10px] font-bold text-[var(--brand-deep)] uppercase tracking-widest">{{ product.categoryName }}</p>
                <h4 class="font-bold text-[var(--ink)] text-sm leading-tight line-clamp-2">{{ product.name }}</h4>
                <p class="font-black text-[var(--brand-deep)]">{{ formatPrice(product.price) }}</p>
              </div>
            </article>
          </div>

          <!-- Kategori bazlı bölümler -->
          <template v-else>
          <section
            v-for="(category, catIndex) in menuCategories"
            :key="category.id"
            :id="category.id"
            class="scroll-mt-32 space-y-4"
          >
            <div class="flex items-center gap-3">
              <span class="text-2xl">{{ category.emoji }}</span>
              <h3 class="font-heading text-xl font-bold text-[var(--ink)]">
                {{ category.name }}
              </h3>
              <span class="px-2.5 py-0.5 bg-[var(--surface)] rounded-full text-[11px] font-black text-black/40">
                {{ getProductsByCategory(category.id).length }}
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-6">
              <article
                v-for="(product, i) in getProductsByCategory(category.id)"
                :key="product.name"
                @click="openProductModal(product)"
                class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group cursor-pointer border border-black/5"
                :style="{ transitionDelay: `${i * 40}ms` }"
              >
                <div class="aspect-[16/9] w-full overflow-hidden">
                  <img
                    :src="product.image"
                    :alt="product.name"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div class="p-4 space-y-2">
                  <div class="space-y-1">
                    <h4 class="font-bold text-[var(--ink)] group-hover:text-[var(--brand-deep)] transition-colors line-clamp-1">{{ product.name }}</h4>
                    <p class="text-sm text-black/50 line-clamp-2 h-12">{{ product.description }}</p>
                  </div>
                  <div class="flex items-center justify-between pt-2">
                    <p class="font-extrabold text-[var(--brand-deep)] text-xl">{{ product.price }} TL</p>
                    <button 
                      @click.stop="quickAddToCart(product)"
                      class="bg-[var(--brand-deep)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--brand)] transition-all flex items-center gap-2 shadow-sm"
                    >
                      <ShoppingBagIcon class="w-4 h-4" />
                      Sepete Ekle
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </section>
          </template>

          <!-- Ad Banner -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 24, filter: 'blur(10px)' }"
            :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 600, delay: 300, ease: [0.25, 0.46, 0.45, 0.94] } }"
            class="bg-[var(--brand-deep)] rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div class="absolute inset-0 opacity-10 pointer-events-none bg-gradient-to-r from-white via-transparent to-transparent"></div>
            <div class="z-10 text-white space-y-2">
              <p class="font-heading text-2xl md:text-3xl font-black tracking-tight">Hemen Sipariş Ver!</p>
              <p class="text-white/80">İlk siparişe özel 200 TL indirim fırsatını kaçırma.</p>
              <button class="bg-white text-[var(--brand-deep)] px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all mt-4">
                Siparişi Tamamla
              </button>
            </div>
            <div class="z-10 relative hidden md:block">
              <img
                class="w-64 h-64 object-contain drop-shadow-2xl"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhiwC4xByDFl6tpphzRT69_6rI5HopeEGqA1LA3kPrR6ap3Fd9ijUYRhfUUXCHxTkf2qnhu0pzxEKCevvoa1j8XmOcQr3IRkJ376_5BRpX4dS_yo6YrdihlCVa6fZu0H0ohg6lcl2RC572vv_q3b30F0otlRi8if4S9Gev06jmP7LUM-hUL-r11qzxhl7DPDy1vQbqHM384TLcVQJ46pPz5DMEWm3rUvka2XKegt4SgOuNgZzcmWQPOMr2Jv9-S5ja_k_HWitJPGE"
                alt="Premium Burger"
              />
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-[var(--surface)] mt-12">
      <div class="max-w-7xl mx-auto px-5 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="space-y-3">
          <span class="font-bold text-xl text-[var(--brand-deep)]">BazarX Go</span>
          <p class="text-sm text-black/50">Hızlı, taze ve güvenilir yemek teslimatı. Şehrin en iyi restoranları bir tık uzağınızda.</p>
          <div class="flex gap-3">
            <a class="w-10 h-10 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--brand-deep)] hover:bg-[var(--brand)] hover:text-white transition-all" href="#">
              <ShareIcon class="w-5 h-5" />
            </a>
            <a class="w-10 h-10 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--brand-deep)] hover:bg-[var(--brand)] hover:text-white transition-all" href="#">
              <HeartIcon class="w-5 h-5" />
            </a>
          </div>
        </div>
        <div>
          <h4 class="font-bold mb-3 text-[var(--ink)]">Şirket</h4>
          <ul class="space-y-2 text-sm">
            <li><a class="text-black/50 hover:text-[var(--brand-deep)] transition-all" href="#">Hakkımızda</a></li>
            <li><a class="text-black/50 hover:text-[var(--brand-deep)] transition-all" href="#">Restoran Ol</a></li>
            <li><a class="text-black/50 hover:text-[var(--brand-deep)] transition-all" href="#">Uygulamayı İndir</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-bold mb-3 text-[var(--ink)]">Destek</h4>
          <ul class="space-y-2 text-sm">
            <li><a class="text-black/50 hover:text-[var(--brand-deep)] transition-all" href="#">Gizlilik Politikası</a></li>
            <li><a class="text-black/50 hover:text-[var(--brand-deep)] transition-all" href="#">Kullanım Koşulları</a></li>
            <li><a class="text-black/50 hover:text-[var(--brand-deep)] transition-all" href="#">Yardım Merkezi</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-bold mb-3 text-[var(--ink)]">İletişim</h4>
          <p class="text-sm text-black/50">Bize ulaşın: destek@bazarxgo.com</p>
          <div class="mt-4 bg-[var(--surface-2)] p-4 rounded-xl">
            <p class="text-xs font-bold text-[var(--brand-deep)]">Mobil Uygulamayı İndir</p>
            <div class="flex gap-2 mt-2">
              <div class="w-full h-8 bg-black rounded flex items-center justify-center text-white text-[10px] font-bold">App Store</div>
              <div class="w-full h-8 bg-black rounded flex items-center justify-center text-white text-[10px] font-bold">Play Store</div>
            </div>
          </div>
        </div>
      </div>
      <div class="max-w-7xl mx-auto px-5 py-4 border-t border-black/10 text-center">
        <p class="text-xs text-black/40">© 2024 BazarX Go. Tüm hakları saklıdır.</p>
      </div>
    </footer>

    <!-- Product Detail Modal -->
    <Teleport to="body">
      <div
        v-if="showProductModal && selectedProduct"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="closeProductModal"
      >
        <div class="bg-white w-full max-w-[800px] max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
          <!-- Close Button -->
          <button
            @click="closeProductModal"
            class="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-md hover:bg-gray-100 transition-all active:scale-95"
          >
            <XMarkIcon class="w-5 h-5 text-[var(--ink)]" />
          </button>

          <!-- Product Image -->
          <div class="w-full md:w-1/2 h-[300px] md:h-auto overflow-hidden relative">
            <img
              :src="selectedProduct.image"
              :alt="selectedProduct.name"
              class="w-full h-full object-cover"
            />
            <div class="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent md:hidden"></div>
          </div>

          <!-- Content Section -->
          <div class="w-full md:w-1/2 flex flex-col h-full overflow-y-auto">
            <div class="p-6 flex flex-col gap-6">
              <!-- Header -->
              <div class="flex flex-col gap-2">
                <h2 class="text-2xl font-black text-[var(--ink)]">{{ selectedProduct.name }}</h2>
                <p class="text-sm text-black/60">{{ selectedProduct.description }}</p>
              </div>

               <!-- Dynamic Option Groups -->
              <div v-for="group in currentOptionGroups" :key="group.id" class="flex flex-col gap-3">
                <div class="flex justify-between items-center">
                  <h3 class="font-bold text-[var(--ink)]">{{ group.name }}</h3>
                  <span v-if="group.required" class="text-[10px] bg-[var(--brand)]/10 text-[var(--brand-deep)] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Zorunlu</span>
                </div>

                <div class="flex flex-col gap-2">
                  <!-- Radio Type -->
                  <template v-if="group.type === 'RADIO'">
                    <label
                      v-for="opt in group.options"
                      :key="opt.name"
                      class="flex items-center justify-between p-3 border rounded-xl hover:border-[var(--brand-deep)] cursor-pointer transition-all active:scale-[0.99]"
                      :class="selectedOptions[group.id] === opt.name ? 'border-[var(--brand-deep)] bg-[var(--brand)]/5 ring-1 ring-[var(--brand-deep)]/20' : 'border-black/5 bg-white'"
                    >
                      <div class="flex flex-col">
                        <span class="font-bold text-sm text-[var(--ink)]">{{ opt.name }}</span>
                        <span v-if="opt.price > 0" class="text-xs text-[var(--brand-deep)] font-bold">+{{ opt.price }} TL</span>
                      </div>
                      <input
                        v-model="selectedOptions[group.id]"
                        :value="opt.name"
                        :name="group.id"
                        type="radio"
                        class="w-5 h-5 text-[var(--brand-deep)] border-black/10 focus:ring-[var(--brand-deep)]"
                      />
                    </label>
                  </template>

                  <!-- Checkbox Type -->
                  <template v-else-if="group.type === 'CHECKBOX'">
                    <label
                      v-for="opt in group.options"
                      :key="opt.name"
                      class="flex items-center justify-between p-3 border rounded-xl hover:border-[var(--brand-deep)] cursor-pointer transition-all active:scale-[0.99]"
                      :class="selectedOptions[group.id]?.includes(opt.name) ? 'border-[var(--brand-deep)] bg-[var(--brand)]/5 ring-1 ring-[var(--brand-deep)]/20' : 'border-black/5 bg-white'"
                    >
                      <div class="flex flex-col">
                        <span class="font-bold text-sm text-[var(--ink)]">{{ opt.name }}</span>
                        <span v-if="opt.price > 0" class="text-xs text-[var(--brand-deep)] font-bold">+{{ opt.price }} TL</span>
                      </div>
                      <input
                        v-model="selectedOptions[group.id]"
                        :value="opt.name"
                        type="checkbox"
                        class="w-5 h-5 rounded text-[var(--brand-deep)] border-black/10 focus:ring-[var(--brand-deep)]"
                      />
                    </label>
                  </template>
                </div>
              </div>
            </div>

            <!-- Footer Action Area -->
            <div class="mt-auto p-6 bg-[var(--surface)] border-t border-black/10 flex items-center gap-4 sticky bottom-0">
              <!-- Quantity Selector -->
              <div class="flex items-center bg-white rounded-full p-1 border border-black/10">
                <button
                  @click="productQuantity = Math.max(1, productQuantity - 1)"
                  class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--surface)] transition-colors active:scale-90"
                >
                  <MinusIcon class="w-5 h-5 text-[var(--brand-deep)]" />
                </button>
                <span class="w-10 text-center font-bold text-lg">{{ productQuantity }}</span>
                <button
                  @click="productQuantity++"
                  class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--surface)] transition-colors active:scale-90"
                >
                  <PlusIcon class="w-5 h-5 text-[var(--brand-deep)]" />
                </button>
              </div>
              <!-- Add to Cart Button -->
              <button
                class="flex-1 bg-[var(--brand-deep)] text-white hover:bg-[var(--brand)] font-bold py-4 px-6 rounded-full transition-all active:scale-95 shadow-lg shadow-[var(--brand-deep)]/20 flex justify-between items-center"
                @click="handleAddToCart"
              >
                <span>Sepete Ekle</span>
                <span class="bg-white/10 px-3 py-1 rounded-lg font-bold text-lg">{{ getProductPrice() }} TL</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Mobile Bottom Navigation -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-black/10 flex justify-around items-center px-4 py-3 z-50">
      <NuxtLink class="flex flex-col items-center gap-1 text-[var(--brand-deep)] font-bold" to="/bazarx-go">
        <HomeIcon class="w-6 h-6" />
        <span class="text-[10px]">Anasayfa</span>
      </NuxtLink>
      <button @click="scrollToMenuSearch" class="flex flex-col items-center gap-1 text-black/50">
        <MagnifyingGlassIcon class="w-6 h-6" />
        <span class="text-[10px]">Ara</span>
      </button>
      <NuxtLink to="/bazarx-go/cart" class="flex flex-col items-center gap-1 text-black/50">
        <ShoppingBagIcon class="w-6 h-6" />
        <span class="text-[10px]">Sepetim</span>
      </NuxtLink>
      <button class="flex flex-col items-center gap-1 text-black/50">
        <UserCircleIcon class="w-6 h-6" />
        <span class="text-[10px]">Profil</span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  ShoppingBagIcon,
  StarIcon as StarSolid,
  ClockIcon,
  FireIcon,
  ShieldCheckIcon,
  TruckIcon,
  DocumentDuplicateIcon,
  TicketIcon,
  HomeIcon,
  CircleStackIcon,
  ShareIcon,
  SparklesIcon,
  ChevronDownIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'
import {
  StarIcon as StarFilled,
  HeartIcon,
  PlusIcon,
  XMarkIcon,
  MinusIcon
} from '@heroicons/vue/24/solid'

const authStore = useAuthStore()
const cartStore = useCartStore()

const logout = async () => {
  await authStore.logout()
  navigateTo('/auth/login')
}

definePageMeta({
  layout: false
})

const route = useRoute()
const restaurantId = route.params.id as string

const { vendor: vendorData, products: vendorProducts, fetchVendor, fetchProducts, loading: vendorLoading } = useVendorProfile()

onMounted(async () => {
  await Promise.all([
    fetchVendor(),
    fetchProducts({ limit: 100, vendorId: restaurantId })
  ])
  // Başlangıçta "Tümü" seçili
  activeCategory.value = '__all__'
  await nextTick()
  initScrollSpy()
})

// Search & Filtering
const menuSearchQuery = ref('')
const activeCategory = ref('')

interface RestaurantDetail {
  id: string
  name: string
  cuisine: string
  rating: number
  eta: string
  minOrder: string
  distance: string
  image: string
  sponsored: boolean
  verified: boolean
}

const restaurant = computed<RestaurantDetail>(() => {
  const v = vendorData.value as any
  if (!v) return {
    id: restaurantId,
    name: "Yükleniyor...",
    cuisine: "...",
    rating: 0,
    eta: "...",
    minOrder: "...",
    distance: "...",
    image: "https://placehold.co/600x400?text=Yukleniyor",
    sponsored: false,
    verified: false
  }
  
  const p = v.profile
  return {
    id: v.id,
    name: p?.storeName || 'İsimsiz Restoran',
    cuisine: p?.cuisineType || 'Genel Mutfak',
    rating: p?.rating || 0,
    eta: p?.avgPrepTime ? `${p.avgPrepTime} dk` : '30-40 dk',
    distance: '1.2km', 
    minOrder: p?.minOrderAmount ? `₺${p.minOrderAmount} Min.` : '₺0 Min.',
    image: p?.imageUrl || 'https://placehold.co/600x400?text=' + encodeURIComponent(p?.storeName || 'Restoran'),
    sponsored: p?.isFeatured || false,
    verified: true
  }
})

// Coupons — gerçek API entegrasyonuna hazır (şimdilik boş)
const coupons: { title: string; subtitle: string }[] = []

// Modal Selection State
const showProductModal = ref(false)
const selectedProduct = ref<any>(null)
const productQuantity = ref(1)

// Dynamic Selections State
const selectedOptions = ref<Record<string, any>>({})

// Selection Group Interface
interface Option {
  name: string
  price: number
}

interface OptionGroup {
  id: string
  name: string
  required: boolean
  type: 'RADIO' | 'CHECKBOX'
  options: Option[]
}

// Fallback logic for products without attributes
const getProductOptionGroups = (product: any): OptionGroup[] => {
  if (product?.attributes?.optionGroups) {
    return product.attributes.optionGroups
  }

  const name = (product?.name || '').toLowerCase()
  
  // Smart Defaults based on name
  if (name.includes('menü') || name.includes('burger')) {
    return [
      {
        id: 'drinks',
        name: 'İçecek Seçimi',
        required: true,
        type: 'RADIO',
        options: [
          { name: 'Coca-Cola (33 cl.)', price: 0 },
          { name: 'Coca-Cola Zero Sugar (33 cl.)', price: 0 },
          { name: 'Fanta (33 cl.)', price: 0 },
          { name: 'Sprite (33 cl.)', price: 0 },
          { name: 'Ayran (30 cl.)', price: 0 },
          { name: 'Su (50 cl.)', price: 0 }
        ]
      },
      {
        id: 'fries',
        name: 'Patates Seçimi',
        required: false,
        type: 'RADIO',
        options: [
          { name: 'Normal Boy Patates', price: 0 },
          { name: 'Büyük Boy Patates', price: 35 },
          { name: 'Tırtıklı Patates', price: 15 }
        ]
      },
      {
        id: 'extras',
        name: 'Ekstra Malzemeler',
        required: false,
        type: 'CHECKBOX',
        options: [
          { name: 'Ekstra Peynir', price: 25 },
          { name: 'Jalapeno Biberi', price: 15 },
          { name: 'Turşu', price: 10 },
          { name: 'Pastırma', price: 45 }
        ]
      }
    ]
  }

  if (name.includes('pizza')) {
    return [
      {
        id: 'crust',
        name: 'Kenar Seçimi',
        required: true,
        type: 'RADIO',
        options: [
          { name: 'Normal Kenar', price: 0 },
          { name: 'Peynir Dolgulu Kenar', price: 45 },
          { name: 'Susamlı Kenar', price: 10 }
        ]
      },
      {
        id: 'toppings',
        name: 'Ekstra Malzemeler',
        required: false,
        type: 'CHECKBOX',
        options: [
          { name: 'Mısır', price: 15 },
          { name: 'Zeytin', price: 15 },
          { name: 'Mantar', price: 20 },
          { name: 'Sucuk', price: 35 }
        ]
      }
    ]
  }

  return []
}

const currentOptionGroups = computed(() => getProductOptionGroups(selectedProduct.value))

function getProductPrice() {
  if (!selectedProduct.value) return 0
  
  let basePrice = Number(selectedProduct.value.price || 0)
  let extrasPrice = 0

  // Calculate prices from selected options
  currentOptionGroups.value.forEach(group => {
    const selection = selectedOptions.value[group.id]
    if (!selection) return

    if (group.type === 'RADIO') {
      const opt = group.options.find(o => o.name === selection)
      if (opt) extrasPrice += opt.price
    } else if (group.type === 'CHECKBOX' && Array.isArray(selection)) {
      selection.forEach(optName => {
        const opt = group.options.find(o => o.name === optName)
        if (opt) extrasPrice += opt.price
      })
    }
  })

  return (basePrice + extrasPrice) * productQuantity.value
}

async function handleAddToCart() {
  if (!selectedProduct.value) return
  
  const { $toast } = useNuxtApp() as any
  
  // Check required options
  const missingRequired = currentOptionGroups.value.find(g => g.required && !selectedOptions.value[g.id])
  if (missingRequired) {
    $toast.error(`${missingRequired.name} yapmalısınız`)
    return
  }

  try {
    const options = { ...selectedOptions.value }
    
    const productForCart = {
      ...selectedProduct.value,
      price: getProductPrice() / productQuantity.value,
      options
    }
    
    const res = await cartStore.addToCart(
      selectedProduct.value.id, 
      productQuantity.value, 
      undefined, 
      productForCart,
      selectedProduct.value.listingId
    )
    
    if (res.success) {
      $toast.success(`${selectedProduct.value.name} sepete eklendi`)
      closeProductModal()
    } else {
      $toast.error('Ürün sepete eklenemedi')
    }
  } catch (error) {
    console.error('Add to cart error:', error)
    $toast.error('Bir hata oluştu')
  }
}

async function quickAddToCart(product: any) {
  const { $toast } = useNuxtApp() as any
  
  const groups = getProductOptionGroups(product)
  const hasRequired = groups.some(g => g.required)
  
  if (hasRequired) {
    openProductModal(product)
    return
  }

  try {
    const res = await cartStore.addToCart(product.id, 1, undefined, product, product.listingId)
    if (res.success) {
      $toast.success(`${product.name} sepete eklendi`)
    } else {
      $toast.error('Ürün sepete eklenemedi')
    }
  } catch (error) {
    console.error('Quick add to cart error:', error)
    $toast.error('Bir hata oluştu')
  }
}

function openProductModal(product: any) {
  selectedProduct.value = product
  productQuantity.value = 1
  
  // Initialize selections with defaults
  const groups = getProductOptionGroups(product)
  const initial: Record<string, any> = {}
  groups.forEach(g => {
    if (g.type === 'RADIO') {
      // Default to first option if required
      initial[g.id] = g.required ? g.options[0].name : ''
    } else {
      initial[g.id] = []
    }
  })
  selectedOptions.value = initial
  showProductModal.value = true
}

function closeProductModal() {
  showProductModal.value = false
  selectedProduct.value = null
}

// Popular filters
// ── Detaylı Filtreler ─────────────────────────────────────────────────────
const priceMin    = ref<number | null>(null)
const priceMax    = ref<number | null>(null)
const sortBy      = ref<'default' | 'price_asc' | 'price_desc' | 'name_asc'>('default')
const showFilters = ref(false)

// popularFilters sidebar'dan kaldırıldı — fiyat/sort sidebar'a taşındı

// Dynamic products and categories
const products = computed(() => {
  return vendorProducts.value.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    listingId: p.listings?.[0]?.id || p.listingId,
    categoryId: p.Category?.id || p.categoryId || 'other',
    categoryName: p.Category?.name || 'Diğer',
    name: p.name,
    description: p.description || '',
    price: p.price,
    image: p.images?.[0] || (typeof p.image === 'string' ? p.image : p.image?.url) || 'https://placehold.co/300x300?text=' + encodeURIComponent(p.name || 'Urun')
  }))
})

const filteredProducts = computed(() => {
  let result = [...products.value]

  // Metin araması
  if (menuSearchQuery.value) {
    const q = menuSearchQuery.value.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    )
  }

  // Fiyat aralığı
  if (priceMin.value !== null) result = result.filter(p => (p.price ?? 0) >= priceMin.value!)
  if (priceMax.value !== null) result = result.filter(p => (p.price ?? 0) <= priceMax.value!)

  // Sıralama
  if (sortBy.value === 'price_asc')  result.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
  if (sortBy.value === 'price_desc') result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
  if (sortBy.value === 'name_asc')   result.sort((a, b) => a.name.localeCompare(b.name, 'tr'))

  return result
})

const resetFilters = () => {
  menuSearchQuery.value = ''
  priceMin.value        = null
  priceMax.value        = null
  sortBy.value          = 'default'
}

// ── Kategori emoji eşleşmesi (kategori adına göre otomatik) ──────────────
const CATEGORY_EMOJI_MAP: { keywords: string[]; emoji: string }[] = [
  { keywords: ['burger', 'hamburger'],               emoji: '🍔' },
  { keywords: ['pizza'],                             emoji: '🍕' },
  { keywords: ['döner', 'doner', 'kebap', 'kebab'],  emoji: '🌯' },
  { keywords: ['tavuk', 'chicken', 'kanat'],         emoji: '🍗' },
  { keywords: ['tatlı', 'tatli', 'dessert', 'pasta', 'waffle', 'cheesecake'], emoji: '🍰' },
  { keywords: ['kahve', 'coffee', 'espresso'],       emoji: '☕' },
  { keywords: ['içecek', 'icecek', 'drink', 'smoothie', 'limonata'], emoji: '🥤' },
  { keywords: ['salata', 'salad', 'vejetaryen'],     emoji: '🥗' },
  { keywords: ['dondurma', 'ice cream'],             emoji: '🍦' },
  { keywords: ['makarna', 'pasta', 'noodle'],        emoji: '🍝' },
  { keywords: ['et', 'steak', 'biftek', 'ızgara', 'izgara'], emoji: '🥩' },
  { keywords: ['deniz', 'balik', 'balık', 'seafood'],emoji: '🐟' },
  { keywords: ['meze', 'aperatif', 'başlangıç'],    emoji: '🫙' },
  { keywords: ['çorba', 'corba', 'soup'],            emoji: '🥣' },
  { keywords: ['pide', 'lahmacun', 'fırın'],         emoji: '🫓' },
  { keywords: ['sandviç', 'sandwich', 'wrap'],       emoji: '🥪' },
]

const getCategoryEmoji = (name: string): string => {
  const lower = name.toLowerCase()
  for (const { keywords, emoji } of CATEGORY_EMOJI_MAP) {
    if (keywords.some(k => lower.includes(k))) return emoji
  }
  return '🍽️'
}

// Gerçek fiyat aralığı (tüm products üzerinden)
const realPriceRange = computed(() => {
  const prices = products.value.map(p => Number(p.price) || 0).filter(p => p > 0)
  if (prices.length === 0) return { min: 0, max: 0 }
  return { min: Math.min(...prices), max: Math.max(...prices) }
})

const formatPrice = (v: number): string =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(v)

// Kategoriler — gerçek ürün verisiyle, count ve emoji dahil
const menuCategories = computed(() => {
  const catsMap: Record<string, { id: string; name: string; emoji: string; count: number }> = {}
  // Tüm products'tan (filtre uygulanmamış) kategori listesi
  products.value.forEach(p => {
    if (!catsMap[p.categoryId]) {
      catsMap[p.categoryId] = {
        id:    p.categoryId,
        name:  p.categoryName,
        emoji: getCategoryEmoji(p.categoryName),
        count: 0,
      }
    }
    // filteredProducts'ta bu ürün varsa sayacı artır
    if (filteredProducts.value.some(fp => fp.id === p.id)) {
      catsMap[p.categoryId].count++
    }
  })
  return Object.values(catsMap).filter(c => c.count > 0)
})

// Kategori seçimi — '__all__' tümünü gösterir, diğerleri scroll + highlight
const selectCategory = (categoryId: string) => {
  activeCategory.value = categoryId
  if (categoryId === '__all__') return
  const el = document.getElementById(categoryId)
  if (el) {
    const offset = 120 // sticky header yüksekliği
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

// IntersectionObserver — scroll sırasında aktif kategoriyi otomatik güncelle
let observer: IntersectionObserver | null = null

const initScrollSpy = () => {
  if (!import.meta.client) return
  observer?.disconnect()
  observer = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeCategory.value = entry.target.id
          break
        }
      }
    },
    { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
  )
  menuCategories.value.forEach(cat => {
    const el = document.getElementById(cat.id)
    if (el) observer!.observe(el)
  })
}

// Filtrelenmiş ürünler değişince scroll-spy'ı yeniden başlat
watch(menuCategories, async () => {
  await nextTick()
  initScrollSpy()
}, { flush: 'post' })

// Kategori bölümleri için ürün listesi
const getProductsByCategory = (categoryId: string) => {
  return filteredProducts.value.filter(p => p.categoryId === categoryId)
}

const scrollToMenuSearch = () => {
  const el = document.querySelector('input[placeholder="Menü içinde ara..."]')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    ;(el as HTMLInputElement).focus()
  }
}

onUnmounted(() => observer?.disconnect())

useHead({
  title: `${restaurant.value.name} - BazarX Go`,
  meta: [
    { name: 'description', content: `${restaurant.value.name} - ${restaurant.value.cuisine}. ${restaurant.value.eta} teslimat. BazarX Go ile sipariş verin.` }
  ]
})
</script>

<style scoped>
.bazarx-go {
  --bg: #f8f9fa;
  --surface: #f3f4f5;
  --surface-2: #e7e8e9;
  --ink: #1c1b1b;
  --brand: #00c371;
  --brand-deep: #006d3d;
  --brand-soft: #64fea5;
  --accent: #ffb59a;
  --accent-deep: #a73a00;
  --accent-container: #ff8a5b;
  --outline: #bbcbbc;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>