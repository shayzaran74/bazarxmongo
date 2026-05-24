import { defineStore } from 'pinia';
import { io, Socket } from 'socket.io-client';
import { useChatService } from '~/services/api/ChatService';
import type { ChatMessage as Message, MessageStatus } from '@barterborsa/shared-types';

export type { Message, MessageStatus };

export interface AiMessage extends Message {
    role: 'user' | 'assistant' | 'system';
}

let socket: Socket | null = null;

export const useChatStore = defineStore('chat', {
    state: () => ({
        messages: [] as Message[],
        isConnected: false,
        activeRoomId: null as string | null,
        roomOnlineCount: 0,
        typingUsers: {} as Record<string, string>, // userId -> username

        // AI Assistant States
        isOpen: false,
        isLoading: false,
        aiMessages: [] as AiMessage[], // Separate AI messages
    }),

    getters: {
        socket: () => socket,
        isSocketConnected: (state) => state.isConnected,
        roomMessages: (state) => state.messages,
        typingList: (state) => Object.values(state.typingUsers),
        typingText: (state) => {
            const users = Object.values(state.typingUsers);
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
            if (socket) return;

            const config = useRuntimeConfig();
            const authStore = useAuthStore();

            // Prod: socketUrl boş ise aynı origin (nginx /socket.io/ üzerinden gider)
            // Dev:  apiBase kullanılır (localhost:3001)
            const socketBase = (config.public.socketUrl as string) ||
                (process.client ? window.location.origin : config.public.apiBase as string);

            socket = io(socketBase, {
                path: '/socket.io/',           // ← Nginx'te bu path proxyleniyor
                withCredentials: true,
                transports: ['polling', 'websocket'],  // polling önce — bağlantı kurulur, sonra upgrade
                auth: {
                    token: authStore.token || useCookie('access_token').value
                },
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000,
            });

            socket.on('connect', () => {
                this.isConnected = true;
            });

            socket.on('disconnect', () => {
                this.isConnected = false;
            });

            // Yeni mesaj geldiğinde (backend message:new emit eder)
            socket.on('message:new', (message: Message) => {
                const authStore = useAuthStore();
                this.addMessage({
                    ...message,
                    isFromMe: message.senderId === authStore.user?.id
                });
            });

            // Yazıyor... bilgisi geldiğinde
            socket.on('userTyping', ({ userId, username, isTyping }: { userId: string; username: string; isTyping: boolean }) => {
                if (isTyping) {
                    this.typingUsers[userId] = username;
                } else {
                    delete this.typingUsers[userId];
                }
            });

            // Kullanıcı katıldığında
            socket.on('userJoined', ({ userId }: { userId: string }) => {
                this.roomOnlineCount++;
            });

            // Kullanıcı ayrıldığında
            socket.on('userLeft', ({ userId }: { userId: string }) => {
                this.roomOnlineCount = Math.max(1, this.roomOnlineCount - 1);
            });

            // Mesajlar okunduğunda
            socket.on('messagesRead', ({ messageIds, readAt }: { messageIds: string[], readAt: string }) => {
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
            if (socket) {
                socket.disconnect();
                socket = null;
                this.isConnected = false;
                this.messages = [];
                this.activeRoomId = null;
            }
        },

        /**
         * Odaya katılır ve geçmişi yükler
         */
        async joinRoom(tradeOfferId: string) {
            if (!socket) {
                this.connect();
            }

            // Wait for connection if not connected
            if (!socket?.connected) {
                await new Promise((resolve) => {
                    socket?.once('connect', () => resolve(true));
                    // Timeout after 5s
                    setTimeout(() => resolve(false), 5000);
                });
            }

            this.activeRoomId = tradeOfferId;
            this.messages = [];

            return new Promise((resolve, reject) => {
                socket?.emit('joinTradeRoom', { tradeOfferId }, (response: { success: boolean; chatRoomId?: string; data?: Message[]; message?: string }) => {
                    if (response.success && response.chatRoomId) {
                        const authStore = useAuthStore();
                        this.activeRoomId = response.chatRoomId;
                        if (response.data) {
                            this.messages = response.data.map((msg: Message) => ({
                                ...msg,
                                isFromMe: msg.senderId === authStore.user?.id
                            }));
                        } else {
                            this.messages = [];
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
        resendMessage(tempId: string, chatRoomId: string) {
            const message = this.messages.find(m => m.tempId === tempId);
            if (!message) return;

            message.status = 'pending';
            socket?.emit('message:send',
                { roomId: chatRoomId, content: message.content, tempId },
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
                        content: (response as any).data?.reply || (response as any).reply,
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
