<template>
  <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 italic">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="space-y-3">
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ARAMA</label>
        <input
          v-model="modelValue.search"
          type="text"
          placeholder="BAŞLIK ARA..."
          class="w-full bg-neutral-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none font-black text-[10px] shadow-inner"
          @input="debounceSearch"
        >
      </div>

      <div class="space-y-3">
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">DURUM</label>
        <select
          v-model="modelValue.status"
          class="w-full bg-neutral-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none font-black text-[10px] uppercase shadow-inner appearance-none"
          @change="$emit('change')"
        >
          <option value="">TÜM DURUMLAR</option>
          <option value="ACTIVE">🔥 AKTİF</option>
          <option value="DRAWN">🎯 KAZANAN BELİRLENDİ</option>
          <option value="ENDED">✅ TAMAMLANDI</option>
          <option value="CANCELLED">❌ İPTAL EDİLDİ</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Filters {
  status: string
  search: string
}

defineProps<{ modelValue: Filters }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: Filters): void; (e: 'change'): void }>()

let timeout: ReturnType<typeof setTimeout> | null = null

const debounceSearch = () => {
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(() => emit('change'), 500)
}
</script>
