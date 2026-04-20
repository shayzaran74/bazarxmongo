<template>
  <div class="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 p-10 space-y-8 font-sans italic">
    <div class="flex items-center justify-between">
      <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">ÜRÜN ENVANTERİ (MANUEL)</h3>
      <span class="text-[9px] font-black text-blue-500 uppercase tracking-widest">{{ selectedProducts.length }} ÜRÜN SEÇİLDİ</span>
    </div>

    <!-- Search Box -->
    <div class="relative space-y-4">
      <label class="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">ENVANTERDE ARA</label>
      <div class="relative">
        <span class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
        <input
          :value="productSearch"
          type="text"
          placeholder="İSİM VEYA SKU İLE ARA..."
          class="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-14 pr-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-200"
          @input="$emit('update:productSearch', ($event.target as HTMLInputElement).value)"
        >
      </div>

      <!-- Search Results Dropdown -->
      <div
        v-if="searchResults.length > 0"
        class="absolute z-50 w-full mt-2 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-h-80 overflow-y-auto custom-scrollbar p-2"
      >
        <button
          v-for="product in searchResults"
          :key="product.id"
          class="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-800 transition-all text-left group"
          @click="$emit('add', product)"
        >
          <img :src="product.image || 'https://placehold.co/100x100?text=P'" class="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-800">
          <div class="flex-1">
            <div class="text-[11px] font-black text-slate-200 uppercase tracking-tight">{{ product.name }}</div>
            <div class="text-[9px] text-slate-500 font-bold tracking-widest">₺{{ product.price }}</div>
          </div>
          <span class="text-blue-500 opacity-0 group-hover:opacity-100 transition-all">+ EKLE</span>
        </button>
      </div>
    </div>

    <!-- Selected Products List -->
    <div class="space-y-4">
      <div v-if="selectedProducts.length === 0" class="py-12 border-2 border-dashed border-slate-800 rounded-3xl text-center">
         <p class="text-[10px] font-black text-slate-700 uppercase tracking-widest">HENÜZ ÜRÜN SEÇİLMEDİ.</p>
      </div>
      <div
        v-for="(product, index) in selectedProducts"
        :key="product.id"
        class="flex items-center gap-6 p-4 bg-slate-950/50 border border-slate-800 rounded-3xl group hover:border-slate-600 transition-all"
      >
        <img :src="product.image || 'https://placehold.co/100x100?text=P'" class="w-16 h-16 rounded-2xl object-cover ring-1 ring-slate-800 select-none">
        <div class="flex-1">
          <h4 class="text-sm font-black text-slate-200 uppercase tracking-tight leading-none mb-1">{{ product.name }}</h4>
          <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">₺{{ product.price }}</p>
        </div>
        <button
          class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 text-slate-600 hover:bg-red-600 hover:text-white transition-all shadow-lg"
          @click="$emit('remove', index)"
        >
          &times;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  selectedProducts: any[]
  searchResults: any[]
  productSearch: string
}>()

defineEmits(['update:productSearch', 'add', 'remove'])
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
</style>
