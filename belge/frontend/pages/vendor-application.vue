<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8 relative">
        <h1 class="text-3xl font-bold text-gray-900">
          🏪 Satıcı Başvurusu
        </h1>
        <p class="mt-2 text-gray-600">
          Platformumuzda satış yapmak için başvurun
        </p>

        <!-- Announcements & Files -->
        <div
          v-if="announcements.length"
          class="mt-4 flex flex-wrap justify-center gap-3"
        >
          <div
            v-for="ann in announcements"
            :key="ann.id"
          >
            <a
              v-if="ann.linkUrl"
              :href="ann.linkUrl.startsWith('http') ? ann.linkUrl : (ann.linkUrl.startsWith('/') ? config.public.apiBase + ann.linkUrl : ann.linkUrl)"
              target="_blank"
              class="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-[10px] font-bold hover:bg-orange-100 border border-orange-200 transition-all shadow-sm group"
            >
              <span
                class="p-1 bg-orange-600 text-white rounded-md group-hover:scale-110 transition-transform text-[8px]"
              >📄</span>
              {{ ann.linkText || 'BİLGİLENDİRME DOSYASI' }}
            </a>
            <div
              v-else
              class="text-xs text-gray-600 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm"
            >
              {{ ann.content }}
            </div>
          </div>
        </div>
      </div>

      <!-- Application Form -->
      <div class="bg-white shadow-lg rounded-lg p-8">
        <form
          class="space-y-6"
          @submit.prevent="submitApplication"
        >
          <!-- Business Information -->
          <div class="border-b pb-6">
            <h3 class="text-lg font-semibold mb-4 text-gray-900">
              📋 İş Bilgileri
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">İşletme Adı *</label>
                <input
                  v-model="formData.businessName"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Örn: ABC Ticaret Ltd. Şti."
                >
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">TC Kimlik No (Şahıs İşletmeleri
                  İçin)</label>
                <input
                  v-model="formData.tckn"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="11111111111"
                  maxlength="11"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Vergi Kimlik No</label>
                <input
                  v-model="formData.vergiNo"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="1234567890"
                  maxlength="10"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">MERSİS No</label>
                <input
                  v-model="formData.mersisNo"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="0123456789000000"
                  maxlength="16"
                >
              </div>

              <!-- Old fields for backward compatibility/alias -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ticaret Sicil No</label>
                <input
                  v-model="formData.businessRegistration"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="12345678"
                >
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">İşletme Türü *</label>
                <select
                  v-model="formData.businessType"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">
                    Seçiniz
                  </option>
                  <option value="individual">
                    Şahıs
                  </option>
                  <option value="company">
                    Şirket
                  </option>
                  <option value="cooperative">
                    Kooperatif
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="border-b pb-6">
            <h3 class="text-lg font-semibold mb-4 text-gray-900">
              📞 İletişim Bilgileri
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
                <input
                  v-model="formData.phone"
                  type="tel"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="+90 555 123 45 67"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input
                  v-model="formData.whatsapp"
                  type="tel"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="+90 555 123 45 67"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
                <input
                  v-model="formData.email"
                  type="email"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="info@firma.com"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Web Sitesi</label>
                <input
                  v-model="formData.website"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="https://www.firma.com"
                >
              </div>
            </div>
          </div>

          <!-- Address -->
          <div class="border-b pb-6">
            <h3 class="text-lg font-semibold mb-4 text-gray-900">
              📍 Adres Bilgileri
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Adres *</label>
                <textarea
                  v-model="formData.address"
                  rows="3"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Tam adres..."
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Şehir *</label>
                <select
                  v-model="formData.city"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  @change="formData.district = ''"
                >
                  <option value="">
                    Seçiniz
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

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">İlçe *</label>
                <select
                  v-model="formData.district"
                  :disabled="!formData.city"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">
                    Seçiniz
                  </option>
                  <option
                    v-for="district in (iller[formData.city] || [])"
                    :key="district"
                    :value="district"
                  >
                    {{ district
                    }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ülke</label>
                <input
                  v-model="formData.country"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Türkiye"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Posta Kodu</label>
                <input
                  v-model="formData.zipCode"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="34000"
                >
              </div>
            </div>
          </div>

          <!-- Bank Information -->
          <div class="border-b pb-6">
            <h3 class="text-lg font-semibold mb-4 text-gray-900">
              🏦 Banka Bilgileri
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Banka Adı *</label>
                <input
                  v-model="formData.bankName"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Örn: Ziraat Bankası"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hesap Sahibi *</label>
                <input
                  v-model="formData.bankAccountName"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Ad Soyad / Şirket Adı"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">IBAN *</label>
                <input
                  v-model="formData.bankIban"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hesap Numarası</label>
                <input
                  v-model="formData.bankAccountNumber"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="1234567890"
                >
              </div>
            </div>
          </div>

          <!-- Categories -->
          <div class="pb-6">
            <h3 class="text-lg font-semibold mb-4 text-gray-900">
              🏷️ Satış Yapacağınız Kategoriler
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <label
                v-for="category in categories"
                :key="category.id"
                class="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  v-model="formData.categories"
                  type="checkbox"
                  :value="category.id"
                  class="w-4 h-4 text-primary-600 rounded"
                >
                <span class="ml-2 text-sm text-gray-700">{{ category.name }}</span>
              </label>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex gap-4">
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 transition-colors font-semibold"
            >
              {{ loading ? 'Gönderiliyor...' : 'Başvuru Gönder' }}
            </button>
            <NuxtLink
              to="/"
              class="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-center"
            >
              İptal
            </NuxtLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { iller } from '~/assets/css/data/component/iller'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const config = useRuntimeConfig()
const loading = ref(false)
const categories = ref([])
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

const formData = ref({
  businessName: '',
  businessRegistration: '',
  taxId: '',
  tckn: '',
  vergiNo: '',
  mersisNo: '',
  businessType: '',
  phone: '',
  whatsapp: '',
  email: authStore.user?.email || '',
  website: '',
  address: '',
  city: '',
  district: '',
  country: 'Türkiye',
  zipCode: '',
  bankName: '',
  bankAccountName: '',
  bankAccountNumber: '',
  bankIban: '',
  categories: []
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

const submitApplication = async () => {
  loading.value = true
  try {
    const { $api } = useApi()
    const response = await $api('/api/vendors/register', {
      method: 'POST',
      body: formData.value
    })

    if (response.success) {
      useNuxtApp().$toast.success('Başvurunuz alındı! Admin onayı bekleniyor.')
      await navigateTo('/')
    }
  } catch (error) {
    console.error('Başvuru hatası:', error)
    useNuxtApp().$toast.error(error.data?.error || 'Başvuru gönderilirken bir hata oluştu')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCategories()
  fetchAnnouncements()
})
</script>
