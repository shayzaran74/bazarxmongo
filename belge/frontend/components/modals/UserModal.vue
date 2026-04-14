<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <!-- Header -->
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            {{ isEdit ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Oluştur' }}
          </h3>
          <button
            class="text-gray-400 hover:text-gray-600"
            @click="$emit('close')"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <!-- Form -->
        <form
          class="space-y-4"
          @submit.prevent="saveUser"
        >
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                for="firstName"
                class="block text-sm font-medium text-gray-700"
              >Ad *</label>
              <input
                id="firstName"
                v-model="form.firstName"
                type="text"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Örn: Ahmet"
              >
            </div>
            <div>
              <label
                for="lastName"
                class="block text-sm font-medium text-gray-700"
              >Soyad *</label>
              <input
                id="lastName"
                v-model="form.lastName"
                type="text"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Örn: Yılmaz"
              >
            </div>
          </div>

          <div>
            <label
              for="email"
              class="block text-sm font-medium text-gray-700"
            >E-posta *</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              :disabled="isEdit"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-100"
              placeholder="ornek@email.com"
            >
          </div>

          <div v-if="!isEdit">
            <label
              for="password"
              class="block text-sm font-medium text-gray-700"
            >Şifre *</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="En az 6 karakter"
            >
          </div>

          <div>
            <label
              for="phone"
              class="block text-sm font-medium text-gray-700"
            >Telefon</label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="+90 555 123 45 67"
            >
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                for="status"
                class="block text-sm font-medium text-gray-700"
              >Durum</label>
              <select
                id="status"
                v-model="form.status"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="ACTIVE">
                  Aktif
                </option>
                <option value="INACTIVE">
                  Pasif
                </option>
                <option value="SUSPENDED">
                  Askıya Alınmış
                </option>
                <option value="BANNED">
                  Banlanmış
                </option>
              </select>
            </div>

            <div v-if="!isEdit || (user && user.vendor)">
              <label
                for="walletTier"
                class="block text-sm font-medium text-gray-700"
              >Cüzdan / Takas Seviyesi
                (Tier)</label>
              <select
                id="walletTier"
                v-model="form.walletTier"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="CORE">
                  CORE (Çekirdek)
                </option>
                <option value="PRIME">
                  PRIME (Asil)
                </option>
                <option value="ELITE">
                  ELITE (Elit)
                </option>
                <option value="APEX">
                  APEX (Zirve)
                </option>
              </select>
            </div>

            <div v-if="isEdit && (!user || !user.vendor)">
              <label class="block text-sm font-medium text-gray-700">Sadakat Seviyesi</label>
              <div class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm">
                {{ user?.loyaltyTier || 'BEGINNER' }}
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-gray-700">Roller</label>
              <div class="mt-2">
                <label class="inline-flex items-center">
                  <input
                    v-model="form.isAdmin"
                    type="checkbox"
                    class="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  >
                  <span class="ml-2 text-sm text-gray-700">Admin yetkisi</span>
                </label>
              </div>
            </div>
          </div>

          <div v-if="isEdit">
            <label class="block text-sm font-medium text-gray-700">E-posta Doğrulama</label>
            <div class="mt-2">
              <label class="inline-flex items-center">
                <input
                  v-model="form.isEmailVerified"
                  type="checkbox"
                  class="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                >
                <span class="ml-2 text-sm text-gray-700">E-posta doğrulandı</span>
              </label>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              type="button"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              @click="$emit('close')"
            >
              İptal
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <span
                v-if="saving"
                class="flex items-center"
              >
                <svg
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Kaydediliyor...
              </span>
              <span v-else>
                {{ isEdit ? 'Güncelle' : 'Oluştur' }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from '#imports'
import { useNuxtApp, useApi } from '#imports'
import XMarkIcon from '@heroicons/vue/24/outline/XMarkIcon'

// Props
const props = defineProps({
  user: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['close', 'saved'])

// State
const saving = ref(false)

// Computed
const isEdit = computed(() => !!props.user)

// Form
const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  status: 'ACTIVE',
  isAdmin: false,
  isEmailVerified: false,
  walletTier: 'CORE'
})

const { $api } = useApi()

// Initialize form
const initForm = () => {
  if (props.user) {
    form.value = {
      firstName: props.user.profile?.firstName || props.user.firstName || '',
      lastName: props.user.profile?.lastName || props.user.lastName || '',
      email: props.user.email || '',
      password: '', // Don't load password
      phone: props.user.profile?.phone || props.user.phone || '',
      status: props.user.status?.toUpperCase() || 'ACTIVE',
      isAdmin: props.user.isAdmin || false,
      isEmailVerified: props.user.isEmailVerified || false,
      walletTier: props.user.walletTier || 'CORE'
    }
  } else {
    form.value = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      status: 'ACTIVE',
      isAdmin: false,
      isEmailVerified: false,
      walletTier: 'CORE'
    }
  }
}

// Methods
const saveUser = async () => {
  try {
    saving.value = true

    // Build the nested payload structure
    const payload = {
      email: form.value.email,
      status: form.value.status,
      isAdmin: form.value.isAdmin,
      isEmailVerified: form.value.isEmailVerified,
      profile: {
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        phone: form.value.phone
      }
    }

    // Add password only if provided (required for create, optional for edit)
    if (form.value.password) {
      payload.password = form.value.password
    }

    // Only send walletTier if user is a vendor or it's a new user
    if (!isEdit.value || (props.user && props.user.vendor)) {
      payload.walletTier = form.value.walletTier
    }

    const endpoint = isEdit.value ? `/api/admin/users/${props.user.id}` : '/api/admin/users'
    const method = isEdit.value ? 'PUT' : 'POST'

    const response = await $api(endpoint, {
      method,
      body: payload
    })

    if (response && response.success) {
      useNuxtApp().$toast.success(isEdit.value ? 'Kullanıcı başarıyla güncellendi!' : 'Kullanıcı başarıyla oluşturuldu!')
      emit('saved')
    }
  } catch (error) {
    console.error('Save user error:', error)
    // Error toast is handled by customFetch in useApi.ts unless disabled
  } finally {
    saving.value = false
  }
}

// Watch for prop changes
watch(() => props.user, () => {
  initForm()
}, { immediate: true })

// Initialize form on mount
onMounted(() => {
  initForm()
})
</script>