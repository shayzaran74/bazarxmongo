<template>
  <div class="space-y-6">
    <h3 class="text-xs font-black text-primary-600 uppercase tracking-[0.2em] flex items-center">
      <span class="w-8 h-px bg-primary-600 mr-3" />
      Teknik Özellikler
    </h3>

    <div class="space-y-6">
      <!-- Dynamic Category Attributes -->
      <div v-if="attributes.length" class="p-6 bg-primary-50/30 rounded-[2rem] border border-primary-100">
        <h4 class="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-6 flex items-center">
          <span class="w-4 h-px bg-primary-600 mr-2" />
          Kategoriye Özel Alanlar
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="attr in attributes" :key="attr.id" class="space-y-1.5">
            <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
              {{ attr.label }}
              <span v-if="attr.isRequired" class="text-red-500">*</span>
              <span v-if="attr.unit" class="text-[9px] lowercase font-bold text-gray-400">({{ attr.unit }})</span>
            </label>

            <!-- Dynamic Input Types -->
            <template v-if="attr.type === 'select'">
              <select v-model="specs[attr.name]" class="w-full bg-white border-gray-100 rounded-xl px-4 py-3 text-xs font-bold shadow-sm">
                <option value="">Seçin</option>
                <option v-for="opt in attr.options" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </template>

            <template v-else-if="attr.type === 'multiselect'">
              <div class="flex flex-wrap gap-1.5 p-3 bg-white border border-gray-100 rounded-xl min-h-[42px] shadow-sm">
                <label v-for="opt in attr.options" :key="opt" class="flex items-center space-x-2 bg-gray-50 px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer hover:bg-gray-100">
                  <input type="checkbox" v-model="specs[attr.name]" :value="opt" class="rounded-md text-primary-600 w-3.5 h-3.5">
                  <span class="font-bold text-gray-600">{{ opt }}</span>
                </label>
              </div>
            </template>

            <template v-else-if="attr.type === 'checkbox'">
              <div class="flex items-center h-full pt-1">
                <label class="relative inline-flex items-center cursor-pointer scale-90 origin-left">
                  <input type="checkbox" v-model="specs[attr.name]" class="sr-only peer">
                  <div class="w-10 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                  <span class="ml-3 text-[10px] font-black text-gray-600 uppercase tracking-widest">{{ specs[attr.name] ? 'Evet' : 'Hayır' }}</span>
                </label>
              </div>
            </template>

            <template v-else>
              <input 
                v-model="specs[attr.name]" 
                :type="attr.type === 'number' ? 'number' : 'text'" 
                :placeholder="attr.placeholder || ''"
                class="w-full bg-white border-gray-100 rounded-xl px-4 py-3 text-xs font-bold shadow-sm"
              >
            </template>
          </div>
        </div>
      </div>

      <!-- Generic Custom Specs -->
      <div class="space-y-4">
        <div class="flex items-center justify-between ml-1">
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">EK TEKNİK ÖZELLİKLER</p>
          <button type="button" class="flex items-center text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest" @click="$emit('add-spec')">
            <PlusIcon class="h-4 w-4 mr-1" /> YENİ ÖZELLİK
          </button>
        </div>
        <div class="space-y-3">
          <div v-for="(spec, idx) in customSpecs" :key="idx" class="flex gap-3 animate-in slide-in-from-left-1">
            <input v-model="spec.key" type="text" placeholder="Örn: Sertlik" class="flex-1 bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-xs font-bold shadow-sm">
            <input v-model="spec.value" type="text" placeholder="Örn: 70 Shore" class="flex-1 bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-xs font-bold shadow-sm">
            <button class="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all" @click="$emit('remove-spec', idx)">
              <TrashIcon class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  attributes: Array,
  specs: Object, // Dynamic attributes from category
  customSpecs: Array // Manual list [{key, value}]
})

defineEmits(['add-spec', 'remove-spec', 'update:specs'])
</script>
