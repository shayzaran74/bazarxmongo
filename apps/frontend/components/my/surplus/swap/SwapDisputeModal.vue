<template>
  <div v-if="show" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="$emit('close')" />
    <div class="relative bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl animate-in fade-in zoom-in slide-in-from-bottom-8 duration-500 overflow-hidden">
      <div class="absolute top-0 right-0 p-6">
        <ExclamationTriangleIcon class="w-20 h-20 text-red-50 opacity-50 absolute -top-4 -right-4" />
      </div>
      
      <h2 class="text-2xl font-black text-gray-900 uppercase italic mb-3 relative">SORUN BİLDİR</h2>
      <p class="text-[10px] text-gray-400 mb-8 font-black uppercase tracking-widest leading-relaxed relative">
        Takas dondurulacak ve admin kontrolüne geçecektir. Lütfen yaşadığınız sorunu detaylıca açıklayın.
      </p>

      <textarea
        :value="reason"
        rows="5"
        placeholder="Ürün eksik geldi, görselle uyuşmuyor vb..."
        class="w-full bg-gray-50 border-none rounded-[24px] p-5 text-sm font-bold focus:ring-2 focus:ring-red-500 mb-8 shadow-inner outline-none transition-shadow"
        @input="$emit('update:reason', $event.target.value)"
      />

      <div class="flex flex-col gap-3">
        <button
          :disabled="!reason"
          class="w-full py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-red-200 hover:bg-gray-900 transition-all disabled:opacity-30"
          @click="$emit('submit')"
        > İTİRAZI GÖNDER </button>
        <button class="w-full py-3 text-[10px] font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest transition-colors" @click="$emit('close')">vazgeç</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

defineProps({
  show: Boolean,
  reason: String
})
defineEmits(['close', 'submit', 'update:reason'])
</script>
