<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        @click="$emit('close')"
      />

      <!-- Modal panel -->
      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
      >
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-medium text-gray-900">
              {{ isEditing ? '✏️ Açık Artırma Düzenle' : '🎯 Yeni Açık Artırma Oluştur' }}
            </h3>
            <button
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              @click="$emit('close')"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>

          <!-- Form -->
          <form
            class="space-y-6"
            @submit.prevent="handleSubmit"
          >
            <!-- Product Selection -->
            <div v-if="!isEditing">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Ürün Seçin *
              </label>
              <select
                v-model="form.productId"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">
                  Listeden Bir Ürün Seçin...
                </option>
                <option
                  v-for="product in products"
                  :key="product.id"
                  :value="product.id"
                >
                  {{ product.name }} (Stok: {{ product.stock }}) - {{ formatPrice(product.price) }}
                </option>
              </select>

              <!-- Product Preview -->
              <div
                v-if="selectedProduct"
                class="mt-4 flex items-center p-3 bg-gray-50 rounded-xl border border-gray-100"
              >
                <img
                  :src="resolveImageUrl(selectedProduct.image)"
                  class="w-16 h-16 rounded-lg object-cover shadow-sm mr-4"
                >
                <div>
                  <p class="text-sm font-bold text-gray-900">
                    {{ selectedProduct.name }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ formatPrice(selectedProduct.price) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Açık Artırma Başlığı *
              </label>
              <input
                v-model="form.title"
                type="text"
                required
                maxlength="200"
                placeholder="Örn: 2025 Model iPhone 16 Pro Max"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                v-model="form.description"
                rows="3"
                maxlength="1000"
                placeholder="Ürün hakkında detaylı bilgi..."
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <!-- Pricing Row -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Başlangıç Fiyatı (TL) *
                </label>
                <input
                  v-model.number="form.startPrice"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Min. Artış Miktarı (TL) *
                </label>
                <input
                  v-model.number="form.minBidIncrement"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
              </div>
            </div>

            <!-- Deposit -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Katılım Depozitosu (TL)
              </label>
              <input
                v-model.number="form.participationDeposit"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
              <p class="text-xs text-gray-500 mt-1">
                Sıfır bırakırsanız depozito istenmez.
              </p>
            </div>

            <!-- Start Time -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Başlangıç Zamanı (Opsiyonel)
              </label>
              <input
                v-model="form.startTime"
                type="datetime-local"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
              <p class="text-xs text-gray-500 mt-1">
                Boş bırakırsanız hemen başlar.
              </p>
            </div>

            <!-- End Time -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Bitiş Zamanı *
              </label>
              <input
                v-model="form.endTime"
                type="datetime-local"
                required
                :min="minDateTime"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
            </div>



            <!-- Status (Edit Mode Only) -->
            <div v-if="isEditing">
              <label class="block text-sm font-medium text-gray-700 mb-2">Durum</label>
              <select
                v-model="form.status"
                class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="Active">
                  Aktif (Devam Ediyor)
                </option>
                <option value="Completed">
                  Tamamlandı
                </option>
                <option value="Cancelled">
                  İptal Edildi
                </option>
              </select>
            </div>

            <!-- Duration Presets -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Hızlı Süre Seçimi</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="preset in durationPresets"
                  :key="preset.label"
                  type="button"
                  class="px-3 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  @click="setDurationPreset(preset.hours)"
                >
                  {{ preset.label }}
                </button>
              </div>
            </div>

            <!-- Error Message -->
            <div
              v-if="error"
              class="bg-red-50 border border-red-200 rounded-md p-3"
            >
              <p class="text-sm text-red-800">
                {{ error }}
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                @click="$emit('close')"
              >
                İptal
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {{ loading ? 'İşleniyor...' : (isEditing ? 'Değişiklikleri Kaydet' : 'Açık Artırma Oluştur') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from '#imports'
import { useAppImage, useAuthStore, useRuntimeConfig, useNuxtApp } from '#imports'
import XMarkIcon from '@heroicons/vue/24/outline/XMarkIcon'

const { resolveImageUrl } = useAppImage()

// Props
const props = defineProps({
  auction: {
    type: Object,
    default: null
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

// Events
const emit = defineEmits(['close', 'created', 'updated'])

// Stores
const authStore = useAuthStore()

// State
const form = ref({
  productId: '',
  title: '',
  description: '',
  startPrice: '',
  minBidIncrement: 1.0,
  participationDeposit: 0,
  startTime: '',
  endTime: '',
  status: 'Active'
})

const products = ref([])
const loading = ref(false)
const error = ref('')

// Computed
const minDateTime = computed(() => {
  if (props.isEdit) return null // Allow past dates when editing if needed, or keep validation strict
  const now = new Date()
  now.setMinutes(now.getMinutes() + 60) // Minimum 1 hour from now
  return now.toISOString().slice(0, 16)
})

const durationPresets = [
  { label: '1 Saat', hours: 1 },
  { label: '6 Saat', hours: 6 },
  { label: '12 Saat', hours: 12 },
  { label: '1 Gün', hours: 24 },
  { label: '3 Gün', hours: 72 },
  { label: '1 Hafta', hours: 168 }
]

// Identify if we are in edit mode based on props
const isEditing = computed(() => props.isEdit && props.auction)

const selectedProduct = computed(() => {
  if (!form.value.productId) return null
  return products.value.find(p => p.id === form.value.productId)
})

// Methods
const fetchProducts = async () => {
  try {
    const config = useRuntimeConfig()
    const response = await $fetch('/api/products', {
      baseURL: config.public.apiBase,
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      },
      query: { limit: 100 }
    })
    products.value = response.data || []
  } catch (err) {
    console.error('Fetch products error:', err)
    error.value = 'Ürünler yüklenirken bir hata oluştu: ' + (err.message || err)
  }
}

const setDurationPreset = (hours) => {
  const now = new Date()
  now.setHours(now.getHours() + hours)
  form.value.endTime = now.toISOString().slice(0, 16)
}

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    // Validate form
    if (!form.value.title.trim()) throw new Error('Lütfen bir başlık girin')
    if (!form.value.startPrice || form.value.startPrice <= 0) throw new Error('Lütfen geçerli bir başlangıç fiyatı girin')
    if (!form.value.minBidIncrement || form.value.minBidIncrement <= 0) throw new Error('Lütfen geçerli bir minimum artış miktarı girin')
    if (!form.value.endTime) throw new Error('Lütfen bitiş zamanını seçin')

    // Prepare payload
    const payload = {
      title: form.value.title.trim(),
      description: form.value.description.trim(),
      startPrice: parseFloat(form.value.startPrice),
      minBidIncrement: parseFloat(form.value.minBidIncrement),
      participationDeposit: parseFloat(form.value.participationDeposit || 0),
      endTime: new Date(form.value.endTime).toISOString(),
      // Optional/Conditional fields
      ...(form.value.startTime ? { startTime: new Date(form.value.startTime).toISOString() } : {}),
      ...(isEditing.value ? { status: form.value.status } : { productId: form.value.productId })
    }

    // For creation, validate product
    if (!isEditing.value && !form.value.productId) {
      throw new Error('Lütfen bir ürün seçin')
    }

    const config = useRuntimeConfig()

    if (isEditing.value) {
      // UPDATE
      const response = await $fetch(`/api/auctions/${props.auction.id}`, {
        method: 'PUT',
        baseURL: config.public.apiBase,
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        },
        body: payload
      })
      useNuxtApp().$toast.success('Açık artırma güncellendi!')
      emit('updated', response.data)
    } else {
      // CREATE
      const response = await $fetch('/api/auctions', {
        method: 'POST',
        baseURL: config.public.apiBase,
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        },
        body: payload
      })
      useNuxtApp().$toast.success('Açık artırma oluşturuldu!')
      emit('created', response.data)
    }

    emit('close')
  } catch (err) {
    console.error('Save auction error:', err)
    error.value = err.data?.error || err.message || 'İşlem sırasında bir hata oluştu'
  } finally {
    loading.value = false
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}

// Initialize
onMounted(async () => {
  await fetchProducts()

  if (isEditing.value) {
    // Populate form with existing data
    form.value = {
      productId: props.auction.productId,
      title: props.auction.title,
      description: props.auction.description || '',
      startPrice: props.auction.startingPrice,
      minBidIncrement: props.auction.minBidIncrement || 1.0,
      participationDeposit: props.auction.participationDeposit || 0,
      startTime: props.auction.startTime ? new Date(props.auction.startTime).toISOString().slice(0, 16) : '',
      endTime: props.auction.endTime ? new Date(props.auction.endTime).toISOString().slice(0, 16) : '',
      status: props.auction.status || 'Active'
    }
  } else {
    // Set default end time to 24 hours from now
    const defaultEndTime = new Date()
    defaultEndTime.setHours(defaultEndTime.getHours() + 24)
    form.value.endTime = defaultEndTime.toISOString().slice(0, 16)
  }
})
</script>