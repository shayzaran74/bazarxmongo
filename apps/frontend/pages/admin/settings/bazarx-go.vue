<template>
  <div class="py-12 px-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-12">
      <div>
        <h1 class="text-4xl font-black text-gray-900 italic tracking-tight uppercase leading-none mb-2">
          🚀 BAZARX GO <span class="text-[var(--brand-deep)]">VİTRİN AYARLARI</span>
        </h1>
        <p class="text-sm font-bold text-gray-400 uppercase tracking-widest opacity-70">BazarX Go ana sayfası dinamik ayarları</p>
      </div>
      
      <button :disabled="saving" class="bg-[var(--brand-deep)] text-black px-10 py-5 rounded-[24px] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-gray-900 transition-all active:scale-95 flex items-center gap-3" @click="saveSettings">
        <div v-if="saving" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        {{ saving ? 'KAYDEDİLİYoR...' : 'GO AYARLARINI KAYDET' }}
      </button>
    </div>

    <!-- Kategoriler Ayarı -->
    <div class="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 mb-8 transition-all hover:shadow-lg">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-black text-gray-900 uppercase">Kategoriler Bölümü</h2>
          <p class="text-xs font-bold text-gray-400 mt-1">Ana sayfadaki "İhtiyacın olan her şey" alanı</p>
        </div>
        <button 
          @click="settings.showCategories = !settings.showCategories"
          class="w-14 h-8 rounded-full transition-colors relative"
          :class="settings.showCategories ? 'bg-green-500' : 'bg-gray-200'"
        >
          <div 
            class="absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform shadow-sm"
            :class="settings.showCategories ? 'translate-x-6' : 'translate-x-0'"
          ></div>
        </button>
      </div>
      
      <div v-if="settings.showCategories" class="space-y-4 pt-4 border-t border-gray-50">
        <div>
          <label class="block text-xs font-black text-gray-400 uppercase mb-2">Başlık</label>
          <input v-model="settings.categoriesTitle" type="text" class="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-[var(--brand-deep)]" />
        </div>
        <div>
          <label class="block text-xs font-black text-gray-400 uppercase mb-2">Alt Başlık</label>
          <input v-model="settings.categoriesSubtitle" type="text" class="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-[var(--brand-deep)]" />
        </div>
        
        <!-- Dinamik Kategoriler Listesi -->
        <div class="mt-6 border border-gray-200 rounded-2xl p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-black text-gray-700 uppercase">Kategori Kartları ({{ settings.categories?.length || 0 }})</h3>
            <button @click="addCategory" class="text-xs font-bold bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200">+ Yeni Ekle</button>
          </div>
          
          <div v-if="!settings.categories || settings.categories.length === 0" class="text-center text-sm text-gray-400 py-6">
            Henüz hiç kategori eklenmedi.
          </div>
          
          <div v-else class="space-y-3">
            <div v-for="(cat, index) in settings.categories" :key="index" class="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 relative group">
              <button @click="removeCategory(index)" class="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <div class="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-gray-200 relative">
                <div class="absolute inset-0 bg-opacity-20 mix-blend-multiply" :style="{ backgroundColor: cat.tint || '#fff' }"></div>
                <img :src="cat.image || 'https://placehold.co/100x100'" class="w-full h-full object-cover" />
              </div>
              
              <div class="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Kategori Adı</label>
                  <input v-model="cat.title" type="text" placeholder="Örn: Yemek" class="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 font-bold" />
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Görsel URL</label>
                  <input v-model="cat.image" type="text" placeholder="https://..." class="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 font-bold" />
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Arka Plan (Tint)</label>
                  <div class="flex gap-2">
                    <input v-model="cat.tint" type="color" class="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                    <input v-model="cat.tint" type="text" placeholder="#FEF3F2" class="flex-1 text-sm bg-white border border-gray-200 rounded-lg px-3 py-1 font-bold" />
                  </div>
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Yazı Rengi (Accent)</label>
                  <div class="flex gap-2">
                    <input v-model="cat.accent" type="color" class="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                    <input v-model="cat.accent" type="text" placeholder="#B42318" class="flex-1 text-sm bg-white border border-gray-200 rounded-lg px-3 py-1 font-bold" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- İndirim Kuponların Ayarı -->
    <div class="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 mb-8 transition-all hover:shadow-lg">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-black text-gray-900 uppercase">Kuponlar Bölümü</h2>
          <p class="text-xs font-bold text-gray-400 mt-1">Ana sayfadaki "3 aktif kupon" alanı</p>
        </div>
        <button 
          @click="settings.showCoupons = !settings.showCoupons"
          class="w-14 h-8 rounded-full transition-colors relative"
          :class="settings.showCoupons ? 'bg-green-500' : 'bg-gray-200'"
        >
          <div 
            class="absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform shadow-sm"
            :class="settings.showCoupons ? 'translate-x-6' : 'translate-x-0'"
          ></div>
        </button>
      </div>
      
      <div v-if="settings.showCoupons" class="space-y-4 pt-4 border-t border-gray-50">
        <div>
          <label class="block text-xs font-black text-gray-400 uppercase mb-2">Başlık</label>
          <input v-model="settings.couponsTitle" type="text" class="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-[var(--brand-deep)]" />
        </div>
        <div>
          <label class="block text-xs font-black text-gray-400 uppercase mb-2">Alt Başlık</label>
          <input v-model="settings.couponsSubtitle" type="text" class="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-[var(--brand-deep)]" />
        </div>
        <!-- Dinamik Kuponlar Listesi -->
        <div class="mt-6 border border-gray-200 rounded-2xl p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-black text-gray-700 uppercase">Kupon Kartları ({{ settings.coupons?.length || 0 }})</h3>
            <button @click="addCoupon" class="text-xs font-bold bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200">+ Yeni Ekle</button>
          </div>
          
          <div v-if="!settings.coupons || settings.coupons.length === 0" class="text-center text-sm text-gray-400 py-6">
            Henüz hiç kupon eklenmedi.
          </div>
          
          <div v-else class="space-y-3">
            <div v-for="(coupon, index) in settings.coupons" :key="index" class="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 relative group">
              <button @click="removeCoupon(index)" class="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
              </button>
              
              <div class="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Kategori/Etiket</label>
                  <input v-model="coupon.label" type="text" placeholder="Örn: Yemek" class="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 font-bold" />
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Değer (Tutar/Oran)</label>
                  <input v-model="coupon.value" type="text" placeholder="Örn: ₺50 İndirim" class="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 font-bold" />
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Açıklama</label>
                  <input v-model="coupon.desc" type="text" placeholder="Örn: ₺250 ve üzeri..." class="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 font-bold" />
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Kupon Kodu</label>
                  <input v-model="coupon.code" type="text" placeholder="Örn: YEMEK50" class="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 font-bold uppercase" />
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Arka Plan (Tint)</label>
                  <div class="flex gap-2">
                    <input v-model="coupon.tint" type="color" class="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                    <input v-model="coupon.tint" type="text" class="flex-1 text-sm bg-white border border-gray-200 rounded-lg px-3 py-1 font-bold" />
                  </div>
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Yazı Rengi (Accent)</label>
                  <div class="flex gap-2">
                    <input v-model="coupon.accent" type="color" class="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                    <input v-model="coupon.accent" type="text" class="flex-1 text-sm bg-white border border-gray-200 rounded-lg px-3 py-1 font-bold" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mutfaklar Ayarı -->
    <div class="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 mb-8 transition-all hover:shadow-lg">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-black text-gray-900 uppercase">Mutfaklar Bölümü</h2>
          <p class="text-xs font-bold text-gray-400 mt-1">Ana sayfadaki "Damak tadına göre keşfet" alanı</p>
        </div>
        <button 
          @click="settings.showCuisines = !settings.showCuisines"
          class="w-14 h-8 rounded-full transition-colors relative"
          :class="settings.showCuisines ? 'bg-green-500' : 'bg-gray-200'"
        >
          <div 
            class="absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform shadow-sm"
            :class="settings.showCuisines ? 'translate-x-6' : 'translate-x-0'"
          ></div>
        </button>
      </div>
      
      <div v-if="settings.showCuisines" class="space-y-4 pt-4 border-t border-gray-50">
        <div>
          <label class="block text-xs font-black text-gray-400 uppercase mb-2">Başlık</label>
          <input v-model="settings.cuisinesTitle" type="text" class="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-[var(--brand-deep)]" />
        </div>
        <div>
          <label class="block text-xs font-black text-gray-400 uppercase mb-2">Alt Başlık</label>
          <input v-model="settings.cuisinesSubtitle" type="text" class="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-[var(--brand-deep)]" />
        </div>

        <!-- Dinamik Mutfaklar Listesi -->
        <div class="mt-6 border border-gray-200 rounded-2xl p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-black text-gray-700 uppercase">Mutfak Kartları ({{ settings.cuisines?.length || 0 }})</h3>
            <button @click="addCuisine" class="text-xs font-bold bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200">+ Yeni Ekle</button>
          </div>
          
          <div v-if="!settings.cuisines || settings.cuisines.length === 0" class="text-center text-sm text-gray-400 py-6">
            Henüz hiç mutfak eklenmedi.
          </div>
          
          <div v-else class="space-y-3">
            <div v-for="(cuisine, index) in settings.cuisines" :key="index" class="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 relative group">
              <button @click="removeCuisine(index)" class="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
              </button>
              
              <div class="w-16 h-16 shrink-0 rounded-full overflow-hidden border border-gray-200">
                <img :src="cuisine.image || 'https://placehold.co/100x100'" class="w-full h-full object-cover" />
              </div>
              
              <div class="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Mutfak Adı</label>
                  <input v-model="cuisine.name" type="text" placeholder="Örn: Hamburger" class="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 font-bold" />
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Görsel URL</label>
                  <input v-model="cuisine.image" type="text" placeholder="https://..." class="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 font-bold" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sana Özel Ayarı -->
    <div class="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 mb-8 transition-all hover:shadow-lg">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-black text-gray-900 uppercase">Sana Özel Seçimler Bölümü</h2>
          <p class="text-xs font-bold text-gray-400 mt-1">Kullanıcının geçmişine ve en çok sipariş verdiği ürünlere göre (Default Ürünler)</p>
        </div>
        <button 
          @click="settings.showPersonalized = !settings.showPersonalized"
          class="w-14 h-8 rounded-full transition-colors relative"
          :class="settings.showPersonalized ? 'bg-green-500' : 'bg-gray-200'"
        >
          <div 
            class="absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform shadow-sm"
            :class="settings.showPersonalized ? 'translate-x-6' : 'translate-x-0'"
          ></div>
        </button>
      </div>
      
      <div v-if="settings.showPersonalized" class="space-y-4 pt-4 border-t border-gray-50">
        <div>
          <label class="block text-xs font-black text-gray-400 uppercase mb-2">Başlık</label>
          <input v-model="settings.personalizedTitle" type="text" class="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-[var(--brand-deep)]" />
        </div>
        <div>
          <label class="block text-xs font-black text-gray-400 uppercase mb-2">Alt Başlık</label>
          <input v-model="settings.personalizedSubtitle" type="text" class="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-[var(--brand-deep)]" />
        </div>

        <!-- Dinamik Kişiselleştirilmiş Ürünler Listesi -->
        <div class="mt-6 border border-gray-200 rounded-2xl p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-black text-gray-700 uppercase">Varsayılan / En Çok Sipariş Edilen Ürünler ({{ settings.personalizedProducts?.length || 0 }})</h3>
            <button @click="addPersonalizedProduct" class="text-xs font-bold bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200">+ Yeni Ekle</button>
          </div>
          
          <div v-if="!settings.personalizedProducts || settings.personalizedProducts.length === 0" class="text-center text-sm text-gray-400 py-6">
            Henüz hiç ürün eklenmedi. Eğer kullanıcı giriş yapmamışsa veya geçmişi yoksa bu ürünler gösterilecektir.
          </div>
          
          <div v-else class="space-y-3">
            <div v-for="(product, index) in settings.personalizedProducts" :key="index" class="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 relative group">
              <button @click="removePersonalizedProduct(index)" class="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
              </button>
              
              <div class="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-gray-200">
                <img :src="product.image || 'https://placehold.co/100x100'" class="w-full h-full object-cover" />
              </div>
              
              <div class="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div class="col-span-2">
                  <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Ürün Adı</label>
                  <input v-model="product.name" type="text" placeholder="Örn: Big Mac Menü" class="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 font-bold" />
                </div>
                <div class="col-span-2">
                  <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Satıcı (Restoran)</label>
                  <input v-model="product.vendor" type="text" placeholder="Örn: McDonald's" class="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 font-bold" />
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Puan</label>
                  <input v-model="product.rating" type="number" step="0.1" class="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 font-bold" />
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Yorum Sayısı</label>
                  <input v-model="product.reviews" type="text" placeholder="Örn: 2.1k" class="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 font-bold" />
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Tahmini Süre</label>
                  <input v-model="product.eta" type="text" placeholder="Örn: 20-30 dk" class="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 font-bold" />
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Fiyat (₺)</label>
                  <input v-model="product.price" type="number" class="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 font-bold" />
                </div>
                <div class="col-span-4">
                  <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Görsel URL</label>
                  <input v-model="product.image" type="text" placeholder="https://..." class="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 font-bold" />
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
import { ref, onMounted } from 'vue'

definePageMeta({ layout: 'admin', middleware: 'super-admin' })
useHead({ title: 'BazarX Go Ayarları - Admin' })

const settings = ref({
  showCategories: true,
  categoriesTitle: 'Kategoriler',
  categoriesSubtitle: 'İhtiyacın olan her şey, tek tıkla',
  categories: [],
  showCoupons: true,
  couponsTitle: 'İndirim Kuponların',
  couponsSubtitle: '3 aktif kupon · son 2 gün',
  showCuisines: true,
  cuisinesTitle: 'Mutfaklar',
  cuisinesSubtitle: 'Damak tadına göre keşfet',
  showPersonalized: true,
  personalizedTitle: 'Sana Özel Seçimler',
  personalizedSubtitle: 'Geçmişine göre hazırlandı'
})

const addCategory = () => {
  if (!settings.value.categories) settings.value.categories = []
  settings.value.categories.push({ title: '', image: '', tint: '#FEF3F2', accent: '#B42318' })
}

const removeCategory = (index) => {
  settings.value.categories.splice(index, 1)
}

const addCoupon = () => {
  if (!settings.value.coupons) settings.value.coupons = []
  settings.value.coupons.push({ label: '', value: '', desc: '', code: '', tint: 'rgba(0,109,61,0.08)', accent: '#006D3D' })
}

const removeCoupon = (index) => {
  settings.value.coupons.splice(index, 1)
}

const addCuisine = () => {
  if (!settings.value.cuisines) settings.value.cuisines = []
  settings.value.cuisines.push({ name: '', image: '' })
}

const removeCuisine = (index) => {
  settings.value.cuisines.splice(index, 1)
}

const addPersonalizedProduct = () => {
  if (!settings.value.personalizedProducts) settings.value.personalizedProducts = []
  settings.value.personalizedProducts.push({
    name: '', vendor: '', rating: 4.5, reviews: '1k', eta: '30 dk', price: 0, image: ''
  })
}

const removePersonalizedProduct = (index) => {
  settings.value.personalizedProducts.splice(index, 1)
}

const saving = ref(false)
const { $toast } = useNuxtApp()
const apiFetch = useApi()

onMounted(async () => {
  try {
    const res = await apiFetch('/api/v1/admin/settings/bazarx-go')
    if (res?.data) {
      settings.value = { ...settings.value, ...res.data }
    }
  } catch (e) {
    console.error('Ayarlar alınamadı:', e)
  }
})

const saveSettings = async () => {
  saving.value = true
  try {
    await apiFetch('/api/v1/admin/settings/bazarx-go', {
      method: 'PUT',
      body: settings.value
    })
    $toast?.success?.('BazarX Go ayarları başarıyla kaydedildi')
  } catch (e) {
    $toast?.error?.('Ayarlar kaydedilirken bir hata oluştu')
  } finally {
    saving.value = false
  }
}
</script>
