<template>
  <div class="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 overflow-hidden backdrop-blur-sm shadow-2xl font-sans italic">
    <div class="p-8 border-b border-slate-800 bg-slate-800/10 flex flex-col md:flex-row items-center justify-between gap-6">
      <div>
        <h2 class="text-2xl font-black text-slate-200 uppercase tracking-tightest">MAKALELER</h2>
        <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">YARDIM MERKEZİ İÇERİK HAVUZU</p>
      </div>
      <div class="relative max-w-sm w-full">
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
        <input
          :value="searchQuery"
          type="text"
          placeholder="İÇERİKLERDE ARA..."
          class="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-700"
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        >
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-800/20 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-800">
            <th class="px-8 py-6">BAŞLIK / SLUG</th>
            <th class="px-8 py-6">KATEGORİ</th>
            <th class="px-8 py-6 text-center">DURUM</th>
            <th class="px-8 py-6 text-center">İSTATİSTİK</th>
            <th class="px-8 py-6 text-right">İŞLEMLER</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/50">
          <tr
            v-for="article in articles"
            :key="article.id"
            class="hover:bg-slate-800/30 transition-all group"
          >
            <td class="px-8 py-6">
              <div class="font-black text-slate-200 text-lg leading-tight uppercase">
                {{ article.title }}
              </div>
              <div class="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-50">
                /{{ article.slug }}
              </div>
            </td>
            <td class="px-8 py-6">
              <span class="px-4 py-1.5 bg-slate-950 border border-slate-800 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-wider">
                {{ article.category?.name || 'BELİRSİZ' }}
              </span>
            </td>
            <td class="px-8 py-6 text-center">
              <span
                :class="getStatusClass(article.status)"
                class="px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg"
              >
                {{ article.status }}
              </span>
            </td>
            <td class="px-8 py-6">
              <div class="flex items-center justify-center gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <span class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-blue-500" />
                  {{ article.viewCount }}
                </span>
                <span class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-green-500" />
                  {{ article.upvotes }}
                </span>
              </div>
            </td>
            <td class="px-8 py-6 text-right">
              <div class="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                <button
                  class="p-3 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-xl transition-all shadow-xl"
                  @click="$emit('edit', article)"
                >
                  <span class="text-xs uppercase font-black">DÜZENLE</span>
                </button>
                <button
                  class="p-3 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-xl transition-all shadow-xl"
                  @click="$emit('delete', article.id)"
                >
                  <span class="text-xs uppercase font-black">SİL</span>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="articles.length === 0">
            <td
              colspan="5"
              class="px-8 py-20 text-center text-slate-600 font-black uppercase tracking-[0.3em] text-xs"
            >
              MAKALE BULUNAMADI.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  articles: any[]
  searchQuery: string
}>()

defineEmits(['update:searchQuery', 'edit', 'delete'])

const getStatusClass = (status: string) => {
  switch (status) {
    case 'PUBLISHED': return 'bg-green-500/10 text-green-400 border border-green-500/20'
    case 'DRAFT': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
    case 'ARCHIVED': return 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
    default: return 'bg-slate-800 text-slate-400'
  }
}
</script>
