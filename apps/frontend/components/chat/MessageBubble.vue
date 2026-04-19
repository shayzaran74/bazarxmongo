<script setup lang="ts">
import type { ChatMessage as Message } from '@barterborsa/shared-types'

defineProps<{
  message: Message;
}>();

defineEmits<{
  (e: 'retry', tempId: string | undefined): void;
}>();

const formatTime = (isoString: string) => {
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>

<template>
  <div
    class="flex w-full mb-4"
    :class="message.isFromMe ? 'justify-end' : 'justify-start'"
  >
    <div
      class="max-w-[75%] px-4 py-2 rounded-2xl shadow-sm relative"
      :class="[
        message.isFromMe
          ? 'bg-primary-600 text-white rounded-tr-none'
          : 'bg-gray-100 text-gray-800 rounded-tl-none',
        message.status === 'warning' ? 'border-2 border-yellow-400' : '',
        message.status === 'error' ? 'border-2 border-red-500' : ''
      ]"
    >
      <!-- İçerik -->
      <p class="text-sm md:text-base break-words">
        {{ message.content }}
      </p>

      <!-- Alt Bilgi (Zaman + Durum) -->
      <div
        class="flex items-center gap-1 mt-1 text-[10px]"
        :class="message.isFromMe ? 'text-blue-100 justify-end' : 'text-gray-400'"
      >
        <span>{{ formatTime(message.createdAt) }}</span>

        <template v-if="message.isFromMe">
          <!-- Pending: Saat İkonu -->
          <span
            v-if="message.status === 'pending'"
            class="animate-pulse"
            title="Gönderiliyor..."
          >🕒</span>

          <!-- Sent: Tek Tik (Gri) -->
          <span
            v-else-if="message.status === 'sent' && !message.readAt"
            class="opacity-70"
            title="Gönderildi"
          >✓</span>

          <!-- Delivered: Çift Tik (Gri) - Opsiyonel, şu an readAt yoksa sent sayıyoruz -->
          <span
            v-else-if="message.status === 'delivered' && !message.readAt"
            class="opacity-70"
            title="İletildi"
          >✓✓</span>

          <!-- Read: Çift Tik (Mavi/Beyaz) -->
          <span
            v-else-if="message.readAt || message.status === 'read'"
            class="text-blue-200 font-bold"
            title="Okundu"
          >✓✓</span>

          <!-- Error/Warning -->
          <button
            v-else-if="message.status === 'error'"
            class="flex items-center gap-0.5 hover:scale-110 active:scale-95 transition-transform cursor-pointer group relative"
            @click="$emit('retry', message.tempId)"
          >
            <span
              class="text-red-300"
              title="Hata!"
            >⚠️</span>
            <span
              class="hidden group-hover:inline absolute -top-8 right-0 bg-red-600 text-[10px] text-white px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap"
            >Tekrar
              Dene</span>
          </button>

          <button
            v-else-if="message.status === 'moderated' || message.status === 'warning'"
            class="flex items-center gap-0.5 hover:scale-110 active:scale-95 transition-transform cursor-pointer group relative"
            @click="$emit('retry', message.tempId)"
          >
            <span
              class="text-orange-300"
              title="Moderasyon"
            >⚡</span>
            <span
              class="hidden group-hover:inline absolute -top-8 right-0 bg-orange-600 text-[10px] text-white px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap"
            >Modere
              Edildi</span>
          </button>
        </template>
      </div>

      <!-- Moderasyon Detayı (Tooltip gibi) -->
      <div
        v-if="message.status === 'moderated' || message.status === 'warning'"
        class="mt-1 text-[9px] font-bold text-orange-100 italic border-t border-white/20 pt-1"
      >
        Bu mesaj topluluk kuralları nedeniyle sınırlandırıldı.
      </div>
    </div>
  </div>
</template>
