<template>
  <div
    ref="container"
    class="flex-1 p-6 overflow-y-auto bg-slate-950 space-y-4 scrollbar-thin font-sans italic"
  >
    <!-- Pagination Status -->
    <div
      v-if="messagesLoading"
      class="flex h-full items-center justify-center space-y-4 flex-col text-slate-500"
    >
      <div class="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      <p class="text-[9px] font-black uppercase tracking-widest">SİNYAL ALINIYOR...</p>
    </div>

    <!-- Load More -->
    <div
      v-if="!messagesLoading && messages.length >= 50 && hasMore"
      class="flex justify-center pb-8 border-b border-slate-900 mb-8"
    >
      <button
        :disabled="loadingMore"
        class="text-[9px] font-black text-slate-600 hover:text-blue-400 bg-slate-900/50 px-6 py-2 rounded-full border border-slate-800 transition-all disabled:opacity-30 uppercase tracking-[0.2em]"
        @click="$emit('load-more')"
      >
        {{ loadingMore ? 'YÜKLENİYOR...' : 'GEÇMİŞ DATA PAKETLERİNİ YÜKLE' }}
      </button>
    </div>

    <div
      v-else-if="!hasMore && messages.length > 0"
      class="text-center pb-8 opacity-20"
    >
      <div class="h-px bg-gradient-to-r from-transparent via-slate-500 to-transparent mb-4" />
      <span class="text-[8px] font-black uppercase tracking-[0.5em]">PROTOKOL BAŞLANGICI</span>
    </div>

    <!-- Messages Loop -->
    <div
      v-for="(msg, index) in messages"
      :key="msg.id"
    >
      <!-- Date Separator -->
      <div
        v-if="shouldShowSeparator(msg, index)"
        class="flex justify-center my-8"
      >
        <span
          class="bg-slate-900 text-slate-500 text-[8px] px-4 py-1.5 rounded-full font-black uppercase tracking-[0.4em] border border-slate-800"
        >
          {{ formatDate(msg.createdAt) }}
        </span>
      </div>

      <!-- Message Content -->
      <div
        :class="[
          'flex flex-col max-w-[85%] space-y-2',
          isSystem(msg) ? 'mx-auto items-center' : (msg.senderId === room.userBId ? 'ml-auto items-end' : 'items-start')
        ]"
      >
        <!-- Sender Name (if not system) -->
        <div v-if="!isSystem(msg)" class="flex items-center gap-2 px-2">
           <span :class="['text-[8px] font-black uppercase tracking-widest', msg.senderId === room.userAId ? 'text-blue-500' : 'text-emerald-500']">
             {{ getLabel(msg) }}
           </span>
           <span class="text-[8px] font-bold text-slate-800">{{ formatTime(msg.createdAt) }}</span>
        </div>

        <!-- System Message -->
        <div
          v-if="isSystem(msg)"
          class="px-6 py-3 rounded-2xl text-[10px] text-center border shadow-2xl backdrop-blur-md"
          :class="getStyle(msg)"
        >
           <div class="flex items-center justify-center gap-2 mb-1">
             <span class="w-1 h-3 bg-current opacity-30 rounded-full" />
             <span class="font-black tracking-widest uppercase">{{ getLabel(msg) }}</span>
           </div>
           <p class="font-medium text-slate-300 leading-relaxed">{{ msg.content }}</p>
        </div>

        <!-- Normal Message (Bubble) -->
        <div
          v-else
          class="px-5 py-4 rounded-[1.5rem] text-[11px] font-medium border shadow-xl relative group transition-all duration-300 hover:shadow-2xl"
          :class="[
            getStyle(msg),
            msg.senderId === room.userAId ? 'rounded-tl-none border-blue-500/20' : 'rounded-tr-none border-emerald-500/20'
          ]"
        >
          <div class="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem]" />
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div class="relative z-10 leading-relaxed" v-html="highlight(msg.content)" />
          
          <div class="flex items-center justify-end gap-1 mt-2 opacity-30 text-[8px]">
             <span>{{ formatTime(msg.createdAt) }}</span>
             <span v-if="msg.readAt" class="text-blue-500">✓✓</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Typing Indicator -->
    <div
      v-if="typing"
      class="flex items-center gap-4 text-[9px] text-slate-600 px-6 py-4 bg-slate-900/20 rounded-2xl border border-slate-900/50 animate-in fade-in slide-in-from-left-4"
    >
      <div class="flex gap-1">
        <span class="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
        <span class="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-75" />
        <span class="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-150" />
      </div>
      <span class="font-black uppercase tracking-[0.2em]">{{ typing }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  messages: any[]
  room: any
  messagesLoading: boolean
  loadingMore: boolean
  hasMore: boolean
  typing: string | null
  formatTime: (t: string) => string
  formatDate: (t: string) => string
  shouldShowSeparator: (m: any, i: number) => boolean
  isSystem: (m: any) => boolean
  getStyle: (m: any) => string
  getLabel: (m: any) => string
  highlight: (t: string) => string
}>()

defineEmits(['load-more'])

const container = ref<HTMLElement | null>(null)
defineExpose({ container })
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar { width: 4px; }
.scrollbar-thin::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
</style>
