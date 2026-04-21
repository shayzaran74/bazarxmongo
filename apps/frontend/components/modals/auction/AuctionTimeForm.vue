<template>
  <div class="space-y-6">
    <!-- Start Time -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Başlangıç Zamanı (Opsiyonel)
      </label>
      <input
        :value="startTime"
        type="datetime-local"
        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        @input="$emit('update:startTime', ($event.target as HTMLInputElement).value)"
      >
      <p class="text-xs text-gray-500 mt-1">
        Boş bırakırsanız hemen başlar.
      </p>
    </div>

    <!-- End Time -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Bitiş Zamanı *
      </label>
      <input
        :value="endTime"
        type="datetime-local"
        required
        :min="minDateTime || undefined"
        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        @input="$emit('update:endTime', ($event.target as HTMLInputElement).value)"
      >
    </div>

    <!-- Duration Presets -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Hızlı Süre Seçimi</label>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="preset in durationPresets"
          :key="preset.label"
          type="button"
          class="px-3 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
          @click="$emit('set-preset', preset.hours)"
        >
          {{ preset.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  startTime: string
  endTime: string
  minDateTime: string | undefined
}>()

defineEmits<{
  (e: 'update:startTime', value: string): void
  (e: 'update:endTime', value: string): void
  (e: 'set-preset', hours: number): void
}>()

const durationPresets = [
  { label: '1 Saat', hours: 1 },
  { label: '6 Saat', hours: 6 },
  { label: '12 Saat', hours: 12 },
  { label: '1 Gün', hours: 24 },
  { label: '3 Gün', hours: 72 },
  { label: '1 Hafta', hours: 168 }
]
</script>
