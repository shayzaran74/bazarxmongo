import { defineStore } from 'pinia';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './auth';
import { useAdminChatService } from '~/services/api/AdminChatService';
import type { AdminMessage, AdminChatRoom, AdminAuditLog } from '@barterborsa/shared-types';

export const useAdminChatStore = defineStore('adminChat', {
    state: () => ({
        rooms: [] as AdminChatRoom[],
        messages: [] as AdminMessage[],
        activeRoomId: null as string | null,
        isConnected: false,
        socket: null as Socket | null,
        loading: false,
        isFrozen: false,
        searchQuery: '',
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        auditLogs: [] as AdminAuditLog[],
        auditLogsLoading: false,
        auditLogsPagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
        typingUsers: {} as Record<string, { username: string; expires: number }>,
        filterRisky: false,
        sortByRisk: false,
        roomsLoading: false,
        messagesLoading: false,
    }),

    getters: {
        activeRoom: (state) => state.rooms.find(r => r.id === state.activeRoomId),
        filteredRooms: (state) => {
            let result = [...state.rooms];
            if (state.filterRisky) {
                result = result.filter(r => r.hasRiskyContent);
            }
            if (state.sortByRisk) {
                result.sort((a, b) => (b.hasRiskyContent ? 1 : 0) - (a.hasRiskyContent ? 1 : 0));
            }
            return result;
        }
    },

    actions: {
        async connectSocket() {
            if (this.socket) return;

            const config = useRuntimeConfig();
            const authStore = useAuthStore();

            this.socket = io(config.public.apiBase as string, {
                auth: { token: authStore.token },
                path: '/socket.io/admin',
                transports: ['websocket', 'polling']
            });

            this.socket.on('connect', () => {
                this.isConnected = true;
                console.log('[AdminChatStore] Connected to Namespace Admin');
            });

            this.socket.on('disconnect', () => {
                this.isConnected = false;
                console.log('[AdminChatStore] Disconnected from Namespace Admin');
            });

            this.socket.on('newMessage', (message: AdminMessage) => {
                if (this.activeRoomId === message.chatRoomId) {
                    this.messages.push(message);
                }
                const roomIndex = this.rooms.findIndex(r => r.id === message.chatRoomId);
                if (roomIndex !== -1) {
                    const room = this.rooms[roomIndex];
                    room.lastMessage = message;
                    room.updatedAt = message.createdAt;
                    this.rooms.splice(roomIndex, 1);
                    this.rooms.unshift(room);
                }
            });

            this.socket.on('userTyping', ({ userId, username, isTyping, tradeOfferId }: { userId: string; username: string; isTyping: boolean; tradeOfferId?: string }) => {
                if (tradeOfferId && this.activeRoom && this.activeRoom.tradeOfferId === tradeOfferId) {
                    if (isTyping) {
                        this.typingUsers[userId] = { username, expires: Date.now() + 5000 };
                    } else {
                        delete this.typingUsers[userId];
                    }
                }
            });

            this.socket.on('roomUpdated', ({ roomId, lastMessage, updatedAt, hasRiskyContent }: { roomId: string; lastMessage: AdminMessage; updatedAt: string; hasRiskyContent: boolean }) => {
                const roomIndex = this.rooms.findIndex(r => r.id === roomId);
                if (roomIndex !== -1) {
                    const room = this.rooms[roomIndex];
                    room.lastMessage = lastMessage;
                    room.updatedAt = updatedAt;
                    if (room.messageCount) {
                        room.messageCount++;
                    } else {
                        room.messageCount = 1;
                    }
                    room.isHot = true;
                    if (hasRiskyContent) {
                        room.hasRiskyContent = true;
                    }
                    this.rooms.splice(roomIndex, 1);
                    this.rooms.unshift(room);
                }
            });

            this.socket.on('chatFrozen', ({ roomId, status }: { roomId: string; status: string }) => {
                if (this.activeRoomId === roomId) {
                    this.isFrozen = true;
                }
                const room = this.rooms.find(r => r.id === roomId);
                if (room && room.tradeOffer) room.tradeOffer.status = (status || 'disputed') as any;
            });

            this.socket.on('chatUnfrozen', ({ roomId, status }: { roomId: string; status: string }) => {
                if (this.activeRoomId === roomId) {
                    this.isFrozen = false;
                }
                const room = this.rooms.find(r => r.id === roomId);
                if (room && room.tradeOffer) room.tradeOffer.status = (status || 'pending') as any;
            });
        },

        async fetchRooms(page = 1) {
            const adminChatService = useAdminChatService();
            this.roomsLoading = true;
            try {
                const params = {
                    page,
                    limit: this.pagination.limit,
                    search: this.searchQuery
                };
                const response = await adminChatService.getRooms(params);

                if (response.success && response.data) {
                    // @ts-ignore
                    this.rooms = response.data.rooms || [];
                    // @ts-ignore
                    if (response.data.pagination) {
                        // @ts-ignore
                        this.pagination = response.data.pagination;
                    }
                }
            } catch (err) {
                console.error('[AdminChatStore] fetchRooms error:', err);
            } finally {
                this.roomsLoading = false;
            }
        },

        async fetchMessages(roomId: string, page = 1, append = false) {
            const adminChatService = useAdminChatService();
            this.activeRoomId = roomId;
            this.messagesLoading = true;
            if (!append) {
                this.messages = [];
                this.isFrozen = false;
            }
            try {
                const response = await adminChatService.getMessages(roomId, page, 50);
                if (response.success && response.data) {
                    // @ts-ignore
                    const newMessages = response.data.messages || [];
                    this.messages = append ? [...newMessages, ...this.messages] : newMessages;
                    
                    const room = this.rooms.find(r => r.id === roomId);
                    if (room) {
                        room.messageCount = 0;
                        room.isHot = false;
                    }
                }
            } catch (err) {
                console.error('[AdminChatStore] fetchMessages error:', err);
            } finally {
                this.messagesLoading = false;
            }
        },

        async fetchAuditLogs(page = 1) {
            const adminChatService = useAdminChatService();
            this.auditLogsLoading = true;
            try {
                const response = await adminChatService.getAuditLogs(page, 50);
                if (response.success && response.data) {
                    // @ts-ignore
                    this.auditLogs = response.data.logs || [];
                    // @ts-ignore
                    if (response.data.pagination) {
                        // @ts-ignore
                        this.auditLogsPagination = response.data.pagination;
                    }
                }
            } finally {
                this.auditLogsLoading = false;
            }
        },

        async joinGhostRoom(room: AdminChatRoom) {
            this.activeRoomId = room.id;
            if (this.socket) this.socket.emit('joinGhost', { roomId: room.id });
            await this.fetchMessages(room.id);
        },

        async leaveGhostRoom() {
            if (this.socket && this.activeRoomId) {
                this.socket.emit('leaveGhost', { roomId: this.activeRoomId });
            }
            this.activeRoomId = null;
            this.messages = [];
        },

        async disconnectSocket() {
            if (this.socket) {
                this.socket.disconnect();
                this.socket = null;
                this.isConnected = false;
            }
        },

        async sendSystemMessage(content: string, type: string) {
            if (this.socket && this.activeRoomId) {
                this.socket.emit('systemMessage', { roomId: this.activeRoomId, content, type });
            }
        },

        async sendWarning(roomId: string, reason: string, note: string) {
            if (this.socket) {
                this.socket.emit('sendWarning', { roomId, reason, note });
            }
        },

        async freezeRoom(roomId: string, reason: string, note: string) {
            if (this.socket) {
                this.socket.emit('freezeRoom', { roomId, reason, note });
            }
        },

        async loadMoreMessages() {
            if (!this.activeRoomId) return 0;
            const nextPage = Math.floor(this.messages.length / 50) + 1;
            const oldLength = this.messages.length;
            await this.fetchMessages(this.activeRoomId, nextPage, true);
            return this.messages.length - oldLength;
        },

        async unfreezeRoom(roomId: string, note: string) {
            if (this.socket) {
                this.socket.emit('unfreezeRoom', { roomId, note });
            }
        }
    }
});
