<template>
  <div class="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4">
    <Motion
      :initial="{ opacity: 0, filter: 'blur(12px)', y: 28 }"
      :animate="{ opacity: 1, filter: 'blur(0px)', y: 0 }"
      :transition="{ duration: 0.7 }"
      class="w-full max-w-md"
    >
      <h1 class="text-2xl font-black text-white text-center mb-2">QR Tarama</h1>
      <p class="text-slate-400 text-sm text-center mb-8">Müşterinin QR kodunu girin</p>

      <!-- Sonuç -->
      <Transition name="fade">
        <div
          v-if="result"
          class="mb-6 rounded-2xl p-5 text-center"
          :class="result.success ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'"
        >
          <p class="text-4xl mb-2">{{ result.success ? '✅' : '❌' }}</p>
          <h3
            class="font-bold text-lg"
            :class="result.success ? 'text-emerald-400' : 'text-red-400'"
          >
            {{ result.success ? (result.data?.isOneFree ? '1+1 Bedava Menü Onaylandı' : 'Menü Onaylandı') : result.error }}
          </h3>
          <template v-if="result.success && result.data">
            <p class="text-white font-bold mt-2">{{ result.data.menuTitle }}</p>
            <p class="text-slate-400 text-sm">{{ result.data.restaurant }}</p>
          </template>
        </div>
      </Transition>

      <!-- QR Giriş -->
      <div class="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <input
          v-model="qrCode"
          type="text"
          placeholder="MENU-ABC12345 veya FREE-ABC12345"
          class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 font-mono text-lg text-center focus:outline-none focus:border-purple-500"
          @keyup.enter="redeem"
          autofocus
        />
        <Motion :while-hover="{ scale: 1.05 }" :while-tap="{ scale: 0.95 }">
          <button
            class="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-xl text-lg transition-colors disabled:opacity-50"
            :disabled="loading || !qrCode.trim()"
            @click="redeem"
          >
            {{ loading ? 'Kontrol ediliyor...' : 'QR Onayla' }}
          </button>
        </Motion>
      </div>

      <button
        class="mt-6 text-slate-500 hover:text-slate-300 text-sm w-full text-center transition-colors"
        @click="reset"
      >
        Temizle
      </button>
    </Motion>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'vendor'] })

import { ref } from 'vue'
const { $api } = useApi()

const qrCode  = ref('')
const loading = ref(false)
const result  = ref<{ success: boolean; data?: { menuTitle: string; restaurant: string; isOneFree: boolean }; error?: string } | null>(null)

async function redeem() {
  if (!qrCode.value.trim() || loading.value) return
  loading.value = true
  result.value  = null
  try {
    const res = await $api('/api/menu/redeem', {
      method: 'POST',
      body:   { qrCode: qrCode.value.trim().toUpperCase() },
    })
    result.value = { success: true, data: (res as Record<string, typeof result.value.data>).data }
    qrCode.value = ''
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    result.value = { success: false, error: err.data?.message ?? 'Geçersiz QR kodu' }
  } finally {
    loading.value = false
  }
}

function reset() {
  qrCode.value = ''
  result.value = null
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
