<!-- apps/frontend/pages/bazarx-go/checkout.vue -->
<template>
  <div class="bazarx-go min-h-screen bg-[var(--bg)] text-[var(--ink)] antialiased">
    <!-- TopAppBar -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-xl shadow-sm border-b border-black/[0.06]">
      <div class="max-w-7xl mx-auto flex justify-between items-center px-5 py-3">
        <div class="flex items-center gap-4">
          <button class="active:scale-95 transition-transform">
            <NuxtLink to="/bazarx-go/cart">
              <ArrowLeftIcon class="w-6 h-6 text-[var(--brand-deep)]" />
            </NuxtLink>
          </button>
          <h1 class="font-bold text-xl text-[var(--brand-deep)]">BazarX Go</h1>
        </div>
        <div class="flex items-center gap-4">
          <button class="text-black/40 hover:text-[var(--brand-deep)] transition-colors">
            <QuestionMarkCircleIcon class="w-6 h-6" />
          </button>
          <button class="text-black/40 hover:text-[var(--brand-deep)] transition-colors">
            <ShoppingBagIcon class="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-5 py-8">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <!-- Left Column: Checkout Details -->
        <div class="md:col-span-8 space-y-6">
          <h2 class="font-heading text-2xl md:text-3xl font-black text-[var(--ink)] mb-6">Güvenli Ödeme</h2>

          <!-- Section 1: Delivery Address -->
          <section class="bg-white p-5 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-black/10">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-bold text-lg text-[var(--ink)] flex items-center gap-2">
                <MapPinIcon class="w-5 h-5 text-[var(--brand-deep)]" />
                Teslimat Adresi
              </h3>
              <button @click="openAddressModal()" class="text-[var(--brand-deep)] text-sm font-bold hover:underline">Yeni Adres Ekle</button>
            </div>

            <!-- Loading State -->
            <div v-if="loadingAddresses" class="py-8 flex flex-col items-center justify-center gap-3">
              <div class="w-10 h-10 border-4 border-[var(--brand)]/20 border-t-[var(--brand-deep)] rounded-full animate-spin"></div>
              <p class="text-sm text-black/40 font-medium">Adresleriniz yükleniyor...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="addresses.length === 0" class="py-8 border-2 border-dashed border-black/5 rounded-xl flex flex-col items-center justify-center gap-3 bg-[var(--surface)]/30">
              <div class="bg-white p-3 rounded-full shadow-sm">
                <MapPinIcon class="w-8 h-8 text-black/20" />
              </div>
              <p class="text-sm text-black/40 font-medium">Henüz kayıtlı adresiniz yok.</p>
              <button @click="openAddressModal()" class="bg-[var(--brand-deep)] text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md active:scale-95 transition-all">Adres Ekle</button>
            </div>

            <!-- Address List -->
            <div v-else class="space-y-3">
              <div
                v-for="address in addresses"
                :key="address.id"
                @click="selectAddress(address.id)"
                class="border-2 p-4 rounded-xl cursor-pointer transition-all flex justify-between items-start"
                :class="selectedAddressId === address.id ? 'border-[var(--brand-deep)] bg-[var(--brand)]/5' : 'border-black/10 hover:border-[var(--brand)]/30'"
              >
                <div class="flex gap-4">
                  <div class="bg-[var(--surface)] p-3 rounded-xl">
                    <HomeIcon v-if="address.type === 'home'" class="w-6 h-6 text-[var(--brand-deep)]" />
                    <BuildingOfficeIcon v-else class="w-6 h-6 text-[var(--brand-deep)]" />
                  </div>
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <p class="font-bold text-[var(--ink)]">{{ address.title }}</p>
                      <CheckCircleIcon v-if="selectedAddressId === address.id" class="w-5 h-5 text-[var(--brand-deep)]" />
                      <span v-if="address.isDefault" class="text-[10px] bg-black/5 px-2 py-0.5 rounded text-black/40 font-bold uppercase tracking-widest">Varsayılan</span>
                    </div>
                    <p class="text-[var(--ink)] text-sm">{{ address.fullAddress }}</p>
                    <p class="text-[var(--ink)] text-sm">{{ address.district }}, {{ address.city }}</p>
                    <div class="flex items-center gap-2 mt-2 text-black/50">
                      <PhoneIcon class="w-4 h-4" />
                      <p class="text-sm">{{ address.phone }}</p>
                    </div>
                  </div>
                </div>
                <button
                  @click.stop="openEditAddressModal(address)"
                  class="bg-white border border-black/10 text-[var(--brand-deep)] font-bold px-3 py-1.5 rounded-lg hover:bg-[var(--surface)] transition-all active:scale-95 text-sm"
                >
                  Düzenle
                </button>
              </div>
            </div>
          </section>

          <!-- Section 2: Payment Method -->
          <section class="bg-white p-5 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-black/10">
            <h3 class="font-bold text-lg text-[var(--ink)] flex items-center gap-2 mb-4">
              <CreditCardIcon class="w-5 h-5 text-[var(--brand-deep)]" />
              Ödeme Yöntemi
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <!-- Credit Card (Selected) -->
              <div
                @click="selectedPayment = 'card'"
                class="border-2 p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between h-[72px]"
                :class="selectedPayment === 'card' ? 'border-[var(--brand-deep)] bg-[var(--brand)]/5' : 'border-black/10 hover:bg-[var(--surface)]'"
              >
                <div class="flex justify-between items-center">
                  <CreditCardIcon class="w-5 h-5" :class="selectedPayment === 'card' ? 'text-[var(--brand-deep)]' : 'text-black/40'" />
                  <CheckCircleIcon v-if="selectedPayment === 'card'" class="w-5 h-5 text-[var(--brand-deep)]" />
                </div>
                <p class="font-medium text-[var(--ink)]">Kart</p>
              </div>

              <!-- Wallet -->
              <div
                @click="selectedPayment = 'wallet'"
                class="border p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between h-[72px]"
                :class="selectedPayment === 'wallet' ? 'border-[var(--brand-deep)] bg-[var(--brand)]/5' : 'border-black/10 hover:bg-[var(--surface)]'"
              >
                <div class="flex justify-between items-center">
                  <WalletIcon class="w-5 h-5 text-black/40" />
                </div>
                <p class="font-medium text-[var(--ink)]">Cüzdan</p>
              </div>

              <!-- Cash -->
              <div
                @click="selectedPayment = 'cash'"
                class="border p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between h-[72px]"
                :class="selectedPayment === 'cash' ? 'border-[var(--brand-deep)] bg-[var(--brand)]/5' : 'border-black/10 hover:bg-[var(--surface)]'"
              >
                <div class="flex justify-between items-center">
                  <BanknotesIcon class="w-5 h-5 text-black/40" />
                </div>
                <p class="font-medium text-[var(--ink)]">Nakit</p>
              </div>
            </div>

            <!-- Card Details Form -->
            <div v-if="selectedPayment === 'card'" class="bg-[var(--surface)] p-5 rounded-xl space-y-4">
              <div class="space-y-4">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-black/60 px-1">Kart Sahibi Adı</label>
                  <input
                    v-model="cardHolderName"
                    class="w-full bg-white border border-black/10 rounded-lg py-3 px-4 text-[var(--ink)] placeholder:text-black/30 focus:border-[var(--brand-deep)] focus:ring-1 focus:ring-[var(--brand-deep)] transition-all"
                    placeholder="Johnathan Doe"
                    type="text"
                  />
                </div>

                <div class="flex flex-col gap-2 relative">
                  <label class="text-sm font-medium text-black/60 px-1">Kart Numarası</label>
                  <div class="relative">
                    <input
                      v-model="cardNumber"
                      class="w-full bg-white border border-black/10 rounded-lg py-3 px-4 text-[var(--ink)] placeholder:text-black/30 focus:border-[var(--brand-deep)] focus:ring-1 focus:ring-[var(--brand-deep)] transition-all pr-20"
                      placeholder="0000 0000 0000 0000"
                      type="text"
                    />
                    <div class="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                      <img class="h-5 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9pZIThhqfyFRQCzeLxuplY2F18vnbfSru_hwbZNwVtEbM36l6W5_QN4irl2MS0E4X6AoGuz0UB7I19qQxsMBgHeD8o7PDFU2bnmxXfyL8rO4YA5P74_MUHMMW-rdP0rFNPUJpeIP6eowkXssC84pGezeUvMYseuAz5ist1NYy_n32H_ZxudjHeoBpNRc2QD0gYpYA1M3O7dbPCuU9V4ZStuiQ_Y4ER2aM5p3KjdCYYSiMCNOHSnnPtCHzAaycrdkm6QtgLQEDuFU" alt="Visa" />
                      <img class="h-5 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqdCA68e83XD-BrahGoJLeWliIunmtoSQiHwbPvhutUUOtDyrfS6m_JnBSaMYdWbrRhLsA8OTA9nl6RvDbSkQgtGvBOhbOGiXmz1WjUUOXkqb8P9zBVuQ6Ue20omnM0HB0VSB8yNnxPEnxwEPIaLTPXvxdziSmIrjce6XPkvZTG8KU_y37wsievKhbCySglLTNXisnlxjWu4x1P8CTel6N4j_5SZZQTa4ttBaPEpTVV6lbSiTFn0bBJxwLEtd17dn1Sx_5o_0YMLY" alt="Mastercard" />
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-black/60 px-1">Son Kullanma</label>
                    <input
                      v-model="expiryDate"
                      class="w-full bg-white border border-black/10 rounded-lg py-3 px-4 text-[var(--ink)] placeholder:text-black/30 focus:border-[var(--brand-deep)] focus:ring-1 focus:ring-[var(--brand-deep)] transition-all"
                      placeholder="AA/YY"
                      type="text"
                    />
                  </div>
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-black/60 px-1">CVV</label>
                    <input
                      v-model="cvv"
                      class="w-full bg-white border border-black/10 rounded-lg py-3 px-4 text-[var(--ink)] placeholder:text-black/30 focus:border-[var(--brand-deep)] focus:ring-1 focus:ring-[var(--brand-deep)] transition-all"
                      placeholder="***"
                      type="password"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Section 3: Delivery Note -->
          <section class="bg-white p-5 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-black/10">
            <h3 class="font-bold text-lg text-[var(--ink)] flex items-center gap-2 mb-4">
              <PencilSquareIcon class="w-5 h-5 text-[var(--brand-deep)]" />
              Teslimat Notu
            </h3>
            <textarea
              v-model="deliveryNote"
              class="w-full bg-white border border-black/10 rounded-xl p-4 text-[var(--ink)] placeholder:text-black/30 focus:border-[var(--brand-deep)] focus:ring-1 focus:ring-[var(--brand-deep)] transition-all min-h-[100px] resize-none"
              placeholder="Örn: Zil çalmayın, kapıya bırakın."
            ></textarea>
          </section>
        </div>

        <!-- Right Column: Order Summary -->
        <aside class="md:col-span-4 sticky top-28">
          <div class="bg-white p-5 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-black/10 flex flex-col gap-4">
            <h3 class="font-bold text-lg text-[var(--ink)] border-b border-black/10 pb-4">Sipariş Özeti</h3>

            <!-- Quick Cart View -->
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <p class="text-sm text-black/50">Ara Toplam ({{ cartStore.items.length }} ürün)</p>
                <p class="text-sm font-medium text-[var(--ink)]">₺{{ cartStore.totalPrice.toFixed(2) }}</p>
              </div>
              <div class="flex justify-between items-center">
                <p class="text-sm text-black/50">Teslimat Ücreti</p>
                <p class="text-sm font-bold text-[var(--brand-deep)]">Ücretsiz</p>
              </div>
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-1">
                  <p class="text-sm text-black/50">Hizmet Ücreti</p>
                  <InformationCircleIcon class="w-4 h-4 text-[var(--accent-container)]" />
                </div>
                <p class="text-sm font-medium text-[var(--ink)]">₺12.50</p>
              </div>
            </div>

            <!-- Coupon Area -->
            <div class="border-t border-dashed border-black/10 pt-4">
              <div class="space-y-3">
                <div class="flex items-center gap-2 px-1">
                  <TagIcon class="w-4 h-4 text-[var(--brand-deep)]" />
                  <label class="text-sm font-medium text-black/60">İndirim Kodu</label>
                </div>
                <div class="flex gap-3">
                  <input
                    v-model="promoCode"
                    class="flex-1 bg-[var(--surface)] border border-black/10 rounded-lg px-3 py-2 text-sm focus:border-[var(--brand-deep)] focus:ring-1 focus:ring-[var(--brand-deep)] transition-all"
                    placeholder="Kod girin"
                    type="text"
                  />
                  <button class="bg-[var(--brand-deep)] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[var(--brand)] transition-all active:scale-95 shadow-sm">
                    Uygula
                  </button>
                </div>
              </div>
            </div>

            <!-- Total -->
            <div class="border-t border-black/10 pt-4 mt-2">
              <div class="flex justify-between items-end mb-4">
                <p class="font-bold text-[var(--ink)]">Toplam Tutar</p>
                <p class="font-black text-3xl text-[var(--brand-deep)]">₺{{ (cartStore.totalPrice + 12.50).toFixed(2) }}</p>
              </div>
              <NuxtLink to="/bazarx-go/order-confirmation">
                <button class="w-full bg-[var(--brand)] text-white py-4 rounded-full font-bold flex justify-center items-center gap-2 hover:bg-[var(--brand-deep)] transition-all active:scale-[0.98] shadow-lg">
                  Siparişi Tamamla
                  <ArrowRightIcon class="w-5 h-5" />
                </button>
              </NuxtLink>
            </div>

            <!-- Trust Signals -->
            <div class="flex justify-center items-center gap-2 opacity-60">
              <ShieldCheckIcon class="w-4 h-4" />
              <p class="text-xs">Güvenli 256-bit SSL şifreli ödeme</p>
            </div>
          </div>

          <!-- Go Mascot Banner -->
          <div class="mt-4 bg-[var(--brand-deep)] rounded-xl p-5 text-white relative overflow-hidden flex items-center gap-4">
            <div class="relative z-10">
              <p class="font-bold text-lg leading-tight">En Hızlı Teslimat Garantisi</p>
              <p class="text-sm opacity-90">25-35 dakika içinde kapında</p>
            </div>
            <div class="ml-auto relative z-10 bg-white/20 p-3 rounded-full">
              <BoltIcon class="w-8 h-8" />
            </div>
            <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-[var(--brand-soft)] opacity-10 rounded-full blur-2xl"></div>
          </div>
        </aside>
      </div>
    </main>

    <!-- Address Modal -->
    <Teleport to="body">
      <div
        v-if="showAddressModal"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
        @click.self="closeAddressModal"
      >
        <div class="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-black/10">
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-[var(--surface)] flex justify-between items-center bg-[var(--surface)]">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-[var(--brand)]/20 rounded-full flex items-center justify-center">
                <MapPinIcon class="w-5 h-5 text-[var(--brand-deep)]" />
              </div>
              <h2 class="font-bold text-lg text-[var(--ink)]">{{ isEditingAddress ? 'Adresi Düzenle' : 'Yeni Adres Ekle' }}</h2>
            </div>
            <button @click="closeAddressModal" class="text-black/40 hover:text-[var(--ink)] transition-colors active:scale-95">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <!-- Modal Content (Form) -->
          <form @submit.prevent="saveAddress" class="p-6 space-y-4">
            <!-- Address Title -->
            <div>
              <label class="block text-sm font-medium text-[var(--ink)] mb-2">Adres Başlığı</label>
              <input
                v-model="addressForm.title"
                class="w-full px-4 py-3 rounded-lg border border-black/10 bg-[var(--surface)] focus:border-[var(--brand-deep)] focus:ring-1 focus:ring-[var(--brand-deep)] outline-none transition-all placeholder:text-black/30"
                placeholder="Örn: Ev, İş"
                type="text"
              />
            </div>

            <!-- City & District -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-[var(--ink)] mb-2">Şehir</label>
                <div class="relative">
                  <select
                    v-model="addressForm.city"
                    class="w-full px-4 py-3 rounded-lg border border-black/10 bg-[var(--surface)] focus:border-[var(--brand-deep)] focus:ring-1 focus:ring-[var(--brand-deep)] outline-none transition-all appearance-none"
                  >
                    <option value="">Seçin</option>
                    <option>İstanbul</option>
                    <option>Ankara</option>
                    <option>İzmir</option>
                    <option>Bursa</option>
                    <option>Antalya</option>
                  </select>
                  <ChevronDownIcon class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 pointer-events-none" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--ink)] mb-2">İlçe</label>
                <div class="relative">
                  <select
                    v-model="addressForm.district"
                    class="w-full px-4 py-3 rounded-lg border border-black/10 bg-[var(--surface)] focus:border-[var(--brand-deep)] focus:ring-1 focus:ring-[var(--brand-deep)] outline-none transition-all appearance-none"
                  >
                    <option value="">Seçin</option>
                    <option>Beşiktaş</option>
                    <option>Kadıköy</option>
                    <option>Şişli</option>
                    <option>Üsküdar</option>
                    <option>Maltepe</option>
                  </select>
                  <ChevronDownIcon class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 pointer-events-none" />
                </div>
              </div>
            </div>

            <!-- Full Address -->
            <div>
              <label class="block text-sm font-medium text-[var(--ink)] mb-2">Açık Adres</label>
              <textarea
                v-model="addressForm.fullAddress"
                class="w-full px-4 py-3 rounded-lg border border-black/10 bg-[var(--surface)] focus:border-[var(--brand-deep)] focus:ring-1 focus:ring-[var(--brand-deep)] outline-none transition-all placeholder:text-black/30 resize-none"
                placeholder="Sokak, bina no, daire no..."
                rows="3"
              ></textarea>
            </div>

            <!-- Phone Number -->
            <div>
              <label class="block text-sm font-medium text-[var(--ink)] mb-2">Telefon Numarası</label>
              <div class="flex items-center gap-2">
                <span class="px-4 py-3 bg-[var(--surface-2)] rounded-lg border border-black/10 text-black/60 font-medium">+90</span>
                <input
                  v-model="addressForm.phone"
                  class="flex-1 px-4 py-3 rounded-lg border border-black/10 bg-[var(--surface)] focus:border-[var(--brand-deep)] focus:ring-1 focus:ring-[var(--brand-deep)] outline-none transition-all placeholder:text-black/30"
                  placeholder="5XX XXX XX XX"
                  type="tel"
                />
              </div>
            </div>

            <!-- Address Type -->
            <div>
              <label class="block text-sm font-medium text-[var(--ink)] mb-2">Adres Tipi</label>
              <div class="flex gap-4">
                <label
                  @click="addressForm.type = 'home'"
                  class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all"
                  :class="addressForm.type === 'home' ? 'border-[var(--brand-deep)] bg-[var(--brand)]/5' : 'border-black/10 hover:border-[var(--brand)]/30'"
                >
                  <HomeIcon class="w-5 h-5" :class="addressForm.type === 'home' ? 'text-[var(--brand-deep)]' : 'text-black/40'" />
                  <span class="font-medium" :class="addressForm.type === 'home' ? 'text-[var(--brand-deep)]' : 'text-black/60'">Ev</span>
                </label>
                <label
                  @click="addressForm.type = 'work'"
                  class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all"
                  :class="addressForm.type === 'work' ? 'border-[var(--brand-deep)] bg-[var(--brand)]/5' : 'border-black/10 hover:border-[var(--brand)]/30'"
                >
                  <BuildingOfficeIcon class="w-5 h-5" :class="addressForm.type === 'work' ? 'text-[var(--brand-deep)]' : 'text-black/40'" />
                  <span class="font-medium" :class="addressForm.type === 'work' ? 'text-[var(--brand-deep)]' : 'text-black/60'">İş</span>
                </label>
              </div>
            </div>

            <!-- Default Checkbox -->
            <label class="flex items-center gap-3 cursor-pointer group">
              <div class="relative flex items-center">
                <input v-model="addressForm.isDefault" class="peer appearance-none w-6 h-6 border-2 border-black/20 rounded-lg checked:bg-[var(--brand-deep)] checked:border-[var(--brand-deep)] transition-all" type="checkbox" />
                <CheckIcon class="absolute inset-0 text-white scale-0 peer-checked:scale-100 transition-transform flex items-center justify-center w-6 h-6" />
              </div>
              <span class="text-sm text-black/60 group-hover:text-[var(--ink)] transition-colors">Varsayılan adres olarak ayarla</span>
            </label>
          </form>

          <!-- Modal Footer -->
          <div class="px-6 py-4 bg-[var(--surface)] border-t border-black/10 flex gap-4">
            <button
              @click="closeAddressModal"
              class="flex-1 py-3 rounded-full font-bold border-2 border-[var(--brand-deep)] text-[var(--brand-deep)] hover:bg-[var(--brand)]/5 active:scale-95 transition-all"
            >
              İptal
            </button>
            <button
              @click="saveAddress"
              class="flex-1 py-3 rounded-full font-bold bg-[var(--brand-deep)] text-white shadow-lg shadow-[var(--brand-deep)]/20 hover:bg-[var(--brand)] active:scale-95 transition-all"
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Footer -->
    <footer class="bg-[var(--surface-2)] py-12 mt-12">
      <div class="max-w-7xl mx-auto px-5 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="col-span-2">
          <h4 class="font-bold text-xl text-[var(--brand-deep)] mb-3">BazarX Go</h4>
          <p class="text-black/50 max-w-sm">Taze market ürünleri ve restoran yemeklerini dakikalar içinde kapınıza getiriyoruz. Verimli, güvenilir ve her zaman taze.</p>
        </div>
        <div>
          <h5 class="font-bold text-[var(--ink)] mb-3">Destek</h5>
          <ul class="space-y-2 text-sm">
            <li><a class="text-black/50 hover:text-[var(--brand-deep)] transition-colors" href="#">Yardım Merkezi</a></li>
            <li><a class="text-black/50 hover:text-[var(--brand-deep)] transition-colors" href="#">Kullanım Koşulları</a></li>
            <li><a class="text-black/50 hover:text-[var(--brand-deep)] transition-colors" href="#">Gizlilik Politikası</a></li>
          </ul>
        </div>
        <div class="flex flex-col gap-3">
          <h5 class="font-bold text-[var(--ink)]">Uygulamayı İndir</h5>
          <div class="flex gap-2">
            <div class="w-32 h-10 bg-[var(--ink)] text-white rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
              <DevicePhoneMobileIcon class="w-5 h-5 mr-1" />
              <span class="text-[10px] leading-tight font-bold">App Store</span>
            </div>
            <div class="w-32 h-10 bg-[var(--ink)] text-white rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
              <PlayIcon class="w-5 h-5 mr-1" />
              <span class="text-[10px] leading-tight font-bold">Google Play</span>
            </div>
          </div>
        </div>
      </div>
      <div class="max-w-7xl mx-auto px-5 mt-8 pt-6 border-t border-black/10 flex justify-between items-center text-black/40 text-sm">
        <p>© 2024 BazarX Go. Tüm hakları saklıdır.</p>
        <div class="flex gap-4">
          <button class="hover:text-[var(--brand-deep)] transition-colors">
            <span class="material-symbols-outlined">social_leaderboard</span>
          </button>
          <button class="hover:text-[var(--brand-deep)] transition-colors">
            <span class="material-symbols-outlined">share</span>
          </button>
          <button class="hover:text-[var(--brand-deep)] transition-colors">
            <span class="material-symbols-outlined">info</span>
          </button>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import { useNuxtApp } from '#app'
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()
import {
  ArrowLeftIcon,
  QuestionMarkCircleIcon,
  ShoppingBagIcon,
  MapPinIcon,
  HomeIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  PhoneIcon,
  CreditCardIcon,
  WalletIcon,
  BanknotesIcon,
  PencilSquareIcon,
  InformationCircleIcon,
  TagIcon,
  ShieldCheckIcon,
  BoltIcon,
  DevicePhoneMobileIcon,
  PlayIcon,
  ArrowRightIcon,
  XMarkIcon,
  ChevronDownIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: false
})

interface Address {
  id: string | number
  title: string
  type: 'home' | 'work'
  fullAddress: string
  city: string
  district: string
  phone: string
  isDefault: boolean
}

const addresses = ref<Address[]>([])
const loadingAddresses = ref(false)
const selectedAddressId = ref<string | number | null>(null)

const fetchAddresses = async () => {
  loadingAddresses.value = true
  const { $api } = useApi()
  
  try {
    const res = await $api('/api/v1/addresses')
    if (res.success && Array.isArray(res.data)) {
      addresses.value = res.data.map((addr: any) => ({
        id: addr.id,
        title: addr.title,
        type: addr.title.toLowerCase().includes('iş') ? 'work' : 'home', // Simple heuristic or extend DTO
        fullAddress: `${addr.addressLine1} ${addr.addressLine2 || ''}`.trim(),
        city: addr.city,
        district: addr.district,
        phone: addr.phone,
        isDefault: addr.isDefault
      }))
      
      // Select default or first address
      const defaultAddr = addresses.value.find(a => a.isDefault)
      if (defaultAddr) {
        selectedAddressId.value = defaultAddr.id
      } else if (addresses.value.length > 0) {
        selectedAddressId.value = addresses.value[0].id
      }
    }
  } catch (err) {
    console.error('Fetch addresses error:', err)
  } finally {
    loadingAddresses.value = false
  }
}

onMounted(() => {
  fetchAddresses()
})

// Address modal state
const showAddressModal = ref(false)
const isEditingAddress = ref(false)
const editingAddressId = ref<number | null>(null)

const addressForm = reactive({
  title: '',
  type: 'home' as 'home' | 'work',
  fullAddress: '',
  city: '',
  district: '',
  phone: '',
  isDefault: false
})

// Payment method selection
const selectedPayment = ref('card')

// Form data
const cardHolderName = ref('')
const cardNumber = ref('')
const expiryDate = ref('')
const cvv = ref('')
const deliveryNote = ref('')
const promoCode = ref('')

// Methods
function selectAddress(id: string | number) {
  selectedAddressId.value = id
}

function openAddressModal() {
  isEditingAddress.value = false
  editingAddressId.value = null
  addressForm.title = ''
  addressForm.type = 'home'
  addressForm.fullAddress = ''
  addressForm.city = ''
  addressForm.district = ''
  addressForm.phone = ''
  addressForm.isDefault = false
  showAddressModal.value = true
}

function openEditAddressModal(address: Address) {
  isEditingAddress.value = true
  editingAddressId.value = address.id as any
  addressForm.title = address.title
  addressForm.type = address.type
  addressForm.fullAddress = address.fullAddress
  addressForm.city = address.city
  addressForm.district = address.district
  addressForm.phone = address.phone
  addressForm.isDefault = address.isDefault
  showAddressModal.value = true
}

function closeAddressModal() {
  showAddressModal.value = false
}

async function saveAddress() {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  const payload = {
    title: addressForm.title,
    firstName: 'User', // Should be from profile store
    lastName: 'Name',
    phone: addressForm.phone,
    addressLine1: addressForm.fullAddress,
    city: addressForm.city,
    district: addressForm.district,
    isDefault: addressForm.isDefault
  }

  try {
    if (isEditingAddress.value && editingAddressId.value !== null) {
      await $api(`/api/v1/addresses/${editingAddressId.value}`, {
        method: 'PUT',
        body: payload
      })
      $toast.success('Adres güncellendi')
    } else {
      await $api('/api/v1/addresses', {
        method: 'POST',
        body: payload
      })
      $toast.success('Yeni adres eklendi')
    }
    await fetchAddresses()
    closeAddressModal()
  } catch (err) {
    $toast.error('Adres kaydedilirken bir hata oluştu')
  }
}

useHead({
  title: 'Ödeme - BazarX Go',
  meta: [
    { name: 'description', content: 'BazarX Go ile güvenli ödeme yapın.' }
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
</style>