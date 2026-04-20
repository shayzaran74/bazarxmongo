<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        <div class="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 class="text-xl font-black text-gray-900 tracking-tight">
            İhlal Bildirimi Detayı
          </h2>
          <button
            class="p-2 bg-white rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 transition-all shadow-sm"
            @click="$emit('close')"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <div class="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
          <div class="flex items-center gap-5">
            <div class="p-5 bg-red-50 text-red-600 rounded-3xl shadow-sm border border-red-100/50">
              <ShieldExclamationIcon class="h-12 w-12" />
            </div>
            <div>
              <h3 class="font-black text-2xl text-gray-900 leading-tight">
                {{ violation?.Brand?.name }}
              </h3>
              <p class="text-sm font-bold text-gray-400 uppercase tracking-widest">
                {{ violation?.violationType }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="p-6 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm">
              <p class="text-[10px] text-gray-400 uppercase font-black mb-3 ml-1 tracking-widest">
                Şiddet Seviyesi
              </p>
              <select
                :value="severity"
                class="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 font-bold text-gray-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer"
                @change="$emit('update:severity', $event.target.value)"
              >
                <option value="LOW">Düşük</option>
                <option value="MEDIUM">Orta</option>
                <option value="HIGH">Yüksek</option>
                <option value="CRITICAL">Kritik</option>
              </select>
            </div>
            <div class="p-6 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm">
              <p class="text-[10px] text-gray-400 uppercase font-black mb-3 ml-1 tracking-widest">
                İşlem Durumu
              </p>
              <select
                :value="status"
                class="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 font-bold text-gray-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer"
                @change="$emit('update:status', $event.target.value)"
              >
                <option value="PENDING">Beklemede</option>
                <option value="RESOLVED">Çözüldü</option>
                <option value="REJECTED">Reddedildi</option>
              </select>
            </div>
          </div>

          <div v-if="violation?.description">
            <p class="text-sm font-black text-gray-900 mb-3 uppercase tracking-tighter">Bildirim Açıklaması</p>
            <div class="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-sm text-gray-700 leading-relaxed italic">
              "{{ violation.description }}"
            </div>
          </div>

          <div>
            <p class="text-sm font-black text-gray-900 mb-3 uppercase tracking-tighter">Yönetici Notları</p>
            <textarea
              :value="notes"
              rows="4"
              class="w-full px-6 py-4 border border-gray-200 rounded-[2rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none text-sm leading-relaxed"
              placeholder="Bu ihlal hakkında yapılan işlemler veya takip notları..."
              @input="$emit('update:notes', $event.target.value)"
            />
          </div>
        </div>

        <div class="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex gap-4">
          <button
            class="flex-1 px-8 py-4 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-white transition-all shadow-sm"
            @click="$emit('close')"
          >
            Kapat
          </button>
          <button
            :disabled="submitting"
            class="flex-[2] px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-200"
            @click="$emit('update')"
          >
            {{ submitting ? 'Güncelleniyor...' : 'Güncelle / Çözüldü Olarak İşaretle' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { XMarkIcon, ShieldExclamationIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  show: Boolean,
  violation: Object,
  severity: String,
  status: String,
  notes: String,
  submitting: Boolean
})

defineEmits(['close', 'update', 'update:severity', 'update:status', 'update:notes'])
</script>
