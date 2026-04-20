<template>
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
      <div class="flex items-center">
        <NuxtLink
          to="/admin/users"
          class="text-gray-500 hover:text-gray-700 mr-4"
        >
          <ChevronLeftIcon class="h-5 w-5" />
        </NuxtLink>
        <h1 class="text-2xl font-semibold text-gray-900">
          {{ isEditing ? 'Müşteriyi Düzenle' : 'Yeni Müşteri' }}
        </h1>
      </div>
      <div class="flex items-center space-x-3">
        <NuxtLink
          to="/admin/users"
          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          İptal
        </NuxtLink>
        <button
          :disabled="saving"
          class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          @click="saveCustomer"
        >
          {{ saving ? 'Kaydediliyor...' : 'Kaydet' }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Customer Overview -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-sm font-medium text-gray-900 mb-4">
            Müşteriye genel bakış
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ad</label>
              <input
                v-model="form.firstName"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
              <input
                v-model="form.lastName"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
            </div>
          </div>

          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Dil</label>
            <select
              v-model="form.language"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="tr">
                Türkçe [Varsayılan]
              </option>
              <option value="en">
                English
              </option>
              <option value="de">
                Deutsch
              </option>
            </select>
            <p class="mt-1 text-sm text-gray-500">
              Bu müşterinin tercih ettiği dilde alacaktır
            </p>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-sm font-medium text-gray-900 mb-4">
            İletişim bilgileri
          </h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
              <input
                v-model="form.email"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Telefon numarası</label>
              <div class="flex space-x-2">
                <select class="px-3 py-2 border border-gray-300 rounded-md">
                  <option value="+90">
                    🇹🇷 +90
                  </option>
                  <option value="+1">
                    🇺🇸 +1
                  </option>
                  <option value="+44">
                    🇬🇧 +44
                  </option>
                </select>
                <input
                  v-model="form.phone"
                  type="tel"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
              </div>
            </div>

            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  v-model="form.marketingConsent"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                >
                <span class="ml-2 text-sm text-gray-900">
                  Müşteri, pazarlama e-postalarını almayı kabul etti
                </span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="form.smsConsent"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                >
                <span class="ml-2 text-sm text-gray-900">
                  Müşteri, SMS pazarlama kısa mesajları almayı kabul etti
                </span>
              </label>
            </div>

            <p class="text-sm text-gray-500">
              Müşterilerinizi pazarlama e-postalarına ve postaları veya SMS mesajlarına abone yapamadan önce onların
              izni almanız gerekir
            </p>
          </div>
        </div>

        <!-- Default Address -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-gray-900">
              Varsayılan adres
            </h3>
            <button
              v-if="!showAddressForm"
              class="text-sm text-blue-600 hover:text-blue-700"
              @click="showAddressForm = true"
            >
              Adres ekle
            </button>
          </div>

          <div
            v-if="showAddressForm"
            class="space-y-4"
          >
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ülke/Bölge</label>
              <select
                v-model="address.country"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="TR">
                  Türkiye
                </option>
                <option value="US">
                  United States
                </option>
                <option value="DE">
                  Germany
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                <input
                  v-model="address.firstName"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
                <input
                  v-model="address.lastName"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Şirket</label>
              <input
                v-model="address.company"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Adres</label>
              <input
                v-model="address.address1"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Daire, suit, vb.</label>
              <input
                v-model="address.address2"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
                <input
                  v-model="address.city"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">İl</label>
                <input
                  v-model="address.state"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Posta kodu</label>
                <input
                  v-model="address.zip"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input
                v-model="address.phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
            </div>
          </div>

          <p
            v-else
            class="text-sm text-gray-500"
          >
            Bu müşterinin henüz adresi
          </p>
        </div>

        <!-- Tax Settings -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-sm font-medium text-gray-900 mb-4">
            Vergi ayarları
          </h3>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Vergi muafiyeti</label>
            <select
              v-model="form.taxExempt"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option :value="false">
                Vergi tahsil et
              </option>
              <option :value="true">
                Bu müşteriden vergi tahsil etme
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="space-y-6">
        <!-- Notes -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-sm font-medium text-gray-900 mb-4">
            Notlar
          </h3>
          <textarea
            v-model="form.notes"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Notlar yalnızca size müşteriye paylaşılmaz"
          />
        </div>

        <!-- Tags -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-sm font-medium text-gray-900 mb-4">
            Etiketler
          </h3>
          <input
            v-model="form.tags"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="VIP, Toptan, vb."
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const route = useRoute()
const { $api } = useApi()
const isEditing = computed(() => !!route.query.id)
const saving = ref(false)
const showAddressForm = ref(false)

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  language: 'tr',
  marketingConsent: false,
  smsConsent: false,
  taxExempt: false,
  notes: '',
  tags: ''
})

const address = ref({
  firstName: '',
  lastName: '',
  company: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  country: 'TR',
  zip: '',
  phone: ''
})

const fetchCustomer = async () => {
  if (!route.query.id) return

  try {
    const response = await $api(`/api/v1/admin/users/${route.query.id}`)

    const customer = response.data
    form.value = {
      firstName: customer.name?.split(' ')[0] || '',
      lastName: customer.name?.split(' ')[1] || '',
      email: customer.email,
      phone: customer.phone || '',
      language: customer.language || 'tr',
      marketingConsent: customer.marketingConsent || false,
      smsConsent: customer.smsConsent || false,
      taxExempt: customer.taxExempt || false,
      notes: customer.notes || '',
      tags: customer.tags || ''
    }

    if (customer.addresses && customer.addresses.length > 0) {
      address.value = customer.addresses[0]
      showAddressForm.value = true
    }
  } catch (error) {
    console.error('Error fetching customer:', error)
  }
}

const saveCustomer = async () => {
  saving.value = true
  try {
    const url = isEditing.value
      ? `/api/v1/admin/users/${route.query.id}`
      : '/api/v1/admin/users'

    const method = isEditing.value ? 'PUT' : 'POST'

    const data = {
      name: `${form.value.firstName} ${form.value.lastName}`.trim(),
      email: form.value.email,
      phone: form.value.phone,
      language: form.value.language,
      marketingConsent: form.value.marketingConsent,
      smsConsent: form.value.smsConsent,
      taxExempt: form.value.taxExempt,
      address: showAddressForm.value ? address.value : null
    }

    const response = await $api(url, {
      method,
      body: data
    })

    if (response.success) {
      const toast = useNuxtApp().$toast
      toast.success(isEditing.value ? 'Müşteri güncellendi!' : 'Müşteri oluşturuldu!')
      await navigateTo('/admin/users')
    }
  } catch (error) {
    console.error('Error saving customer:', error)
    const toast = useNuxtApp().$toast
    const errorMessage = error.data?.error || 'Hata oluştu'
    toast.error(errorMessage)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchCustomer()
})
</script>
