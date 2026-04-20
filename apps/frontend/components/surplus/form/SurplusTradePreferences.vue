<template>
  <div class="space-y-6">
    <h3 class="text-xs font-black text-primary-600 uppercase tracking-[0.2em] flex items-center">
      <span class="w-8 h-px bg-primary-600 mr-3" />
      Takas Tercihleri
    </h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Wanted Categories -->
      <div class="space-y-4">
        <label class="block text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1">ARANAN KATEGORİLER</label>
        
        <div class="space-y-3">
          <select 
            v-model="wantedMain" 
            class="w-full bg-gray-50 border-gray-200 rounded-2xl px-5 py-4 text-xs font-bold"
            @change="onMainChange"
          >
            <option value="">Ana Kategori Seçin</option>
            <option v-for="cat in mainCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>

          <select 
            v-if="sub1List.length" 
            v-model="wantedSub1" 
            class="w-full bg-gray-50 border-gray-200 rounded-2xl px-5 py-4 text-xs font-bold animate-in fade-in slide-in-from-top-1"
            @change="onSub1Change"
          >
            <option value="">Alt Kategori Seçin</option>
            <option v-for="cat in sub1List" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>

          <button
            type="button"
            class="w-full bg-gray-900 text-white rounded-2xl py-4 font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center justify-center"
            @click="onAdd"
          >
            <PlusIcon class="h-4 w-4 mr-2" /> KATEGORİYİ EKLE
          </button>
        </div>

        <!-- Selected Tags -->
        <div v-if="selectedCategories?.length" class="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
          <div
            v-for="(cat, idx) in selectedCategories"
            :key="idx"
            class="group flex items-center bg-primary-50 text-primary-700 px-4 py-2 rounded-xl border border-primary-100"
          >
            <span class="text-[10px] font-black uppercase tracking-widest">{{ cat }}</span>
            <button class="ml-2 text-primary-300 group-hover:text-primary-600" @click="$emit('remove-cat', idx)">
              <XMarkIcon class="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      <!-- Trade Modes -->
      <div class="space-y-4">
        <label class="block text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1">TAKAS ŞEKİLLERİ</label>
        <div class="flex flex-col gap-3">
          <label
            v-for="mode in tradeModeOptions"
            :key="mode.value"
            class="flex items-center space-x-4 bg-gray-50 px-5 py-4 rounded-2xl cursor-pointer transition-all border-2"
            :class="selectedModes.includes(mode.value) ? 'border-primary-600 bg-white shadow-md' : 'border-transparent hover:bg-white'"
          >
            <input
              type="checkbox"
              :value="mode.value"
              :checked="selectedModes.includes(mode.value)"
              class="w-5 h-5 rounded-lg border-gray-300 text-primary-600 focus:ring-primary-600"
              @change="onModeToggle(mode.value)"
            >
            <div class="flex flex-col">
              <span class="text-[10px] font-black uppercase leading-none tracking-wider">{{ mode.label }}</span>
              <span class="text-[8px] font-bold text-gray-400 mt-1.5 uppercase tracking-tighter">{{ mode.desc }}</span>
            </div>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PlusIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  mainCategories: Array,
  surplusCategories: Array,
  selectedCategories: Array,
  selectedModes: Array,
  tradeModeOptions: Array
})

const emit = defineEmits(['add-cat', 'remove-cat', 'update:selectedModes'])

const wantedMain = ref('')
const wantedSub1 = ref('')
const sub1List = ref([])

const onMainChange = () => {
  wantedSub1.value = ''
  sub1List.value = props.surplusCategories.filter(c => c.parentId === wantedMain.value)
}

const onSub1Change = () => {}

const onAdd = () => {
  const selectedId = wantedSub1.value || wantedMain.value
  if (!selectedId) return
  const cat = props.surplusCategories.find(c => c.id === selectedId)
  if (cat) {
    emit('add-cat', cat.name.toUpperCase())
    wantedMain.value = ''
    wantedSub1.value = ''
    sub1List.value = []
  }
}

const onModeToggle = (val) => {
  const modes = [...props.selectedModes]
  const idx = modes.indexOf(val)
  if (idx > -1) modes.splice(idx, 1)
  else modes.push(val)
  emit('update:selectedModes', modes)
}
</script>
