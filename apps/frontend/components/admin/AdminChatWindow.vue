<template>
  <div class="flex flex-col h-full bg-slate-950 rounded-[2.5rem] shadow-2xl border border-slate-900 overflow-hidden relative font-sans italic">
    <!-- ── MODERASYON MODAL ── -->
    <AdminChatModerationModal
      v-model="actionData"
      :is-open="showActionModal"
      :type="actionType"
      :is-valid="isActionValid"
      @close="showActionModal = false"
      @submit="submitAction"
    />

    <!-- ── HEADER ── -->
    <AdminChatHeader
      :room="room"
      :is-connected="isConnected"
      :is-frozen="isFrozen"
      @close="emit('close')"
    />

    <!-- ── MESAJ LİSTESİ (Read-Only) ── -->
    <AdminChatMessageList
      ref="messageListRef"
      :messages="messages"
      :room="room"
      :messages-loading="messagesLoading"
      :loading-more="loadingMore"
      :has-more="hasMoreMessages"
      :typing="typingIndicator"
      :format-time="formatTime"
      :format-date="formatDateLabel"
      :should-show-separator="shouldShowDateSeparator"
      :is-system="isSystemMessage"
      :get-style="getMessageStyle"
      :get-label="getSenderLabel"
      :highlight="highlightRisky"
      @load-more="loadMore"
    />

    <!-- ── MODERASYON TOOLBAR ── -->
    <AdminChatToolbar
      :is-frozen="isFrozen"
      @action="openAction"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AdminChatHeader from './chat/AdminChatHeader.vue'
import AdminChatMessageList from './chat/AdminChatMessageList.vue'
import AdminChatModerationModal from './chat/AdminChatModerationModal.vue'
import AdminChatToolbar from './chat/AdminChatToolbar.vue'

const props = defineProps({
  room: { type: Object, required: true },
  messages: { type: Array, required: true },
  isConnected: { type: Boolean, default: false },
  isFrozen: { type: Boolean, default: false },
  messagesLoading: { type: Boolean, default: false }
})

const emit = defineEmits(['freeze', 'unfreeze', 'warning', 'system-message', 'close'])

const {
  scrollContainer, showActionModal, actionType, actionData, loadingMore, hasMoreMessages,
  typingIndicator, shouldShowDateSeparator, formatDateLabel, formatTime,
  isSystemMessage, getMessageStyle, getSenderLabel, highlightRisky,
  openAction, submitAction, isActionValid, loadMore
} = useAdminChatWindow(props, emit)

const messageListRef = ref<any>(null)

// Proxy the container ref for the composable
watchEffect(() => {
  if (messageListRef.value?.container) {
    scrollContainer.value = messageListRef.value.container
  }
})
</script>

<style scoped>
/* Scoped styles are now in sub-components */
</style>
