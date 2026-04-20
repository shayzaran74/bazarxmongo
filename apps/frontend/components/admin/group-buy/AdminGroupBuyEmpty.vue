<template>
  <div class="bg-white/50 rounded-[4rem] border-2 border-dashed border-neutral-100 py-40 text-center space-y-10 font-sans italic">
    <div class="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto ring-8 ring-neutral-50 shadow-2xl relative overflow-hidden group">
      <div class="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors" />
      <span class="text-6xl group-hover:scale-110 transition-transform duration-500">👥</span>
    </div>
    <div class="max-w-md mx-auto space-y-4 px-10">
      <h3 class="text-3xl font-black text-gray-900 uppercase tracking-tightest">KAMPANYA BULUNAMADI</h3>
      <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] leading-relaxed">SİSTEMDE HENÜZ AKTİF BİR "BİRLİKTE AL" PROTOKOLÜ BAŞLATILMADI. İLK OTURUMUNUZU ŞİMDİ KONFİGÜRE EDİN.</p>
    </div>
    <button
      class="bg-gray-900 text-white rounded-[1.5rem] px-12 py-5 text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-gray-200 active:scale-95 transition-all outline-none"
      @click="$emit('create')"
    >
      + YENİ PROTOKOL BAŞLAT
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits(['create'])
</script>

<style scoped>
.tracking-tightest { letter-spacing: -0.06em; }
</style>
