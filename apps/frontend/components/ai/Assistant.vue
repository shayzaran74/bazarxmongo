<template>
  <div class="agentic-assistant">
    <!-- Trigger Button -->
    <button
      class="trigger-btn"
      :class="{ 'is-active': isOpen }"
      @click="isOpen = !isOpen"
    >
      <div class="shimmer" />
      <span v-if="!isOpen">AI Asistan</span>
      <span v-else>Kapat</span>
    </button>

    <!-- Chat Window -->
    <transition name="slide-up">
      <div
        v-if="isOpen"
        class="chat-window"
      >
        <div class="chat-header">
          <h3>TicariTakas 2026 AI</h3>
          <p>Neye ihtiyacınız olduğunu söyleyin, ben bulayım.</p>
        </div>

        <div
          ref="messageContainer"
          class="chat-messages"
        >
          <div
            v-for="(msg, idx) in messages"
            :key="idx"
            :class="['message', msg.role]"
          >
            <div class="bubble">
              {{ msg.text }}
            </div>
          </div>
          <div
            v-if="loading"
            class="message ai"
          >
            <div class="bubble loading-dots">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        </div>

        <div class="chat-input">
          <input
            v-model="query"
            placeholder="Örn: 2000 TL altı dayanıklı kaynak makinesi..."
            :disabled="loading"
            @keyup.enter="handleSearch"
          >
          <button
            :disabled="loading || !query.trim()"
            @click="handleSearch"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
            >
              <path
                fill="currentColor"
                d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
              />
            </svg>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick, useRuntimeConfig, navigateTo } from '#imports'
const isOpen = ref(false)
const query = ref('')
const loading = ref(false)
const messages = ref([
  { role: 'ai', text: 'Merhaba! TicariTakas AI asistanına hoş geldiniz. Size nasıl yardımcı olabilirim?' }
])

const messageContainer = ref(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })
}

const handleSearch = async () => {
  if (!query.value.trim() || loading.value) return

  const userText = query.value
  messages.value.push({ role: 'user', text: userText })
  query.value = ''
  loading.value = true
  scrollToBottom()

  try {
    const data = await $fetch('/api/products/natural-search', {
      params: { q: userText },
      baseURL: useRuntimeConfig().public.apiBase
    })

    if (data?.success) {
      const count = data.total
      if (count > 0) {
        messages.value.push({
          role: 'ai',
          text: `Harika! Aradığınız kriterlere uygun ${count} ürün buldum. Sonuçlar listeleniyor.`
        })
        // Redirect or update product list event here
        navigateTo(`/products?search=${encodeURIComponent(userText)}&ai=true`)
      } else {
        messages.value.push({ role: 'ai', text: 'Maalesef tam olarak bu kriterlere uygun ürün bulamadım, ama aramaya devam edebiliriz.' })
      }
    }
  } catch (err) {
    messages.value.push({ role: 'ai', text: 'Üzgünüm, şu an isteğinizi işleyemiyorum. Lütfen tekrar deneyin.' })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}
</script>

<style scoped>
.agentic-assistant {
  position: fixed;
  bottom: 6.5rem;
  right: 2rem;
  z-index: 9999;
  font-family: 'Inter', sans-serif;
}

.trigger-btn {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 99px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.3);
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.trigger-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(139, 92, 246, 0.4);
}

.shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% {
    left: 100%;
  }
}

.chat-window {
  position: absolute;
  bottom: 4.5rem;
  right: 0;
  width: 350px;
  height: 500px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(139, 92, 246, 0.1);
}

.chat-header {
  padding: 1.5rem;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  border-radius: 1.5rem 1.5rem 0 0;
}

.chat-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.chat-header p {
  margin: 0.2rem 0 0;
  font-size: 0.8rem;
  opacity: 0.9;
}

.chat-messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.bubble {
  max-width: 80%;
  padding: 0.8rem 1rem;
  border-radius: 1rem;
  font-size: 0.9rem;
  line-height: 1.4;
}

.user .bubble {
  background: #f3f4f6;
  color: #1f2937;
  border-bottom-right-radius: 0.2rem;
}

.ai .bubble {
  background: #6366f1;
  color: white;
  border-bottom-left-radius: 0.2rem;
}

.chat-input {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 0.5rem;
}

.chat-input input {
  flex: 1;
  border: 1px solid #e5e7eb;
  padding: 0.6rem 1rem;
  border-radius: 0.8rem;
  outline: none;
}

.chat-input button {
  background: #6366f1;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 0.8rem;
  cursor: pointer;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>
