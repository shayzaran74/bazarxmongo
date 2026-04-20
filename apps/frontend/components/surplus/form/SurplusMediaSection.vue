<template>
  <div class="space-y-6">
    <h3 class="text-xs font-black text-primary-600 uppercase tracking-[0.2em] flex items-center">
      <span class="w-8 h-px bg-primary-600 mr-3" />
      Görseller ve Medya
    </h3>

    <div class="space-y-4">
      <!-- Drag & Drop Area -->
      <div
        class="border-2 border-dashed border-gray-200 rounded-[2.5rem] p-10 text-center hover:border-primary-400 hover:bg-primary-50/10 transition-all group cursor-pointer"
        @dragover.prevent
        @drop.prevent="onDrop"
        @click="$refs.fileInput.click()"
      >
        <input ref="fileInput" type="file" class="hidden" multiple accept="image/*" @change="onFileChange">
        <div class="bg-gray-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-sm">
          <ArrowUpTrayIcon class="h-8 w-8 text-gray-400 group-hover:text-primary-600" />
        </div>
        <p class="text-[11px] font-black text-gray-700 uppercase tracking-[0.2em]">RESİMLERİ SÜRÜKLE VEYA SEÇ</p>
        <p class="text-[10px] text-gray-400 font-bold mt-2">MAKSİMUM 5 GÖRSEL, HER BİRİ 5MB</p>
      </div>

      <!-- URL Input -->
      <div class="flex gap-3">
        <input
          v-model="urlModel"
          type="text"
          class="flex-1 bg-gray-50 border-gray-200 rounded-2xl px-5 py-4 text-xs font-bold shadow-sm"
          placeholder="Görsel URL'si ekleyin (Opsiyonel)"
          @keyup.enter="onAddUrl"
        >
        <button
          class="bg-gray-900 text-white px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all active:scale-95"
          @click="onAddUrl"
        >
          EKLE
        </button>
      </div>

      <!-- Preview Grid -->
      <div v-if="images?.length" class="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div
          v-for="(img, idx) in images"
          :key="idx"
          class="relative group aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:scale-105 transition-all"
        >
          <img :src="resolveImageUrl(img)" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
            <button class="p-2 bg-red-500 text-white rounded-xl" @click="$emit('remove', idx)">
              <TrashIcon class="h-4 w-4" />
            </button>
            <button v-if="idx !== 0" class="p-2 bg-primary-600 text-white rounded-xl" @click="$emit('set-main', idx)">
              <CheckCircleIcon class="h-4 w-4" />
            </button>
          </div>
          <div v-if="idx === 0" class="absolute top-2 left-2 bg-primary-600 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-lg">
            ANA GÖRSEL
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowUpTrayIcon, TrashIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  images: Array,
  urlModel: String,
  resolveImageUrl: Function
})

const emit = defineEmits(['add-files', 'add-url', 'remove', 'set-main', 'update:urlModel'])

const urlModel = computed({
  get: () => props.urlModel,
  set: (val) => emit('update:urlModel', val)
})

const onFileChange = (e) => emit('add-files', Array.from(e.target.files))
const onDrop = (e) => emit('add-files', Array.from(e.dataTransfer.files))
const onAddUrl = () => emit('add-url')
</script>
