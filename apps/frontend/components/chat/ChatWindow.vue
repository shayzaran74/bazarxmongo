<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import { useChat } from '@/composables/useChat';
import { useAuthStore } from '@/stores/auth';
import { useChatStore } from '@/stores/chat';
import MessageBubble from './MessageBubble.vue';
import type { ChatMessage } from '@barterborsa/shared-types'

const chatStore = useChatStore();

const props = defineProps<{
  tradeOfferId: string;
}>();

const { messages, isConnected, typingText, sendMessage, retryMessage, onTyping, markAsRead, init } = useChat(props.tradeOfferId);

const newMessage = ref('');
const scrollContainer = ref<HTMLElement | null>(null);
const bottomSentinel = ref<HTMLElement | null>(null);

/**
 * Otomatik Okundu İşaretleme (IntersectionObserver)
 */
let observer: IntersectionObserver | null = null;
onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      markAsRead();
    }
  }, { threshold: 0.5 }); // %50 görünürse

  if (bottomSentinel.value) {
    observer.observe(bottomSentinel.value);
  }
});

/**
 * Tarih Ayracı Mantığı
 */
const shouldShowDateSeparator = (msg: ChatMessage, index: number) => {
  if (index === 0) return true;
  const prevMsg = (messages.value as ChatMessage[])[index - 1];
  const currentDate = new Date(msg.createdAt).toDateString();
  const prevDate = new Date(prevMsg.createdAt).toDateString();
  return currentDate !== prevDate;
};

const formatDateLabel = (isoDate: string) => {
  const date = new Date(isoDate);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) return 'Bugün';

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Dün';

  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
};

// Akıllı Scroll Yönetimi
const scrollToBottom = (force = false) => {
  if (!scrollContainer.value) return;

  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value;
  const isAtBottom = scrollHeight - scrollTop - clientHeight < 150; // 150px tolerans (klavye için biraz daha geniş)

  if (isAtBottom || force) {
    nextTick(() => {
      scrollContainer.value?.scrollTo({
        top: scrollContainer.value.scrollHeight,
        behavior: 'smooth'
      });
    });
  }
};

// Mesaj listesi değiştikçe kaydır
watch(messages, () => scrollToBottom(), { deep: true });

const handleSend = () => {
  if (!newMessage.value.trim()) return;
  sendMessage(newMessage.value);
  newMessage.value = '';
  scrollToBottom(true); // Gönderince zorla kaydır
};

// Klavye Optimizasyonu
const handleInputFocus = () => {
  setTimeout(() => scrollToBottom(true), 150);
};

const handleAttachment = () => {
  alert('Dosya yükleme yakında eklenecek!');
};

const handleEmoji = () => {
  newMessage.value += '😊';
};

const isLoading = ref(true);

onMounted(async () => {
  const authStore = useAuthStore();
  if (authStore.isAuthenticated) {
    chatStore.connect();
  }
  try {
    await init();
    scrollToBottom(true);
    markAsRead();
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="flex flex-col h-[600px] bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
    <!-- Header ... remains same ... -->
    <div class="p-4 border-b bg-gray-50 flex justify-between items-center shrink-0">
      <div>
        <h3 class="font-bold text-gray-800">
          Takas Sohbeti
        </h3>
        <p class="text-xs text-gray-500 flex items-center gap-2">
          <span class="flex items-center gap-1">
            <span :class="isConnected ? 'text-green-500' : 'text-red-500'">●</span>
            {{ isConnected ? 'Sunucu Bağlantısı Aktif' : (isLoading ? 'Bağlanıyor...' : 'Bağlantı Kesildi') }}
          </span>
          <span
            v-if="isConnected && chatStore.roomOnlineCount > 1"
            class="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[9px] font-black uppercase tracking-tighter animate-pulse"
          >
            KARŞI TARAF SOHBETTE
          </span>
        </p>
      </div>

      <div
        v-if="typingText"
        class="text-xs italic text-primary-600 animate-pulse"
      >
        {{ typingText }}
      </div>
    </div>

    <!-- Mesaj Listesi -->
    <div
      ref="scrollContainer"
      class="flex-1 p-4 overflow-y-auto bg-gray-50/30 space-y-1 scrollbar-thin scrollbar-thumb-gray-200"
    >
      <div
        v-if="isLoading"
        class="flex h-full flex-col items-center justify-center space-y-4"
      >
        <div class="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p class="text-xs font-black text-gray-400 uppercase tracking-widest">
          Sohbet Yükleniyor...
        </p>
      </div>

      <div
        v-else-if="messages.length === 0"
        class="flex h-full items-center justify-center text-gray-400 text-sm italic"
      >
        Henüz mesaj yok. İlk mesajı siz gönderin!
      </div>

      <div
        v-for="(msg, index) in messages"
        :key="msg.tempId || msg.id"
      >
        <!-- Tarih Ayracı -->
        <div
          v-if="shouldShowDateSeparator(msg,index)"
          class="flex justify-center my-4"
        >
          <span
            class="bg-gray-200 text-gray-600 text-[10px] px-2.5 py-0.5 rounded-full font-medium uppercase tracking-wider"
          >
            {{ formatDateLabel(msg.createdAt) }}
          </span>
        </div>

        <MessageBubble
          :message="msg"
          @retry="retryMessage"
        />
      </div>

      <!-- Auto Mark as Read Sentinel -->
      <div
        ref="bottomSentinel"
        class="h-1 w-full"
      />
    </div>

    <!-- Input Alanı -->
    <div class="p-4 border-t bg-white shrink-0">
      <form
        class="flex items-center gap-2"
        @submit.prevent="handleSend"
      >
        <!-- Attachment Button -->
        <button
          type="button"
          title="Dosya Ekle"
          class="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
          @click="handleAttachment"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        </button>

        <!-- Emoji Button -->
        <button
          type="button"
          title="Emoji Ekle"
          class="p-2 text-gray-500 hover:text-yellow-500 hover:bg-gray-100 rounded-full transition-colors"
          @click="handleEmoji"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>

        <input
          v-model="newMessage"
          type="text"
          placeholder="Mesajınızı yazın..."
          class="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          @input="onTyping"
          @focus="handleInputFocus"
        >

        <button
          type="submit"
          :disabled="!newMessage.trim()"
          class="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white p-2.5 rounded-full w-10 h-10 flex items-center justify-center transition-colors shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 rotate-90"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
            />
          </svg>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
</style>
