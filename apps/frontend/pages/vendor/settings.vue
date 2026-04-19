<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-black text-gray-900 tracking-tight">
        Mağaza Ayarları
      </h1>
      <p class="text-gray-500 mt-2">
        Müşterilerinize görünecek mağaza profilinizi tasarlayın ve yönetin.
      </p>
    </div>

    <div
      v-if="loading"
      key="loading"
      class="flex items-center justify-center py-20"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
    </div>

    <!-- Status Alerts -->
    <div
      v-else-if="vendor && vendor.status !== 'APPROVED'"
      key="status-alert"
      class="mb-6"
    >
      <div
        v-if="vendor.status === 'PENDING'"
        class="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl"
      >
        <div class="flex items-center">
          <InformationCircleIcon class="h-6 w-6 text-amber-500 mr-3" />
          <div>
            <p class="text-sm font-bold text-amber-800 uppercase tracking-tight">
              Onay Bekleniyor
            </p>
            <p class="text-xs text-amber-700 mt-1">
              Mağaza bilgileriniz şu an inceleme aşamasında. Onaylandıktan sonra
              yayına alınacaktır.
            </p>
          </div>
        </div>
      </div>
      <div
        v-if="vendor.status === 'REJECTED'"
        class="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl"
      >
        <div class="flex items-center">
          <XCircleIcon class="h-6 w-6 text-red-500 mr-3" />
          <div>
            <p class="text-sm font-bold text-red-800 uppercase tracking-tight">
              Başvuru Reddedildi
            </p>
            <p class="text-xs text-red-700 mt-1">
              {{ vendor.rejectionReason || 'Bilgileriniz uygun görülmedi. Lütfen eksikleri tamamlayıp tekrar gönderin.'
              }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <form
      v-else
      key="settings-form"
      class="space-y-6 pb-20"
      @submit.prevent="saveSettings"
    >
      <!-- Brand Profile Card -->
      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-50">
          <h2 class="text-xl font-bold text-gray-900">
            Marka Kimliği
          </h2>
        </div>

        <div class="p-8 space-y-8">
          <!-- Logo & Cover Preview -->
          <div class="space-y-6">
            <label class="block text-sm font-bold text-gray-700">Mağaza Görünümü Önizlemesi</label>
            <div class="relative group">
              <!-- Cover Preview -->
              <div
                class="h-48 w-full rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 relative group"
              >
                <img
                  v-if="form.coverImageUrl"
                  :src="form.coverImageUrl"
                  class="w-full h-full object-cover"
                >
                <div
                  v-else
                  class="flex flex-col items-center justify-center h-full text-gray-400"
                >
                  <PhotoIcon class="h-10 w-10 mb-2" />
                  <span class="text-sm">Kapak görseli eklenmemiş</span>
                </div>
                <!-- Logo Preview -->
                <div
                  class="absolute -bottom-6 left-8 h-24 w-24 rounded-2xl bg-white p-1 shadow-xl border-2 border-white overflow-hidden"
                >
                  <img
                    v-if="form.logoUrl"
                    :src="form.logoUrl"
                    class="w-full h-full object-contain rounded-xl"
                  >
                  <div
                    v-else
                    class="h-full w-full flex items-center justify-center bg-gray-50 text-gray-300"
                  >
                    <UserCircleIcon class="h-12 w-12" />
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
              <!-- Logo Input -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Logo</label>
                <div class="flex gap-2">
                  <div class="relative flex-1">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LinkIcon class="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      v-model="form.logoUrl"
                      type="text"
                      placeholder="https://example.com/logo.png"
                      class="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all text-sm"
                    >
                  </div>
                  <label
                    class="cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 p-3 rounded-xl shadow-sm transition-all"
                  >
                    <CloudArrowUpIcon class="h-6 w-6 text-primary-600" />
                    <input
                      type="file"
                      class="hidden"
                      accept="image/*"
                      @change="e => handleFileUpload(e, 'logo')"
                    >
                  </label>
                </div>
                <p class="mt-2 text-[10px] text-gray-500">
                  Önerilen: Kare (1:1), PNG/JPG.
                </p>
              </div>

              <!-- Cover Input -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Kapak Görseli</label>
                <div class="flex gap-2">
                  <div class="relative flex-1">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LinkIcon class="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      v-model="form.coverImageUrl"
                      type="text"
                      placeholder="https://example.com/cover.jpg"
                      class="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all text-sm"
                    >
                  </div>
                  <label
                    class="cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 p-3 rounded-xl shadow-sm transition-all"
                  >
                    <CloudArrowUpIcon class="h-6 w-6 text-primary-600" />
                    <input
                      type="file"
                      class="hidden"
                      accept="image/*"
                      @change="e => handleFileUpload(e, 'banner')"
                    >
                  </label>
                </div>
                <p class="mt-2 text-[10px] text-gray-500">
                  Önerilen: Geniş (3:1 veya 4:1).
                </p>
              </div>
            </div>
          </div>

          <!-- Business Info -->
          <div class="grid grid-cols-1 gap-6 pt-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Mağaza Adı</label>
              <input
                v-model="form.businessName"
                type="text"
                class="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all font-medium"
                required
              >
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Mağaza Açıklaması (Bio)</label>
              <textarea
                v-model="form.description"
                rows="4"
                placeholder="Mağazanız hakkında kısa bir bilgi verin, müşterilerinize neden sizi tercih etmeleri gerektiğini anlatın..."
                class="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all resize-none"
              />
              <p class="mt-2 text-xs text-gray-500">
                Mağaza sayfanızın en üstünde görünür.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Store Customization Card -->
      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-6">
        <div class="p-6 border-b border-gray-50">
          <h2 class="text-xl font-bold text-gray-900">
            Mağaza Özelleştirme
          </h2>
        </div>

        <div class="p-8 space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Left Ad -->
            <div class="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <h3 class="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-primary-500" /> Sol Reklam Alanı
              </h3>
              <div>
                <label class="block text-xs font-bold text-gray-500 mb-2 uppercase">Veya Ürün Seç</label>
                <select
                  v-model="form.adProductIdLeft"
                  class="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all text-sm"
                >
                  <option value="">
                    Ürün Seçiniz (Opsiyonel)
                  </option>
                  <option
                    v-for="product in vendorProducts"
                    :key="product.id"
                    :value="product.id"
                  >
                    {{ product.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Right Ad -->
            <div class="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <h3 class="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-purple-500" /> Sağ Reklam Alanı
              </h3>
              <div>
                <label class="block text-xs font-bold text-gray-500 mb-2 uppercase">Veya Ürün Seç</label>
                <select
                  v-model="form.adProductIdRight"
                  class="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all text-sm"
                >
                  <option value="">
                    Ürün Seçiniz (Opsiyonel)
                  </option>
                  <option
                    v-for="product in vendorProducts"
                    :key="product.id"
                    :value="product.id"
                  >
                    {{ product.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <!-- Show Ad Toggle -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-white rounded-lg shadow-sm">
                  <SparklesIcon class="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-900">
                    Reklam Alanını Göster
                  </p>
                  <p class="text-xs text-gray-500">
                    Üst taraftaki reklam bannerını aktif eder.
                  </p>
                </div>
              </div>
              <button
                type="button"
                class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
                :class="form.showAd ? 'bg-primary-600' : 'bg-gray-200'"
                @click="form.showAd = !form.showAd"
              >
                <span
                  aria-hidden="true"
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  :class="form.showAd ? 'translate-x-5' : 'translate-x-0'"
                />
              </button>
            </div>

            <!-- Show Flash Sales Toggle -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-white rounded-lg shadow-sm">
                  <InformationCircleIcon class="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-900">
                    Flaş Ürünler Bölümünü Göster
                  </p>
                  <p class="text-xs text-gray-500">
                    Mağaza sayfasının üstünde flaş ürünleri listeler.
                  </p>
                </div>
              </div>
              <button
                type="button"
                class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
                :class="form.showFlashSales ? 'bg-primary-600' : 'bg-gray-200'"
                @click="form.showFlashSales = !form.showFlashSales"
              >
                <span
                  aria-hidden="true"
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  :class="form.showFlashSales ? 'translate-x-5' : 'translate-x-0'"
                />
              </button>
            </div>

            <!-- Flash Products Selector -->
            <div
              v-if="form.showFlashSales"
              class="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100"
            >
              <div class="flex items-center justify-between mb-4">
                <div>
                  <p class="text-sm font-bold text-gray-900">
                    Flaş Ürün Seç (Maks. 10)
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ form.flashProductIds?.length || 0 }} / 10 ürün seçildi
                  </p>
                </div>
              </div>
              <div class="space-y-2 max-h-64 overflow-y-auto">
                <div
                  v-for="product in vendorProducts"
                  :key="product.id"
                  class="flex items-center gap-3 p-3 bg-white rounded-xl border cursor-pointer transition-all"
                  :class="form.flashProductIds?.includes(product.id) ? 'border-amber-400 ring-2 ring-amber-200' : 'border-gray-100 hover:border-gray-200'"
                  @click="toggleFlashProduct(product.id)"
                >
                  <div class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <NuxtImg
                      :src="product.image || 'https://placehold.co/100x100'"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ product.name }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ formatPrice(product.price) }}
                    </p>
                  </div>
                  <div
                    v-if="form.flashProductIds?.includes(product.id)"
                    class="p-1 bg-amber-500 rounded-lg"
                  >
                    <CheckIcon class="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Info Card -->
      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-50">
          <h2 class="text-xl font-bold text-gray-900">
            İletişim & Web
          </h2>
        </div>
        <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">E-posta</label>
            <input
              v-model="form.email"
              type="email"
              class="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all"
              placeholder="kurumsal@email.com"
            >
            <p class="mt-1 text-[10px] text-amber-600 font-bold">
              E-posta değişikliği onay gerektirir.
            </p>
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Telefon</label>
            <input
              v-model="form.phone"
              type="text"
              class="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
            >
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Web Sitesi</label>
            <input
              v-model="form.website"
              type="text"
              class="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
            >
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">WhatsApp</label>
            <input
              v-model="form.whatsapp"
              type="text"
              class="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
            >
          </div>
        </div>
      </div>

      <!-- Address Info Card -->
      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-6">
        <div class="p-6 border-b border-gray-50">
          <h2 class="text-xl font-bold text-gray-900">
            Adres Bilgileri
          </h2>
        </div>
        <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2">
            <label class="block text-sm font-bold text-gray-700 mb-2">Açık Adres</label>
            <input
              v-model="form.address"
              type="text"
              class="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all"
              placeholder="Mahalle, Sokak, No..."
            >
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Şehir</label>
            <input
              v-model="form.city"
              type="text"
              class="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all"
            >
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Posta Kodu</label>
            <input
              v-model="form.zipCode"
              type="text"
              class="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all"
            >
          </div>
        </div>
      </div>

      <!-- Bank Info Card -->
      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-6">
        <div class="p-6 border-b border-gray-50">
          <h2 class="text-xl font-bold text-gray-900">
            Banka Bilgileri
          </h2>
        </div>
        <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Banka Adı</label>
            <input
              v-model="form.bankName"
              type="text"
              class="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all"
            >
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Hesap Sahibi</label>
            <input
              v-model="form.bankAccountName"
              type="text"
              class="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all"
            >
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-bold text-gray-700 mb-2">IBAN</label>
            <input
              v-model="form.bankIban"
              type="text"
              class="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all"
              placeholder="TR00 0000 0000..."
            >
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-between pt-4 bg-gray-50 p-6 rounded-3xl border border-gray-100 mt-6">
        <div class="flex items-center text-sm text-gray-500">
          <InformationCircleIcon class="h-5 w-5 mr-2 text-amber-500" />
          Yaptığınız değişiklikler güvenlik gereği admin onayından sonra yayına alınacaktır.
        </div>
        <div class="flex gap-4">
          <NuxtLink
            v-if="vendor?.id"
            :to="`/vendors/${vendor.id}`"
            target="_blank"
            class="px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold transition-all flex items-center gap-2"
          >
            <EyeIcon class="h-5 w-5" />
            Mağazayı Gör
          </NuxtLink>
          <button
            type="submit"
            :disabled="saving"
            class="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-200 flex items-center gap-2 disabled:opacity-50"
          >
            <div
              v-if="saving"
              class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"
            />
            <CheckIcon
              v-else
              class="h-5 w-5"
            />
            {{ saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import {
  PhotoIcon,
  LinkIcon,
  UserCircleIcon,
  CheckIcon,
  InformationCircleIcon,
  EyeIcon,
  XCircleIcon,
  SparklesIcon,
  CloudArrowUpIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'vendor',
  middleware: 'vendor'
})

const authStore = useAuthStore()
const toast = useNuxtApp().$toast

const loading = ref(true)
const saving = ref(false)
const vendor = ref(null)
const vendorProducts = ref([])

const form = ref({
  businessName: '',
  logoUrl: '',
  coverImageUrl: '',
  description: '',
  phone: '',
  whatsapp: '',
  email: '',
  website: '',
  address: '',
  city: '',
  country: 'Türkiye',
  zipCode: '',
  bankName: '',
  bankAccountName: '',
  bankIban: '',
  adImageUrlLeft: '',
  adLinkUrlLeft: '',
  adImageUrlRight: '',
  adLinkUrlRight: '',
  adProductIdLeft: '',
  adProductIdRight: '',
  showAd: false,
  showFlashSales: false,
  flashProductIds: []
})

const fetchProfile = async () => {
  loading.value = true
  try {
    const { $api } = useApi()
    const response = await $api(`/api/vendors/profile/${authStore.user.id}`)

    if (response.success) {
      vendor.value = response.data
      // Fill form
      Object.keys(form.value).forEach(key => {
        if (response.data[key] !== undefined) {
          form.value[key] = response.data[key] ?? form.value[key]
        }
      })
    }
  } catch (error) {
    console.error('Fetch vendor profile error:', error)
    toast.error('Profil bilgileri yüklenemedi')
  } finally {
    loading.value = false
  }
}

const handleFileUpload = async (event, type) => {
  const file = event.target.files[0]
  if (!file) return

  // Frontend validation
  const validation = validateImage(file)
  if (!validation.isValid) {
    toast.error(validation.error)
    return
  }

  const formDataToSend = new FormData()
  formDataToSend.append('file', file)

  try {
    toast.info('Görsel yükleniyor...')
    const uploadUrl = `/api/upload?type=${type}`

    const { $api } = useApi()
    const response = await $api(uploadUrl, {
      method: 'POST',
      body: formDataToSend
    })

    if (response.success) {
      if (type === 'logo') {
        form.value.logoUrl = response.url
      } else if (type === 'banner') {
        form.value.coverImageUrl = response.url
      }
      toast.success('Görsel başarıyla yüklendi!')
    }
  } catch (error) {
    console.error('Upload error:', error)
    toast.error('Görsel yüklenirken bir hata oluştu')
  }
}

const fetchVendorProducts = async () => {
  if (!vendor.value?.id) return
  try {
    const { $api } = useApi()
    const response = await $api(`/api/products`, {
      params: { vendorId: vendor.value.id, limit: 100, status: 'ACTIVE' }
    })
    console.log('Fetched vendor products:', response.data?.length)
    if (response.success) {
      vendorProducts.value = response.data || []
    }
  } catch (error) {
    console.error('Fetch products error:', error)
  }
}

const toggleFlashProduct = (productId) => {
  if (!form.value.flashProductIds) {
    form.value.flashProductIds = []
  }
  const idx = form.value.flashProductIds.indexOf(productId)
  if (idx > -1) {
    form.value.flashProductIds.splice(idx, 1)
  } else if (form.value.flashProductIds.length < 10) {
    form.value.flashProductIds.push(productId)
  } else {
    toast.warning('En fazla 10 ürün seçebilirsiniz.')
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price || 0)
}

const saveSettings = async () => {
  if (!vendor.value?.id) return

  saving.value = true
  try {
    const body = { ...form.value }
    console.log('Saving vendor settings:', body)

    const { $api } = useApi()
    const response = await $api(`/api/vendors/${vendor.value.id}`, {
      method: 'PUT',
      body
    })

    if (response.success) {
      toast.success('Ayarlar başarıyla kaydedildi!')
      // Update local data
      vendor.value = response.data
    }
  } catch (error) {
    console.error('Save settings error:', error)
    toast.error('Ayarlar kaydedilirken bir hata oluştu')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await fetchProfile()
  await fetchVendorProducts()
})

useHead({
  title: 'Mağaza Ayarları - Satıcı Paneli'
})
</script>
