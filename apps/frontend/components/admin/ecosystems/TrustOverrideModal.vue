<template>
  <div v-if="isOpen" class="fixed inset-0 z-[150] flex items-center justify-center p-6 italic">
    <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-md" @click="$emit('close')" />
    <div class="relative w-full max-w-xl transform overflow-hidden rounded-[4rem] bg-white p-12 text-left shadow-3xl transition-all border border-neutral-100">
      <div class="text-center space-y-4 mb-10">
        <h3 class="text-3xl font-black text-gray-900 tracking-tightest uppercase italic leading-none">TRUSTSCORE <span class="text-indigo-600">OVERRIDE</span></h3>
        <p class="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-relaxed opacity-70">{{ member?.businessName }} İÇİN MANUEL GÜVEN PUANI MÜDAHALESİ PROTOKOLÜ.</p>
      </div>

      <div class="space-y-8">
        <div class="space-y-3">
          <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">YENİ SKOR (0-100)</label>
          <input v-model="localScore" type="number" min="0" max="100" class="w-full bg-neutral-50 border-4 border-transparent rounded-[2rem] px-8 py-5 text-gray-900 font-black text-2xl focus:bg-white focus:border-indigo-600 transition-all outline-none shadow-inner italic">
        </div>
        <div class="space-y-3">
          <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">GEREKÇE / ANALİZ</label>
          <textarea v-model="localReason" rows="4" class="w-full bg-neutral-50 border-4 border-transparent rounded-[2.5rem] px-8 py-6 text-gray-900 font-black text-sm focus:bg-white focus:border-indigo-600 transition-all outline-none shadow-inner resize-none leading-relaxed italic uppercase" placeholder="DEĞİŞİKLİK SEBEBİNİ AYRINTILI OLARAK BELİRTİN..."></textarea>
          <p class="text-[9px] font-black text-rose-400 mt-2 ml-2 uppercase opacity-60">BU İŞLEM WATCHTOWER AUDIT LOGLARINA KALICI OLARAK İŞLENECEKTİR.</p>
        </div>
      </div>

      <div class="mt-12 flex gap-6">
        <button class="flex-1 h-20 bg-neutral-100 text-gray-400 hover:text-black rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all italic active:scale-95" @click="$emit('close')">İPTAL PROTOKOLÜ</button>
        <button :disabled="loading" class="flex-2 h-20 bg-indigo-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-indigo-100 hover:bg-black transition-all active:scale-95 flex items-center justify-center italic" @click="$emit('submit', { score: localScore, reason: localReason })">
           {{ loading ? 'KAYDEDİLİYOR...' : 'SKORU GÜNCELLE' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ isOpen: Boolean, member: Object, score: Number, reason: String, loading: Boolean })
const emit = defineEmits(['close', 'submit'])

const localScore = ref(props.score)
const localReason = ref(props.reason)

watch(() => props.isOpen, (val) => { if(val) { localScore.value = props.score; localReason.value = ''; } })
</script>

<style scoped>
.flex-2 { flex: 1.8; }
</style>
