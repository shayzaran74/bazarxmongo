<template>
  <div class="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm overflow-hidden mb-8 relative">
    <div class="flex items-center justify-between relative px-2">
      <!-- Connector Line -->
      <div class="absolute top-1/2 left-0 right-0 h-1.5 bg-gray-100 -translate-y-1/2 z-0 mx-8" />
      <div
        class="absolute top-1/2 left-0 h-1.5 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-1000 ease-out mx-8"
        :style="{ width: `calc(${progressPercent}% - 64px)` }"
      />

      <div
        v-for="(step, index) in steps"
        :key="index"
        class="relative z-10 flex flex-col items-center"
      >
        <div
          class="w-14 h-14 rounded-3xl flex items-center justify-center border-4 transition-all duration-500 shadow-md"
          :class="step.active ? 'bg-indigo-600 border-indigo-100 text-white scale-110' : 'bg-white border-gray-50 text-gray-300'"
        >
          <component :is="step.icon" class="h-6 w-6" />
        </div>
        <span
          class="absolute -bottom-10 whitespace-nowrap text-[9px] font-black uppercase tracking-[0.15em]"
          :class="step.active ? 'text-indigo-600' : 'text-gray-400'"
        >
          {{ step.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  steps: Array,
  progressPercent: Number
})
</script>
