<template>
  <div class="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 mt-8">
    <div class="text-6xl mb-6">🎯</div>
    <h3 class="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">
      Açık Artırma Bulunamadı
    </h3>
    <p class="text-gray-500 mb-8 max-w-sm mx-auto font-medium">
      Aradığınız kriterlere uygun aktif bir protokol bulunamadı. Lütfen filtrelerinizi güncelleyin.
    </p>
    <div class="flex items-center justify-center gap-4">
      <button
        class="px-6 py-3 bg-gray-100 text-gray-700 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all active:scale-95"
        @click="$emit('clear-filters')"
      >
        PARAMETRELERİ SIFIRLA
      </button>
      <button
        v-if="isAdmin"
        class="px-6 py-3 bg-primary-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary-700 shadow-xl shadow-primary-900/20 transition-all active:scale-95"
        @click="$emit('create')"
      >
        + YENİ PROTOKOL BAŞLAT
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ isAdmin: boolean }>()
defineEmits(['clear-filters', 'create'])
</script>
