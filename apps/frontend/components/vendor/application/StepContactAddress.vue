<template>
  <div class="space-y-6 animate-fade-in-up">
    <!-- Contact Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
      <div>
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Telefon *</label>
        <input
          :value="modelValue.phone"
          type="tel"
          required
          class="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 transition-all font-bold outline-none"
          placeholder="+90 555 123 45 67"
          @input="$emit('update:modelValue', { ...modelValue, phone: ($event.target as HTMLInputElement).value })"
        >
      </div>
      <div>
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">WhatsApp</label>
        <input
          :value="modelValue.whatsapp"
          type="tel"
          class="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 transition-all font-bold outline-none"
          placeholder="+90 555 123 45 67"
          @input="$emit('update:modelValue', { ...modelValue, whatsapp: ($event.target as HTMLInputElement).value })"
        >
      </div>
      <div>
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">E-posta *</label>
        <input
          :value="modelValue.email"
          type="email"
          required
          class="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 transition-all font-bold outline-none"
          placeholder="info@firma.com"
          @input="$emit('update:modelValue', { ...modelValue, email: ($event.target as HTMLInputElement).value })"
        >
      </div>
      <div>
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Web Sitesi</label>
        <input
          :value="modelValue.website"
          type="url"
          class="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 transition-all font-bold outline-none"
          placeholder="https://www.firma.com"
          @input="$emit('update:modelValue', { ...modelValue, website: ($event.target as HTMLInputElement).value })"
        >
      </div>
    </div>

    <!-- Address Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="md:col-span-2">
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Adres *</label>
        <textarea
          :value="modelValue.address"
          rows="3"
          required
          class="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 transition-all font-bold outline-none resize-none"
          placeholder="Sokak, numara, mahalle..."
          @input="$emit('update:modelValue', { ...modelValue, address: ($event.target as HTMLTextAreaElement).value })"
        />
      </div>

      <div>
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Şehir *</label>
        <select
          :value="modelValue.city"
          required
          class="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 transition-all font-bold outline-none appearance-none"
          @change="onCityChange($event)"
        >
          <option value="">Seçiniz</option>
          <option v-for="(districts, city) in iller" :key="city" :value="city">{{ city }}</option>
        </select>
      </div>

      <div>
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">İlçe *</label>
        <select
          :value="modelValue.district"
          :disabled="!modelValue.city"
          required
          class="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 transition-all font-bold outline-none appearance-none disabled:opacity-40"
          @change="$emit('update:modelValue', { ...modelValue, district: ($event.target as HTMLSelectElement).value })"
        >
          <option value="">Seçiniz</option>
          <option v-for="district in (iller[modelValue.city] || [])" :key="district" :value="district">{{ district }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { iller } from '~/assets/css/data/component/iller'

const props = defineProps<{ modelValue: any }>()
const emit = defineEmits(['update:modelValue'])

const onCityChange = (event: Event) => {
  const city = (event.target as HTMLSelectElement).value
  emit('update:modelValue', { ...props.modelValue, city, district: '' })
}
</script>
