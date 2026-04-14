<template>
  <transition name="modal-fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-60 backdrop-blur-sm"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 class="text-xl font-bold text-gray-800">
            Güvenli Ödeme Noktası
          </h2>
          <button
            class="text-gray-400 hover:text-gray-600 transition"
            @click="closeModal"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="p-6 space-y-6">
          <div class="flex justify-between items-end">
            <div>
              <p class="text-sm text-gray-500 font-medium uppercase tracking-wide">
                İşlem Tutarı
              </p>
              <p class="text-3xl font-extrabold text-gray-900 mt-1">
                {{ formatCurrency(transactionAmount) }} TL
              </p>
            </div>
            <div class="text-right">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Takas Komisyonu
              </span>
            </div>
          </div>

          <div class="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-2">
                <svg
                  class="w-5 h-5 text-indigo-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
                <h3 class="text-sm font-bold text-indigo-900">
                  Karma Ödeme (XP + Nakit)
                </h3>
              </div>
              <span class="text-xs font-semibold text-indigo-700 bg-indigo-200 px-2 py-1 rounded">
                Kullanılabilir: {{ formatCurrency(availableXpBalance) }} XP
              </span>
            </div>

            <div class="space-y-4">
              <input 
                v-model.number="xpToUse" 
                type="range" 
                :max="absoluteMaxXpAllowed" 
                min="0" 
                step="10"
                class="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                :disabled="absoluteMaxXpAllowed === 0"
              >
              
              <div class="flex justify-between text-sm">
                <div class="text-indigo-800 font-medium">
                  Kullanılacak XP: <br>
                  <span class="text-lg font-bold">{{ formatCurrency(xpToUse) }} XP</span>
                </div>
                <div class="text-right text-gray-700 font-medium">
                  Ödenecek Nakit: <br>
                  <span class="text-lg font-bold">{{ formatCurrency(cashToPay) }} TL</span>
                </div>
              </div>
            </div>

            <div class="mt-4 pt-4 border-t border-indigo-200/50 flex items-start space-x-2 text-xs text-indigo-600">
              <svg
                class="w-4 h-4 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>
                Yönetici kuralları gereği bu işlemin en fazla <strong>%{{ adminMaxXpPct }}'sini</strong> XP ile ödeyebilirsiniz. 
                Günlük harcama limitinizden kalan: <strong>{{ formatCurrency(dailyWatchtowerLimitLeft) }} XP</strong>.
              </p>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
          <button
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            @click="closeModal"
          >
            İptal
          </button>
          <button 
            :disabled="isProcessing" 
            class="inline-flex items-center px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            @click="submitTransaction"
          >
            <svg
              v-if="isProcessing"
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {{ isProcessing ? 'İşleniyor...' : 'Güvenli Ödeme Yap' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch } from '#imports'
import { v4 as uuidv4 } from 'uuid' // Idempotency Key üretmek için

// Component Props
const props = defineProps({
  isOpen: Boolean,
  transactionAmount: { type: Number, required: true },
  tradeId: { type: String, required: true },
  
  // API'den gelen Admin Kontrollü Dinamik Limitler (/api/vendor/xp/summary'den beslenir)
  availableXpBalance: { type: Number, required: true }, 
  adminMaxXpPct: { type: Number, required: true }, // Örn: 50 (Admin tablosundan gelen kural)
  dailyWatchtowerLimitLeft: { type: Number, required: true } // Örn: 45000 (Günlük kota)
});

const emit = defineEmits(['close', 'confirm']);

// State
const xpToUse = ref(0);
const isProcessing = ref(false);

// Akıllı Limit Hesaplama Algoritması (Bizi koruyan ana mantık)
const absoluteMaxXpAllowed = computed(() => {
  // 1. Admin Kuralı: İşlemin yüzdesel limiti (Örn: 10.000 TL'nin %50'si = 5.000 XP)
  const ruleBasedLimit = props.transactionAmount * (props.adminMaxXpPct / 100);
  
  // 2. Sistem, bu 3 limitin EN KÜÇÜK olanını (Darboğazı) referans alır
  return Math.floor(Math.min(
    ruleBasedLimit, 
    props.availableXpBalance, 
    props.dailyWatchtowerLimitLeft
  ));
});

// Kalan Nakit Ödeme (Sıfırın altına düşmesini engeller)
const cashToPay = computed(() => {
  return Math.max(0, props.transactionAmount - xpToUse.value);
});

// Limitler değiştiğinde (Örn: Modal ilk açıldığında) slider'ı sıfırla
watch(() => props.isOpen, (newVal) => {
  if (newVal) xpToUse.value = 0;
});

// Format Yardımcısı
const formatCurrency = (val) => {
  return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(val);
};

// Aksiyonlar
const closeModal = () => {
  if (!isProcessing.value) {
    emit('close');
  }
};

const submitTransaction = async () => {
  isProcessing.value = true;
  
  // Mükerrer çekimi önlemek için Pre-flight Idempotency Key (Benzersiz İşlem İmzası)
  const idempotencyKey = uuidv4();

  const payload = {
    tradeId: props.tradeId,
    totalAmount: props.transactionAmount,
    xpAmountUsed: xpToUse.value,
    cashAmountUsed: cashToPay.value,
    idempotencyKey: idempotencyKey
  };

  try {
    // Burada backend API endpoint'ine post atılır (Örn: await axios.post('/api/vendor/payment', payload))
    // Simüle edilmiş bekleme:
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    emit('confirm', payload);
  } catch (error) {
    console.error("Ödeme sırasında hata oluştu", error);
    // Hata mesajı UX'i eklenebilir
  } finally {
    isProcessing.value = false;
  }
};
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
