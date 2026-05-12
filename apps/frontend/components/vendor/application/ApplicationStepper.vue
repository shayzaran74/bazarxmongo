<template>
  <div class="mb-12">
    <div class="flex items-center justify-between relative">
      <div class="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
      <div
        class="absolute top-1/2 left-0 h-0.5 bg-primary-600 -translate-y-1/2 z-0 transition-all duration-500"
        :style="{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }"
      />

      <div
        v-for="step in totalSteps"
        :key="step"
        data-testid="step-indicator"
        :data-step="step"
        :data-active="step <= currentStep"
        class="relative z-10 flex flex-col items-center"
      >
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500"
          :class="[step <= currentStep ? 'bg-primary-600 border-primary-50 text-white shadow-lg' : 'bg-white border-gray-50 text-gray-400']"
        >
          <span v-if="step < currentStep" class="font-black">✓</span>
          <span v-else class="text-xs font-black">{{ step }}</span>
        </div>
        <span class="absolute top-12 text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap">
          {{ totalSteps === 4 ? stepNames[step - 1] : stepNames[step - 2] }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  currentStep: number
  totalSteps: number
}>()

const stepNames = ['Mağaza Tipi', 'İşletme Profili', 'İletişim & Adres', 'Banka & Sektör']
</script>
