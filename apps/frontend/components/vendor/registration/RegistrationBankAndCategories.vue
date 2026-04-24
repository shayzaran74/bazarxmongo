<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div class="space-y-6">
        <h2 class="text-xl font-black text-neutral-900 border-b pb-4 italic uppercase tracking-widest">
          💳 Banka Bilgileri
        </h2>
        <div class="space-y-4">
          <div class="space-y-2">
            <label for="bank-account-name" class="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Hesap Sahibi Adı *</label>
            <input id="bank-account-name" v-model="form.bankAccountName" type="text" class="input-premium" placeholder="AD SOYAD">
          </div>
          <div class="space-y-2">
            <label for="bank-name" class="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Banka Adı *</label>
            <input id="bank-name" v-model="form.bankName" type="text" class="input-premium" placeholder="ZİRAAT, GARANTİ...">
          </div>
          <div class="space-y-2">
            <label for="bank-iban" class="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">IBAN *</label>
            <input id="bank-iban" v-model="form.bankIban" type="text" class="input-premium font-mono" placeholder="TRXX XXXX...">
          </div>
        </div>
      </div>
      <div class="space-y-6">
        <h2 class="text-xl font-black text-neutral-900 border-b pb-4 italic uppercase tracking-widest">
          🏷️ Kategoriler
        </h2>
        <p class="text-[10px] font-black text-neutral-400 uppercase tracking-widest italic">
          SATMAK İSTEDİĞİNİZ KATEGORİLERİ SEÇİN
        </p>
        <div class="max-h-60 overflow-y-auto pr-4 space-y-2 custom-scrollbar">
          <label
            v-for="cat in categories"
            :key="cat.id"
            class="flex items-center gap-3 p-4 rounded-2xl border-2 border-transparent bg-neutral-50 hover:bg-neutral-100 cursor-pointer transition-all group"
            :class="form.categories.includes(cat.id) ? 'border-indigo-500 bg-white shadow-lg' : ''"
          >
            <input v-model="form.categories" data-testid="category-checkbox" type="checkbox" :value="cat.id" class="w-5 h-5 rounded border-2 border-neutral-300 text-indigo-600 focus:ring-indigo-500">
            <span class="text-[10px] font-black text-neutral-700 uppercase italic">{{ cat.name }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ form: Object, categories: Array })
</script>

<style scoped>
.input-premium {
  @apply w-full px-5 py-4 rounded-2xl border-2 border-transparent bg-neutral-50/50 focus:bg-white focus:border-indigo-500 transition-all outline-none text-xs font-black uppercase italic placeholder-neutral-300;
}
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-neutral-200 rounded-full hover:bg-neutral-300; }
</style>
