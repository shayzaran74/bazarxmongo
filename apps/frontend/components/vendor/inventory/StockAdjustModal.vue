<template>
  <div v-if="isOpen" class="fixed inset-0 z-[200] flex items-center justify-center p-6 italic">
    <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" @click="$emit('close')" />
    
    <div class="relative w-full max-w-lg bg-white rounded-[4rem] shadow-3xl flex flex-col overflow-hidden animate-in border border-neutral-100">
      <div class="p-10 border-b border-neutral-100 flex items-center justify-between">
        <h3 class="text-2xl font-black text-gray-900 uppercase tracking-tightest italic leading-none">STOK DÜZELTME</h3>
        <button class="w-12 h-12 bg-neutral-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all shadow-inner flex items-center justify-center text-2xl font-black" @click="$emit('close')">&times;</button>
      </div>

      <div class="p-10 space-y-10">
        <div class="flex items-center gap-6 p-6 bg-neutral-50 rounded-[2.5rem] border border-neutral-100 shadow-inner">
          <img :src="resolveImageUrl(product?.image)" :alt="product?.name" class="w-16 h-16 rounded-2xl object-cover shadow-sm bg-white p-1">
          <div>
            <div class="text-sm font-black text-gray-900 uppercase tracking-tight">{{ product?.name }}</div>
            <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 italic">MEVCUT STOK: <span class="text-indigo-600 ml-1">{{ product?.stock }}</span></div>
          </div>
        </div>

        <div class="space-y-8">
          <div class="space-y-3">
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">DÜZELTME MİKTARI</label>
            <div class="relative group">
              <input v-model.number="stockChange" type="number" placeholder="+10 VEYA -5" class="w-full bg-neutral-50 px-8 py-5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none font-black text-xl shadow-inner">
              <span class="absolute right-8 top-1/2 -translate-y-1/2 text-gray-300 font-black text-xs uppercase italic">ADET</span>
            </div>
            <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mt-2 ml-1 italic opacity-60">STOK EKLEMEK İÇİN (+), ÇIKARMAK İÇİN (-) GİRİN.</p>
          </div>

          <div class="space-y-3">
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">DÜZELTME NEDENİ</label>
            <div class="relative group">
              <select v-model="reason" class="w-full bg-neutral-50 px-8 py-5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none font-black text-xs shadow-inner appearance-none uppercase">
                <option v-for="r in reasonOptions" :key="r.v" :value="r.v">{{ r.t }}</option>
              </select>
              <div class="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 font-black">▼</div>
            </div>
          </div>
        </div>
      </div>

      <div class="p-10 bg-neutral-50/50 border-t border-neutral-100 flex gap-4">
        <button class="flex-1 h-16 bg-white border border-neutral-200 text-gray-400 hover:text-gray-900 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm" @click="$emit('close')">İPTAL</button>
        <button :disabled="!stockChange || stockChange === 0" class="flex-2 h-16 bg-indigo-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-indigo-100 disabled:opacity-30 px-12" @click="$emit('save')">DEĞİŞİKLİĞİ KAYDET</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ isOpen: Boolean, product: Object, stockChange: Number, reason: String })
const emit = defineEmits(['close', 'save', 'update:stockChange', 'update:reason'])

const { resolveImageUrl } = useAppImage()

const reasonOptions = [
  { v: 'MANUAL_ADJUSTMENT', t: 'MANUEL DÜZELTME' },
  { v: 'DAMAGE', t: 'HASARLI ÜRÜN / FİRE' },
  { v: 'RETURN', t: 'MÜŞTERİ İADESİ' },
  { v: 'OTHER_SALE', t: 'DİĞER PLATFORM SATIŞI' },
  { v: 'LOST', t: 'KAYIP STOK' },
  { v: 'FOUND', t: 'BULUNAN STOK' }
]

const stockChange = computed({ get: () => props.stockChange, set: (v) => emit('update:stockChange', v) })
const reason = computed({ get: () => props.reason, set: (v) => emit('update:reason', v) })
</script>
