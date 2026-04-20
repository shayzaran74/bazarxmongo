<template>
  <div class="animate-in italic">
    <div class="space-y-12">
      <div class="space-y-8">
        <h3 class="text-xl font-black text-gray-900 uppercase italic tracking-tighter">BİLDİRİM TERCİHLERİ</h3>
        <div class="space-y-4">
          <div v-for="(val, key) in [{ id: 'orderUpdates', label: 'SİPARİŞ GÜNCELLEMELERİ', sub: 'TAKİP VE DURUM DEĞİŞİKLİKLERİ' }, { id: 'newProducts', label: 'YENİ ÜRÜN BİLDİRİMLERİ', sub: 'TAKİP ETTİĞİM MAĞAZALAR VE KATEGORİLER' }, { id: 'discounts', label: 'İNDİRİM BİLDİRİMLERİ', sub: 'FLAŞ FIRSATLAR VE ÖZEL KAMPANYALAR' }]" :key="key" class="bg-neutral-50 px-8 py-6 rounded-[2rem] border border-neutral-100 flex items-center justify-between group hover:bg-white hover:shadow-xl hover:border-transparent transition-all shadow-inner">
            <div class="min-w-0 flex-1">
              <p class="text-xs font-black text-gray-900 uppercase tracking-tight">{{ val.label }}</p>
              <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest italic mt-1">{{ val.sub }}</p>
            </div>
            <Switch v-model="settings[val.id]" :class="[settings[val.id] ? 'bg-indigo-600' : 'bg-neutral-200', 'relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-4 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-inner']">
              <span :class="[settings[val.id] ? 'translate-x-6' : 'translate-x-0', 'pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out']" />
            </Switch>
          </div>
        </div>
      </div>
      
      <div class="border-t border-neutral-100 pt-12 space-y-8">
        <h3 class="text-xl font-black text-gray-900 uppercase italic tracking-tighter">DAĞITIM KANALLARI</h3>
        <div class="space-y-4">
          <div v-for="(val, key) in [{ id: 'email', label: 'E-POSTA BİLDİRİMLERİ', sub: 'SAYI SAYI SEÇİLEN KANALLAR' }, { id: 'push', label: 'ANLIK BİLDİRİMLER (PUSH)', sub: 'TARAYICI VE MOBİL BİLDİRİMLERİ' }]" :key="key" class="bg-neutral-50 px-8 py-6 rounded-[2rem] border border-neutral-100 flex items-center justify-between group hover:bg-white hover:shadow-xl hover:border-transparent transition-all shadow-inner">
            <div class="min-w-0 flex-1">
              <p class="text-xs font-black text-gray-900 uppercase tracking-tight">{{ val.label }}</p>
              <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest italic mt-1">{{ val.sub }}</p>
            </div>
            <Switch v-model="settings[val.id]" :class="[settings[val.id] ? 'bg-indigo-600' : 'bg-neutral-200', 'relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-4 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-inner']">
              <span :class="[settings[val.id] ? 'translate-x-6' : 'translate-x-0', 'pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out']" />
            </Switch>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Switch } from '@headlessui/vue'
defineProps({ settings: Object })
</script>
