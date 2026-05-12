<!-- apps/frontend/pages/bazarx-go/cart.vue -->
<template>
  <div class="bazarx-go min-h-screen bg-[var(--bg)] text-[var(--ink)] antialiased">
    <!-- TopAppBar -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-xl shadow-sm border-b border-black/[0.06]">
      <div class="max-w-7xl mx-auto flex justify-between items-center px-5 py-3">
        <div class="flex items-center gap-4">
          <button @click="goBack" class="active:scale-95 transition-transform">
            <ArrowLeftIcon class="w-6 h-6 text-[var(--brand-deep)]" />
          </button>
          <h1 class="font-bold text-xl text-[var(--brand-deep)]">BazarX Go</h1>
        </div>
        <div class="flex items-center gap-4">
          <button class="text-black/40 hover:text-[var(--brand-deep)] transition-colors">
            <QuestionMarkCircleIcon class="w-6 h-6" />
          </button>
          
          <!-- Giriş Yap / Profil -->
          <template v-if="!authStore.isLoggedIn">
            <NuxtLink to="/auth/login" class="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[var(--ink)] hover:text-[var(--brand)] transition-colors">
              <UserCircleIcon class="w-5 h-5" />
              Giriş Yap
            </NuxtLink>
          </template>
          <template v-else>
            <div class="relative group/user">
              <button class="flex items-center gap-2 px-3 py-1.5 bg-[var(--surface)] hover:bg-[var(--surface-2)] rounded-full transition-all group">
                <div class="w-7 h-7 rounded-full bg-[var(--brand)]/10 flex items-center justify-center overflow-hidden">
                  <img v-if="authStore.avatarUrl" :src="authStore.avatarUrl" class="w-full h-full object-cover">
                  <UserCircleIcon v-else class="w-5 h-5 text-[var(--brand-deep)]" />
                </div>
                <span class="text-xs font-black text-[var(--ink)] max-w-[80px] truncate">{{ authStore.user?.firstName || 'Hesabım' }}</span>
                <ChevronDownIcon class="w-3 h-3 text-black/30 group-hover:rotate-180 transition-transform" />
              </button>

              <div class="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-black/[0.06] p-2 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all z-50">
                <NuxtLink to="/profile" class="flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--surface)] rounded-xl text-xs font-bold text-[var(--ink)] transition-colors">
                  <UserCircleIcon class="w-4 h-4 text-black/40" />
                  Profilim
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
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-5 py-8">
      <div v-if="cartStore.loading && cartStore.items.length === 0" class="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div class="w-12 h-12 border-4 border-[var(--brand)] border-t-transparent rounded-full animate-spin"></div>
        <p class="text-sm font-bold text-black/40">Sepetiniz yükleniyor...</p>
      </div>

      <div v-else-if="cartStore.items.length === 0" class="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <div class="w-32 h-32 bg-[var(--surface)] rounded-full flex items-center justify-center text-black/20">
          <ShoppingBagIcon class="w-16 h-16" />
        </div>
        <div class="text-center">
          <h2 class="text-2xl font-black text-[var(--ink)] mb-2">Sepetiniz Boş</h2>
          <p class="text-sm text-black/50 mb-6">Henüz sepete bir ürün eklemediniz.</p>
          <NuxtLink to="/bazarx-go" class="bg-[var(--brand-deep)] text-white px-8 py-3 rounded-full font-bold hover:bg-[var(--brand)] transition-all shadow-lg shadow-[var(--brand-deep)]/20">
            Alışverişe Başla
          </NuxtLink>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <!-- Left Column: Cart Items -->
        <div class="md:col-span-8 space-y-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="font-heading text-2xl md:text-3xl font-black text-[var(--ink)]">Sepetim ({{ cartStore.count }})</h2>
            <button 
              @click="clearCart"
              class="text-[var(--brand-deep)] text-sm font-bold hover:underline disabled:opacity-50"
              :disabled="cartStore.loading"
            >
              Tümünü Temizle
            </button>
          </div>

          <!-- Cart Items List -->
          <div class="space-y-4">
            <div 
              v-for="item in cartStore.items" 
              :key="item.id"
              class="bg-white p-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-black/10 flex gap-4 animate-in fade-in slide-in-from-bottom-2"
            >
              <div class="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--surface)] border border-black/5">
                <img 
                  :src="(typeof item.Product?.image === 'string' ? item.Product.image : item.Product?.image?.url) || 
                        (typeof item.Product?.images?.[0] === 'string' ? item.Product.images[0] : (item.Product?.images?.[0] as any)?.url) || 
                        'https://placehold.co/200x200?text=' + encodeURIComponent(item.Product?.name || 'Ürün')" 
                  :alt="item.Product?.name" 
                  class="w-full h-full object-cover" 
                />
              </div>
              <div class="flex-1 flex flex-col justify-between">
                <div>
                  <div class="flex justify-between items-start">
                    <div>
                      <h3 class="font-bold text-[var(--ink)]">{{ item.Product?.name || 'Ürün' }}</h3>
                      <p class="text-xs text-black/50">{{ item.Product?.Vendor?.profile?.storeName || item.Product?.brand || 'Satıcı Bilgisi Yok' }}</p>
                        <!-- Seçenekler (Dinamik Opsiyonlar) -->
                        <div v-if="(item as any).options" class="mt-2 flex flex-col gap-1">
                          <div 
                            v-for="(val, key) in ((item as any).options as any)" 
                            :key="key" 
                            class="flex items-center gap-2"
                          >
                            <span class="text-[10px] font-black uppercase text-black/40 tracking-wider w-16 shrink-0">
                              {{ formatOptionKey(key as string) }}:
                            </span>
                            <div class="flex flex-wrap gap-1">
                              <template v-if="Array.isArray(val)">
                                <span v-for="v in val" :key="v" class="text-[10px] font-bold bg-[var(--brand)]/10 text-[var(--brand-deep)] px-2 py-0.5 rounded-full border border-[var(--brand)]/10">
                                  {{ v }}
                                </span>
                              </template>
                              <span v-else class="text-[10px] font-bold bg-[var(--brand)]/10 text-[var(--brand-deep)] px-2 py-0.5 rounded-full border border-[var(--brand)]/10">
                                {{ val }}
                              </span>
                            </div>
                          </div>
                        </div>
                    </div>
                    <button 
                      @click="cartStore.removeItem(item.id)"
                      class="text-black/30 hover:text-red-500 transition-colors p-1"
                      :disabled="cartStore.loading"
                    >
                      <XMarkIcon class="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div class="flex items-center justify-between mt-2">
                  <div class="flex items-center gap-3 bg-[var(--surface)] rounded-full px-1 py-1">
                    <button 
                      @click="cartStore.updateQuantity(item.id, Math.max(1, item.quantity - 1))"
                      class="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-[var(--brand)]/10 transition-colors disabled:opacity-50"
                      :disabled="cartStore.loading || item.quantity <= 1"
                    >
                      <MinusIcon class="w-4 h-4 text-[var(--brand-deep)]" />
                    </button>
                    <span class="font-bold text-lg w-8 text-center">{{ item.quantity }}</span>
                    <button 
                      @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                      class="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-[var(--brand)]/10 transition-colors disabled:opacity-50"
                      :disabled="cartStore.loading"
                    >
                      <PlusIcon class="w-4 h-4 text-[var(--brand-deep)]" />
                    </button>
                  </div>
                  <p class="font-bold text-lg text-[var(--brand-deep)]">₺{{ (Number(item.price || 0) * item.quantity).toFixed(2) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Restaurant Info Card (Optional - only if items have vendor) -->
          <div v-if="firstVendor" class="bg-white p-5 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-black/10">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-xl overflow-hidden bg-[var(--surface)] border border-black/5">
                <img :src="firstVendor.profile?.imageUrl || 'https://placehold.co/100x100?text=' + encodeURIComponent(firstVendor.profile?.storeName || 'Arby\'s')" :alt="firstVendor.profile?.storeName" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1">
                <h3 class="font-bold text-[var(--ink)]">{{ firstVendor.profile?.storeName }}</h3>
                <p class="text-sm text-black/50">{{ firstVendor.profile?.city || 'Lokasyon bilgisi yok' }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-black/50">Tahmini Süre</p>
                <p class="font-bold text-[var(--brand-deep)]">{{ firstVendor.profile?.avgPrepTime || 25 }}-30 dk</p>
              </div>
            </div>
          </div>

          <!-- Delivery Note -->
          <div class="bg-white p-5 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-black/10">
            <h3 class="font-bold text-lg text-[var(--ink)] flex items-center gap-2 mb-4">
              <MapPinIcon class="w-5 h-5 text-[var(--brand-deep)]" />
              Teslimat Adresi
            </h3>
            
            <div v-if="selectedAddress" class="border-2 border-[var(--brand-deep)] bg-[var(--brand)]/5 p-4 rounded-xl">
              <div class="flex items-start gap-3">
                <div class="bg-[var(--brand-deep)] p-2 rounded-lg">
                  <HomeIcon v-if="selectedAddress.name?.toLowerCase().includes('ev')" class="w-5 h-5 text-white" />
                  <BriefcaseIcon v-else-if="selectedAddress.name?.toLowerCase().includes('iş')" class="w-5 h-5 text-white" />
                  <MapPinIcon v-else class="w-5 h-5 text-white" />
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <p class="font-bold text-[var(--brand-deep)]">{{ selectedAddress.name }}</p>
                    <CheckCircleIcon class="w-4 h-4 text-[var(--brand-deep)]" />
                  </div>
                  <p class="text-[var(--ink)] text-sm">{{ selectedAddress.address }}, {{ selectedAddress.district }}/{{ selectedAddress.city }}</p>
                </div>
                <button @click="showAddressModal = true" class="text-[var(--brand-deep)] text-sm font-bold hover:underline">Değiştir</button>
              </div>
            </div>

            <div v-else class="border-2 border-[var(--brand-deep)] bg-[var(--brand)]/5 p-4 rounded-xl">
              <div class="flex items-start gap-3">
                <div class="bg-[var(--brand-deep)] p-2 rounded-lg">
                  <MapIcon class="w-5 h-5 text-white" />
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <p class="font-bold text-[var(--brand-deep)]">Mevcut Konum</p>
                    <CheckCircleIcon class="w-4 h-4 text-[var(--brand-deep)]" />
                  </div>
                  <p class="text-[var(--ink)] text-sm">Teslimat adresi sepet onayında belirlenecektir.</p>
                </div>
                <button @click="showAddressModal = true" class="text-[var(--brand-deep)] text-sm font-bold hover:underline">Değiştir</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Order Summary -->
        <aside class="md:col-span-4 sticky top-28">
          <div class="bg-white p-5 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-black/10 flex flex-col gap-4">
            <h3 class="font-bold text-lg text-[var(--ink)] border-b border-black/10 pb-4">Sipariş Özeti</h3>

            <!-- Summary Details -->
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <p class="text-sm text-black/50">Ara Toplam ({{ cartStore.count }} ürün)</p>
                <p class="text-sm font-medium text-[var(--ink)]">₺{{ subtotal.toFixed(2) }}</p>
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
                <p class="text-sm font-medium text-[var(--ink)]">₺{{ serviceFee.toFixed(2) }}</p>
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
                <p class="font-bold text-[var(--ink)]">Toplam</p>
                <p class="font-black text-3xl text-[var(--brand-deep)]">₺{{ total.toFixed(2) }}</p>
              </div>
              <NuxtLink to="/bazarx-go/checkout">
                <button 
                  class="w-full bg-[var(--brand)] text-white py-4 rounded-full font-bold flex justify-center items-center gap-2 hover:bg-[var(--brand-deep)] transition-all active:scale-[0.98] shadow-lg disabled:opacity-50"
                  :disabled="cartStore.loading"
                >
                  Ödemeye Geç
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
    <div v-if="showAddressModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div @click="showAddressModal = false" class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div class="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="p-6 border-b border-black/[0.06] flex justify-between items-center bg-[var(--surface)]">
          <h3 class="font-black text-xl text-[var(--ink)]">Adres Seçimi</h3>
          <button @click="showAddressModal = false" class="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
        
        <div class="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          <div v-if="addressStore.loading" class="py-12 flex flex-col items-center gap-3">
            <div class="w-8 h-8 border-3 border-[var(--brand)] border-t-transparent rounded-full animate-spin"></div>
            <p class="text-xs font-bold text-black/40">Adresler yükleniyor...</p>
          </div>
          
          <template v-else-if="addressStore.addresses.length > 0">
            <div 
              v-for="addr in addressStore.addresses" 
              :key="addr.id"
              @click="selectedAddressId = addr.id; showAddressModal = false"
              class="group relative border-2 p-4 rounded-2xl cursor-pointer transition-all"
              :class="selectedAddressId === addr.id ? 'border-[var(--brand)] bg-[var(--brand)]/5' : 'border-black/[0.06] hover:border-[var(--brand)]/30 hover:bg-[var(--surface)]'"
            >
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" :class="selectedAddressId === addr.id ? 'bg-[var(--brand)] text-white' : 'bg-[var(--surface)] text-black/40'">
                  <HomeIcon v-if="addr.name?.toLowerCase().includes('ev')" class="w-5 h-5" />
                  <BriefcaseIcon v-else-if="addr.name?.toLowerCase().includes('iş')" class="w-5 h-5" />
                  <MapPinIcon v-else class="w-5 h-5" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <p class="font-bold truncate text-[var(--ink)]">{{ addr.name }}</p>
                    <CheckCircleIcon v-if="selectedAddressId === addr.id" class="w-4 h-4 text-[var(--brand)]" />
                  </div>
                  <p class="text-xs text-black/50 truncate">{{ addr.fullName || (addr as any).firstName + ' ' + (addr as any).lastName }}</p>
                  <p class="text-xs text-black/40 mt-1 line-clamp-2">{{ addr.address }}, {{ addr.district }}/{{ addr.city }}</p>
                </div>
              </div>
            </div>
          </template>

          <div v-else class="py-12 flex flex-col items-center text-center gap-4">
            <div class="w-16 h-16 bg-[var(--surface)] rounded-full flex items-center justify-center text-black/20">
              <MapPinIcon class="w-8 h-8" />
            </div>
            <div>
              <p class="font-bold text-[var(--ink)]">Kayıtlı Adres Bulunamadı</p>
              <p class="text-xs text-black/40 mt-1">Sipariş verebilmek için bir adres eklemelisiniz.</p>
            </div>
          </div>
        </div>

        <div class="p-6 bg-[var(--surface)] border-t border-black/[0.06]">
          <NuxtLink to="/profile?tab=addresses" class="w-full bg-white border-2 border-black/[0.06] text-[var(--ink)] py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-black hover:text-white hover:border-black transition-all active:scale-[0.98]">
            <PlusIcon class="w-4 h-4" />
            Yeni Adres Ekle
          </NuxtLink>
        </div>
      </div>
    </div>

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
        <p>© 2026 BazarX Go. Tüm hakları saklıdır.</p>
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
import { ref, computed, onMounted } from 'vue'
import {
  ArrowLeftIcon,
  QuestionMarkCircleIcon,
  MapPinIcon,
  MapIcon,
  BriefcaseIcon,
  HomeIcon,
  CheckCircleIcon,
  MinusIcon,
  PlusIcon,
  XMarkIcon,
  InformationCircleIcon,
  TagIcon,
  ShieldCheckIcon,
  BoltIcon,
  DevicePhoneMobileIcon,
  PlayIcon,
  ArrowRightIcon,
  UserCircleIcon,
  ChevronDownIcon,
  ArrowLeftOnRectangleIcon,
  ShoppingBagIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const addressStore = useAddressStore()

const logout = async () => {
  await authStore.logout()
  navigateTo('/auth/login')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    navigateTo('/bazarx-go')
  }
}

definePageMeta({
  layout: false
})

const showAddressModal = ref(false)
const selectedAddressId = ref<string | null>(null)

onMounted(async () => {
  await cartStore.fetchCart()
  if (authStore.isLoggedIn) {
    await addressStore.fetchAddresses()
    if (addressStore.addresses.length > 0) {
      const def = addressStore.addresses.find(a => a.isDefault) || addressStore.addresses[0]
      selectedAddressId.value = def.id
    }
  }
})

// Promo code
const promoCode = ref('')

// Computed
const subtotal = computed(() => {
  return cartStore.items.reduce((acc, item) => {
    return acc + (Number(item.price || 0) * item.quantity)
  }, 0)
})

const serviceFee = computed(() => {
  return cartStore.items.length > 0 ? 12.50 : 0
})

const total = computed(() => {
  return subtotal.value + serviceFee.value
})

const selectedAddress = computed(() => {
  if (!selectedAddressId.value) return null
  return addressStore.addresses.find(a => a.id === selectedAddressId.value) || null
})

const formatOptionKey = (key: string) => {
  const map: Record<string, string> = {
    drinks: 'İçecek',
    fries: 'Patates',
    extras: 'Ekstralar',
    crust: 'Kenar',
    toppings: 'Malzeme'
  }
  return map[key] || key
}

const firstVendor = computed(() => {
  if (cartStore.items.length === 0) return null
  return cartStore.items[0].Product?.Vendor || null
})

const clearCart = async () => {
  const { $toast } = useNuxtApp() as any
  try {
    await cartStore.clearCart()
    $toast.success('Sepet temizlendi')
  } catch {
    $toast.error('Hata oluştu')
  }
}

useHead({
  title: 'Sepetim - BazarX Go',
  meta: [
    { name: 'description', content: 'BazarX Go sepetinizi görüntüleyin.' }
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