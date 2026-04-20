<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-bold text-gray-900">Dinamik İçerikler</h2>
      <button class="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-sm transition-all" @click="openModal()">
        <PlusIcon class="w-5 h-5" /> Yeni İçerik
      </button>
    </div>

    <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50/50 border-b border-gray-100">
          <tr>
            <th class="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Anahtar (Key)</th>
            <th class="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Başlık</th>
            <th class="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Kategori</th>
            <th class="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">İçerik Türü</th>
            <th class="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Durum</th>
            <th class="text-right py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">İşlemler</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="item in contents" :key="item.id" class="hover:bg-indigo-50/30 transition-colors group">
            <td class="py-4 px-6">
              <code class="px-2 py-1 bg-gray-100 text-gray-700 text-[11px] font-bold rounded border border-gray-200">#{{ item.key }}</code>
            </td>
            <td class="py-4 px-6 font-black text-gray-900 text-sm">{{ item.title }}</td>
            <td class="py-4 px-6">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{{ item.category || '-' }}</span>
            </td>
            <td class="py-4 px-6 text-center">
              <span :class="getTypeClass(item.contentType)" class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                {{ item.contentType }}
              </span>
            </td>
            <td class="py-4 px-6 text-center">
              <span :class="item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'" class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                {{ item.isActive ? 'Aktif' : 'Pasif' }}
              </span>
            </td>
            <td class="py-4 px-6 text-right">
              <div class="flex items-center justify-end gap-2">
                <button class="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all shadow-sm" @click="openModal(item)">
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button class="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm" @click="$emit('delete', item.id)">
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-[32px] w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
          <div class="p-8 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-xl font-black text-gray-900 italic uppercase">
              {{ isEditing ? 'İçeriği Düzenle' : 'Yeni Dinamik İçerik' }}
            </h3>
            <button class="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400" @click="$emit('update:showModal', false)">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <div class="p-8 space-y-6">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Benzersiz Anahtar (Key)</label>
                <input v-model="form.key" type="text" class="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold" placeholder="örn: footer-about-text">
              </div>
              <div>
                <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Başlık</label>
                <input v-model="form.title" type="text" class="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold">
              </div>
              <div>
                <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Kategori</label>
                <select v-model="form.category" class="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold appearance-none">
                  <option value="">Seçiniz</option>
                  <option value="help">Yardım Merkezi</option>
                  <option value="faq">SSS (Sıkça Sorulan Sorular)</option>
                  <option value="about">Hakkımızda / Kurumsal</option>
                  <option value="contact">İletişim Bilgileri</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">İçerik Türü</label>
                <div class="flex bg-gray-100 p-1 rounded-xl">
                  <button v-for="t in ['text', 'html', 'markdown']" :key="t" class="flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all" :class="form.contentType === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'" @click="form.contentType = t">{{ t }}</button>
                </div>
              </div>
            </div>
            
            <div>
              <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">İçerik</label>
              <textarea v-model="form.content" rows="12" class="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-3xl font-mono text-sm focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all"></textarea>
            </div>

            <div class="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
              <label class="flex items-center gap-3 cursor-pointer">
                <input v-model="form.isActive" type="checkbox" class="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500">
                <span class="text-xs font-black text-gray-900 uppercase tracking-widest">Hemen Aktive Et</span>
              </label>
            </div>
          </div>

          <div class="p-8 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
            <button class="px-6 py-3 text-sm font-black text-gray-500 hover:text-gray-700 transition-colors italic uppercase" @click="$emit('update:showModal', false)">Vazgeç</button>
            <button class="px-10 py-3 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-gray-900 transition-all shadow-lg" @click="$emit('save')">İÇERİĞİ KAYDET</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  contents: Array,
  showModal: Boolean,
  form: Object,
  isEditing: Boolean
})

const emit = defineEmits(['update:showModal', 'save', 'delete', 'open-modal'])

const getTypeClass = (t) => ({
  'text': 'bg-gray-100 text-gray-700',
  'html': 'bg-orange-50 text-orange-700 border border-orange-100',
  'markdown': 'bg-blue-50 text-blue-700 border border-blue-100'
})[t] || 'bg-gray-100 text-gray-700'

const openModal = (item = null) => emit('open-modal', item)
</script>
