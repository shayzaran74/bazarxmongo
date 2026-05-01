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
          <div v-if="!isEditing">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Hediye Kartı Kodu
            </label>
            <div class="flex gap-2">
              <input
                v-model="form.code"
                type="text"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Boş bırakırsanız otomatik üretilir"
              >
              <button 
                type="button"
                class="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                @click="generateRandomCode"
              >
                Rastgele Üret
              </button>
            </div>
          </div>

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
              Müşteri Seçin (Opsiyonel)
            </label>
            <select
              v-model="form.customerId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Genel (Kullanıcıya Atanmamış)</option>
              <option 
                v-for="user in registeredUsers" 
                :key="user.id" 
                :value="user.id"
              >
                {{ user.profile?.firstName }} {{ user.profile?.lastName }} ({{ user.email }})
              </option>
            </select>
            <p class="mt-1 text-sm text-gray-500">
              Kayıtlı kullanıcılardan birini seçebilirsiniz.
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
const registeredUsers = ref([])

const form = ref({
  initialValue: 10,
  customerId: '',
  customerEmail: '',
  expiresAt: '',
  note: '',
  code: '',
  currentValue: 0,
  customer: null
})

const fetchUsers = async () => {
  try {
    const response = await $api('/api/v1/admin/users?limit=100')
    registeredUsers.value = response.items || []
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

const generateRandomCode = () => {
  const suffix = Math.random().toString(36).substring(2, 10).toUpperCase()
  form.value.code = `BZX-${suffix.substring(0, 4)}-${suffix.substring(4, 8)}`
}

const fetchGiftCard = async () => {
  if (!route.query.id) return

  try {
    const response = await $api(`/api/v1/admin/gift-cards/${route.query.id}`)

    form.value = response.data
    if (form.value.customerId) {
      // customerEmail logic if needed
    }
    if (form.value.expiresAt) {
      expiryType.value = 'custom'
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
      code: form.value.code,
      initialValue: form.value.initialValue,
      customerId: form.value.customerId || null,
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
    toast.error(error.message || 'Hata oluştu')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchUsers()
  fetchGiftCard()
})
</script>
