<template>
  <div class="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-sm font-black text-gray-900 uppercase italic">Medya <span class="text-indigo-600">(3-5 GÖRSEL)</span></h3>
      <span class="text-[10px] font-black px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
        {{ images.length }} / 5
      </span>
    </div>

    <div class="space-y-6">
      <!-- Upload Box -->
      <div 
        class="border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group"
        @click="$refs.fileInput.click()"
      >
        <div class="space-y-3">
          <div class="flex justify-center">
            <div class="bg-indigo-100 p-4 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform">
              <PhotoIcon class="h-8 w-8" />
            </div>
          </div>
          <div class="text-xs font-black text-gray-400 uppercase tracking-widest">
            <span class="text-indigo-600">DOSYALARI SEÇ</span> VEYA SÜRÜKLE BIRAK
          </div>
          <p class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">WebP, JPG veya PNG • Maks 5MB</p>
        </div>
        <input ref="fileInput" type="file" class="hidden" accept="image/*" multiple @change="$emit('upload', $event)">
      </div>

      <!-- Preview Grid -->
      <div v-if="images.length > 0" class="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div v-for="(img, index) in images" :key="index" class="relative group aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm hover:border-indigo-500 transition-all">
          <img :src="img" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button class="bg-red-500 text-white p-2 rounded-xl hover:bg-gray-900 transition-colors" @click="$emit('remove', index)">
              <TrashIcon class="h-4 w-4" />
            </button>
            <button v-if="index !== 0" class="bg-indigo-600 text-white p-2 rounded-xl hover:bg-gray-900 transition-colors" @click="$emit('set-main', index)">
              <StarIcon class="h-4 w-4" />
            </button>
          </div>
          <div v-if="index === 0" class="absolute top-2 left-2 bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg">ANA GÖRSEL</div>
        </div>
      </div>

      <!-- Alert if insufficient -->
      <div v-if="images.length < 3" class="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3 text-amber-700 text-[10px] font-black uppercase tracking-widest">
        <ExclamationTriangleIcon class="h-5 w-5 shrink-0" />
        Lütfen en az 3 görsel yükleyin.
      </div>
    </div>
  </div>
</template>

<script setup>
import { PhotoIcon, TrashIcon, StarIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

defineProps({ images: Array })
defineEmits(['upload', 'remove', 'set-main'])
</script>
