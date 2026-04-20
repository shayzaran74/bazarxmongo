<script setup lang="ts">
defineProps<{
  form: any
}>()
</script>

<template>
  <div class="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
    <div class="p-8 border-b border-gray-50 flex items-center justify-between">
      <h2 class="text-xl font-black text-gray-900 italic tracking-tighter uppercase leading-none">Banka Bilgileri</h2>
      <div class="px-3 py-1 bg-green-50 rounded-lg text-[8px] font-black uppercase text-green-600 border border-green-100">Ödeme Kanalları</div>
    </div>
    
    <div class="p-10 space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
           <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">BANKA ADI</label>
           <input v-model="form.bankName" type="text" class="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary-500/10 transition-all outline-none">
        </div>
        <div>
           <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">HESAP SAHİBİ</label>
           <input v-model="form.bankAccountName" type="text" class="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary-500/10 transition-all outline-none">
        </div>
      </div>
      <div>
         <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">IBAN NUMARASI</label>
         <input v-model="form.bankIban" type="text" placeholder="TR00 0000 0000..." class="w-full px-6 py-5 bg-gray-900 text-white border-none rounded-2xl text-sm font-mono tracking-widest focus:ring-4 focus:ring-primary-500/20 transition-all outline-none">
         <p class="text-[9px] font-bold text-gray-400 mt-2 ml-1 italic capitalize">* Lütfen IBAN numaranızı kontrol ederek boşluksuz veya standart boşluklu giriniz.</p>
      </div>
    </div>
  </div>
</template>
