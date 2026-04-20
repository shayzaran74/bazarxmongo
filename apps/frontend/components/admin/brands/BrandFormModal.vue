<template>
  <div v-if="show" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-[32px] w-full max-w-xl shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden">
      <div class="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-xl font-black text-gray-900 italic uppercase">
          {{ isEditing ? 'Markayı Düzenle' : 'Yeni Marka Ekle' }}
        </h3>
        <button class="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400" @click="$emit('close')">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <div class="p-8 space-y-5">
        <div>
          <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Marka Adı</label>
          <input v-model="form.name" type="text" class="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold outline-none">
        </div>
        <div>
          <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Slug (URL)</label>
          <div class="flex gap-2">
            <input v-model="form.slug" type="text" class="flex-1 px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold text-gray-500 outline-none">
            <button class="px-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors" @click="$emit('generate-slug')">ÜRET</button>
          </div>
        </div>
        <div>
          <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Logo URL</label>
          <input v-model="form.icon" type="text" class="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all" placeholder="https://...">
        </div>
        <div class="grid grid-cols-2 gap-4">
          <label class="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl cursor-pointer border border-indigo-100">
            <input v-model="form.isPopular" type="checkbox" class="w-5 h-5 rounded text-indigo-600">
            <span class="text-xs font-black text-gray-900 uppercase tracking-widest">POPÜLER</span>
          </label>
          <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
            <span class="text-xs font-black text-gray-400 uppercase tracking-widest">SIRA:</span>
            <input v-model.number="form.order" type="number" class="w-16 bg-transparent border-none outline-none text-sm font-black text-center">
          </div>
        </div>
      </div>

      <div class="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
        <button class="px-6 py-3 text-sm font-black text-gray-500 italic uppercase" @click="$emit('close')">VAZGEÇ</button>
        <button :disabled="saving" class="px-10 py-3 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-gray-900 transition-all shadow-lg disabled:opacity-50" @click="$emit('save')">
          {{ saving ? 'KAYDEDİLİYOR...' : 'KAYDET' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { XMarkIcon } from '@heroicons/vue/24/outline'
defineProps({ show: Boolean, isEditing: Boolean, form: Object, saving: Boolean })
defineEmits(['close', 'save', 'generate-slug'])
</script>
