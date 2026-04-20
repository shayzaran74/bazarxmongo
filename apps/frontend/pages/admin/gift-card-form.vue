<template>
  <div class="max-w-3xl mx-auto">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
      <div class="flex items-center">
        <NuxtLink
          to="/admin/gift-cards"
          class="text-gray-500 hover:text-gray-700 mr-4"
        >
          <ChevronLeftIcon class="h-5 w-5" />
        </NuxtLink>
        <h1 class="text-2xl font-semibold text-gray-900">
          {{ isEditing ? 'Hediye Kartı Detayları' : 'Hediye Kartı Oluştur' }}
        </h1>
      </div>
      <button
        v-if="!isEditing"
        :disabled="saving"
        class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        @click="saveGiftCard"
      >
        {{ saving ? 'Kaydediliyor...' : 'Kaydet' }}
      </button>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="space-y-6">
        <!-- Gift Card Info -->
        <div
          v-if="isEditing"
          class="pb-6 border-b border-gray-200"
        >
          <div class="text-center">
            <div class="text-4xl mb-2">
              🎁
            </div>
            <div class="text-2xl font-mono font-bold text-gray-900 mb-2">
              {{ form.code }}
            </div>
            <div class="text-3xl font-bold text-blue-600">
              ₺{{ form.currentValue?.toFixed(2) }}
            </div>
          </div>
        </div>

        <!-- Form Fields -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Başlangıç Değeri *
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₺</span>
              <input
                v-model.number="form.initialValue"
                type="number"
                step="0.01"
                :disabled="isEditing"
                class="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                placeholder="10.00"
              >
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Müşteri E-posta (Opsiyonel)
            </label>
            <input
              v-model="form.customerEmail"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="musteri@example.com"
            >
            <p class="mt-1 text-sm text-gray-500">
              Müşteriye özel bir hediye kartı oluşturmak için e-posta adresini girin.
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Son Kullanma Tarihi
            </label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  v-model="expiryType"
                  type="radio"
                  value="none"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500"
                >
                <span class="ml-2 text-sm text-gray-900">Süresiz</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="expiryType"
                  type="radio"
                  value="custom"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500"
                >
                <span class="ml-2 text-sm text-gray-900">Tarih Belirle</span>
              </label>
            </div>
            <input
              v-if="expiryType === 'custom'"
              v-model="form.expiresAt"
              type="date"
              class="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Dahili Notlar</label>
            <textarea
              v-model="form.note"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Adminler için notlar..."
            />
          </div>
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
const expiryType = ref('none')

const form = ref({
  initialValue: 10,
  customerEmail: '',
  expiresAt: '',
  note: '',
  code: '',
  currentValue: 0,
  customer: null
})

const fetchGiftCard = async () => {
  if (!route.query.id) return

  try {
    const response = await $api(`/api/v1/admin/gift-cards/${route.query.id}`)

    form.value = response.data
    if (form.value.customer) {
      form.value.customerEmail = form.value.customer.email
    }
    if (form.value.expiresAt) {
      expiryType.value = 'custom'
      // Format date for html5 input (YYYY-MM-DD)
      form.value.expiresAt = new Date(form.value.expiresAt).toISOString().split('T')[0]
    }
  } catch (error) {
    console.error('Error fetching gift card:', error)
  }
}

const saveGiftCard = async () => {
  if (saving.value) return
  saving.value = true
  try {
    const data = {
      initialValue: form.value.initialValue,
      customerEmail: form.value.customerEmail,
      note: form.value.note,
      expiresAt: expiryType.value === 'custom' ? form.value.expiresAt : null
    }

    const response = await $api('/api/v1/admin/gift-cards', {
      method: 'POST',
      body: data
    })

    if (response.success) {
      const toast = useNuxtApp().$toast
      toast.success('Hediye kartı başarıyla oluşturuldu!')
      await navigateTo('/admin/gift-cards')
    }
  } catch (error) {
    console.error('Error saving gift card:', error)
    const toast = useNuxtApp().$toast
    toast.error('Hata oluştu')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchGiftCard()
})
</script>
