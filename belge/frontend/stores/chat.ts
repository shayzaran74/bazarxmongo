import { defineStore } from 'pinia';
import { io, Socket } from 'socket.io-client';
import { useChatService } from '~/services/api/ChatService';
import type { ChatMessage as Message, MessageStatus } from '@barterborsa/shared-types';

export type { Message, MessageStatus };

export interface AiMessage extends Message {
    role: 'user' | 'assistant' | 'system';
}

export const useChatStore = defineStore('chat', {
    state: () => ({
        socket: null as Socket | null,
        messages: [] as Message[],
        isConnected: false,
        activeRoomId: null as string | null,
        roomOnlineCount: 0,
        typingUsers: new Map<string, string>(), // userId -> username

        // AI Assistant States
        isOpen: false,
        isLoading: false,
        aiMessages: [] as AiMessage[], // Separate AI messages
    }),

    getters: {
        isSocketConnected: (state) => state.isConnected,
        roomMessages: (state) => state.messages,
        typingList: (state) => Array.from(state.typingUsers.values()),
        typingText: (state) => {
            const users = Array.from(state.typingUsers.values());
            if (users.length === 0) return '';
            if (users.length === 1) return `${users[0]} yazıyor...`;
            if (users.length === 2) return `${users[0]} ve ${users[1]} yazıyor...`;
            return 'Birkaç kişi yazıyor...';
        }
    },

    actions: {
        /**
         * Socket.io bağlantısını başlatır
         */
        connect() {
            if (this.socket) return;

            const config = useRuntimeConfig();
            const socketUrl = `${config.public.apiBase}/chat`;

            const authStore = useAuthStore();
            this.socket = io(socketUrl, {
                withCredentials: true,
                transports: ['polling', 'websocket'],
                auth: {
                    token: authStore.token || useCookie('token').value
                }
            });

            this.socket.on('connect', () => {
                this.isConnected = true;
                console.log('[ChatStore] Connected to /chat namespace');
            });

            this.socket.on('disconnect', () => {
                this.isConnected = false;
                console.log('[ChatStore] Disconnected from /chat namespace');
            });

            // Yeni mesaj geldiğinde
            this.socket.on('newMessage', (message: Message) => {
                const authStore = useAuthStore();
                this.addMessage({
                    ...message,
                    isFromMe: message.senderId === authStore.user?.id
                });
            });

            // Yazıyor... bilgisi geldiğinde
            this.socket.on('userTyping', ({ userId, username, isTyping }: { userId: string; username: string; isTyping: boolean }) => {
                if (isTyping) {
                    this.typingUsers.set(userId, username);
                } else {
                    this.typingUsers.delete(userId);
                }
            });

            // Kullanıcı katıldığında
            this.socket.on('userJoined', ({ userId }: { userId: string }) => {
                console.log(`[ChatStore] User joined: ${userId}`);
                this.roomOnlineCount++;
            });

            // Kullanıcı ayrıldığında
            this.socket.on('userLeft', ({ userId }: { userId: string }) => {
                console.log(`[ChatStore] User left: ${userId}`);
                this.roomOnlineCount = Math.max(1, this.roomOnlineCount - 1);
            });

            // Mesajlar okunduğunda
            this.socket.on('messagesRead', ({ messageIds, readAt }: { messageIds: string[], readAt: string }) => {
                this.messages.forEach(m => {
                    if (messageIds.length === 0 || messageIds.includes(m.id)) {
                        m.readAt = readAt;
                    }
                });
            });
        },

        /**
         * Bağlantıyı keser
         */
        disconnect() {
            if (this.socket) {
                this.socket.disconnect();
                this.socket = null;
                this.isConnected = false;
                this.messages = [];
                this.activeRoomId = null;
            }
        },

        /**
         * Odaya katılır ve geçmişi yükler
         */
        async joinRoom(tradeOfferId: string) {
            if (!this.socket) {
                this.connect();
            }

            // Wait for connection if not connected
            if (!this.socket?.connected) {
                await new Promise((resolve) => {
                    this.socket?.once('connect', () => resolve(true));
                    // Timeout after 5s
                    setTimeout(() => resolve(false), 5000);
                });
            }

            this.activeRoomId = tradeOfferId;
            this.messages = [];

            return new Promise((resolve, reject) => {
                this.socket?.emit('joinTradeRoom', { tradeOfferId }, (response: { status: string; data?: Message[]; message?: string }) => {
                    if (response.status === 'ok') {
                        const authStore = useAuthStore();
                        if (response.data) {
                            this.messages = response.data.map((msg: Message) => ({
                                ...msg,
                                isFromMe: msg.senderId === authStore.user?.id
                            }));
                        } else {
                            console.log('[ChatStore] Already in room or no history received');
                        }
                        resolve(response.data || []);
                    } else {
                        console.error('[ChatStore] joinTradeRoom error:', response.message);
                        reject(response.message);
                    }
                });
            });
        },

        /**
         * Mesaj listesine ekler (Optimistic UI desteğiyle)
         */
        addMessage(message: Message) {
            // Eğer tempId ile gelen bir mesaj zaten varsa (benim gönderdiğim), onu güncelle
            if (message.tempId) {
                const index = this.messages.findIndex(m => m.tempId === message.tempId);
                if (index !== -1) {
                    this.messages[index] = { ...this.messages[index], ...message, status: 'sent' };
                    return;
                }
            }
            this.messages.push(message);
        },

        /**
         * Mesaj durumunu günceller (Hata durumları için)
         */
        updateMessageStatus(tempId: string, status: 'sent' | 'error' | 'warning', errorMsg?: string) {
            const index = this.messages.findIndex(m => m.tempId === tempId);
            if (index !== -1) {
                this.messages[index].status = status;
                if (errorMsg) this.messages[index].content += `\n[Hata: ${errorMsg}]`;
            }
        },

        /**
         * Başarısız olan mesajı tekrar gönder
         */
        resendMessage(tempId: string, tradeOfferId: string) {
            const message = this.messages.find(m => m.tempId === tempId);
            if (!message) return;

            message.status = 'pending';
            this.socket?.emit('sendMessage',
                { tradeOfferId, content: message.content, tempId },
                (response: { status: string; message?: string }) => {
                    if (response.status === 'ok') {
                        this.updateMessageStatus(tempId, 'sent');
                    } else {
                        this.updateMessageStatus(tempId, response.status === 'warning' ? 'warning' : 'error', response.message);
                    }
                }
            );
        },

        /**
         * AI Asistanı kontrolleri
         */
        toggleChat() {
            this.isOpen = !this.isOpen;
        },

        async sendMessage(content: string) {
            this.isLoading = true;
            this.aiMessages.push({
                id: Date.now().toString(),
                chatRoomId: 'ai',
                senderId: 'user',
                content,
                type: 'text',
                createdAt: new Date().toISOString(),
                role: 'user'
            });

            try {
                const chatService = useChatService();
                const response = await chatService.sendAiMessage(content);

                if (response.success && response.data) {
                    this.aiMessages.push({
                        id: Date.now().toString() + '-ai',
                        chatRoomId: 'ai',
                        senderId: 'ai',
                        content: response.data.reply,
                        type: 'text',
                        createdAt: new Date().toISOString(),
                        role: 'assistant'
                    });
                }
            } catch (err) {
                console.error('AI Chat Error:', err);
            } finally {
                this.isLoading = false;
            }
        }
    }
});
