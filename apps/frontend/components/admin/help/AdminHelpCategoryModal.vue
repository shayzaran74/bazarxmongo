<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans italic"
  >
    <div
      class="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
      @click="$emit('close')"
    />
    <div class="relative bg-slate-900 w-full max-w-lg rounded-[2.5rem] border border-slate-800 shadow-2xl p-12 space-y-10">
      <div>
        <h3 class="text-3xl font-black text-slate-100 uppercase tracking-tightest">
          YENİ KATEGORİ KAYDI
        </h3>
        <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 opacity-60">SİSTEMSEL YAPILANDIRMA PANELİ</p>
      </div>

      <div class="space-y-8">
        <div class="space-y-4">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">KATEGORİ ADI</label>
          <input
            :value="modelValue.name"
            type="text"
            placeholder="ÖRN: TEKNİK DESTEK"
            class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-200"
            @input="$emit('update:modelValue', { ...modelValue, name: ($event.target as HTMLInputElement).value })"
          >
        </div>
        <div class="space-y-4">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">SLUG (OTOMATİK)</label>
          <input
            :value="modelValue.slug"
            type="text"
            placeholder="teknik-destek"
            class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest outline-none bg-slate-950/50"
            readonly
          >
        </div>
        <div class="space-y-4">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">FONKSİYONEL AÇIKLAMA</label>
          <textarea
            :value="modelValue.description"
            rows="3"
            class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] font-bold tracking-tight outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-400"
            @input="$emit('update:modelValue', { ...modelValue, description: ($event.target as HTMLTextAreaElement).value })"
          />
        </div>
      </div>

      <div class="pt-6 flex justify-end gap-6">
        <button
          class="px-8 py-4 text-[10px] font-black text-slate-500 hover:text-slate-200 uppercase tracking-widest transition-all"
          @click="$emit('close')"
        >
          VAZGEÇ
        </button>
        <button
          class="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl shadow-xl transition-all"
          @click="$emit('save')"
        >
          KATEGORİYİ EKLE
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
  modelValue: any
}>()

defineEmits(['update:modelValue', 'close', 'save'])
</script>
