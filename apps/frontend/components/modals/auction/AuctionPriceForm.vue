<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Başlangıç Fiyatı (TL) *
        </label>
        <input
          :value="modelValue.startPrice"
          type="number"
          step="0.01"
          min="0.01"
          required
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          @input="$emit('update:modelValue', { ...modelValue, startPrice: ($event.target as HTMLInputElement).value })"
        >
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Min. Artış Miktarı (TL) *
        </label>
        <input
          :value="modelValue.minBidIncrement"
          type="number"
          step="0.01"
          min="0.01"
          required
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          @input="$emit('update:modelValue', { ...modelValue, minBidIncrement: ($event.target as HTMLInputElement).value })"
        >
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Katılım Depozitosu (TL)
      </label>
      <input
        :value="modelValue.participationDeposit"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        @input="$emit('update:modelValue', { ...modelValue, participationDeposit: ($event.target as HTMLInputElement).value })"
      >
      <p class="text-xs text-gray-500 mt-1">
        Sıfır bırakırsanız depozito istenmez.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: {
    startPrice: number | string
    minBidIncrement: number | string
    participationDeposit: number | string
  }
}>()

defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()
</script>
