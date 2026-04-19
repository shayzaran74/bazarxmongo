<template>
  <div
    class="relative bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden group"
  >
    <!-- Decorative background element -->
    <div
      class="absolute -right-24 -bottom-24 w-64 h-64 bg-gradient-to-br from-primary-400/20 to-purple-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary-500/20 transition-colors duration-700"
    />

    <div class="relative z-10 flex items-center justify-between mb-8">
      <div>
        <h3 class="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 flex items-center justify-center border border-primary-200/50 dark:border-primary-700/50 shadow-sm text-primary-500"
          >
            <PlusCircleIcon class="h-6 w-6" />
          </div>
          Cüzdanıma Bakiye Ekle
        </h3>
        <p class="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-2 ml-1">
          Hızlı ve Güvenli Yükleme
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
            Talebiniz alındı! Admin onayından sonra bakiyenize yansıyacaktır.
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
      class="space-y-8 relative z-10"
      @submit.prevent="handleSubmit"
    >
      <!-- Amount Selection Section -->
      <div class="bg-gray-50/50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50">
        <div class="flex items-center justify-between mb-3">
          <label class="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest block">
            Yüklenecek Tutar (TL)
          </label>
          <div
            v-if="tierInfo"
            class="flex items-center gap-1.5 px-2 py-0.5 bg-primary-50 dark:bg-primary-900/40 rounded-lg border border-primary-100 dark:border-primary-800/50"
          >
            <span class="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase">
              {{ tierInfo?.currentTier?.id || 'CORE' }} TIER
            </span>
          </div>
        </div>

        <div class="relative flex items-center mb-5">
          <div class="absolute left-4 z-10 text-xl font-black text-gray-400">
            ₺
          </div>
          <input
            id="amount"
            v-model.number="amount"
            type="number"
            min="1"
            step="1"
            required
            class="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-10 py-4 text-2xl font-black text-gray-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-inner"
            :class="{ 'border-rose-500 ring-4 ring-rose-500/10': isOverLimit }"
            placeholder="0"
          >
        </div>

        <!-- Limit Warning -->
        <Transition name="fade-slide">
          <div
            v-if="isOverLimit && currentLimits" 
            class="mb-4 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/40 rounded-xl flex items-start gap-2.5"
          >
            <ExclamationTriangleIcon class="h-4 w-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <p class="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase leading-none mb-1">
                Tek İşlem Limitini Aştınız
              </p>
              <p class="text-[10px] font-medium text-rose-600 dark:text-rose-400">
                Seviyenize ({{ tierInfo?.currentTier?.id || 'CORE' }}) göre tek seferde en fazla {{ formatPrice(currentLimits?.singleTransaction) }} yükleme yapabilirsiniz.
              </p>
            </div>
          </div>
        </Transition>

        <!-- Quick Amount Badges -->
        <div class="grid grid-cols-4 gap-2 sm:gap-3">
          <button
            v-for="quickAmount in quickAmounts"
            :key="quickAmount"
            type="button"
            class="py-2.5 rounded-xl text-sm font-bold transition-all border border-transparent"
            :class="amount === quickAmount
              ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20 scale-105'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600 hover:scale-105 hover:shadow-sm'"
            @click="amount = quickAmount"
          >
            <!-- if selected make it pop -->
            +{{ quickAmount }}
          </button>
        </div>

        <!-- Tier Limits Info Grid -->
        <div
          v-if="currentLimits"
          class="mt-5 pt-5 border-t border-gray-200/50 dark:border-gray-700/50"
        >
          <div class="flex items-center gap-2 mb-3">
            <div class="w-1 h-3 bg-primary-500 rounded-full" />
            <p class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              Seviye Limitleriniz
            </p>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="space-y-1">
              <p class="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                Tek İşlem
              </p>
              <p class="text-xs font-black text-gray-700 dark:text-gray-300">
                {{ formatPrice(currentLimits?.singleTransaction) }}
              </p>
            </div>
            <div class="space-y-1">
              <p class="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                Günlük Çekim
              </p>
              <p class="text-xs font-black text-gray-700 dark:text-gray-300">
                {{ formatPrice(currentLimits?.dailyWithdrawal) }}
              </p>
            </div>
            <div class="space-y-1">
              <p class="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                Günlük Transfer
              </p>
              <p class="text-xs font-black text-gray-700 dark:text-gray-300">
                {{ formatPrice(currentLimits?.dailyTransfer) }}
              </p>
            </div>
            <div class="space-y-1">
              <p class="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                Aylık Toplam
              </p>
              <p class="text-xs font-black text-gray-700 dark:text-gray-300">
                {{ formatPrice(currentLimits?.monthlyTotal) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Method Selection -->
      <div>
        <label
          class="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 block"
        >Ödeme
          Yöntemi</label>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            v-for="method in paymentMethods"
            :key="method.id"
            class="group relative cursor-pointer rounded-2xl p-4 transition-all duration-300 overflow-hidden border-2"
            :class="selectedPaymentMethod === method.id
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
              : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-200 dark:hover:border-gray-600'"
            @click="selectedPaymentMethod = method.id"
          >
            <!-- selection indicator -->
            <div
              class="absolute top-3 right-3 w-4 h-4 rounded-full border-2 transition-colors flex items-center justify-center"
              :class="selectedPaymentMethod === method.id ? 'border-primary-500' : 'border-gray-300 dark:border-gray-600'"
            >
              <div
                v-if="selectedPaymentMethod === method.id"
                class="w-2 h-2 rounded-full bg-primary-500 scale-in"
              />
            </div>

            <div class="flex flex-col items-center justify-center mb-1 mt-1">
              <div
                class="w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 transition-transform group-hover:scale-110"
                :class="selectedPaymentMethod === method.id ? 'bg-primary-100 dark:bg-primary-800/50' : 'bg-gray-50 dark:bg-gray-900'"
              >
                {{ method.icon }}
              </div>
              <h3
                class="text-sm font-bold text-gray-900 dark:text-white"
                :class="selectedPaymentMethod === method.id ? 'text-primary-700 dark:text-primary-400' : ''"
              >
                {{ method.name }}
              </h3>
              <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1.5">
                {{ method.description }}
              </p>

              <div
                v-if="method.fee"
                class="mt-2 text-[9px] font-black px-2 py-0.5 rounded-md uppercase"
                :class="selectedPaymentMethod === method.id ? 'bg-primary-200/50 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'"
              >
                {{ method.fee }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Details Info Box -->
      <Transition name="fade-slide">
        <div
          v-if="selectedPaymentMethod"
          class="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-5 border border-blue-100 dark:border-blue-800/30"
        >
          <div class="flex gap-3 items-start">
            <InformationCircleIcon class="h-5 w-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />

            <div
              v-if="selectedPaymentMethod === 'BANK_TRANSFER'"
              class="flex-1"
            >
              <h4 class="text-xs font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest mb-2">
                Banka
                Havalesi Bilgileri
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-xs font-medium text-blue-800 dark:text-blue-200">
                <div><span class="opacity-70">Banka:</span> <span class="font-bold">Türkiye İş Bankası</span></div>
                <div>
                  <span class="opacity-70">Alıcı:</span> <span class="font-bold">E-Commerce Platform Ltd.</span>
                </div>
                <div class="sm:col-span-2">
                  <span class="opacity-70">IBAN:</span> <span
                    class="font-mono bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded ml-1 text-sm font-bold tracking-wider"
                  >TR98
                    0006 4000 0011 2345 6789 01</span>
                </div>
                <div class="sm:col-span-2 mt-1 p-2 bg-blue-100/50 dark:bg-blue-900/30 rounded-lg">
                  <span class="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 block mb-0.5">Açıklama
                    Kısmına Şunu Yazın:</span>
                  <span class="font-mono font-bold">{{ authStore.user?.email || 'Müşteri' }} - Bakiye Yükleme</span>
                </div>
              </div>
            </div>

            <div
              v-else-if="selectedPaymentMethod === 'EFT'"
              class="flex-1"
            >
              <h4 class="text-xs font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest mb-2">
                EFT
                Bilgileri
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-xs font-medium text-blue-800 dark:text-blue-200">
                <div>
                  <span class="opacity-70">Alıcı:</span> <span class="font-bold">E-Commerce Platform Ltd.</span>
                </div>
                <div><span class="opacity-70">Hesap No:</span> <span class="font-bold">1234567890</span></div>
                <div><span class="opacity-70">Şube Kodu:</span> <span class="font-bold">640</span></div>
                <div class="sm:col-span-2 mt-1 p-2 bg-blue-100/50 dark:bg-blue-900/30 rounded-lg">
                  <span
                    class="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 block mb-0.5"
                  >Açıklama:</span>
                  <span class="font-mono font-bold">{{ authStore.user?.email || 'Müşteri' }} - EFT Yükleme</span>
                </div>
              </div>
            </div>

            <div
              v-else-if="selectedPaymentMethod === 'CREDIT_CARD'"
              class="flex-1"
            >
              <h4 class="text-xs font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest mb-2">
                Güvenli
                Kredi Kartı Ödemesi
              </h4>
              <p class="text-xs text-blue-800 dark:text-blue-200 mb-2 leading-relaxed">
                Kart bilgileriniz 256-bit SSL sertifikası ile şifrelenerek, güvenli alt yapı kullanılarak tahsil edilir.
              </p>
              <div
                class="p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30 rounded-xl flex items-start gap-2"
              >
                <ShieldExclamationIcon class="w-4 h-4 text-amber-500 flex-shrink-0" />
                <p
                  class="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest leading-tight"
                >
                  Kredi kartı ve banka kartı ödemelerinde BDDK standartlarına göre <span
                    class="text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-1 rounded"
                  >%2.69</span>
                  işlem ücreti banka tarafından kesilmektedir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="loading || amount < 1 || !selectedPaymentMethod"
        class="w-full relative overflow-hidden group py-4 px-6 rounded-2xl flex items-center justify-center font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none hover:scale-[1.01] hover:shadow-xl active:scale-[0.98]"
        :class="selectedPaymentMethod === 'CREDIT_CARD' ? 'bg-gradient-to-r from-primary-600 to-indigo-600 shadow-primary-500/30' : 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/30'"
      >
        <!-- Shine effect -->
        <div
          class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:animate-[progressShimmer_1.5s_infinite]"
        />

        <span
          v-if="loading"
          class="flex items-center gap-2"
        >
          <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          İşlem Yapılıyor...
        </span>
        <span
          v-else
          class="flex items-center gap-2 text-sm tracking-wide relative z-10"
        >
          <ArrowRightEndOnRectangleIcon class="h-5 w-5" />
          {{ submitButtonText }}
        </span>
      </button>

      <!-- Security Trust Badges -->
      <div class="flex items-center justify-center gap-4 mt-6 opacity-60">
        <div class="flex items-center gap-1.5 grayscale">
          <LockClosedIcon class="w-4 h-4 text-gray-500" />
          <span class="text-[9px] font-black uppercase text-gray-500 tracking-widest">256-Bit SSL</span>
        </div>
        <div class="h-3 w-px bg-gray-300 dark:bg-gray-700" />
        <div class="flex items-center gap-1.5 grayscale">
          <ShieldCheckIcon class="w-4 h-4 text-gray-500" />
          <span class="text-[9px] font-black uppercase text-gray-500 tracking-widest">3D Secure</span>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed, useAuthStore, useNuxtApp, navigateTo, useApi } from '#imports'
import { useTierService } from '~/services/api/TierService'
import CheckCircleIcon from '@heroicons/vue/24/outline/CheckCircleIcon'
import ExclamationTriangleIcon from '@heroicons/vue/24/outline/ExclamationTriangleIcon'
import PlusCircleIcon from '@heroicons/vue/24/outline/PlusCircleIcon'
import InformationCircleIcon from '@heroicons/vue/24/outline/InformationCircleIcon'
import ShieldExclamationIcon from '@heroicons/vue/24/outline/ShieldExclamationIcon'
import LockClosedIcon from '@heroicons/vue/24/outline/LockClosedIcon'
import ShieldCheckIcon from '@heroicons/vue/24/outline/ShieldCheckIcon'
import ArrowRightEndOnRectangleIcon from '@heroicons/vue/24/outline/ArrowRightEndOnRectangleIcon'

// Props
const props = defineProps({
  userId: {
    type: String,
    default: null
  }
})

// Emits  
const emit = defineEmits(['success'])

// Composables
const authStore = useAuthStore()
const { $api } = useApi()
const toast = useNuxtApp().$toast

// State
const amount = ref(1000)
const loading = ref(false)
const success = ref(false)
const error = ref(null)
const selectedPaymentMethod = ref('BANK_TRANSFER')
const tierInfo = ref(null)

const { getUserTier } = useTierService()

// Payment methods
const paymentMethods = ref([
  {
    id: 'BANK_TRANSFER',
    name: 'Banka Havalesi',
    description: 'Güvenli Transfer',
    icon: '🏦',
    fee: 'Komisyonsuz'
  },
  {
    id: 'EFT',
    name: 'EFT',
    description: 'Hızlı İşlem',
    icon: '🏢',
    fee: 'Komisyonsuz'
  },
  {
    id: 'CREDIT_CARD',
    name: 'Kredi / Banka Kartı',
    description: 'Anlık Onay',
    icon: '💳',
    fee: '%2.69 İşlem Ücreti'
  }
])

// Quick amount options
const quickAmounts = [250, 500, 1000, 2500]

// Computed limits
const currentLimits = computed(() => {
  return tierInfo.value?.currentTier?.walletLimits || null
})

const isOverLimit = computed(() => {
  if (!currentLimits.value || !amount.value) return false
  return amount.value > currentLimits.value.singleTransaction
})

// Methods
const fetchTierInfo = async () => {
  try {
    const res = await getUserTier()
    if (res.success) {
      tierInfo.value = res.data
    }
  } catch (err) {
    console.error('Failed to fetch tier info:', err)
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(Number(price || 0))
}

onMounted(() => {
  fetchTierInfo()
})
const submitButtonText = computed(() => {
  const method = paymentMethods.value.find(m => m.id === selectedPaymentMethod.value)
  if (!method) return 'İşleme Devam Et'

  switch (selectedPaymentMethod.value) {
    case 'BANK_TRANSFER':
      return 'Havale Talebini Tamamla'
    case 'EFT':
      return 'EFT Talebini Tamamla'
    case 'CREDIT_CARD':
      return `Ödeme Ekranına Git`
    default:
      return 'İşleme Devam Et'
  }
})

// Auto-clear messages after some time
const clearMessages = () => {
  setTimeout(() => {
    success.value = false
    error.value = null
  }, 5000)
}

// Submit form
const handleSubmit = async () => {
  if (amount.value < 1) {
    error.value = 'Geçerli bir tutar giriniz.'
    return
  }

  if (isOverLimit.value) {
    error.value = `Tek işlem limitinizi (${formatPrice(currentLimits.value.singleTransaction)}) aştınız.`
    return
  }

  loading.value = true
  error.value = null
  success.value = false

  try {
    const userId = props.userId || authStore.user?.id

    if (!userId) {
      throw new Error('Kullanıcı oturumu bulunamadı')
    }

    // Generate reference for the payment
    const reference = `WLTRX-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    if (selectedPaymentMethod.value === 'CREDIT_CARD') {
      // Redirect to credit card payment page
      const redirectUrl = `/payment/credit-card?amount=${amount.value}&reference=${reference}`
      navigateTo(redirectUrl).catch(() => {
        toast.success('Kart entegrasyonuna yönlendiriliyorsunuz (Demo)')
      })
      loading.value = false
      return
    }

    // For bank_transfer and eft: call the backend API to create the top-up request
    const response = await $api('/api/wallet/topup', {
      method: 'POST',
      body: {
        amount: amount.value,
        paymentMethod: selectedPaymentMethod.value === 'EFT' ? 'BANK_TRANSFER' : selectedPaymentMethod.value
      }
    })

    if (response.success) {
      success.value = true
      toast.success('Talebiniz alınmıştır. Admin onayından sonra bakiyenize yansıyacaktır.')
      emit('success')
      clearMessages()
    } else {
      throw new Error(response.error || 'Talep oluşturulamadı')
    }

  } catch (err) {
    error.value = err.message || 'Sistem hatası. Lütfen daha sonra deneyin.'
    toast.error(error.value)
    clearMessages()
  } finally {
    loading.value = false
  }
}

// Watch for amount changes to clear errors
watch(amount, () => {
  if (error.value && amount.value >= 1) {
    error.value = null
  }
})
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

.scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes progressShimmer {
  0% {
    transform: translateX(-150%) skewX(-20deg);
  }

  100% {
    transform: translateX(200%) skewX(-20deg);
  }
}
</style>