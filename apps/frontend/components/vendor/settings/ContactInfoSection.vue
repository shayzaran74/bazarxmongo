<script setup lang="ts">
defineProps<{
  form: any
}>()
</script>

<template>
  <div class="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
    <div class="p-8 border-b border-gray-50 flex items-center justify-between">
      <h2 class="text-xl font-black text-gray-900 italic tracking-tighter uppercase leading-none">İletişim & Web</h2>
      <div class="px-3 py-1 bg-amber-50 rounded-lg text-[8px] font-black uppercase text-amber-600 border border-amber-100">Kritik Bilgiler</div>
    </div>
    
    <div class="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div v-for="field in [
        { key: 'email', label: 'KURUMSAL E-POSTA', placeholder: 'kurumsal@email.com', warning: 'Değişiklik onay gerektirir.' },
        { key: 'phone', label: 'TELEFON NUMARASI', placeholder: '+90 5xx ...' },
        { key: 'website', label: 'RESMİ WEB SİTESİ', placeholder: 'https://...' },
        { key: 'whatsapp', label: 'WHATSAPP HATTI', placeholder: '+90 ...' }
      ]" :key="field.key" class="space-y-2">
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{{ field.label }}</label>
        <input v-model="form[field.key]" :type="field.key === 'email' ? 'email' : 'text'" :placeholder="field.placeholder" class="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary-500/10 transition-all outline-none">
        <p v-if="field.warning" class="text-[9px] font-black text-amber-500 uppercase tracking-widest italic ml-1">{{ field.warning }}</p>
      </div>
    </div>

    <!-- Address Subset -->
    <div class="p-10 bg-gray-50/50 border-t border-gray-50 space-y-8">
       <div>
         <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">AÇIK ADRES</label>
         <input v-model="form.address" type="text" placeholder="Mahalle, Sokak, No..." class="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-xs font-bold focus:ring-4 focus:outline-none">
       </div>
       <div class="grid grid-cols-2 gap-6">
          <div>
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">ŞEHİR</label>
            <input v-model="form.city" type="text" class="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-xs font-bold focus:ring-4 focus:outline-none">
          </div>
          <div>
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">POSTA KODU</label>
            <input v-model="form.zipCode" type="text" class="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-xs font-bold focus:ring-4 focus:outline-none">
          </div>
       </div>
    </div>
  </div>
</template>
