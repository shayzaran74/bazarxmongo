<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')" />

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-medium text-gray-900">
              {{ isEditing ? '✏️ Açık Artırma Düzenle' : '🎯 Yeni Açık Artırma Oluştur' }}
            </h3>
            <button class="text-gray-400 hover:text-gray-600 transition-colors duration-200" @click="$emit('close')">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>

          <!-- Form -->
          <form class="space-y-6" @submit.prevent="handleSubmit">
            <!-- Product Selection -->
            <AuctionProductSelector
              v-model="form.productId"
              :products="products"
              :selected-product="selectedProduct"
              :is-editing="isEditing"
            />

            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Açık Artırma Başlığı *</label>
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
              <label class="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
              <textarea
                v-model="form.description"
                rows="3"
                maxlength="1000"
                placeholder="Ürün hakkında detaylı bilgi..."
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <!-- Pricing Section -->
            <AuctionPriceForm v-model="form" />

            <!-- Timing Section -->
            <AuctionTimeForm
              v-model:start-time="form.startTime"
              v-model:end-time="form.endTime"
              :min-date-time="minDateTime"
              @set-preset="setDurationPreset"
            />

            <!-- Status (Edit Mode Only) -->
            <div v-if="isEditing">
              <label class="block text-sm font-medium text-gray-700 mb-2">Durum</label>
              <select
                v-model="form.status"
                class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="Active">Aktif (Devam Ediyor)</option>
                <option value="Completed">Tamamlandı</option>
                <option value="Cancelled">İptal Edildi</option>
              </select>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-3">
              <p class="text-sm text-red-800">{{ error }}</p>
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
import XMarkIcon from '@heroicons/vue/24/outline/XMarkIcon'
import { useCreateAuction } from '~/composables/useCreateAuction'
import AuctionProductSelector from './auction/AuctionProductSelector.vue'
import AuctionPriceForm from './auction/AuctionPriceForm.vue'
import AuctionTimeForm from './auction/AuctionTimeForm.vue'

const props = defineProps({
  auction: { type: Object, default: null },
  isEdit: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'created', 'updated'])

const {
  form, products, loading, error, isEditing, selectedProduct, minDateTime,
  setDurationPreset, handleSubmit
} = useCreateAuction(props, emit)
</script>