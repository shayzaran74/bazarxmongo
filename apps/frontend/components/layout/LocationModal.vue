<template>
  <Transition name="fade">
    <div v-show="isOpen" class="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="$emit('close')" />
      <div class="relative bg-white rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-slide-up">
        <div class="h-1.5 w-12 bg-gray-200 rounded-full mx-auto mt-4 sm:hidden" />
        <div class="p-8">
          <h3 class="text-2xl font-black text-gray-900 mb-6 flex items-center italic uppercase leading-none">
            <MapPinIcon class="h-7 w-7 mr-3 text-indigo-600" />
            Konumunuzu <span class="text-indigo-600 ml-2">BELİRLEYİN</span>
          </h3>

          <div class="space-y-4">
            <button
              :disabled="loading"
              class="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl px-5 py-4 font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
              @click="$emit('detect')"
            >
              <ArrowPathIcon v-if="loading" class="animate-spin h-5 w-5" />
              <MapPinIcon v-else class="h-5 w-5" />
              <span>{{ loading ? 'TESPİT EDİLİYOR...' : 'OTOMATİK TESPİT ET' }}</span>
            </button>

            <div v-if="error" class="bg-red-50 border border-red-100 rounded-2xl p-4 text-[10px] font-black text-red-600 flex items-center gap-2 uppercase">
              <ExclamationTriangleIcon class="h-5 w-5" /> {{ error }}
            </div>

            <div v-if="detected" class="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center space-x-3">
              <div class="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <CheckIcon class="h-5 w-5" />
              </div>
              <div>
                <p class="text-[9px] font-black text-emerald-600 uppercase tracking-widest">BU ŞEHRİ Mİ KASTETTİNİZ?</p>
                <p class="text-lg font-black text-emerald-800 italic">{{ detected }}</p>
              </div>
            </div>

            <div class="flex items-center space-x-4 my-4 opacity-30">
              <div class="flex-1 h-px bg-gray-300" />
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">VEYA MANUEL SEÇİN</span>
              <div class="flex-1 h-px bg-gray-300" />
            </div>

            <select 
              :value="selectedCity"
              class="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-black focus:border-indigo-500 outline-none transition-all shadow-inner uppercase italic"
              @change="$emit('update:selectedCity', $event.target.value)"
            >
              <option value="">Şehir Seçin</option>
              <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
            </select>

            <button
              :disabled="!selectedCity && !detected"
              class="w-full bg-gray-900 text-white rounded-2xl h-16 font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-30 mt-4"
              @click="$emit('save')"
            >
              KONUMU UYGULA
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { MapPinIcon, ArrowPathIcon, ExclamationTriangleIcon, CheckIcon } from '@heroicons/vue/24/outline'

defineProps({
  isOpen: Boolean,
  loading: Boolean,
  error: String,
  detected: String,
  selectedCity: String,
  cities: Array
})

defineEmits(['close', 'detect', 'save', 'update:selectedCity'])
</script>
