<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
    <h2 class="text-xl font-black text-neutral-900 border-b pb-4 italic uppercase tracking-widest">
      📋 İşletme Bilgileri
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-2">
        <label for="business-name" class="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">İşletme Adı *</label>
        <input id="business-name" v-model="form.businessName" type="text" placeholder="MAĞAZA VEYA ŞİRKET ADI" class="input-premium" required>
      </div>
      <div class="space-y-2">
        <label for="business-type" class="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">İşletme Tipi *</label>
        <select id="business-type" v-model="form.businessType" class="input-premium appearance-none" required>
          <option value="">SEÇİN</option>
          <option value="INDIVIDUAL">ŞAHIS ŞİRKETİ</option>
          <option value="COMPANY">LTD & A.Ş.</option>
          <option value="COOPERATIVE">KOOPERATİF</option>
        </select>
      </div>
      <div class="space-y-2">
        <label for="tax-id" class="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Vergi No / T.C. Kimlik No *</label>
        <input 
          id="tax-id" 
          v-model="form.taxId" 
          type="text" 
          class="input-premium font-mono" 
          :placeholder="form.businessType === 'INDIVIDUAL' ? '11 HANELİ TCKN' : '10 HANELİ VKN'"
          :maxlength="form.businessType === 'INDIVIDUAL' ? 11 : 10"
          @input="form.taxId = form.taxId.replace(/[^0-9]/g, '')"
          required
        >
        <p class="text-[8px] font-black text-neutral-400 uppercase italic ml-1 mt-1">
          Şahıs şirketleri için 11 haneli TCKN, diğerleri için 10 haneli VKN.
        </p>
      </div>
      <div class="space-y-2">
        <label class="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Ticaret Sicil No</label>
        <input 
          v-model="form.businessRegistration" 
          type="text" 
          class="input-premium font-mono" 
          placeholder="16 HANELİ SİCİL NO"
          maxlength="16"
          @input="form.businessRegistration = form.businessRegistration.replace(/[^0-9]/g, '')"
        >
        <p class="text-[8px] font-black text-neutral-400 uppercase italic ml-1 mt-1">
          Ticaret sicil numarası genellikle 16 hanelidir (Varsa).
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ form: Object })
</script>

<style scoped>
.input-premium {
  @apply w-full px-5 py-4 rounded-2xl border-2 border-transparent bg-neutral-50/50 focus:bg-white focus:border-indigo-500 transition-all outline-none text-xs font-black uppercase italic placeholder-neutral-300;
}
</style>
