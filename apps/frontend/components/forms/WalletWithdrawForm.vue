<template>
  <div
    class="relative bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden group"
  >
    <!-- Decorative background element -->
    <div
      class="absolute -right-24 -bottom-24 w-64 h-64 bg-gradient-to-br from-emerald-400/20 to-teal-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-700"
    />

    <div class="relative z-10 flex items-center justify-between mb-8">
      <div>
        <h3 class="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 flex items-center justify-center border border-emerald-200/50 dark:border-emerald-700/50 shadow-sm text-emerald-500"
          >
            <ArrowDownCircleIcon class="h-6 w-6" />
          </div>
          Banka Hesabına Para Çek
        </h3>
        <p class="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-2 ml-1">
          Kazançlarınızı Banka Hesabınıza Aktarın
        </p>
      </div>
    </div>

    <!-- Success Message -->
    <Transition name="fade-slide">
      <div
        v-if="success"
        class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-4 mb-6 relative overflow-hidden"
      >
        <div class="absolute inset-0 bg-white/40 dark:bg-black/10 backdrop-blur-sm -z-10" />
        <div class="flex items-center gap-3">
          <div class="bg-emerald-100 dark:bg-emerald-800/50 p-2 rounded-xl text-emerald-600 dark:text-emerald-400">
            <CheckCircleIcon class="h-6 w-6" />
          </div>
          <p class="text-sm font-bold text-emerald-800 dark:text-emerald-300">
            {{ successMessage }}
          </p>
        </div>
      </div>
    </Transition>

    <!-- Error Message -->
    <Transition name="fade-slide">
      <div
        v-if="error"
        class="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-2xl p-4 mb-6 relative overflow-hidden"
      >
        <div class="absolute inset-0 bg-white/40 dark:bg-black/10 backdrop-blur-sm -z-10" />
        <div class="flex items-center gap-3">
          <div class="bg-rose-100 dark:bg-rose-800/50 p-2 rounded-xl text-rose-600 dark:text-rose-400">
            <ExclamationTriangleIcon class="h-6 w-6" />
          </div>
          <p class="text-sm font-bold text-rose-800 dark:text-rose-300">
            {{ error }}
          </p>
        </div>
      </div>
    </Transition>

    <form
      class="space-y-6 relative z-10"
      @submit.prevent="handleSubmit"
    >
      <!-- Amount Input -->
      <div class="bg-gray-50/50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50">
        <label class="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-3">
          Çekilecek Tutar (TL)
        </label>
        
        <div class="relative flex items-center">
          <div class="absolute left-4 z-10 text-xl font-black text-gray-400">
            ₺
          </div>
          <input
            v-model.number="form.amount"
            type="number"
            min="1"
            step="0.01"
            required
            class="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-10 py-4 text-2xl font-black text-gray-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-inner"
            placeholder="0.00"
          >
        </div>
        <p class="mt-2 text-[10px] font-bold text-gray-400">
          Kullanılabilir: {{ formatPrice(availableBalance) }}
        </p>
      </div>

      <!-- Bank Details -->
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">Banka Adı</label>
            <input
              v-model="form.bankName"
              type="text"
              required
              class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-inner"
              placeholder="Örn: Garanti BBVA"
            >
          </div>
          <div>
            <label class="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">Hesap Sahibi</label>
            <input
              v-model="form.accountHolder"
              type="text"
              required
              class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-inner"
              placeholder="Ad Soyad"
            >
          </div>
        </div>

        <div>
          <label class="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">IBAN</label>
          <input
            v-model="form.iban"
            type="text"
            required
            class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-mono shadow-inner"
            placeholder="TR00 0000 0000 0000 0000 0000 00"
          >
        </div>

        <!-- Transaction PIN (If required) -->
        <div v-if="requiresPin">
          <label class="text-[10px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-widest block mb-2">İşlem PIN (6 Haneli)</label>
          <input
            v-model="form.transactionPin"
            type="password"
            maxlength="6"
            required
            class="w-full bg-rose-50/30 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all text-center tracking-[1em]"
            placeholder="••••••"
          >
        </div>
      </div>

      <!-- Info Box -->
      <div class="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-4 border border-blue-100 dark:border-blue-800/30 flex gap-3">
        <InformationCircleIcon class="h-5 w-5 text-blue-500 flex-shrink-0" />
        <p class="text-[11px] font-medium text-blue-800 dark:text-blue-300 leading-relaxed">
          Para çekme talebiniz iletildikten sonra e-posta adresinize bir doğrulama bağlantısı gönderilecektir. Onayınızın ardından bakiyeniz incelenerek banka hesabınıza aktarılacaktır.
        </p>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="loading || form.amount <= 0 || form.amount > availableBalance"
        class="w-full relative overflow-hidden group py-4 px-6 rounded-2xl flex items-center justify-center font-bold text-white transition-all bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span
          v-if="loading"
          class="flex items-center gap-2"
        >
          <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          İşlem Yapılıyor...
        </span>
        <span
          v-else
          class="flex items-center gap-2"
        >
          <ArrowUpRightIcon class="h-5 w-5" />
          Para Çekme Talebi Oluştur
        </span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from '#imports'
import { useNuxtApp } from '#imports'
import { useWallet } from '~/composables/useWallet'
import ArrowDownCircleIcon from '@heroicons/vue/24/outline/ArrowDownCircleIcon'
import CheckCircleIcon from '@heroicons/vue/24/outline/CheckCircleIcon'
import ExclamationTriangleIcon from '@heroicons/vue/24/outline/ExclamationTriangleIcon'
import InformationCircleIcon from '@heroicons/vue/24/outline/InformationCircleIcon'
import ArrowUpRightIcon from '@heroicons/vue/24/outline/ArrowUpRightIcon'

const props = defineProps({
  availableBalance: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['success'])

const { withdrawWallet, formatPrice } = useWallet()
const toast = useNuxtApp().$toast

const loading = ref(false)
const success = ref(false)
const successMessage = ref('')
const error = ref(null)
const requiresPin = ref(true) // Backend usually requires it for security

const form = reactive({
  amount: 0,
  iban: '',
  accountHolder: '',
  bankName: '',
  transactionPin: ''
})

const handleSubmit = async () => {
  if (form.amount <= 0) {
    error.value = 'Geçerli bir tutar giriniz.'
    return
  }
  
  if (form.amount > props.availableBalance) {
    error.value = 'Yetersiz bakiye.'
    return
  }

  loading.value = true
  error.value = null

  try {
    const res = await withdrawWallet({
      amount: form.amount,
      iban: form.iban,
      accountHolder: form.accountHolder,
      bankName: form.bankName,
      transactionPin: form.transactionPin
    })

    if (res.success) {
      success.value = true
      successMessage.value = res.message
      toast.success(res.message)
      emit('success')
      
      // Reset form
      form.amount = 0
      form.iban = ''
      form.accountHolder = ''
      form.bankName = ''
      form.transactionPin = ''
      
      setTimeout(() => {
        success.value = false
      }, 5000)
    } else {
      error.value = res.error || 'İşlem başarısız.'
      
      // Check if it's a PIN error to highlight
      if (error.value.toLowerCase().includes('pin')) {
        requiresPin.value = true
      }
    }
  } catch (err) {
    error.value = err.message || 'Bir hata oluştu.'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
