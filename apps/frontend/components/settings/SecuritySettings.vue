<template>
  <div class="animate-in italic">
    <div class="space-y-12">
      <div>
        <h3 class="text-xl font-black text-gray-900 mb-8 uppercase italic tracking-tighter">ŞİFRE DEĞİŞTİR</h3>
        <form class="space-y-6 max-w-lg" @submit.prevent="$emit('change-password')">
          <div class="space-y-2">
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest italic ml-1">MEVCUT ŞİFRE</label>
            <input v-model="form.currentPassword" type="password" required class="w-full bg-neutral-50 px-6 py-5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none font-black text-xs shadow-inner">
          </div>
          
          <div class="space-y-2">
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest italic ml-1">YENİ ŞİFRE</label>
            <input v-model="form.newPassword" type="password" required class="w-full bg-neutral-50 px-6 py-5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none font-black text-xs shadow-inner">
          </div>
          
          <div class="space-y-2">
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest italic ml-1">YENİ ŞİFRE (TEKRAR)</label>
            <input v-model="form.confirmPassword" type="password" required class="w-full bg-neutral-50 px-6 py-5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none font-black text-xs shadow-inner">
          </div>
          
          <button type="submit" :disabled="loading" class="w-full md:w-auto px-14 h-16 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-gray-200 italic disabled:opacity-30">
            {{ loading ? 'DEĞİŞTİRİLİYOR...' : 'ŞİFREYİ GÜNCELLE' }}
          </button>
        </form>
      </div>
      
      <div class="border-t border-neutral-100 pt-12">
        <h3 class="text-xl font-black text-gray-900 mb-8 uppercase italic tracking-tighter">AKTİF OTURUMLAR</h3>
        <div class="bg-neutral-50 rounded-3xl p-8 border border-neutral-100 shadow-inner flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all">
          <div class="flex items-center gap-6">
            <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">💻</div>
            <div>
              <p class="text-sm font-black text-gray-900 uppercase">BU CİHAZ (MACBOOK PRO)</p>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest italic mt-1">İSTANBUL, TÜRKİYE • SON AKTİVİTE: ŞİMDİ</p>
            </div>
          </div>
          <span class="px-6 py-2 bg-green-50 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-100">AKTİF</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ form: Object, loading: Boolean })
defineEmits(['change-password'])
</script>
