<template>
  <div class="space-y-6">
    <form
      class="space-y-6"
      @submit.prevent="$emit('update')"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.firstName') }}</label>
          <input
            v-model="form.firstName"
            type="text"
            class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base shadow-sm"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.lastName') }}</label>
          <input
            v-model="form.lastName"
            type="text"
            class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base shadow-sm"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.email') }}</label>
          <input
            :value="user?.email"
            type="email"
            disabled
            class="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 text-gray-500 text-base cursor-not-allowed shadow-sm"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.phone') }}</label>
          <input
            v-model="form.phoneNumber"
            type="tel"
            class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base shadow-sm"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.city') || 'İl' }}</label>
          <div class="relative">
            <select
              v-model="form.city"
              class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base appearance-none bg-white shadow-sm"
            >
              <option value="">{{ $t('profile.selectCity') || 'İl seçiniz' }}</option>
              <option v-for="c in cities" :key="c.name" :value="c.name">{{ c.name }}</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <ChevronDownIcon class="h-5 w-5" />
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.district') || 'İlçe' }}</label>
          <div class="relative">
            <select
              v-model="form.district"
              :disabled="!form.city"
              class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base appearance-none bg-white disabled:bg-gray-50 disabled:text-gray-400 shadow-sm"
            >
              <option value="">{{ $t('profile.selectDistrict') || 'Seçiniz' }}</option>
              <option v-for="d in filteredDistricts" :key="d" :value="d">{{ d }}</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <ChevronDownIcon class="h-5 w-5" />
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.gender') || 'Cinsiyet' }}</label>
          <div class="relative">
            <select
              v-model="form.gender"
              class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base appearance-none bg-white shadow-sm"
            >
              <option value="">{{ $t('profile.selectGender') || 'Seçiniz' }}</option>
              <option value="MALE">{{ $t('profile.genderMale') || 'Erkek' }}</option>
              <option value="FEMALE">{{ $t('profile.genderFemale') || 'Kadın' }}</option>
              <option value="OTHER">{{ $t('profile.genderOther') || 'Belirtmek İstemiyorum' }}</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <ChevronDownIcon class="h-5 w-5" />
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.accountStatus') }}</label>
          <div class="flex items-center gap-2 pt-1">
            <span
              :class="['px-4 py-2 rounded-xl text-sm font-bold', user?.status?.toUpperCase() === 'ACTIVE' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200']"
            >
              {{ user?.status?.toUpperCase() === 'ACTIVE' ? '✅ ' + $t('profile.active') : '❌ ' + $t('profile.passive') }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex justify-end pt-4">
        <button
          type="submit"
          :disabled="loading"
          class="bg-primary-600 text-white px-10 py-3.5 rounded-xl hover:bg-primary-700 font-bold disabled:opacity-50 transition-all shadow-lg shadow-primary-200 active:scale-95"
        >
          <span v-if="loading" class="flex items-center gap-2">
            <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ $t('common.processing') || 'İşleniyor...' }}
          </span>
          <span v-else>{{ $t('profile.updateProfile') }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/20/solid'

const form = defineModel('form', { type: Object })

const props = defineProps({
  user: {
    type: Object,
    default: () => ({})
  },
  loading: Boolean
})

defineEmits(['update'])

// İller ve ilçeler haritası
const cities = [
  { name: 'İstanbul', districts: ['Ataşehir', 'Beşiktaş', 'Beykoz', 'Beyoğlu', 'Kadıköy', 'Kâğıthane', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer', 'Şişli', 'Ümraniye', 'Üsküdar', 'Bakırköy', 'Bağcılar', 'Bahçelievler', 'Esenler', 'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Küçükçekmece', 'Sultangazi', 'Zeytinburnu'] },
  { name: 'Ankara', districts: ['Altındağ', 'Çankaya', 'Etimesgut', 'Keçiören', 'Mamak', 'Pursaklar', 'Sincan', 'Yenimahalle', 'Gölbaşı'] },
  { name: 'İzmir', districts: ['Balçova', 'Bayraklı', 'Bornova', 'Buca', 'Çiğli', 'Gaziemir', 'Güzelbahçe', 'Karabağlar', 'Karşıyaka', 'Konak', 'Narlıdere', 'Torbalı'] },
  { name: 'Bursa', districts: ['Görükle', 'İnegöl', 'Mudanya', 'Nilüfer', 'Osmangazi', 'Yıldırım'] },
  { name: 'Antalya', districts: ['Aksu', 'Döşemealtı', 'Konyaaltı', 'Kepez', 'Muratpaşa'] },
  { name: 'Adana', districts: ['Çukurova', 'Sarıçam', 'Seyhan', 'Yüreğir'] },
  { name: 'Konya', districts: ['Karatay', 'Meram', 'Selçuklu'] },
  { name: 'Gaziantep', districts: ['Şahinbey', 'Şehitkamil'] },
  { name: 'Kayseri', districts: ['Kocasinan', 'Melikgazi', 'Talas'] },
  { name: 'Mersin', districts: ['Akdeniz', 'Mezitli', 'Toroslar', 'Yenişehir'] },
]

// Seçilen ile göre ilçe listesi
const filteredDistricts = computed(() => {
  if (!form.value?.city) return []
  const found = cities.find(c => c.name === form.value.city)
  return found ? found.districts : []
})

// İl değişince ilçe sıfırlansın
watch(() => form.value?.city, () => {
  if (form.value) {
    form.value.district = ''
  }
})
</script>
