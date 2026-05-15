<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform -translate-y-4 opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform -translate-y-4 opacity-0"
  >
    <div
      v-if="selectedCount > 0"
      class="bg-indigo-600 text-white p-4 rounded-xl shadow-lg mb-8 flex items-center justify-between"
    >
      <div class="flex items-center space-x-4">
        <span class="font-bold">{{ selectedCount }} sipariş seçildi</span>
        <div class="h-4 w-px bg-indigo-400" />
        <select
          :value="bulkStatus"
          class="bg-indigo-700 text-white text-sm rounded-lg border-indigo-500 px-3 py-1.5 outline-none focus:ring-2 focus:ring-white/20"
          @input="$emit('update:bulkStatus', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Durum Güncelle...</option>
          <option value="CONFIRMED">Onayla</option>
          <option value="PROCESSING">Hazırlanıyor</option>
          <option value="SHIPPED">Kargola</option>
          <option value="DELIVERED">Teslim Edildi</option>
          <option value="COMPLETED">Tamamlandı</option>
          <option value="CANCELLED">İptal Et</option>
        </select>
        <button
          :disabled="!bulkStatus || bulkProcessing"
          class="bg-white text-indigo-600 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors disabled:opacity-50"
          @click="$emit('apply')"
        >
          {{ bulkProcessing ? 'İşleniyor...' : 'Uygula' }}
        </button>
      </div>
      <button
        class="text-white/80 hover:text-white"
        @click="$emit('cancel')"
      >
        İptal
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  selectedCount: number
  bulkStatus: string
  bulkProcessing: boolean
}>()

defineEmits<{
  (e: 'update:bulkStatus', value: string): void
  (e: 'apply'): void
  (e: 'cancel'): void
}>()
</script>
