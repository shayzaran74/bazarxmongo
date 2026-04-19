<template>
  <div class="relative w-full py-12 px-2 overflow-x-auto no-scrollbar">
    <div class="flex items-start justify-between min-w-[800px] relative">
      <!-- Background Line -->
      <div class="absolute top-[26px] left-[5%] right-[5%] h-[2px] bg-gray-100 z-0">
        <div
          class="h-full bg-gradient-to-r from-primary-600 to-indigo-600 transition-all duration-1000 ease-out"
          :style="{ width: progressWidth + '%' }"
        />
      </div>

      <!-- Timeline Steps -->
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="relative z-10 flex flex-col items-center group"
        :style="{ width: (100 / steps.length) + '%' }"
      >
        <!-- Step Bubble -->
        <div
          class="w-14 h-14 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 border-4 shadow-xl"
          :class="[
            isStepActive(index)
              ? 'bg-white border-primary-600 shadow-primary-600/20 scale-110'
              : isStepCompleted(index)
                ? 'bg-primary-600 border-primary-600 shadow-primary-600/10'
                : 'bg-white border-gray-100'
          ]"
        >
          <component
            :is="step.icon"
            class="h-6 w-6 transition-all duration-500"
            :class="[
              isStepActive(index) ? 'text-primary-600' : isStepCompleted(index) ? 'text-white' : 'text-gray-200'
            ]"
          />

          <!-- Ping animation for active step -->
          <span
            v-if="isStepActive(index)"
            class="absolute inset-0 rounded-[1.25rem] border-4 border-primary-600 animate-ping opacity-20"
          />
        </div>

        <!-- Step Label -->
        <div class="mt-6 text-center space-y-1">
          <p
            class="text-[10px] font-black uppercase tracking-tightest mt-1 italic transition-all duration-500"
            :class="[isStepActive(index) || isStepCompleted(index) ? 'text-gray-900' : 'text-gray-300']"
          >
            {{ step.label }}
          </p>
          <p
            v-if="isStepActive(index)"
            class="text-[8px] font-black text-primary-600 uppercase tracking-widest animate-pulse"
          >
            İşlem Bekliyor
          </p>
          <p
            v-else-if="isStepCompleted(index)"
            class="text-[8px] font-black text-emerald-500 uppercase tracking-widest"
          >
            Tamamlandı
          </p>
        </div>

        <!-- Tooltip on Hover -->
        <div
          class="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gray-900 text-white text-[9px] px-3 py-1.5 rounded-lg whitespace-nowrap font-black uppercase tracking-widest"
        >
          {{ step.description }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
    ArrowsRightLeftIcon,
    LockClosedIcon,
    TruckIcon,
    InboxArrowDownIcon,
    CheckBadgeIcon,
    StarIcon
} from '@heroicons/vue/24/solid'

const props = defineProps({
    currentStatus: {
        type: String,
        required: true,
        // Expected: OFFERED, ACCEPTED, COLLATERAL_HOLD, SHIPPING, DELIVERED, FINALIZED, REVIEWED
    }
})

const steps = [
    { id: 'OFFERED', label: 'TEKLİF', icon: ArrowsRightLeftIcon, description: 'Teklif Gönderildi' },
    { id: 'ACCEPTED', label: 'ONAY', icon: CheckBadgeIcon, description: 'Teklif Kabul Edildi' },
    { id: 'COLLATERAL_HOLD', label: 'TEMİNAT', icon: LockClosedIcon, description: 'Güvenli Havuz Aktif' },
    { id: 'SHIPPING', label: 'SEVKİYAT', icon: TruckIcon, description: 'Ürün Kargo Aşamasında' },
    { id: 'DELIVERED', label: 'TESLİMAT', icon: InboxArrowDownIcon, description: 'Ürün Teslim Alındı' },
    { id: 'FINALIZED', label: 'TAMAM', icon: CheckBadgeIcon, description: 'İşlem Sonuçlandırıldı' },
    { id: 'REVIEWED', label: 'YORUM', icon: StarIcon, description: 'Karşılıklı Değerlendirme' }
]

const statusOrder = steps.map(s => s.id)

const currentStepIndex = computed(() => {
    return statusOrder.indexOf(props.currentStatus)
})

const progressWidth = computed(() => {
    if (currentStepIndex.value < 0) return 0
    return (currentStepIndex.value / (steps.length - 1)) * 90
})

const isStepActive = (index) => {
    return index === currentStepIndex.value
}

const isStepCompleted = (index) => {
    return index < currentStepIndex.value
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}

.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.tracking-tightest {
    letter-spacing: -0.05em;
}
</style>
