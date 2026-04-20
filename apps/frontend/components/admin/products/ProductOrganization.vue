<template>
  <div class="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
    <h3 class="text-sm font-black text-gray-900 uppercase italic mb-6">Organizasyon & <span class="text-indigo-600">Kategoriler</span></h3>

    <div class="space-y-6">
      <!-- Cascading Categories -->
      <div class="space-y-3">
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Ürün Kategorisi *</label>
        
        <select 
          :value="mainId"
          class="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner"
          @change="$emit('update:mainId', $event.target.value)"
        >
          <option value="">Ana Kategori Seçin</option>
          <option v-for="cat in mainCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>

        <select 
          v-if="mainId && sub1Categories.length > 0"
          :value="sub1Id"
          class="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner"
          @change="$emit('update:sub1Id', $event.target.value)"
        >
          <option value="">Alt Kategori Seçin</option>
          <option v-for="cat in sub1Categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>

        <select 
          v-if="sub1Id && sub2Categories.length > 0"
          :value="sub2Id"
          class="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner"
          @change="$emit('update:sub2Id', $event.target.value)"
        >
          <option value="">Detay Kategori Seçin</option>
          <option v-for="cat in sub2Categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>

      <!-- Vendor & Type -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-50">
        <div class="space-y-1">
          <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Satıcı / Marka</label>
          <input :value="modelValue.vendor" type="text" class="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none" @input="$emit('update:modelValue', { ...modelValue, vendor: $event.target.value })">
        </div>
        <div class="space-y-1">
          <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Ürün Türü</label>
          <input :value="modelValue.productType" type="text" class="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none" @input="$emit('update:modelValue', { ...modelValue, productType: $event.target.value })">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: Object,
  mainCategories: Array,
  sub1Categories: Array,
  sub2Categories: Array,
  mainId: String,
  sub1Id: String,
  sub2Id: String
})

defineEmits(['update:modelValue', 'update:mainId', 'update:sub1Id', 'update:sub2Id'])
</script>
