<template>
  <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 italic">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div class="space-y-3">
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ARAMA</label>
        <div class="relative group">
          <input v-model="modelValue.search" type="text" placeholder="BAŞLIK ARA..." class="w-full bg-neutral-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none font-black text-[10px] shadow-inner" @input="debounceSearch">
        </div>
      </div>

      <div v-for="f in filterConfigs" :key="f.label" class="space-y-3">
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{{ f.label }}</label>
        <div class="relative group">
          <select v-model="modelValue[f.key]" class="w-full bg-neutral-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none font-black text-[10px] uppercase shadow-inner appearance-none" @change="$emit('change')">
            <option v-for="opt in f.options" :key="opt.value" :value="opt.value">{{ opt.text }}</option>
          </select>
          <div class="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ modelValue: Object })
const emit = defineEmits(['update:modelValue', 'change'])

const filterConfigs = [
  { label: 'DURUM', key: 'status', options: [
    { value: '', text: 'TÜM DURUMLAR' },
    { value: 'Active', text: '🔥 AKTİF' },
    { value: 'Completed', text: '✅ TAMAMLANDI' },
    { value: 'Cancelled', text: '❌ İPTAL EDİLDİ' },
    { value: 'Pending', text: '⏳ BEKLEMEDE' }
  ]},
  { label: 'BİTİŞ TARİHİ', key: 'dateRange', options: [
    { value: '', text: 'TÜM ZAMANLAR' },
    { value: 'today', text: 'BUGÜN' },
    { value: 'week', text: 'BU HAFTA' },
    { value: 'month', text: 'BU AY' }
  ]},
  { label: 'SIRALAMA', key: 'sortBy', options: [
    { value: 'created_desc', text: 'YENİ OLUŞTURULANLAR' },
    { value: 'endTime_asc', text: 'BİTİŞ (YAKIN)' },
    { value: 'endTime_desc', text: 'BİTİŞ (UZAK)' },
    { value: 'prizeValue_desc', text: 'ÖDÜL DEĞERİ (YÜKSEK)' },
    { value: 'participants_desc', text: 'KATILIM SAYISI' }
  ]}
]

let timeout = null
const debounceSearch = () => {
  clearTimeout(timeout)
  timeout = setTimeout(() => emit('change'), 500)
}
</script>
