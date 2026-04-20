<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-12 font-sans italic">
    <div class="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" @click="$emit('close')" />
    
    <div class="relative bg-slate-900 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[4rem] border border-slate-800 shadow-[0_0_100px_rgba(30,58,138,0.3)] flex flex-col">
      <!-- Header -->
      <div class="p-10 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
        <div>
          <h3 class="text-3xl font-black text-slate-100 uppercase tracking-tightest leading-none">
            {{ isEditing ? 'PARAMETRE DÜZENLE' : 'YENİ ÖZELLİK TANIMI' }}
          </h3>
          <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">KATEGORİ ÖZELLİK KONFİGÜRASYONU v4.0</p>
        </div>
        <button
          class="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-800 text-slate-500 hover:text-white hover:bg-slate-700 transition-all font-light border border-slate-700 active:scale-90"
          @click="$emit('close')"
        >
          &times;
        </button>
      </div>

      <!-- Form Content -->
      <div class="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div class="space-y-4">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">GÖRÜNEN AD (LABEL)</label>
              <input
                v-model="modelValue.label"
                type="text"
                placeholder="BEDEN, RENK, MALZEME..."
                class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-sm font-black uppercase tracking-tight outline-none focus:ring-2 focus:ring-blue-600 transition-all text-slate-200"
              >
           </div>
           <div class="space-y-4">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">TEKNİK AD (DB_KEY)</label>
              <input
                v-model="modelValue.name"
                type="text"
                placeholder="beden, renk, malzeme..."
                class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-sm font-black uppercase tracking-tight outline-none focus:ring-2 focus:ring-blue-600 transition-all text-blue-400"
              >
           </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div class="space-y-4">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">VERİ TİPİ</label>
               <select
                v-model="modelValue.type"
                class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-600 transition-all text-slate-300"
              >
                <option value="text">METİN GİRİŞİ</option>
                <option value="number">SAYISAL DEĞER</option>
                <option value="select">TEKLİ SEÇİM (DROPDOWN)</option>
                <option value="multiselect">ÇOKLU SEÇİM</option>
                <option value="checkbox">ONAY KUTUSU</option>
              </select>
           </div>
           <div class="space-y-4">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ÖLÇÜ BİRİMİ</label>
              <input
                v-model="modelValue.unit"
                type="text"
                placeholder="CM, KG, ADET..."
                class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-sm font-black uppercase tracking-tight outline-none focus:ring-2 focus:ring-blue-600 transition-all text-slate-200"
              >
           </div>
        </div>

        <!-- Options Configuration -->
        <div v-if="['select', 'multiselect'].includes(modelValue.type)" class="space-y-4 bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 shadow-inner">
           <label class="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">OPSİYON MATRİSİ (VİRGÜL İLE AYIRIN)</label>
           <input
            :value="optionsInput"
            type="text"
            placeholder="S, M, L, XL VEYA PAMUK, DERİ..."
            class="w-full bg-slate-900 border border-slate-800 rounded-xl px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-600 transition-all text-slate-200"
            @input="$emit('update:optionsInput', ($event.target as HTMLInputElement).value)"
          >
          <div v-if="parsedOptions.length > 0" class="flex flex-wrap gap-2 mt-4">
             <span v-for="opt in parsedOptions" :key="opt" class="px-3 py-1 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest">{{ opt }}</span>
          </div>
        </div>

        <!-- Order & Placeholder -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div class="space-y-4">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ÖRNEK GİRİŞ (PLACEHOLDER)</label>
              <input
                v-model="modelValue.placeholder"
                type="text"
                class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-600 transition-all text-slate-400"
              >
           </div>
           <div class="space-y-4">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">SIRA NUMARASI</label>
              <input
                v-model.number="modelValue.order"
                type="number"
                class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:ring-2 focus:ring-blue-600 transition-all text-slate-200"
              >
           </div>
        </div>

        <!-- Logic Switches -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800 pt-10">
           <button
            type="button"
            class="flex items-center justify-between p-6 rounded-[2rem] border transition-all"
            :class="modelValue.isRequired ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-slate-950 border-slate-800 text-slate-600'"
            @click="modelValue.isRequired = !modelValue.isRequired"
          >
             <span class="text-[10px] font-black uppercase tracking-widest">ZORUNLU ALAN</span>
             <span class="text-xl">{{ modelValue.isRequired ? '●' : '○' }}</span>
           </button>

           <button
            type="button"
            class="flex items-center justify-between p-6 rounded-[2rem] border transition-all"
            :class="modelValue.isVariant ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-slate-950 border-slate-800 text-slate-600'"
            @click="modelValue.isVariant = !modelValue.isVariant"
          >
             <span class="text-[10px] font-black uppercase tracking-widest">STOK VARYANTI</span>
             <span class="text-xl">{{ modelValue.isVariant ? '●' : '○' }}</span>
           </button>

           <button
            type="button"
            class="flex items-center justify-between p-6 rounded-[2rem] border transition-all"
            :class="modelValue.isFilterable ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-500' : 'bg-slate-950 border-slate-800 text-slate-600'"
            @click="modelValue.isFilterable = !modelValue.isFilterable"
          >
             <span class="text-[10px] font-black uppercase tracking-widest">FİLTRELENEBİLİR</span>
             <span class="text-xl">{{ modelValue.isFilterable ? '●' : '○' }}</span>
           </button>

           <button
            type="button"
            class="flex items-center justify-between p-6 rounded-[2rem] border transition-all"
            :class="modelValue.isActive ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-slate-950 border-slate-800 text-slate-600'"
            @click="modelValue.isActive = !modelValue.isActive"
          >
             <span class="text-[10px] font-black uppercase tracking-widest">AKTİF DURUM</span>
             <span class="text-xl">{{ modelValue.isActive ? '●' : '○' }}</span>
           </button>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="p-10 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md flex justify-end gap-6">
        <button
          class="px-10 py-5 text-slate-500 hover:text-slate-100 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
          @click="$emit('close')"
        >
          İŞLEMİ İPTAL ET
        </button>
        <button
          class="px-14 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-blue-900/20 transition-all hover:scale-105 active:scale-95"
          @click="$emit('save')"
        >
          ÖZELLİĞİ SİSTEME İŞLE
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
  isEditing: boolean
  modelValue: any
  optionsInput: string
  parsedOptions: string[]
}>()

defineEmits(['close', 'save', 'update:optionsInput'])
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
.tracking-tightest { letter-spacing: -0.06em; }
</style>
