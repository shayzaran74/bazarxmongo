<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-[100] flex items-center justify-center p-4"
  >
    <div
      class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm shadow-xl"
      @click="$emit('update:modelValue', false)"
    />
    <div class="relative bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl">
      <div class="p-8">
        <div class="flex items-center justify-between mb-8">
          <h3 class="text-xl font-black text-gray-900 uppercase">
            Toplu Ürün Düzenleme
          </h3>
          <button
            class="p-2 hover:bg-gray-100 rounded-xl"
            @click="$emit('update:modelValue', false)"
          >
            ✕
          </button>
        </div>

        <div class="space-y-6">
          <p class="text-xs text-gray-600 font-black uppercase tracking-widest">
            Seçili <span class="text-primary-600">{{ selectedCount }}</span> ürün için uygulanacak ayarlar:
          </p>

          <div class="grid grid-cols-1 gap-4">
            <!-- Featured -->
            <div class="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between group hover:bg-blue-100 transition-colors">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                  <SparklesIcon class="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p class="font-bold text-blue-900">
                    ✨ Sana Özel
                  </p>
                  <p class="text-[10px] text-blue-700 uppercase font-black tracking-tighter">
                    Featured
                  </p>
                </div>
              </div>
              <select
                v-model="form.isFeatured"
                class="bg-white border-2 border-transparent rounded-xl px-4 py-2 text-xs font-black text-blue-900 focus:ring-2 focus:ring-blue-500 hover:border-blue-300 transition-all outline-none"
              >
                <option :value="undefined">
                  Değiştirme
                </option>
                <option :value="true">
                  Aktif Et
                </option>
                <option :value="false">
                  Kapat
                </option>
              </select>
            </div>

            <!-- Flash Sale -->
            <div class="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center justify-between group hover:bg-orange-100 transition-colors">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mr-3 group-hover:bg-orange-200 transition-colors">
                  <BoltIcon class="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p class="font-bold text-orange-900">
                    ⚡ Flaş Ürün
                  </p>
                  <p class="text-[10px] text-orange-700 uppercase font-black tracking-tighter">
                    Flash Sale
                  </p>
                </div>
              </div>
              <select
                v-model="form.isFlashSale"
                class="bg-white border-2 border-transparent rounded-xl px-4 py-2 text-xs font-black text-orange-900 focus:ring-2 focus:ring-orange-500 hover:border-orange-300 transition-all outline-none"
              >
                <option :value="undefined">
                  Değiştirme
                </option>
                <option :value="true">
                  Aktif Et
                </option>
                <option :value="false">
                  Kapat
                </option>
              </select>
            </div>

            <!-- Special Offer -->
            <div class="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-between group hover:bg-red-100 transition-colors">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mr-3 group-hover:bg-red-200 transition-colors">
                  <FireIcon class="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p class="font-bold text-red-900">
                    🔥 Özel Fırsat
                  </p>
                  <p class="text-[10px] text-red-700 uppercase font-black tracking-tighter">
                    Special Offer
                  </p>
                </div>
              </div>
              <select
                v-model="form.isSpecialOffer"
                class="bg-white border-2 border-transparent rounded-xl px-4 py-2 text-xs font-black text-red-900 focus:ring-2 focus:ring-red-500 hover:border-red-300 transition-all outline-none"
              >
                <option :value="undefined">
                  Değiştirme
                </option>
                <option :value="true">
                  Aktif Et
                </option>
                <option :value="false">
                  Kapat
                </option>
              </select>
            </div>

            <!-- Visibility -->
            <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group hover:bg-gray-100 transition-colors">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center mr-3 group-hover:bg-gray-300 transition-colors">
                  <CheckCircleIcon class="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p class="font-bold text-gray-900">
                    👁️ Görünürlük
                  </p>
                  <p class="text-[10px] text-gray-500 uppercase font-black tracking-tighter">
                    Is Active
                  </p>
                </div>
              </div>
              <select
                v-model="form.isActive"
                class="bg-white border-2 border-transparent rounded-xl px-4 py-2 text-xs font-black text-gray-900 focus:ring-2 focus:ring-gray-500 hover:border-gray-300 transition-all outline-none"
              >
                <option :value="undefined">
                  Değiştirme
                </option>
                <option :value="true">
                  Aktif (Yayına Al)
                </option>
                <option :value="false">
                  Pasif (Yayından Kaldır)
                </option>
              </select>
            </div>

            <!-- Status -->
            <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between group hover:bg-emerald-100 transition-colors">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mr-3 group-hover:bg-emerald-200 transition-colors">
                  <CheckBadgeIcon class="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p class="font-bold text-emerald-900">
                    📄 Yayın Durumu
                  </p>
                  <p class="text-[10px] text-emerald-700 uppercase font-black tracking-tighter">
                    Status
                  </p>
                </div>
              </div>
              <select
                v-model="form.status"
                class="bg-white border-2 border-transparent rounded-xl px-4 py-2 text-xs font-black text-emerald-900 focus:ring-2 focus:ring-emerald-500 hover:border-emerald-300 transition-all outline-none"
              >
                <option :value="undefined">
                  Değiştirme
                </option>
                <option value="ACTIVE">
                  Aktif (Onaylı)
                </option>
                <option value="PENDING">
                  Onay Bekliyor
                </option>
                <option value="REJECTED">
                  Reddedildi
                </option>
                <option value="DRAFT">
                  Taslak
                </option>
                <option value="INACTIVE">
                  Pasif
                </option>
              </select>
            </div>
          </div>

          <div class="pt-4 flex gap-4">
            <button
              class="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all"
              @click="$emit('update:modelValue', false)"
            >
              İptal
            </button>
            <button
              :disabled="loading"
              class="flex-[2] py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all disabled:opacity-50"
              @click="$emit('save', form)"
            >
              {{ loading ? 'İşleniyor...' : 'Değişiklikleri Uygula' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from '#imports'
import SparklesIcon from '@heroicons/vue/24/outline/SparklesIcon'
import BoltIcon from '@heroicons/vue/24/outline/BoltIcon'
import FireIcon from '@heroicons/vue/24/outline/FireIcon'
import CheckCircleIcon from '@heroicons/vue/24/outline/CheckCircleIcon'
import CheckBadgeIcon from '@heroicons/vue/24/outline/CheckBadgeIcon'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  selectedCount: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  },
  initialForm: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['update:modelValue', 'save'])

const form = ref({
  isFeatured: undefined,
  isSpecialOffer: undefined,
  isFlashSale: undefined,
  isActive: undefined,
  status: undefined,
  ...props.initialForm
})

watch(() => props.modelValue, (val) => {
  if (val) {
    form.value = {
      isFeatured: undefined,
      isSpecialOffer: undefined,
      isFlashSale: undefined,
      isActive: undefined,
      status: undefined,
      ...props.initialForm
    }
  }
})
</script>
