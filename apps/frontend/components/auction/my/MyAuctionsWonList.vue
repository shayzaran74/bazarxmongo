<template>
  <div class="space-y-8 font-sans italic">
    <div class="space-y-2 mb-4">
      <h2 class="text-3xl font-black text-gray-900 uppercase tracking-tightest">KAZANDIĞIM İHALELER</h2>
      <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-1">BAŞARIYLA SONUÇLANAN TİCARİ OTURUMLARIM</p>
    </div>

    <!-- Empty State -->
    <div class="bg-indigo-50/30 rounded-[4rem] border-2 border-dashed border-indigo-100 py-32 text-center space-y-8">
      <div class="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto ring-8 ring-indigo-50 shadow-xl">
        <span class="text-5xl">🏆</span>
      </div>
      <div class="max-w-md mx-auto space-y-4">
        <h3 class="text-2xl font-black text-indigo-900 uppercase tracking-tightest">HENÜZ BİR ZAFER KAZANILMADI</h3>
        <p class="text-xs font-black text-indigo-900/40 uppercase tracking-widest leading-relaxed px-10">REKABETİN PARÇASI OLUN VE ÜRÜNLERİ KAZANMAK İÇİN TEKLİF VERMEYE DEVAM EDİN.</p>
        <NuxtLink
          to="/auctions"
          class="inline-block bg-indigo-600 text-white rounded-[1.2rem] px-10 py-5 text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-200 active:scale-95 transition-all"
        >
          AÇIK ARTIRMALARI KEŞFET
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Won auctions list will be populated here when backend support is available
</script>
