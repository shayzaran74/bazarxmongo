<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
    <h2 class="text-xl font-black text-neutral-900 border-b pb-4 italic uppercase tracking-widest">
      📞 İletişim & Adres
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-2">
        <label for="contact-phone" class="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Telefon *</label>
        <input 
          id="contact-phone" 
          v-model="form.phone" 
          type="tel" 
          class="input-premium font-mono" 
          placeholder="+90 5XX XXX XX XX" 
          @input="formatPhone"
          maxlength="17"
          required
        >
        <p class="text-[8px] font-black text-neutral-400 uppercase italic ml-1 mt-1">
          Format: +90 5XX XXX XX XX
        </p>
      </div>
      <div class="space-y-2">
        <label for="contact-email" class="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">E-posta Adresi *</label>
        <input id="contact-email" v-model="form.email" type="email" class="input-premium" placeholder="INFO@MAGAZANIZ.COM" required>
      </div>
      <div class="md:col-span-2 space-y-2">
        <label for="contact-address" class="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Açık Adres *</label>
        <textarea id="contact-address" v-model="form.address" rows="3" class="input-premium resize-none" placeholder="MAHALLE, SOKAK, NO..." />
      </div>
      <div class="space-y-2">
        <label for="contact-city" class="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Şehir *</label>
        <select id="contact-city" v-model="form.city" class="input-premium appearance-none" required @change="form.district = ''">
          <option value="">SEÇİN</option>
          <option v-for="(districts, city) in iller" :key="city" :value="city">{{ city }}</option>
        </select>
      </div>
      <div class="space-y-2">
        <label class="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">İlçe *</label>
        <select v-model="form.district" :disabled="!form.city" class="input-premium appearance-none disabled:opacity-30" required>
          <option value="">SEÇİN</option>
          <option v-for="district in (iller[form.city] || [])" :key="district" :value="district">{{ district }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { iller } from '~/assets/css/data/component/iller'
const props = defineProps({ form: Object })

const formatPhone = (e) => {
  let val = e.target.value.replace(/[^\d+]/g, '')
  if (!val.startsWith('+90')) {
    val = val.replace(/^\+?9?0?/, '')
    val = '+90' + val
  }
  const numbers = val.replace(/[^\d]/g, '').substring(2)
  let formatted = '+90'
  if (numbers.length > 0) formatted += ' ' + numbers.substring(0, 3)
  if (numbers.length > 3) formatted += ' ' + numbers.substring(3, 6)
  if (numbers.length > 6) formatted += ' ' + numbers.substring(6, 8)
  if (numbers.length > 8) formatted += ' ' + numbers.substring(8, 10)
  props.form.phone = formatted
}
</script>

<style scoped>
.input-premium {
  @apply w-full px-5 py-4 rounded-2xl border-2 border-transparent bg-neutral-50/50 focus:bg-white focus:border-indigo-500 transition-all outline-none text-xs font-black uppercase italic placeholder-neutral-300;
}
</style>
