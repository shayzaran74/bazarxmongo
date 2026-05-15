<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
        <BuildingOfficeIcon class="h-6 w-6 text-primary-600" />
        {{ $t('profile.companyInfo') }}
      </h3>
      <span
        :class="['inline-flex items-center px-3 py-1 rounded-full text-sm font-bold uppercase', user?.vendor?.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700']"
      >
        {{ user?.vendor?.status || 'PENDING' }}
      </span>
    </div>

    <form
      class="space-y-6"
      @submit.prevent="console.log('ProfileCompanyTab: Form gönderiliyor...'); $emit('update')"
    >
      <div class="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.companyName') }}</label>
            <input
              v-model="form.companyName"
              type="text"
              class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base shadow-sm"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.taxNumber') }}</label>
            <input
              v-model="form.taxNumber"
              type="text"
              class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base shadow-sm"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.taxOffice') }}</label>
            <input
              v-model="form.taxOffice"
              type="text"
              class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base shadow-sm"
            >
          </div>
        </div>

        <div class="p-4 bg-primary-50 rounded-xl border border-primary-100">
          <div class="flex gap-3">
            <InformationCircleIcon class="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
            <p class="text-sm text-primary-800 leading-relaxed">
              {{ $t('profile.vendorStatusNote') || 'Mağaza ve vergi bilgileriniz güncellendiğinde sistem yöneticisi onayına sunulabilir.' }}
            </p>
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
          <span v-else>{{ $t('profile.updateCompanyInfo') || 'Firma Bilgilerini Güncelle' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { BuildingOfficeIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'

const form = defineModel('form', { type: Object })

defineProps({
  user: {
    type: Object,
    default: () => ({})
  },
  loading: Boolean
})

defineEmits(['update'])
</script>
