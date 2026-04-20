<template>
  <div class="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 p-10 space-y-8 font-sans italic">
    <div class="flex items-center justify-between">
      <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">EŞLEŞME KOŞULLARI (OTOMATİK)</h3>
      <div class="flex items-center gap-4 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
         <select
          v-model="modelValue.conditionType"
          class="bg-transparent text-[9px] font-black uppercase tracking-widest text-slate-400 outline-none px-3"
        >
          <option value="all">TÜMÜNÜ KARŞILAMALI</option>
          <option value="any">HERHANGİ BİRİNİ KARŞILAMALI</option>
        </select>
      </div>
    </div>

    <!-- Conditions List -->
    <div class="space-y-4">
      <div
        v-for="(condition, index) in conditions"
        :key="index"
        class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-950/30 p-6 rounded-[2rem] border border-slate-800/50 group hover:border-slate-700 transition-all"
      >
        <div class="md:col-span-3">
          <select
            v-model="condition.field"
            class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="tag">ETİKET</option>
            <option value="vendor">SATICI</option>
            <option value="productType">ÜRÜN TÜRÜ</option>
            <option value="price">FİYAT</option>
          </select>
        </div>
        <div class="md:col-span-3">
          <select
            v-model="condition.operator"
            class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="equals">EŞİTTİR</option>
            <option value="not_equals">EŞİT DEĞİLDİR</option>
            <option value="contains">İÇERİR</option>
            <option value="not_contains">İÇERMEZ</option>
            <option v-if="condition.field === 'price'" value="greater_than">BÜYÜKTÜR</option>
            <option v-if="condition.field === 'price'" value="less_than">KÜÇÜKTÜR</option>
          </select>
        </div>
        <div class="md:col-span-5">
          <input
            v-model="condition.value"
            type="text"
            :placeholder="condition.field === 'price' ? '0.00' : 'PARAMETRE GİRİN...'"
            class="w-full bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-700"
          >
        </div>
        <div class="md:col-span-1 flex justify-end">
          <button
            class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 text-slate-600 hover:bg-red-600 hover:text-white transition-all"
            @click="$emit('remove', index)"
          >
             &times;
          </button>
        </div>
      </div>
    </div>

    <button
      type="button"
      class="w-full py-5 bg-slate-950 border border-slate-800 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-blue-500 hover:border-blue-500 transition-all flex items-center justify-center gap-3 active:scale-95"
      @click="$emit('add')"
    >
      <span class="text-xl">+</span> YENİ KOŞUL PARAMETRESİ EKLE
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  conditions: any[]
  modelValue: any
}>()

defineEmits(['add', 'remove', 'update:modelValue'])
</script>
