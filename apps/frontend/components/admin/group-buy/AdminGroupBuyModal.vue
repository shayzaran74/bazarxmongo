<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-12 font-sans italic"
  >
    <div
      class="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
      @click="$emit('close')"
    />
    <div
      class="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[3.5rem] border border-neutral-100 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col"
    >
      <!-- Header -->
      <div class="p-10 border-b border-neutral-50 flex items-center justify-between bg-white/50 backdrop-blur-md">
        <div>
          <h3 class="text-3xl font-black text-gray-900 uppercase tracking-tightest">
            {{ isEditing ? 'KAMPANYA YAPILANDIRMA' : 'YENİ GRUP ALIMI PROTOKOLÜ' }}
          </h3>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 opacity-60">STRATEJİK SATIŞ VE PAZARLAMA PANELİ</p>
        </div>
        <button
          class="w-12 h-12 flex items-center justify-center rounded-2xl bg-neutral-100 text-gray-400 hover:text-gray-900 hover:bg-neutral-200 transition-all text-3xl font-light"
          @click="$emit('close')"
        >
          &times;
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
        <!-- Product Selection -->
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">HEDEF ÜRÜN MODÜLÜ</label>
            <span v-if="selectedProduct" class="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full">ÜRÜN EŞLEŞTİRİLDİ</span>
          </div>
          
          <div v-if="!selectedProduct" class="relative group">
            <span class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              :value="productSearch"
              type="text"
              placeholder="ÜRÜN İSMİ VEYA SKU İLE SİSTEMİ TARA..."
              class="w-full bg-neutral-50 border border-neutral-100 rounded-3xl pl-14 pr-6 py-6 text-sm font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              @input="$emit('update:productSearch', ($event.target as HTMLInputElement).value)"
            >
            <!-- Dropdown -->
            <div
              v-if="searchResults.length > 0"
              class="absolute z-50 w-full mt-4 bg-white border border-neutral-100 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
               <button
                v-for="p in searchResults"
                :key="p.id"
                class="w-full flex items-center gap-6 p-6 hover:bg-neutral-50 transition-all text-left border-b border-neutral-50 last:border-0"
                @click="$emit('select-product', p)"
              >
                <img :src="p.image" class="w-16 h-16 rounded-2xl object-cover shadow-inner">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-gray-900 truncate uppercase tracking-tight">{{ p.name }}</p>
                  <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">₺{{ p.price }} • SKU: {{ p.sku }}</p>
                </div>
                <span class="text-[10px] font-black text-blue-600 uppercase tracking-widest">SEÇ →</span>
              </button>
            </div>
          </div>

          <div v-else class="bg-gray-900 rounded-[2.5rem] p-8 flex items-center justify-between border border-gray-800 shadow-2xl">
             <div class="flex items-center gap-6 text-left">
                <img :src="selectedProduct.image" class="w-20 h-20 rounded-[1.5rem] object-cover ring-4 ring-gray-800">
                <div class="space-y-1">
                   <h4 class="text-xl font-black text-white uppercase tracking-tight leading-none">{{ selectedProduct.name }}</h4>
                   <p class="text-[10px] font-black text-blue-400 uppercase tracking-widest italic">MEVCUT BAZ FİYAT: ₺{{ selectedProduct.price }}</p>
                </div>
             </div>
             <button
              class="px-8 py-4 bg-white/5 hover:bg-white/10 text-[9px] font-black text-white uppercase tracking-widest rounded-xl border border-white/10 transition-all active:scale-95"
              @click="$emit('change-product')"
             >
               DEĞİŞTİR
             </button>
          </div>
        </div>

        <!-- Meta Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div class="space-y-4">
            <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">KAMPANYA BAŞLIĞI</label>
            <input
              v-model="modelValue.title"
              type="text"
              class="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-6 py-5 text-sm font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-600 transition-all text-gray-900"
            >
          </div>
          <div class="space-y-4">
            <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">OTURUM DURUMU</label>
            <select
              v-model="modelValue.isActive"
              class="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-6 py-5 text-sm font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-600 transition-all appearance-none"
            >
              <option :value="true">● AKTİF</option>
              <option :value="false">○ PASİF</option>
            </select>
          </div>
        </div>

        <!-- Dates -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div class="space-y-4">
            <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">BAŞLANGIÇ PROTOKOLÜ</label>
            <input
              v-model="modelValue.startDate"
              type="datetime-local"
              class="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-6 py-5 text-sm font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-600 transition-all text-gray-900"
            >
          </div>
          <div class="space-y-4">
            <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">BİTİŞ PROTOKOLÜ</label>
            <input
              v-model="modelValue.endDate"
              type="datetime-local"
              class="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-6 py-5 text-sm font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-600 transition-all text-gray-900"
            >
          </div>
        </div>

        <!-- Tiers Engine -->
        <div class="space-y-8 bg-neutral-50/50 p-10 rounded-[3rem] border border-neutral-100">
           <div class="flex items-center justify-between">
              <h4 class="text-[10px] font-black text-gray-900 uppercase tracking-[0.3em]">İNDİRİM KADEMELERİ (VOLÜM STRATEJİSİ)</h4>
              <button
                class="text-[9px] font-black text-blue-600 uppercase tracking-widest border-b-2 border-blue-600 pb-1 hover:text-blue-500 hover:border-blue-500 transition-all"
                @click="$emit('add-tier')"
              >
                + YENİ KADEME EKLE
              </button>
           </div>
           
           <div class="space-y-4">
              <div
                v-for="(tier, index) in modelValue.tiers"
                :key="index"
                class="flex flex-col md:flex-row items-center gap-6 bg-white p-6 rounded-[2rem] border border-neutral-100 shadow-sm transition-all hover:shadow-md"
              >
                <div class="flex-1 space-y-2">
                   <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">MİN. ADET</p>
                   <input
                    v-model.number="tier.minQuantity"
                    type="number"
                    class="w-full bg-neutral-50 rounded-xl px-5 py-3 text-sm font-black outline-none border border-neutral-100 focus:border-blue-500"
                  >
                </div>
                <div class="flex-1 space-y-2">
                   <p class="text-[8px] font-black text-blue-500 uppercase tracking-widest ml-1">BİRİM FİYAT (₺)</p>
                   <input
                    v-model.number="tier.price"
                    type="number"
                    step="0.01"
                    class="w-full bg-neutral-50 rounded-xl px-5 py-3 text-sm font-black outline-none border border-neutral-100 focus:border-blue-500 text-blue-600"
                  >
                </div>
                <button
                  class="w-12 h-12 flex items-center justify-center rounded-xl bg-neutral-50 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all mt-4 md:mt-6"
                  @click="$emit('remove-tier', index)"
                >
                  &times;
                </button>
              </div>
           </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="p-10 border-t border-neutral-50 bg-white/80 backdrop-blur-md flex justify-end gap-6 sticky bottom-0 z-20">
        <button
          class="px-10 py-5 text-gray-400 hover:text-gray-900 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
          @click="$emit('close')"
        >
          VAZGEÇ
        </button>
        <button
          :disabled="saving"
          class="px-14 py-5 bg-gray-900 hover:bg-black text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
          @click="$emit('save')"
        >
          KAMPANYAYI AKTİF ET
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
  isEditing: boolean
  saving: boolean
  modelValue: any
  productSearch: string
  searchResults: any[]
  selectedProduct: any | null
}>()

defineEmits(['close', 'save', 'update:productSearch', 'select-product', 'change-product', 'add-tier', 'remove-tier'])
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
.tracking-tightest { letter-spacing: -0.06em; }
</style>
