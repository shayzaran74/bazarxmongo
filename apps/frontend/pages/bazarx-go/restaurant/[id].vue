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
        <!-- Category Sidebar -->
        <aside
          v-motion
          :initial="{ opacity: 0, x: -24, filter: 'blur(10px)' }"
          :visible-once="{ opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 600, delay: 200, ease: [0.25, 0.46, 0.45, 0.94] } }"
          class="hidden lg:block w-72 sticky top-28 bg-white rounded-xl p-4 space-y-4 shadow-sm"
        >
          <!-- Categories -->
          <div class="space-y-2">
            <h4 class="text-xs font-bold text-black/40 uppercase tracking-wider px-2 py-1">Kategoriler</h4>
            <nav class="space-y-1">
              <a
                v-for="(cat, i) in menuCategories"
                :key="cat.name"
                :href="`#${cat.id}`"
                class="flex items-center gap-3 p-3 rounded-xl transition-all"
                :class="activeCategory === cat.id
                  ? 'bg-[var(--brand)] text-white shadow-sm'
                  : 'hover:bg-[var(--surface)] text-black/60 hover:text-[var(--brand-deep)]'"
                :style="{ transitionDelay: `${i * 30}ms` }"
              >
                <div class="w-8 h-8 rounded-lg grid place-items-center bg-black/5 group-hover:bg-white/20">
                  <component :is="getCategoryIcon(cat.icon)" class="w-4 h-4" />
                </div>
                <span class="flex-1 font-medium text-sm">{{ cat.name }}</span>
                <span v-if="cat.badge" class="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">{{ cat.badge }}</span>
              </a>
            </nav>
          </div>

          <!-- Price Range -->
          <div class="space-y-2 pt-4 border-t border-black/10">
            <h4 class="text-xs font-bold text-black/40 uppercase tracking-wider px-2">Fiyat Aralığı</h4>
            <div class="space-y-1">
              <label v-for="range in priceRanges" :key="range" class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--surface)] cursor-pointer transition-colors group">
                <input class="rounded border-black/20 text-[var(--brand-deep)] focus:ring-[var(--brand)] w-4 h-4" type="checkbox" />
                <span class="text-sm text-black/60 group-hover:text-[var(--ink)]">{{ range }}</span>
              </label>
            </div>
          </div>

          <!-- Popular Filters -->
          <div class="space-y-2 pt-4 border-t border-black/10">
            <h4 class="text-xs font-bold text-black/40 uppercase tracking-wider px-2">Popüler Filtreler</h4>
            <div class="flex flex-wrap gap-2 px-2">
              <button
                v-for="filter in popularFilters"
                :key="filter.label"
                class="px-3 py-1.5 rounded-full border border-black/20 text-xs font-medium hover:border-[var(--brand)] hover:text-[var(--brand-deep)] transition-all flex items-center gap-1"
              >
                <component :is="filter.icon" class="w-4 h-4" />
                {{ filter.label }}
              </button>
            </div>
          </div>
        </aside>

        <!-- Product Display Area -->
        <div class="flex-1 space-y-8">
          <!-- Menu Search -->
          <div class="bg-white p-4 rounded-xl shadow-sm border border-black/5 flex items-center gap-3">
            <MagnifyingGlassIcon class="w-5 h-5 text-black/30" />
            <input
              v-model="menuSearchQuery"
              type="text"
              placeholder="Menü içinde ara..."
              class="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:text-black/30"
            />
            <div v-if="menuSearchQuery" class="flex items-center gap-2">
              <span class="text-[10px] font-bold text-black/30 uppercase tracking-widest">{{ filteredProducts.length }} Sonuç</span>
              <button @click="menuSearchQuery = ''" class="text-black/40 hover:text-red-500 transition-colors">
                <XMarkIcon class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- No Results -->
          <div v-if="filteredProducts.length === 0" class="py-20 flex flex-col items-center justify-center gap-4 bg-white rounded-2xl border-2 border-dashed border-black/5">
            <div class="w-16 h-16 bg-[var(--surface)] rounded-full flex items-center justify-center">
              <MagnifyingGlassIcon class="w-8 h-8 text-black/20" />
            </div>
            <p class="font-bold text-black/40">Aradığınız kriterlere uygun ürün bulunamadı.</p>
            <button @click="menuSearchQuery = ''" class="text-[var(--brand-deep)] font-bold text-sm hover:underline">Aramayı Temizle</button>
          </div>

          <!-- Menu Sections -->
          <section
            v-for="(category, catIndex) in menuCategories"
            :key="category.id"
            :id="category.id"
            class="scroll-mt-28 space-y-4"
          >
            <div class="flex items-center justify-between">
              <h3 class="font-heading text-xl md:text-2xl font-bold text-[var(--ink)] border-l-4 border-[var(--brand)] pl-4">
                {{ category.name }}
                <span class="text-black/40 text-base font-normal">({{ getProductsByCategory(category.id).length }} Ürün)</span>
              </h3>
              <div class="relative w-full max-w-xs hidden md:block">
                <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                <input
                  class="w-full bg-[var(--surface)] border-none rounded-full py-2 pl-10 pr-4 text-sm"
                  :placeholder="`${category.name} içinde ara...`"
                  type="text"
                />
              </div>
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
import { ref, computed, onMounted } from 'vue'
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
    fetchProducts({ limit: 100 })
  ])
  
  if (menuCategories.value.length > 0) {
    activeCategory.value = menuCategories.value[0].id
  }
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

// Coupons (Keep mock for now or fetch if available)
const coupons = [
  {
    title: '200 TL İndirim',
    subtitle: 'Kupon Kodu: ILKYEMEK200'
  },
  {
    title: "Arby's İkilim 210 TL!",
    subtitle: 'Seçili ürünlerde özel fiyat'
  }
]

// Price ranges
const priceRanges = ['0 TL - 150 TL', '150 TL - 300 TL', '300 TL+']

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
const popularFilters = [
  { label: 'Ücretsiz Teslimat', icon: TruckIcon },
  { label: '4.5+ Puan', icon: StarFilled },
  { label: 'İndirimli', icon: FireIcon }
]

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
  if (!menuSearchQuery.value) return products.value
  const q = menuSearchQuery.value.toLowerCase()
  return products.value.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.description.toLowerCase().includes(q)
  )
})

const menuCategories = computed(() => {
  const catsMap: Record<string, any> = {}
  filteredProducts.value.forEach(p => {
    if (!catsMap[p.categoryId]) {
      catsMap[p.categoryId] = {
        id: p.categoryId,
        name: p.categoryName,
        icon: 'stars',
        badge: null
      }
    }
  })
  return Object.values(catsMap)
})

// Helper function to get products by category
const getProductsByCategory = (categoryId: string) => {
  return filteredProducts.value.filter(p => p.categoryId === categoryId)
}

const scrollToMenuSearch = () => {
  const el = document.querySelector('input[placeholder="Menü içinde ara..."]')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // @ts-ignore
    el.focus()
  }
}

// Icon helper for categories
const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'stars': return SparklesIcon
    case 'favorite': return HeartIcon
    case 'lunch_dining': return FireIcon
    case 'fastfood': return ShoppingBagIcon
    case 'cake': return FireIcon
    case 'local_drink': return ShoppingBagIcon
    default: return SparklesIcon
  }
}

// Scroll to category on click
const scrollToCategory = (categoryId: string) => {
  activeCategory.value = categoryId
  const element = document.getElementById(categoryId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

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