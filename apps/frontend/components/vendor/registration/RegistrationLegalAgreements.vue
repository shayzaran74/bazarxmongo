<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
    <h2 class="text-xl font-black text-neutral-900 border-b pb-4 italic uppercase tracking-widest">
      ⚖️ Hukuki Metinler & Onaylar
    </h2>

    <div class="space-y-4">
      <div v-for="doc in legalDocs" :key="doc.slug" class="border-2 border-neutral-100 rounded-2xl overflow-hidden group">
        <button
          class="w-full flex items-center justify-between p-5 bg-neutral-50 hover:bg-neutral-100 transition-all font-black text-[10px] text-neutral-700 uppercase tracking-widest italic"
          @click="$emit('toggle-doc', doc.slug)"
        >
          <span>{{ doc.title }}</span>
          <span class="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
            {{ activeDoc === doc.slug ? '−' : '+' }}
          </span>
        </button>
        <div v-show="activeDoc === doc.slug" class="p-6 text-[10px] font-bold text-neutral-500 bg-white max-h-60 overflow-y-auto border-t-2 border-neutral-50 space-y-2 whitespace-pre-wrap italic uppercase leading-relaxed custom-scrollbar">
          {{ doc.content }}
        </div>
      </div>
      <div v-if="legalDocs.length === 0" class="text-center py-8 text-[10px] font-black text-neutral-400 uppercase italic">
        Hukuki metinler yükleniyor...
      </div>
    </div>

    <div class="bg-indigo-50/50 p-8 rounded-[2.5rem] space-y-6 border border-indigo-100 shadow-inner">
      <label class="flex items-start gap-4 cursor-pointer group">
        <div class="mt-1 relative flex items-center justify-center">
          <input v-model="form.agreeTerms" type="checkbox" class="peer w-6 h-6 rounded-lg border-2 border-indigo-200 text-indigo-600 focus:ring-indigo-500 bg-white appearance-none transition-all checked:bg-indigo-600 checked:border-transparent">
          <CheckIcon class="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
        </div>
        <span class="text-[10px] font-black text-indigo-900 leading-relaxed uppercase italic">
          Yukarıdaki aydınlatma metnini, gizlilik politikasını ve satıcı sözleşmesini okudum, anladım ve kabul ediyorum.
        </span>
      </label>
      <label class="flex items-start gap-4 cursor-pointer group">
        <div class="mt-1 relative flex items-center justify-center">
          <input v-model="form.agreeMarketing" type="checkbox" class="peer w-6 h-6 rounded-lg border-2 border-indigo-200 text-indigo-600 focus:ring-indigo-500 bg-white appearance-none transition-all checked:bg-indigo-600 checked:border-transparent">
          <CheckIcon class="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
        </div>
        <span class="text-[10px] font-black text-indigo-900 leading-relaxed uppercase italic">
          Ticari Elektronik İleti Bilgilendirme Metni kapsamında tarafıma pazarlama iletileri gönderilmesine onay veriyorum.
        </span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { CheckIcon } from '@heroicons/vue/24/outline'
defineProps({ 
  form: Object, 
  legalDocs: Array, 
  activeDoc: String 
})
defineEmits(['toggle-doc'])
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-neutral-200 rounded-full hover:bg-neutral-300; }
</style>
