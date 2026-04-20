<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
    <h2 class="text-xl font-black text-neutral-900 border-b pb-4 italic uppercase tracking-widest">
      📞 İletişim & Adres
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-2">
        <label class="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Telefon *</label>
        <input v-model="form.phone" type="tel" class="input-premium" placeholder="+90 5XX XXX XX XX" required>
      </div>
      <div class="space-y-2">
        <label class="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">E-posta Adresi *</label>
        <input v-model="form.email" type="email" class="input-premium" placeholder="INFO@MAGAZANIZ.COM" required>
      </div>
      <div class="md:col-span-2 space-y-2">
        <label class="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Açık Adres *</label>
        <textarea v-model="form.address" rows="3" class="input-premium resize-none" placeholder="MAHALLE, SOKAK, NO..." />
      </div>
      <div class="space-y-2">
        <label class="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Şehir *</label>
        <select v-model="form.city" class="input-premium appearance-none" required @change="form.district = ''">
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
defineProps({ form: Object })
</script>

<style scoped>
.input-premium {
  @apply w-full px-5 py-4 rounded-2xl border-2 border-transparent bg-neutral-50/50 focus:bg-white focus:border-indigo-500 transition-all outline-none text-xs font-black uppercase italic placeholder-neutral-300;
}
</style>
