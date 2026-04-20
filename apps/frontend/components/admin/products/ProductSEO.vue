<template>
  <div class="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
    <h3 class="text-sm font-black text-gray-900 uppercase italic mb-6">Arama Motoru <span class="text-indigo-600">Görünümü</span></h3>
    
    <div class="space-y-6">
      <div class="space-y-1">
        <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Sayfa Başlığı (SEO Title)</label>
        <input v-model="modelValue.metaTitle" type="text" class="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none shadow-inner">
      </div>

      <div class="space-y-1">
        <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Meta Açıklama</label>
        <textarea v-model="modelValue.metaDescription" rows="3" class="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-500 outline-none shadow-inner"></textarea>
      </div>

      <div class="space-y-1">
        <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">URL Slug</label>
        <div class="relative">
          <span class="absolute left-4 top-3 text-gray-400 text-[10px] font-bold">/products/</span>
          <input v-model="modelValue.slug" type="text" class="w-full pl-22 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold text-indigo-600 focus:bg-white focus:border-indigo-500 outline-none">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ modelValue: Object })
</script>
