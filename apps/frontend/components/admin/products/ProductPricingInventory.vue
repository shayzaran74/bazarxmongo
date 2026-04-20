<template>
  <div class="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
    <!-- Pricing -->
    <div>
      <h3 class="text-sm font-black text-gray-900 uppercase italic mb-6">Fiyatlandırma & <span class="text-indigo-600">Vergi</span></h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-1">
          <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Satış Fiyatı (TL)</label>
          <div class="relative">
            <span class="absolute left-4 top-3 text-gray-400 font-bold">₺</span>
            <input v-model.number="modelValue.price" type="number" step="0.01" class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-black focus:bg-white focus:border-indigo-500 outline-none">
          </div>
        </div>
        <div class="space-y-1">
          <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Karşılaştırma Fiyatı</label>
          <div class="relative">
            <span class="absolute left-4 top-3 text-gray-400 font-bold">₺</span>
            <input v-model.number="modelValue.compareAtPrice" type="number" step="0.01" class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all">
          </div>
        </div>
      </div>
      <div class="mt-4 flex items-center gap-2 px-1">
        <input v-model="modelValue.isTaxable" type="checkbox" class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
        <span class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Bu üründen vergi al</span>
      </div>
    </div>

    <!-- Inventory -->
    <div class="pt-8 border-t border-gray-50">
      <h3 class="text-sm font-black text-gray-900 uppercase italic mb-6">Stok & <span class="text-indigo-600">Envanter</span></h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-1">
          <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Stok Miktarı</label>
          <input v-model.number="modelValue.stock" type="number" class="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-black focus:bg-white focus:border-indigo-500 outline-none shadow-inner">
        </div>
        <div class="space-y-1">
          <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">SKU (Kod)</label>
          <input v-model="modelValue.sku" type="text" placeholder="Örn: PRD-001" class="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none">
        </div>
      </div>
      <div class="mt-6 p-4 bg-indigo-50/50 rounded-2xl flex items-center justify-between">
        <div class="flex items-center gap-3">
          <input v-model="modelValue.trackInventory" type="checkbox" class="w-4 h-4 rounded border-gray-200 text-indigo-600">
          <span class="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Envanter Takibi AKTİF</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tükenince Satış</span>
          <button 
            class="w-10 h-5 rounded-full relative transition-colors"
            :class="modelValue.continueSellingOutOfStock ? 'bg-indigo-600' : 'bg-gray-300'"
            @click="modelValue.continueSellingOutOfStock = !modelValue.continueSellingOutOfStock"
          >
            <div class="w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-all" :class="modelValue.continueSellingOutOfStock ? 'right-1' : 'left-1'" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ modelValue: Object })
</script>
