<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="$emit('close')" />
    <div class="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
      <div class="p-8 border-b border-gray-50 flex items-center justify-between">
        <h2 class="text-2xl font-black text-gray-900 italic uppercase">
          {{ isEditing ? '📂 Kategori Düzenle' : '➕ Yeni Kategori' }}
        </h2>
        <button @click="$emit('close')" class="p-2 hover:bg-gray-50 rounded-xl transition-colors">
          <XMarkIcon class="h-6 w-6 text-gray-400" />
        </button>
      </div>

      <div class="p-8 space-y-8">
        <div class="grid grid-cols-2 gap-6">
          <div class="col-span-2 space-y-2">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kategori Adı *</label>
            <input v-model="form.name" type="text" class="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-black focus:border-indigo-500 outline-none transition-all uppercase italic">
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Üst Kategori</label>
            <div class="space-y-2">
              <input v-model="searchQuery" type="text" placeholder="ARA..." class="w-full bg-indigo-50/50 border-none rounded-xl px-4 py-2 text-[10px] font-black outline-none italic">
              <select v-model="form.parentId" class="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-black outline-none italic uppercase">
                <option :value="null">ANA KATEGORİ (ROOT)</option>
                <template v-for="cat in filteredList" :key="cat.id">
                  <option :value="cat.id" class="font-black">{{ cat.name }}</option>
                  <option v-for="sub in cat.children" :key="sub.id" :value="sub.id" class="text-[10px] italic">
                    &nbsp;&nbsp;↳ {{ sub.name }}
                  </option>
                </template>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">İkon (HeroIcon)</label>
              <input v-model="form.icon" type="text" class="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-black outline-none italic">
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sıralama</label>
              <input v-model.number="form.order" type="number" class="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-black outline-none italic">
            </div>
          </div>
        </div>

        <!-- Media Section -->
        <div class="space-y-4">
          <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kategori Görseli (Banner)</label>
          <div v-if="form.image || preview" class="relative h-40 rounded-3xl overflow-hidden border-4 border-gray-50 shadow-inner">
            <img :src="preview || resolveUrl(form.image)" class="w-full h-full object-cover">
            <button @click="$emit('remove-image')" class="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-700 transition-all">
              <TrashIcon class="h-4 w-4" />
            </button>
          </div>
          <div v-else class="border-4 border-dashed border-gray-50 rounded-[2rem] p-10 text-center cursor-pointer" @click="$refs.fileInput.click()">
            <PhotoIcon class="h-12 w-12 text-gray-100 mx-auto mb-2" />
            <p class="text-[10px] font-black text-gray-300 uppercase tracking-widest">DOSYA YÜKLE</p>
          </div>
          <input ref="fileInput" type="file" class="hidden" accept="image/*" @change="e => $emit('upload', e.target.files[0])">
        </div>

        <!-- Premium Design Settings -->
        <div class="p-8 bg-indigo-50/30 rounded-[2.5rem] space-y-6">
          <div class="flex items-center gap-2 mb-2">
            <SparklesIcon class="h-4 w-4 text-indigo-600" />
            <span class="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Premium Görünüm Ayarları</span>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rozet Metni (NEW, %50 vb.)</label>
              <input v-model="form.badgeText" type="text" class="w-full bg-white border-none rounded-xl px-4 py-3 text-xs font-black outline-none italic uppercase">
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rozet Rengi</label>
              <div class="flex items-center gap-3">
                <input v-model="form.badgeColor" type="color" class="h-10 w-12 border-none rounded-lg bg-white p-1">
                <input v-model="form.badgeColor" type="text" class="flex-1 bg-white border-none rounded-xl px-4 py-2 text-xs font-black outline-none italic">
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6 pt-4 border-t border-indigo-100/50">
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gradient Start (Tailwind)</label>
              <input v-model="form.colorFrom" type="text" class="w-full bg-white border-none rounded-xl px-4 py-3 text-xs font-black outline-none italic">
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gradient End (Tailwind)</label>
              <input v-model="form.colorTo" type="text" class="w-full bg-white border-none rounded-xl px-4 py-3 text-xs font-black outline-none italic">
            </div>
          </div>
        </div>
      </div>

      <div class="p-8 bg-gray-50 flex items-center justify-end gap-4 rounded-b-[2.5rem]">
        <button @click="$emit('close')" class="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">İptal</button>
        <button 
          :disabled="loading || !form.name"
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
import { XMarkIcon, TrashIcon, PhotoIcon, SparklesIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  isOpen: Boolean,
  isEditing: Boolean,
  form: Object,
  preview: String,
  loading: Boolean,
  categories: Array
})

const config = useRuntimeConfig()
const searchQuery = ref('')

const filteredList = computed(() => {
  const rootOnly = props.categories.filter(c => !c.parentId)
  if (!searchQuery.value) return rootOnly
  const q = searchQuery.value.toLowerCase()
  return rootOnly.filter(c => 
    c.name.toLowerCase().includes(q) || 
    c.children?.some(sc => sc.name.toLowerCase().includes(q))
  )
})

const resolveUrl = (url) => url?.startsWith('http') ? url : `${config.public.apiBase}${url}`

defineEmits(['close', 'save', 'upload', 'remove-image'])
</script>
