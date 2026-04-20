<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-bold text-gray-900">Politika ve Sözleşmeler</h2>
      <button class="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-sm transition-all" @click="openModal()">
        <PlusIcon class="w-5 h-5" /> Yeni Politika
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="policy in policies" :key="policy.id" class="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all group">
        <div class="flex items-start justify-between mb-5">
          <div class="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-600 transition-all">
            <DocumentTextIcon class="w-7 h-7 text-indigo-600 group-hover:text-white" />
          </div>
          <span :class="policy.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'" class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
            {{ policy.isActive ? 'Yayında' : 'Taslak' }}
          </span>
        </div>
        <h3 class="font-black text-gray-900 text-lg mb-2 truncate">{{ policy.title }}</h3>
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
          Tür: {{ getTypeName(policy.type) }} <span class="mx-1 text-gray-200">|</span> v{{ policy.version }}
        </p>
        <div class="flex gap-2 pt-4 border-t border-gray-50">
          <button class="flex-1 py-3 text-xs font-black text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest" @click="openModal(policy)">Düzenle</button>
          <button class="p-3 text-red-600 bg-red-50 rounded-xl hover:bg-red-600 hover:text-white transition-all" @click="$emit('delete', policy.id)">
            <TrashIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
          <div class="p-8 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-xl font-black text-gray-900 italic uppercase">
              {{ isEditing ? 'Politikayı Düzenle' : 'Yeni Politika Oluştur' }}
            </h3>
            <button class="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400" @click="$emit('update:showModal', false)">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <div class="p-8 space-y-6">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Başlık</label>
                <input v-model="form.title" type="text" class="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all text-sm font-bold">
              </div>
              <div>
                <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Slug (URL)</label>
                <input v-model="form.slug" type="text" class="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold" placeholder="gizlilik-politikasi">
              </div>
              <div>
                <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Tür</label>
                <select v-model="form.type" class="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold appearance-none">
                  <option value="privacy">Gizlilik Politikası</option>
                  <option value="terms">Kullanım Koşulları</option>
                  <option value="return">İade Politikası</option>
                  <option value="shipping">Kargo Politikası</option>
                  <option value="cookies">Çerez Politikası</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Versiyon</label>
                <input v-model="form.version" type="text" class="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold" placeholder="1.0">
              </div>
            </div>
            
            <div>
              <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Politika İçeriği (Markdown/HTML Destekli)</label>
              <textarea v-model="form.content" rows="15" class="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-3xl font-mono text-sm focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all"></textarea>
            </div>

            <div class="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
              <label class="flex items-center gap-3 cursor-pointer">
                <input v-model="form.isActive" type="checkbox" class="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500">
                <span class="text-xs font-black text-gray-900 uppercase tracking-widest">Hemen Yayına Al</span>
              </label>
            </div>
          </div>

          <div class="p-8 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
            <button class="px-6 py-3 text-sm font-black text-gray-500 hover:text-gray-700 transition-colors italic uppercase" @click="$emit('update:showModal', false)">Vazgeç</button>
            <button class="px-10 py-3 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-gray-900 transition-all shadow-lg" @click="$emit('save')">POLİTİKAYI KAYDET</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { DocumentTextIcon, PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  policies: Array,
  showModal: Boolean,
  form: Object,
  isEditing: Boolean
})

const emit = defineEmits(['update:showModal', 'save', 'delete', 'open-modal'])

const getTypeName = (t) => ({
  'privacy': 'Gizlilik', 'terms': 'Kullanım', 'return': 'İade', 'shipping': 'Kargo', 'cookies': 'Çerez'
})[t] || t

const openModal = (item = null) => emit('open-modal', item)
</script>
