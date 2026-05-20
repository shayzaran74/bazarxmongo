<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-[100]" @close="$emit('close')">
      <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-md" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
            <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-[3rem] bg-white p-12 text-left align-middle shadow-2xl transition-all border border-gray-100">
              <DialogTitle as="h3" class="text-2xl font-black text-gray-900 mb-10 italic uppercase tracking-tighter flex justify-between items-center">
                <span>XP Dağıtım Kuralı</span>
                <button class="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors shadow-inner" @click="$emit('close')">✕</button>
              </DialogTitle>

              <div class="space-y-6">
                <div class="space-y-2">
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest italic ml-1">KURAL ADI</label>
                  <input v-model="form.name" type="text" class="input-premium" placeholder="ÖRN: ANTALYA ÖZEL">
                </div>
                <div class="space-y-2">
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest italic ml-1">ŞEHİR (OPSİYONEL)</label>
                  <input v-model="form.city" type="text" placeholder="ÖRN: ANTALYA" class="input-premium">
                </div>
                <div class="space-y-2">
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest italic ml-1">SATICI SEVİYESİ</label>
                  <select v-model="form.tier" class="input-premium appearance-none">
                    <option value="">TÜMÜ</option>
                    <option value="CORE">CORE</option>
                    <option value="PRIME">PRIME</option>
                    <option value="ELITE">ELITE</option>
                    <option value="APEX">APEX</option>
                  </select>
                </div>
                <div class="grid grid-cols-3 gap-4">
                  <div class="space-y-2">
                    <label class="block text-[8px] font-black text-gray-400 uppercase tracking-widest italic">KOMİSYON %</label>
                    <input v-model.number="form.commissionPct" type="number" class="input-premium text-center">
                  </div>
                  <div class="space-y-2">
                    <label class="block text-[8px] font-black text-gray-400 uppercase tracking-widest italic">REKLAM %</label>
                    <input v-model.number="form.adPct" type="number" class="input-premium text-center">
                  </div>
                  <div class="space-y-2">
                    <label class="block text-[8px] font-black text-gray-400 uppercase tracking-widest italic">HİZMET %</label>
                    <input v-model.number="form.servicePct" type="number" class="input-premium text-center">
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest italic ml-1">ÖNCELİK</label>
                  <input v-model.number="form.priority" type="number" class="input-premium">
                </div>
                <label class="flex items-center gap-4 cursor-pointer group py-2">
                  <input v-model="form.isActive" type="checkbox" class="w-6 h-6 rounded-lg bg-gray-100 border-2 border-transparent checked:bg-indigo-600 transition-all appearance-none cursor-pointer">
                  <span class="text-[10px] font-black text-gray-600 uppercase tracking-widest italic">AKTİF KURAL</span>
                </label>
                
                <div v-if="pctTotal !== 100" class="p-4 bg-red-50 rounded-2xl border border-red-100 text-[10px] font-black text-red-600 uppercase tracking-widest italic shadow-inner">
                  Yüzdelerin toplamı 100 olmalıdır! (GİRİLEN: {{ pctTotal }})
                </div>
              </div>

              <div class="mt-12 flex justify-end gap-3 italic uppercase font-black text-[10px] tracking-widest">
                <button class="px-10 py-5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-2xl transition-all" @click="$emit('close')">VAZGEÇ</button>
                <button :disabled="pctTotal !== 100 || loading" class="px-12 py-5 bg-gray-900 text-white rounded-2xl shadow-2xl shadow-gray-200 hover:bg-black transition-all disabled:opacity-30" @click="$emit('save')">
                  {{ loading ? 'KAYDEDİLİYOR...' : 'KAYDET' }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
defineProps({ isOpen: Boolean, form: Object, pctTotal: Number, loading: Boolean })
defineEmits(['close', 'save'])
</script>

<style scoped>
.input-premium {
  @apply w-full px-5 py-4 rounded-2xl border-2 border-transparent bg-neutral-50/50 focus:bg-white focus:border-indigo-600 transition-all outline-none text-xs font-black uppercase italic placeholder-neutral-300 shadow-inner;
}
</style>
