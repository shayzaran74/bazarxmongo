<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="$emit('close')" />
    <div class="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
      <div class="p-8 border-b border-gray-50 flex items-center justify-between">
        <h2 class="text-2xl font-black text-gray-900 italic uppercase">
          {{ isEditing ? '🖼️ Banner Düzenle' : '➕ Yeni Banner Ekle' }}
        </h2>
        <button @click="$emit('close')" class="p-2 hover:bg-gray-50 rounded-xl transition-colors">
          <XMarkIcon class="h-6 w-6 text-gray-400" />
        </button>
      </div>

      <div class="p-8 space-y-6">
        <!-- Title & Description -->
        <div class="grid grid-cols-1 gap-4">
          <div class="space-y-2">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Başlık *</label>
            <input v-model="form.title" type="text" class="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-black focus:border-indigo-500 outline-none transition-all uppercase italic">
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Açıklama</label>
            <textarea v-model="form.description" rows="2" class="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-black focus:border-indigo-500 outline-none transition-all uppercase italic resize-none" />
          </div>
        </div>

        <!-- Image Upload Section -->
        <div class="space-y-4">
          <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Banner Görseli *</label>
          <div v-if="form.imageUrl || preview" class="relative h-40 rounded-3xl overflow-hidden border-4 border-gray-100 shadow-inner">
            <img :src="preview || resolveUrl(form.imageUrl)" class="w-full h-full object-cover">
            <button @click="$emit('remove-image')" class="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-700 transition-all">
              <TrashIcon class="h-4 w-4" />
            </button>
          </div>
          <div v-else class="border-4 border-dashed border-gray-100 rounded-[2.5rem] p-10 text-center hover:border-indigo-200 transition-colors cursor-pointer" @click="$refs.fileInput.click()">
            <PhotoIcon class="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Görsel Seçmek İçin Tıklayın</p>
          </div>
          <input ref="fileInput" type="file" class="hidden" accept="image/*" @change="e => $emit('upload', e.target.files[0])">
        </div>

        <!-- Targeting Grid -->
        <div class="grid grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pozisyon</label>
            <select v-model="form.position" class="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-black focus:border-indigo-500 outline-none appearance-none uppercase italic">
              <option value="home_top">ÜST SLIDER</option>
              <option value="home_middle">ORTA ALAN</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sıralama</label>
            <input v-model.number="form.order" type="number" class="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-black focus:border-indigo-500 outline-none uppercase italic">
          </div>
        </div>

        <!-- Location Targeting -->
        <div class="p-6 bg-indigo-50/50 rounded-[2rem] space-y-4">
          <div class="flex items-center gap-2 mb-2">
            <MapPinIcon class="h-4 w-4 text-indigo-600" />
            <span class="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Konum Hedefleme</span>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <select v-model="form.locationTags.city" class="w-full bg-white border-2 border-transparent rounded-xl px-4 py-3 text-xs font-black focus:border-indigo-500 outline-none uppercase italic">
              <option value="">TÜM İLLER</option>
              <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
            </select>
            <select :disabled="!form.locationTags.city" v-model="form.locationTags.district" class="w-full bg-white border-2 border-transparent rounded-xl px-4 py-3 text-xs font-black focus:border-indigo-500 outline-none uppercase italic disabled:opacity-30">
              <option value="">TÜM İLÇELER</option>
              <option v-for="dist in districts" :key="dist" :value="dist">{{ dist }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="p-8 bg-gray-50 flex items-center justify-end gap-4 rounded-b-[2.5rem]">
        <button @click="$emit('close')" class="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">İptal</button>
        <button 
          :disabled="loading || !form.title || !form.imageUrl"
          class="px-10 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl disabled:opacity-30 active:scale-95"
          @click="$emit('save')"
        >
          {{ loading ? 'KAYDEDİLİYOR...' : (isEditing ? 'GÜNCELLE' : 'EKLE') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { XMarkIcon, TrashIcon, PhotoIcon, MapPinIcon } from '@heroicons/vue/24/outline'
const config = useRuntimeConfig()

defineProps({
  isOpen: Boolean,
  isEditing: Boolean,
  form: Object,
  preview: String,
  loading: Boolean,
  cities: Array,
  districts: Array
})

defineEmits(['close', 'save', 'upload', 'remove-image'])

const resolveUrl = (url) => url?.startsWith('http') ? url : `${config.public.apiBase}${url}`
</script>
