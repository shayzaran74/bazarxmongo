<template>
  <div v-if="show" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
      <div class="p-8 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 class="text-xl font-black text-gray-900 italic uppercase">Satıcı Onayı</h3>
          <p class="text-xs font-bold text-indigo-600 mt-1 uppercase tracking-widest">{{ user?.email }}</p>
        </div>
        <button class="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400" @click="$emit('close')">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <div class="p-8 space-y-6">
        <div class="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6 space-y-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-indigo-100">
              <BuildingOfficeIcon class="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div class="text-[10px] font-black text-indigo-400 uppercase tracking-widest">İşletme Adı</div>
              <div class="text-sm font-black text-gray-900">{{ user?.vendor?.businessName }}</div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 pt-2">
            <div>
              <div class="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Telefon</div>
              <div class="text-xs font-bold text-gray-700">{{ user?.vendor?.phone }}</div>
            </div>
            <div>
              <div class="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Kategoriler</div>
              <div class="text-xs font-bold text-gray-700">{{ user?.vendor?.categories?.length || 0 }} Kategori</div>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Red Sebebi (Opsiyonel)</label>
          <textarea
            :value="reason"
            rows="3"
            placeholder="Red durumunda satıcıya gidecek notu yazın..."
            class="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner"
            @input="$emit('update:reason', $event.target.value)"
          />
        </div>
      </div>

      <div class="p-8 bg-gray-50 border-t border-gray-100 flex flex-col gap-3">
        <div class="flex gap-3">
          <button
            :disabled="loading"
            class="flex-1 bg-red-100 text-red-600 py-4 rounded-2xl hover:bg-red-600 hover:text-white disabled:opacity-50 font-black text-xs uppercase tracking-widest transition-all"
            @click="$emit('reject')"
          >Reddet</button>
          <button
            :disabled="loading"
            class="flex-[1.5] bg-green-600 text-white py-4 rounded-2xl hover:bg-gray-900 disabled:opacity-50 font-black text-xs uppercase tracking-widest shadow-lg shadow-green-100 transition-all"
            @click="$emit('approve')"
          >BAŞVURUYU ONAYLA</button>
        </div>
        <button class="w-full py-3 text-xs font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors" @click="$emit('close')">Vazgeç</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { XMarkIcon, BuildingOfficeIcon } from '@heroicons/vue/24/outline'

defineProps({
  show: Boolean,
  user: Object,
  reason: String,
  loading: Boolean
})

defineEmits(['close', 'approve', 'reject', 'update:reason'])
</script>
