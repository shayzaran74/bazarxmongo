<template>
  <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 italic">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div class="space-y-3">
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ARAMA</label>
        <input v-model="modelValue.search" type="text" placeholder="İSİM, BARKOD, SKU..." class="w-full bg-neutral-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none font-black text-[10px] shadow-inner uppercase">
      </div>

      <div class="space-y-3">
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">KATEGORİ</label>
        <div class="relative">
          <select v-model="modelValue.categoryId" class="w-full bg-neutral-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none font-black text-[10px] shadow-inner appearance-none uppercase">
            <option value="">TÜM KATEGORİLER</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
          <div class="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
        </div>
      </div>

      <div class="space-y-3">
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">STOK DURUMU</label>
        <div class="relative">
          <select v-model="modelValue.stockStatus" class="w-full bg-neutral-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none font-black text-[10px] shadow-inner appearance-none uppercase">
            <option value="">ÜRETİLEN TÜMÜ</option>
            <option value="in_stock">STOKTA (YETERLİ)</option>
            <option value="low_stock">DÜŞÜK STOK</option>
            <option value="out_of_stock">STOKTA YOK</option>
          </select>
          <div class="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
        </div>
      </div>

      <div class="flex items-end gap-3 pt-1">
        <button class="flex-1 h-14 bg-gray-900 border border-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95" @click="$emit('fetch')">FİLTRELE</button>
        <button class="px-6 h-14 bg-white border border-neutral-100 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-neutral-50 transition-all shadow-sm" @click="$emit('reset')">SIFIRLA</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ modelValue: Object, categories: Array })
defineEmits(['update:modelValue', 'fetch', 'reset'])
</script>
