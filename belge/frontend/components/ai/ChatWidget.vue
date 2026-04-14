<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
    <!-- Chat Window -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-4 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-4 opacity-0"
    >
      <div
        v-if="chatStore.isOpen"
        class="mb-4 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden backdrop-blur-lg bg-opacity-95"
      >
        <!-- Header -->
        <div class="bg-primary p-4 flex items-center justify-between text-black">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span class="text-xl">🤖</span>
            </div>
            <div>
              <h3 class="font-bold text-sm">
                TicariTakas Asistanı
              </h3>
              <p class="text-xs text-black/70">
                Yapay Zeka Destekli
              </p>
            </div>
          </div>
          <button
            class="hover:bg-white/10 p-1 rounded-lg transition"
            @click="chatStore.toggleChat"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Messages -->
        <div
          ref="messageContainer"
          class="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
        >
          <div
            v-if="chatStore.aiMessages.length === 0"
            class="text-center py-8 px-4"
          >
            <div class="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">👋</span>
            </div>
            <p class="text-gray-500 text-sm">
              Merhaba! Size nasıl yardımcı olabilirim?
            </p>
            <div class="mt-4 flex flex-wrap gap-2 justify-center">
              <button
                v-for="hint in quickHints"
                :key="hint"
                class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition"
                @click="chatStore.sendMessage(hint)"
              >
                {{ hint }}
              </button>
            </div>
          </div>

          <div
            v-for="(msg, index) in chatStore.aiMessages"
            :key="index"
            :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']"
          >
            <div
              :class="[
                'max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-sm',
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-tr-none'
                  : 'bg-gray-100 text-gray-800 rounded-tl-none'
              ]"
            >
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div v-html="formatMessage(msg.content)" />
            </div>
          </div>

          <div
            v-if="chatStore.isLoading"
            class="flex justify-start"
          >
            <div class="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-1">
              <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
              <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="p-4 border-t border-gray-100 bg-gray-50/50">
          <form
            class="relative group"
            @submit.prevent="handleSend"
          >
            <input
              v-model="userInput"
              type="text"
              placeholder="Mesajınızı yazın..."
              class="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white transition-all text-sm outline-none shadow-sm group-hover:shadow-md"
              :disabled="chatStore.isLoading"
            >
            <button
              type="submit"
              class="absolute right-2 top-1.5 p-1.5 bg-primary text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              :disabled="!userInput.trim() || chatStore.isLoading"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 rotate-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </transition>

    <!-- Toggle Button -->
    <button
      :class="[
        'w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 transform active:scale-95',
        chatStore.isOpen ? 'bg-red-500 hover:bg-red-600 rotate-90' : 'bg-primary hover:bg-primary-dark group'
      ]"
      @click="chatStore.toggleChat"
    >
      <svg
        v-if="!chatStore.isOpen"
        xmlns="http://www.w3.org/2000/svg"
        class="h-8 w-8 text-white group-hover:scale-110 transition"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        class="h-8 w-8 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>

      <!-- Unread Badge (Optional) -->
      <span
        v-if="!chatStore.isOpen && chatStore.messages.length > 0"
        class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white"
      >
        {{ chatStore.messages.length }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, onMounted, watch, useChatStore } from '#imports'

const chatStore = useChatStore()
const userInput = ref('')
const messageContainer = ref<HTMLElement | null>(null)

const quickHints = [
  'Kargo ne zaman gelir?',
  'İade şartları nedir?',
  'Siparişimi takip et',
  'İletişim bilgileri'
]

const handleSend = () => {
  if (!userInput.value.trim()) return
  chatStore.sendMessage(userInput.value)
  userInput.value = ''
}

const formatMessage = (text: string) => {
  if (!text) return ''
  // Simple markdown-like formatting
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
}

const scrollToBottom = async () => {
  await nextTick()
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  }
}

watch(() => chatStore.aiMessages.length, scrollToBottom)
watch(() => chatStore.isLoading, scrollToBottom)
watch(() => chatStore.isOpen, (newVal) => {
  if (newVal) scrollToBottom()
})

onMounted(() => {
  if (chatStore.isOpen) {
    scrollToBottom()
  }
})
</script>

<style scoped>
.scroll-smooth {
  scroll-behavior: smooth;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #E5E7EB;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #D1D5DB;
}
</style>
