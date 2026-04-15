<template>
  <div class="relative overflow-hidden group rounded-3xl border border-gray-100 bg-white p-6 shadow-xl transition-all duration-300 hover:shadow-2xl">
    <!-- Dekoratif Arka Plan -->
    <div class="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/5 blur-[80px] transition-colors duration-700 group-hover:bg-indigo-500/20" />

    <div class="relative z-10 mb-8 flex items-center justify-between">
      <div>
        <h3 class="flex items-center gap-2 text-xl font-black text-gray-900">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm">
            <PlusCircleIcon class="h-6 w-6" />
          </div>
          Bakiye Yükle
        </h3>
        <p class="mt-2 ml-1 text-[11px] font-bold uppercase tracking-widest text-gray-400">
          Hızlı ve Güvenli İşlem
        </p>
      </div>
    </div>

    <!-- Hata Mesajı -->
    <div v-if="error" class="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 transition-all">
      <div class="flex items-center gap-3">
        <ExclamationTriangleIcon class="h-5 w-5 text-red-500" />
        <p class="text-xs font-bold text-red-800">{{ error }}</p>
      </div>
    </div>

    <!-- Başarı Mesajı -->
    <div v-if="success" class="mb-6 rounded-2xl border border-green-100 bg-green-50 p-4 transition-all">
      <div class="flex items-center gap-3">
        <CheckCircleIcon class="h-5 w-5 text-green-600" />
        <p class="text-xs font-bold text-green-800">Talebiniz başarıyla alındı!</p>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="relative z-10 space-y-6">
      <!-- Miktar Girişi -->
      <div class="rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
        <label class="mb-3 block text-[10px] font-black uppercase tracking-widest text-gray-500">
          Yüklenecek Tutar (TRY)
        </label>
        <div class="relative mb-4 flex items-center">
          <div class="absolute left-4 z-10 text-xl font-black text-gray-400">₺</div>
          <input
            v-model.number="amount"
            type="number"
            min="10"
            required
            class="w-full rounded-xl border border-gray-200 bg-white px-10 py-4 text-2xl font-black text-gray-900 shadow-inner focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
            placeholder="0.00"
          >
        </div>

        <!-- Hızlı Miktar Seçenekleri -->
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="q in [100, 250, 500, 1000]"
            :key="q"
            type="button"
            @click="amount = q"
            class="rounded-xl border py-2 text-xs font-bold transition-all"
            :class="amount === q ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'"
          >
            +{{ q }}
          </button>
        </div>
      </div>

      <!-- Ödeme Yöntemi -->
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          v-for="method in paymentMethods"
          :key="method.id"
          type="button"
          @click="selectedMethod = method.id"
          class="relative flex flex-col items-center justify-center rounded-2xl border-2 p-4 transition-all"
          :class="selectedMethod === method.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 bg-white hover:border-indigo-200'"
        >
          <span class="text-2xl mb-1">{{ method.icon }}</span>
          <span class="text-xs font-black uppercase tracking-tight text-gray-900">{{ method.name }}</span>
        </button>
      </div>

      <!-- İşlem Butonu -->
      <button
        type="submit"
        :disabled="loading || amount < 10"
        class="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-4 font-black transition-all hover:scale-[1.01] hover:shadow-xl active:scale-95 disabled:opacity-50"
      >
        <div class="relative z-10 flex items-center justify-center gap-2 text-white">
          <template v-if="loading">
             <div class="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
             İŞLEM YAPILIYOR...
          </template>
          <template v-else>
            <BanknotesIcon class="h-5 w-5" />
            YÜKLEMEYİ TAMAMLA
          </template>
        </div>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { 
  PlusCircleIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  BanknotesIcon
} from '@heroicons/vue/24/outline'

const amount = ref(250)
const loading = ref(false)
const success = ref(false)
const error = ref<string | null>(null)
const selectedMethod = ref('BANK_TRANSFER')

const paymentMethods = [
  { id: 'BANK_TRANSFER', name: 'Havale / EFT', icon: '🏦' },
  { id: 'CREDIT_CARD', name: 'Kredi Kartı', icon: '💳' }
]

const { topUp } = useWallet()

/**
 * Form gönderim işlemi
 */
const handleSubmit = async () => {
  if (amount.value < 10) return

  loading.value = true
  error.value = null
  success.value = false

  try {
    const ok = await topUp({
      amount: amount.value,
      paymentMethod: selectedMethod.value
    })

    if (ok) {
      success.value = true
      amount.value = 250
      // 3 saniye sonra başarı mesajını temizle
      setTimeout(() => success.value = false, 3000)
    } else {
      error.value = 'İşlem sırasında bir hata oluştu.'
    }
  } catch (err: unknown) {
    error.value = 'Sistem hatası meydana geldi.'
  } finally {
    loading.value = false
  }
}
</script>
