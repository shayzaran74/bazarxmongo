import { ref, onUnmounted, computed } from 'vue';
import { useChatStore, type Message } from '@/stores/chat';
import { useAuthStore } from '@/stores/auth';
import debounce from 'lodash-es/debounce';

export function useChat(tradeOfferId: string) {
    const chatStore = useChatStore();
    const authStore = useAuthStore();
    const currentUserId = authStore.user?.id; // Varsayılan auth composable'ınıza göre güncelleyin

    const isTyping = ref(false);

    // Yazıyor... durumunu sunucuya bildir (Debounced)
    const emitStopTyping = debounce(() => {
        chatStore.socket?.emit('typing', { tradeOfferId, isTyping: false });
        isTyping.value = false;
    }, 2000);

    const onTyping = () => {
        if (!isTyping.value) {
            chatStore.socket?.emit('typing', { tradeOfferId, isTyping: true });
            isTyping.value = true;
        }
        emitStopTyping();
    };

    /**
     * Mesaj gönder (Optimistic UI)
     */
    const sendMessage = async (content: string) => {
        if (!content.trim()) return;

        const tempId = typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

        // 1. Mağazaya hemen ekle (Optimistic)
        const optimisticMessage: Message = {
            id: tempId, // Kalıcı ID gelene kadar tempId kullan
            tempId,
            chatRoomId: '', // Henüz bilmiyoruz
            senderId: currentUserId || '',
            content,
            type: 'TEXT',
            createdAt: new Date().toISOString(),
            status: 'pending',
            isFromMe: true
        };

        chatStore.addMessage(optimisticMessage);

        // 2. Sunucuya gönder
        chatStore.socket?.emit('sendMessage',
            { tradeOfferId, content, tempId },
            (response: { status: string; message?: string }) => {
                if (response.status === 'ok') {
                    // Store zaten newMessage event'inden veya callback'ten güncellenebilir
                    // Biz burada status'ü 'sent' yapıyoruz
                    chatStore.updateMessageStatus(tempId, 'sent');
                } else if (response.status === 'warning') {
                    chatStore.updateMessageStatus(tempId, 'warning', response.message);
                } else {
                    chatStore.updateMessageStatus(tempId, 'error', response.message);
                }
            }
        );
    };

    /**
     * Odaya katılımı başlat
     */
    const init = async () => {
        try {
            await chatStore.joinRoom(tradeOfferId);
        } catch (err) {
            console.error('[useChat] Join room error:', err);
        }
    };

    /**
     * Okundu işaretle
     */
    const markAsRead = () => {
        chatStore.socket?.emit('markAsRead', { tradeOfferId });
    };

    /**
   * Mesajı tekrar gönder
   */
    const retryMessage = (tempId: string | undefined) => {
        if (!tempId) return;
        chatStore.resendMessage(tempId, tradeOfferId);
    };

    onUnmounted(() => {
        // Sayfadan ayrılınca odayı terk et mesajı gönderilebilir
        chatStore.socket?.emit('leaveTradeRoom', { tradeOfferId });
    });

    return {
        messages: computed(() => chatStore.messages),
        isConnected: computed(() => chatStore.isConnected),
        typingList: computed(() => chatStore.typingList),
        typingText: computed(() => chatStore.typingText),
        sendMessage,
        retryMessage,
        onTyping,
        markAsRead,
        init
    };
}
