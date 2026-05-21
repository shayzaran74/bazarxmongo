<!-- apps/frontend/pages/bazarx-go.vue -->
<template>
  <div class="bazarx-go min-h-screen bg-[var(--bg)] text-[var(--ink)] antialiased">
    <!-- Üst durum bar — canlı teslimat süresi ve adres -->
    <div class="bg-[var(--ink)] text-white/85 text-[11px] tracking-[0.18em] uppercase">
      <div class="max-w-7xl mx-auto px-5 py-2 flex items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full rounded-full bg-[var(--brand)] opacity-75 animate-ping"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--brand)]"></span>
          </span>
          <span class="font-semibold">{{ displayLocation === 'Konum' ? 'Acıbadem Mah.' : displayLocation }}</span>
          <span class="opacity-50">•</span>
          <span>Tahmini Teslimat <b class="text-[var(--brand-soft)]">18 dk</b></span>
        </div>
        <div class="hidden md:flex items-center gap-4">
          <span class="opacity-70">Hava 22°</span>
          <span class="opacity-30">|</span>
          <span class="opacity-70">Kurye <b class="text-white">Murat K.</b></span>
        </div>
      </div>
    </div>

    <!-- Header — Sticky -->
    <header class="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-black/[0.06] shadow-[0_1px_0_rgba(0,0,0,0.02)]">
      <div class="max-w-7xl mx-auto flex items-center justify-between px-5 py-3 gap-6">
        <!-- Marka -->
        <NuxtLink to="/" class="flex items-center gap-3 min-w-fit group">
          <div class="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-deep)] grid place-items-center text-white shadow-lg shadow-[var(--brand)]/30 group-hover:scale-105 transition-transform">
            <BoltIcon class="w-5 h-5" />
            <span class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[var(--accent)] ring-2 ring-white"></span>
          </div>
          <div class="hidden sm:flex flex-col leading-none">
            <span class="font-black text-[15px] tracking-tight text-[var(--ink)]">BazarX <span class="text-[var(--brand)]">Go</span></span>
            <span class="text-[10px] tracking-[0.2em] uppercase text-black/40 font-bold mt-0.5">Hızlı Teslimat</span>
          </div>
        </NuxtLink>

        <!-- Adres seçici (lg) -->
        <button
          @click="detectLocation()"
          class="hidden lg:flex items-center gap-2 px-3 py-2 bg-[var(--surface)] hover:bg-[var(--surface-2)] rounded-full transition-all group"
          :class="{ 'animate-pulse': locationLoading }"
        >
          <MapPinIcon class="w-4 h-4 text-[var(--brand)]" />
          <span class="text-xs font-semibold text-[var(--ink)] truncate max-w-[150px]">
            {{ displayLocation === 'Konum' ? 'Konum Bul' : displayLocation }}
          </span>
          <ArrowPathIcon v-if="locationLoading" class="w-3 h-3 animate-spin text-[var(--brand)]" />
          <ChevronDownIcon v-else class="w-3.5 h-3.5 text-black/40 group-hover:text-[var(--brand)] transition-transform group-hover:rotate-180" />
        </button>

        <!-- Arama -->
        <div class="flex-1 max-w-2xl relative">
          <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
          <input
            v-model="search"
            type="text"
            placeholder="BazarX Go'da ara — meyve, döner, su…"
            class="w-full pl-11 pr-12 py-2.5 bg-[var(--surface)] border border-transparent focus:border-[var(--brand)] focus:bg-white rounded-full text-sm font-medium placeholder-black/35 focus:outline-none focus:ring-4 focus:ring-[var(--brand)]/10 transition-all"
          />
          <kbd class="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold text-black/40 bg-white border border-black/10 rounded-md">⌘K</kbd>
        </div>

        <!-- Aksiyonlar -->
        <div class="flex items-center gap-2">
          <!-- Giriş Yap / Profil -->
          <template v-if="!authStore.isLoggedIn">
            <NuxtLink to="/auth/login" class="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[var(--ink)] hover:text-[var(--brand)] transition-colors">
              <UserCircleIcon class="w-5 h-5" />
              Giriş Yap
            </NuxtLink>
          </template>
          <template v-else>
            <div class="relative group/user">
              <button class="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[var(--surface)] hover:bg-[var(--surface-2)] rounded-full transition-all group border border-transparent hover:border-[var(--brand)]/20">
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
                <NuxtLink to="/wallet" class="flex items-center gap-3 px-3 py-2.5 hover:bg-emerald-50 rounded-xl text-xs font-bold text-emerald-600 transition-colors">
                  <CreditCardIcon class="w-4 h-4 text-emerald-500" />
                  Cüzdanım
                  <span v-if="authStore.balance" class="ml-auto text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    ₺{{ authStore.balance }}
                  </span>
                </NuxtLink>
                <div class="my-1 border-t border-black/[0.04]"></div>
                <button @click="logout" class="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-xl text-xs font-bold text-red-600 transition-colors text-left">
                  <ArrowLeftOnRectangleIcon class="w-4 h-4 text-red-400" />
                  Çıkış Yap
                </button>
              </div>
            </div>
          </template>

          <button class="relative w-10 h-10 grid place-items-center text-black/60 hover:text-[var(--brand)] hover:bg-[var(--surface)] rounded-full transition-colors">
            <BellIcon class="w-5 h-5" />
            <span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--accent)] ring-2 ring-white"></span>
          </button>
          
          <NuxtLink to="/bazarx-go/cart" class="flex items-center gap-2 pl-3 pr-4 py-2.5 bg-[var(--ink)] hover:bg-[var(--brand-deep)] text-white rounded-full text-xs font-bold tracking-wide transition-all active:scale-95 shadow-lg shadow-black/10">
            <ShoppingBagIcon class="w-4 h-4" />
            <span>Sepetim</span>
            <span v-if="cartStore.itemCount > 0" class="ml-1 px-1.5 py-0.5 bg-[var(--brand)] rounded-full text-[10px] font-black">
              {{ cartStore.itemCount }}
            </span>
          </NuxtLink>
        </div>
      </div>

      <!-- Hızlı kategori sekmeleri -->
      <nav class="border-t border-black/[0.04] bg-white/60">
        <div class="max-w-7xl mx-auto flex items-center gap-1 px-5 overflow-x-auto hide-scrollbar">
          <button
            v-for="(tab, i) in tabs"
            :key="tab.label"
            @click="activeTab = i"
            class="relative whitespace-nowrap px-4 py-3 text-xs font-bold tracking-wide transition-colors"
            :class="activeTab === i ? 'text-[var(--brand-deep)]' : 'text-black/45 hover:text-[var(--ink)]'"
          >
            {{ tab.label }}
            <span
              v-if="activeTab === i"
              class="absolute left-3 right-3 -bottom-px h-[3px] bg-[var(--brand)] rounded-full"
            ></span>
          </button>
        </div>
      </nav>
    </header>

    <!-- ======================== YEMEK SEKMESİ (activeTab === 1) ======================== -->
    <template v-if="activeTab === 1">
      <main class="max-w-7xl mx-auto px-5 py-6">
        <!-- Multi-layered Banner System -->
        <section class="mb-6 space-y-4">
          <!-- Ana Banner Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <!-- Sol — Büyük kampanya banner -->
            <div
              v-motion
              :initial="{ opacity: 0, y: 28, filter: 'blur(12px)' }"
              :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 700, ease: [0.25, 0.46, 0.45, 0.94] } }"
              class="lg:col-span-2 relative overflow-hidden rounded-xl h-64 md:h-80 bg-[var(--brand-deep)] flex items-center p-6 md:p-8 shadow-lg group"
            >
              <!-- Gradient overlay -->
              <div class="absolute inset-0 bg-gradient-to-r from-[var(--brand-deep)] via-[var(--brand-deep)]/80 to-transparent"></div>
              <!-- Görsel sağda -->
              <div class="absolute right-0 top-0 h-full w-1/2 opacity-90">
                <img
                  class="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6ttoH0t7_fzEUWlw6nl4wVyYBwyPwxILJSkXp7lTm8c1ZLecQEqMkT74D0kufhRY1pLrkvlnMFDq6v3kUERndYlTXIIYJmp1wljcFg8G0whICwM7g5nbFkFXYLZTQlHt6bwUMRwWOmU_r8BhtDviVRV8C1tlEBLSpxozOXhf3cqJgx70itwcpd7pEXLP3hojrQTGYFbKcV5XeUV_GxNH1_6JBRm927Q0EVK3773PS7hKHNwzwH44GD71tKST9nQ5URjGCARGKzo0"
                  alt="BazarX Freshness"
                />
              </div>
              <!-- İçerik -->
              <div class="relative z-10 text-white max-w-md">
                <span class="inline-block bg-[var(--brand-soft)] text-[var(--brand-deep)] px-3 py-1.5 rounded-lg font-bold text-xs mb-3">KAMPANYA</span>
                <h1 class="font-heading text-2xl md:text-3xl lg:text-headline-lg font-black leading-tight mb-2">İlk market siparişine %50 indirim!</h1>
                <p class="text-white/90 text-sm mb-4">BazarX Go ile ilk alışverişinde büyük tasarruf yap. Taze ürünler kapında.</p>
                <div class="flex gap-2">
                  <button class="bg-white text-[var(--brand-deep)] px-5 py-2 rounded-full font-bold text-xs hover:bg-[var(--brand-soft)] transition-colors shadow-md">Hemen Al</button>
                  <button class="border-2 border-white/30 text-white px-5 py-2 rounded-full font-bold text-xs hover:bg-white/10 transition-colors">Detaylar</button>
                </div>
              </div>
            </div>

            <!-- Sağ — "Aç mısın?" kart -->
            <div
              v-motion
              :initial="{ opacity: 0, y: 28, filter: 'blur(12px)' }"
              :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 700, delay: 100, ease: [0.25, 0.46, 0.45, 0.94] } }"
              class="bg-[var(--accent-container)] text-[var(--accent-deep)] rounded-xl p-6 md:p-8 flex flex-col justify-between shadow-lg relative overflow-hidden"
            >
              <div class="relative z-10">
                <h2 class="font-heading text-2xl md:text-3xl font-black leading-tight mb-1">Aç mısın?</h2>
                <p class="text-[var(--accent-deep)]/80 text-sm">Favori restoranlarından sıcak yemekler 30 dakikada kapında.</p>
              </div>
              <button class="w-full bg-[var(--accent-deep)] text-white py-3 rounded-full font-bold text-sm mt-4 relative z-10 hover:bg-[var(--accent-deep)]/90 transition-all shadow-md active:scale-95">Yemek Keşfet</button>
              <!-- Arka plan ikon -->
              <div class="absolute -right-6 -bottom-6 opacity-20">
                <BuildingStorefrontIcon class="w-32 h-32" />
              </div>
            </div>
          </div>

          <!-- Orange Banner Strip -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 24, filter: 'blur(10px)' }"
            :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 600, delay: 150, ease: [0.25, 0.46, 0.45, 0.94] } }"
            class="bg-[var(--accent-container)] rounded-xl p-4 flex items-center justify-center gap-4 overflow-hidden relative min-h-[80px]"
          >
            <div class="flex items-center gap-3">
              <img alt="Coca Cola" class="h-8 brightness-0 invert" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDI94tPeSHVVMzzUG007FLhD9jLxypB4KM743YfO71TI6KRqi379UecS3k3bonTLTLQSYw3bzICuIHe4wAdW5mfanWcXmexADq_10_mA3cPNsZDOlTgPzncWeG2etqAa5OCKcnUoTVE5betze621jwoFovB_tjBp429sVHhcR9RdALt-HJ37MxpHjLePhP_Ynz7geGFuCjgg1oS5Wq9HHJKJ5i5m0UIiF7XUc65nJIX1RcXo9jdVXxPw-xQJjNd7rhhY0QnUWDe3mc" />
              <span class="text-[var(--accent-deep)] font-bold text-lg md:text-xl italic">DOYURAN MENÜ FIRSATLARI KAPINDA!</span>
            </div>
            <div class="hidden lg:flex gap-4">
              <img alt="Promo Food" class="h-16 w-16 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4DITaw38NiElHYD4qtM5rczZjp6N1bhCo6emuMpWprbu8bjRBAIaM5-GSSuf4IVffLLbzhzy8pEcHtL7yD5ceZgypmfXQ2cAt2J6B4LOLoEJoL6-YP73Thr1PwMvYBHig-hopHDcCP_47pEHiVTsHfdyeHp22k9pF_G01KVLIK-LKy46m9QgN_9plcH1NXC3BESNWObqsvb7K1w6j3oEX0MaICPUD6dZm68Ok1f3ZQDFgXLQ1rXRvjFSjTS0DV89ps2cvIqjxxIk" />
              <img alt="Promo Food" class="h-16 w-16 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAdJ9iCBB1lF0XC2WKj7ANgUhYMAurKg-IXtynSSBSpsuPeRzEGhF_Ezlr8Ra9vVX3O1fm8KywpPmCnOnkrmUsObP-IWJNGErWqaYczM87yrk1JBstpxFI7FmwzEHmR3DEwhL5cY4FaggGNRMgv-Ki3E5DJv_JxQnHW7hlKfcP6lBSX8x6ZKmfACFS9EEvCuxGWffXHRE4aA1sXwBle35ntRWyeNCp5F9frSCzKT3rm1aDN8dyffDT89BpgMkbu0E_PjAB8ImQBYg" />
            </div>
          </div>
        </section>

        <!-- Sidebar + Main Content -->
        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Filter Sidebar -->
          <aside
            v-motion
            :initial="{ opacity: 0, x: -24, filter: 'blur(10px)' }"
            :visible-once="{ opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 600, delay: 200, ease: [0.25, 0.46, 0.45, 0.94] } }"
            class="w-full lg:w-72 flex-shrink-0 space-y-5 bg-white p-5 rounded-xl border border-black/[0.06] h-fit sticky top-32"
          >
            <!-- Sıralama -->
            <div>
              <h3 class="text-sm font-bold text-[var(--ink)] mb-3">Sıralama</h3>
              <div class="space-y-2">
                <label v-for="sort in sortOptions" :key="sort" class="flex items-center gap-2 cursor-pointer group">
                  <input :checked="activeSort === sort" @change="activeSort = sort" class="text-[var(--brand)] focus:ring-[var(--brand)] h-4 w-4" name="sort" type="radio" />
                  <span class="text-sm text-black/60 group-hover:text-[var(--brand)] transition-colors">{{ sort }}</span>
                </label>
              </div>
            </div>

            <!-- Mutfaklar -->
            <div>
              <h3 class="text-sm font-bold text-[var(--ink)] mb-3">Mutfaklar</h3>
              <div class="relative mb-3">
                <MagnifyingGlassIcon class="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                <input
                  v-model="cuisineSearch"
                  class="w-full pl-8 py-2 border border-black/[0.08] rounded-lg text-xs focus:ring-[var(--brand)] focus:border-[var(--brand)] outline-none"
                  placeholder="Mutfak ara"
                  type="text"
                />
              </div>
              <div class="space-y-2 max-h-48 overflow-y-auto pr-2 hide-scrollbar">
                <label v-for="cuisine in filteredCuisines" :key="cuisine" class="flex items-center gap-2 cursor-pointer group">
                  <input v-model="selectedCuisines" class="rounded text-[var(--brand)] focus:ring-[var(--brand)] h-4 w-4" type="checkbox" :value="cuisine" />
                  <span class="text-sm text-black/60 group-hover:text-[var(--brand)] transition-colors">{{ cuisine }}</span>
                </label>
              </div>
            </div>

            <!-- Popüler Filtreler -->
            <div>
              <h3 class="text-sm font-bold text-[var(--ink)] mb-3">Popüler Filtreler</h3>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="filter in popularFilters"
                  :key="filter.label"
                  class="px-3 py-1.5 rounded-lg border border-black/[0.08] text-xs font-bold text-[var(--ink)] hover:bg-[var(--surface)] transition-colors flex items-center gap-1.5"
                >
                  <component :is="filter.icon" class="w-4 h-4 text-[var(--brand)]" />
                  {{ filter.label }}
                </button>
              </div>
            </div>

            <!-- Fiyat Aralığı -->
            <div>
              <h3 class="text-sm font-bold text-[var(--ink)] mb-3">Fiyat Aralığı</h3>
              <div class="flex items-center gap-2">
                <input class="w-1/2 p-2 border border-black/[0.08] rounded-lg text-xs focus:ring-[var(--brand)] focus:border-[var(--brand)] outline-none" placeholder="Min" type="text" />
                <input class="w-1/2 p-2 border border-black/[0.08] rounded-lg text-xs focus:ring-[var(--brand)] focus:border-[var(--brand)] outline-none" placeholder="Max" type="text" />
              </div>
            </div>
          </aside>

          <!-- Ana İçerik -->
          <div class="flex-1 space-y-8">
            <!-- Kampanyalar (Horizontal Scroll) -->
            <section>
              <div class="flex justify-between items-center mb-4">
                <h2 class="font-heading text-xl md:text-2xl font-bold text-[var(--ink)]">Kampanyalar ({{ campaigns.length }})</h2>
                <button class="text-[var(--brand-deep)] font-bold text-sm flex items-center gap-1">Tümünü Gör <ArrowRightIcon class="w-4 h-4" /></button>
              </div>
              <div
                v-motion
                :initial="{ opacity: 0, y: 24, filter: 'blur(10px)' }"
                :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 600, delay: 250, ease: [0.25, 0.46, 0.45, 0.94] } }"
                class="flex gap-4 overflow-x-auto hide-scrollbar pb-2"
              >
                <div
                  v-for="(campaign, i) in campaigns"
                  :key="campaign.title"
                  class="min-w-[280px] h-44 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative"
                  :style="{ transitionDelay: `${i * 50}ms` }"
                >
                  <img class="w-full h-full object-cover" :src="campaign.image" :alt="campaign.title" />
                  <div class="absolute inset-0 bg-black/20 p-4 flex flex-col justify-end text-white">
                    <span class="text-xs font-extrabold">{{ campaign.label }}</span>
                    <h4 class="text-lg font-bold">{{ campaign.title }}</h4>
                  </div>
                </div>
              </div>
            </section>

            <!-- Mutfağımız (Circular Avatars) -->
            <section>
              <h2 class="font-heading text-xl md:text-2xl font-bold text-[var(--ink)] mb-4">Mutfağımız</h2>
              <div
                v-motion
                :initial="{ opacity: 0, y: 24, filter: 'blur(10px)' }"
                :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 600, delay: 300, ease: [0.25, 0.46, 0.45, 0.94] } }"
                class="flex gap-6 overflow-x-auto hide-scrollbar pb-2"
              >
                <button
                  v-for="(cuisine, i) in foodCuisines"
                  :key="cuisine.name"
                  class="group flex flex-col items-center gap-2 min-w-fit"
                  :style="{ transitionDelay: `${i * 40}ms` }"
                >
                  <span class="relative w-20 h-20 rounded-full p-[3px] bg-gradient-to-br from-transparent to-transparent group-hover:from-[var(--brand)] group-hover:to-[var(--accent)] transition-all">
                    <span class="block w-full h-full rounded-full overflow-hidden bg-[var(--surface)] ring-1 ring-black/5 group-hover:ring-0">
                      <img :src="cuisine.image" :alt="cuisine.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </span>
                  </span>
                  <span class="text-xs font-bold text-[var(--ink)] group-hover:text-[var(--brand-deep)] transition-colors">{{ cuisine.name }}</span>
                </button>
              </div>
            </section>

            <!-- Restoran Listesi -->
            <section>
              <div class="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
                <h2 class="font-heading text-xl md:text-2xl font-bold text-[var(--ink)]">Restoranlar <span class="text-base font-normal text-black/50">({{ restaurants.length }})</span></h2>
                <div class="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                  <button
                    v-for="filter in restaurantFilters"
                    :key="filter"
                    class="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 flex-shrink-0 transition-colors"
                    :class="filter === 'Önerilenler' ? 'bg-[var(--brand-deep)] text-white' : 'bg-[var(--surface)] text-black/60 hover:bg-[var(--surface-2)]'"
                  >
                    {{ filter }}
                  </button>
                </div>
              </div>

              <!-- Restaurant Grid -->
              <div
                v-motion
                :initial="{ opacity: 0, y: 24, filter: 'blur(10px)' }"
                :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 600, delay: 350, ease: [0.25, 0.46, 0.45, 0.94] } }"
                class="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <NuxtLink
                  v-for="(restaurant, i) in restaurants"
                  :key="restaurant.id"
                  :to="`/bazarx-go/restaurant/${restaurant.id}`"
                  class="group bg-white rounded-xl overflow-hidden shadow-sm border border-black/[0.04] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
                  :style="{ transitionDelay: `${i * 40}ms` }"
                >
                  <div class="h-44 relative overflow-hidden">
                    <img :src="restaurant.image" :alt="restaurant.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <!-- Badge'ler -->
                    <div class="absolute top-3 left-3 flex flex-col gap-1.5">
                      <span v-if="restaurant.badge" class="bg-[#ba1a1a] text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                        <FireIcon class="w-3 h-3" />
                        {{ restaurant.badge }}
                      </span>
                      <span v-if="restaurant.minOrder" class="bg-[var(--surface)] text-[var(--ink)] text-[10px] font-bold px-2 py-1 rounded">
                        {{ restaurant.minOrder }}
                      </span>
                    </div>
                    <!-- Puan -->
                    <div class="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded font-bold text-xs flex items-center gap-1">
                      <StarSolid class="w-4 h-4 text-[var(--accent)]" />
                      {{ restaurant.rating }} ({{ restaurant.reviews }})
                    </div>
                  </div>
                  <div class="p-4 flex flex-col flex-1">
                    <div class="flex justify-between items-start mb-2">
                      <h3 class="font-bold text-[var(--ink)] truncate">{{ restaurant.name }}</h3>
                      <span v-if="restaurant.sponsored" class="text-[10px] text-black/40 uppercase font-bold">Sponsorlu</span>
                    </div>
                    <p class="text-xs text-black/50 mb-3">{{ restaurant.cuisine }}</p>
                    <div class="mt-auto flex items-center gap-4 text-xs text-black/50">
                      <span class="flex items-center gap-1">
                        <ClockIcon class="w-4 h-4" />
                        {{ restaurant.eta }}
                      </span>
                      <span class="flex items-center gap-1">
                        <MapPinIcon class="w-4 h-4" />
                        {{ restaurant.distance }}
                      </span>
                      <span v-if="restaurant.verified" class="flex items-center gap-1 text-[var(--brand-deep)]">
                        <ShieldCheckIcon class="w-4 h-4" />
                        <span class="text-[10px] font-bold">Semtin Yıldızı</span>
                      </span>
                    </div>
                  </div>
                </NuxtLink>
              </div>

              <!-- Daha Fazla Göster -->
              <div class="mt-8 flex justify-center">
                <button class="bg-white border-2 border-[var(--brand-deep)] text-[var(--brand-deep)] font-bold px-8 py-3 rounded-full hover:bg-[var(--brand)]/10 transition-all active:scale-95 shadow-sm">
                  Daha Fazla Göster
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </template>

    <!-- ======================== DİĞER SEKMELER (Market, Su, Pet Shop vb.) ======================== -->
    <template v-else>
      <main class="max-w-7xl mx-auto px-5 py-8 space-y-14">
        <!-- HERO — Bento -->
        <section
          v-motion
          :initial="{ opacity: 0, y: 28, filter: 'blur(12px)' }"
          :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 700, ease: [0.25, 0.46, 0.45, 0.94] } }"
          class="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          <!-- Sol — Büyük kampanya -->
          <div class="lg:col-span-2 relative overflow-hidden rounded-[28px] text-white p-8 md:p-12 min-h-[380px] flex flex-col justify-between group bg-gradient-to-br from-[#00c371] to-[#006d3d] shadow-2xl shadow-[#00c371]/20">
            <!-- Görsel sağda -->
            <div class="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden pointer-events-none opacity-60 lg:opacity-80">
              <img
                class="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-[1.4s] ease-out"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwsZVaIdwbwrs92hRRwV0V6UtiEAPV1gg7AEaQt2nsyoxbZOs3XLiPbjpZYlFD6Pk5OzcPYXBIhiJNn_kipWDy6k4OnMwNFohMdL8_1sSY-76IX9tbTRiNB4T6iWkZAFv0ybJstx5g2pipPPpTHE4jkhCvDnfhm4EUyU2Xy9IpfCM_1QL40UoXMzcoreIv7Q62t16nUMO8WkLWY6egq49pLAikm-71BpwE6T8Jnd881vUSRAu5dDw7-aLMdK_WMruEMZlWC107-9w"
                alt="Taze ürün sepeti"
              />
            </div>

            <!-- Üst rozet -->
            <div class="relative z-10 flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-[var(--brand-deep)] rounded-full text-[10px] font-black tracking-[0.18em] uppercase shadow-lg">
                <span class="w-1.5 h-1.5 rounded-full bg-[var(--brand)] animate-pulse"></span>
                Sınırlı Süre
              </span>
              <span class="text-[10px] font-bold tracking-[0.16em] uppercase text-white/70">Yalnızca bugün</span>
            </div>

            <!-- Başlık -->
            <div class="relative z-10 max-w-md mt-auto">
              <h1 class="font-heading text-4xl md:text-5xl font-black leading-[1.05] tracking-tight mb-4">
                İlk market siparişine <span class="text-[var(--brand-soft)]">%50</span> indirim
              </h1>
              <p class="text-white/85 text-[15px] leading-relaxed mb-6 max-w-sm">
                Taze sebzeler, binlerce ürün — 30 dakikada kapında. Yeni gelenlere özel.
              </p>
              <div class="flex flex-wrap gap-3">
                <button class="bg-white text-[var(--brand-deep)] px-6 py-3 rounded-full font-black text-sm tracking-wide shadow-xl shadow-black/20 hover:scale-[1.03] active:scale-95 transition-transform flex items-center gap-2">
                  Hemen Al
                  <ArrowRightIcon class="w-4 h-4" />
                </button>
                <button class="border border-white/30 hover:border-white/60 hover:bg-white/10 text-white px-6 py-3 rounded-full font-bold text-sm transition-all">
                  Detaylar
                </button>
              </div>
            </div>
          </div>

          <!-- Sağ — Yemek kartı -->
          <div class="relative overflow-hidden rounded-[28px] p-8 flex flex-col justify-between min-h-[380px] bg-[var(--accent-container)] shadow-xl shadow-orange-200/40 group">
            <div class="absolute -right-10 -bottom-10 opacity-40 text-[var(--accent-deep)] group-hover:rotate-12 transition-transform duration-700">
              <BuildingStorefrontIcon class="w-44 h-44" />
            </div>

            <div class="relative z-10">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-[var(--accent-deep)] rounded-full text-[10px] font-black tracking-[0.18em] uppercase shadow-md mb-5">
                <FireIcon class="w-3 h-3" />
                Sıcak
              </span>
              <h2 class="font-heading text-3xl md:text-4xl font-black text-[var(--accent-deep)] leading-tight tracking-tight">
                Aç mısın?
              </h2>
              <p class="text-[var(--accent-deep)]/80 text-sm mt-2 max-w-[14rem] leading-relaxed">
                Favori restoranlarından sıcak yemekler 30 dk'da kapında.
              </p>
            </div>

            <button @click="activeTab = 1" class="relative z-10 w-full bg-[var(--accent-deep)] hover:bg-black text-white py-3.5 rounded-full font-black text-sm tracking-wide flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
              Yemek Keşfet
              <ArrowRightIcon class="w-4 h-4" />
            </button>
          </div>
        </section>

        <!-- KATEGORİLER -->
        <section v-if="pageSettings.showCategories">
          <SectionHeader :title="pageSettings.categoriesTitle" :subtitle="pageSettings.categoriesSubtitle" />
          <div
            v-motion
            :initial="{ opacity: 0, y: 24, filter: 'blur(10px)' }"
            :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 600, delay: 80, ease: [0.25, 0.46, 0.45, 0.94] } }"
            class="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div
              v-for="(cat, i) in categories"
              :key="cat.title"
              @click="cat.title === 'Yemek' ? activeTab = 1 : null"
              class="group relative bg-white rounded-3xl p-4 border border-black/[0.04] hover:border-transparent hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/5 transition-all duration-300 overflow-hidden cursor-pointer"
              :style="{ transitionDelay: `${i * 30}ms` }"
            >
              <div
                class="aspect-[4/3] mb-4 overflow-hidden rounded-tl-3xl rounded-tr-md rounded-bl-md rounded-br-3xl relative"
                :style="{ background: cat.tint }"
              >
                <img :src="cat.image" :alt="cat.title" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                <div class="absolute inset-0 ring-1 ring-black/5 rounded-tl-3xl rounded-tr-md rounded-bl-md rounded-br-3xl"></div>
                <span class="absolute top-3 left-3 px-2 py-0.5 bg-white/90 backdrop-blur text-[9px] font-black tracking-[0.18em] uppercase rounded-full" :style="{ color: cat.accent }">
                  {{ cat.tag }}
                </span>
              </div>
              <div class="flex items-end justify-between gap-2">
                <div>
                  <h3 class="font-heading text-base font-black tracking-tight" :style="{ color: cat.accent }">{{ cat.title }}</h3>
                  <p class="text-[11px] text-black/45 font-medium mt-0.5 line-clamp-1">{{ cat.desc }}</p>
                </div>
                <div class="w-8 h-8 rounded-full grid place-items-center group-hover:scale-110 transition-transform" :style="{ background: cat.tint }">
                  <ArrowRightIcon class="w-3.5 h-3.5" :style="{ color: cat.accent }" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- RESTORANLAR (ANA SAYFA ENTEGRASYONU) -->
        <section>
          <SectionHeader title="Popüler Restoranlar" subtitle="Sana en yakın, en hızlı lezzetler" with-link />
          <div
            v-motion
            :initial="{ opacity: 0, y: 24, filter: 'blur(10px)' }"
            :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 600, delay: 100, ease: [0.25, 0.46, 0.45, 0.94] } }"
            class="flex gap-4 overflow-x-auto hide-scrollbar pb-2 -mx-5 px-5"
          >
            <NuxtLink
              v-for="(res, i) in restaurants"
              :key="res.id"
              :to="`/bazarx-go/restaurant/${res.id}`"
              class="group min-w-[300px] md:min-w-[340px] bg-white rounded-3xl border border-black/[0.04] hover:border-transparent hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/5 transition-all duration-300 overflow-hidden"
              :style="{ transitionDelay: `${i * 30}ms` }"
            >
              <div class="h-40 relative">
                <img :src="res.image" :alt="res.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div class="absolute bottom-3 left-3 flex items-center gap-2">
                  <div class="px-2 py-1 bg-white/90 backdrop-blur rounded-lg flex items-center gap-1 shadow-sm">
                    <StarSolidFilled class="w-3 h-3 text-[var(--accent)]" />
                    <span class="text-[10px] font-black text-[var(--ink)]">{{ res.rating }}</span>
                  </div>
                  <div class="px-2 py-1 bg-black/60 backdrop-blur rounded-lg flex items-center gap-1 shadow-sm text-white">
                    <ClockIcon class="w-3 h-3" />
                    <span class="text-[10px] font-black">{{ res.eta }}</span>
                  </div>
                </div>
              </div>
              <div class="p-4">
                <div class="flex justify-between items-start mb-1">
                  <h4 class="font-black text-[var(--ink)] tracking-tight">{{ res.name }}</h4>
                  <span v-if="res.verified" class="p-1 bg-emerald-50 text-emerald-600 rounded-full">
                    <ShieldCheckIcon class="w-3.5 h-3.5" />
                  </span>
                </div>
                <p class="text-[11px] text-black/45 mb-2">{{ res.cuisine }}</p>
                <div class="flex items-center gap-2">
                   <span class="text-[10px] font-bold text-black/35">{{ res.minOrder }}</span>
                   <span class="w-1 h-1 rounded-full bg-black/10"></span>
                   <span class="text-[10px] font-bold text-black/35">{{ res.distance }}</span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </section>

        <!-- KUPONLAR — Ticket Mask -->
        <section v-if="pageSettings.showCoupons">
          <SectionHeader :title="pageSettings.couponsTitle" :subtitle="pageSettings.couponsSubtitle" with-link />
          <div
            v-motion
            :initial="{ opacity: 0, y: 24, filter: 'blur(10px)' }"
            :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 600, delay: 100, ease: [0.25, 0.46, 0.45, 0.94] } }"
            class="flex gap-4 overflow-x-auto hide-scrollbar pb-2 -mx-5 px-5"
          >
            <article
              v-for="coupon in coupons"
              :key="coupon.code"
              class="ticket group min-w-[320px] bg-white rounded-2xl border border-dashed border-black/15 hover:border-[var(--brand)] hover:shadow-xl hover:shadow-black/5 transition-all duration-300 flex items-stretch overflow-hidden"
            >
              <div class="w-24 flex-shrink-0 grid place-items-center relative" :style="{ background: coupon.tint }">
                <div class="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur grid place-items-center" :style="{ color: coupon.accent }">
                  <component :is="coupon.icon" class="w-7 h-7" />
                </div>
              </div>
              <div class="w-px border-l border-dashed border-black/15 relative">
                <span class="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-[var(--bg)]"></span>
                <span class="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-[var(--bg)]"></span>
              </div>
              <div class="flex-1 p-4 flex flex-col justify-between min-w-0">
                <div>
                  <span class="text-[10px] tracking-[0.2em] uppercase font-black text-black/40">{{ coupon.label }}</span>
                  <h4 class="font-heading text-2xl font-black tracking-tight mt-0.5" :style="{ color: coupon.accent }">{{ coupon.value }}</h4>
                  <p class="text-xs text-black/55 mt-1">{{ coupon.desc }}</p>
                </div>
                <div class="flex items-center justify-between mt-3">
                  <code class="text-[10px] font-bold tracking-[0.18em] text-black/50 bg-black/[0.04] px-2 py-1 rounded-md">{{ coupon.code }}</code>
                  <button class="text-[10px] font-black uppercase tracking-wider text-[var(--brand-deep)] hover:underline">Kullan →</button>
                </div>
              </div>
            </article>
          </div>
        </section>

        <!-- MUTFAKLAR — Cuisines -->
        <section v-if="pageSettings.showCuisines">
          <SectionHeader :title="pageSettings.cuisinesTitle" :subtitle="pageSettings.cuisinesSubtitle" with-link />
          <div
            v-motion
            :initial="{ opacity: 0, y: 24, filter: 'blur(10px)' }"
            :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 600, delay: 100, ease: [0.25, 0.46, 0.45, 0.94] } }"
            class="flex gap-6 overflow-x-auto hide-scrollbar py-2"
          >
            <button
              v-for="cuisine in cuisines"
              :key="cuisine.name"
              class="group flex flex-col items-center gap-2.5 min-w-fit"
            >
              <span class="relative w-20 h-20 rounded-full p-[3px] bg-gradient-to-br from-transparent to-transparent group-hover:from-[var(--brand)] group-hover:to-[var(--accent)] transition-all">
                <span class="block w-full h-full rounded-full overflow-hidden bg-[var(--surface)] ring-1 ring-black/5 group-hover:ring-0">
                  <img :src="cuisine.image" :alt="cuisine.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </span>
              </span>
              <span class="text-xs font-bold tracking-wide text-[var(--ink)] group-hover:text-[var(--brand-deep)] transition-colors">{{ cuisine.name }}</span>
            </button>
          </div>
        </section>

        <!-- ÜRÜNLER — Sana Özel -->
        <section v-if="pageSettings.showPersonalized">
          <SectionHeader :title="pageSettings.personalizedTitle" :subtitle="pageSettings.personalizedSubtitle" with-link />
          <div
            v-motion
            :initial="{ opacity: 0, y: 24, filter: 'blur(10px)' }"
            :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 600, delay: 100, ease: [0.25, 0.46, 0.45, 0.94] } }"
            class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
          >
            <article
              v-for="(p, i) in products"
              :key="p.name"
              class="group bg-white rounded-2xl border border-black/[0.04] hover:border-transparent hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/5 transition-all duration-300 overflow-hidden flex flex-col"
              :style="{ transitionDelay: `${i * 25}ms` }"
            >
              <div class="relative aspect-square overflow-hidden">
                <img :src="p.image" :alt="p.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span
                  v-if="p.badge"
                  class="absolute top-3 left-3 px-2 py-1 text-[9px] font-black tracking-[0.16em] uppercase rounded-md backdrop-blur"
                  :class="p.badge.tone === 'discount' ? 'bg-[var(--brand)] text-white' : 'bg-[var(--accent-deep)] text-white'"
                >
                  {{ p.badge.label }}
                </span>
                <button class="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur grid place-items-center text-black/40 hover:text-[var(--accent-deep)] hover:scale-110 transition-all">
                  <HeartIcon class="w-4 h-4" />
                </button>
                <button class="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-[var(--brand-deep)] text-white grid place-items-center shadow-xl shadow-[var(--brand-deep)]/40 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-110 active:scale-95 transition-all">
                  <PlusIcon class="w-5 h-5" />
                </button>
              </div>
              <div class="p-4 flex flex-col flex-1">
                <div class="flex items-center gap-1.5 mb-1.5">
                  <StarSolid class="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span class="text-xs font-black text-[var(--ink)]">{{ p.rating }}</span>
                  <span class="text-[11px] text-black/40">({{ p.reviews }})</span>
                  <span class="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-[var(--brand-deep)] bg-[var(--brand)]/10 px-1.5 py-0.5 rounded-full">
                    <ClockIcon class="w-3 h-3" />
                    {{ p.eta }}
                  </span>
                </div>
                <h4 class="font-heading text-sm font-black tracking-tight line-clamp-1 text-[var(--ink)]">{{ p.name }}</h4>
                <p class="text-[11px] text-black/45 mt-0.5 line-clamp-1 mb-3">{{ p.vendor }}</p>
                <div class="flex items-baseline gap-2 mt-auto">
                  <span v-if="p.oldPrice" class="text-[11px] text-black/35 line-through">₺{{ p.oldPrice }}</span>
                  <span class="font-heading text-lg font-black text-[var(--brand-deep)]">₺{{ p.price }}</span>
                  <span v-if="p.oldPrice" class="ml-auto text-[10px] font-black text-white bg-[var(--accent-deep)] px-1.5 py-0.5 rounded-md">
                    -{{ Math.round((1 - p.price / p.oldPrice) * 100) }}%
                  </span>
                </div>
              </div>
            </article>
          </div>
        </section>

        <!-- GÜVEN ÇUBUĞU -->
        <section
          v-motion
          :initial="{ opacity: 0, y: 24, filter: 'blur(10px)' }"
          :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 600, delay: 100, ease: [0.25, 0.46, 0.45, 0.94] } }"
          class="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white rounded-3xl p-6 border border-black/[0.04]"
        >
          <div v-for="trust in trustItems" :key="trust.title" class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-2xl grid place-items-center flex-shrink-0" :style="{ background: trust.tint, color: trust.accent }">
              <component :is="trust.icon" class="w-5 h-5" />
            </div>
            <div class="min-w-0">
              <h5 class="text-[13px] font-black text-[var(--ink)] leading-tight">{{ trust.title }}</h5>
              <p class="text-[11px] text-black/50 mt-0.5 leading-snug">{{ trust.desc }}</p>
            </div>
          </div>
        </section>
      </main>
    </template>

    <!-- Footer -->
    <footer class="bg-[var(--ink)] text-white/80 mt-12">
      <div class="max-w-7xl mx-auto px-5 py-14 grid md:grid-cols-4 gap-10">
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-2xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-deep)] grid place-items-center text-white">
              <BoltIcon class="w-5 h-5" />
            </div>
            <span class="font-black text-white text-lg tracking-tight">BazarX <span class="text-[var(--brand-soft)]">Go</span></span>
          </div>
          <p class="text-xs leading-relaxed max-w-xs">
            Market, yemek, su ve pet shop ihtiyaçların için en hızlı ve güvenilir çözüm ortağın.
          </p>
        </div>
        <div>
          <h5 class="text-[11px] tracking-[0.2em] uppercase font-black text-white mb-4">BazarX Go</h5>
          <ul class="space-y-2.5 text-xs">
            <li><a href="#" class="hover:text-[var(--brand-soft)] transition-colors">Hakkımızda</a></li>
            <li><a href="#" class="hover:text-[var(--brand-soft)] transition-colors">Kariyer</a></li>
            <li><a href="#" class="hover:text-[var(--brand-soft)] transition-colors">İletişim</a></li>
          </ul>
        </div>
        <div>
          <h5 class="text-[11px] tracking-[0.2em] uppercase font-black text-white mb-4">Kullanım</h5>
          <ul class="space-y-2.5 text-xs">
            <li><a href="#" class="hover:text-[var(--brand-soft)] transition-colors">Kullanım Koşulları</a></li>
            <li><a href="#" class="hover:text-[var(--brand-soft)] transition-colors">Gizlilik Politikası</a></li>
            <li><a href="#" class="hover:text-[var(--brand-soft)] transition-colors">KVKK</a></li>
          </ul>
        </div>
        <div>
          <h5 class="text-[11px] tracking-[0.2em] uppercase font-black text-white mb-4">Uygulamayı İndir</h5>
          <div class="flex flex-col gap-2.5">
            <button class="flex items-center gap-3 px-3 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
              <DevicePhoneMobileIcon class="w-5 h-5" />
              <div class="text-left">
                <p class="text-[9px] leading-none opacity-70 tracking-wide">App Store'dan</p>
                <p class="text-xs font-black text-white leading-tight mt-0.5">İndirin</p>
              </div>
            </button>
            <button class="flex items-center gap-3 px-3 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
              <PlayCircleIcon class="w-5 h-5" />
              <div class="text-left">
                <p class="text-[9px] leading-none opacity-70 tracking-wide">Google Play'den</p>
                <p class="text-xs font-black text-white leading-tight mt-0.5">İndirin</p>
              </div>
            </button>
          </div>
        </div>
      </div>
      <div class="border-t border-white/10 py-5 px-5">
        <p class="max-w-7xl mx-auto text-[11px] text-white/40 text-center tracking-wide">© 2026 BazarX Go. Tüm hakları saklıdır.</p>
      </div>
    </footer>
    
    <LayoutLocationModal
      :is-open="isLocationModalOpen"
      :loading="locationLoading"
      :error="locationError || undefined"
      :detected="detectedCity"
      v-model:selected-city="selectedCity"
      :cities="cities"
      @close="isLocationModalOpen = false"
      @detect="handleDetectLocation"
      @save="saveLocation"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, defineComponent } from 'vue'
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  ChevronDownIcon,
  UserCircleIcon,
  BellIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
  BoltIcon,
  HeartIcon,
  PlusIcon,
  ClockIcon,
  FireIcon,
  BuildingStorefrontIcon,
  DevicePhoneMobileIcon,
  PlayCircleIcon,
  ShieldCheckIcon,
  TruckIcon,
  SparklesIcon,
  CreditCardIcon,
  StarIcon as StarSolid,
  ArrowLeftOnRectangleIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'
import { StarIcon as StarSolidFilled } from '@heroicons/vue/24/solid'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const categories = ref<any[]>([])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const coupons = ref<any[]>([])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cuisines = ref<any[]>([])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const products = ref<any[]>([])

const authStore = useAuthStore()
const cartStore = useCartStore()
const { fetchVendors } = useVendors()
const { 
  detectLocation, 
  loadSavedLocation, 
  displayLocation, 
  loading: locationLoading,
  error: locationError
} = useGeolocation()

const restaurants = ref<RestaurantItem[]>([])
const isLocationModalOpen = ref(false)

const { $api } = useApi()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pageSettings = ref<any>({
  showCategories: true, categoriesTitle: 'Kategoriler', categoriesSubtitle: '', categories: [],
  showCoupons: true, couponsTitle: 'İndirim Kuponların', couponsSubtitle: '', coupons: [],
  showCuisines: true, cuisinesTitle: 'Mutfaklar', cuisinesSubtitle: '', cuisines: [],
  showPersonalized: true, personalizedTitle: 'Sana Özel Seçimler', personalizedSubtitle: '', personalizedProducts: []
})

const loadSettings = async () => {
  try {
    const res = await $api('/api/v1/settings/bazarx-go')
    if (res && res.data) {
      const resData = res.data as any
      pageSettings.value = resData
      categories.value = resData.categories || []
      coupons.value = resData.coupons || []
      cuisines.value = resData.cuisines || []
      products.value = resData.personalizedProducts || []
    }
  } catch (e) {
    console.error('Failed to load bazarx go settings', e)
  }
}

const loadRestaurants = async () => {
  const data = await fetchVendors({ vendorType: 'RESTAURANT', limit: 20 })
  if (data && data.items) {
    restaurants.value = data.items.map((v: Record<string, any>) => ({
      id: v.id,
      name: v.profile?.storeName || 'İsimsiz Restoran',
      cuisine: v.profile?.cuisineType || 'Genel Mutfak',
      rating: v.profile?.rating || 0,
      reviews: v.profile?.reviewCount ? `${v.profile.reviewCount}+` : '0',
      eta: v.profile?.avgPrepTime ? `${v.profile.avgPrepTime} dk` : '30-40 dk',
      distance: '1.2km', // Mock distance for now
      minOrder: v.profile?.minOrderAmount ? `₺${v.profile.minOrderAmount} Min.` : '₺0 Min.',
      badge: v.profile?.isFeatured ? 'Popüler' : null,
      image: v.profile?.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaJbt85KXgsrBs6C4lqMdEH-DxHEOL3nzFiMaj7jBplm6JSsyMnMk9_YzWHp24g3gD94YgyLolBdDsn3bWgDgmt4XInwzTNfuTB-rgZSdwGa8mPWJlpUk-84OkfbIg2pPFBEH3fSNzQNstBJUYJXKNVUAS9l8c68KRrxtCOaadqlZFpCPaA9iW3yhdp-DbNFoA80qBzry362QfCTR0wxmcAfr0Az7pX0wT8JublUWyJpVBN6a98gJmB0gQmIyhV6Q4SjkfxMFN3c0',
      sponsored: v.profile?.isFeatured || false,
      verified: true
    }))
  }
}

onMounted(() => {
  loadSettings()
  loadRestaurants()
  loadSavedLocation()
})

const logout = async () => {
  await authStore.logout()
  navigateTo('/auth/login')
}

definePageMeta({
  layout: false
})

useHead({
  title: 'BazarX Go — Market ve Yemek Kapında',
  meta: [
    { name: 'description', content: 'Market, yemek, su ve pet shop ihtiyacın 30 dakikada kapında. BazarX Go ile hızlı ve güvenli teslimat.' }
  ]
})

// — Lokal durum
const search = ref('')
const activeTab = ref(0)

// — Yemek sekmesi için ek state
const activeSort = ref('Önerilen')
const cuisineSearch = ref('')
const selectedCuisines = ref<string[]>([])

// — Sıralama seçenekleri
const sortOptions = ['Önerilen', 'Mutfak Adı (A-Z)', 'Puana Göre', 'Mesafeye Göre']

// — Popüler filtreler
const popularFilters = [
  { label: 'Artı Restoranlar', icon: ShieldCheckIcon },
  { label: '4+ Puan', icon: StarSolidFilled },
  { label: 'Hızlı Teslimat', icon: TruckIcon }
]

// — Restoran filtreleri
const restaurantFilters = ['Önerilenler', 'Fiyat', 'Puan', 'Hızlı Teslimat']

// — Yemek sekmesi mutfak arama
const allCuisines = ['Burger', 'Pizza', 'Kebap', 'Döner', 'Çiğ Köfte', 'Sushi', 'Köfte', 'Makarna', 'Tavuk']
const filteredCuisines = computed(() => {
  if (!cuisineSearch.value) return allCuisines
  return allCuisines.filter(c => c.toLowerCase().includes(cuisineSearch.value.toLowerCase()))
})

// — Yemek sekmesi kampanyalar
const campaigns = [
  {
    label: 'GURME LEZZETLER',
    title: '₺1500 TL İNDİRİM',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaJbt85KXgsrBs6C4lqMdEH-DxHEOL3nzFiMaj7jBplm6JSsyMnMk9_YzWHp24g3gD94YgyLolBdDsn3bWgDgmt4XInwzTNfuTB-rgZSdwGa8mPWJlpUk-84OkfbIg2pPFBEH3fSNzQNstBJUYJXKNVUAS9l8c68KRrxtCOaadqlZFpCPaA9iW3yhdp-DbNFoA80qBzry362QfCTR0wxmcAfr0Az7pX0wT8JublUWyJpVBN6a98gJmB0gQmIyhV6Q4SjkfxMFN3c0'
  },
  {
    label: 'İLK SİPARİŞE ÖZEL',
    title: '₺500 TL\'ye varan İndirim!',
    image: ''
  },
  {
    label: 'Efsane 5\'li',
    title: 'Her Siparişe %15 Puan',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDHhRw0nLa2oOXuviteFM3zmUffiNuR_q930W2uykg4QKQ6yFmQRAAHOqRUMPr7vHYmoHTiJl_EvgJcXibCMZT47u-LUi0CR9TZVNTZ90SuuXkil7lygBkNQcarGMcSb4_PuHBD35bGJpSZ6WZ-Mh67rD5CvJ9Rm6deWgKVkC41mGQHDp6PnWKxrwXf_iz_ka-kbTvf6wuUD0-dZi-ohDKRSmZdRCIr1E9oQKZhLIPpKICqZaql0PUA-t6Sm3CKtdgz45zejtWERI'
  }
]
interface RestaurantItem {
  id: string
  name: string
  cuisine: string
  rating: number
  reviews: string
  eta: string
  distance: string
  minOrder?: string
  badge?: string
  image: string
  sponsored: boolean
  verified?: boolean
}


// — Yemek sekmesi mutfaklar (circular avatars)
const foodCuisines = [
  { name: 'Hamburger', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4DITaw38NiElHYD4qtM5rczZjp6N1bhCo6emuMpWprbu8bjRBAIaM5-GSSuf4IVffLLbzhzy8pEcHtL7yD5ceZgypmfXQ2cAt2J6B4LOLoEJoL6-YP73Thr1PwMvYBHig-hopHDcCP_47pEHiVTsHfdyeHp22k9pF_G01KVLIK-LKy46m9QgN_9plcH1NXC3BESNWObqsvb7K1w6j3oEX0MaICPUD6dZm68Ok1f3ZQDFgXLQ1rXRvjFSjTS0DV89ps2cvIqjxxIk' },
  { name: 'Döner', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUhyhtxo6jhPjNKCxdnwhtbdfHehlvIX1K_fLFdBx0-T2cgGjf8E0HiYt-H2O68FabdozDYXaU2T30LuyU8wIVd8sr4YIvAv9Cellauk1BuAb5wV4C8o2oJ9TrM06zTiFFnY1tnFv92K8NQDLwMjzEhPphoY3p_gxpypSTv0LCis3U2CB343bG0LEyYYMj8xddebMavOqiFBkNaIDeRUbxgR_vJVIEXWwbDhXUSrX2Vpp0Yayo-cpL14rV1clDvIFEbg-wgtKdvic' },
  { name: 'Pizza', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAdJ9iCBB1lF0XC2WKj7ANgUhYMAurKg-IXtynSSBSpsuPeRzEGhF_Ezlr8Ra9vVX3O1fm8KywpPmCnOnkrmUsObP-IWJNGErWqaYczM87yrk1JBstpxFI7FmwzEHmR3DEwhL5cY4FaggGNRMgv-Ki3E5DJv_JxQnHW7hlKfcP6lBSX8x6ZKmfACFS9EEvCuxGWffXHRE4aA1sXwBle35ntRWyeNCp5F9frSCzKT3rm1aDN8dyffDT89BpgMkbu0E_PjAB8ImQBYg' },
  { name: 'Makarna', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfTsRBp9kWOzRVqZMEs0Jo4_I467hAh-euNIhnYQKp6hHc4zR05xdci-ceIPLmT0ujXXnqJa05mVEj-dlrZ4VInAqROFrE9Ea2JVcxL7s1YBY7X2drZ3N26C9AVyAnkIkAfizKhCacGB0nelTZE6rCdS8P-0ZcfBrT3WFZOXO4HvJN0fXMTXfROa3rHCuOFTdtdy-ndckQM6KgSyISruc2YmF13BrU9LR_rEja0gru-MmK0RTqqqNY4Lk4p3D3c7w1uYunVrc5cV8' },
  { name: 'Sushi', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArr0OnneEVxGq5iEfORO34ZWNLLAwsymdIAvbGqamVr6GfVKm5z9Y3AgxPJrFKO1L_sGipNOlp9rVcaO4iH77G7L4YkXCnU7ZXRH_APOypB96Dl7bwgZ4DVpm8uvfBWBGyOdHmfX5V1ycBSkJiCnY4IyBje6e5gQnwnxUA4ftPjKMUyvQbb92dR4fbHSmlq4PuIjxZNHDnFtINOuY0ygoLNiSk5e_daW4cZQOYhK2rpjmSv92cDa3hqf24d-cxBfizUt6CbyJbjdw' },
]

// — Sekme listesi
const tabs = [
  { label: 'Market' },
  { label: 'Yemek' },
  { label: 'Su' },
  { label: 'Pet Shop' },
  { label: 'Kişisel Bakım' },
  { label: 'Kasap' }
]


// — Güven çubuğu
const trustItems = [
  { title: '30 dk teslimat', desc: 'Şehir merkezinde ortalama', icon: TruckIcon, tint: 'rgba(0,109,61,0.10)', accent: 'var(--brand-deep)' },
  { title: 'Tazelik garantisi', desc: 'Beğenmezsen iade', icon: SparklesIcon, tint: 'rgba(167,58,0,0.10)', accent: 'var(--accent-deep)' },
  { title: 'Güvenli ödeme', desc: '3D Secure & cüzdan', icon: ShieldCheckIcon, tint: 'rgba(59,130,246,0.10)', accent: '#1e40af' },
  { title: 'Tek tıkla kapıda', desc: 'Sorunsuz iade & destek', icon: CreditCardIcon, tint: 'rgba(124,58,237,0.10)', accent: '#6d28d9' }
]

// — Bölüm başlığı (lokal render-fonksiyonu komponenti)
const SectionHeader = defineComponent({
  name: 'SectionHeader',
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    withLink: { type: Boolean, default: false }
  },
  setup(props) {
    return () =>
      h('div', { class: 'flex items-end justify-between gap-4 mb-5' }, [
        h('div', { class: 'min-w-0' }, [
          h('div', { class: 'flex items-center gap-2 mb-1.5' }, [
            h('span', { class: 'w-6 h-[3px] rounded-full bg-[var(--brand)]' }),
            h('span', { class: 'text-[10px] tracking-[0.22em] uppercase font-black text-[var(--brand-deep)]' }, 'BazarX Go')
          ]),
          h('h2', { class: 'font-heading text-2xl md:text-[28px] font-black tracking-tight text-[var(--ink)] leading-tight' }, props.title),
          props.subtitle ? h('p', { class: 'text-[13px] text-black/45 mt-1' }, props.subtitle) : null
        ]),
        props.withLink
          ? h('button', { class: 'hidden sm:inline-flex items-center gap-1.5 text-[11px] font-black tracking-[0.18em] uppercase text-[var(--brand-deep)] hover:gap-2.5 transition-all' }, [
              'Tümünü Gör',
              h(ArrowRightIcon, { class: 'w-3.5 h-3.5' })
            ])
          : null
      ])
  }
})

// — Konum İşlemleri
const selectedCity = ref('')
const detectedCity = ref('')
const cities = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 'Mersin', 'Kocaeli'
]

const handleDetectLocation = async () => {
  const loc = await detectLocation()
  if (loc && loc.city) {
    detectedCity.value = loc.city
  }
}

const saveLocation = () => {
  if (selectedCity.value || detectedCity.value) {
    // Eğer manuel seçildiyse onu kullan, yoksa tespit edileni
    const cityToSave = selectedCity.value || detectedCity.value
    
    // Basit bir save simülasyonu (composable zaten localStorage'a yazıyor)
    if (selectedCity.value) {
      localStorage.setItem('detected_location', JSON.stringify({
        city: selectedCity.value,
        district: '',
        timestamp: Date.now()
      }))
      // Re-load to update display
      loadSavedLocation()
    }
    
    isLocationModalOpen.value = false
    useNuxtApp().$toast.success(`Konum ${cityToSave} olarak güncellendi`)
  }
}
</script>

<style scoped>
.bazarx-go {
  --bg: #fcf9f8;
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

.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.ticket {
  background-image:
    radial-gradient(circle at 96px -2px, transparent 8px, transparent 8px),
    radial-gradient(circle at 96px calc(100% + 2px), transparent 8px, transparent 8px);
}
</style>