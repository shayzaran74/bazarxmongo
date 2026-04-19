<template>
  <transition name="fade">
    <div 
      v-if="hasRisk" 
      class="relative flex items-center justify-between p-4 mb-6 border-l-4 rounded-r-lg shadow-sm"
      :class="urgencyClass"
    >
      <div class="flex items-start sm:items-center space-x-4">
        <div class="flex-shrink-0">
          <svg
            class="w-6 h-6"
            :class="iconColorClass"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <h3
            class="font-semibold"
            :class="titleColorClass"
          >
            Watchtower Uyarısı: XP Yanma Riski
          </h3>
          <p class="text-sm mt-1 text-gray-700">
            Cüzdanınızdaki <strong class="text-gray-900">{{ formattedTotalRiskXP }} XP</strong>'nin süresi 
            <strong class="text-red-600">{{ minDaysLeft }} gün</strong> içinde dolacaktır. 
            Bu puanlar nakde çevrilemez, süresi dolduğunda sistem tarafından silinir.
          </p>
        </div>
      </div>

      <div class="flex-shrink-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-0 ml-4">
        <button 
          class="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
          @click="routeToServices"
        >
          Hizmet Al (Lojistik/Matbaa)
        </button>
        <button 
          class="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-md hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
          @click="routeToAds"
        >
          Vitrin Reklamı Ver
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted, useRouter } from '#imports'
import { xpService } from '~/services/xpService'

const router = useRouter();
const riskBatches = ref([]);

// API'den veriyi çek
onMounted(async () => {
  const result = await xpService.getBurningRisk();
  // Handle Axios response format (the service returns response.data directly)
  riskBatches.value = result.success ? result.data : result;
});

// Risk var mı kontrolü
const hasRisk = computed(() => riskBatches.value && riskBatches.value.length > 0);

// Toplam risk altındaki XP'yi hesapla (Decimal formatından Number'a çevirerek)
const totalRiskXP = computed(() => {
  if (!riskBatches.value) return 0;
  return riskBatches.value.reduce((total, batch) => total + (parseFloat(batch.amount || batch.currentBalance) || 0), 0);
});

// Görüntüleme için binlik ayracı ile formatla (Örn: 14.500)
const formattedTotalRiskXP = computed(() => {
  return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(totalRiskXP.value);
});

// En yakın yanma tarihine kaç gün kaldığını hesapla
const minDaysLeft = computed(() => {
  if (!hasRisk.value) return 0;
  
  const now = new Date();
  let minDays = Infinity;

  riskBatches.value.forEach(batch => {
    if (!batch.expiresAt) return;
    const expiresAt = new Date(batch.expiresAt);
    const diffTime = Math.abs(expiresAt - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < minDays) {
      minDays = diffDays;
    }
  });

  return minDays === Infinity ? 0 : minDays;
});

// Kalan gün sayısına göre dinamik renk sınıfları (3 günden azsa Kırmızı, değilse Sarı)
const isCritical = computed(() => minDaysLeft.value <= 3);

const urgencyClass = computed(() => 
  isCritical.value ? 'bg-red-50 border-red-500' : 'bg-amber-50 border-amber-500'
);

const iconColorClass = computed(() => 
  isCritical.value ? 'text-red-500' : 'text-amber-500'
);

const titleColorClass = computed(() => 
  isCritical.value ? 'text-red-800' : 'text-amber-800'
);

// Yönlendirme Fonksiyonları
const routeToServices = () => {
  router.push('/vendor/services'); // BazarX Private içi hizmet tedarik sayfasına yönlendir
};

const routeToAds = () => {
  router.push('/vendor/advertising'); // Öne çıkan ürünler slotuna yönlendir
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
