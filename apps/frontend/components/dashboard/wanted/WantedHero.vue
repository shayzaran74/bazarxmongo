<template>
  <div class="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 rounded-[4rem] p-12 mb-16 shadow-[0_40px_100px_rgba(79,70,229,0.2)] group italic">
    <!-- Decorative Elements -->
    <div class="absolute inset-0 bg-black/10 transition-opacity group-hover:opacity-0" />
    <div class="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-[100px] animate-pulse" />
    <div class="absolute -bottom-32 -left-32 w-80 h-80 bg-pink-400/20 rounded-full blur-[80px]" />

    <div class="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
      <div class="space-y-6 text-center lg:text-left">
        <div class="flex items-center justify-center lg:justify-start gap-4">
          <div class="p-4 bg-white/10 backdrop-blur-3xl rounded-[1.5rem] border border-white/20 shadow-2xl">
            <MagnifyingGlassIcon class="h-8 w-8 text-white" />
          </div>
          <h1 class="text-5xl lg:text-7xl font-black text-white tracking-tightest uppercase italic leading-none drop-shadow-2xl">NE <span class="text-pink-300">ARIYORSUN?</span></h1>
        </div>
        <p class="text-white/80 text-xl font-black max-w-2xl leading-tight uppercase tracking-tight opacity-90">
          İHTİYACIN OLAN MAKİNE, HAMMADDE VEYA PARÇALARI SİSTEME EKLE. 
          AKILLI TAKAS ALGORİTMASI SENİ OTOMATİK OLARAK SATICILARLA EŞLEŞTİRSİN.
        </p>
      </div>

      <div class="flex flex-col sm:flex-row gap-5 w-full lg:w-auto">
        <NuxtLink to="/dashboard/wanted-items/manage" class="flex-1 flex items-center justify-center gap-4 bg-white/10 backdrop-blur-3xl text-white px-10 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-white/20 transition-all border border-white/20 shadow-2xl active:scale-95 group/btn">
          <ClipboardDocumentListIcon class="h-6 w-6 group-hover:scale-110 transition-transform" />
          <span>LİSTEMİ YÖNET</span>
        </NuxtLink>
        <button class="flex-1 flex items-center justify-center gap-4 bg-white text-indigo-700 px-12 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-indigo-50 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 group/btn" @click="$emit('add')">
          <PlusCircleIcon class="h-6 w-6 group-hover:rotate-90 transition-transform duration-500" />
          <span>YENİ İSTEK</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { MagnifyingGlassIcon, ClipboardDocumentListIcon, PlusCircleIcon } from '@heroicons/vue/24/outline'
defineEmits(['add'])
</script>
