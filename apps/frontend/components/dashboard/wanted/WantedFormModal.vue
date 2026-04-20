<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-[300]" @close="$emit('close')">
      <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-6">
          <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
            <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-[3.5rem] bg-white p-12 text-left shadow-3xl transition-all border border-neutral-100 italic">
              <div class="flex items-center justify-between mb-10">
                <DialogTitle as="h3" class="text-3xl font-black text-gray-900 uppercase tracking-tightest leading-none">
                  {{ isEditing ? 'İSTEĞİ DÜZENLE' : 'YENİ İHTİYAÇ EKLE' }}
                </DialogTitle>
                <button class="w-14 h-14 bg-neutral-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all shadow-inner flex items-center justify-center text-3xl font-black" @click="$emit('close')">&times;</button>
              </div>

              <form class="space-y-10" @submit.prevent="$emit('submit')">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div class="space-y-3">
                    <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">İŞLEM TÜRÜ *</label>
                    <div class="relative">
                      <select v-model="formData.listingType" required class="w-full bg-neutral-50 border-4 border-transparent rounded-[1.5rem] px-8 py-5 text-gray-900 font-black text-xs focus:bg-white focus:border-indigo-600 transition-all outline-none appearance-none uppercase shadow-inner">
                        <option value="BUY">ARIYORUM (ALIM)</option>
                        <option value="SELL">SAĞLIYORUM (SATIŞ)</option>
                      </select>
                      <div class="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 font-black">▼</div>
                    </div>
                  </div>
                  <div class="space-y-3">
                    <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">TİP *</label>
                    <div class="relative">
                      <select v-model="formData.type" required class="w-full bg-neutral-50 border-4 border-transparent rounded-[1.5rem] px-8 py-5 text-gray-900 font-black text-xs focus:bg-white focus:border-indigo-600 transition-all outline-none appearance-none uppercase shadow-inner">
                        <option value="PRODUCT">ÜRÜN / MALZEME</option>
                        <option value="SERVICE">HİZMET</option>
                      </select>
                      <div class="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 font-black">▼</div>
                    </div>
                  </div>
                </div>

                <div class="space-y-4">
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">KATEGORİ *</label>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <select v-model="mainCat" class="w-full bg-neutral-50 border-4 border-transparent rounded-[1.5rem] px-6 py-5 text-gray-900 font-black text-[10px] focus:bg-white focus:border-indigo-600 transition-all outline-none shadow-inner">
                      <option value="">ANA KATEGORİ SEÇİN</option>
                      <option v-for="cat in mainCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                    </select>
                    <select v-if="subCategories1.length > 0" v-model="subCat1" class="w-full bg-neutral-50 border-4 border-transparent rounded-[1.5rem] px-6 py-5 text-gray-900 font-black text-[10px] focus:bg-white focus:border-indigo-600 transition-all outline-none shadow-inner">
                      <option value="">ALT KATEGORİ SEÇİN</option>
                      <option v-for="cat in subCategories1" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div class="space-y-3">
                    <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">MİN BÜTÇE (₺)</label>
                    <input v-model.number="formData.minPrice" type="number" class="w-full bg-neutral-50 border-4 border-transparent rounded-[1.5rem] px-8 py-5 text-gray-900 font-black text-xs focus:bg-white focus:border-indigo-600 transition-all outline-none shadow-inner" placeholder="0">
                  </div>
                  <div class="space-y-3">
                    <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">MAX BÜTÇE (₺)</label>
                    <input v-model.number="formData.maxPrice" type="number" class="w-full bg-neutral-50 border-4 border-transparent rounded-[1.5rem] px-8 py-5 text-gray-900 font-black text-xs focus:bg-white focus:border-indigo-600 transition-all outline-none shadow-inner" placeholder="100.000">
                  </div>
                </div>

                <div class="space-y-3">
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">ANAHTAR KELİMELER</label>
                  <input v-model="formData.keywordsText" type="text" placeholder="CNC, SİEMENS, 5 EKSEN..." class="w-full bg-neutral-50 border-4 border-transparent rounded-[1.5rem] px-8 py-5 text-gray-900 font-black text-xs focus:bg-white focus:border-indigo-600 transition-all outline-none shadow-inner uppercase tracking-widest">
                  <p class="text-[9px] font-black text-gray-400 mt-2 ml-1 uppercase opacity-60">VİRGÜLLE AYIRIN. ANAHTAR KELİMELER EŞLEŞTİRME KALİTESİNİ ARTIRIR.</p>
                </div>

                <div class="space-y-3">
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">DETAYLI AÇIKLAMA *</label>
                  <textarea v-model="formData.description" rows="4" required class="w-full bg-neutral-50 border-4 border-transparent rounded-[2rem] px-8 py-6 text-gray-900 font-black text-xs focus:bg-white focus:border-indigo-600 transition-all outline-none shadow-inner uppercase resize-none leading-relaxed" placeholder="TAM OLARAK NE ARADIĞINIZI, TEKNİK ÖZELLİKLERİNİ VE BEKLENTİLERİNİZİ YAZIN..." />
                </div>

                <div class="flex gap-6 pt-10">
                  <button type="button" class="flex-1 h-20 bg-neutral-100 text-gray-400 hover:text-gray-900 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all" @click="$emit('close')">VAZGEÇ</button>
                  <button type="submit" :disabled="loading" class="flex-2 h-20 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-100 hover:bg-black transition-all disabled:opacity-50 px-16">
                    {{ loading ? 'KAYDEDİLİYOR...' : (isEditing ? 'GÜNCELLE' : 'OLUŞTUR') }}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'

const props = defineProps({
  isOpen: Boolean,
  isEditing: Boolean,
  loading: Boolean,
  formData: Object,
  categories: Array,
  mainCategory: String,
  subCategory1: String
})
const emit = defineEmits(['close', 'submit', 'update:mainCategory', 'update:subCategory1'])

const mainCat = computed({ get: () => props.mainCategory, set: (v) => emit('update:mainCategory', v) })
const subCat1 = computed({ get: () => props.subCategory1, set: (v) => emit('update:subCategory1', v) })

const mainCategories = computed(() => props.categories.filter(c => !c.parentId))
const subCategories1 = computed(() => {
    if (!props.mainCategory) return []
    return props.categories.filter(c => c.parentId === props.mainCategory)
})
</script>
