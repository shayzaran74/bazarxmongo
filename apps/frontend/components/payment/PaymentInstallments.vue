<template>
  <div v-if="totalAmount >= 100" class="space-y-4">
    <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">TAKSİT SEÇENEKLERİ</label>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <button
        v-for="installment in options"
        :key="installment.count"
        type="button"
        class="p-4 border-2 rounded-2xl text-center transition-all active:scale-95"
        :class="{
          'border-primary-500 bg-primary-50 text-primary-900 shadow-lg shadow-primary-950/5': modelValue.count === installment.count,
          'border-gray-100 bg-white hover:border-gray-200': modelValue.count !== installment.count
        }"
        @click="$emit('update:modelValue', installment)"
      >
        <div class="text-sm font-black italic tracking-tighter">
          {{ installment.count }}x
        </div>
        <div class="text-[10px] font-bold opacity-60">
          {{ formatPrice(installment.amount) }}
        </div>
      </button>
    </div>
    <div v-if="modelValue.count > 1" class="text-center p-3 bg-gray-50 rounded-xl">
      <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        {{ modelValue.count }} taksit ile toplam ödeme: <span class="text-gray-900">{{ formatPrice(modelValue.total) }}</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  options: any[]
  modelValue: any
  totalAmount: number
  formatPrice: (p: number) => string
}>()

defineEmits(['update:modelValue'])
</script>
