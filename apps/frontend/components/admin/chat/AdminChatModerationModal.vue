<template>
  <div
    v-if="isOpen"
    class="absolute inset-0 z-50 flex items-center justify-center p-8 bg-slate-950/80 backdrop-blur-xl font-sans italic"
  >
    <div
      class="bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-slate-800 overflow-hidden animate-in zoom-in duration-300"
    >
      <!-- Modal Header -->
      <div class="px-10 py-8 border-b border-white/5 bg-slate-950/50">
        <h3 class="text-2xl font-black text-slate-100 uppercase tracking-tightest">
          {{ type === 'system' ? 'SİSTEM PROTOKOLÜ GÖNDER' :
             type === 'warning' ? 'DİSİPLİN UYARISI' :
             type === 'freeze' ? 'SOHBETİ DONDUR' : 'SOHBETİ AKTİF ET' }}
        </h3>
      </div>

      <div class="p-10 space-y-8">
        <!-- System Content -->
        <div v-if="type === 'system'" class="space-y-3">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">MESAJ İÇERİĞİ</label>
          <textarea
            :value="modelValue.content"
            rows="5"
            class="w-full bg-slate-950 border border-slate-800 rounded-3xl px-6 py-5 text-xs font-medium text-slate-200 outline-none focus:ring-2 focus:ring-blue-600/50 transition-all resize-none placeholder:text-slate-700"
            placeholder="Kullanıcılara iletilecek sistem mesajı..."
            @input="$emit('update:modelValue', { ...modelValue, content: ($event.target as HTMLTextAreaElement).value })"
          />
        </div>

        <!-- Reason Selection -->
        <div v-if="type === 'warning' || type === 'freeze'" class="space-y-3">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">İHLAL SEBEBİ</label>
          <div class="grid grid-cols-1 gap-2">
            <button
              v-for="reason in [
                { id: 'argo_kufur', label: 'ARGO / KÜFÜRLÜ ÜSLUP' },
                { id: 'platform_disi', label: 'PLATFORM DIŞI İŞLEM' },
                { id: 'guvenlik_riski', label: 'GÜVENLİK RİSKİ' },
                { id: 'diger', label: 'DİĞER' }
              ]"
              :key="reason.id"
              type="button"
              :class="[
                'text-left px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border',
                modelValue.reason === reason.id 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg' 
                  : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
              ]"
              @click="$emit('update:modelValue', { ...modelValue, reason: reason.id })"
            >
              {{ reason.label }}
            </button>
          </div>
        </div>

        <!-- Note -->
        <div v-if="type !== 'system'" class="space-y-3">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">YÖNETİCİ NOTU</label>
          <textarea
            :value="modelValue.note"
            rows="3"
            class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs font-medium text-slate-200 outline-none focus:ring-2 focus:ring-blue-600/50 transition-all resize-none"
            placeholder="Dahili kullanım için not..."
            @input="$emit('update:modelValue', { ...modelValue, note: ($event.target as HTMLTextAreaElement).value })"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="px-10 py-8 bg-slate-950/50 border-t border-white/5 flex gap-4">
        <button
          class="flex-1 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-100 transition-all"
          @click="$emit('close')"
        >
          İPTAL
        </button>
        <button
          :disabled="!isValid"
          class="flex-[2] py-4 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-20 disabled:grayscale"
          :class="{
            'bg-blue-600 shadow-blue-900/40': type === 'system',
            'bg-amber-600 shadow-amber-900/40': type === 'warning',
            'bg-red-600 shadow-red-900/40': type === 'freeze',
            'bg-emerald-600 shadow-emerald-900/40': type === 'unfreeze'
          }"
          @click="$emit('submit')"
        >
          {{ type === 'unfreeze' ? 'PROTOKOLÜ AKTİF ET' : 'İŞLEMİ ONAYLA' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
  type: string | null
  modelValue: any
  isValid: boolean
}>()

defineEmits(['update:modelValue', 'close', 'submit'])
</script>

<style scoped>
.tracking-tightest { letter-spacing: -0.06em; }
</style>
