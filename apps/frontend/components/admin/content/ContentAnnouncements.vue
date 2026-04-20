<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-bold text-gray-900">Kampanya Duyuruları</h2>
      <button class="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-sm transition-all" @click="openModal()">
        <PlusIcon class="w-5 h-5" /> Yeni Duyuru
      </button>
    </div>

    <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50/50 border-b border-gray-100">
          <tr>
            <th class="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Başlık</th>
            <th class="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Tür</th>
            <th class="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Hedef Sayfa</th>
            <th class="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tarih Aralığı</th>
            <th class="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Durum</th>
            <th class="text-right py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">İşlemler</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="item in announcements" :key="item.id" class="hover:bg-indigo-50/30 transition-colors group">
            <td class="py-4 px-6">
              <span class="font-black text-gray-900 text-sm">{{ item.title }}</span>
            </td>
            <td class="py-4 px-6 text-center">
              <span :class="getTypeClass(item.type)" class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                {{ getTypeName(item.type) }}
              </span>
            </td>
            <td class="py-4 px-6 text-gray-600 text-sm font-bold uppercase tracking-wider italic opacity-70">
              {{ item.targetPage || 'Tümü' }}
            </td>
            <td class="py-4 px-6 text-gray-500 text-xs font-bold italic">
              {{ formatDate(item.startDate) }}
              <span v-if="item.endDate" class="text-gray-300"> → </span>
              {{ formatDate(item.endDate) }}
            </td>
            <td class="py-4 px-6">
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
          <tr v-if="!announcements.length">
            <td colspan="6" class="py-20 text-center italic text-gray-400 font-bold">Henüz duyuru eklenmemiş.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
          <div class="p-8 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-xl font-black text-gray-900 italic uppercase">
              {{ isEditing ? 'Duyuruyu Düzenle' : 'Yeni Duyuru Ekle' }}
            </h3>
            <button class="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400" @click="$emit('update:showModal', false)">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <div class="p-8 space-y-6">
            <div class="grid grid-cols-2 gap-6">
              <div class="col-span-2">
                <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Duyuru Başlığı</label>
                <input v-model="form.title" type="text" class="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all text-sm font-bold">
              </div>
              <div class="col-span-2">
                <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">İçerik Metni</label>
                <textarea v-model="form.content" rows="4" class="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all text-sm font-bold"></textarea>
              </div>
              <div>
                <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Tür</label>
                <select v-model="form.type" class="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all text-sm font-bold appearance-none">
                  <option value="info">Bilgilendirme</option>
                  <option value="warning">Uyarı / Kritik</option>
                  <option value="success">Başarı / Onay</option>
                  <option value="promo">Promosyon / Kampanya</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Hedef Sayfa</label>
                <select v-model="form.targetPage" class="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all text-sm font-bold appearance-none">
                  <option value="all">Tüm Sayfalar</option>
                  <option value="homepage">Ana Sayfa</option>
                  <option value="checkout">Ödeme Sayfası</option>
                  <option value="cart">Sepet Sayfası</option>
                  <option value="help">Yardım Merkezi</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Başlangıç Tarihi</label>
                <input v-model="form.startDate" type="datetime-local" class="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold">
              </div>
              <div>
                <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Bitiş Tarihi</label>
                <input v-model="form.endDate" type="datetime-local" class="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold">
              </div>
              <div class="col-span-2">
                <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Dosya Eki (Opsiyonel)</label>
                <div class="flex gap-4">
                  <div class="flex-1 px-5 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-2xl flex items-center justify-center gap-3 cursor-pointer hover:border-indigo-500 hover:bg-white transition-all group" @click="$refs.fileInput.click()">
                    <CloudArrowUpIcon class="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                    <span class="text-sm font-bold text-gray-500 group-hover:text-indigo-600">{{ uploading ? 'Yükleniyor...' : (form.linkText || 'Dosya seçin veya sürükleyin') }}</span>
                    <input ref="fileInput" type="file" class="hidden" accept=".pdf,image/*" @change="$emit('file-upload', $event)">
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
              <label class="flex items-center gap-3 cursor-pointer">
                <input v-model="form.isActive" type="checkbox" class="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500">
                <span class="text-xs font-black text-gray-900 uppercase tracking-widest">Duyuruyu Yayınla</span>
              </label>
              <div class="flex-1 flex items-center justify-end gap-3">
                <span class="text-[10px] font-black text-gray-400 uppercase">Öncelik:</span>
                <input v-model.number="form.priority" type="number" class="w-16 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-black text-center outline-none">
              </div>
            </div>
          </div>

          <div class="p-8 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
            <button class="px-6 py-3 text-sm font-black text-gray-500 hover:text-gray-700 transition-colors italic uppercase" @click="$emit('update:showModal', false)">Vazgeç</button>
            <button class="px-10 py-3 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-gray-900 transition-all shadow-lg shadow-indigo-200" @click="$emit('save')">DEĞİŞİKLİKLERİ KAYDET</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, CloudArrowUpIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  announcements: Array,
  showModal: Boolean,
  form: Object,
  isEditing: Boolean,
  uploading: Boolean
})

const emit = defineEmits(['update:showModal', 'save', 'delete', 'file-upload', 'open-modal'])

const formatDate = (date) => !date ? '-' : new Date(date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const getTypeName = (t) => ({ 'info': 'Bilgi', 'warning': 'Kritik', 'success': 'Onay', 'promo': 'Kampanya' })[t] || t
const getTypeClass = (t) => ({
  'info': 'bg-blue-50 text-blue-700 border border-blue-100',
  'warning': 'bg-red-50 text-red-700 border border-red-100',
  'success': 'bg-green-50 text-green-700 border border-green-100',
  'promo': 'bg-purple-50 text-purple-700 border border-purple-100'
})[t] || 'bg-gray-100 text-gray-700'

const openModal = (item = null) => emit('open-modal', item)
</script>
