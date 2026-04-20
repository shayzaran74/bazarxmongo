<template>
  <div class="animate-in italic">
    <form @submit.prevent="$emit('update')">
      <div class="space-y-8">
        <div class="space-y-4">
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest italic ml-1">TERCİH EDİLEN DİL</label>
          <div class="relative group">
            <select class="w-full bg-neutral-50 px-6 py-5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none appearance-none font-black text-xs uppercase italic shadow-inner">
              <option>TÜRKÇE (TR)</option>
              <option>ENGLISH (EN)</option>
            </select>
            <div class="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
          </div>
        </div>
        
        <div class="space-y-4">
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest italic ml-1">ZAMAN DİLİMİ</label>
          <div class="relative group">
            <select class="w-full bg-neutral-50 px-6 py-5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none appearance-none font-black text-xs uppercase italic shadow-inner">
              <option>GMT+3 (İSTANBUL)</option>
              <option>GMT+0 (UTC)</option>
            </select>
            <div class="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
          </div>
        </div>
        
        <div class="space-y-4 pt-4">
          <label class="flex items-center gap-4 cursor-pointer group p-2">
            <input type="checkbox" class="w-7 h-7 rounded-lg bg-neutral-50 border-2 border-transparent checked:bg-indigo-600 transition-all appearance-none cursor-pointer shadow-inner">
            <span class="text-[10px] font-black text-gray-600 uppercase tracking-widest italic leading-none">E-POSTA BÜLTENİNE ABONE OL</span>
          </label>
          
          <label class="flex items-center gap-4 cursor-pointer group p-2">
            <input type="checkbox" class="w-7 h-7 rounded-lg bg-neutral-50 border-2 border-transparent checked:bg-indigo-600 transition-all appearance-none cursor-pointer shadow-inner">
            <span class="text-[10px] font-black text-gray-600 uppercase tracking-widest italic leading-none">KİŞİSELLEŞTİRİLMİŞ ÖNERİLER</span>
          </label>
        </div>
      </div>
      
      <div class="mt-12">
        <button type="submit" class="w-full md:w-auto px-14 h-16 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-gray-200 italic">
          AYARLARI KAYDET
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
defineEmits(['update'])
</script>
