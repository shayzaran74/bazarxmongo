<template>
  <div class="min-h-screen bg-mesh flex flex-col justify-center py-12 px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div
        class="bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl p-10 border border-white/50 relative overflow-hidden"
      >
        <div class="relative z-10 text-center">
          <div class="flex justify-center mb-6">
            <div class="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center shadow-lg">
              <EnvelopeOpenIcon class="h-8 w-8 text-red-500" />
            </div>
          </div>

          <h2 class="text-2xl font-black text-gray-900 mb-2">
            Bülten Aboneliği
          </h2>

          <div
            v-if="loading"
            class="py-8"
          >
            <div class="spinner h-8 w-8 border-primary-600 border-t-transparent mx-auto" />
            <p class="mt-4 text-gray-500 font-medium">
              İşleminiz yapılıyor...
            </p>
          </div>

          <div
            v-else-if="success"
            class="space-y-4"
          >
            <CheckCircleIcon class="h-16 w-16 text-green-500 mx-auto" />
            <p class="text-gray-600 font-medium">
              {{ message }}
            </p>
            <NuxtLink
              to="/"
              class="inline-block mt-4 btn-primary px-8 py-3 rounded-xl font-bold"
            >
              Ana Sayfaya Dön
            </NuxtLink>
          </div>

          <div
            v-else
            class="space-y-6"
          >
            <p class="text-gray-500 text-sm">
              Bülten aboneliğinden çıkmak için e-posta adresinizi girin veya onaylayın.
            </p>

            <form
              class="space-y-4"
              @submit.prevent="handleUnsubscribe"
            >
              <div>
                <input
                  v-model="email"
                  type="email"
                  required
                  placeholder="E-posta adresiniz"
                  class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-red-500/20 transition-all"
                >
              </div>

              <div
                v-if="error"
                class="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold"
              >
                {{ error }}
              </div>

              <button
                type="submit"
                class="w-full bg-red-500 hover:bg-red-600 text-white h-14 rounded-2xl uppercase tracking-widest text-xs font-black shadow-lg shadow-red-500/30 transition-all"
              >
                Abonelikten Çık
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { EnvelopeOpenIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'

definePageMeta({
    layout: 'auth'
})

const route = useRoute()

const email = ref(route.query.email || '')
const loading = ref(false)
const success = ref(false)
const error = ref('')
const message = ref('')

// Eğer URL'de email varsa hemen deneme yapabiliriz veya kullanıcının butona basmasını bekleyebiliriz.
// Butona basmasını beklemek daha güvenli (yanlışlıkla tıklamalara karşı).

const handleUnsubscribe = async () => {
    if (!email.value) {
        error.value = 'Lütfen e-posta adresinizi girin.'
        return
    }

    loading.value = true
    error.value = ''

    try {
        const { $api } = useApi()
        const res = await $api(`/api/newsletter/unsubscribe?email=${encodeURIComponent(email.value)}`)

        success.value = true
        message.value = res.message || 'Başarıyla abonelikten ayrıldınız.'
    } catch (err) {
        error.value = err.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.'
    } finally {
        loading.value = false
    }
}
</script>
