<template>
  <div class="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="space-y-1">
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Durum</label>
        <select 
          :value="modelValue.status" 
          class="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-xs font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner"
          @change="$emit('update:modelValue', { ...modelValue, status: $event.target.value }); $emit('search')"
        >
          <option value="">Tümü</option>
          <option value="pending">Bekleyen</option>
          <option value="approved">Onaylanan</option>
          <option value="rejected">Reddedilen</option>
        </select>
      </div>

      <div class="space-y-1">
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Kullanıcı Ara</label>
        <input 
          :value="modelValue.user"
          type="text" 
          placeholder="İsim veya email..."
          class="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-xs font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner"
          @input="$emit('update:modelValue', { ...modelValue, user: $event.target.value }); $emit('search')"
        >
      </div>

      <div class="space-y-1">
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Min. Tutar (TL)</label>
        <input 
          :value="modelValue.minAmount"
          type="number" 
          placeholder="0"
          class="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-xs font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner"
          @input="$emit('update:modelValue', { ...modelValue, minAmount: $event.target.value }); $emit('search')"
        >
      </div>

      <div class="flex items-end">
        <button 
          class="w-full py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all active:scale-95 shadow-lg"
          @click="$emit('clear')"
        >
          FİLTRELERİ TEMİZLE
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ modelValue: Object })
defineEmits(['update:modelValue', 'search', 'clear'])
</script>
