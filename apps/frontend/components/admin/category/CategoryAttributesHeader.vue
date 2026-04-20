<template>
  <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10 bg-slate-900/40 p-10 rounded-[3rem] border border-slate-800 backdrop-blur-xl shadow-2xl font-sans italic">
    <div class="space-y-4">
      <NuxtLink
        to="/admin/categories"
        class="group flex items-center gap-3 text-slate-500 hover:text-blue-400 transition-all text-xs font-black uppercase tracking-widest"
      >
        <span class="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all border border-slate-700 group-hover:border-blue-400">←</span>
        KATEGORİ LABORATUVARINA DÖN
      </NuxtLink>
      <div>
        <h1 class="text-3xl md:text-5xl font-black text-slate-100 uppercase tracking-tightest leading-none flex items-center gap-4">
          {{ categoryName || 'YÜKLENİYOR...' }}
          <span class="text-[9px] font-black bg-blue-600/10 text-blue-500 border border-blue-500/20 px-4 py-2 rounded-full tracking-[0.3em]">ÖZELLİK MATRİSİ</span>
        </h1>
        <p class="text-[10px] font-black text-slate-500 mt-2 uppercase tracking-[0.4em] ml-1">KATEGORİYE ÖZEL ÜRÜN PARAMETRELERİ VE VARYANT KURALLARI</p>
      </div>
    </div>

    <button
      class="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-blue-900/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 border border-blue-400/30"
      @click="$emit('add')"
    >
      <span class="text-xl">+</span> YENİ ÖZELLİK EKLE
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  categoryName?: string
}>()

defineEmits(['add'])
</script>

<style scoped>
.tracking-tightest { letter-spacing: -0.06em; }
</style>
