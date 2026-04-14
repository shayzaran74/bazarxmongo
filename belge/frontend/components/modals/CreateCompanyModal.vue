<template>
  <div class="fixed inset-0 z-[300] flex items-center justify-center p-4">
    <div
      class="absolute inset-0 bg-gray-900/80 backdrop-blur-md"
      @click="$emit('close')"
    />
    <div class="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-scale-up">
      <div class="p-8 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-black text-gray-900 uppercase tracking-tightest italic">
            FİRMA PROFİLİ OLUŞTUR
          </h2>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
            Platformda işlem yapabilmek
            için firma bilgilerini girin
          </p>
        </div>
        <button
          class="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors"
          @click="$emit('close')"
        >
          <XMarkIcon class="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div class="p-8 space-y-6">
        <div class="grid grid-cols-1 gap-6">
          <div class="space-y-2">
            <label class="block text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1">FİRMA ADI</label>
            <input
              v-model="formData.name"
              type="text"
              class="w-full bg-gray-50 border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold"
              placeholder="Örn: Ticari A.Ş."
              required
            >
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1">VERGİ
                NUMARASI</label>
              <input
                v-model="formData.taxNumber"
                type="text"
                class="w-full bg-gray-50 border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold"
                placeholder="1234567890"
              >
            </div>
            <div class="space-y-2">
              <label class="block text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1">TELEFON</label>
              <input
                v-model="formData.phone"
                type="text"
                class="w-full bg-gray-50 border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold"
                placeholder="05XX XXX XX XX"
              >
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1">ŞEHİR</label>
              <input
                v-model="formData.city"
                type="text"
                class="w-full bg-gray-50 border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold"
                placeholder="İSTANBUL"
              >
            </div>
            <div class="space-y-2">
              <label class="block text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1">SANAYİ BÖLGESİ /
                İLÇE</label>
              <input
                v-model="formData.district"
                type="text"
                class="w-full bg-gray-50 border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold"
                placeholder="İKİTELLİ OSB"
              >
            </div>
          </div>
        </div>

        <button
          :disabled="loading"
          class="w-full bg-primary-600 hover:bg-primary-500 text-white rounded-2xl py-5 text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-primary-600/20 active:scale-95"
          @click="submitCompany"
        >
          {{ loading ? 'OLUŞTURULUYOR...' : 'FİRMAYI KAYDET' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, useRuntimeConfig, useAuthStore, useNuxtApp } from '#imports'
import XMarkIcon from '@heroicons/vue/24/outline/XMarkIcon'

const emit = defineEmits(['close', 'success'])
const config = useRuntimeConfig()
const authStore = useAuthStore()
const loading = ref(false)

const formData = ref({
  name: '',
  taxNumber: '',
  phone: '',
  city: '',
  district: '',
  address: '',
  description: ''
})

const submitCompany = async () => {
  if (!formData.value.name) return
  loading.value = true
  try {
    const response = await $fetch('/api/companies', {
      method: 'POST',
      baseURL: config.public.apiBase,
      body: formData.value,
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    if (response.success) {
      const toast = useNuxtApp().$toast
      toast.success('Firma profili başarıyla oluşturuldu!')
      emit('success')
      emit('close')
    }
  } catch (error) {
    console.error('Create company error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.animate-scale-up {
  animation: scale-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scale-up {
  from {
    transform: scale(0.9);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
