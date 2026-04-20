<template>
  <div class="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden mb-8">
    <div class="p-6 border-b border-gray-100 bg-indigo-50/30">
      <h2 class="text-lg font-black text-gray-900 flex items-center italic uppercase leading-none">
        <BuildingOfficeIcon class="h-5 w-5 mr-2 text-indigo-600" />
        Site <span class="text-indigo-600 ml-1">Kimliği</span>
      </h2>
    </div>

    <div class="p-8 space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Site Name -->
        <div class="space-y-2">
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Site Adı</label>
          <input
            :value="modelValue.siteName"
            type="text"
            placeholder="Örn: TicariTakas"
            class="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner"
            @input="$emit('update:modelValue', { ...modelValue, siteName: $event.target.value })"
          >
        </div>

        <!-- Logo Upload -->
        <div class="space-y-2">
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Site Logosu</label>
          <div class="flex items-center gap-4">
            <div 
              v-if="modelValue.siteLogo || logoPreview"
              class="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-indigo-600 relative group"
            >
              <img :src="logoPreview || getLogoUrl(modelValue.siteLogo)" class="w-full h-full object-cover">
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button class="text-white hover:text-red-400" @click="$emit('remove-logo')">
                  <TrashIcon class="w-5 h-5" />
                </button>
              </div>
            </div>
            <div v-else class="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center bg-gray-50 text-gray-300">
              <PhotoIcon class="w-6 h-6 mb-1" />
              <span class="text-[8px] font-black">LOGOLEV</span>
            </div>

            <div class="flex-1">
              <input ref="fileInput" type="file" class="hidden" @change="$emit('file-change', $event)">
              <button class="px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2" @click="$refs.fileInput.click()">
                <CloudArrowUpIcon class="w-4 h-4 text-indigo-600" /> LOGO SEÇ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BuildingOfficeIcon, PhotoIcon, TrashIcon, CloudArrowUpIcon } from '@heroicons/vue/24/outline'

defineProps({
  modelValue: Object,
  logoPreview: String,
  getLogoUrl: Function
})

defineEmits(['update:modelValue', 'remove-logo', 'file-change'])
</script>
