<template>
  <div v-if="show" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden">
      <div class="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 class="text-xl font-black text-gray-900 italic uppercase">Marka Başvurusu İnceleme</h3>
          <p class="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{{ brand?.name }}</p>
        </div>
        <button class="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400" @click="$emit('close')">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <div class="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
        <!-- Documents -->
        <div class="space-y-3" v-if="Object.keys(documents).length">
          <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest">Yüklenen Belgeler</h4>
          <div v-for="(url, label) in documents" :key="label" class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div class="flex items-center gap-3">
              <DocumentIcon class="w-5 h-5 text-indigo-600" />
              <span class="text-xs font-black text-gray-700 uppercase tracking-widest">{{ label }}</span>
            </div>
            <a :href="url" target="_blank" class="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest">GÖRÜNTÜLE</a>
          </div>
        </div>

        <!-- Review Options -->
        <div class="space-y-4 pt-4 border-t border-gray-100">
          <label class="flex items-center gap-3 cursor-pointer p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <input
              :checked="isPopular"
              type="checkbox"
              class="w-5 h-5 rounded text-indigo-600"
              @change="$emit('update:isPopular', $event.target.checked)"
            >
            <span class="text-xs font-black text-gray-900 uppercase tracking-widest">Popüler Marka Olarak İşaretle</span>
          </label>
          <div>
            <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Admin Notu / Ret Gerekçesi</label>
            <textarea
              v-model="localReason"
              rows="3"
              class="w-full px-5 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
              placeholder="İsteğe bağlı not ekleyin..."
            ></textarea>
          </div>
        </div>
      </div>

      <div class="p-8 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-3">
        <button class="flex-1 min-w-[140px] px-4 py-3 bg-amber-100 text-amber-700 text-xs font-black rounded-2xl hover:bg-amber-600 hover:text-white transition-all uppercase" @click="$emit('request-docs')">EK BELGE İSTE</button>
        <button class="flex-1 min-w-[140px] px-4 py-3 bg-red-100 text-red-700 text-xs font-black rounded-2xl hover:bg-red-600 hover:text-white transition-all uppercase" @click="handleReject">REDDET</button>
        <button class="flex-[1.5] min-w-[140px] px-4 py-3 bg-indigo-600 text-white text-xs font-black rounded-2xl hover:bg-gray-900 transition-all shadow-lg uppercase" @click="$emit('approve')">ONAYLA</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { XMarkIcon, DocumentIcon } from '@heroicons/vue/24/outline'

const props = defineProps({ show: Boolean, brand: Object, isPopular: Boolean, resolveImageUrl: Function })
const emit = defineEmits(['close', 'approve', 'reject', 'request-docs', 'update:isPopular'])

const localReason = ref('')

const documents = computed(() => {
  const docs = {}
  if (props.brand?.documentUrl) docs['Marka Tescil'] = props.brand.documentUrl
  if (props.brand?.invoiceChainUrl) docs['Fatura Silsilesi'] = props.brand.invoiceChainUrl
  if (props.brand?.authorizationUrl) docs['Yetki Belgesi'] = props.brand.authorizationUrl
  return docs
})

const handleReject = () => emit('reject', localReason.value)
</script>
