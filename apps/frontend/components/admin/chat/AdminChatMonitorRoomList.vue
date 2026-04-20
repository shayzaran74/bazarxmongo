<template>
  <div class="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-full font-sans italic">
    <!-- Search Bar -->
    <div class="p-6 border-b border-slate-800/50 bg-slate-800/10">
      <div class="relative">
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
        <input
          :value="searchInput"
          type="text"
          placeholder="FİRMA VEYA KULLANICI ARA..."
          class="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-700"
          @input="$emit('update:searchInput', ($event.target as HTMLInputElement).value)"
        >
      </div>
    </div>

    <!-- Room List -->
    <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
      <!-- Loading State -->
      <div v-if="loading" class="p-12 text-center space-y-4">
        <div class="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto" />
        <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest">SİSTEM TARANIYOR...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="rooms.length === 0" class="p-12 text-center space-y-4">
        <div class="text-4xl opacity-20">📡</div>
        <p class="text-[9px] font-black text-slate-600 uppercase tracking-widest">AKTİF SİNYAL BULUNAMADI.</p>
      </div>

      <!-- Rooms -->
      <button
        v-for="room in rooms"
        :key="room.id"
        class="w-full text-left p-6 rounded-[1.8rem] transition-all relative overflow-hidden group border border-transparent"
        :class="activeRoomId === room.id ? 'bg-blue-600 shadow-[0_15px_40px_rgba(37,99,235,0.2)] border-blue-400/30' : 'hover:bg-slate-800/50'"
        @click="$emit('select', room)"
      >
        <!-- Hot Pulse Indicator -->
        <div
          v-if="room.isHot"
          class="absolute top-4 right-6 flex items-center gap-2"
        >
           <span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
           <span class="text-[8px] font-black text-orange-500 tracking-widest uppercase">HOT</span>
        </div>

        <div class="flex items-start gap-4">
          <!-- Risk Icon -->
          <div class="mt-1">
            <span v-if="room.hasRiskyContent" class="text-red-500 shadow-xl">🚨</span>
            <span v-else class="text-slate-600 group-hover:text-slate-400">💬</span>
          </div>

          <div class="flex-1 min-w-0 space-y-1">
            <div class="flex items-center gap-2">
               <h4 class="text-xs font-black text-slate-200 truncate uppercase tracking-tight" :class="activeRoomId === room.id ? 'text-white' : ''">
                 {{ room.tradeOffer.fromCompany.name }}
               </h4>
               <span class="text-[8px] text-slate-600 font-black">VS</span>
               <h4 class="text-xs font-black text-slate-200 truncate uppercase tracking-tight" :class="activeRoomId === room.id ? 'text-white' : ''">
                 {{ room.tradeOffer.toCompany.name }}
               </h4>
            </div>

            <p class="text-[10px] text-slate-500 truncate font-semibold" :class="activeRoomId === room.id ? 'text-blue-100' : ''">
              {{ room.lastMessage ? room.lastMessage.content : 'İLETİŞİM BAŞLATILMADI' }}
            </p>

            <div class="flex items-center gap-3 mt-3">
              <span class="text-[8px] font-black tracking-widest uppercase" :class="activeRoomId === room.id ? 'text-white/60' : 'text-slate-600'">
                {{ room.lastMessage ? formatTime(room.lastMessage.createdAt) : formatTime(room.createdAt) }}
              </span>
              <span
                v-if="room.riskScore > 0"
                class="px-2 py-0.5 rounded-md text-[8px] font-black tracking-widest"
                :class="room.riskScore > 50 ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'"
              >
                LEVEL {{ room.riskScore }}
              </span>
               <span
                  v-if="room.tradeOffer.status === 'disputed'"
                  class="text-[8px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded-md font-black uppercase tracking-widest"
                >
                  DISPUTED
                </span>
            </div>
          </div>
        </div>
      </button>
    </div>

    <!-- Pagination -->
    <div
      v-if="pagination.totalPages > 1"
      class="p-6 border-t border-slate-800/50 bg-slate-950 flex items-center justify-between"
    >
      <button
        :disabled="pagination.page <= 1"
        class="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-200 disabled:opacity-20 transition-all"
        @click="$emit('paginate', pagination.page - 1)"
      >
        ← PREV
      </button>
      <span class="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">{{ pagination.page }} / {{ pagination.totalPages }}</span>
      <button
        :disabled="pagination.page >= pagination.totalPages"
        class="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-200 disabled:opacity-20 transition-all"
        @click="$emit('paginate', pagination.page + 1)"
      >
        NEXT →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  rooms: any[]
  loading: boolean
  activeRoomId: string | null
  pagination: any
  searchInput: string
  formatTime: (date: string) => string
}>()

defineEmits(['update:searchInput', 'select', 'paginate'])
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
</style>
