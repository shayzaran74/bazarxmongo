<template>
  <div class="space-y-6 animate-fade-in-up">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="md:col-span-2">
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">İşletme Adı *</label>
        <input
          :value="modelValue.businessName"
          type="text"
          required
          class="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 transition-all font-bold outline-none"
          placeholder="Örn: ABC Ticaret Ltd. Şti."
          @input="$emit('update:modelValue', { ...modelValue, businessName: ($event.target as HTMLInputElement).value })"
        >
      </div>

      <div class="md:col-span-2">
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">İşletme Türü *</label>
        <div class="grid grid-cols-3 gap-3">
          <button 
            v-for="type in types" 
            :key="type.id"
            type="button"
            class="p-4 border-2 rounded-2xl text-center transition-all"
            :class="[
              modelValue.businessType === type.id ? 'border-primary-500 bg-primary-50 text-primary-900' : 'border-gray-100 bg-white hover:border-gray-200'
            ]"
            @click="$emit('update:modelValue', { ...modelValue, businessType: type.id })"
          >
            <div class="text-[10px] font-black uppercase tracking-widest">{{ type.label }}</div>
          </button>
        </div>
      </div>

      <div>
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">TC Kimlik No</label>
        <input
          :value="modelValue.tckn"
          type="text"
          class="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 transition-all font-mono outline-none"
          placeholder="11111111111"
          maxlength="11"
          @input="$emit('update:modelValue', { ...modelValue, tckn: ($event.target as HTMLInputElement).value })"
        >
      </div>

      <div>
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Vergi Kimlik No</label>
        <input
          :value="modelValue.vergiNo"
          type="text"
          class="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 transition-all font-mono outline-none"
          placeholder="1234567890"
          maxlength="10"
          @input="$emit('update:modelValue', { ...modelValue, vergiNo: ($event.target as HTMLInputElement).value })"
        >
      </div>

      <div>
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">MERSİS No</label>
        <input
          :value="modelValue.mersisNo"
          type="text"
          class="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 transition-all font-mono outline-none"
          placeholder="0123456789000000"
          maxlength="16"
          @input="$emit('update:modelValue', { ...modelValue, mersisNo: ($event.target as HTMLInputElement).value })"
        >
      </div>

      <div>
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Ticaret Sicil No</label>
        <input
          :value="modelValue.businessRegistration"
          type="text"
          class="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 transition-all font-mono outline-none"
          placeholder="12345678"
          @input="$emit('update:modelValue', { ...modelValue, businessRegistration: ($event.target as HTMLInputElement).value })"
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: any }>()
defineEmits(['update:modelValue'])

const types = [
  { id: 'individual', label: 'Şahıs' },
  { id: 'company', label: 'Şirket' },
  { id: 'cooperative', label: 'Kooperatif' }
]
</script>
