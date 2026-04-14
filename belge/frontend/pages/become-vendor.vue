<template>
  <div class="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6">
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-10">
        <h1 class="text-4xl font-extrabold text-neutral-900 tracking-tight sm:text-5xl mb-4">
          🚀 Satıcı Paneline Katılın
        </h1>
        <p class="text-lg text-neutral-600 max-w-2xl mx-auto">
          Milyonlarca müşteriye ulaşın, işinizi dijital dünyada büyütün.
        </p>

        <!-- Dynamic Announcements / PDFs -->
        <div
          v-if="announcements.length"
          class="mt-8 flex flex-wrap justify-center gap-3"
        >
          <div
            v-for="ann in announcements"
            :key="ann.id"
          >
            <a
              v-if="ann.linkUrl"
              :href="ann.linkUrl.startsWith('http') ? ann.linkUrl : (ann.linkUrl.startsWith('/') ? useRuntimeConfig().public.apiBase + ann.linkUrl : ann.linkUrl)"
              target="_blank"
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-100 text-orange-700 rounded-2xl text-xs font-bold hover:bg-orange-200 transition-all shadow-sm group"
            >
              <span
                class="p-1 px-2 bg-orange-600 text-white rounded-lg group-hover:scale-110 transition-transform text-[10px]"
              >PDF</span>
              {{ ann.linkText || 'BİLGİLENDİRME DOSYASI' }}
            </a>
            <div
              v-else
              class="text-sm text-neutral-600 bg-white px-6 py-2.5 rounded-2xl border border-neutral-100 shadow-sm"
            >
              {{ ann.content }}
            </div>
          </div>
        </div>
      </div>

      <!-- Stepper -->
      <div class="mb-12">
        <div class="relative flex items-center justify-between max-w-3xl mx-auto">
          <div class="absolute left-0 top-1/2 w-full h-0.5 bg-neutral-200 -z-10 -translate-y-1/2" />
          <div
            class="absolute left-0 top-1/2 h-0.5 bg-primary-600 -z-10 -translate-y-1/2 transition-all duration-500"
            :style="{ width: `${(currentStep - 1) * 20}%` }"
          />

          <div
            v-for="step in 6"
            :key="step"
            class="flex flex-col items-center"
          >
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300"
              :class="[
                currentStep >= step
                  ? 'bg-primary-600 text-white shadow-lg ring-4 ring-primary-100'
                  : 'bg-white border-2 border-neutral-300 text-neutral-400'
              ]"
            >
              <template v-if="currentStep > step">
                ✓
              </template>
              <template v-else>
                {{ step }}
              </template>
            </div>
            <span
              class="absolute mt-12 text-[10px] sm:text-xs font-medium text-neutral-500 whitespace-nowrap hidden sm:block"
            >
              {{ stepTitles[step - 1] }}
            </span>
          </div>
        </div>
      </div>

      <!-- Form Container -->
      <div
        class="bg-white rounded-3xl shadow-xl shadow-neutral-200/50 border border-neutral-100 overflow-hidden min-h-[600px] flex flex-col"
      >
        <!-- Status Messages -->
        <div
          v-if="vendorStatus === 'APPROVED'"
          class="p-12 text-center flex-1 flex flex-col items-center justify-center"
        >
          <div
            class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-6"
          >
            ✅
          </div>
          <h3 class="text-3xl font-bold text-neutral-900 mb-4">
            Harika! Zaten Satıcısınız
          </h3>
          <p class="text-neutral-600 mb-8 max-w-md">
            Satıcı panelinizden ürünlerinizi yönetmeye ve satışlarınızı takip
            etmeye
            başlayabilirsiniz.
          </p>
          <NuxtLink
            to="/vendor/dashboard"
            class="bg-primary-600 text-white px-10 py-4 rounded-2xl hover:bg-primary-700 font-bold text-lg transition-all shadow-lg shadow-primary-200"
          >
            Satıcı Paneline Git
          </NuxtLink>
        </div>

        <div
          v-else-if="vendorStatus === 'PENDING'"
          class="p-12 text-center flex-1 flex flex-col items-center justify-center"
        >
          <div
            class="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-4xl mb-6 animate-pulse"
          >
            ⏳
          </div>
          <h3 class="text-3xl font-bold text-neutral-900 mb-4">
            Başvurunuz İnceleniyor
          </h3>
          <p class="text-neutral-600 max-w-md">
            Uzman ekibimiz başvurunuzu inceliyor. Onaylandığında size e-posta ile
            bildireceğiz.
          </p>
        </div>

        <div
          v-else-if="!isLoggedIn"
          class="p-12 text-center flex-1 flex flex-col items-center justify-center"
        >
          <div class="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl mb-6">
            🔒
          </div>
          <h3 class="text-2xl font-bold text-neutral-900 mb-2">
            Devam Etmek İçin Giriş Yapın
          </h3>
          <p class="text-neutral-600 mb-8 max-w-md">
            Satıcı başvurusu yapabilmek için TicariTakas hesabınıza giriş
            yapmalısınız.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
            <NuxtLink
              to="/login"
              class="flex-1 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 font-bold text-center"
            >
              Giriş
              Yap
            </NuxtLink>
            <NuxtLink
              to="/register"
              class="flex-1 bg-neutral-100 text-neutral-700 px-6 py-3 rounded-xl hover:bg-neutral-200 font-bold text-center"
            >
              Kayıt Ol
            </NuxtLink>
          </div>
        </div>

        <!-- Multi-step Form -->
        <div
          v-else
          class="flex-1 flex flex-col"
        >
          <div class="p-8 sm:p-12 flex-1">
            <!-- Step 1: Introduction -->
            <div
              v-if="currentStep === 1"
              class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 class="text-3xl font-bold text-neutral-900 mb-6">
                    TicariTakas'ta Satış Yapmanın Ayrıcalıklarını
                    Keşfedin
                  </h2>
                  <div class="space-y-6">
                    <div
                      v-for="(benefit, i) in benefits"
                      :key="i"
                      class="flex gap-4"
                    >
                      <div
                        class="flex-shrink-0 w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center text-xl"
                      >
                        {{ benefit.icon }}
                      </div>
                      <div>
                        <h4 class="font-bold text-neutral-900">
                          {{ benefit.title }}
                        </h4>
                        <p class="text-sm text-neutral-600">
                          {{ benefit.desc }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="bg-primary-50 rounded-3xl p-8 border border-primary-100">
                  <div
                    class="aspect-square bg-white rounded-2xl shadow-inner flex items-center justify-center text-6xl"
                  >
                    🛍️
                  </div>
                  <div class="mt-6 text-center">
                    <p class="text-primary-900 font-medium italic">
                      "TicariTakas ile satışlarım %300 arttı! Teşekkürler."
                    </p>
                    <p class="text-primary-600 text-sm mt-2">
                      - Elif Y., Butik Mağaza Sahibi
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Business Info -->
            <div
              v-if="currentStep === 2"
              class="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500"
            >
              <h2 class="text-2xl font-bold text-neutral-900 border-b pb-4">
                📋 İşletme Bilgileri
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="block text-sm font-bold text-neutral-700">İşletme Adı *</label>
                  <input
                    v-model="form.businessName"
                    type="text"
                    placeholder="Mağaza veya Şirket Adı"
                    class="input-modern"
                    required
                  >
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-bold text-neutral-700">İşletme Tipi *</label>
                  <select
                    v-model="form.businessType"
                    class="input-modern"
                    required
                  >
                    <option value="">
                      Seçin
                    </option>
                    <option value="INDIVIDUAL">
                      Şahıs Şirketi
                    </option>
                    <option value="COMPANY">
                      Limited veya Anonim Şirket
                    </option>
                    <option value="COOPERATIVE">
                      Kooperatif
                    </option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-bold text-neutral-700">Vergi No / T.C. Kimlik No</label>
                  <input
                    v-model="form.taxId"
                    type="text"
                    class="input-modern"
                    placeholder="Vergi numaranız"
                  >
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-bold text-neutral-700">Ticaret Sicil No</label>
                  <input
                    v-model="form.businessRegistration"
                    type="text"
                    class="input-modern"
                    placeholder="Varsa sicil numaranız"
                  >
                </div>
              </div>
            </div>

            <!-- Step 3: Contact Info -->
            <div
              v-if="currentStep === 3"
              class="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500"
            >
              <h2 class="text-2xl font-bold text-neutral-900 border-b pb-4">
                📞 İletişim & Adres
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="block text-sm font-bold text-neutral-700">Telefon *</label>
                  <input
                    v-model="form.phone"
                    type="tel"
                    class="input-modern"
                    placeholder="+90 5XX XXX XX XX"
                    required
                  >
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-bold text-neutral-700">E-posta Adresi *</label>
                  <input
                    v-model="form.email"
                    type="email"
                    class="input-modern"
                    placeholder="info@magazaniz.com"
                    required
                  >
                </div>
                <div class="md:col-span-2 space-y-2">
                  <label class="block text-sm font-bold text-neutral-700">Açık Adres *</label>
                  <textarea
                    v-model="form.address"
                    rows="3"
                    class="input-modern"
                    placeholder="Mahalle, Sokak, No..."
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-bold text-neutral-700">Şehir *</label>
                  <select
                    v-model="form.city"
                    class="input-modern"
                    required
                    @change="form.district = ''"
                  >
                    <option value="">
                      Seçin
                    </option>
                    <option
                      v-for="(districts, city) in iller"
                      :key="city"
                      :value="city"
                    >
                      {{ city }}
                    </option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-bold text-neutral-700">İlçe *</label>
                  <select
                    v-model="form.district"
                    :disabled="!form.city"
                    class="input-modern"
                    required
                  >
                    <option value="">
                      Seçin
                    </option>
                    <option
                      v-for="district in (iller[form.city] || [])"
                      :key="district"
                      :value="district"
                    >
                      {{ district
                      }}
                    </option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-bold text-neutral-700">Posta Kodu</label>
                  <input
                    v-model="form.zipCode"
                    type="text"
                    class="input-modern"
                    placeholder="Posta Kodu"
                  >
                </div>
              </div>
            </div>

            <!-- Step 4: Bank & Categories -->
            <div
              v-if="currentStep === 4"
              class="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500"
            >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div class="space-y-6">
                  <h2 class="text-2xl font-bold text-neutral-900 border-b pb-4">
                    💳 Banka Bilgileri
                  </h2>
                  <div class="space-y-2">
                    <label class="block text-sm font-bold text-neutral-700">Hesap Sahibi Adı *</label>
                    <input
                      v-model="form.bankAccountName"
                      type="text"
                      class="input-modern"
                      placeholder="Ad Soyad"
                    >
                  </div>
                  <div class="space-y-2">
                    <label class="block text-sm font-bold text-neutral-700">Banka Adı *</label>
                    <input
                      v-model="form.bankName"
                      type="text"
                      class="input-modern"
                      placeholder="Ziraat, Garanti..."
                    >
                  </div>
                  <div class="space-y-2">
                    <label class="block text-sm font-bold text-neutral-700">IBAN *</label>
                    <input
                      v-model="form.bankIban"
                      type="text"
                      class="input-modern font-mono"
                      placeholder="TRXX XXXX..."
                    >
                  </div>
                </div>
                <div class="space-y-6">
                  <h2 class="text-2xl font-bold text-neutral-900 border-b pb-4">
                    🏷️ Kategoriler
                  </h2>
                  <p class="text-sm text-neutral-500">
                    Mağazanızda hangi kategorilerde ürün satacaksınız?
                  </p>
                  <div class="max-h-60 overflow-y-auto pr-4 space-y-2">
                    <label
                      v-for="cat in categories"
                      :key="cat.id"
                      class="flex items-center gap-3 p-3 rounded-xl border border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-all"
                    >
                      <input
                        v-model="form.categories"
                        type="checkbox"
                        :value="cat.id"
                        class="w-5 h-5 rounded text-primary-600 border-neutral-300 focus:ring-primary-500"
                      >
                      <span class="text-sm font-medium text-neutral-700">{{ cat.name }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 5: Legal Agreements -->
            <div
              v-if="currentStep === 5"
              class="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500"
            >
              <h2 class="text-2xl font-bold text-neutral-900 border-b pb-4">
                ⚖️ Hukuki Metinler & Onaylar
              </h2>

              <div class="space-y-4">
                <div
                  v-for="doc in legalDocs"
                  :key="doc.slug"
                  class="border border-neutral-200 rounded-2xl overflow-hidden"
                >
                  <button
                    class="w-full flex items-center justify-between p-4 bg-neutral-50 hover:bg-neutral-100 transition-all font-bold text-neutral-700"
                    @click="activeDoc = activeDoc === doc.slug ? null : doc.slug"
                  >
                    <span>{{ doc.title }}</span>
                    <span>{{ activeDoc === doc.slug ? '−' : '+' }}</span>
                  </button>
                  <div
                    v-show="activeDoc === doc.slug"
                    class="p-6 text-sm text-neutral-600 bg-white max-h-60 overflow-y-auto border-t space-y-2 whitespace-pre-wrap"
                  >
                    {{ doc.content }}
                  </div>
                </div>
              </div>

              <div class="bg-primary-50 p-6 rounded-2xl border border-primary-100 space-y-4">
                <label class="flex items-start gap-4 cursor-pointer group">
                  <input
                    v-model="form.agreeTerms"
                    type="checkbox"
                    class="mt-1 w-5 h-5 rounded text-primary-600 border-primary-300 focus:ring-primary-500"
                  >
                  <span class="text-sm text-primary-900 leading-relaxed font-medium">
                    Yukarıdaki aydınlatma metnini, gizlilik politikasını ve satıcı sözleşmesini okudum, anladım ve kabul
                    ediyorum.
                  </span>
                </label>
                <label class="flex items-start gap-4 cursor-pointer group">
                  <input
                    v-model="form.agreeMarketing"
                    type="checkbox"
                    class="mt-1 w-5 h-5 rounded text-primary-600 border-primary-300 focus:ring-primary-500"
                  >
                  <span class="text-sm text-primary-900 leading-relaxed font-medium">
                    Ticari Elektronik İleti Bilgilendirme Metni kapsamında tarafıma pazarlama iletileri gönderilmesine
                    onay
                    veriyorum.
                  </span>
                </label>
              </div>
            </div>

            <!-- Step 6: Summary & Submit -->
            <div
              v-if="currentStep === 6"
              class="space-y-8 animate-in fade-in zoom-in-95 duration-500 text-center py-8"
            >
              <div
                class="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6"
              >
                🏁
              </div>
              <h2 class="text-3xl font-bold text-neutral-900">
                Neredeyse Hazırsınız!
              </h2>
              <p class="text-neutral-600 max-w-lg mx-auto">
                Girdiğiniz tüm bilgilerin doğruluğunu kontrol ettiyseniz başvurunuzu admin onayına gönderebilirsiniz.
                Sizi aramızda görmek için sabırsızlanıyoruz.
              </p>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-10">
                <div class="p-4 bg-neutral-50 rounded-2xl">
                  <p class="text-[10px] uppercase font-bold text-neutral-400 mb-1">
                    Mağaza
                  </p>
                  <p class="text-sm font-bold text-neutral-900 truncate">
                    {{ form.businessName }}
                  </p>
                </div>
                <div class="p-4 bg-neutral-50 rounded-2xl">
                  <p class="text-[10px] uppercase font-bold text-neutral-400 mb-1">
                    Tip
                  </p>
                  <p class="text-sm font-bold text-neutral-900">
                    {{ form.businessType }}
                  </p>
                </div>
                <div class="p-4 bg-neutral-50 rounded-2xl">
                  <p class="text-[10px] uppercase font-bold text-neutral-400 mb-1">
                    Kategoriler
                  </p>
                  <p class="text-sm font-bold text-neutral-900">
                    {{ form.categories.length }} Adet
                  </p>
                </div>
                <div class="p-4 bg-neutral-50 rounded-2xl">
                  <p class="text-[10px] uppercase font-bold text-neutral-400 mb-1">
                    İletişim
                  </p>
                  <p class="text-sm font-bold text-neutral-900 truncate">
                    {{ form.phone }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Navigation -->
          <div class="p-8 bg-neutral-50 border-t flex justify-between items-center">
            <button
              v-if="currentStep > 1"
              class="px-8 py-3 rounded-xl border border-neutral-300 text-neutral-600 font-bold hover:bg-neutral-100 transition-all"
              @click="currentStep--"
            >
              Geri Dön
            </button>
            <div v-else />

            <button
              v-if="currentStep < 6"
              class="px-10 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
              @click="nextStep"
            >
              Devam Et
            </button>
            <button
              v-else
              :disabled="loading || !form.agreeTerms"
              class="px-12 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 disabled:bg-neutral-400"
              @click="submitForm"
            >
              {{ loading ? 'Gönderiliyor...' : '🚀 Başvuruyu Tamamla' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { iller } from '~/assets/css/data/component/iller'

definePageMeta({
  layout: 'default'
})

useHead({
  title: 'Satıcı Başvurusu | TicariTakas',
})

const currentStep = ref(1)
const loading = ref(false)
const vendorStatus = ref(null)
const rejectionReason = ref('')
const isLoggedIn = ref(false)
const activeDoc = ref(null)
const categories = ref([])
const legalDocs = ref([])
const announcements = ref([])

const fetchAnnouncements = async () => {
  try {
    const { $api } = useApi()
    const response = await $api('/api/dynamic/announcements?page=vendor_app')
    if (response.success) {
      announcements.value = response.data
    }
  } catch (error) {
    console.error('Announcements fetch error:', error)
  }
}

const stepTitles = [
  'Giriş',
  'İşletme',
  'İletişim & Adres',
  'Banka & Kategori',
  'Yasal Onaylar',
  'Tamamla'
]

const benefits = [
  { icon: '🚀', title: 'Hızlı Başlangıç', desc: 'Bir saat içinde mağazanızı açın ve ürünlerinizi yükleyin.' },
  { icon: '🏠', title: 'Evden Çalışın', desc: 'Kendi işinizi istediğiniz yerden yönetin.' },
  { icon: '💳', title: 'Güvenli Ödeme', desc: 'Ödemeleriniz her hafta düzenli olarak banka hesabınızda.' },
  { icon: '📊', title: 'Panel Desteği', desc: 'Detaylı raporlarla satışlarınızı analiz edin.' }
]

const form = ref({
  businessName: '',
  businessType: '',
  businessRegistration: '',
  taxId: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  district: '',
  zipCode: '',
  bankName: '',
  bankAccountName: '',
  bankIban: '',
  categories: [],
  agreeTerms: false,
  agreeMarketing: false
})

const fetchCategories = async () => {
  try {
    const { $api } = useApi()
    const response = await $api('/api/categories')
    if (response.success) {
      categories.value = response.data
    }
  } catch (error) {
    console.error('Kategoriler yüklenirken hata:', error)
  }
}

const fetchLegalDocs = async () => {
  try {
    const { $api } = useApi()
    const response = await $api('/api/legal')
    if (response.success) {
      // Get full content for important docs
      const slugs = ['aydinlatma-metni', 'gizlilik-politikasi', 'cerez-politikasi', 'ticari-elektronik-ileti-bilgilendirme-metni']
      const docs = []
      for (const slug of slugs) {
        const docRes = await $api(`/api/legal/${slug}`).catch(() => null)
        if (docRes && docRes.success) {
          docs.push(docRes.data)
        }
      }
      legalDocs.value = docs
    }
  } catch (error) {
    console.error('Hukuki metinler yüklenirken hata:', error)
  }
}

const checkVendorStatus = async () => {
  try {
    const { $api } = useApi()
    const resp = await $api('/api/auth/me').catch(() => null)

    if (!resp) {
      isLoggedIn.value = false
      return
    }

    isLoggedIn.value = true
    const userData = resp.user
    form.value.email = userData.email

    const vendorResponse = await $api(`/api/vendors/profile/${userData.id}`).catch(() => ({ success: false }))
    console.log('vendorResponse for checkVendorStatus:', vendorResponse)

    if (vendorResponse && vendorResponse.success && vendorResponse.data) {
      vendorStatus.value = vendorResponse.data.status
      if (vendorResponse.data.status === 'REJECTED') {
        rejectionReason.value = vendorResponse.data.rejectionReason || 'Kriterlere uygun görülmedi'
      }
    }
  } catch (error) {
    console.log('Satıcı profili kontrolü:', error)
  }
}

const nextStep = () => {
  // Basic validation could be added here for each step
  if (currentStep.value === 2 && (!form.value.businessName || !form.value.businessType)) {
    useNuxtApp().$toast.warning('Lütfen zorunlu alanları doldurun')
    return
  }
  if (currentStep.value === 3 && (!form.value.phone || !form.value.email || !form.value.address)) {
    useNuxtApp().$toast.warning('İletişim ve adres bilgileri zorunludur')
    return
  }
  if (currentStep.value === 4 && (!form.value.bankIban || form.value.categories.length === 0)) {
    useNuxtApp().$toast.warning('IBAN ve en az bir kategori seçmelisiniz')
    return
  }
  if (currentStep.value === 5 && !form.value.agreeTerms) {
    useNuxtApp().$toast.warning('Devam etmek için şartları kabul etmelisiniz')
    return
  }
  currentStep.value++
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const submitForm = async () => {
  loading.value = true
  try {
    const { $api } = useApi()
    const response = await $api('/api/vendors/register', {
      method: 'POST',
      body: form.value
    })

    if (response.success) {
      vendorStatus.value = 'PENDING'
      useNuxtApp().$toast.success('✅ Başvurunuz başarıyla alındı!')
    }
  } catch (error) {
    useNuxtApp().$toast.error(error.data?.error || 'Bir hata oluştu')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCategories()
  fetchLegalDocs()
  checkVendorStatus()
  fetchAnnouncements()
})
</script>

<style scoped>
.input-modern {
  @apply w-full px-5 py-3 rounded-2xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-600 transition-all outline-none placeholder-neutral-400;
}

.animate-in {
  animation: translateIn 0.5s ease-out forwards;
}

@keyframes translateIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
