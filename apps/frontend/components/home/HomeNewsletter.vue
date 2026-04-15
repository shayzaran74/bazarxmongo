<template>
  <div
    v-if="show !== 'false'"
    class="mb-10 mt-10 w-full max-w-5xl mx-auto px-4"
  >
    <div
      class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2rem] shadow-2xl p-6 md:p-10 text-white text-center relative overflow-hidden"
    >
      <!-- Decoration -->
      <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
      <div class="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400/20 rounded-full -ml-12 -mb-12 blur-xl" />

      <div class="relative z-10 max-w-2xl mx-auto">
        <h2 class="text-xl md:text-2xl font-black mb-4 uppercase italic tracking-tighter">
          {{ $t('newsletter.title') }}
        </h2>
        <p class="text-indigo-100 text-sm md:text-lg mb-8 opacity-90">
          {{ $t('newsletter.description') }}
        </p>

        <form
          class="flex flex-col sm:flex-row gap-3"
          @submit.prevent="handleSubscribe"
        >
          <input
            v-model="email"
            type="email"
            :placeholder="$t('newsletter.placeholder')"
            required
            class="flex-grow px-6 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-base"
          >
          <button
            type="submit"
            :disabled="loading"
            class="px-8 py-4 bg-white text-indigo-600 font-extrabold rounded-2xl hover:bg-indigo-50 transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            {{ loading ? $t('newsletter.waiting') : $t('newsletter.button') }}
          </button>
        </form>
        <p class="text-[10px] mt-6 opacity-60 uppercase tracking-widest font-bold">
          {{ $t('newsletter.footer') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useApi, useNuxtApp } from '#imports'
import type { ApiResponse } from '@barterborsa/shared-types'

interface ToastService {
  error: (message: string) => void;
  success: (message: string) => void;
}

defineProps<{
  show?: string
}>()

const email = ref('')
const loading = ref(false)

const handleSubscribe = async () => {
  if (!email.value || !email.value.includes('@')) {
    (useNuxtApp().$toast as unknown as ToastService).error('Lütfen geçerli bir e-posta adresi giriniz.')
    return
  }

  loading.value = true
  try {
    const { $api } = useApi()
    const data = await $api('/api/newsletter/subscribe', {
      method: 'POST',
      body: { email: email.value }
    }) as ApiResponse<{ message?: string }>

    if (data.success) {
      (useNuxtApp().$toast as unknown as ToastService).success(data.message || 'Başarıyla abone olundu.')
      email.value = ''
    } else {
      (useNuxtApp().$toast as unknown as ToastService).error(data.message || 'Bir hata oluştu.')
    }
  } catch (error) {
    (useNuxtApp().$toast as unknown as ToastService).error('Giriş başarısız oldu. Lütfen tekrar deneyin.')
  } finally {
    loading.value = false
  }
}
</script>
